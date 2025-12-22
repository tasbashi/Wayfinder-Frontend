"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
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

const createBuildingSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  address: z.string().max(200, "Address too long").optional(),
});

type CreateBuildingForm = z.infer<typeof createBuildingSchema>;

function CreateBuildingContent() {
  const router = useRouter();
  const { createBuilding, isLoading, error, clearError } = useBuildingStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateBuildingForm>({
    resolver: zodResolver(createBuildingSchema),
  });

  const onSubmit = async (data: CreateBuildingForm) => {
    clearError();
    try {
      const buildingId = await createBuilding(data);
      router.push(`/buildings/${buildingId}`);
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-2xl">
        <Link
          href="/buildings"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Buildings
        </Link>

        <Card>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Create New Building
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
              autoFocus
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
                    Creating...
                  </span>
                ) : (
                  "Create Building"
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
}

export default function CreateBuildingPage() {
  return (
    <ProtectedRoute requiredRole="Admin">
      <CreateBuildingContent />
    </ProtectedRoute>
  );
}

