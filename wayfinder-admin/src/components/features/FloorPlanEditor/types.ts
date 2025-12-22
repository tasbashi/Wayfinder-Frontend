import { NodeDto, NodeType } from "@/types/node.types";
import { EdgeDto, EdgeType } from "@/types/edge.types";
import { FloorDto } from "@/types/floor.types";
import { Corridor, PathPoint } from "@/types/corridor.types";

/**
 * Editor modes
 */
export type EditorMode =
  | "view"         // Read-only viewing
  | "select"       // Select nodes/edges
  | "addNode"      // Click to add node
  | "addEdge"      // Click two nodes to connect
  | "addCorridor"  // Click to draw corridor polyline
  | "editNode"     // Edit selected node
  | "editEdge"     // Edit selected edge
  | "editCorridor" // Edit selected corridor
  | "pathTest";    // Test pathfinding

/**
 * Floor Plan Editor Props
 */
export interface FloorPlanEditorProps {
  // Data
  floor: FloorDto;
  nodes: NodeDto[];
  edges: EdgeDto[];
  corridors?: Corridor[];        // Corridor polylines
  allFloors?: FloorDto[];        // For cross-floor edge info
  allNodes?: NodeDto[];          // For cross-floor edge visualization

  // Mode & Selection
  mode?: EditorMode;
  selectedNodeId?: string | null;
  selectedEdgeId?: string | null;
  selectedCorridorId?: string | null;

  // Callbacks - Node operations
  onNodeClick?: (nodeId: string) => void;
  onNodeDoubleClick?: (nodeId: string) => void;
  onNodePositionChange?: (nodeId: string, x: number, y: number) => void;
  onNodeCreate?: (position: { x: number; y: number }) => void;
  onNodeDelete?: (nodeId: string) => void;

  // Callbacks - Edge operations
  onEdgeClick?: (edgeId: string) => void;
  onEdgeDoubleClick?: (edgeId: string) => void;
  onEdgeCreate?: (nodeAId: string, nodeBId: string) => void;
  onEdgeDelete?: (edgeId: string) => void;

  // Callbacks - Corridor operations
  onCorridorClick?: (corridorId: string) => void;
  onCorridorDoubleClick?: (corridorId: string) => void;
  onCorridorCreate?: (pathPoints: PathPoint[]) => void;
  onCorridorDelete?: (corridorId: string) => void;

  // Settings
  readonly?: boolean;
  showEdges?: boolean;
  showLabels?: boolean;
  showCorridors?: boolean;
  showCrossFloorIndicators?: boolean;
  highlightPath?: string[];      // Node IDs to highlight as path

  // Path testing
  onPathTest?: (startNodeId: string, endNodeId: string) => void;
}

/**
 * Internal editor state
 */
export interface EditorState {
  // Canvas state
  scale: number;
  position: { x: number; y: number };

  // Interaction state
  isDragging: boolean;
  draggedNodeId: string | null;
  hoveredNodeId: string | null;
  hoveredEdgeId: string | null;
  hoveredCorridorId: string | null;

  // Edge creation state
  edgeStartNodeId: string | null;
  edgePreviewLine: { x1: number; y1: number; x2: number; y2: number } | null;

  // Corridor creation state
  corridorPoints: PathPoint[];
  isDrawingCorridor: boolean;

  // Selection
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  selectedCorridorId: string | null;

  // Path testing state
  pathTestStartNodeId: string | null;
  pathTestEndNodeId: string | null;
}

/**
 * Node marker visual info
 */
export interface NodeMarkerInfo {
  id: string;
  x: number;
  y: number;
  name: string;
  nodeType: NodeType;
  isSelected: boolean;
  isHovered: boolean;
  isDragging: boolean;
  hasCrossFloorEdge: boolean;
  isHighlighted: boolean;
}

/**
 * Edge line visual info
 */
export interface EdgeLineInfo {
  id: string;
  nodeA: { x: number; y: number; floorId: string };
  nodeB: { x: number; y: number; floorId: string };
  edgeType: EdgeType;
  isAccessible: boolean;
  weight: number;
  isSelected: boolean;
  isHovered: boolean;
  isCrossFloor: boolean;
  isHighlighted: boolean;
}

/**
 * Corridor polyline visual info
 */
export interface CorridorLineInfo {
  id: string;
  name: string;
  points: PathPoint[];
  isAccessible: boolean;
  width: number;
  isSelected: boolean;
  isHovered: boolean;
}

/**
 * Canvas dimensions
 */
export interface CanvasDimensions {
  width: number;
  height: number;
  imageWidth: number;
  imageHeight: number;
  scale: number;
}

/**
 * Tooltip data
 */
export interface TooltipData {
  type: "node" | "edge" | "corridor";
  x: number;
  y: number;
  node?: NodeDto;
  edge?: EdgeDto;
  nodeA?: NodeDto;
  nodeB?: NodeDto;
  corridor?: Corridor;
}

/**
 * Context menu data
 */
export interface ContextMenuData {
  type: "node" | "edge" | "canvas" | "corridor";
  x: number;
  y: number;
  nodeId?: string;
  edgeId?: string;
  corridorId?: string;
  canvasPosition?: { x: number; y: number };
}

