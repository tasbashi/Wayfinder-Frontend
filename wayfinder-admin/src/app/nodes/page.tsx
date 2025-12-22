"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import { NodeCard } from "@/components/features/NodeCard";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { useNodeStore } from "@/store/nodeStore";
import { useAuth } from "@/store/authStore";
import { useBuildingStore } from "@/store/buildingStore";
import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { NodeType } from "@/types/node.types";
import { getNodeTypeLabel } from "@/utils/nodeTypeUtils";
import { FilterPanel, FilterOption } from "@/components/common/FilterPanel";
import { getFilterPresets, saveFilterPreset, generatePresetId } from "@/utils/filterPresets";

function NodesContent() {
  const {
    nodes,
    isLoading,
    error,
    fetchNodes,
    clearError,
  } = useNodeStore();
  const { buildings } = useBuildingStore();
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, any>>({
    building: "",
    floor: "",
    nodeType: "",
  });
  const pageSize = 20;

  const isAdmin = user?.role === "Admin";

  useEffect(() => {
    fetchNodes(currentPage, pageSize);
  }, [currentPage]);

  useEffect(() => {
    if (buildings) {
      fetchNodes(1, pageSize);
    }
  }, [buildings]);

  // Get available floors for selected building
  const selectedBuildingData = buildings?.items.find(
    (b) => b.id === filters.building
  );
  const availableFloors = selectedBuildingData?.floors || [];

  // Update floor filter options when building changes
  const filterOptions: FilterOption[] = [
    {
      key: "building",
      label: "Building",
      type: "select",
      options: [
        { value: "", label: "All Buildings" },
        ...(buildings?.items.map((b) => ({
          value: b.id,
          label: b.name,
        })) || []),
      ],
    },
    {
      key: "floor",
      label: "Floor",
      type: "select",
      options: [
        { value: "", label: "All Floors" },
        ...availableFloors.map((f) => ({
          value: f.id,
          label: `${f.name} (Floor ${f.floorNumber})`,
        })),
      ],
      placeholder: filters.building ? "Select a floor" : "Select building first",
    },
    {
      key: "nodeType",
      label: "Node Type",
      type: "select",
      options: [
        { value: "", label: "All Types" },
        ...Object.values(NodeType)
          .filter((v) => typeof v === "number")
          .map((type) => ({
            value: String(type),
            label: getNodeTypeLabel(type as NodeType),
          })),
      ],
    },
  ];

  const filteredNodes = nodes?.items.filter((node) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !node.name.toLowerCase().includes(query) &&
        !node.qrCode.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    // Building filter
    if (filters.building) {
      const building = buildings?.items.find((b) => b.id === filters.building);
      const floorIds = building?.floors?.map((f) => f.id) || [];
      if (!floorIds.includes(node.floorId)) {
        return false;
      }
    }

    // Floor filter
    if (filters.floor) {
      if (node.floorId !== filters.floor) {
        return false;
      }
    }

    // Node type filter
    if (filters.nodeType) {
      const nodeTypeValue =
        typeof node.nodeType === "string"
          ? String(node.nodeType)
          : String(node.nodeType);
      if (nodeTypeValue !== filters.nodeType) {
        return false;
      }
    }

    return true;
  });

  const presets = getFilterPresets().filter((p) =>
    p.filters.hasOwnProperty("building") ||
    p.filters.hasOwnProperty("floor") ||
    p.filters.hasOwnProperty("nodeType")
  );

  function handleFilterChange(newFilters: Record<string, any>) {
    setFilters(newFilters);
    // Reset floor filter if building changed
    if (newFilters.building !== filters.building) {
      setFilters({ ...newFilters, floor: "" });
    }
  }

  function handleSavePreset(name: string, presetFilters: Record<string, any>) {
    const preset = {
      id: generatePresetId(),
      name,
      filters: presetFilters,
    };
    saveFilterPreset(preset);
  }

  return (
    <Layout>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nodes</h1>
            <p className="mt-2 text-gray-600">
              Manage navigation nodes and their positions
            </p>
          </div>
          {isAdmin && (
            <Button
              onClick={() => router.push("/nodes/create")}
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Node
            </Button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-2 sm:gap-4 items-start">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search nodes by name or QR code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <FilterPanel
            filters={filterOptions}
            values={filters}
            onChange={handleFilterChange}
            onReset={() => setFilters({ building: "", floor: "", nodeType: "" })}
            presets={presets}
            onSavePreset={handleSavePreset}
          />
        </div>

        {/* Error Message */}
        {error && (
          <ErrorMessage message={error} onClose={clearError} />
        )}

        {/* Loading State */}
        {isLoading && !nodes && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading nodes..." />
          </div>
        )}

        {/* Nodes Grid */}
        {nodes && (
          <>
            {filteredNodes && filteredNodes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredNodes.map((node) => (
                  <NodeCard key={node.id} node={node} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {searchQuery
                    ? "No nodes found matching your search"
                    : "No nodes yet. Create your first node!"}
                </p>
              </div>
            )}

            {/* Pagination */}
            {nodes.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <div className="text-sm text-gray-600">
                  Showing {nodes.items.length} of {nodes.totalCount} nodes
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={!nodes.hasPreviousPage || isLoading}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center px-4 text-sm text-gray-600">
                    Page {nodes.pageNumber} of {nodes.totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(nodes.totalPages, p + 1)
                      )
                    }
                    disabled={!nodes.hasNextPage || isLoading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

export default function NodesPage() {
  return (
    <ProtectedRoute>
      <NodesContent />
    </ProtectedRoute>
  );
}

