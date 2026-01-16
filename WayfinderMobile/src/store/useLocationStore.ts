import { create } from "zustand";
import type { Node, Floor, Building } from "@/types";

interface LocationStore {
    // State
    currentNode: Node | null;
    destinationNode: Node | null;
    currentFloor: Floor | null;
    currentBuilding: Building | null;
    lastScannedQR: string | null;
    lastUpdated: Date | null;

    // Actions
    setCurrentLocation: (node: Node, floor?: Floor, building?: Building) => void;
    setDestination: (node: Node | null) => void;
    setFromQRScan: (qrCode: string, node: Node) => void;
    clearLocation: () => void;
    clearDestination: () => void;
}

export const useLocationStore = create<LocationStore>((set) => ({
    // Initial State
    currentNode: null,
    destinationNode: null,
    currentFloor: null,
    currentBuilding: null,
    lastScannedQR: null,
    lastUpdated: null,

    // Actions
    setCurrentLocation: (node, floor, building) =>
        set({
            currentNode: node,
            currentFloor: floor ?? null,
            currentBuilding: building ?? null,
            lastUpdated: new Date(),
        }),

    setDestination: (node) =>
        set({
            destinationNode: node,
        }),

    setFromQRScan: (qrCode, node) =>
        set({
            currentNode: node,
            lastScannedQR: qrCode,
            lastUpdated: new Date(),
        }),

    clearLocation: () =>
        set({
            currentNode: null,
            currentFloor: null,
            currentBuilding: null,
            lastScannedQR: null,
            lastUpdated: null,
        }),

    clearDestination: () =>
        set({
            destinationNode: null,
        }),
}));
