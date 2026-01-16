/**
 * Generic API Response Wrapper
 */
export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

/**
 * API Error Response
 */
export interface ApiError {
    message: string;
    code?: string;
    errors?: Record<string, string[]>;
    statusCode: number;
}

/**
 * Query Parameters for Filtering
 */
export interface QueryParams {
    search?: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

/**
 * Node Query Parameters
 */
export interface NodeQueryParams extends QueryParams {
    floorId?: string;
    type?: string;
    isAccessible?: boolean;
}

/**
 * Floor Query Parameters
 */
export interface FloorQueryParams extends QueryParams {
    buildingId?: string;
}
