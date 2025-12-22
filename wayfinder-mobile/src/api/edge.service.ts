import { apiClient } from "./client";
import { EdgeDto } from "../types/edge.types";
import { ServiceResponse } from "../types/api.types";

export class EdgeService {
  /**
   * Get all edges
   */
  static async getAll(): Promise<EdgeDto[]> {
    const response = await apiClient.get<ServiceResponse<EdgeDto[]>>(
      "/api/edges"
    );

    if (response.data.isSuccess && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.errorMessage || "Failed to fetch edges");
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
}

