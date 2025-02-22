import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AuthState, AuthCredentials, AuthResponse } from './types';
import type { BaseState, RootState } from '../../createStore';

// Helper to get stored auth data
const getStoredAuthData = (): { token: string | null; user: AuthResponse['user'] | null } => {
  try {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return { token, user };
  } catch (error) {
    return { token: null, user: null };
  }
};

// Get initial state from localStorage
const storedAuth = getStoredAuthData();

// Initial state
const initialState: AuthState = {
  token: storedAuth.token,
  user: storedAuth.user,
  loading: false,
  error: null,
};

// Mock login for development
const mockLogin = async (credentials: AuthCredentials): Promise<AuthResponse> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock successful response
  return {
    token: 'mock-jwt-token',
    user: {
      id: '1',
      email: credentials.email,
      roles: ['USER'],
      permissions: ['READ', 'WRITE']
    }
  };
};

// Async thunks
export const login = createAsyncThunk<
  AuthResponse,
  AuthCredentials,
  { state: RootState<BaseState> }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    // In development, use mock login
    const response = await mockLogin(credentials);
    
    // Store auth data
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response;
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
