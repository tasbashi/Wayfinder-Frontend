/**
 * Routes API Service
 * 
 * Handles route calculation.
 */

import { apiClient } from './client';
import {
    ServiceResponse,
    PathResult,
    PathResultExtended,
    RouteNodeDto,
    CalculateRouteParams,
    isSuccessResponse,
    getNodeTypeFromName,
} from './types';

class RoutesApiService {
    private readonly BASE_PATH = '/api/routes';

    /**
     * Normalize route node types from API response
     */
    private normalizeRouteNode(node: RouteNodeDto): RouteNodeDto {
        return {
            ...node,
            nodeType:
                typeof node.nodeType === 'string'
                    ? getNodeTypeFromName(node.nodeType)
                    : node.nodeType,
        };
    }

    /**
     * Extend path result with derived fields
     */
    private extendPathResult(result: PathResult): PathResultExtended {
        const normalizedPath = result.path.map((node) =>
            this.normalizeRouteNode(node)
        );

        const instructions = normalizedPath
            .map((node) => node.instruction)
            .filter((instruction) => instruction && instruction.trim() !== '');

        return {
            ...result,
            path: normalizedPath,
            estimatedTimeMinutes: result.estimatedTimeSeconds / 60,
            instructions,
        };
    }

    /**
     * Calculate route between two nodes
     */
    async calculate(params: CalculateRouteParams): Promise<PathResultExtended> {
        const { startNodeId, endNodeId, requireAccessible = false } = params;

        try {
            const response = await apiClient.get<ServiceResponse<PathResult>>(
                `${this.BASE_PATH}/calculate`,
                {
                    params: {
                        startNodeId,
                        endNodeId,
                        requireAccessible,
                    },
                }
            );

            if (isSuccessResponse(response.data)) {
                return this.extendPathResult(response.data.data);
            }

            // Check if pathFound is false
            if (response.data.data && !response.data.data.pathFound) {
                return this.extendPathResult({
                    pathFound: false,
                    totalDistance: 0,
                    estimatedTimeSeconds: 0,
                    path: [],
                    errorMessage: response.data.data.errorMessage || 'No route found',
                });
            }

            throw new Error(response.data.errorMessage || 'Failed to calculate route');
        } catch (error) {
            throw new Error(
                error instanceof Error ? error.message : 'Failed to calculate route'
            );
        }
    }

    /**
     * POST variant for route calculation (alternative endpoint)
     */
    async calculatePost(params: CalculateRouteParams): Promise<PathResultExtended> {
        const response = await apiClient.post<ServiceResponse<PathResult>>(
            `${this.BASE_PATH}/calculate`,
            params
        );

        if (isSuccessResponse(response.data)) {
            return this.extendPathResult(response.data.data);
        }

        throw new Error(response.data.errorMessage || 'Failed to calculate route');
    }
}

// Export singleton instance
export const routesApi = new RoutesApiService();

// Also export class for testing purposes
export { RoutesApiService };
