"use client";

import { NodeType } from "@/types/node.types";
import { NODE_TYPE_INFO } from "@/utils/nodeTypeUtils";
import { Check, X } from "lucide-react";

interface FilterPanelProps {
    visibleNodeTypes: Set<NodeType>;
    onToggleNodeType: (type: NodeType) => void;
    showLabels: boolean;
    onToggleLabels: () => void;
    onClose: () => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;
}

export function FilterPanel({
    visibleNodeTypes,
    onToggleNodeType,
    showLabels,
    onToggleLabels,
    onClose,
    onSelectAll,
    onDeselectAll,
}: FilterPanelProps) {
    // Get all node type definitions
    const nodeTypes = Object.entries(NODE_TYPE_INFO).map(([key, info]) => ({
        type: Number(key) as NodeType,
        info,
    }));

    return (
        <div className="absolute top-12 right-4 z-50 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4 flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h3 className="text-sm font-semibold text-gray-700">Filter Nodes</h3>
                <button
                    onClick={onClose}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Global Actions */}
            <div className="flex items-center justify-between text-xs text-blue-600 font-medium">
                <button onClick={onSelectAll} className="hover:underline">
                    Select All
                </button>
                <button onClick={onDeselectAll} className="hover:underline">
                    Deselect All
                </button>
            </div>

            {/* Label Toggle */}
            <label className="flex items-center gap-2 cursor-pointer p-1hover:bg-gray-50 rounded">
                <div className={`
          w-4 h-4 rounded border flex items-center justify-center
          ${showLabels
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-gray-300"
                    }
        `}>
                    {showLabels && <Check className="w-3 h-3" />}
                </div>
                <input
                    type="checkbox"
                    checked={showLabels}
                    onChange={onToggleLabels}
                    className="hidden"
                />
                <span className="text-sm text-gray-700 font-medium">Show Labels</span>
            </label>

            <div className="h-px bg-gray-100 my-1" />

            {/* Node Type Toggles */}
            <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto">
                {nodeTypes.map(({ type, info }) => {
                    const isVisible = visibleNodeTypes.has(type);
                    return (
                        <label
                            key={type}
                            className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-gray-50 rounded transition-colors"
                        >
                            <div className={`
                w-4 h-4 rounded border flex items-center justify-center transition-colors
                ${isVisible
                                    ? "bg-blue-600 border-blue-600 text-white"
                                    : "bg-white border-gray-300"
                                }
              `}>
                                {isVisible && <Check className="w-3 h-3" />}
                            </div>
                            <input
                                type="checkbox"
                                checked={isVisible}
                                onChange={() => onToggleNodeType(type)}
                                className="hidden"
                            />

                            {/* Color dot */}
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: info.hexColor }}
                            />

                            <span className="text-sm text-gray-600">{info.label}</span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
}
