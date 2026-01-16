import { create } from "zustand";
import type { Node, PathResult } from "@/types";

interface NavigationStore {
    // State
    activeRoute: PathResult | null;
    currentNodeIndex: number;
    isNavigating: boolean;
    startNode: Node | null;
    endNode: Node | null;

    // Actions
    setRoute: (route: PathResult, start: Node, end: Node) => void;
    startNavigation: () => void;
    stopNavigation: () => void;
    nextStep: () => void;
    previousStep: () => void;
    goToStep: (index: number) => void;
    clearRoute: () => void;
}

export const useNavigationStore = create<NavigationStore>((set, get) => ({
    // Initial State
    activeRoute: null,
    currentNodeIndex: 0,
    isNavigating: false,
    startNode: null,
    endNode: null,

    // Actions
    setRoute: (route, start, end) =>
        set({
            activeRoute: route,
            startNode: start,
            endNode: end,
            currentNodeIndex: 0,
            isNavigating: false,
        }),

    startNavigation: () =>
        set({
            isNavigating: true,
        }),

    stopNavigation: () =>
        set({
            isNavigating: false,
        }),

    nextStep: () => {
        const { activeRoute, currentNodeIndex } = get();
        if (activeRoute && currentNodeIndex < activeRoute.pathNodes.length - 1) {
            set({ currentNodeIndex: currentNodeIndex + 1 });
        }
    },

    previousStep: () => {
        const { currentNodeIndex } = get();
        if (currentNodeIndex > 0) {
            set({ currentNodeIndex: currentNodeIndex - 1 });
        }
    },

    goToStep: (index) => {
        const { activeRoute } = get();
        if (activeRoute && index >= 0 && index < activeRoute.pathNodes.length) {
            set({ currentNodeIndex: index });
        }
    },

    clearRoute: () =>
        set({
            activeRoute: null,
            currentNodeIndex: 0,
            isNavigating: false,
            startNode: null,
            endNode: null,
        }),
}));
