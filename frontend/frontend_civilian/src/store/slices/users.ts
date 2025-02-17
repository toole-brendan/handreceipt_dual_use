import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CivilianUser, UserFilters, UserCreateData, UserUpdateData, UserStats } from '../../types/users';
import { userService } from '../../services/userService';
import { RootState } from '../store';

interface UsersState {
  users: CivilianUser[];
  selectedUser: CivilianUser | null;
  filters: UserFilters;
  stats: UserStats | null;
  loading: boolean;
  error: string | null;
  formOpen: boolean;
  formMode: 'create' | 'edit';
}

const initialState: UsersState = {
  users: [],
  selectedUser: null,
  filters: {},
  stats: null,
  loading: false,
  error: null,
  formOpen: false,
  formMode: 'create'
};

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (filters: UserFilters = {}, { rejectWithValue }) => {
    try {
      return await userService.getAll(filters);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch users');
    }
  }
);

export const fetchUserStats = createAsyncThunk(
  'users/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      return await userService.getStats();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch user stats');
    }
  }
);

export const createUser = createAsyncThunk(
  'users/create',
  async (data: UserCreateData, { rejectWithValue }) => {
    try {
      return await userService.create(data);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create user');
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/update',
  async (data: UserUpdateData, { rejectWithValue }) => {
    try {
      return await userService.update(data);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update user');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await userService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete user');
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  'users/updateStatus',
  async ({ id, status }: { id: string; status: 'ACTIVE' | 'INACTIVE' | 'PENDING' }, { rejectWithValue }) => {
    try {
      return await userService.updateStatus(id, status);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update user status');
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setSelectedUser: (state, action: PayloadAction<CivilianUser | null>) => {
      state.selectedUser = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<UserFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setFormOpen: (state, action: PayloadAction<boolean>) => {
      state.formOpen = action.payload;
      if (!action.payload) {
        state.selectedUser = null;
        state.formMode = 'create';
      }
    },
    setFormMode: (state, action: PayloadAction<'create' | 'edit'>) => {
      state.formMode = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch stats
      .addCase(fetchUserStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create user
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
        state.formOpen = false;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update user
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        state.formOpen = false;
        state.selectedUser = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(u => u.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update user status
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      });
  }
});

// Selectors
export const selectUsers = (state: RootState) => state.users.users;
export const selectSelectedUser = (state: RootState) => state.users.selectedUser;
export const selectUserFilters = (state: RootState) => state.users.filters;
export const selectUserStats = (state: RootState) => state.users.stats;
export const selectUsersLoading = (state: RootState) => state.users.loading;
export const selectUsersError = (state: RootState) => state.users.error;
export const selectFormOpen = (state: RootState) => state.users.formOpen;
export const selectFormMode = (state: RootState) => state.users.formMode;

// Export actions and reducer
export const {
  setSelectedUser,
  updateFilters,
  clearFilters,
  setFormOpen,
  setFormMode,
  clearError
} = usersSlice.actions;

export default usersSlice.reducer;
