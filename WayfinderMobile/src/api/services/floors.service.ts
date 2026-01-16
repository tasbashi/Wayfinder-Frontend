import { get } from "../client";
import { ENDPOINTS } from "@/config/api.config";
import type { Floor } from "@/types";

/**
 * Get all floors
 */
export const getFloors = async (): Promise<Floor[]> => {
    return get<Floor[]>(ENDPOINTS.floors);
};

/**
 * Get floor by ID
 */
export const getFloorById = async (id: string): Promise<Floor> => {
    return get<Floor>(ENDPOINTS.floorById(id));
};

/**
 * Get floors by building ID
 */
export const getFloorsByBuildingId = async (buildingId: string): Promise<Floor[]> => {
    return get<Floor[]>(ENDPOINTS.floorsByBuilding(buildingId));
};
