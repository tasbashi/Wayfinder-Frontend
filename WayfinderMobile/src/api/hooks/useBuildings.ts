import { useQuery } from "@tanstack/react-query";
import { getBuildings, getBuildingById } from "../services/buildings.service";
import { APP_CONFIG } from "@/config/app.config";
import type { Building } from "@/types";

/**
 * Query Keys
 */
export const buildingKeys = {
    all: ["buildings"] as const,
    lists: () => [...buildingKeys.all, "list"] as const,
    list: (filters: string) => [...buildingKeys.lists(), { filters }] as const,
    details: () => [...buildingKeys.all, "detail"] as const,
    detail: (id: string) => [...buildingKeys.details(), id] as const,
};

/**
 * Hook to fetch all buildings
 */
export const useBuildings = () => {
    return useQuery<Building[], Error>({
        queryKey: buildingKeys.lists(),
        queryFn: getBuildings,
        staleTime: APP_CONFIG.cache.buildingsStaleTime,
    });
};

/**
 * Hook to fetch a single building by ID
 */
export const useBuilding = (id: string | undefined) => {
    return useQuery<Building, Error>({
        queryKey: buildingKeys.detail(id!),
        queryFn: () => getBuildingById(id!),
        enabled: !!id,
        staleTime: APP_CONFIG.cache.buildingsStaleTime,
    });
};
