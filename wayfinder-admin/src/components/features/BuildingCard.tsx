"use client";

import { BuildingDto } from "@/types/building.types";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { Building, MapPin, Layers, MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useBuildingStore } from "@/store/buildingStore";
import { useAuth } from "@/store/authStore";
import { clsx } from "clsx";

interface BuildingCardProps {
  building: BuildingDto;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  showCheckbox?: boolean;
}

export function BuildingCard({
  building,
  isSelected = false,
  onSelect,
  showCheckbox = false,
}: BuildingCardProps) {
  const router = useRouter();
  const { deleteBuilding, isLoading } = useBuildingStore();
  const { user } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isAdmin = user?.role === "Admin";

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${building.name}"?`)) {
      try {
        await deleteBuilding(building.id);
        setShowDeleteConfirm(false);
      } catch (error) {
        // Error handled by store
      }
    }
  };

  return (
    <Card
      className={clsx(
        "hover:shadow-lg transition-shadow",
        isSelected && "ring-2 ring-blue-500 border-blue-500"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {showCheckbox && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              onSelect?.(building.id, e.target.checked);
            }}
            className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
          />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {building.name}
            </h3>
          </div>

          {building.address && (
            <div className="flex items-center gap-2 text-gray-600 mb-3">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{building.address}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-gray-500">
            <Layers className="w-4 h-4" />
            <span className="text-sm">
              {building.floors?.length || 0} floor
              {(building.floors?.length || 0) !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/buildings/${building.id}/edit`)}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              disabled={isLoading}
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <Button
          variant="primary"
          className="w-full"
          onClick={() => router.push(`/buildings/${building.id}`)}
        >
          View Details
        </Button>
      </div>
    </Card>
  );
}

