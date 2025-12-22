import { apiClient } from "./client";
import {
  BuildingDto,
  CreateBuildingCommand,
  UpdateBuildingCommand,
} from "../types/building.types";
import { ServiceResponse, PaginatedList } from "../types/api.types";

export class BuildingService {
  /**
   * Get all buildings (paginated)
   */
  static async getAll(pageNumber = 1, pageSize = 10) {
    const response = await apiClient.get<
      ServiceResponse<PaginatedList<BuildingDto>>
    >(`/api/buildings?pageNumber=${pageNumber}&pageSize=${pageSize}`);

    if (response.data.isSuccess && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.errorMessage || "Failed to fetch buildings");
  }

  /**
   * Get building by ID
   */
  static async getById(id: string): Promise<BuildingDto> {
    const response = await apiClient.get<ServiceResponse<BuildingDto>>(
      `/api/buildings/${id}`
    );

    if (response.data.isSuccess && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.errorMessage || "Building not found");
  }

  /**
   * Create building (Admin only)
   */
  static async create(data: CreateBuildingCommand): Promise<string> {
    const response = await apiClient.post<ServiceResponse<string>>(
      "/api/buildings",
      data
    );

    if (response.data.isSuccess && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.errorMessage || "Failed to create building");
  }

  /**
   * Update building (Admin only)
   */
  static async update(id: string, data: UpdateBuildingCommand): Promise<void> {
    const response = await apiClient.put<ServiceResponse<null>>(
      `/api/buildings/${id}`,
      data
    );

    if (!response.data.isSuccess) {
      throw new Error(response.data.errorMessage || "Failed to update building");
    }
  }

  /**
   * Delete building (Admin only)
   */
  static async delete(id: string): Promise<void> {
    const response = await apiClient.delete<ServiceResponse<null>>(
      `/api/buildings/${id}`
    );

    if (!response.data.isSuccess) {
      throw new Error(response.data.errorMessage || "Failed to delete building");
    }
  }
}

