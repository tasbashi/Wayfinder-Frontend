/**
 * Standard API response wrapper
 */
export interface ServiceResponse<T> {
  isSuccess: boolean;
  data?: T;
  errorMessage?: string;
  errors?: string[];
}

/**
 * Paginated list response
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

