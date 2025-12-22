"use client";

import { useState, useEffect } from "react";
import { NodeDto, NodeType, CreateNodeCommand, UpdateNodeCommand } from "@/types/node.types";
import { Modal } from "../../common/Modal";
import { Input } from "../../common/Input";
import { Button } from "../../common/Button";
import { getNodeTypeInfo, NODE_TYPE_INFO } from "@/utils/nodeTypeUtils";
import { Trash2 } from "lucide-react";

interface NodeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  floorId: string;
  initialPosition?: { x: number; y: number };
  node?: NodeDto;
  onSave: (data: CreateNodeCommand | UpdateNodeCommand) => Promise<void>;
  onDelete?: (nodeId: string) => Promise<void>;
}

const NODE_TYPES: { value: NodeType; label: string }[] = [
  { value: NodeType.Room, label: "Room" },
  { value: NodeType.Corridor, label: "Corridor" },
  { value: NodeType.Elevator, label: "Elevator" },
  { value: NodeType.Stairs, label: "Stairs" },
  { value: NodeType.Entrance, label: "Entrance" },
  { value: NodeType.Restroom, label: "Restroom" },
  { value: NodeType.InformationDesk, label: "Information Desk" },
  { value: NodeType.Unknown, label: "Unknown" },
];

export function NodeEditModal({
  isOpen,
  onClose,
  mode,
  floorId,
  initialPosition,
  node,
  onSave,
  onDelete,
}: NodeEditModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    nodeType: NodeType.Room,
    x: 0,
    y: 0,
    qrCode: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data
  useEffect(() => {
    if (mode === "edit" && node) {
      setFormData({
        name: node.name || "",
        nodeType: typeof node.nodeType === "number" ? node.nodeType : NodeType.Room,
        x: node.x,
        y: node.y,
        qrCode: node.qrCode || "",
      });
    } else if (mode === "create" && initialPosition) {
      setFormData({
        name: "",
        nodeType: NodeType.Room,
        x: initialPosition.x,
        y: initialPosition.y,
        qrCode: "",
      });
    }
    setError(null);
  }, [mode, node, initialPosition, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError("Node name is required");
      return;
    }

    try {
      setIsLoading(true);

      if (mode === "create") {
        const createData: CreateNodeCommand = {
          name: formData.name.trim(),
          nodeType: NODE_TYPES.find((t) => t.value === formData.nodeType)?.label || "Room",
          x: formData.x,
          y: formData.y,
          floorId,
          qrCode: formData.qrCode.trim() || undefined,
        };
        await onSave(createData);
      } else if (node) {
        const updateData: UpdateNodeCommand = {
          id: node.id,
          name: formData.name.trim(),
          nodeType: NODE_TYPES.find((t) => t.value === formData.nodeType)?.label || "Room",
          x: formData.x,
          y: formData.y,
          floorId,
          qrCode: formData.qrCode.trim() || undefined,
        };
        await onSave(updateData);
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save node");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!node || !onDelete) return;

    if (!window.confirm(`Are you sure you want to delete "${node.name}"? This will also delete all connected edges.`)) {
      return;
    }

    try {
      setIsLoading(true);
      await onDelete(node.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete node");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedTypeInfo = getNodeTypeInfo(formData.nodeType);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? "Add New Node" : "Edit Node"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Node Name <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Room 101, Main Entrance"
            disabled={isLoading}
          />
        </div>

        {/* Node Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Node Type
          </label>
          <div className="grid grid-cols-4 gap-2">
            {NODE_TYPES.map((type) => {
              const info = getNodeTypeInfo(type.value);
              const isSelected = formData.nodeType === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, nodeType: type.value })}
                  className={`
                    flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all
                    ${isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                    }
                  `}
                  disabled={isLoading}
                >
                  <span className="text-xl">{info.emoji}</span>
                  <span className="text-xs text-gray-600">{type.label}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {selectedTypeInfo.emoji} {selectedTypeInfo.label}
          </p>
        </div>

        {/* Position */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              X Position
            </label>
            <Input
              type="number"
              value={formData.x}
              onChange={(e) => setFormData({ ...formData, x: parseInt(e.target.value) || 0 })}
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Y Position
            </label>
            <Input
              type="number"
              value={formData.y}
              onChange={(e) => setFormData({ ...formData, y: parseInt(e.target.value) || 0 })}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* QR Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            QR Code (Optional)
          </label>
          <Input
            type="text"
            value={formData.qrCode}
            onChange={(e) => setFormData({ ...formData, qrCode: e.target.value })}
            placeholder="e.g., WF-B1-F1-R101"
            disabled={isLoading}
          />
          <p className="mt-1 text-xs text-gray-500">
            Unique identifier for QR code scanning
          </p>
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
              {isLoading ? "Saving..." : mode === "create" ? "Create Node" : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default NodeEditModal;

