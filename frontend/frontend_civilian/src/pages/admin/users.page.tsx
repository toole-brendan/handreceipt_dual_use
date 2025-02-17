import React from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Grid,
  Chip,
  useTheme,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store/store';
import {
  fetchUsers,
  fetchUserStats,
  createUser,
  updateUser,
  updateUserStatus,
  selectUsers,
  selectUsersLoading,
  selectUsersError,
  selectUserStats,
  updateFilters,
} from '../../store/slices/users';
import { UserTable } from '../../components/users/UserTable';
import { UserForm } from '../../components/users/UserForm';
import {
  CivilianUser,
  UserRole,
  UserStatus,
  UserFilters,
  FilterValue,
  UserCreateData,
  UserUpdateData
} from '../../types/users';
import { USER_ROLES } from '../../constants/roles';

const UsersPage: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const users = useSelector(selectUsers);
  const loading = useSelector(selectUsersLoading);
  const error = useSelector(selectUsersError);
  const stats = useSelector(selectUserStats);

  const [formOpen, setFormOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<CivilianUser | null>(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [sortBy, setSortBy] = React.useState<keyof CivilianUser>('username');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = React.useState<UserFilters>({});

  React.useEffect(() => {
    dispatch(fetchUsers(filters));
    dispatch(fetchUserStats());
  }, [dispatch, filters]);

  const handleSort = (property: keyof CivilianUser) => {
    const isAsc = sortBy === property && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortBy(property);
    
    // Update filters with sort parameters
    dispatch(updateFilters({ ...filters, sortBy: property, sortDirection: isAsc ? 'desc' : 'asc' }));
  };

  const handleFilterChange = (field: keyof UserFilters, value: FilterValue) => {
    const newFilters = { ...filters };
    if (value === null) {
      delete newFilters[field];
    } else {
      newFilters[field] = value as any; // Type assertion needed due to union type
    }
    setFilters(newFilters);
    setPage(0);
  };

  const handleCreateUser = async (data: UserCreateData) => {
    try {
      await dispatch(createUser(data)).unwrap();
      setFormOpen(false);
      dispatch(fetchUserStats());
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleUpdateUser = async (data: UserUpdateData) => {
    try {
      await dispatch(updateUser(data)).unwrap();
      setFormOpen(false);
      setSelectedUser(null);
      dispatch(fetchUserStats());
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: UserStatus) => {
    try {
      await dispatch(updateUserStatus({ id: userId, status: newStatus })).unwrap();
      dispatch(fetchUserStats());
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const filteredUsers = React.useMemo(() => {
    return [...users].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      // Handle undefined values
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;
      
      // Handle different types of values
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      // Handle numbers and other types
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [users, sortBy, sortDirection]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage user accounts, roles, and permissions
        </Typography>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Total Users</Typography>
              <Typography variant="h4">{stats.total}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Active Users</Typography>
              <Typography variant="h4" color="success.main">{stats.active}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Pending Users</Typography>
              <Typography variant="h4" color="warning.main">{stats.pending}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Inactive Users</Typography>
              <Typography variant="h4" color="error.main">{stats.inactive}</Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Search"
              value={filters.search ?? ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search users..."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={filters.role ?? ''}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                label="Role"
              >
                <MenuItem value="">All Roles</MenuItem>
                {Object.entries(USER_ROLES).map(([role, label]) => (
                  <MenuItem key={role} value={role}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status ?? ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                label="Status"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedUser(null);
                setFormOpen(true);
              }}
              fullWidth
            >
              Add User
            </Button>
          </Grid>
        </Grid>

        {/* Active Filters */}
        {Object.keys(filters).length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {Object.entries(filters).map(([key, value]) => (
              value && (
                <Chip
                  key={key}
                  label={`${key}: ${value}`}
                  onDelete={() => handleFilterChange(key as keyof UserFilters, null)}
                  color="primary"
                  variant="outlined"
                />
              )
            ))}
          </Box>
        )}
      </Paper>

      {/* User Table */}
      <UserTable
        users={filteredUsers}
        onEdit={(user) => {
          setSelectedUser(user);
          setFormOpen(true);
        }}
        onStatusChange={handleStatusChange}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={filteredUsers.length}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* User Form Dialog */}
      <UserForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={(data) => {
          if ('password' in data) {
            handleCreateUser(data);
          } else {
            handleUpdateUser(data);
          }
        }}
        user={selectedUser || undefined}
        mode={selectedUser ? 'edit' : 'create'}
        error={error}
      />
    </Box>
  );
};

export default UsersPage;
