/**
 * API Configuration
 */
export const API_CONFIG = {
    baseUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api",
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
} as const;

/**
 * API Endpoints
 */
export const ENDPOINTS = {
    // Buildings
    buildings: "/buildings",
    buildingById: (id: string) => `/buildings/${id}`,

    // Floors
    floors: "/floors",
    floorById: (id: string) => `/floors/${id}`,
    floorsByBuilding: (buildingId: string) => `/buildings/${buildingId}/floors`,

    // Nodes
    nodes: "/nodes",
    nodeById: (id: string) => `/nodes/${id}`,
    nodesByFloor: (floorId: string) => `/floors/${floorId}/nodes`,
    nodeByQRCode: (qrCode: string) => `/nodes/qr/${qrCode}`,

    // Edges
    edges: "/edges",
    edgesByFloor: (floorId: string) => `/floors/${floorId}/edges`,

    // Routes
    calculateRoute: "/routes/calculate",
} as const;

export type EndpointKey = keyof typeof ENDPOINTS;
