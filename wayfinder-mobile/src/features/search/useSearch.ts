/**
 * useSearch Hook
 * 
 * Hook for searching nodes with debouncing and filters.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { nodesApi } from '@/api';
import { NodeDto, NodeType } from '@/api/types';

interface UseSearchOptions {
    /** Debounce delay in ms */
    debounceMs?: number;
    /** Building ID filter */
    buildingId?: string;
    /** Floor ID filter */
    floorId?: string;
    /** Max results */
    maxResults?: number;
    /** Node type filter */
    nodeType?: NodeType;
}

interface UseSearchResult {
    /** Search results */
    results: NodeDto[];
    /** Search query */
    query: string;
    /** Loading state */
    isLoading: boolean;
    /** Error message */
    error: string | null;
    /** Set search query */
    setQuery: (query: string) => void;
    /** Clear search */
    clearSearch: () => void;
    /** Search by type */
    searchByType: (type: NodeType) => Promise<void>;
}

export function useSearch(options: UseSearchOptions = {}): UseSearchResult {
    const {
        debounceMs = 300,
        buildingId,
        floorId,
        maxResults = 50,
        nodeType,
    } = options;

    const [results, setResults] = useState<NodeDto[]>([]);
    const [query, setQueryState] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Perform search
    const performSearch = useCallback(
        async (searchQuery: string) => {
            if (!searchQuery || searchQuery.trim().length < 2) {
                setResults([]);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                const data = await nodesApi.search({
                    searchTerm: searchQuery.trim(),
                    buildingId,
                    floorId,
                    maxResults,
                });

                setResults(data);
            } catch (err) {
                console.error('[useSearch] Search failed:', err);
                setError(err instanceof Error ? err.message : 'Search failed');
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        },
        [buildingId, floorId, maxResults]
    );

    // Debounced query setter
    const setQuery = useCallback(
        (newQuery: string) => {
            setQueryState(newQuery);

            // Clear existing timer
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            // Set new debounce timer
            debounceTimerRef.current = setTimeout(() => {
                performSearch(newQuery);
            }, debounceMs);
        },
        [debounceMs, performSearch]
    );

    // Clear search
    const clearSearch = useCallback(() => {
        setQueryState('');
        setResults([]);
        setError(null);

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
    }, []);

    // Search by node type
    const searchByType = useCallback(
        async (type: NodeType) => {
            try {
                setIsLoading(true);
                setError(null);

                const data = await nodesApi.searchByType({
                    nodeType: type,
                    buildingId,
                    floorId,
                });

                setResults(data);
            } catch (err) {
                console.error('[useSearch] Type search failed:', err);
                setError(err instanceof Error ? err.message : 'Search failed');
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        },
        [buildingId, floorId]
    );

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    // Initial search by type if provided
    useEffect(() => {
        if (nodeType !== undefined) {
            searchByType(nodeType);
        }
    }, [nodeType]);

    return {
        results,
        query,
        isLoading,
        error,
        setQuery,
        clearSearch,
        searchByType,
    };
}
