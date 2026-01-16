import { get } from "../client";
import { ENDPOINTS } from "@/config/api.config";
import type { Building } from "@/types";

/**
 * Get all buildings
 */
export const getBuildings = async (): Promise<Building[]> => {
    return get<Building[]>(ENDPOINTS.buildings);
};

/**
 * Get building by ID
 */
export const getBuildingById = async (id: string): Promise<Building> => {
    return get<Building>(ENDPOINTS.buildingById(id));
};
