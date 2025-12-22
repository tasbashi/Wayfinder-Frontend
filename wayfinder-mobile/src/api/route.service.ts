import { Platform } from "react-native";
import { apiClient } from "./client";
import { PathResult } from "../types/route.types";
import { ServiceResponse } from "../types/api.types";
import NetInfo from "@react-native-community/netinfo";

// Check if we're on a native platform (not web)
const isNative = Platform.OS !== "web";

export class RouteService {
  /**
   * Calculate route between two nodes
   * Automatically falls back to offline calculation if network is unavailable (mobile only)
   */
  static async calculateRoute(
    startNodeId: string,
    endNodeId: string,
    requireAccessible = false,
    buildingId?: string
  ): Promise<PathResult> {
    // Check network status
    const networkState = await NetInfo.fetch();
    const isOnline = networkState.isConnected ?? true; // Default to true on web

    // If offline and on native platform, use cached data
    if (!isOnline && isNative) {
      console.log("Offline mode: Using cached data for route calculation");
      const { OfflineRouteService } = await import("../services/offlineRouteService");
      return OfflineRouteService.calculateRoute(
        startNodeId,
        endNodeId,
        requireAccessible,
        buildingId
      );
    }

    // Online: Use API
    try {
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
        // Normalize path with proper field names
        const normalizedPath = (result.path ?? []).map((node: any) => ({
          nodeId: node.nodeId,
          name: node.name || node.nodeName,
          nodeName: node.name || node.nodeName, // Alias for backward compatibility
          nodeType: node.nodeType,
          x: node.x,
          y: node.y,
          floorId: node.floorId,
          floorName: node.floorName,
          instruction: node.instruction ?? '',
          distanceFromPrevious: node.distanceFromPrevious ?? 0,
          corridorPathPoints: node.corridorPathPoints ?? null, // Include corridor path geometry
        }));

        // Derive instructions array from path
        const instructions = normalizedPath.map((node: any) => node.instruction).filter((i: string) => i);

        return {
          pathFound: result.pathFound ?? false,
          totalDistance: result.totalDistance ?? 0,
          estimatedTimeSeconds: result.estimatedTimeSeconds ?? 0,
          estimatedTimeMinutes: (result.estimatedTimeSeconds ?? 0) / 60,
          path: normalizedPath,
          instructions,
          errorMessage: result.errorMessage,
        };
      }

      throw new Error(
        response.data.data?.errorMessage ||
        response.data.errorMessage ||
        "No route found"
      );
    } catch (error) {
      // If API fails and we're on native platform, try offline as fallback
      if (isNative) {
        console.warn("API route calculation failed, trying offline:", error);
        try {
          const { OfflineRouteService } = await import("../services/offlineRouteService");
          return OfflineRouteService.calculateRoute(
            startNodeId,
            endNodeId,
            requireAccessible,
            buildingId
          );
        } catch (offlineError) {
          // Fall through to error below
        }
      }

      throw new Error(
        error instanceof Error ? error.message : "Failed to calculate route"
      );
    }
  }
}

