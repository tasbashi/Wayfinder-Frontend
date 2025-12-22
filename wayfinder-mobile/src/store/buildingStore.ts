import { create } from "zustand";
import { Platform } from "react-native";
import { BuildingService } from "../api/building.service";
import { BuildingDto } from "../types/building.types";
import { PaginatedList } from "../types/api.types";

interface BuildingStore {
  buildings: PaginatedList<BuildingDto> | null;
  isLoading: boolean;
  error: string | null;
  loadBuildings: (page?: number, pageSize?: number) => Promise<void>;
  clearError: () => void;
}

// Check if we're on a native platform (not web)
const isNative = Platform.OS !== "web";

export const useBuildingStore = create<BuildingStore>((set) => ({
  buildings: null,
  isLoading: false,
  error: null,

  loadBuildings: async (page = 1, pageSize = 100) => {
    try {
      set({ isLoading: true, error: null });

      // Try fetching from API
      try {
        const buildings = await BuildingService.getAll(page, pageSize);

        // Cache the result (only on native platforms)
        if (isNative) {
          try {
            const { OfflineDataService } = await import("../services/offlineDataService");
            await OfflineDataService.cacheBuildingList(buildings.items);
          } catch (cacheError) {
            console.log("Failed to cache buildings:", cacheError);
          }
        }

        set({ buildings, isLoading: false });
      } catch (apiError) {
        console.log("API failed, trying offline cache", apiError);

        // Try loading from cache (only on native platforms)
        if (isNative) {
          try {
            const { OfflineDataService } = await import("../services/offlineDataService");
            const cachedBuildings = await OfflineDataService.getCachedBuildingList();

            if (cachedBuildings) {
              set({
                buildings: {
                  items: cachedBuildings,
                  totalCount: cachedBuildings.length,
                  pageNumber: 1,
                  pageSize: 100,
                  totalPages: 1,
                  hasNextPage: false,
                  hasPreviousPage: false
                },
                isLoading: false
              });
              return;
            }
          } catch (cacheError) {
            console.log("Failed to load from cache:", cacheError);
          }
        }

        throw apiError; // Re-throw if no cache available or on web
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to load buildings",
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));

