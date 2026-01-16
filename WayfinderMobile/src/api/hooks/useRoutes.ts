import { useMutation, useQueryClient } from "@tanstack/react-query";
import { calculateRoute } from "../services/routes.service";
import type { PathResult, RouteRequest } from "@/types";

/**
 * Query Keys
 */
export const routeKeys = {
    all: ["routes"] as const,
    calculate: (startId: string, endId: string) => [...routeKeys.all, startId, endId] as const,
};

/**
 * Hook to calculate route between two nodes
 * Uses mutation since route calculation is a POST request
 */
export const useCalculateRoute = () => {
    const queryClient = useQueryClient();

    return useMutation<PathResult, Error, RouteRequest>({
        mutationFn: calculateRoute,
        onSuccess: (data, variables) => {
            // Cache the result
            queryClient.setQueryData(
                routeKeys.calculate(variables.startNodeId, variables.endNodeId),
                data
            );
        },
    });
};

/**
 * Type for the mutation hook
 */
export type UseCalculateRouteResult = ReturnType<typeof useCalculateRoute>;
