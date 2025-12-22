import { apiClient } from "./client";
import {
  FloorDto,
  CreateFloorCommand,
  UpdateFloorCommand,
} from "../types/floor.types";
import { ServiceResponse } from "../types/api.types";

export class FloorService {
  /**
   * Get all floors
   */
  static async getAll(): Promise<FloorDto[]> {
    const response = await apiClient.get<ServiceResponse<FloorDto[]>>(
      "/api/floors"
    );

    if (response.data.isSuccess && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.errorMessage || "Failed to fetch floors");
  }

  /**
   * Get floor by ID
   */
  static async getById(id: string): Promise<FloorDto> {
    const response = await apiClient.get<ServiceResponse<FloorDto>>(
      `/api/floors/${id}`
    );

    if (response.data.isSuccess && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.errorMessage || "Floor not found");
  }

  /**
   * Get floors by building
   */
  static async getByBuilding(buildingId: string): Promise<FloorDto[]> {
    const response = await apiClient.get<ServiceResponse<FloorDto[]>>(
      `/api/floors/by-building/${buildingId}`
    );

    if (response.data.isSuccess && response.data.data) {
      return response.data.data;
    }

    throw new Error(
      response.data.errorMessage || "Failed to fetch floors for building"
    );
  }

  /**
   * Create floor (Admin/Manager)
   */
  static async create(data: CreateFloorCommand): Promise<string> {
    const response = await apiClient.post<ServiceResponse<string>>(
      "/api/floors",
      data
    );

    if (response.data.isSuccess && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.errorMessage || "Failed to create floor");
  }

  /**
   * Update floor (Admin/Manager)
   */
  static async update(id: string, data: UpdateFloorCommand): Promise<void> {
    const response = await apiClient.put<ServiceResponse<null>>(
      `/api/floors/${id}`,
      data
    );

    if (!response.data.isSuccess) {
      throw new Error(response.data.errorMessage || "Failed to update floor");
    }
  }

  /**
   * Delete floor (Admin only)
   */
  static async delete(id: string): Promise<void> {
    const response = await apiClient.delete<ServiceResponse<null>>(
      `/api/floors/${id}`
    );

    if (!response.data.isSuccess) {
      throw new Error(response.data.errorMessage || "Failed to delete floor");
    }
  }

  /**
   * Upload floor plan image
   */
  static async uploadFloorPlan(floorId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<ServiceResponse<string>>(
      `/api/floors/${floorId}/floor-plan`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.isSuccess && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.errorMessage || "Failed to upload floor plan");
  }

  /**
   * Delete floor plan image
   */
  static async deleteFloorPlan(floorId: string): Promise<void> {
    const response = await apiClient.delete<ServiceResponse<null>>(
      `/api/floors/${floorId}/floor-plan`
    );

    if (!response.data.isSuccess) {
      throw new Error(response.data.errorMessage || "Failed to delete floor plan");
    }
  }
}

