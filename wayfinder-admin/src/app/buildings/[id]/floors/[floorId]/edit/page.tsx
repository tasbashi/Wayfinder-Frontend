"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Card } from "@/components/common/Card";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { FileUpload } from "@/components/common/FileUpload";
import { FloorService } from "@/api/floor.service";
import { FloorDto } from "@/types/floor.types";
import { ArrowLeft, Layers, FileImage, Info, Save, Trash2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Modal } from "@/components/common/Modal";

const updateFloorSchema = z.object({
  name: z.string().min(1, "Kat adı zorunludur").max(100, "Kat adı çok uzun"),
  floorNumber: z.coerce.number().int("Tam sayı olmalıdır"),
});

type UpdateFloorForm = z.infer<typeof updateFloorSchema>;

function EditFloorContent() {
  const params = useParams();
  const router = useRouter();
  const buildingId = params.id as string;
  const floorId = params.floorId as string;
  const [floor, setFloor] = useState<FloorDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [floorPlanUrl, setFloorPlanUrl] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm<UpdateFloorForm>({
    resolver: zodResolver(updateFloorSchema),
  });

  const floorName = watch("name");
  const floorNumber = watch("floorNumber");

  useEffect(() => {
    loadFloor();
  }, [floorId]);

  useEffect(() => {
    setHasUnsavedChanges(isDirty);
  }, [isDirty]);

  async function loadFloor() {
    try {
      setIsLoading(true);
      setError(null);
      const floorData = await FloorService.getById(floorId);
      setFloor(floorData);
      setFloorPlanUrl(floorData.floorPlanImageUrl || null);
      reset({
        name: floorData.name,
        floorNumber: floorData.floorNumber,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kat yüklenemedi");
    } finally {
      setIsLoading(false);
    }
  }

  const handleFileSelect = useCallback(async (file: File) => {
    if (!floor) return;

    try {
      setIsUploadingImage(true);
      const url = await FloorService.uploadFloorPlan(floorId, file);
      setFloorPlanUrl(url);
      setFloor(prev => prev ? { ...prev, floorPlanImageUrl: url } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kat planı yüklenemedi");
    } finally {
      setIsUploadingImage(false);
    }
  }, [floorId, floor]);

  const handleFileRemove = useCallback(async () => {
    if (!floor) return;

    try {
      setIsUploadingImage(true);
      await FloorService.deleteFloorPlan(floorId);
      setFloorPlanUrl(null);
      setFloor(prev => prev ? { ...prev, floorPlanImageUrl: undefined } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kat planı silinemedi");
    } finally {
      setIsUploadingImage(false);
    }
  }, [floorId, floor]);

  const onSubmit = async (data: UpdateFloorForm) => {
    if (!floor) return;

    setError(null);
    setIsSaving(true);
    try {
      await FloorService.update(floorId, {
        id: floorId,
        buildingId: buildingId,
        name: data.name,
        floorNumber: data.floorNumber,
        floorPlanImageUrl: floorPlanUrl || undefined,
      });
      setHasUnsavedChanges(false);
      router.push(`/buildings/${buildingId}/floors/${floorId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kat güncellenemedi");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSaving(true);
      await FloorService.delete(floorId);
      router.push(`/buildings/${buildingId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kat silinemedi");
      setShowDeleteModal(false);
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" text="Kat yükleniyor..." />
        </div>
      </Layout>
    );
  }

  if (!floor) {
    return (
      <Layout>
        <div className="p-6">
          <ErrorMessage message={error || "Kat bulunamadı"} />
          <Button
            onClick={() => router.push(`/buildings/${buildingId}`)}
            className="mt-4"
            variant="outline"
          >
            Binaya Geri Dön
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50/30">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href={`/buildings/${buildingId}/floors/${floorId}`}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kata Geri Dön</span>
            </Link>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg">
                  <Layers className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Kat Düzenle</h1>
                  <p className="text-gray-600 mt-1">
                    {floor.name} • Kat {floor.floorNumber >= 0 ? floor.floorNumber : `B${Math.abs(floor.floorNumber)}`}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="danger"
                onClick={() => setShowDeleteModal(true)}
                disabled={isSaving}
                className="hidden sm:flex"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Sil
              </Button>
            </div>
          </div>

          {error && (
            <ErrorMessage message={error} variant="inline" className="mb-6" />
          )}

          {/* Unsaved changes warning */}
          {hasUnsavedChanges && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                Kaydedilmemiş değişiklikler var. Sayfadan ayrılmadan önce kaydetmeyi unutmayın.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
              {/* Floor Plan Section */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileImage className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Kat Planı</h2>
                    <p className="text-sm text-gray-500">
                      Kat planı görselini yükleyin veya değiştirin
                    </p>
                  </div>
                </div>

                <FileUpload
                  value={floorPlanUrl}
                  onFileSelect={handleFileSelect}
                  onRemove={handleFileRemove}
                  placeholder="Yeni kat planı yüklemek için tıkla veya sürükle bırak"
                  disabled={isSaving || isUploadingImage}
                />
              </Card>

              {/* Floor Details Section */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Info className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Kat Bilgileri</h2>
                    <p className="text-sm text-gray-500">Temel bilgileri düzenleyin</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Kat Adı *"
                    placeholder="Örn: Zemin Kat, 1. Kat, Bodrum"
                    {...register("name")}
                    error={errors.name?.message}
                    disabled={isSaving}
                  />

                  <Input
                    label="Kat Numarası *"
                    type="number"
                    {...register("floorNumber")}
                    error={errors.floorNumber?.message}
                    disabled={isSaving}
                    helperText="0 = Zemin, (+) = Üst, (-) = Bodrum"
                  />
                </div>
              </Card>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSaving}
                  className="flex-1"
                >
                  İptal
                </Button>

                {/* Mobile delete button */}
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => setShowDeleteModal(true)}
                  disabled={isSaving}
                  className="flex-1 sm:hidden"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Katı Sil
                </Button>

                <Button
                  type="submit"
                  disabled={isSaving}
                  className="flex-[2] bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                >
                  {isSaving ? (
                    <span className="flex items-center justify-center gap-2">
                      <LoadingSpinner size="sm" />
                      Kaydediliyor...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Save className="w-4 h-4" />
                      Değişiklikleri Kaydet
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Katı Sil"
      >
        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Bu katı silmek istediğinizden emin misiniz?
              </h3>
              <p className="text-gray-600">
                <strong>{floor.name}</strong> katı ve bu kata ait tüm düğümler silinecektir.
                Bu işlem geri alınamaz.
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={isSaving}
            >
              Vazgeç
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={isSaving}
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Siliniyor...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Evet, Sil
                </span>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}

export default function EditFloorPage() {
  return (
    <ProtectedRoute requiredRole="Admin">
      <EditFloorContent />
    </ProtectedRoute>
  );
}
