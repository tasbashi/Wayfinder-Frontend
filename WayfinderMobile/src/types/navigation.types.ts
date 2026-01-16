import type { Node, Building, Floor, PathResult } from "./index";

/**
 * Navigation Screen Route Params
 */
export type RootStackParamList = {
    "(tabs)": undefined;
    "building/[id]": { id: string };
    "navigate/index": { startNodeId?: string; endNodeId?: string };
    "navigate/[routeId]": { routeId: string };
};

/**
 * Tab Navigator Route Params
 */
export type TabParamList = {
    index: undefined;
    explore: { buildingId?: string };
    scan: { endNodeId?: string };
    settings: undefined;
};

/**
 * Navigation State
 */
export interface NavigationState {
    isNavigating: boolean;
    currentStep: number;
    totalSteps: number;
    route: PathResult | null;
    startNode: Node | null;
    endNode: Node | null;
}

/**
 * Map View State
 */
export interface MapViewState {
    selectedBuilding: Building | null;
    selectedFloor: Floor | null;
    zoomLevel: number;
    panOffset: { x: number; y: number };
    showNodes: boolean;
    showEdges: boolean;
    showRoute: boolean;
}

/**
 * Location Context
 */
export interface LocationState {
    currentNode: Node | null;
    currentFloor: Floor | null;
    currentBuilding: Building | null;
    lastScannedQR: string | null;
    lastUpdated: Date | null;
}
