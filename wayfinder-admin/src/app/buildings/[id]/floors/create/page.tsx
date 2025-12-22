"use client";

import { useState, useCallback } from "react";
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
import { useBuildingStore } from "@/store/buildingStore";
import { ArrowLeft, Layers, FileImage, Info, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const createFloorSchema = z.object({
  name: z.string().min(1, "Kat adı zorunludur").max(100, "Kat adı çok uzun"),
  floorNumber: z.coerce.number().int("Tam sayı olmalıdır"),
});

type CreateFloorForm = z.infer<typeof createFloorSchema>;

function CreateFloorContent() {
  const params = useParams();
  const router = useRouter();
  const buildingId = params.id as string;
  const { fetchBuildingById } = useBuildingStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdFloorId, setCreatedFloorId] = useState<string | null>(null);
  const [floorPlanUrl, setFloorPlanUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [step, setStep] = useState<"form" | "upload">("form");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreateFloorForm>({
    resolver: zodResolver(createFloorSchema),
    defaultValues: {
      floorNumber: 0,
    },
  });

  const floorName = watch("name");
  const floorNumber = watch("floorNumber");

  const onSubmit = async (data: CreateFloorForm) => {
    setError(null);
    setIsLoading(true);
    try {
      const floorId = await FloorService.create({
        buildingId,
        name: data.name,
        floorNumber: data.floorNumber,
      });
      setCreatedFloorId(floorId);

      // If there's a pending file, upload it
      if (pendingFile) {
        try {
          const url = await FloorService.uploadFloorPlan(floorId, pendingFile);
          setFloorPlanUrl(url);
        } catch (uploadErr) {
          console.error("Failed to upload floor plan:", uploadErr);
          // Don't fail the whole process, floor is created
        }
      }

      await fetchBuildingById(buildingId);
      router.push(`/buildings/${buildingId}/floors/${floorId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kat oluşturulamadı");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = useCallback(async (file: File) => {
    setPendingFile(file);
    // Create a preview URL
    const previewUrl = URL.createObjectURL(file);
    setFloorPlanUrl(previewUrl);
  }, []);

  const handleFileRemove = useCallback(async () => {
    if (floorPlanUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(floorPlanUrl);
    }
    setPendingFile(null);
    setFloorPlanUrl(null);
  }, [floorPlanUrl]);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href={`/buildings/${buildingId}`}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Binaya Geri Dön</span>
            </Link>

            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                <Layers className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Yeni Kat Ekle</h1>
                <p className="text-gray-600 mt-1">
                  Binaya yeni bir kat ekleyin ve kat planını yükleyin
                </p>
              </div>
            </div>
          </div>

          {error && (
            <ErrorMessage message={error} variant="inline" className="mb-6" />
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Floor Plan Upload */}
              <Card className="p-6 h-fit">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileImage className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Kat Planı</h2>
                    <p className="text-sm text-gray-500">İsteğe bağlı</p>
                  </div>
                </div>

                <FileUpload
                  value={floorPlanUrl}
                  onFileSelect={handleFileSelect}
                  onRemove={handleFileRemove}
                  placeholder="Kat planı yüklemek için tıkla veya sürükle bırak"
                  helperText="Kat planı yüklemeden de devam edebilirsiniz. Daha sonra düzenleme sayfasından yükleyebilirsiniz."
                  disabled={isLoading}
                />
              </Card>

              {/* Right Column - Floor Details */}
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <Info className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Kat Bilgileri</h2>
                      <p className="text-sm text-gray-500">Temel bilgileri girin</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <Input
                      label="Kat Adı *"
                      placeholder="Örn: Zemin Kat, 1. Kat, Bodrum"
                      {...register("name")}
                      error={errors.name?.message}
                      disabled={isLoading}
                      autoFocus
                    />

                    <Input
                      label="Kat Numarası *"
                      type="number"
                      placeholder="0"
                      {...register("floorNumber")}
                      error={errors.floorNumber?.message}
                      disabled={isLoading}
                      helperText="0 = Zemin Kat, Pozitif = Üst Katlar, Negatif = Bodrum Katları"
                    />
                  </div>
                </Card>

                {/* Summary Card */}
                <Card className="p-6 bg-gradient-to-br from-gray-50 to-gray-100/50 border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Özet</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Kat Adı:</span>
                      <span className="font-medium text-gray-900">
                        {floorName || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Kat Numarası:</span>
                      <span className="font-medium text-gray-900">
                        {floorNumber >= 0 ? `Kat ${floorNumber}` : `Bodrum ${Math.abs(floorNumber)}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Kat Planı:</span>
                      <span className={`font-medium ${pendingFile ? "text-green-600" : "text-gray-400"}`}>
                        {pendingFile ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            Yüklendi
                          </span>
                        ) : (
                          "Yüklenmedi"
                        )}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Actions */}
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-[2] bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <LoadingSpinner size="sm" />
                        Oluşturuluyor...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Layers className="w-4 h-4" />
                        Kat Oluştur
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default function CreateFloorPage() {
  return (
    <ProtectedRoute requiredRole="Admin">
      <CreateFloorContent />
    </ProtectedRoute>
  );
}
