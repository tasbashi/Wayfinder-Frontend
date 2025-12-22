/**
 * Represents the type of connection between two nodes
 */
export enum EdgeType {
  /** Normal walking path (corridor, room-to-room) */
  Walking = "Walking",
  /** Staircase connection between floors */
  Stairs = "Stairs",
  /** Elevator connection between floors */
  Elevator = "Elevator",
  /** Special transition (e.g., escalator, moving walkway) */
  Transition = "Transition",
}

export interface EdgeDto {
  id: string;
  nodeAId: string;
  nodeBId: string;
  weight: number;
  edgeType: EdgeType;
  isAccessible: boolean;
}

export interface CreateEdgeCommand {
  nodeAId: string;
  nodeBId: string;
  weight: number;
  edgeType?: EdgeType; // Default: Walking
  isAccessible?: boolean; // Default: true
}

export interface UpdateEdgeCommand {
  id: string;
  nodeAId: string;
  nodeBId: string;
  weight: number;
  edgeType: EdgeType;
  isAccessible: boolean;
}

