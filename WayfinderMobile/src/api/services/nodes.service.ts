import { get } from "../client";
import { ENDPOINTS } from "@/config/api.config";
import type { Node } from "@/types";

/**
 * Get all nodes
 */
export const getNodes = async (): Promise<Node[]> => {
    return get<Node[]>(ENDPOINTS.nodes);
};

/**
 * Get node by ID
 */
export const getNodeById = async (id: string): Promise<Node> => {
    return get<Node>(ENDPOINTS.nodeById(id));
};

/**
 * Get nodes by floor ID
 */
export const getNodesByFloorId = async (floorId: string): Promise<Node[]> => {
    return get<Node[]>(ENDPOINTS.nodesByFloor(floorId));
};

/**
 * Get node by QR code
 */
export const getNodeByQRCode = async (qrCode: string): Promise<Node> => {
    return get<Node>(ENDPOINTS.nodeByQRCode(qrCode));
};
