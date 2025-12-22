import { apiClient } from "./client";
import { PathResult } from "../types/route.types";
import { ServiceResponse } from "../types/api.types";

export class RouteService {
  /**
   * Calculate route between two nodes
   */
  static async calculateRoute(
    startNodeId: string,
    endNodeId: string,
    requireAccessible = false
  ): Promise<PathResult> {
    const response = await apiClient.get<ServiceResponse<PathResult>>(
      "/api/routes/calculate",
      {
        params: {
          startNodeId,
          endNodeId,
          requireAccessible,
        },
      }
    );

    if (response.data.isSuccess && response.data.data) {
      const result = response.data.data;

      // Convert path nodes - handle both name formats for backward compatibility
      const normalizedPath = (result.path ?? []).map((node: any) => ({
        nodeId: node.nodeId,
        name: node.name || node.nodeName, // Support both formats
        nodeType: node.nodeType,
        x: node.x,
        y: node.y,
        floorId: node.floorId,
        floorName: node.floorName,
        instruction: node.instruction ?? '',
        distanceFromPrevious: node.distanceFromPrevious ?? 0,
      }));

      return {
        pathFound: result.pathFound ?? false,
        totalDistance: result.totalDistance ?? 0,
        estimatedTimeSeconds: result.estimatedTimeSeconds ?? 0,
        path: normalizedPath,
        errorMessage: result.errorMessage,
      };
    }

    throw new Error(
      response.data.data?.errorMessage ||
      response.data.errorMessage ||
      "No route found"
    );
  }
}

