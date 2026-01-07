/**
 * Wayfinder Mobile - API Types
 * 
 * Unified type definitions matching backend API responses exactly.
 * All types in this file correspond to DTOs from the Wayfinder.Application layer.
 */

// =====================================================
// ENUMS
// =====================================================

/**
 * Node type enum matching backend NodeType
 * Used to categorize different types of locations in a building.
 */
export enum NodeType {
    Room = 0,
    Corridor = 1,
    Elevator = 2,
    Stairs = 3,
    Entrance = 4,
    Restroom = 5,
    InformationDesk = 6,
    Unknown = 7,
}

/**
 * Edge type enum for connections between nodes
 * Determines the type of path between two nodes.
 */
export enum EdgeType {
    Walking = 'Walking',
    Stairs = 'Stairs',
    Elevator = 'Elevator',
    Transition = 'Transition',
}

/**
 * Get NodeType from string name (backend may return as string)
 */
export function getNodeTypeFromName(name: string | NodeType): NodeType {
    if (typeof name === 'number') return name;

    const normalized = name.toLowerCase();
    switch (normalized) {
        case 'room': return NodeType.Room;
        case 'corridor': return NodeType.Corridor;
        case 'elevator': return NodeType.Elevator;
        case 'stairs': return NodeType.Stairs;
        case 'entrance': return NodeType.Entrance;
        case 'restroom': return NodeType.Restroom;
        case 'informationdesk': return NodeType.InformationDesk;
        default: return NodeType.Unknown;
    }
}

/**
 * Get display name for NodeType
 */
export function getNodeTypeName(type: NodeType): string {
    switch (type) {
        case NodeType.Room: return 'Room';
        case NodeType.Corridor: return 'Corridor';
        case NodeType.Elevator: return 'Elevator';
        case NodeType.Stairs: return 'Stairs';
        case NodeType.Entrance: return 'Entrance';
        case NodeType.Restroom: return 'Restroom';
        case NodeType.InformationDesk: return 'Information Desk';
        default: return 'Unknown';
    }
}

// =====================================================
// API RESPONSE WRAPPERS
// =====================================================

/**
 * Standard API response wrapper
 * All API endpoints return this structure.
 */
export interface ServiceResponse<T> {
    isSuccess: boolean;
    data?: T;
    errorMessage?: string;
    errors?: string[];
}

/**
 * Paginated list response for list endpoints
 */
export interface PaginatedList<T> {
    items: T[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

// =====================================================
// BUILDING DTOs
// =====================================================

/**
 * Building data transfer object
 * Represents a building with its associated floors.
 */
export interface BuildingDto {
    id: string;
    name: string;
    address?: string;
    floors: FloorDto[];
}

/**
 * Command to create a new building
 */
export interface CreateBuildingCommand {
    name: string;
    address?: string;
}

/**
 * Command to update an existing building
 */
export interface UpdateBuildingCommand {
    id: string;
    name: string;
    address?: string;
}

// =====================================================
// FLOOR DTOs
// =====================================================

/**
 * Floor data transfer object
 * Represents a floor within a building.
 */
export interface FloorDto {
    id: string;
    buildingId: string;
    name: string;
    floorNumber: number;
    floorPlanImageUrl?: string;
}

/**
 * Command to create a new floor
 */
export interface CreateFloorCommand {
    buildingId: string;
    name: string;
    floorNumber: number;
    floorPlanImageUrl?: string;
}

/**
 * Command to update an existing floor
 */
export interface UpdateFloorCommand {
    id: string;
    buildingId: string;
    name: string;
    floorNumber: number;
    floorPlanImageUrl?: string;
}

// =====================================================
// NODE DTOs
// =====================================================

/**
 * Node data transfer object
 * Represents a point/location on a floor.
 */
export interface NodeDto {
    id: string;
    name?: string;
    nodeType: NodeType;
    x: number;
    y: number;
    qrCode?: string;
    floorId: string;
}

/**
 * Command to create a new node
 */
export interface CreateNodeCommand {
    name?: string;
    nodeType: NodeType;
    x: number;
    y: number;
    qrCode?: string;
    floorId: string;
}

/**
 * Command to update an existing node
 */
export interface UpdateNodeCommand {
    id: string;
    name?: string;
    nodeType: NodeType;
    x: number;
    y: number;
    qrCode?: string;
    floorId: string;
}

// =====================================================
// EDGE DTOs
// =====================================================

/**
 * Edge data transfer object
 * Represents a connection/path between two nodes.
 */
export interface EdgeDto {
    id: string;
    nodeAId: string;
    nodeBId: string;
    weight: number;
    edgeType: EdgeType;
    isAccessible: boolean;
}

/**
 * Command to create a new edge
 */
export interface CreateEdgeCommand {
    nodeAId: string;
    nodeBId: string;
    weight: number;
    edgeType?: EdgeType;
    isAccessible?: boolean;
}

/**
 * Command to update an existing edge
 */
export interface UpdateEdgeCommand {
    id: string;
    nodeAId: string;
    nodeBId: string;
    weight: number;
    edgeType: EdgeType;
    isAccessible: boolean;
}

// =====================================================
// ROUTE DTOs
// =====================================================

/**
 * Single point in a corridor path
 */
export interface PathPointDto {
    x: number;
    y: number;
}

/**
 * Route node with navigation instruction
 * Represents a step in the calculated route.
 */
export interface RouteNodeDto {
    nodeId: string;
    name?: string;
    nodeType: NodeType;
    x: number;
    y: number;
    floorId: string;
    floorName: string;
    instruction: string;
    distanceFromPrevious: number;
    corridorPathPoints?: PathPointDto[];
}

/**
 * Path calculation result
 * Contains the complete route from start to end.
 */
export interface PathResult {
    pathFound: boolean;
    totalDistance: number;
    estimatedTimeSeconds: number;
    path: RouteNodeDto[];
    errorMessage?: string;
}

/**
 * Extended path result with derived fields
 */
export interface PathResultExtended extends PathResult {
    estimatedTimeMinutes: number;
    instructions: string[];
}

/**
 * Route calculation request parameters
 */
export interface CalculateRouteParams {
    startNodeId: string;
    endNodeId: string;
    requireAccessible?: boolean;
}

// =====================================================
// SEARCH DTOs
// =====================================================

/**
 * Search parameters for node search
 */
export interface SearchParams {
    searchTerm: string;
    floorId?: string;
    buildingId?: string;
    maxResults?: number;
}

/**
 * Parameters for searching nodes by type
 */
export interface SearchByTypeParams {
    nodeType: NodeType;
    floorId?: string;
    buildingId?: string;
}

/**
 * Parameters for finding nearest node by type
 */
export interface NearestByTypeParams {
    x: number;
    y: number;
    floorId: string;
    nodeType: NodeType;
}

// =====================================================
// ANALYTICS DTOs (for future use)
// =====================================================

/**
 * Dashboard summary statistics
 */
export interface DashboardSummaryDto {
    totalQRCodeScans: number;
    totalRouteCalculations: number;
    totalSearchQueries: number;
    totalAccessibleRoutes: number;
    totalEvents: number;
    uniqueUsers: number;
    averageResponseTimeMs: number;
    startDate: string;
    endDate: string;
}

/**
 * Popular node statistics
 */
export interface PopularNodeDto {
    nodeId: string;
    nodeName?: string;
    scanCount: number;
    buildingId?: string;
    buildingName?: string;
    floorId?: string;
    floorName?: string;
}

/**
 * Popular route statistics
 */
export interface PopularRouteDto {
    startNodeId: string;
    startNodeName?: string;
    endNodeId: string;
    endNodeName?: string;
    usageCount: number;
    buildingId?: string;
    buildingName?: string;
}

/**
 * Search term statistics
 */
export interface SearchTermDto {
    searchTerm: string;
    searchCount: number;
}

// =====================================================
// TYPE GUARDS
// =====================================================

/**
 * Check if a value is a valid NodeType
 */
export function isValidNodeType(value: unknown): value is NodeType {
    return typeof value === 'number' && value >= 0 && value <= 7;
}

/**
 * Check if a value is a valid EdgeType
 */
export function isValidEdgeType(value: unknown): value is EdgeType {
    return typeof value === 'string' &&
        ['Walking', 'Stairs', 'Elevator', 'Transition'].includes(value);
}

/**
 * Check if ServiceResponse is successful with data
 */
export function isSuccessResponse<T>(
    response: ServiceResponse<T>
): response is ServiceResponse<T> & { data: T } {
    return response.isSuccess && response.data !== undefined;
}
