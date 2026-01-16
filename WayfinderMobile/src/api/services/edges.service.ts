import { get } from "../client";
import { ENDPOINTS } from "@/config/api.config";
import type { Edge } from "@/types";

/**
 * Get all edges
 */
export const getEdges = async (): Promise<Edge[]> => {
    return get<Edge[]>(ENDPOINTS.edges);
};

/**
 * Get edges by floor ID
 */
export const getEdgesByFloorId = async (floorId: string): Promise<Edge[]> => {
    return get<Edge[]>(ENDPOINTS.edgesByFloor(floorId));
};
