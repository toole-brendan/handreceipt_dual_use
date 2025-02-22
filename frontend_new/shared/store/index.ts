// Re-export store creation utilities
export * from './createStore';

// Re-export API utilities
export * from './api/baseApi';

// Re-export slices and reducers
export * from './slices';

// Export middleware array
import { baseApi, baseApiMiddleware } from './api/baseApi';

export const sharedMiddleware = [baseApiMiddleware] as const;

// Export store configuration type
import type { BaseState } from './createStore';
import type { Middleware } from '@reduxjs/toolkit';

export interface StoreConfig<S extends BaseState = BaseState> {
  // Additional reducers specific to each app
  reducers?: { [K in keyof Omit<S, keyof BaseState>]: any };
  // Additional middleware specific to each app
  middleware?: Middleware[];
  // Initial state
  preloadedState?: Partial<S>;
}

// Export store creation helper
import { createBaseStore } from './createStore';
import { sharedReducers } from './slices';

export function createAppStore<S extends BaseState = BaseState>(config: StoreConfig<S> = {}) {
  const initialState = {
    ...config.preloadedState,
    api: baseApi.reducer(undefined, { type: '@@INIT' }),
  } as S;

  return createBaseStore<S>({
    reducer: {
      ...sharedReducers,
      ...config.reducers,
    } as any,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .concat(sharedMiddleware)
        .concat(config.middleware || []) as any,
    preloadedState: initialState,
  });
}
