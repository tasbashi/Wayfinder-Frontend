"use client";

import React from "react";
import { EditorMode } from "./types";
import {
  MousePointer2,
  Plus,
  Link2,
  Eye,
  Route,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize as MaximizeIcon,
  Minimize as MinimizeIcon,
  Filter,
  Spline,
} from "lucide-react";
import { FilterPanel } from "./FilterPanel";
import { NodeType } from "@/types/node.types";

interface ToolPanelProps {
  currentMode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  edgeStartNodeId: string | null;
  pathTestStartNodeId: string | null;
  isDrawingCorridor?: boolean;
  corridorPointsCount?: number;
  onCancelEdgeCreation: () => void;
  onCancelPathTest: () => void;
  onCancelCorridorCreation?: () => void;
  onFinishCorridor?: () => void;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
  // Node Size
  nodeSize: number;
  onNodeSizeChange: (size: number) => void;
  // Filter Props
  visibleNodeTypes: Set<NodeType>;
  onToggleNodeType: (type: NodeType) => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  onSelectAllNodeTypes: () => void;
  onDeselectAllNodeTypes: () => void;
}

interface ToolButton {
  mode: EditorMode;
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  description: string;
}

const TOOLS: ToolButton[] = [
  {
    mode: "view",
    icon: <Eye className="w-4 h-4" />,
    label: "View",
    shortcut: "V",
    description: "View mode - pan and zoom only",
  },
  {
    mode: "select",
    icon: <MousePointer2 className="w-4 h-4" />,
    label: "Select",
    shortcut: "S",
    description: "Select and move nodes",
  },
  {
    mode: "addNode",
    icon: <Plus className="w-4 h-4" />,
    label: "Add Node",
    shortcut: "N",
    description: "Click on canvas to add a new node",
  },
  {
    mode: "addEdge",
    icon: <Link2 className="w-4 h-4" />,
    label: "Add Edge",
    shortcut: "E",
    description: "Click two nodes to connect them",
  },
  {
    mode: "addCorridor",
    icon: <Spline className="w-4 h-4" />,
    label: "Corridor",
    shortcut: "C",
    description: "Click to draw corridor path (double-click to finish)",
  },
  {
    mode: "pathTest",
    icon: <Route className="w-4 h-4" />,
    label: "Test Path",
    shortcut: "P",
    description: "Click start and end nodes to test pathfinding",
  },
];

export function ToolPanel({
  currentMode,
  onModeChange,
  edgeStartNodeId,
  pathTestStartNodeId,
  isDrawingCorridor,
  corridorPointsCount,
  onCancelEdgeCreation,
  onCancelPathTest,
  onCancelCorridorCreation,
  onFinishCorridor,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  isFullScreen,
  onToggleFullScreen,
  nodeSize,
  onNodeSizeChange,
  visibleNodeTypes,
  onToggleNodeType,
  showLabels,
  onToggleLabels,
  onSelectAllNodeTypes,
  onDeselectAllNodeTypes,
}: ToolPanelProps) {
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  return (
    <div className="flex items-center gap-1 px-4 py-2 bg-white border-b border-gray-200 relative">
      {/* Tool buttons */}
      <div className="flex items-center gap-1 mr-4">
        {TOOLS.map((tool) => (
          <button
            key={tool.mode}
            onClick={() => onModeChange(tool.mode)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
              transition-colors duration-150
              ${currentMode === tool.mode
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
              }
            `}
            title={`${tool.description} (${tool.shortcut})`}
          >
            {tool.icon}
            <span className="hidden sm:inline">{tool.label}</span>
          </button>
        ))}
      </div>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-300" />

      {/* Mode-specific info */}
      <div className="flex items-center gap-2 ml-4 text-sm text-gray-600">
        {currentMode === "addEdge" && edgeStartNodeId && (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-md">
            <span>First node selected</span>
            <button
              onClick={onCancelEdgeCreation}
              className="p-0.5 hover:bg-green-200 rounded"
              title="Cancel edge creation"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {currentMode === "view" && (
          <span className="text-gray-500">Read-only mode</span>
        )}

        {currentMode === "select" && (
          <span className="text-gray-500">Click to select, drag to move</span>
        )}

        {currentMode === "addNode" && (
          <span className="text-gray-500">Click on canvas to place node</span>
        )}

        {currentMode === "addEdge" && !edgeStartNodeId && (
          <span className="text-gray-500">Click first node to start edge</span>
        )}

        {currentMode === "addCorridor" && !isDrawingCorridor && (
          <span className="text-gray-500">Click on canvas to start drawing corridor</span>
        )}

        {currentMode === "addCorridor" && isDrawingCorridor && (
          <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-md">
            <span>Drawing corridor ({corridorPointsCount || 0} points)</span>
            {onFinishCorridor && (corridorPointsCount || 0) >= 2 && (
              <button
                onClick={onFinishCorridor}
                className="px-2 py-0.5 bg-purple-600 text-white rounded text-sm font-medium hover:bg-purple-700 transition-colors"
                title="Finish corridor (Enter)"
              >
                ✓ Finish
              </button>
            )}
            {onCancelCorridorCreation && (
              <button
                onClick={onCancelCorridorCreation}
                className="p-0.5 hover:bg-purple-200 rounded"
                title="Cancel corridor creation (Escape)"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {currentMode === "pathTest" && !pathTestStartNodeId && (
          <span className="text-gray-500">Click a node to select START point</span>
        )}

        {currentMode === "pathTest" && pathTestStartNodeId && (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-md">
            <span>Start node selected - click END node</span>
            <button
              onClick={onCancelPathTest}
              className="p-0.5 hover:bg-green-200 rounded"
              title="Cancel path test"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Filters Button */}
      <div className="flex items-center gap-1 ml-auto mr-4 relative">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
            ${isFilterOpen ? "bg-gray-100 text-blue-600" : "text-gray-600 hover:bg-gray-100"}
          `}
          title="Filter Nodes"
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filter</span>
        </button>

        {isFilterOpen && (
          <FilterPanel
            visibleNodeTypes={visibleNodeTypes}
            onToggleNodeType={onToggleNodeType}
            showLabels={showLabels}
            onToggleLabels={onToggleLabels}
            onClose={() => setIsFilterOpen(false)}
            onSelectAll={onSelectAllNodeTypes}
            onDeselectAll={onDeselectAllNodeTypes}
          />
        )}
      </div>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-300 mr-4" />

      {/* Node Size Slider */}
      <div className="flex items-center gap-2 mr-4">
        <span className="text-xs font-medium text-gray-500">Node Size</span>
        <input
          type="range"
          min="5"
          max="30"
          value={nodeSize}
          onChange={(e) => onNodeSizeChange(Number(e.target.value))}
          className="w-24 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          title={`Node Size: ${nodeSize}px`}
        />
        <span className="text-xs text-gray-500 w-6">{nodeSize}</span>
      </div>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-300" />

      {/* Zoom controls */}
      <div className="flex items-center gap-1 ml-4">
        <button
          onClick={onZoomOut}
          disabled={zoomLevel <= 0.25}
          className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Zoom out (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="min-w-[3.5rem] text-center text-sm font-medium text-gray-700">
          {Math.round(zoomLevel * 100)}%
        </span>
        <button
          onClick={onZoomIn}
          disabled={zoomLevel >= 4}
          className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Zoom in (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={onZoomReset}
          className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 ml-1"
          title="Reset zoom (100%)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Full Screen Toggle */}
      <div className="flex items-center gap-1 ml-2 pl-2 border-l border-gray-300">
        <button
          onClick={onToggleFullScreen}
          className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100"
          title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
        >
          {isFullScreen ? (
            <MinimizeIcon className="w-4 h-4" />
          ) : (
            <MaximizeIcon className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}

// Re-export ToolPanel explicitly
export default ToolPanel;
