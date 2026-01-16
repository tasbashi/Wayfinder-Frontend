import { useQuery } from "@tanstack/react-query";
import { getFloors, getFloorById, getFloorsByBuildingId } from "../services/floors.service";
import { APP_CONFIG } from "@/config/app.config";
import type { Floor } from "@/types";

/**
 * Query Keys
 */
export const floorKeys = {
    all: ["floors"] as const,
    lists: () => [...floorKeys.all, "list"] as const,
    list: (filters: string) => [...floorKeys.lists(), { filters }] as const,
    byBuilding: (buildingId: string) => [...floorKeys.all, "building", buildingId] as const,
    details: () => [...floorKeys.all, "detail"] as const,
    detail: (id: string) => [...floorKeys.details(), id] as const,
};

/**
 * Hook to fetch all floors
 */
export const useFloors = () => {
    return useQuery<Floor[], Error>({
        queryKey: floorKeys.lists(),
        queryFn: getFloors,
        staleTime: APP_CONFIG.cache.floorsStaleTime,
    });
};

/**
 * Hook to fetch floors by building ID
 */
export const useFloorsByBuilding = (buildingId: string | undefined) => {
    return useQuery<Floor[], Error>({
        queryKey: floorKeys.byBuilding(buildingId!),
        queryFn: () => getFloorsByBuildingId(buildingId!),
        enabled: !!buildingId,
        staleTime: APP_CONFIG.cache.floorsStaleTime,
    });
};

/**
 * Hook to fetch a single floor by ID
 */
export const useFloor = (id: string | undefined) => {
    return useQuery<Floor, Error>({
        queryKey: floorKeys.detail(id!),
        queryFn: () => getFloorById(id!),
        enabled: !!id,
        staleTime: APP_CONFIG.cache.floorsStaleTime,
    });
};
