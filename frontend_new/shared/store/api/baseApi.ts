import { createApi, fetchBaseQuery, type FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { BaseState } from '../createStore';

// Custom error type
export interface ApiError {
  status: number;
  data: {
    message: string;
    errors?: Record<string, string[]>;
  };
}

// Base query with error handling and auth
export const baseQuery = fetchBaseQuery({
  prepareHeaders: (headers, { getState }) => {
    // Get token from auth state
    const token = (getState() as BaseState).auth?.token;
    
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    return headers;
  },
}) as BaseQueryFn;

// Error handler that transforms errors into a consistent format
const baseQueryWithErrorHandler: BaseQueryFn = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  
  if (result.error) {
    const error = result.error as FetchBaseQueryError;
    
    // Transform error into consistent format
    const apiError: ApiError = {
      status: error.status as number,
      data: {
        message: 'error' in error ? error.error : (error.data as any)?.message || 'An unknown error occurred',
        errors: (error.data as any)?.errors,
      },
    };
    
    return {
      error: apiError,
    };
  }
  
  return result;
};

// Create base API slice with common configuration
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithErrorHandler,
  endpoints: () => ({}),
  // Common tag types that can be used by extended APIs
  tagTypes: [
    'Auth',
    'User',
    'Property',
    'Personnel',
    'Transaction',
    'Report',
  ] as const,
});

// Export API types
export type BaseApi = typeof baseApi;

// Helper to create API endpoints with proper typing
export type ApiEndpointBuilder = typeof baseApi.endpoints;

// Re-export common RTK Query types
export type {
  QueryDefinition,
  MutationDefinition,
} from '@reduxjs/toolkit/query';

// Export reducer and middleware
export const {
  reducer: baseApiReducer,
  middleware: baseApiMiddleware,
  util: baseApiUtil,
} = baseApi;
