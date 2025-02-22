import { combineReducers } from '@reduxjs/toolkit';
import { authReducer } from './auth';
import { baseApi } from '../api/baseApi';

// Re-export all slice modules
export * from './auth';

// Export combined reducers
export const sharedReducers = {
  auth: authReducer,
  [baseApi.reducerPath]: baseApi.reducer,
} as const;
