"use client";

import { useRef, useEffect, useCallback, useMemo, useState } from "react";
import { NodeDto, NodeType } from "@/types/node.types";
import { EdgeDto } from "@/types/edge.types";
import { FloorDto } from "@/types/floor.types";
import { Corridor, PathPoint } from "@/types/corridor.types";
import { getNodeTypeInfo } from "@/utils/nodeTypeUtils";
import { getEdgeTypeInfo, isCrossFloorEdge } from "@/utils/edgeTypeUtils";
import { EditorState, EditorMode, CanvasDimensions } from "./types";

interface NativeCanvasProps {
  floor: FloorDto;
  nodes: NodeDto[];
  edges: EdgeDto[];
  corridors?: Corridor[];
  image: HTMLImageElement | null;
  dimensions: CanvasDimensions;
  state: EditorState;
  currentMode: EditorMode;
  nodesMap: Map<string, NodeDto>;
  highlightPathSet: Set<string>;
  readonly: boolean;
  showEdges: boolean;
  showLabels: boolean;
  showCorridors?: boolean;
  showCrossFloorIndicators: boolean;
  zoomLevel: number;
  panOffset: { x: number; y: number };
  onZoomChange?: (newZoom: number) => void;
  onStateChange: (updater: (prev: EditorState) => EditorState) => void;
  onNodeClick?: (nodeId: string) => void;
  onNodeDoubleClick?: (nodeId: string) => void;
  onNodePositionChange?: (nodeId: string, x: number, y: number) => void;
  onNodeCreate?: (position: { x: number; y: number }) => void;
  onEdgeClick?: (edgeId: string) => void;
  onEdgeDoubleClick?: (edgeId: string) => void;
  onEdgeCreate?: (nodeAId: string, nodeBId: string) => void;
  onCorridorClick?: (corridorId: string) => void;
  onCorridorCreate?: (pathPoints: PathPoint[]) => void;
  onPathTest?: (startNodeId: string, endNodeId: string) => void;
  nodeSize: number;
  visibleNodeTypes: Set<NodeType>;
}

export function NativeCanvas({
  floor,
  nodes,
  edges,
  corridors = [],
  image,
  dimensions,
  state,
  currentMode,
  nodesMap,
  highlightPathSet,
  readonly,
  showEdges,
  showLabels,
  showCorridors = true,
  showCrossFloorIndicators,
  zoomLevel,
  panOffset,
  onZoomChange,
  onStateChange,
  onNodeClick,
  onNodeDoubleClick,
  onNodePositionChange,
  onNodeCreate,
  onEdgeClick,
  onEdgeDoubleClick,
  onEdgeCreate,
  onCorridorClick,
  onCorridorCreate,
  onPathTest,
  nodeSize,
  visibleNodeTypes,
}: NativeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [draggedNodeStart, setDraggedNodeStart] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);

  // Get edges for current floor
  const floorEdges = useMemo(() => {
    const floorNodeIds = new Set(nodes.map((n) => n.id));
    return edges.filter(
      (edge) => floorNodeIds.has(edge.nodeAId) || floorNodeIds.has(edge.nodeBId)
    );
  }, [edges, nodes]);

  // Helper to convert screen coordinates to canvas coordinates (accounting for zoom/pan)
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number) => {
      return {
        x: (screenX - panOffset.x) / zoomLevel,
        y: (screenY - panOffset.y) / zoomLevel,
      };
    },
    [zoomLevel, panOffset]
  );

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width * zoomLevel, dimensions.height * zoomLevel);

    // Apply zoom and pan transforms
    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoomLevel, zoomLevel);

    // Draw floor plan image
    if (image) {
      ctx.drawImage(image, 0, 0, dimensions.width, dimensions.height);
    }

    // Draw edges
    if (showEdges) {
      floorEdges.forEach((edge) => {
        const nodeA = nodesMap.get(edge.nodeAId);
        const nodeB = nodesMap.get(edge.nodeBId);

        if (!nodeA || !nodeB) return;

        // Skip edge if either node is hidden
        if (visibleNodeTypes && (!visibleNodeTypes.has(nodeA.nodeType as any) || !visibleNodeTypes.has(nodeB.nodeType as any))) return;

        const edgeInfo = getEdgeTypeInfo(edge.edgeType);
        const crossFloor = isCrossFloorEdge(nodeA.floorId, nodeB.floorId);
        const isSelected = state.selectedEdgeId === edge.id;
        const isHovered = state.hoveredEdgeId === edge.id;
        const isHighlighted =
          highlightPathSet.has(edge.nodeAId) && highlightPathSet.has(edge.nodeBId);

        const x1 = nodeA.x * dimensions.scale;
        const y1 = nodeA.y * dimensions.scale;
        const x2 = nodeB.x * dimensions.scale;
        const y2 = nodeB.y * dimensions.scale;

        const isNodeAOnThisFloor = nodeA.floorId === floor.id;
        const isNodeBOnThisFloor = nodeB.floorId === floor.id;

        if (!isNodeAOnThisFloor && !isNodeBOnThisFloor) return;

        // Draw edge line
        ctx.beginPath();
        if (isNodeAOnThisFloor && isNodeBOnThisFloor) {
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
        } else if (isNodeAOnThisFloor) {
          ctx.moveTo(x1, y1);
          ctx.lineTo(x1 + (x2 - x1) * 0.3, y1 + (y2 - y1) * 0.3);
        } else {
          ctx.moveTo(x2 + (x1 - x2) * 0.3, y2 + (y1 - y2) * 0.3);
          ctx.lineTo(x2, y2);
        }

        // Set style
        ctx.strokeStyle = isHighlighted
          ? "#10B981"
          : isSelected
            ? "#3B82F6"
            : isHovered
              ? edgeInfo.hexColor
              : crossFloor
                ? "#EF4444"
                : edgeInfo.hexColor;

        ctx.lineWidth =
          (isSelected || isHovered ? edgeInfo.strokeWidth + 1 : edgeInfo.strokeWidth) *
          (isHighlighted ? 1.5 : 1);

        if (crossFloor || edgeInfo.dashArray.length > 0) {
          ctx.setLineDash(crossFloor ? [10, 5] : edgeInfo.dashArray);
        } else {
          ctx.setLineDash([]);
        }

        ctx.globalAlpha = isSelected || isHovered || isHighlighted ? 1 : 0.7;
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.setLineDash([]);

        // Cross-floor indicator
        if (crossFloor && showCrossFloorIndicators && isNodeAOnThisFloor) {
          ctx.fillStyle = "#EF4444";
          ctx.beginPath();
          ctx.arc(x1 + (x2 - x1) * 0.15, y1 + (y2 - y1) * 0.15, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 1;
          ctx.stroke();

          // Icon
          ctx.fillStyle = "#fff";
          ctx.font = "10px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(edgeInfo.icon, x1 + (x2 - x1) * 0.15, y1 + (y2 - y1) * 0.15);
        }

        // Accessibility indicator
        if (!edge.isAccessible) {
          ctx.fillStyle = "#FEF3C7";
          ctx.strokeStyle = "#F59E0B";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc((x1 + x2) / 2, (y1 + y2) / 2, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      });
    }

    // Draw corridors (existing corridors as thick purple polylines)
    if (showCorridors && corridors.length > 0) {
      corridors.forEach((corridor) => {
        if (corridor.pathPoints.length < 2) return;

        const isSelected = state.selectedCorridorId === corridor.id;
        const isHovered = state.hoveredCorridorId === corridor.id;

        ctx.beginPath();
        const startX = corridor.pathPoints[0].x * dimensions.scale;
        const startY = corridor.pathPoints[0].y * dimensions.scale;
        ctx.moveTo(startX, startY);

        for (let i = 1; i < corridor.pathPoints.length; i++) {
          const px = corridor.pathPoints[i].x * dimensions.scale;
          const py = corridor.pathPoints[i].y * dimensions.scale;
          ctx.lineTo(px, py);
        }

        // Corridor style - thick purple line
        ctx.strokeStyle = isSelected ? "#7C3AED" : isHovered ? "#8B5CF6" : "#A78BFA";
        ctx.lineWidth = (corridor.width || 2) * 3 * (isSelected || isHovered ? 1.3 : 1);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.globalAlpha = isSelected || isHovered ? 1 : 0.7;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Draw corridor points for selected corridor
        if (isSelected || isHovered) {
          corridor.pathPoints.forEach((point, index) => {
            const px = point.x * dimensions.scale;
            const py = point.y * dimensions.scale;

            ctx.fillStyle = index === 0 ? "#22C55E" : index === corridor.pathPoints.length - 1 ? "#EF4444" : "#7C3AED";
            ctx.beginPath();
            ctx.arc(px, py, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1;
            ctx.stroke();
          });
        }

        // Corridor name label
        if (showLabels && corridor.name) {
          const midIndex = Math.floor(corridor.pathPoints.length / 2);
          const labelX = corridor.pathPoints[midIndex].x * dimensions.scale;
          const labelY = corridor.pathPoints[midIndex].y * dimensions.scale;

          ctx.fillStyle = "rgba(139, 92, 246, 0.9)";
          const textWidth = ctx.measureText(corridor.name).width;
          ctx.fillRect(labelX - textWidth / 2 - 4, labelY - 20, textWidth + 8, 14);

          ctx.fillStyle = "#ffffff";
          ctx.font = "10px system-ui";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(corridor.name, labelX, labelY - 13);
        }
      });
    }

    // Draw edge preview
    if (state.edgePreviewLine) {
      ctx.beginPath();
      ctx.moveTo(state.edgePreviewLine.x1, state.edgePreviewLine.y1);
      ctx.lineTo(state.edgePreviewLine.x2, state.edgePreviewLine.y2);
      ctx.strokeStyle = "#3B82F6";
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.globalAlpha = 0.7;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.setLineDash([]);
    }

    // Draw corridor drawing preview (in-progress corridor points)
    if (state.isDrawingCorridor && state.corridorPoints.length > 0) {
      ctx.beginPath();
      const startX = state.corridorPoints[0].x * dimensions.scale;
      const startY = state.corridorPoints[0].y * dimensions.scale;
      ctx.moveTo(startX, startY);

      for (let i = 1; i < state.corridorPoints.length; i++) {
        const px = state.corridorPoints[i].x * dimensions.scale;
        const py = state.corridorPoints[i].y * dimensions.scale;
        ctx.lineTo(px, py);
      }

      // Preview style - dashed purple line
      ctx.strokeStyle = "#8B5CF6";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.setLineDash([8, 4]);
      ctx.globalAlpha = 0.8;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.setLineDash([]);

      // Draw points
      state.corridorPoints.forEach((point, index) => {
        const px = point.x * dimensions.scale;
        const py = point.y * dimensions.scale;

        ctx.fillStyle = index === 0 ? "#22C55E" : "#8B5CF6";
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Hint text near first point
      if (state.corridorPoints.length === 1) {
        const firstX = state.corridorPoints[0].x * dimensions.scale;
        const firstY = state.corridorPoints[0].y * dimensions.scale;
        ctx.fillStyle = "rgba(139, 92, 246, 0.9)";
        const hintText = "Double-click to finish";
        const textWidth = ctx.measureText(hintText).width;
        ctx.fillRect(firstX - textWidth / 2 - 4, firstY + 15, textWidth + 8, 14);
        ctx.fillStyle = "#ffffff";
        ctx.font = "10px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(hintText, firstX, firstY + 22);
      }
    }

    // Draw nodes
    nodes.forEach((node) => {
      // Filter hidden nodes
      if (visibleNodeTypes && !visibleNodeTypes.has(node.nodeType as any)) return;

      const nodeInfo = getNodeTypeInfo(node.nodeType);
      const isSelected = state.selectedNodeId === node.id;
      const isHovered = state.hoveredNodeId === node.id;
      const isDragging = state.draggedNodeId === node.id;
      const isEdgeStart = state.edgeStartNodeId === node.id;
      const isHighlighted = highlightPathSet.has(node.id);
      const isPathTestStart = state.pathTestStartNodeId === node.id;
      const isPathTestEnd = state.pathTestEndNodeId === node.id;

      const x = node.x * dimensions.scale;
      const y = node.y * dimensions.scale;

      // Calculate radius based on nodeSize prop
      // Increase slightly for interactions
      const baseRadius = nodeSize;
      const radius = isDragging ? baseRadius * 1.2 : isSelected || isHovered || isPathTestStart || isPathTestEnd ? baseRadius * 1.1 : baseRadius;

      // Path test start/end indicator
      if (isPathTestStart || isPathTestEnd) {
        ctx.strokeStyle = isPathTestStart ? "#22C55E" : "#EF4444"; // Green for start, Red for end
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
        ctx.stroke();

        // Label
        ctx.fillStyle = isPathTestStart ? "#22C55E" : "#EF4444";
        ctx.font = "bold 10px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(isPathTestStart ? "START" : "END", x, y - radius - 8);
      }

      // Selection/highlight ring
      if ((isSelected || isEdgeStart) && !isPathTestStart && !isPathTestEnd) {
        ctx.strokeStyle = isEdgeStart ? "#10B981" : "#3B82F6";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 2]);
        ctx.beginPath();
        ctx.arc(x, y, radius + 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (isHighlighted && !isSelected && !isPathTestStart && !isPathTestEnd) {
        ctx.strokeStyle = "#10B981";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, radius + 3, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Node circle - Modern Flat Look
      ctx.fillStyle = isPathTestStart ? "#22C55E" : isPathTestEnd ? "#EF4444" : nodeInfo.hexColor;
      // Add a clean white border to make it pop
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;

      // No shadow for flat modern look
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // No icon text for modern basic look
      // Just the clean colored circle

      // Node label
      if (showLabels && node.name && !isPathTestStart && !isPathTestEnd) {
        const labelText = node.name.length > 12 ? node.name.slice(0, 10) + "..." : node.name;

        // Label background
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        const textWidth = ctx.measureText(labelText).width;
        ctx.fillRect(x - textWidth / 2 - 4, y - radius - 18, textWidth + 8, 14);

        // Label text
        ctx.fillStyle = "#374151";
        ctx.font = "10px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(labelText, x, y - radius - 11);
      }
    });

    // Restore canvas context after drawing
    ctx.restore();
  }, [
    image,
    nodes,
    edges,
    corridors,
    dimensions,
    state,
    floorEdges,
    nodesMap,
    highlightPathSet,
    showEdges,
    showLabels,
    showCorridors,
    showCrossFloorIndicators,
    floor.id,
    zoomLevel,
    panOffset,
    visibleNodeTypes,
    nodeSize,
  ]);

  // Mouse handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;

      // Transform screen coordinates to canvas coordinates (accounting for zoom/pan)
      const { x, y } = screenToCanvas(screenX, screenY);

      // Check if clicked on a node
      let clickedNode: NodeDto | null = null;
      for (const node of nodes) {
        // Skip hidden nodes
        if (visibleNodeTypes && !visibleNodeTypes.has(node.nodeType as any)) continue;

        const nx = node.x * dimensions.scale;
        const ny = node.y * dimensions.scale;
        const radius = 10;
        const dist = Math.sqrt((x - nx) ** 2 + (y - ny) ** 2);
        if (dist <= radius) {
          clickedNode = node;
          break;
        }
      }

      if (clickedNode) {
        if (currentMode === "pathTest") {
          // Path testing mode - select start, then end node
          if (state.pathTestStartNodeId === null) {
            // First click - select start node
            onStateChange((prev) => ({
              ...prev,
              pathTestStartNodeId: clickedNode!.id,
              pathTestEndNodeId: null,
              selectedNodeId: clickedNode!.id,
            }));
          } else if (state.pathTestStartNodeId !== clickedNode.id) {
            // Second click - select end node and trigger path calculation
            onStateChange((prev) => ({
              ...prev,
              pathTestEndNodeId: clickedNode!.id,
            }));
            onPathTest?.(state.pathTestStartNodeId, clickedNode.id);
          }
        } else if (currentMode === "addEdge") {
          if (state.edgeStartNodeId === null) {
            onStateChange((prev) => ({ ...prev, edgeStartNodeId: clickedNode!.id }));
          } else if (state.edgeStartNodeId !== clickedNode.id) {
            onEdgeCreate?.(state.edgeStartNodeId, clickedNode.id);
            onStateChange((prev) => ({
              ...prev,
              edgeStartNodeId: null,
              edgePreviewLine: null,
            }));
          }
        } else {
          onStateChange((prev) => ({
            ...prev,
            selectedNodeId: clickedNode!.id,
            selectedEdgeId: null,
          }));
          onNodeClick?.(clickedNode.id);

          // Start dragging
          if (!readonly && (currentMode === "select" || currentMode === "editNode")) {
            setDraggedNodeStart({
              id: clickedNode.id,
              offsetX: x - clickedNode.x * dimensions.scale,
              offsetY: y - clickedNode.y * dimensions.scale,
            });
          }
        }
      } else if (currentMode === "addNode" && !readonly) {
        const actualX = Math.round(x / dimensions.scale);
        const actualY = Math.round(y / dimensions.scale);
        onNodeCreate?.({ x: actualX, y: actualY });
      } else if (currentMode === "addCorridor" && !readonly) {
        // Corridor drawing mode - add point to path
        const actualX = Math.round(x / dimensions.scale);
        const actualY = Math.round(y / dimensions.scale);

        onStateChange((prev) => ({
          ...prev,
          isDrawingCorridor: true,
          corridorPoints: [...prev.corridorPoints, { x: actualX, y: actualY }],
        }));
      } else {
        onStateChange((prev) => ({
          ...prev,
          selectedNodeId: null,
          selectedEdgeId: null,
          selectedCorridorId: null,
          edgeStartNodeId: null,
          edgePreviewLine: null,
          pathTestStartNodeId: currentMode === "pathTest" ? prev.pathTestStartNodeId : null,
          pathTestEndNodeId: currentMode === "pathTest" ? prev.pathTestEndNodeId : null,
        }));
      }
    },
    [
      nodes,
      dimensions,
      currentMode,
      state.edgeStartNodeId,
      state.pathTestStartNodeId,
      readonly,
      onStateChange,
      onNodeClick,
      onEdgeCreate,
      onNodeCreate,
      onPathTest,
      screenToCanvas,
      visibleNodeTypes,
    ]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;

      // Transform screen coordinates to canvas coordinates
      const { x, y } = screenToCanvas(screenX, screenY);

      setMousePos({ x, y });

      // Handle node dragging
      if (draggedNodeStart && !readonly) {
        const actualX = Math.round((x - draggedNodeStart.offsetX / zoomLevel) / dimensions.scale);
        const actualY = Math.round((y - draggedNodeStart.offsetY / zoomLevel) / dimensions.scale);

        onStateChange((prev) => ({ ...prev, draggedNodeId: draggedNodeStart.id }));

        // Update position temporarily for visual feedback
        const node = nodes.find(n => n.id === draggedNodeStart.id);
        if (node) {
          node.x = actualX;
          node.y = actualY;
        }

        return;
      }

      // Edge preview
      if (currentMode === "addEdge" && state.edgeStartNodeId) {
        const startNode = nodesMap.get(state.edgeStartNodeId);
        if (startNode) {
          onStateChange((prev) => ({
            ...prev,
            edgePreviewLine: {
              x1: startNode.x * dimensions.scale,
              y1: startNode.y * dimensions.scale,
              x2: x,
              y2: y,
            },
          }));
        }
      }

      // Hover detection
      let hoveredNode: NodeDto | null = null;
      for (const node of nodes) {
        // Skip hidden nodes
        if (visibleNodeTypes && !visibleNodeTypes.has(node.nodeType as any)) continue;

        const nx = node.x * dimensions.scale;
        const ny = node.y * dimensions.scale;
        const dist = Math.sqrt((x - nx) ** 2 + (y - ny) ** 2);
        if (dist <= 10) {
          hoveredNode = node;
          break;
        }
      }

      onStateChange((prev) => ({
        ...prev,
        hoveredNodeId: hoveredNode?.id || null,
      }));
    },
    [
      draggedNodeStart,
      readonly,
      currentMode,
      state.edgeStartNodeId,
      nodes,
      nodesMap,
      dimensions,
      onStateChange,
      screenToCanvas,
      zoomLevel,
      visibleNodeTypes,
    ]
  );

  const handleMouseUp = useCallback(() => {
    if (draggedNodeStart) {
      const node = nodes.find(n => n.id === draggedNodeStart.id);
      if (node) {
        onNodePositionChange?.(node.id, node.x, node.y);
      }
      setDraggedNodeStart(null);
      onStateChange((prev) => ({ ...prev, draggedNodeId: null, isDragging: false }));
    }
  }, [draggedNodeStart, nodes, onNodePositionChange, onStateChange]);

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;

      // Transform screen coordinates to canvas coordinates
      const { x, y } = screenToCanvas(screenX, screenY);

      // Find clicked node
      for (const node of nodes) {
        // Skip hidden nodes
        if (visibleNodeTypes && !visibleNodeTypes.has(node.nodeType as any)) continue;

        const nx = node.x * dimensions.scale;
        const ny = node.y * dimensions.scale;
        const dist = Math.sqrt((x - nx) ** 2 + (y - ny) ** 2);
        if (dist <= 12) {
          onNodeDoubleClick?.(node.id);
          return;
        }
      }

      // Find clicked edge (if no node was clicked)
      const floorNodeIds = new Set(nodes.map((n) => n.id));
      for (const edge of edges) {
        if (!floorNodeIds.has(edge.nodeAId) && !floorNodeIds.has(edge.nodeBId)) continue;

        const nodeA = nodesMap.get(edge.nodeAId);
        const nodeB = nodesMap.get(edge.nodeBId);
        if (!nodeA || !nodeB) continue;

        // Skip edge if either node is hidden
        if (visibleNodeTypes && (!visibleNodeTypes.has(nodeA.nodeType as any) || !visibleNodeTypes.has(nodeB.nodeType as any))) continue;

        const x1 = nodeA.x * dimensions.scale;
        const y1 = nodeA.y * dimensions.scale;
        const x2 = nodeB.x * dimensions.scale;
        const y2 = nodeB.y * dimensions.scale;

        // Check distance to line segment
        const dist = distToSegment(x, y, x1, y1, x2, y2);
        if (dist <= 8) {
          onEdgeDoubleClick?.(edge.id);
          return;
        }
      }

      // Complete corridor drawing on double-click (if in addCorridor mode)
      if (currentMode === "addCorridor" && state.isDrawingCorridor && state.corridorPoints.length >= 2) {
        // Create corridor with collected points
        onCorridorCreate?.(state.corridorPoints);

        // Reset corridor drawing state
        onStateChange((prev) => ({
          ...prev,
          corridorPoints: [],
          isDrawingCorridor: false,
        }));
      }
    },
    [nodes, edges, nodesMap, dimensions, onNodeDoubleClick, onEdgeDoubleClick, screenToCanvas, visibleNodeTypes, currentMode, state.isDrawingCorridor, state.corridorPoints, onCorridorCreate, onStateChange]
  );

  // Helper: distance from point to line segment
  function distToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSq = dx * dx + dy * dy;

    if (lengthSq === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);

    let t = ((px - x1) * dx + (py - y1) * dy) / lengthSq;
    t = Math.max(0, Math.min(1, t));

    const nearestX = x1 + t * dx;
    const nearestY = y1 + t * dy;

    return Math.sqrt((px - nearestX) ** 2 + (py - nearestY) ** 2);
  }

  const cursorStyle = currentMode === "addNode" || currentMode === "addCorridor" ? "crosshair" : draggedNodeStart ? "move" : "default";

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width * zoomLevel + Math.abs(panOffset.x)}
      height={dimensions.height * zoomLevel + Math.abs(panOffset.y)}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      style={{ cursor: cursorStyle, display: "block" }}
      className="border border-gray-200"
    />
  );
}

export default NativeCanvas;

