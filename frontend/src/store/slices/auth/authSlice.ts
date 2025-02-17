import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, LoginCredentials, AppVersion, User } from '@/types/auth';
import { authService } from '@/services/auth';

const initialState: AuthState = {
  user: null,
  token: authService.getToken(),
  version: authService.getVersion() || 'Defense',
  isAuthenticated: authService.isAuthenticated(),
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    authService.setToken(response.token);
    return response;
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    authService.logout();
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setVersion: (state, action: PayloadAction<AppVersion>) => {
      state.version = action.payload;
      authService.setVersion(action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { setVersion, clearError, setError } = authSlice.actions;
export default authSlice.reducer;
