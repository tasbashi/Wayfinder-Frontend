import { create } from "zustand";
import { Platform } from "react-native";
import { NodeService } from "../api/node.service";
import { NodeDto } from "../types/node.types";
import { PaginatedList } from "../types/api.types";

interface NodeStore {
  nodes: PaginatedList<NodeDto> | null;
  isLoading: boolean;
  error: string | null;
  fetchNodes: (page?: number, pageSize?: number) => Promise<void>;
  clearError: () => void;
}

// Check if we're on a native platform (not web)
const isNative = Platform.OS !== "web";

export const useNodeStore = create<NodeStore>((set) => ({
  nodes: null,
  isLoading: false,
  error: null,

  fetchNodes: async (page = 1, pageSize = 1000) => {
    try {
      set({ isLoading: true, error: null });

      // Try fetching from API
      try {
        const nodes = await NodeService.getAll(page, pageSize);

        // Cache the result (only on native platforms)
        if (isNative) {
          try {
            const { OfflineDataService } = await import("../services/offlineDataService");
            await OfflineDataService.cacheNodeList(nodes.items);
          } catch (cacheError) {
            console.log("Failed to cache nodes:", cacheError);
          }
        }

        set({ nodes, isLoading: false });
      } catch (apiError) {
        console.log("API failed, trying offline cache", apiError);

        // Try loading from cache (only on native platforms)
        if (isNative) {
          try {
            const { OfflineDataService } = await import("../services/offlineDataService");
            const cachedNodes = await OfflineDataService.getCachedNodeList();

            if (cachedNodes) {
              set({
                nodes: {
                  items: cachedNodes,
                  totalCount: cachedNodes.length,
                  pageNumber: 1,
                  pageSize: pageSize,
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
          error instanceof Error ? error.message : "Failed to load nodes",
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));

