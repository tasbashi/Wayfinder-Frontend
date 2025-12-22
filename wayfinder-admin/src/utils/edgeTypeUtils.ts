import { EdgeType } from "@/types/edge.types";

/**
 * Edge type display information
 */
export interface EdgeTypeInfo {
  label: string;
  color: string;
  strokeColor: string;
  hexColor: string;
  dashArray: number[];
  strokeWidth: number;
  icon: string;
  description: string;
}

/**
 * Get display information for an edge type
 */
export function getEdgeTypeInfo(edgeType: EdgeType | string): EdgeTypeInfo {
  const type = typeof edgeType === "string" ? edgeType : EdgeType[edgeType];

  switch (type) {
    case EdgeType.Walking:
    case "Walking":
      return {
        label: "Walking Path",
        color: "#6B7280", // Gray
        strokeColor: "#6B7280",
        hexColor: "#6B7280",
        dashArray: [],
        strokeWidth: 2,
        icon: "🚶",
        description: "Normal walking corridor or room connection",
      };

    case EdgeType.Stairs:
    case "Stairs":
      return {
        label: "Stairs",
        color: "#F59E0B", // Amber
        strokeColor: "#F59E0B",
        hexColor: "#F59E0B",
        dashArray: [8, 4],
        strokeWidth: 3,
        icon: "🪜",
        description: "Staircase connection between floors",
      };

    case EdgeType.Elevator:
    case "Elevator":
      return {
        label: "Elevator",
        color: "#8B5CF6", // Purple
        strokeColor: "#8B5CF6",
        hexColor: "#8B5CF6",
        dashArray: [],
        strokeWidth: 4,
        icon: "🛗",
        description: "Elevator connection between floors",
      };

    case EdgeType.Transition:
    case "Transition":
      return {
        label: "Transition",
        color: "#06B6D4", // Cyan
        strokeColor: "#06B6D4",
        hexColor: "#06B6D4",
        dashArray: [4, 2],
        strokeWidth: 3,
        icon: "↗️",
        description: "Escalator, moving walkway, or special passage",
      };

    default:
      return {
        label: "Unknown",
        color: "#9CA3AF",
        strokeColor: "#9CA3AF",
        hexColor: "#9CA3AF",
        dashArray: [],
        strokeWidth: 2,
        icon: "❓",
        description: "Unknown connection type",
      };
  }
}

/**
 * Get all edge types for selection UI
 */
export function getAllEdgeTypes(): { value: EdgeType; info: EdgeTypeInfo }[] {
  return [
    { value: EdgeType.Walking, info: getEdgeTypeInfo(EdgeType.Walking) },
    { value: EdgeType.Stairs, info: getEdgeTypeInfo(EdgeType.Stairs) },
    { value: EdgeType.Elevator, info: getEdgeTypeInfo(EdgeType.Elevator) },
    { value: EdgeType.Transition, info: getEdgeTypeInfo(EdgeType.Transition) },
  ];
}

/**
 * Check if edge connects nodes on different floors (cross-floor edge)
 */
export function isCrossFloorEdge(
  nodeAFloorId: string,
  nodeBFloorId: string
): boolean {
  return nodeAFloorId !== nodeBFloorId;
}

/**
 * Suggest edge type based on connected nodes
 */
export function suggestEdgeType(
  nodeAFloorId: string,
  nodeBFloorId: string,
  nodeAType?: number | string,
  nodeBType?: number | string
): EdgeType {
  // Same floor = Walking
  if (nodeAFloorId === nodeBFloorId) {
    return EdgeType.Walking;
  }

  // Cross-floor: check node types
  const isElevator = (type: number | string | undefined) =>
    type === 2 || type === "Elevator";
  const isStairs = (type: number | string | undefined) =>
    type === 3 || type === "Stairs";

  if (isElevator(nodeAType) || isElevator(nodeBType)) {
    return EdgeType.Elevator;
  }

  if (isStairs(nodeAType) || isStairs(nodeBType)) {
    return EdgeType.Stairs;
  }

  // Default for cross-floor: Transition
  return EdgeType.Transition;
}

/**
 * Suggest accessibility based on edge type
 */
export function suggestAccessibility(edgeType: EdgeType): boolean {
  switch (edgeType) {
    case EdgeType.Stairs:
      return false; // Stairs typically not accessible
    case EdgeType.Elevator:
      return true; // Elevators are accessible
    case EdgeType.Walking:
    case EdgeType.Transition:
    default:
      return true; // Walking paths and transitions are typically accessible
  }
}

/**
 * Calculate suggested weight based on edge type and floor difference
 */
export function suggestWeight(
  edgeType: EdgeType,
  floorDifference: number = 0,
  distance: number = 0
): number {
  const absFloorDiff = Math.abs(floorDifference);

  switch (edgeType) {
    case EdgeType.Walking:
      // Weight = actual distance (or minimum 1)
      return Math.max(distance, 1);

    case EdgeType.Stairs:
      // ~50 units per floor (stairs are slow)
      return absFloorDiff * 50 + 10;

    case EdgeType.Elevator:
      // ~30 units per floor (faster than stairs)
      return absFloorDiff * 30 + 5;

    case EdgeType.Transition:
      // ~20 units per floor (escalators are fast)
      return absFloorDiff * 20 + 5;

    default:
      return distance || 10;
  }
}

