import { post } from "../client";
import { ENDPOINTS } from "@/config/api.config";
import type { PathResult, RouteRequest } from "@/types";

/**
 * Calculate route between two nodes
 */
export const calculateRoute = async (request: RouteRequest): Promise<PathResult> => {
    return post<PathResult, RouteRequest>(ENDPOINTS.calculateRoute, request);
};
