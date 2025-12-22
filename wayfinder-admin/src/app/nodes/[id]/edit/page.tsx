"use client";

import { useEffect, useState } from "react";
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
import { useNodeStore } from "@/store/nodeStore";
import { useBuildingStore } from "@/store/buildingStore";
import { NodeType } from "@/types/node.types";
import { getNodeTypeLabel, getNodeTypeName } from "@/utils/nodeTypeUtils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const updateNodeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  nodeType: z.string().min(1, "Node type is required"),
  x: z.coerce.number().int("Must be a whole number"),
  y: z.coerce.number().int("Must be a whole number"),
  floorId: z.string().min(1, "Floor is required"),
  qrCode: z.string().optional(),
});

type UpdateNodeForm = z.infer<typeof updateNodeSchema>;

function EditNodeContent() {
  const params = useParams();
  const router = useRouter();
  const nodeId = params.id as string;
  const {
    currentNode,
    isLoading,
    error,
    fetchNodeById,
    updateNode,
    clearError,
  } = useNodeStore();
  const { buildings, fetchBuildings } = useBuildingStore();
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<UpdateNodeForm>({
    resolver: zodResolver(updateNodeSchema),
  });

  useEffect(() => {
    if (nodeId) {
      fetchNodeById(nodeId);
    }
    if (!buildings) {
      fetchBuildings(1, 100);
    }
  }, [nodeId]);

  useEffect(() => {
    if (currentNode && buildings) {
      // Find building that contains the floor
      const building = buildings.items.find((b) =>
        b.floors?.some((f) => f.id === currentNode.floorId)
      );
      if (building) {
        setSelectedBuildingId(building.id);
      }
      reset({
        name: currentNode.name,
        nodeType: getNodeTypeName(currentNode.nodeType), // Convert enum to name string (e.g., "Room")
        x: currentNode.x,
        y: currentNode.y,
        floorId: currentNode.floorId,
        qrCode: currentNode.qrCode || "",
      });
    }
  }, [currentNode, buildings, reset]);

  const selectedFloorId = watch("floorId");
  const selectedBuilding = buildings?.items.find(
    (b) => b.id === selectedBuildingId
  );
  const availableFloors = selectedBuilding?.floors || [];

  const onSubmit = async (data: UpdateNodeForm) => {
    clearError();
    try {
      await updateNode(nodeId, {
        id: nodeId,
        name: data.name,
        nodeType: data.nodeType, // Send as string
        x: Number(data.x),
        y: Number(data.y),
        floorId: data.floorId,
        qrCode: data.qrCode || undefined,
      });
      router.push(`/nodes/${nodeId}`);
    } catch (err) {
      // Error handled by store
    }
  };

  if (isLoading && !currentNode) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" text="Loading node..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-2xl">
        <Link
          href={`/nodes/${nodeId}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Node
        </Link>

        <Card>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Node</h1>

          {error && (
            <ErrorMessage message={error} variant="inline" className="mb-4" />
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Node Name *"
              placeholder="e.g., Room 101"
              {...register("name")}
              error={errors.name?.message}
              disabled={isLoading}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Node Type *
              </label>
              <select
                {...register("nodeType")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                disabled={isLoading}
              >
                {Object.values(NodeType)
                  .filter((v) => typeof v === "number")
                  .map((type) => {
                    const label = getNodeTypeLabel(type as NodeType);
                    return (
                      <option key={type} value={label}>
                        {label}
                      </option>
                    );
                  })}
              </select>
              {errors.nodeType && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.nodeType.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Building *
              </label>
              <select
                value={selectedBuildingId}
                onChange={(e) => {
                  setSelectedBuildingId(e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                disabled={isLoading}
              >
                <option value="">Select a building</option>
                {buildings?.items.map((building) => (
                  <option key={building.id} value={building.id}>
                    {building.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedBuildingId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Floor *
                </label>
                <select
                  {...register("floorId")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  disabled={isLoading || availableFloors.length === 0}
                >
                  <option value="">
                    {availableFloors.length === 0
                      ? "No floors available"
                      : "Select a floor"}
                  </option>
                  {availableFloors.map((floor) => (
                    <option key={floor.id} value={floor.id}>
                      {floor.name} (Floor {floor.floorNumber})
                    </option>
                  ))}
                </select>
                {errors.floorId && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.floorId.message}
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="X Position *"
                type="number"
                {...register("x")}
                error={errors.x?.message}
                disabled={isLoading}
              />

              <Input
                label="Y Position *"
                type="number"
                {...register("y")}
                error={errors.y?.message}
                disabled={isLoading}
              />
            </div>

            <Input
              label="QR Code"
              {...register("qrCode")}
              error={errors.qrCode?.message}
              disabled={isLoading}
              helperText="QR code for this node"
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
                  "Update Node"
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
}

export default function EditNodePage() {
  return (
    <ProtectedRoute requiredRole="Admin">
      <EditNodeContent />
    </ProtectedRoute>
  );
}

