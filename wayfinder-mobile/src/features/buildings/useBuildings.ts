/**
 * useBuildings Hook
 * 
 * Hook for fetching and managing buildings data.
 */

import { useState, useEffect, useCallback } from 'react';
import { buildingsApi } from '@/api';
import { BuildingDto, PaginatedList } from '@/api/types';

interface UseBuildingsOptions {
    /** Initial page number */
    initialPage?: number;
    /** Page size */
    pageSize?: number;
    /** Auto-fetch on mount */
    autoFetch?: boolean;
}

interface UseBuildingsResult {
    /** Paginated buildings data */
    buildings: PaginatedList<BuildingDto> | null;
    /** Loading state */
    isLoading: boolean;
    /** Error message */
    error: string | null;
    /** Current page */
    page: number;
    /** Load buildings */
    loadBuildings: (page?: number) => Promise<void>;
    /** Refresh buildings */
    refresh: () => Promise<void>;
    /** Load next page */
    loadNextPage: () => Promise<void>;
    /** Clear error */
    clearError: () => void;
}

export function useBuildings(options: UseBuildingsOptions = {}): UseBuildingsResult {
    const { initialPage = 1, pageSize = 20, autoFetch = true } = options;

    const [buildings, setBuildings] = useState<PaginatedList<BuildingDto> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(initialPage);

    const loadBuildings = useCallback(
        async (targetPage: number = page) => {
            try {
                setIsLoading(true);
                setError(null);

                const data = await buildingsApi.getAll(targetPage, pageSize);
                setBuildings(data);
                setPage(targetPage);
            } catch (err) {
                console.error('[useBuildings] Load failed:', err);
                setError(err instanceof Error ? err.message : 'Failed to load buildings');
            } finally {
                setIsLoading(false);
            }
        },
        [page, pageSize]
    );

    const refresh = useCallback(async () => {
        setPage(1);
        await loadBuildings(1);
    }, [loadBuildings]);

    const loadNextPage = useCallback(async () => {
        if (buildings?.hasNextPage) {
            await loadBuildings(page + 1);
        }
    }, [buildings, page, loadBuildings]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Auto-fetch on mount
    useEffect(() => {
        if (autoFetch) {
            loadBuildings();
        }
    }, [autoFetch]);

    return {
        buildings,
        isLoading,
        error,
        page,
        loadBuildings,
        refresh,
        loadNextPage,
        clearError,
    };
}
