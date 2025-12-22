"use client";

import { useState, useEffect, useMemo } from "react";
import { EdgeDto, EdgeType, CreateEdgeCommand, UpdateEdgeCommand } from "@/types/edge.types";
import { NodeDto } from "@/types/node.types";
import { FloorDto } from "@/types/floor.types";
import { Modal } from "../../common/Modal";
import { Input } from "../../common/Input";
import { Button } from "../../common/Button";
import {
  getEdgeTypeInfo,
  getAllEdgeTypes,
  suggestEdgeType,
  suggestAccessibility,
  suggestWeight,
  isCrossFloorEdge,
} from "@/utils/edgeTypeUtils";
import { getNodeTypeInfo } from "@/utils/nodeTypeUtils";
import { Trash2, ArrowRight, AlertTriangle } from "lucide-react";

interface EdgeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  edge?: EdgeDto;
  // For create mode
  nodeAId?: string;
  nodeBId?: string;
  // Context data
  nodes: NodeDto[];
  floors: FloorDto[];
  onSave: (data: CreateEdgeCommand | UpdateEdgeCommand) => Promise<void>;
  onDelete?: (edgeId: string) => Promise<void>;
}

export function EdgeEditModal({
  isOpen,
  onClose,
  mode,
  edge,
  nodeAId,
  nodeBId,
  nodes,
  floors,
  onSave,
  onDelete,
}: EdgeEditModalProps) {
  const [formData, setFormData] = useState({
    nodeAId: "",
    nodeBId: "",
    weight: 10,
    edgeType: EdgeType.Walking,
    isAccessible: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get nodes by ID
  const nodesMap = useMemo(() => {
    const map = new Map<string, NodeDto>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  // Get floors by ID
  const floorsMap = useMemo(() => {
    const map = new Map<string, FloorDto>();
    floors.forEach((f) => map.set(f.id, f));
    return map;
  }, [floors]);

  // Selected nodes
  const nodeA = nodesMap.get(formData.nodeAId);
  const nodeB = nodesMap.get(formData.nodeBId);

  // Check if cross-floor
  const crossFloor = nodeA && nodeB && isCrossFloorEdge(nodeA.floorId, nodeB.floorId);

  // Get floor difference for weight suggestion
  const floorDifference = useMemo(() => {
    if (!nodeA || !nodeB) return 0;
    const floorA = floorsMap.get(nodeA.floorId);
    const floorB = floorsMap.get(nodeB.floorId);
    if (!floorA || !floorB) return 0;
    return Math.abs(floorA.floorNumber - floorB.floorNumber);
  }, [nodeA, nodeB, floorsMap]);

  // Initialize form data
  useEffect(() => {
    if (mode === "edit" && edge) {
      setFormData({
        nodeAId: edge.nodeAId,
        nodeBId: edge.nodeBId,
        weight: edge.weight,
        edgeType: edge.edgeType,
        isAccessible: edge.isAccessible,
      });
    } else if (mode === "create" && nodeAId && nodeBId) {
      const nodeA = nodesMap.get(nodeAId);
      const nodeB = nodesMap.get(nodeBId);

      // Suggest edge type based on nodes
      const suggestedType = suggestEdgeType(
        nodeA?.floorId || "",
        nodeB?.floorId || "",
        nodeA?.nodeType,
        nodeB?.nodeType
      );

      // Calculate distance for weight
      const distance = nodeA && nodeB
        ? Math.sqrt(Math.pow(nodeB.x - nodeA.x, 2) + Math.pow(nodeB.y - nodeA.y, 2))
        : 10;

      const floorA = nodeA ? floorsMap.get(nodeA.floorId) : undefined;
      const floorB = nodeB ? floorsMap.get(nodeB.floorId) : undefined;
      const floorDiff = floorA && floorB
        ? Math.abs(floorA.floorNumber - floorB.floorNumber)
        : 0;

      setFormData({
        nodeAId,
        nodeBId,
        weight: Math.round(suggestWeight(suggestedType, floorDiff, distance)),
        edgeType: suggestedType,
        isAccessible: suggestAccessibility(suggestedType),
      });
    }
    setError(null);
  }, [mode, edge, nodeAId, nodeBId, nodesMap, floorsMap, isOpen]);

  // Auto-update accessibility when edge type changes
  const handleEdgeTypeChange = (newType: EdgeType) => {
    setFormData({
      ...formData,
      edgeType: newType,
      isAccessible: suggestAccessibility(newType),
      weight: Math.round(suggestWeight(newType, floorDifference, formData.weight)),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.nodeAId || !formData.nodeBId) {
      setError("Both nodes must be selected");
      return;
    }

    if (formData.nodeAId === formData.nodeBId) {
      setError("Cannot create edge to the same node");
      return;
    }

    if (formData.weight <= 0) {
      setError("Weight must be greater than 0");
      return;
    }

    try {
      setIsLoading(true);

      if (mode === "create") {
        const createData: CreateEdgeCommand = {
          nodeAId: formData.nodeAId,
          nodeBId: formData.nodeBId,
          weight: formData.weight,
          edgeType: formData.edgeType,
          isAccessible: formData.isAccessible,
        };
        await onSave(createData);
      } else if (edge) {
        const updateData: UpdateEdgeCommand = {
          id: edge.id,
          nodeAId: formData.nodeAId,
          nodeBId: formData.nodeBId,
          weight: formData.weight,
          edgeType: formData.edgeType,
          isAccessible: formData.isAccessible,
        };
        await onSave(updateData);
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save edge");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!edge || !onDelete) return;

    if (!window.confirm("Are you sure you want to delete this edge?")) {
      return;
    }

    try {
      setIsLoading(true);
      await onDelete(edge.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete edge");
    } finally {
      setIsLoading(false);
    }
  };

  const edgeTypes = getAllEdgeTypes();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? "Create Edge" : "Edit Edge"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Connected Nodes Display */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Connected Nodes
          </label>
          <div className="flex items-center justify-between gap-4">
            {/* Node A */}
            <div className="flex-1 p-3 bg-white rounded-lg border border-gray-200">
              {nodeA ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getNodeTypeInfo(nodeA.nodeType).emoji}</span>
                  <div>
                    <p className="font-medium text-gray-900">{nodeA.name || "Unnamed"}</p>
                    <p className="text-xs text-gray-500">
                      {floorsMap.get(nodeA.floorId)?.name || "Unknown floor"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">Select node A</p>
              )}
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0">
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>

            {/* Node B */}
            <div className="flex-1 p-3 bg-white rounded-lg border border-gray-200">
              {nodeB ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getNodeTypeInfo(nodeB.nodeType).emoji}</span>
                  <div>
                    <p className="font-medium text-gray-900">{nodeB.name || "Unnamed"}</p>
                    <p className="text-xs text-gray-500">
                      {floorsMap.get(nodeB.floorId)?.name || "Unknown floor"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">Select node B</p>
              )}
            </div>
          </div>

          {/* Cross-floor warning */}
          {crossFloor && (
            <div className="mt-2 flex items-center gap-2 text-amber-600 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>This is a cross-floor connection ({floorDifference} floor{floorDifference > 1 ? "s" : ""})</span>
            </div>
          )}
        </div>

        {/* Edge Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Edge Type
          </label>
          <div className="grid grid-cols-4 gap-2">
            {edgeTypes.map(({ value, info }) => {
              const isSelected = formData.edgeType === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleEdgeTypeChange(value)}
                  className={`
                    flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all
                    ${isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                    }
                  `}
                  disabled={isLoading}
                >
                  <span className="text-xl">{info.icon}</span>
                  <span className="text-xs text-gray-600">{info.label}</span>
                  <div
                    className="w-full h-1 rounded"
                    style={{ backgroundColor: info.hexColor }}
                  />
                </button>
              );
            })}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {getEdgeTypeInfo(formData.edgeType).description}
          </p>
        </div>

        {/* Weight */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Weight (Distance/Cost)
          </label>
          <Input
            type="number"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
            min={0.1}
            step={0.1}
            disabled={isLoading}
          />
          <p className="mt-1 text-xs text-gray-500">
            Higher weight = longer/harder path. Used for route calculation.
          </p>
        </div>

        {/* Accessibility */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isAccessible}
              onChange={(e) => setFormData({ ...formData, isAccessible: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={isLoading}
            />
            <div>
              <span className="text-sm font-medium text-gray-700">
                Wheelchair Accessible
              </span>
              <p className="text-xs text-gray-500">
                {formData.isAccessible
                  ? "✅ Can be used in accessible routes"
                  : "⚠️ Will be excluded from accessible routes"}
              </p>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          {mode === "edit" && onDelete ? (
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              disabled={isLoading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : mode === "create" ? "Create Edge" : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default EdgeEditModal;

