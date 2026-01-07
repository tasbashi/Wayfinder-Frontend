/**
 * Navigation Store
 * 
 * Global state for navigation using Zustand.
 * Persists navigation state across screens.
 */

import { create } from 'zustand';
import { routesApi } from '@/api';
import { NodeDto, PathResultExtended, RouteNodeDto } from '@/api/types';

interface NavigationState {
    // Selection
    startNode: NodeDto | null;
    endNode: NodeDto | null;

    // Current context (for filtering search)
    currentBuildingId: string | null;
    currentFloorId: string | null;

    // Route
    route: PathResultExtended | null;
    currentStepIndex: number;

    // Options
    requireAccessible: boolean;

    // Status
    isCalculating: boolean;
    error: string | null;

    // Actions
    setStartNode: (node: NodeDto | null) => void;
    setEndNode: (node: NodeDto | null) => void;
    setCurrentBuilding: (buildingId: string | null, floorId?: string | null) => void;
    swapNodes: () => void;
    setRequireAccessible: (value: boolean) => void;
    calculateRoute: () => Promise<void>;
    nextStep: () => void;
    previousStep: () => void;
    goToStep: (index: number) => void;
    getCurrentStep: () => RouteNodeDto | null;
    reset: () => void;
    clearRoute: () => void;
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
    // Initial state
    startNode: null,
    endNode: null,
    currentBuildingId: null,
    currentFloorId: null,
    route: null,
    currentStepIndex: 0,
    requireAccessible: false,
    isCalculating: false,
    error: null,

    // Set start node
    setStartNode: (node) => {
        set({ startNode: node, error: null });
    },

    // Set end node
    setEndNode: (node) => {
        set({ endNode: node, error: null });
    },

    // Set current building context (for filtering searches)
    setCurrentBuilding: (buildingId, floorId = null) => {
        set({ currentBuildingId: buildingId, currentFloorId: floorId });
    },


    // Swap start and end nodes
    swapNodes: () => {
        const { startNode, endNode } = get();
        set({
            startNode: endNode,
            endNode: startNode,
            route: null,
            currentStepIndex: 0,
            error: null,
        });
    },

    // Set accessible requirement
    setRequireAccessible: (value) => {
        set({ requireAccessible: value });
    },

    // Calculate route
    calculateRoute: async () => {
        const { startNode, endNode, requireAccessible } = get();

        if (!startNode || !endNode) {
            set({ error: 'Please select both start and end locations' });
            return;
        }

        set({ isCalculating: true, error: null });

        try {
            const result = await routesApi.calculate({
                startNodeId: startNode.id,
                endNodeId: endNode.id,
                requireAccessible,
            });

            if (!result.pathFound) {
                set({
                    error: result.errorMessage || 'No route found',
                    route: null,
                    isCalculating: false,
                });
                return;
            }

            set({
                route: result,
                currentStepIndex: 0,
                isCalculating: false,
            });
        } catch (err) {
            set({
                error: err instanceof Error ? err.message : 'Route calculation failed',
                route: null,
                isCalculating: false,
            });
        }
    },

    // Navigate to next step
    nextStep: () => {
        const { route, currentStepIndex } = get();
        if (route && currentStepIndex < route.path.length - 1) {
            set({ currentStepIndex: currentStepIndex + 1 });
        }
    },

    // Navigate to previous step
    previousStep: () => {
        const { currentStepIndex } = get();
        if (currentStepIndex > 0) {
            set({ currentStepIndex: currentStepIndex - 1 });
        }
    },

    // Go to specific step
    goToStep: (index) => {
        const { route } = get();
        if (route && index >= 0 && index < route.path.length) {
            set({ currentStepIndex: index });
        }
    },

    // Get current step
    getCurrentStep: () => {
        const { route, currentStepIndex } = get();
        if (!route || !route.path[currentStepIndex]) {
            return null;
        }
        return route.path[currentStepIndex];
    },

    // Reset all navigation state
    reset: () => {
        set({
            startNode: null,
            endNode: null,
            currentBuildingId: null,
            currentFloorId: null,
            route: null,
            currentStepIndex: 0,
            requireAccessible: false,
            isCalculating: false,
            error: null,
        });
    },

    // Clear route only (keep selections)
    clearRoute: () => {
        set({
            route: null,
            currentStepIndex: 0,
            error: null,
        });
    },
}));
