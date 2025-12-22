"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { NodeDto, NodeType } from "@/types/node.types";
import { EdgeDto } from "@/types/edge.types";
import { FloorDto } from "@/types/floor.types";
import { NODE_TYPE_INFO } from "@/utils/nodeTypeUtils";
import { Card } from "../../common/Card";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { ToolPanel } from "./ToolPanel";
import { NativeCanvas } from "./NativeCanvas";
import {
  FloorPlanEditorProps,
  EditorState,
  EditorMode,
  CanvasDimensions,
} from "./types";

const INITIAL_STATE: EditorState = {
  scale: 1,
  position: { x: 0, y: 0 },
  isDragging: false,
  draggedNodeId: null,
  hoveredNodeId: null,
  hoveredEdgeId: null,
  hoveredCorridorId: null,
  edgeStartNodeId: null,
  edgePreviewLine: null,
  corridorPoints: [],
  isDrawingCorridor: false,
  selectedNodeId: null,
  selectedEdgeId: null,
  selectedCorridorId: null,
  pathTestStartNodeId: null,
  pathTestEndNodeId: null,
};

export function FloorPlanEditor({
  floor,
  nodes,
  edges,
  corridors = [],
  allFloors = [],
  allNodes = [],
  mode = "view",
  selectedNodeId: externalSelectedNodeId,
  selectedEdgeId: externalSelectedEdgeId,
  onNodeClick,
  onNodeDoubleClick,
  onNodePositionChange,
  onNodeCreate,
  onNodeDelete,
  onEdgeClick,
  onEdgeDoubleClick,
  onEdgeCreate,
  onEdgeDelete,
  onCorridorClick,
  onCorridorCreate,
  readonly = false,
  showEdges = true,
  showCorridors = true,
  // showLabels prop is overridden by internal state for the toggle feature, 
  // but we can use it as initial value if needed. For now, we default internal state to true.
  showLabels: initialShowLabels = true,
  showCrossFloorIndicators = true,
  highlightPath = [],
  onPathTest,
}: FloorPlanEditorProps) {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);

  // State
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [dimensions, setDimensions] = useState<CanvasDimensions>({
    width: 800,
    height: 600,
    imageWidth: 800,
    imageHeight: 600,
    scale: 1,
  });
  const [state, setState] = useState<EditorState>({
    ...INITIAL_STATE,
    selectedNodeId: externalSelectedNodeId || null,
    selectedEdgeId: externalSelectedEdgeId || null,
  });
  const [currentMode, setCurrentMode] = useState<EditorMode>(mode);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [nodeSize, setNodeSize] = useState(10);

  // Filtering State
  const [showLabels, setShowLabels] = useState(initialShowLabels);
  const [visibleNodeTypes, setVisibleNodeTypes] = useState<Set<NodeType>>(() => {
    // Initialize with all known node types
    return new Set(
      Object.keys(NODE_TYPE_INFO).map((k) => Number(k) as NodeType)
    );
  });

  const toggleNodeType = useCallback((type: NodeType) => {
    setVisibleNodeTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  const selectAllNodeTypes = useCallback(() => {
    setVisibleNodeTypes(
      new Set(Object.keys(NODE_TYPE_INFO).map((k) => Number(k) as NodeType))
    );
  }, []);

  const deselectAllNodeTypes = useCallback(() => {
    setVisibleNodeTypes(new Set());
  }, []);

  // Calculate canvas dimensions
  const calculateDimensions = useCallback((img: HTMLImageElement) => {
    const containerWidth = containerRef.current?.clientWidth || 800;
    // In full screen, height is window height. In normal mode, use specific max height (700) or container height
    const maxHeight = isFullScreen ? window.innerHeight : 700;
    const scale = Math.min(containerWidth / img.width, maxHeight / img.height, 1);

    setDimensions({
      width: img.width * scale,
      height: img.height * scale,
      imageWidth: img.width,
      imageHeight: img.height,
      scale,
    });
  }, [isFullScreen]);

  // Full Screen Toggle
  const toggleFullScreen = useCallback(() => {
    setIsFullScreen(prev => !prev);
    // Focus container to capture keyboard events immediately
    setTimeout(() => {
      containerRef.current?.focus();
      if (image) {
        calculateDimensions(image);
      }
    }, 0);
  }, [image, calculateDimensions]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 4.0));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.25));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoomLevel(1.0);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  // Handle scroll wheel zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Only zoom when in full screen mode (to prevent scroll interference)
      if (!isFullScreen) return;

      // Prevent default scroll behavior
      e.preventDefault();
      // Stop event from bubbling up to parent
      e.stopPropagation();
      e.stopImmediatePropagation();

      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoomLevel((prev) => Math.max(0.25, Math.min(4.0, prev + delta)));
    };

    // Use passive: false to allow preventDefault
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [isLoading, isFullScreen]);

  // Disable body and html scroll when in full screen
  useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.height = '100%';
      document.documentElement.style.height = '100%';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.style.height = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.style.height = '';
    };
  }, [isFullScreen]);

  // Spacebar handling for panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        // Prevent scrolling with spacebar if focused on container
        if (document.activeElement === containerRef.current) {
          e.preventDefault();
        }
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Pan handlers for drag-to-pan
  const handlePanStart = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Allow panning if middle mouse button or if spacebar is pressed or if in view mode
      if (e.button === 1 || isSpacePressed || (currentMode === 'view' && e.button === 0)) {
        e.preventDefault();
        setIsPanning(true);
        setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      }
    },
    [currentMode, panOffset, isSpacePressed]
  );

  // Use requestAnimationFrame for smoother panning
  const panRef = useRef({ isPanning, panStart: { x: 0, y: 0 } });

  // Sync ref with state
  useEffect(() => {
    panRef.current = { isPanning, panStart };
  }, [isPanning, panStart]);

  const handlePanMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isPanning) return;

      requestAnimationFrame(() => {
        setPanOffset({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
      });
    },
    [isPanning, panStart]
  );

  const handlePanEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Sync external selection
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      selectedNodeId: externalSelectedNodeId || null,
      selectedEdgeId: externalSelectedEdgeId || null,
    }));
  }, [externalSelectedNodeId, externalSelectedEdgeId]);

  // Sync mode
  useEffect(() => {
    setCurrentMode(mode);
    if (mode !== "addEdge") {
      setState((prev) => ({
        ...prev,
        edgeStartNodeId: null,
        edgePreviewLine: null,
      }));
    }
  }, [mode]);

  // Handle ESC key to exit full screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullScreen) {
        setIsFullScreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullScreen]);

  // Load floor plan image
  useEffect(() => {
    if (!floor.floorPlanImageUrl) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const img = new window.Image();
    img.crossOrigin = "anonymous";

    // Build the correct image URL
    let imageUrl = floor.floorPlanImageUrl;

    // If it's a relative URL starting with /, prepend the API base URL
    if (imageUrl.startsWith("/")) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7014";
      imageUrl = `${apiUrl}${imageUrl}`;
    } else if (imageUrl.startsWith('http://localhost') || imageUrl.startsWith('https://localhost')) {
      // Keep localhost URLs as-is
    }

    img.src = imageUrl;
    img.onload = () => {
      setImage(img);
      calculateDimensions(img);
      setIsLoading(false);
    };
    img.onerror = () => {
      console.error("Failed to load floor plan image:", imageUrl);
      setIsLoading(false);
    };
  }, [floor.floorPlanImageUrl, calculateDimensions]);

  // Handle window resize - updated to depend on calculation
  useEffect(() => {
    const handleResize = () => {
      if (image) {
        calculateDimensions(image);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [image, calculateDimensions]);

  // Effect to recalculate dimensions when fullscreen changes
  useEffect(() => {
    if (image) {
      // Small timeout to allow layout to update
      setTimeout(() => {
        calculateDimensions(image);
      }, 50);
    }
  }, [isFullScreen, image, calculateDimensions]);


  // Build nodes map for quick lookup
  const nodesMap = useMemo(() => {
    const map = new Map<string, NodeDto>();
    nodes.forEach((node) => map.set(node.id, node));
    allNodes.forEach((node) => map.set(node.id, node));
    return map;
  }, [nodes, allNodes]);

  // Get edges for current floor
  const floorEdges = useMemo(() => {
    const floorNodeIds = new Set(nodes.map((n) => n.id));
    return edges.filter(
      (edge) => floorNodeIds.has(edge.nodeAId) || floorNodeIds.has(edge.nodeBId)
    );
  }, [edges, nodes]);

  // Highlight path set for quick lookup
  const highlightPathSet = useMemo(() => new Set(highlightPath), [highlightPath]);

  // Render loading state
  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" text="Loading floor plan..." />
        </div>
      </Card>
    );
  }

  // Render empty state
  if (!image && !floor.floorPlanImageUrl) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <svg
            className="w-16 h-16 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-lg font-medium">No floor plan image</p>
          <p className="text-sm">Upload a floor plan image to start adding nodes</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-0 overflow-hidden ${isFullScreen ? 'fixed inset-0 z-50 rounded-none w-screen h-screen flex flex-col' : ''}`}>
      {/* Tool Panel */}
      {!readonly && (
        <ToolPanel
          currentMode={currentMode}
          onModeChange={(mode) => {
            setCurrentMode(mode);
            // Reset path test state when changing modes
            if (mode !== "pathTest") {
              setState((prev) => ({
                ...prev,
                pathTestStartNodeId: null,
                pathTestEndNodeId: null,
              }));
            }
            // Reset corridor drawing when changing modes
            if (mode !== "addCorridor") {
              setState((prev) => ({
                ...prev,
                corridorPoints: [],
                isDrawingCorridor: false,
              }));
            }
          }}
          edgeStartNodeId={state.edgeStartNodeId}
          pathTestStartNodeId={state.pathTestStartNodeId}
          isDrawingCorridor={state.isDrawingCorridor}
          onCancelEdgeCreation={() =>
            setState((prev) => ({
              ...prev,
              edgeStartNodeId: null,
              edgePreviewLine: null,
            }))
          }
          onCancelPathTest={() =>
            setState((prev) => ({
              ...prev,
              pathTestStartNodeId: null,
              pathTestEndNodeId: null,
            }))
          }
          onCancelCorridorCreation={() =>
            setState((prev) => ({
              ...prev,
              corridorPoints: [],
              isDrawingCorridor: false,
            }))
          }
          corridorPointsCount={state.corridorPoints.length}
          onFinishCorridor={() => {
            if (state.corridorPoints.length >= 2 && onCorridorCreate) {
              onCorridorCreate(state.corridorPoints);
              setState((prev) => ({
                ...prev,
                corridorPoints: [],
                isDrawingCorridor: false,
              }));
            }
          }}
          zoomLevel={zoomLevel}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomReset={handleZoomReset}
          isFullScreen={isFullScreen}
          onToggleFullScreen={toggleFullScreen}
          nodeSize={nodeSize}
          onNodeSizeChange={setNodeSize}
          visibleNodeTypes={visibleNodeTypes}
          onToggleNodeType={toggleNodeType}
          showLabels={showLabels}
          onToggleLabels={() => setShowLabels((prev) => !prev)}
          onSelectAllNodeTypes={selectAllNodeTypes}
          onDeselectAllNodeTypes={deselectAllNodeTypes}
        />
      )}

      {/* Canvas */}
      <div
        ref={containerRef}
        className={`bg-gray-100 p-4 focus:outline-none ${isFullScreen ? 'flex-1 w-full h-full overflow-hidden flex items-center justify-center' : 'w-full overflow-hidden'}`}
        style={{
          cursor: isPanning ? 'grabbing' : (isSpacePressed || currentMode === 'view' ? 'grab' : 'default')
        }}
        onMouseDown={handlePanStart}
        onMouseMove={handlePanMove}
        onMouseUp={handlePanEnd}
        onMouseLeave={handlePanEnd}
        tabIndex={0} // Make focusable for keyboard events
      >
        <NativeCanvas
          floor={floor}
          nodes={nodes}
          edges={edges}
          corridors={corridors}
          image={image}
          dimensions={dimensions}
          state={state}
          currentMode={currentMode}
          nodesMap={nodesMap}
          highlightPathSet={highlightPathSet}
          readonly={readonly}
          showEdges={showEdges}
          showCorridors={showCorridors}
          showLabels={showLabels}
          showCrossFloorIndicators={showCrossFloorIndicators}
          zoomLevel={zoomLevel}
          panOffset={panOffset}
          onZoomChange={setZoomLevel}
          onStateChange={setState}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          onNodePositionChange={onNodePositionChange}
          onNodeCreate={onNodeCreate}
          onEdgeClick={onEdgeClick}
          onEdgeDoubleClick={onEdgeDoubleClick}
          onEdgeCreate={onEdgeCreate}
          onCorridorClick={onCorridorClick}
          onCorridorCreate={onCorridorCreate}
          onPathTest={onPathTest}
          nodeSize={nodeSize}
          visibleNodeTypes={visibleNodeTypes}
        />
      </div>

      {/* Info bar */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-sm text-gray-600 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>
            <strong>{nodes.length}</strong> nodes
          </span>
          <span>
            <strong>{floorEdges.length}</strong> edges
          </span>
          {highlightPath.length > 0 && (
            <span className="text-green-600">
              <strong>{highlightPath.length}</strong> nodes in path
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {currentMode === "addEdge" && state.edgeStartNodeId && (
            <span className="text-blue-600">
              Select second node to create edge
            </span>
          )}
          {currentMode === "addNode" && (
            <span className="text-blue-600">Click on canvas to add node</span>
          )}
        </div>
      </div>
    </Card>
  );
}

export default FloorPlanEditor;
