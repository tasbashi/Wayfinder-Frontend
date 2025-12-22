/**
 * Corridor polyline types for the Wayfinder Admin Panel
 */

/**
 * Point in 2D space for corridor path
 */
export interface PathPoint {
    x: number;
    y: number;
}

/**
 * Corridor Data Transfer Object
 */
export interface CorridorDto {
    id: string;
    name: string;
    pathPointsJson: string; // JSON string: [{"x":100,"y":50},{"x":200,"y":50}]
    isAccessible: boolean;
    width: number;
    floorId: string;
}

/**
 * Parsed corridor with path points as array
 */
export interface Corridor {
    id: string;
    name: string;
    pathPoints: PathPoint[];
    isAccessible: boolean;
    width: number;
    floorId: string;
}

/**
 * Create corridor command
 */
export interface CreateCorridorCommand {
    name: string;
    pathPointsJson: string;
    isAccessible: boolean;
    width: number;
    floorId: string;
}

/**
 * Update corridor command
 */
export interface UpdateCorridorCommand {
    id: string;
    name: string;
    pathPointsJson: string;
    isAccessible: boolean;
    width: number;
}

/**
 * Convert CorridorDto to Corridor (parse JSON)
 */
export function parseCorridorDto(dto: CorridorDto): Corridor {
    let pathPoints: PathPoint[] = [];
    try {
        pathPoints = JSON.parse(dto.pathPointsJson);
    } catch {
        pathPoints = [];
    }
    return {
        id: dto.id,
        name: dto.name,
        pathPoints,
        isAccessible: dto.isAccessible,
        width: dto.width,
        floorId: dto.floorId,
    };
}

/**
 * Convert path points array to JSON string
 */
export function stringifyPathPoints(points: PathPoint[]): string {
    return JSON.stringify(points);
}
