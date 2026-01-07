/**
 * useBuildingDetail Hook
 * 
 * Hook for fetching a single building with its details.
 */

import { useState, useEffect, useCallback } from 'react';
import { buildingsApi, floorsApi, nodesApi } from '@/api';
import { BuildingDto, FloorDto, NodeDto } from '@/api/types';

interface UseBuildingDetailOptions {
    /** Building ID to fetch */
    buildingId: string;
    /** Auto-fetch on mount */
    autoFetch?: boolean;
    /** Include nodes for each floor */
    includeNodes?: boolean;
}

interface FloorWithNodes extends FloorDto {
    nodes?: NodeDto[];
}

interface BuildingDetail extends BuildingDto {
    floorsWithNodes?: FloorWithNodes[];
}

interface UseBuildingDetailResult {
    /** Building data */
    building: BuildingDetail | null;
    /** Loading state */
    isLoading: boolean;
    /** Error message */
    error: string | null;
    /** Fetch building */
    fetchBuilding: () => Promise<void>;
    /** Refresh building */
    refresh: () => Promise<void>;
    /** Get floor by ID */
    getFloor: (floorId: string) => FloorWithNodes | undefined;
}

export function useBuildingDetail(
    options: UseBuildingDetailOptions
): UseBuildingDetailResult {
    const { buildingId, autoFetch = true, includeNodes = false } = options;

    const [building, setBuilding] = useState<BuildingDetail | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBuilding = useCallback(async () => {
        if (!buildingId) {
            setError('Building ID is required');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // Fetch building
            const buildingData = await buildingsApi.getById(buildingId);

            if (includeNodes && buildingData.floors) {
                // Fetch nodes for each floor
                const floorsWithNodes: FloorWithNodes[] = await Promise.all(
                    buildingData.floors.map(async (floor) => {
                        try {
                            const nodes = await nodesApi.getByFloor(floor.id);
                            return { ...floor, nodes };
                        } catch {
                            console.warn(`[useBuildingDetail] Failed to load nodes for floor ${floor.id}`);
                            return { ...floor, nodes: [] };
                        }
                    })
                );

                setBuilding({ ...buildingData, floorsWithNodes });
            } else {
                setBuilding(buildingData);
            }
        } catch (err) {
            console.error('[useBuildingDetail] Fetch failed:', err);
            setError(err instanceof Error ? err.message : 'Failed to load building');
        } finally {
            setIsLoading(false);
        }
    }, [buildingId, includeNodes]);

    const refresh = useCallback(async () => {
        await fetchBuilding();
    }, [fetchBuilding]);

    const getFloor = useCallback(
        (floorId: string): FloorWithNodes | undefined => {
            if (!building) return undefined;

            // Check floorsWithNodes first
            if (building.floorsWithNodes) {
                return building.floorsWithNodes.find((f) => f.id === floorId);
            }

            // Fall back to floors
            return building.floors?.find((f) => f.id === floorId);
        },
        [building]
    );

    // Auto-fetch on mount
    useEffect(() => {
        if (autoFetch && buildingId) {
            fetchBuilding();
        }
    }, [autoFetch, buildingId]);

    return {
        building,
        isLoading,
        error,
        fetchBuilding,
        refresh,
        getFloor,
    };
}
