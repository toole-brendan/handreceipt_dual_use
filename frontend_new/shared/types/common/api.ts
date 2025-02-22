/**
 * Common API types
 */

/**
 * Generic API response interface
 */
export interface ApiResponse<T = any> {
  /** Response data */
  data: T;
  /** Response metadata */
  meta?: {
    /** Total count for paginated responses */
    total?: number;
    /** Current page for paginated responses */
    page?: number;
    /** Items per page for paginated responses */
    perPage?: number;
  };
  /** Response status */
  status: number;
  /** Response message */
  message?: string;
}

/**
 * API error interface
 */
export interface ApiError {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Error details */
  details?: Record<string, any>;
  /** HTTP status code */
  status: number;
  /** Stack trace (development only) */
  stack?: string;
}

/**
 * API pagination parameters
 */
export interface ApiPaginationParams {
  /** Page number (1-based) */
  page?: number;
  /** Items per page */
  perPage?: number;
  /** Sort field */
  sortBy?: string;
  /** Sort direction */
  sortDir?: 'asc' | 'desc';
}

/**
 * API filter parameters
 */
export interface ApiFilterParams {
  /** Search query */
  search?: string;
  /** Filter field */
  [key: string]: any;
}

/**
 * API request options
 */
export interface ApiRequestOptions {
  /** Request headers */
  headers?: Record<string, string>;
  /** Request query parameters */
  params?: Record<string, any>;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Whether to include credentials */
  withCredentials?: boolean;
  /** Response type */
  responseType?: 'json' | 'blob' | 'text' | 'arraybuffer';
}

/**
 * API list response interface
 */
export interface ApiListResponse<T> extends ApiResponse<T[]> {
  meta: {
    /** Total number of items */
    total: number;
    /** Current page number */
    page: number;
    /** Number of items per page */
    perPage: number;
    /** Total number of pages */
    pageCount: number;
  };
}
