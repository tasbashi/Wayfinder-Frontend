import { NodeType } from "./node.types";

export interface RouteNodeDto {
  nodeId: string;
  name?: string;
  nodeType: NodeType | string;
  x: number;
  y: number;
  floorId: string;
  floorName: string;
  instruction: string;
  distanceFromPrevious: number;
}

export interface PathResult {
  pathFound: boolean;
  totalDistance: number;
  estimatedTimeSeconds: number;
  path: RouteNodeDto[];
  errorMessage?: string;
}

