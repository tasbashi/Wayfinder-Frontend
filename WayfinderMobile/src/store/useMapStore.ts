import { create } from "zustand";
import type { Building, Floor } from "@/types";

interface MapStore {
    // State
    selectedBuilding: Building | null;
    selectedFloor: Floor | null;
    zoomLevel: number;
    panOffset: { x: number; y: number };
    showNodes: boolean;
    showEdges: boolean;
    showRoute: boolean;

    // Actions
    setSelectedBuilding: (building: Building | null) => void;
    setSelectedFloor: (floor: Floor | null) => void;
    setZoomLevel: (zoom: number) => void;
    setPanOffset: (offset: { x: number; y: number }) => void;
    toggleNodes: () => void;
    toggleEdges: () => void;
    toggleRoute: () => void;
    resetMapView: () => void;
}

const DEFAULT_ZOOM = 1;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;

export const useMapStore = create<MapStore>((set) => ({
    // Initial State
    selectedBuilding: null,
    selectedFloor: null,
    zoomLevel: DEFAULT_ZOOM,
    panOffset: { x: 0, y: 0 },
    showNodes: true,
    showEdges: false,
    showRoute: true,

    // Actions
    setSelectedBuilding: (building) =>
        set({
            selectedBuilding: building,
            selectedFloor: null, // Reset floor when building changes
        }),

    setSelectedFloor: (floor) =>
        set({
            selectedFloor: floor,
        }),

    setZoomLevel: (zoom) =>
        set({
            zoomLevel: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom)),
        }),

    setPanOffset: (offset) =>
        set({
            panOffset: offset,
        }),

    toggleNodes: () =>
        set((state) => ({
            showNodes: !state.showNodes,
        })),

    toggleEdges: () =>
        set((state) => ({
            showEdges: !state.showEdges,
        })),

    toggleRoute: () =>
        set((state) => ({
            showRoute: !state.showRoute,
        })),

    resetMapView: () =>
        set({
            zoomLevel: DEFAULT_ZOOM,
            panOffset: { x: 0, y: 0 },
        }),
}));
