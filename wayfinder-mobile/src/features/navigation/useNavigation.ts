/**
 * useNavigation Hook
 * 
 * Hook for route calculation and navigation state management.
 */

import { useState, useCallback } from 'react';
import { routesApi } from '@/api';
import { NodeDto, PathResultExtended, RouteNodeDto } from '@/api/types';

interface UseNavigationResult {
    /** Start node */
    startNode: NodeDto | null;
    /** End node */
    endNode: NodeDto | null;
    /** Calculated route */
    route: PathResultExtended | null;
    /** Current step index in navigation */
    currentStepIndex: number;
    /** Require accessible routes */
    requireAccessible: boolean;
    /** Loading state */
    isLoading: boolean;
    /** Error message */
    error: string | null;
    /** Set start node */
    setStartNode: (node: NodeDto | null) => void;
    /** Set end node */
    setEndNode: (node: NodeDto | null) => void;
    /** Set accessible requirement */
    setRequireAccessible: (value: boolean) => void;
    /** Calculate route */
    calculateRoute: () => Promise<void>;
    /** Navigate to next step */
    nextStep: () => void;
    /** Navigate to previous step */
    previousStep: () => void;
    /** Go to specific step */
    goToStep: (index: number) => void;
    /** Get current step instruction */
    getCurrentInstruction: () => RouteNodeDto | null;
    /** Reset navigation */
    reset: () => void;
    /** Clear route only */
    clearRoute: () => void;
}

export function useNavigation(): UseNavigationResult {
    const [startNode, setStartNode] = useState<NodeDto | null>(null);
    const [endNode, setEndNode] = useState<NodeDto | null>(null);
    const [route, setRoute] = useState<PathResultExtended | null>(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [requireAccessible, setRequireAccessible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const calculateRoute = useCallback(async () => {
        if (!startNode || !endNode) {
            setError('Please select both start and end locations');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const result = await routesApi.calculate({
                startNodeId: startNode.id,
                endNodeId: endNode.id,
                requireAccessible,
            });

            if (!result.pathFound) {
                setError(result.errorMessage || 'No route found between these locations');
                setRoute(null);
                return;
            }

            setRoute(result);
            setCurrentStepIndex(0);
        } catch (err) {
            console.error('[useNavigation] Route calculation failed:', err);
            setError(err instanceof Error ? err.message : 'Failed to calculate route');
            setRoute(null);
        } finally {
            setIsLoading(false);
        }
    }, [startNode, endNode, requireAccessible]);

    const nextStep = useCallback(() => {
        if (route && currentStepIndex < route.path.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
        }
    }, [route, currentStepIndex]);

    const previousStep = useCallback(() => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(currentStepIndex - 1);
        }
    }, [currentStepIndex]);

    const goToStep = useCallback(
        (index: number) => {
            if (route && index >= 0 && index < route.path.length) {
                setCurrentStepIndex(index);
            }
        },
        [route]
    );

    const getCurrentInstruction = useCallback((): RouteNodeDto | null => {
        if (!route || !route.path[currentStepIndex]) {
            return null;
        }
        return route.path[currentStepIndex];
    }, [route, currentStepIndex]);

    const reset = useCallback(() => {
        setStartNode(null);
        setEndNode(null);
        setRoute(null);
        setCurrentStepIndex(0);
        setError(null);
        setRequireAccessible(false);
    }, []);

    const clearRoute = useCallback(() => {
        setRoute(null);
        setCurrentStepIndex(0);
        setError(null);
    }, []);

    return {
        startNode,
        endNode,
        route,
        currentStepIndex,
        requireAccessible,
        isLoading,
        error,
        setStartNode,
        setEndNode,
        setRequireAccessible,
        calculateRoute,
        nextStep,
        previousStep,
        goToStep,
        getCurrentInstruction,
        reset,
        clearRoute,
    };
}
