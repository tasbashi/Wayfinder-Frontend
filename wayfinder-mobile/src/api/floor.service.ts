import { apiClient } from "./client";
import { FloorDto } from "../types/floor.types";
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
}

