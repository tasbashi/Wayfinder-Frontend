"use client";

import { useEffect } from "react";
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
import { useBuildingStore } from "@/store/buildingStore";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const updateBuildingSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  address: z.string().max(200, "Address too long").optional(),
});

type UpdateBuildingForm = z.infer<typeof updateBuildingSchema>;

function EditBuildingContent() {
  const params = useParams();
  const router = useRouter();
  const buildingId = params.id as string;
  const {
    currentBuilding,
    isLoading,
    error,
    fetchBuildingById,
    updateBuilding,
    clearError,
  } = useBuildingStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateBuildingForm>({
    resolver: zodResolver(updateBuildingSchema),
  });

  useEffect(() => {
    if (buildingId) {
      fetchBuildingById(buildingId);
    }
  }, [buildingId, fetchBuildingById]);

  useEffect(() => {
    if (currentBuilding) {
      reset({
        name: currentBuilding.name,
        address: currentBuilding.address || "",
      });
    }
  }, [currentBuilding, reset]);

  const onSubmit = async (data: UpdateBuildingForm) => {
    clearError();
    try {
      await updateBuilding(buildingId, {
        id: buildingId,
        ...data,
      });
      router.push(`/buildings/${buildingId}`);
    } catch (err) {
      // Error handled by store
    }
  };

  if (isLoading && !currentBuilding) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" text="Loading building..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-2xl">
        <Link
          href={`/buildings/${buildingId}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Building
        </Link>

        <Card>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Edit Building
          </h1>

          {error && (
            <ErrorMessage message={error} variant="inline" className="mb-4" />
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Building Name *"
              placeholder="e.g., Hospital Building A"
              {...register("name")}
              error={errors.name?.message}
              disabled={isLoading}
            />

            <Input
              label="Address"
              placeholder="e.g., 123 Main Street, City"
              {...register("address")}
              error={errors.address?.message}
              disabled={isLoading}
              helperText="Optional address for the building"
            />

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" />
                    Updating...
                  </span>
                ) : (
                  "Update Building"
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
}

export default function EditBuildingPage() {
  return (
    <ProtectedRoute requiredRole="Admin">
      <EditBuildingContent />
    </ProtectedRoute>
  );
}

