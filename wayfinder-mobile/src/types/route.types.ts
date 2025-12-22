import { NodeType } from "./node.types";

export interface PathPointDto {
  x: number;
  y: number;
}

export interface RouteNodeDto {
  nodeId: string;
  name?: string;
  nodeName?: string; // Alias for name - some APIs use nodeName
  nodeType: NodeType;
  x: number;
  y: number;
  floorId: string;
  floorName: string;
  instruction: string;
  distanceFromPrevious: number;
  corridorPathPoints?: PathPointDto[]; // Actual corridor geometry for visualization
}

export interface PathResult {
  pathFound: boolean;
  totalDistance: number;
  estimatedTimeSeconds: number;
  estimatedTimeMinutes?: number; // Derived from estimatedTimeSeconds
  path: RouteNodeDto[];
  instructions?: string[]; // Turn-by-turn instructions (derived from path)
  errorMessage?: string;
}

