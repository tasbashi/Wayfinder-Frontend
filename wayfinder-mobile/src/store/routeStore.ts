import { create } from "zustand";

interface RouteStore {
    // Selected nodes for route calculation
    startNodeId: string | null;
    endNodeId: string | null;
    selectedBuildingId: string | null;
    requireAccessible: boolean;

    // Actions
    setStartNode: (nodeId: string | null) => void;
    setEndNode: (nodeId: string | null) => void;
    setSelectedBuilding: (buildingId: string | null) => void;
    setRequireAccessible: (value: boolean) => void;
    swapNodes: () => void;
    clearRoute: () => void;
}

export const useRouteStore = create<RouteStore>((set) => ({
    startNodeId: null,
    endNodeId: null,
    selectedBuildingId: null,
    requireAccessible: false,

    setStartNode: (nodeId) => set({ startNodeId: nodeId }),

    setEndNode: (nodeId) => set({ endNodeId: nodeId }),

    setSelectedBuilding: (buildingId) => set({ selectedBuildingId: buildingId }),

    setRequireAccessible: (value) => set({ requireAccessible: value }),

    swapNodes: () => set((state) => ({
        startNodeId: state.endNodeId,
        endNodeId: state.startNodeId,
    })),

    clearRoute: () => set({
        startNodeId: null,
        endNodeId: null,
        selectedBuildingId: null,
        requireAccessible: false,
    }),
}));
