/**
 * Edges API Service
 * 
 * Handles all edge-related API calls.
 */

import { apiClient } from './client';
import {
    ServiceResponse,
    PaginatedList,
    EdgeDto,
    CreateEdgeCommand,
    UpdateEdgeCommand,
    isSuccessResponse,
} from './types';

class EdgesApiService {
    private readonly BASE_PATH = '/api/edges';

    /**
     * Get all edges (paginated)
     */
    async getAll(
        pageNumber = 1,
        pageSize = 100
    ): Promise<PaginatedList<EdgeDto>> {
        const response = await apiClient.get<
            ServiceResponse<PaginatedList<EdgeDto>>
        >(`${this.BASE_PATH}?pageNumber=${pageNumber}&pageSize=${pageSize}`);

        if (isSuccessResponse(response.data)) {
            return response.data.data;
        }

        throw new Error(response.data.errorMessage || 'Failed to fetch edges');
    }

    /**
     * Get edge by ID
     */
    async getById(id: string): Promise<EdgeDto> {
        const response = await apiClient.get<ServiceResponse<EdgeDto>>(
            `${this.BASE_PATH}/${id}`
        );

        if (isSuccessResponse(response.data)) {
            return response.data.data;
        }

        throw new Error(response.data.errorMessage || 'Edge not found');
    }

    /**
     * Get edges connected to a specific node
     */
    async getByNode(nodeId: string): Promise<EdgeDto[]> {
        const response = await apiClient.get<ServiceResponse<EdgeDto[]>>(
            `${this.BASE_PATH}/by-node/${nodeId}`
        );

        if (isSuccessResponse(response.data)) {
            return response.data.data;
        }

        throw new Error(response.data.errorMessage || 'Failed to fetch edges');
    }

    /**
     * Create a new edge
     */
    async create(data: CreateEdgeCommand): Promise<string> {
        const response = await apiClient.post<ServiceResponse<string>>(
            this.BASE_PATH,
            data
        );

        if (isSuccessResponse(response.data)) {
            return response.data.data;
        }

        throw new Error(response.data.errorMessage || 'Failed to create edge');
    }

    /**
     * Update an existing edge
     */
    async update(id: string, data: UpdateEdgeCommand): Promise<void> {
        const response = await apiClient.put<ServiceResponse<null>>(
            `${this.BASE_PATH}/${id}`,
            { ...data, id }
        );

        if (!response.data.isSuccess) {
            throw new Error(response.data.errorMessage || 'Failed to update edge');
        }
    }

    /**
     * Delete an edge
     */
    async delete(id: string): Promise<void> {
        const response = await apiClient.delete<ServiceResponse<null>>(
            `${this.BASE_PATH}/${id}`
        );

        if (!response.data.isSuccess) {
            throw new Error(response.data.errorMessage || 'Failed to delete edge');
        }
    }
}

// Export singleton instance
export const edgesApi = new EdgesApiService();

// Also export class for testing purposes
export { EdgesApiService };
