import { apiClient } from "./client";
import { NodeDto, CreateNodeCommand, UpdateNodeCommand, NodeType } from "../types/node.types";
import { ServiceResponse, PaginatedList } from "../types/api.types";
import { getNodeTypeFromName, getNodeTypeName } from "../utils/nodeTypeUtils";

export class NodeService {
  /**
   * Get all nodes (paginated)
   */
  static async getAll(pageNumber = 1, pageSize = 10) {
    const response = await apiClient.get<
      ServiceResponse<PaginatedList<NodeDto>>
    >(`/api/nodes?pageNumber=${pageNumber}&pageSize=${pageSize}`);

    if (response.data.isSuccess && response.data.data) {
      // Convert string nodeType name (e.g., "Room") to NodeType enum if needed
      return {
        ...response.data.data,
        items: response.data.data.items.map(node => ({
          ...node,
          nodeType: typeof node.nodeType === 'string' 
            ? getNodeTypeFromName(node.nodeType)
            : node.nodeType
        }))
      };
    }

    throw new Error(response.data.errorMessage || "Failed to fetch nodes");
  }

  /**
   * Get node by ID
   */
  static async getById(id: string): Promise<NodeDto> {
    const response = await apiClient.get<ServiceResponse<NodeDto>>(
      `/api/nodes/${id}`
    );

    if (response.data.isSuccess && response.data.data) {
      const node = response.data.data;
      // Convert string nodeType name (e.g., "Room") to NodeType enum if needed
      if (typeof node.nodeType === 'string') {
        node.nodeType = getNodeTypeFromName(node.nodeType);
      }
      return node;
    }

    throw new Error(response.data.errorMessage || "Node not found");
  }

  /**
   * Get nodes by floor
   */
  static async getByFloor(floorId: string): Promise<NodeDto[]> {
    const response = await apiClient.get<ServiceResponse<NodeDto[]>>(
      `/api/nodes/by-floor/${floorId}`
    );

    if (response.data.isSuccess && response.data.data) {
      // Convert string nodeType name (e.g., "Room") to NodeType enum if needed
      return response.data.data.map(node => ({
        ...node,
        nodeType: typeof node.nodeType === 'string' 
          ? getNodeTypeFromName(node.nodeType)
          : node.nodeType
      }));
    }

    throw new Error(response.data.errorMessage || "Failed to fetch nodes");
  }

  /**
   * Scan QR code to identify node
   */
  static async scanQRCode(qrCode: string): Promise<NodeDto> {
    const response = await apiClient.get<ServiceResponse<NodeDto>>(
      "/api/nodes/scan-qr",
      {
        params: { qrCode },
      }
    );

    if (response.data.isSuccess && response.data.data) {
      const node = response.data.data;
      // Convert string nodeType name (e.g., "Room") to NodeType enum if needed
      if (typeof node.nodeType === 'string') {
        node.nodeType = getNodeTypeFromName(node.nodeType);
      }
      return node;
    }

    throw new Error(response.data.errorMessage || "QR code not found");
  }

  /**
   * Search nodes
   */
  static async search(searchTerm: string, buildingId?: string): Promise<NodeDto[]> {
    const response = await apiClient.get<ServiceResponse<NodeDto[]>>(
      "/api/search/nodes",
      {
        params: {
          searchTerm,
          buildingId,
        },
      }
    );

    if (response.data.isSuccess && response.data.data) {
      // Convert string nodeType name (e.g., "Room") to NodeType enum if needed
      return response.data.data.map(node => ({
        ...node,
        nodeType: typeof node.nodeType === 'string' 
          ? getNodeTypeFromName(node.nodeType)
          : node.nodeType
      }));
    }

    throw new Error(response.data.errorMessage || "Search failed");
  }

  /**
   * Create node (Admin/Manager)
   */
  static async create(data: CreateNodeCommand): Promise<string> {
    const response = await apiClient.post<ServiceResponse<string>>(
      "/api/nodes",
      data
    );

    if (response.data.isSuccess && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.errorMessage || "Failed to create node");
  }

  /**
   * Update node (Admin/Manager)
   */
  static async update(id: string, data: UpdateNodeCommand): Promise<void> {
    const response = await apiClient.put<ServiceResponse<null>>(
      `/api/nodes/${id}`,
      data
    );

    if (!response.data.isSuccess) {
      throw new Error(response.data.errorMessage || "Failed to update node");
    }
  }

  /**
   * Delete node (Admin/Manager)
   */
  static async delete(id: string): Promise<void> {
    const response = await apiClient.delete<ServiceResponse<null>>(
      `/api/nodes/${id}`
    );

    if (!response.data.isSuccess) {
      throw new Error(response.data.errorMessage || "Failed to delete node");
    }
  }

  /**
   * Generate QR code for node
   */
  static async generateQRCode(
    nodeId: string,
    floorNumber?: number,
    buildingCode?: string
  ): Promise<string> {
    const response = await apiClient.get<ServiceResponse<string>>(
      `/api/nodes/${nodeId}/generate-qr`,
      {
        params: {
          floorNumber,
          buildingCode,
        },
      }
    );

    if (response.data.isSuccess && response.data.data) {
      return response.data.data;
    }

    throw new Error(
      response.data.errorMessage || "Failed to generate QR code"
    );
  }
}
