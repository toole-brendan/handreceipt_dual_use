import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch as useReduxDispatch, useSelector as useReduxSelector } from 'react-redux';
import propertyReducer from './slices/property/slice';
import authReducer from '@shared/store/slices/auth/slice';
import type { PropertyState } from '../types/property';
import type { DefenseAuthState } from '@shared/types/auth/defense';

// Create the root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  property: propertyReducer,
});

// Create the store
export const store = configureStore({
  reducer: rootReducer,
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = {
  auth: DefenseAuthState;
  property: PropertyState;
};
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useDispatch = () => useReduxDispatch<AppDispatch>();
export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;
