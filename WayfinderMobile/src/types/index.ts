/**
 * Node Types - Matches Backend NodeType Enum
 */
export type NodeType =
    | "Room"
    | "Corridor"
    | "Elevator"
    | "Stairs"
    | "Restroom"
    | "Entrance"
    | "Exit"
    | "Office"
    | "Cafeteria"
    | "Parking"
    | "Other";

/**
 * Node DTO - Matches Wayfinder.Application.Features.Nodes.Dtos.NodeDto
 */
export interface Node {
    id: string;
    name: string;
    type: NodeType;
    x: number;
    y: number;
    floorId: string;
    isAccessible: boolean;
    qrCode?: string;
    description?: string;
}

/**
 * Edge DTO - Matches Wayfinder.Application.Features.Edges.Dtos.EdgeDto
 */
export interface Edge {
    id: string;
    fromNodeId: string;
    toNodeId: string;
    weight: number;
    isAccessible: boolean;
}

/**
 * Floor DTO - Matches Wayfinder.Application.Features.Floors.Dtos.FloorDto
 */
export interface Floor {
    id: string;
    name: string;
    level: number;
    buildingId: string;
    floorPlanUrl?: string;
    nodes?: Node[];
    edges?: Edge[];
}

/**
 * Building DTO - Matches Wayfinder.Application.Features.Buildings.Dtos.BuildingDto
 */
export interface Building {
    id: string;
    name: string;
    address?: string;
    description?: string;
    latitude?: number;
    longitude?: number;
    imageUrl?: string;
    floors?: Floor[];
}

/**
 * Path Result DTO - Matches Wayfinder.Application.Features.Routes.Dtos.PathResult
 */
export interface PathResult {
    totalDistance: number;
    estimatedTimeMinutes: number;
    pathNodes: Node[];
    pathEdges?: Edge[];
}

/**
 * Route Request DTO
 */
export interface RouteRequest {
    startNodeId: string;
    endNodeId: string;
    isAccessible?: boolean;
}

/**
 * Navigation Step - For turn-by-turn navigation
 */
export interface NavigationStep {
    node: Node;
    instruction: string;
    distance: number;
    direction?: "straight" | "left" | "right" | "up" | "down";
}

// Re-export all types
export * from "./api.types";
export * from "./navigation.types";
