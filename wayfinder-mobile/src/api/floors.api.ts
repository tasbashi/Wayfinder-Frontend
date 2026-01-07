/**
 * Floors API Service
 * 
 * Handles all floor-related API calls.
 */

import { apiClient } from './client';
import {
    ServiceResponse,
    PaginatedList,
    FloorDto,
    CreateFloorCommand,
    UpdateFloorCommand,
    isSuccessResponse,
} from './types';

class FloorsApiService {
    private readonly BASE_PATH = '/api/floors';

    /**
     * Get all floors (paginated)
     */
    async getAll(
        pageNumber = 1,
        pageSize = 10
    ): Promise<PaginatedList<FloorDto>> {
        const response = await apiClient.get<
            ServiceResponse<PaginatedList<FloorDto>>
        >(`${this.BASE_PATH}?pageNumber=${pageNumber}&pageSize=${pageSize}`);

        if (isSuccessResponse(response.data)) {
            return response.data.data;
        }

        throw new Error(response.data.errorMessage || 'Failed to fetch floors');
    }

    /**
     * Get floor by ID
     */
    async getById(id: string): Promise<FloorDto> {
        const response = await apiClient.get<ServiceResponse<FloorDto>>(
            `${this.BASE_PATH}/${id}`
        );

        if (isSuccessResponse(response.data)) {
            return response.data.data;
        }

        throw new Error(response.data.errorMessage || 'Floor not found');
    }

    /**
     * Get floors by building ID
     */
    async getByBuilding(buildingId: string): Promise<FloorDto[]> {
        const response = await apiClient.get<ServiceResponse<FloorDto[]>>(
            `${this.BASE_PATH}/by-building/${buildingId}`
        );

        if (isSuccessResponse(response.data)) {
            return response.data.data;
        }

        throw new Error(response.data.errorMessage || 'Failed to fetch floors');
    }

    /**
     * Create a new floor
     */
    async create(data: CreateFloorCommand): Promise<string> {
        const response = await apiClient.post<ServiceResponse<string>>(
            this.BASE_PATH,
            data
        );

        if (isSuccessResponse(response.data)) {
            return response.data.data;
        }

        throw new Error(response.data.errorMessage || 'Failed to create floor');
    }

    /**
     * Update an existing floor
     */
    async update(id: string, data: UpdateFloorCommand): Promise<void> {
        const response = await apiClient.put<ServiceResponse<null>>(
            `${this.BASE_PATH}/${id}`,
            { ...data, id }
        );

        if (!response.data.isSuccess) {
            throw new Error(response.data.errorMessage || 'Failed to update floor');
        }
    }

    /**
     * Delete a floor
     */
    async delete(id: string): Promise<void> {
        const response = await apiClient.delete<ServiceResponse<null>>(
            `${this.BASE_PATH}/${id}`
        );

        if (!response.data.isSuccess) {
            throw new Error(response.data.errorMessage || 'Failed to delete floor');
        }
    }
}

// Export singleton instance
export const floorsApi = new FloorsApiService();

// Also export class for testing purposes
export { FloorsApiService };
