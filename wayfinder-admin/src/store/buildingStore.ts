import { create } from "zustand";
import { BuildingService } from "../api/building.service";
import {
  BuildingDto,
  CreateBuildingCommand,
  UpdateBuildingCommand,
} from "../types/building.types";
import { PaginatedList } from "../types/api.types";

interface BuildingStore {
  buildings: PaginatedList<BuildingDto> | null;
  currentBuilding: BuildingDto | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchBuildings: (page?: number, pageSize?: number) => Promise<void>;
  fetchBuildingById: (id: string) => Promise<void>;
  createBuilding: (data: CreateBuildingCommand) => Promise<string>;
  updateBuilding: (id: string, data: UpdateBuildingCommand) => Promise<void>;
  deleteBuilding: (id: string) => Promise<void>;
  clearError: () => void;
  clearCurrentBuilding: () => void;
}

export const useBuildingStore = create<BuildingStore>((set, get) => ({
  buildings: null,
  currentBuilding: null,
  isLoading: false,
  error: null,

  fetchBuildings: async (page = 1, pageSize = 20) => {
    try {
      set({ isLoading: true, error: null });
      const buildings = await BuildingService.getAll(page, pageSize);
      set({ buildings, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch buildings",
        isLoading: false,
      });
    }
  },

  fetchBuildingById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const building = await BuildingService.getById(id);
      set({ currentBuilding: building, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Building not found",
        isLoading: false,
      });
    }
  },

  createBuilding: async (data: CreateBuildingCommand) => {
    try {
      set({ isLoading: true, error: null });
      const buildingId = await BuildingService.create(data);
      // Refresh buildings list
      const { buildings } = get();
      if (buildings) {
        await get().fetchBuildings(buildings.pageNumber, buildings.pageSize);
      }
      set({ isLoading: false });
      return buildingId;
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to create building",
        isLoading: false,
      });
      throw error;
    }
  },

  updateBuilding: async (id: string, data: UpdateBuildingCommand) => {
    try {
      set({ isLoading: true, error: null });
      await BuildingService.update(id, data);
      // Refresh current building and list
      await get().fetchBuildingById(id);
      const { buildings } = get();
      if (buildings) {
        await get().fetchBuildings(buildings.pageNumber, buildings.pageSize);
      }
      set({ isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to update building",
        isLoading: false,
      });
      throw error;
    }
  },

  deleteBuilding: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await BuildingService.delete(id);
      // Refresh buildings list
      const { buildings } = get();
      if (buildings) {
        await get().fetchBuildings(buildings.pageNumber, buildings.pageSize);
      }
      set({ isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to delete building",
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  clearCurrentBuilding: () => set({ currentBuilding: null }),
}));

