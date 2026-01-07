/**
 * Buildings API Service
 * 
 * Handles all building-related API calls.
 */

import { apiClient } from './client';
import {
    ServiceResponse,
    PaginatedList,
    BuildingDto,
    CreateBuildingCommand,
    UpdateBuildingCommand,
    isSuccessResponse,
} from './types';

class BuildingsApiService {
    private readonly BASE_PATH = '/api/buildings';

    /**
     * Get all buildings (paginated)
     */
    async getAll(
        pageNumber = 1,
        pageSize = 10
    ): Promise<PaginatedList<BuildingDto>> {
        const response = await apiClient.get<
            ServiceResponse<PaginatedList<BuildingDto>>
        >(`${this.BASE_PATH}?pageNumber=${pageNumber}&pageSize=${pageSize}`);

        if (isSuccessResponse(response.data)) {
            return response.data.data;
        }

        throw new Error(response.data.errorMessage || 'Failed to fetch buildings');
    }

    /**
     * Get building by ID
     */
    async getById(id: string): Promise<BuildingDto> {
        const response = await apiClient.get<ServiceResponse<BuildingDto>>(
            `${this.BASE_PATH}/${id}`
        );

        if (isSuccessResponse(response.data)) {
            return response.data.data;
        }

        throw new Error(response.data.errorMessage || 'Building not found');
    }

    /**
     * Create a new building
     * Note: This is typically admin-only
     */
    async create(data: CreateBuildingCommand): Promise<string> {
        const response = await apiClient.post<ServiceResponse<string>>(
            this.BASE_PATH,
            data
        );

        if (isSuccessResponse(response.data)) {
            return response.data.data;
        }

        throw new Error(response.data.errorMessage || 'Failed to create building');
    }

    /**
     * Update an existing building
     * Note: This is typically admin-only
     */
    async update(id: string, data: UpdateBuildingCommand): Promise<void> {
        const response = await apiClient.put<ServiceResponse<null>>(
            `${this.BASE_PATH}/${id}`,
            { ...data, id }
        );

        if (!response.data.isSuccess) {
            throw new Error(response.data.errorMessage || 'Failed to update building');
        }
    }

    /**
     * Delete a building
     * Note: This is typically admin-only
     */
    async delete(id: string): Promise<void> {
        const response = await apiClient.delete<ServiceResponse<null>>(
            `${this.BASE_PATH}/${id}`
        );

        if (!response.data.isSuccess) {
            throw new Error(response.data.errorMessage || 'Failed to delete building');
        }
    }
}

// Export singleton instance
export const buildingsApi = new BuildingsApiService();

// Also export class for testing purposes
export { BuildingsApiService };
