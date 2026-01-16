import { useQuery } from "@tanstack/react-query";
import { getNodes, getNodeById, getNodesByFloorId, getNodeByQRCode } from "../services/nodes.service";
import { APP_CONFIG } from "@/config/app.config";
import type { Node } from "@/types";

/**
 * Query Keys
 */
export const nodeKeys = {
    all: ["nodes"] as const,
    lists: () => [...nodeKeys.all, "list"] as const,
    list: (filters: string) => [...nodeKeys.lists(), { filters }] as const,
    byFloor: (floorId: string) => [...nodeKeys.all, "floor", floorId] as const,
    byQRCode: (qrCode: string) => [...nodeKeys.all, "qr", qrCode] as const,
    details: () => [...nodeKeys.all, "detail"] as const,
    detail: (id: string) => [...nodeKeys.details(), id] as const,
};

/**
 * Hook to fetch all nodes
 */
export const useNodes = () => {
    return useQuery<Node[], Error>({
        queryKey: nodeKeys.lists(),
        queryFn: getNodes,
        staleTime: APP_CONFIG.cache.nodesStaleTime,
    });
};

/**
 * Hook to fetch nodes by floor ID
 */
export const useNodesByFloor = (floorId: string | undefined) => {
    return useQuery<Node[], Error>({
        queryKey: nodeKeys.byFloor(floorId!),
        queryFn: () => getNodesByFloorId(floorId!),
        enabled: !!floorId,
        staleTime: APP_CONFIG.cache.nodesStaleTime,
    });
};

/**
 * Hook to fetch a single node by ID
 */
export const useNode = (id: string | undefined) => {
    return useQuery<Node, Error>({
        queryKey: nodeKeys.detail(id!),
        queryFn: () => getNodeById(id!),
        enabled: !!id,
        staleTime: APP_CONFIG.cache.nodesStaleTime,
    });
};

/**
 * Hook to fetch node by QR code
 */
export const useNodeByQRCode = (qrCode: string | undefined) => {
    return useQuery<Node, Error>({
        queryKey: nodeKeys.byQRCode(qrCode!),
        queryFn: () => getNodeByQRCode(qrCode!),
        enabled: !!qrCode,
        staleTime: APP_CONFIG.cache.nodesStaleTime,
    });
};
