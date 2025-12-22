import { apiClient } from "./client";
import { EdgeDto, CreateEdgeCommand, UpdateEdgeCommand } from "../types/edge.types";
import { ServiceResponse, PaginatedList } from "../types/api.types";

export class EdgeService {
  /**
   * Get all edges (paginated)
   */
  static async getAll(pageNumber = 1, pageSize = 100): Promise<EdgeDto[]> {
    const response = await apiClient.get<ServiceResponse<PaginatedList<EdgeDto>>>(
      `/api/edges?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );

    if (response.data.isSuccess && response.data.data) {
      return response.data.data.items;
    }

    throw new Error(response.data.errorMessage || "Failed to fetch edges");
  }

  /**
   * Get all edges for a building (fetches edges for all nodes on all floors)
   */
  static async getAllForBuilding(nodeIds: string[]): Promise<EdgeDto[]> {
    return this.getByFloorNodes(nodeIds);
  }

  /**
   * Get edges connected to any of the given node IDs (efficient for floor-level loading)
   * Uses parallel requests to /api/edges/by-node/{nodeId} for each node
   */
  static async getByFloorNodes(nodeIds: string[]): Promise<EdgeDto[]> {
    if (nodeIds.length === 0) return [];

    const allEdges: EdgeDto[] = [];
    const seenIds = new Set<string>();

    // Fetch edges for all nodes in parallel (batch of 10 to avoid overwhelming server)
    const batchSize = 10;
    for (let i = 0; i < nodeIds.length; i += batchSize) {
      const batch = nodeIds.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map(nodeId => this.getByNode(nodeId))
      );

      for (const result of results) {
        if (result.status === 'fulfilled') {
          for (const edge of result.value) {
            if (!seenIds.has(edge.id)) {
              seenIds.add(edge.id);
              allEdges.push(edge);
            }
          }
        }
        // Silently ignore failed requests (node might not have edges)
      }
    }

    return allEdges;
  }

  /**
   * Get edge by ID
   */
  static async getById(id: string): Promise<EdgeDto> {
    const response = await apiClient.get<ServiceResponse<EdgeDto>>(
      `/api/edges/${id}`
    );

    if (response.data.isSuccess && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.errorMessage || "Edge not found");
  }

  /**
   * Get edges by node
   */
  static async getByNode(nodeId: string): Promise<EdgeDto[]> {
    const response = await apiClient.get<ServiceResponse<EdgeDto[]>>(
      `/api/edges/by-node/${nodeId}`
    );

    if (response.data.isSuccess && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.errorMessage || "Failed to fetch edges");
  }

  /**
   * Create edge (Admin/Manager)
   */
  static async create(data: CreateEdgeCommand): Promise<string> {
    const response = await apiClient.post<ServiceResponse<string>>(
      "/api/edges",
      data
    );

    if (response.data.isSuccess && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.errorMessage || "Failed to create edge");
  }

  /**
   * Update edge (Admin/Manager)
   */
  static async update(id: string, data: UpdateEdgeCommand): Promise<void> {
    const response = await apiClient.put<ServiceResponse<null>>(
      `/api/edges/${id}`,
      data
    );

    if (!response.data.isSuccess) {
      throw new Error(response.data.errorMessage || "Failed to update edge");
    }
  }

  /**
   * Delete edge (Admin/Manager)
   */
  static async delete(id: string): Promise<void> {
    const response = await apiClient.delete<ServiceResponse<null>>(
      `/api/edges/${id}`
    );

    if (!response.data.isSuccess) {
      throw new Error(response.data.errorMessage || "Failed to delete edge");
    }
  }
}

