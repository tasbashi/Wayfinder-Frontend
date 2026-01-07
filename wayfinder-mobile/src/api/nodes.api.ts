/**
 * Nodes API Service
 * 
 * Handles all node-related API calls including QR scanning and search.
 */

import { apiClient } from './client';
import {
    ServiceResponse,
    PaginatedList,
    NodeDto,
    NodeType,
    CreateNodeCommand,
    UpdateNodeCommand,
    SearchParams,
    SearchByTypeParams,
    NearestByTypeParams,
    isSuccessResponse,
    getNodeTypeFromName,
} from './types';

class NodesApiService {
    private readonly BASE_PATH = '/api/nodes';
    private readonly SEARCH_PATH = '/api/search';

    /**
     * Normalize node type from API response
     * API may return nodeType as string or number
     */
    private normalizeNode(node: NodeDto): NodeDto {
        return {
            ...node,
            nodeType:
                typeof node.nodeType === 'string'
                    ? getNodeTypeFromName(node.nodeType)
                    : node.nodeType,
        };
    }

    /**
     * Get all nodes (paginated)
     */
    async getAll(
        pageNumber = 1,
        pageSize = 10
    ): Promise<PaginatedList<NodeDto>> {
        const response = await apiClient.get<
            ServiceResponse<PaginatedList<NodeDto>>
        >(`${this.BASE_PATH}?pageNumber=${pageNumber}&pageSize=${pageSize}`);

        if (isSuccessResponse(response.data)) {
            return {
                ...response.data.data,
                items: response.data.data.items.map(this.normalizeNode),
            };
        }

        throw new Error(response.data.errorMessage || 'Failed to fetch nodes');
    }

    /**
     * Get node by ID
     */
    async getById(id: string): Promise<NodeDto> {
        const response = await apiClient.get<ServiceResponse<NodeDto>>(
            `${this.BASE_PATH}/${id}`
        );

        if (isSuccessResponse(response.data)) {
            return this.normalizeNode(response.data.data);
        }

        throw new Error(response.data.errorMessage || 'Node not found');
    }

    /**
     * Get nodes by floor ID
     */
    async getByFloor(floorId: string): Promise<NodeDto[]> {
        const response = await apiClient.get<ServiceResponse<NodeDto[]>>(
            `${this.BASE_PATH}/by-floor/${floorId}`
        );

        if (isSuccessResponse(response.data)) {
            return response.data.data.map(this.normalizeNode);
        }

        throw new Error(response.data.errorMessage || 'Failed to fetch nodes');
    }

    /**
     * Find nearest node to coordinates
     */
    async findNearest(x: number, y: number, floorId: string): Promise<NodeDto> {
        const response = await apiClient.get<ServiceResponse<NodeDto>>(
            `${this.BASE_PATH}/nearest`,
            {
                params: { x, y, floorId },
            }
        );

        if (isSuccessResponse(response.data)) {
            return this.normalizeNode(response.data.data);
        }

        throw new Error(response.data.errorMessage || 'No nearby node found');
    }

    /**
     * Scan QR code to get node
     */
    async scanQRCode(qrCode: string): Promise<NodeDto> {
        const response = await apiClient.get<ServiceResponse<NodeDto>>(
            `${this.BASE_PATH}/scan-qr`,
            {
                params: { qrCode },
            }
        );

        if (isSuccessResponse(response.data)) {
            return this.normalizeNode(response.data.data);
        }

        throw new Error(response.data.errorMessage || 'QR code not recognized');
    }

    /**
     * Generate QR code string for a node
     */
    async generateQRCode(nodeId: string): Promise<string> {
        const response = await apiClient.get<ServiceResponse<string>>(
            `${this.BASE_PATH}/${nodeId}/generate-qr`
        );

        if (isSuccessResponse(response.data)) {
            return response.data.data;
        }

        throw new Error(response.data.errorMessage || 'Failed to generate QR code');
    }

    /**
     * Search nodes by name
     */
    async search(params: SearchParams): Promise<NodeDto[]> {
        const response = await apiClient.get<ServiceResponse<NodeDto[]>>(
            `${this.SEARCH_PATH}/nodes`,
            {
                params: {
                    searchTerm: params.searchTerm,
                    floorId: params.floorId,
                    buildingId: params.buildingId,
                    maxResults: params.maxResults || 50,
                },
            }
        );

        if (isSuccessResponse(response.data)) {
            return response.data.data.map(this.normalizeNode);
        }

        throw new Error(response.data.errorMessage || 'Search failed');
    }

    /**
     * Search nodes by type
     */
    async searchByType(params: SearchByTypeParams): Promise<NodeDto[]> {
        const response = await apiClient.get<ServiceResponse<NodeDto[]>>(
            `${this.SEARCH_PATH}/nodes/by-type`,
            {
                params: {
                    nodeType: params.nodeType,
                    floorId: params.floorId,
                    buildingId: params.buildingId,
                },
            }
        );

        if (isSuccessResponse(response.data)) {
            return response.data.data.map(this.normalizeNode);
        }

        throw new Error(response.data.errorMessage || 'Search failed');
    }

    /**
     * Find nearest node of a specific type
     */
    async findNearestByType(params: NearestByTypeParams): Promise<NodeDto> {
        const response = await apiClient.get<ServiceResponse<NodeDto>>(
            `${this.SEARCH_PATH}/nearest-by-type`,
            {
                params: {
                    x: params.x,
                    y: params.y,
                    floorId: params.floorId,
                    nodeType: params.nodeType,
                },
            }
        );

        if (isSuccessResponse(response.data)) {
            return this.normalizeNode(response.data.data);
        }

        throw new Error(response.data.errorMessage || 'No matching node found');
    }

    /**
     * Create a new node
     */
    async create(data: CreateNodeCommand): Promise<string> {
        const response = await apiClient.post<ServiceResponse<string>>(
            this.BASE_PATH,
            data
        );

        if (isSuccessResponse(response.data)) {
            return response.data.data;
        }

        throw new Error(response.data.errorMessage || 'Failed to create node');
    }

    /**
     * Update an existing node
     */
    async update(id: string, data: UpdateNodeCommand): Promise<void> {
        const response = await apiClient.put<ServiceResponse<null>>(
            `${this.BASE_PATH}/${id}`,
            { ...data, id }
        );

        if (!response.data.isSuccess) {
            throw new Error(response.data.errorMessage || 'Failed to update node');
        }
    }

    /**
     * Delete a node
     */
    async delete(id: string): Promise<void> {
        const response = await apiClient.delete<ServiceResponse<null>>(
            `${this.BASE_PATH}/${id}`
        );

        if (!response.data.isSuccess) {
            throw new Error(response.data.errorMessage || 'Failed to delete node');
        }
    }
}

// Export singleton instance
export const nodesApi = new NodesApiService();

// Also export class for testing purposes
export { NodesApiService };
