import { create } from "zustand";
import { NodeService } from "../api/node.service";
import {
  NodeDto,
  CreateNodeCommand,
  UpdateNodeCommand,
} from "../types/node.types";
import { PaginatedList } from "../types/api.types";

interface NodeStore {
  nodes: PaginatedList<NodeDto> | null;
  currentNode: NodeDto | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchNodes: (page?: number, pageSize?: number) => Promise<void>;
  fetchNodeById: (id: string) => Promise<void>;
  fetchNodesByFloor: (floorId: string) => Promise<NodeDto[]>;
  createNode: (data: CreateNodeCommand) => Promise<string>;
  updateNode: (id: string, data: UpdateNodeCommand) => Promise<void>;
  deleteNode: (id: string) => Promise<void>;
  searchNodes: (query: string, buildingId?: string) => Promise<NodeDto[]>;
  clearError: () => void;
  clearCurrentNode: () => void;
}

export const useNodeStore = create<NodeStore>((set, get) => ({
  nodes: null,
  currentNode: null,
  isLoading: false,
  error: null,

  fetchNodes: async (page = 1, pageSize = 20) => {
    try {
      set({ isLoading: true, error: null });
      const nodes = await NodeService.getAll(page, pageSize);
      set({ nodes, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch nodes",
        isLoading: false,
      });
    }
  },

  fetchNodeById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const node = await NodeService.getById(id);
      set({ currentNode: node, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Node not found",
        isLoading: false,
      });
    }
  },

  fetchNodesByFloor: async (floorId: string) => {
    try {
      set({ isLoading: true, error: null });
      const nodes = await NodeService.getByFloor(floorId);
      set({ isLoading: false });
      return nodes;
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch nodes",
        isLoading: false,
      });
      throw error;
    }
  },

  createNode: async (data: CreateNodeCommand) => {
    try {
      set({ isLoading: true, error: null });
      const nodeId = await NodeService.create(data);
      // Refresh nodes list
      const { nodes } = get();
      if (nodes) {
        await get().fetchNodes(nodes.pageNumber, nodes.pageSize);
      }
      set({ isLoading: false });
      return nodeId;
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to create node",
        isLoading: false,
      });
      throw error;
    }
  },

  updateNode: async (id: string, data: UpdateNodeCommand) => {
    try {
      set({ isLoading: true, error: null });
      await NodeService.update(id, data);
      // Refresh current node and list
      await get().fetchNodeById(id);
      const { nodes } = get();
      if (nodes) {
        await get().fetchNodes(nodes.pageNumber, nodes.pageSize);
      }
      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to update node",
        isLoading: false,
      });
      throw error;
    }
  },

  deleteNode: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await NodeService.delete(id);
      // Refresh nodes list
      const { nodes } = get();
      if (nodes) {
        await get().fetchNodes(nodes.pageNumber, nodes.pageSize);
      }
      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to delete node",
        isLoading: false,
      });
      throw error;
    }
  },

  searchNodes: async (query: string, buildingId?: string) => {
    try {
      set({ isLoading: true, error: null });
      const nodes = await NodeService.search(query, buildingId);
      set({ isLoading: false });
      return nodes;
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Search failed",
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  clearCurrentNode: () => set({ currentNode: null }),
}));

