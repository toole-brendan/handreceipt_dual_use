import { 
  configureStore, 
  type ConfigureStoreOptions, 
  type Store,
  type Middleware,
  type ThunkAction,
  type Action,
  type AnyAction
} from '@reduxjs/toolkit';
import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import type { Api } from '@reduxjs/toolkit/query';

// Base reducer type that all app reducers must extend
export interface BaseState {
  api: ReturnType<Api<any, any, any, any>['reducer']>;
  auth: {
    token: string | null;
    user: {
      id: string;
      email: string;
      roles: string[];
      permissions: string[];
    } | null;
    loading: boolean;
    error: string | null;
  };
}

// Helper type for partial state
export type PartialBaseState = {
  [K in keyof BaseState]?: Partial<BaseState[K]>;
};

// Create a base store creator that can be extended by each app
export function createBaseStore<S extends BaseState>(
  options: Omit<ConfigureStoreOptions<S>, 'reducer'> & {
    reducer: ConfigureStoreOptions<S>['reducer'];
    middleware?: (getDefaultMiddleware: any) => any[];
  }
) {
  return configureStore({
    ...options,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        },
        immutableCheck: process.env.NODE_ENV === 'development',
      }),
    devTools: process.env.NODE_ENV !== 'production',
  });
}

// Define the ThunkAction type for async actions
export type AppThunk<S extends BaseState, ReturnType = void> = ThunkAction<
  ReturnType,
  S,
  unknown,
  Action<string>
>;

// Helper to get store types
export type StoreType<S extends BaseState> = Store<S>;
export type AppDispatch<S extends BaseState> = StoreType<S>['dispatch'];
export type RootState<S extends BaseState> = ReturnType<StoreType<S>['getState']>;

// Create typed hooks factory
export function createStoreHooks<S extends BaseState>() {
  return {
    useAppDispatch: () => useDispatch<AppDispatch<S>>(),
    useAppSelector: useSelector as TypedUseSelectorHook<RootState<S>>,
  };
}

// Create a base slice state type that includes common fields
export interface BaseSliceState {
  loading: boolean;
  error: string | null;
}

// Helper to create initial state for slices
export function createInitialState<T extends BaseSliceState>(
  extraState: Omit<T, keyof BaseSliceState>
): T {
  return {
    loading: false,
    error: null,
    ...extraState,
  } as T;
}
