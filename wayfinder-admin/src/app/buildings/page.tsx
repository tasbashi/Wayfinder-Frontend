"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import { BuildingCard } from "@/components/features/BuildingCard";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { useBuildingStore } from "@/store/buildingStore";
import { useAuth } from "@/store/authStore";
import { Plus, Search, Trash2, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { BulkActions, BulkAction } from "@/components/common/BulkActions";
import { useToastContext } from "@/contexts/ToastContext";

function BuildingsContent() {
  const {
    buildings,
    isLoading,
    error,
    fetchBuildings,
    clearError,
  } = useBuildingStore();
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBuildingIds, setSelectedBuildingIds] = useState<Set<string>>(
    new Set()
  );
  const pageSize = 20;
  const { success, error: showError } = useToastContext();

  const isAdmin = user?.role === "Admin";

  useEffect(() => {
    fetchBuildings(currentPage, pageSize);
  }, [currentPage]);

  const handleSearch = () => {
    // TODO: Implement search functionality
    fetchBuildings(1, pageSize);
  };

  const filteredBuildings = buildings?.items.filter((building) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      building.name.toLowerCase().includes(query) ||
      building.address?.toLowerCase().includes(query)
    );
  });

  function handleSelectBuilding(id: string, selected: boolean) {
    setSelectedBuildingIds((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  }

  function handleSelectAll() {
    if (filteredBuildings) {
      if (selectedBuildingIds.size === filteredBuildings.length) {
        setSelectedBuildingIds(new Set());
      } else {
        setSelectedBuildingIds(new Set(filteredBuildings.map((b) => b.id)));
      }
    }
  }

  async function handleBulkDelete(ids: string[]) {
    if (
      !window.confirm(
        `Are you sure you want to delete ${ids.length} building(s)? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const { deleteBuilding } = useBuildingStore.getState();
      for (const id of ids) {
        await deleteBuilding(id);
      }
      setSelectedBuildingIds(new Set());
      success(`Successfully deleted ${ids.length} building(s)`);
    } catch (err) {
      showError("Failed to delete some buildings");
    }
  }

  function handleBulkExport(ids: string[]) {
    const selectedBuildings = buildings?.items.filter((b) =>
      ids.includes(b.id)
    );
    if (!selectedBuildings || selectedBuildings.length === 0) return;

    const dataStr = JSON.stringify(selectedBuildings, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `buildings-export-${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    success(`Exported ${ids.length} building(s)`);
    setSelectedBuildingIds(new Set());
  }

  const bulkActions: BulkAction[] = [
    {
      id: "delete",
      label: "Delete",
      icon: Trash2,
      variant: "danger",
      onClick: handleBulkDelete,
    },
    {
      id: "export",
      label: "Export",
      icon: Download,
      variant: "outline",
      onClick: handleBulkExport,
    },
  ];

  return (
    <Layout>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Buildings</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Manage buildings and their floors
            </p>
          </div>
          {isAdmin && (
            <Button
              onClick={() => router.push("/buildings/create")}
              size="lg"
              className="w-full sm:w-auto"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Building
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search buildings by name or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
          </div>
          <Button onClick={handleSearch} variant="outline">
            <Search className="w-5 h-5" />
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <ErrorMessage
            message={error}
            onClose={clearError}
            variant="default"
          />
        )}

        {/* Loading State */}
        {isLoading && !buildings && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading buildings..." />
          </div>
        )}

        {/* Selection Controls */}
        {filteredBuildings && filteredBuildings.length > 0 && (
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={
                  filteredBuildings.length > 0 &&
                  selectedBuildingIds.size === filteredBuildings.length
                }
                onChange={handleSelectAll}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              Select All ({filteredBuildings.length})
            </label>
            {selectedBuildingIds.size > 0 && (
              <span className="text-sm text-gray-600">
                {selectedBuildingIds.size} selected
              </span>
            )}
          </div>
        )}

        {/* Buildings Grid */}
        {buildings && (
          <>
            {filteredBuildings && filteredBuildings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredBuildings.map((building) => (
                  <BuildingCard
                    key={building.id}
                    building={building}
                    isSelected={selectedBuildingIds.has(building.id)}
                    onSelect={handleSelectBuilding}
                    showCheckbox={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {searchQuery
                    ? "No buildings found matching your search"
                    : "No buildings yet. Create your first building!"}
                </p>
              </div>
            )}

            {/* Pagination */}
            {buildings.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <div className="text-sm text-gray-600">
                  Showing {buildings.items.length} of {buildings.totalCount}{" "}
                  buildings
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={!buildings.hasPreviousPage || isLoading}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center px-4 text-sm text-gray-600">
                    Page {buildings.pageNumber} of {buildings.totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(buildings.totalPages, p + 1)
                      )
                    }
                    disabled={!buildings.hasNextPage || isLoading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Bulk Actions */}
        <BulkActions
          selectedIds={Array.from(selectedBuildingIds)}
          actions={bulkActions}
          onClearSelection={() => setSelectedBuildingIds(new Set())}
        />
      </div>
    </Layout>
  );
}

export default function BuildingsPage() {
  return (
    <ProtectedRoute>
      <BuildingsContent />
    </ProtectedRoute>
  );
}

