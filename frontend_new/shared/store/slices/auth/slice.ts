import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AuthState, AuthCredentials, AuthResponse } from './types';
import type { BaseState, RootState } from '../../createStore';

// Initial state
const initialState: AuthState = {
  token: null,
  user: null,
  loading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk<
  AuthResponse,
  AuthCredentials,
  { state: RootState<BaseState> }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    // Each app will implement its own API call
    throw new Error('login must be implemented by each app');
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Login failed');
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  // Clear local storage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
});

// Auth slice
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Sync actions
    setCredentials: (state, { payload }: { payload: AuthResponse }) => {
      state.token = payload.token;
      state.user = payload.user;
      // Store in local storage
      localStorage.setItem('token', payload.token);
      localStorage.setItem('user', JSON.stringify(payload.user));
    },
    clearCredentials: (state) => {
      state.token = null;
      state.user = null;
      state.error = null;
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.token = payload.token;
        state.user = payload.user;
        // Store in local storage
        localStorage.setItem('token', payload.token);
        localStorage.setItem('user', JSON.stringify(payload.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.error = null;
      });
  },
});

// Export actions
export const { setCredentials, clearCredentials } = authSlice.actions;

// Export selectors
export const selectAuth = (state: RootState<BaseState>) => state.auth;
export const selectUser = (state: RootState<BaseState>) => state.auth.user;
export const selectToken = (state: RootState<BaseState>) => state.auth.token;
export const selectIsAuthenticated = (state: RootState<BaseState>) => !!state.auth.token;
export const selectAuthLoading = (state: RootState<BaseState>) => state.auth.loading;
export const selectAuthError = (state: RootState<BaseState>) => state.auth.error;

// Export reducer
export default authSlice.reducer;
