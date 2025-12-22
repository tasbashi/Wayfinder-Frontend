"use client";

import { useState, useEffect } from "react";
import { Corridor, CreateCorridorCommand, UpdateCorridorCommand, PathPoint, stringifyPathPoints } from "@/types/corridor.types";
import { Modal } from "../../common/Modal";
import { Input } from "../../common/Input";
import { Button } from "../../common/Button";
import { Trash2, Accessibility } from "lucide-react";

interface CorridorEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: "create" | "edit";
    floorId: string;
    pathPoints?: PathPoint[];
    corridor?: Corridor;
    onSave: (data: CreateCorridorCommand | UpdateCorridorCommand) => Promise<void>;
    onDelete?: (corridorId: string) => Promise<void>;
}

export function CorridorEditModal({
    isOpen,
    onClose,
    mode,
    floorId,
    pathPoints,
    corridor,
    onSave,
    onDelete,
}: CorridorEditModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        isAccessible: true,
        width: 2,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize form data
    useEffect(() => {
        if (mode === "edit" && corridor) {
            setFormData({
                name: corridor.name || "",
                isAccessible: corridor.isAccessible,
                width: corridor.width || 2,
            });
        } else if (mode === "create") {
            setFormData({
                name: "",
                isAccessible: true,
                width: 2,
            });
        }
        setError(null);
    }, [mode, corridor, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!formData.name.trim()) {
            setError("Corridor name is required");
            return;
        }

        if (mode === "create" && (!pathPoints || pathPoints.length < 2)) {
            setError("Corridor must have at least 2 points");
            return;
        }

        try {
            setIsLoading(true);

            if (mode === "create" && pathPoints) {
                const createData: CreateCorridorCommand = {
                    name: formData.name.trim(),
                    pathPointsJson: stringifyPathPoints(pathPoints),
                    isAccessible: formData.isAccessible,
                    width: formData.width,
                    floorId,
                };
                await onSave(createData);
            } else if (corridor) {
                const updateData: UpdateCorridorCommand = {
                    id: corridor.id,
                    name: formData.name.trim(),
                    pathPointsJson: stringifyPathPoints(corridor.pathPoints),
                    isAccessible: formData.isAccessible,
                    width: formData.width,
                };
                await onSave(updateData);
            }

            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save corridor");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!corridor || !onDelete) return;

        if (!window.confirm(`Are you sure you want to delete corridor "${corridor.name}"?`)) {
            return;
        }

        try {
            setIsLoading(true);
            await onDelete(corridor.id);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete corridor");
        } finally {
            setIsLoading(false);
        }
    };

    const pointCount = mode === "create" ? pathPoints?.length || 0 : corridor?.pathPoints.length || 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === "create" ? "Create Corridor" : "Edit Corridor"}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error message */}
                {error && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                        {error}
                    </div>
                )}

                {/* Corridor info */}
                <div className="p-3 bg-purple-50 rounded-md">
                    <div className="flex items-center gap-2 text-purple-700">
                        <span className="text-lg">🛤️</span>
                        <span className="font-medium">Corridor Path</span>
                        <span className="text-sm text-purple-600">({pointCount} points)</span>
                    </div>
                    <p className="text-xs text-purple-600 mt-1">
                        {mode === "create"
                            ? "Path drawn on canvas will be saved with this corridor"
                            : "To modify the path, delete and redraw the corridor"}
                    </p>
                </div>

                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Corridor Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Main Corridor, West Wing Hallway"
                        disabled={isLoading}
                    />
                </div>

                {/* Width */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Corridor Width
                    </label>
                    <div className="flex items-center gap-3">
                        <input
                            type="range"
                            min="1"
                            max="5"
                            value={formData.width}
                            onChange={(e) => setFormData({ ...formData, width: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                            disabled={isLoading}
                        />
                        <span className="text-sm font-medium text-gray-600 w-8">{formData.width}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                        Visual width of the corridor on the floor plan
                    </p>
                </div>

                {/* Accessibility */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                        <Accessibility className="w-5 h-5 text-blue-600" />
                        <div>
                            <p className="font-medium text-gray-700">Wheelchair Accessible</p>
                            <p className="text-xs text-gray-500">Corridor is accessible for wheelchairs</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.isAccessible}
                            onChange={(e) => setFormData({ ...formData, isAccessible: e.target.checked })}
                            className="sr-only peer"
                            disabled={isLoading}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
                            {isLoading ? "Saving..." : mode === "create" ? "Create Corridor" : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </form>
        </Modal>
    );
}

export default CorridorEditModal;
