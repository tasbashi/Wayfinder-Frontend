import { useQuery } from "@tanstack/react-query";
import { getEdges, getEdgesByFloorId } from "../services/edges.service";
import { APP_CONFIG } from "@/config/app.config";
import type { Edge } from "@/types";

/**
 * Query Keys
 */
export const edgeKeys = {
    all: ["edges"] as const,
    lists: () => [...edgeKeys.all, "list"] as const,
    byFloor: (floorId: string) => [...edgeKeys.all, "floor", floorId] as const,
};

/**
 * Hook to fetch all edges
 */
export const useEdges = () => {
    return useQuery<Edge[], Error>({
        queryKey: edgeKeys.lists(),
        queryFn: getEdges,
        staleTime: APP_CONFIG.cache.nodesStaleTime,
    });
};

/**
 * Hook to fetch edges by floor ID
 */
export const useEdgesByFloor = (floorId: string | undefined) => {
    return useQuery<Edge[], Error>({
        queryKey: edgeKeys.byFloor(floorId!),
        queryFn: () => getEdgesByFloorId(floorId!),
        enabled: !!floorId,
        staleTime: APP_CONFIG.cache.nodesStaleTime,
    });
};
