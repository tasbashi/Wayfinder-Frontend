import { apiClient } from "./client";
import {
    CorridorDto,
    Corridor,
    CreateCorridorCommand,
    UpdateCorridorCommand,
    parseCorridorDto
} from "../types/corridor.types";
import { ServiceResponse } from "../types/api.types";

export class CorridorService {
    /**
     * Get corridor by ID
     */
    static async getById(id: string): Promise<Corridor> {
        const response = await apiClient.get<ServiceResponse<CorridorDto>>(
            `/api/corridors/${id}`
        );

        if (response.data.isSuccess && response.data.data) {
            return parseCorridorDto(response.data.data);
        }

        throw new Error(response.data.errorMessage || "Corridor not found");
    }

    /**
     * Get all corridors for a floor
     */
    static async getByFloor(floorId: string): Promise<Corridor[]> {
        const response = await apiClient.get<ServiceResponse<CorridorDto[]>>(
            `/api/corridors/by-floor/${floorId}`
        );

        if (response.data.isSuccess && response.data.data) {
            return response.data.data.map(parseCorridorDto);
        }

        throw new Error(response.data.errorMessage || "Failed to fetch corridors");
    }

    /**
     * Create corridor
     */
    static async create(data: CreateCorridorCommand): Promise<string> {
        const response = await apiClient.post<ServiceResponse<string>>(
            "/api/corridors",
            data
        );

        if (response.data.isSuccess && response.data.data) {
            return response.data.data;
        }

        throw new Error(response.data.errorMessage || "Failed to create corridor");
    }

    /**
     * Update corridor
     */
    static async update(id: string, data: UpdateCorridorCommand): Promise<void> {
        const response = await apiClient.put<ServiceResponse<null>>(
            `/api/corridors/${id}`,
            data
        );

        if (!response.data.isSuccess) {
            throw new Error(response.data.errorMessage || "Failed to update corridor");
        }
    }

    /**
     * Delete corridor
     */
    static async delete(id: string): Promise<void> {
        const response = await apiClient.delete<ServiceResponse<null>>(
            `/api/corridors/${id}`
        );

        if (!response.data.isSuccess) {
            throw new Error(response.data.errorMessage || "Failed to delete corridor");
        }
    }
}
