import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  styled,
  TextField,
  IconButton,
  InputAdornment,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Tooltip,
  Avatar,
  Badge,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  CircularProgress,
  Link,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Link as LinkIcon,
  Add as AddIcon,
  Security as SecurityIcon,
  History as HistoryIcon,
  CalendarToday as CalendarTodayIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  VpnKey as VpnKeyIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { DateRangePicker } from '@mui/lab';

// Base card styling following dashboard pattern
const DashboardCard = styled(Paper)(({ theme }) => ({
  height: '100%',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  '& .card-header': {
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    '& h6': {
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
    },
  },
  '& .card-content': {
    padding: theme.spacing(2),
  },
}));

const RoleCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '& .role-header': {
    marginBottom: theme.spacing(2),
  },
  '& .role-description': {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(2),
  },
  '& .role-permissions': {
    flex: 1,
    marginBottom: theme.spacing(2),
  },
}));

interface User {
  id: string;
  name: string;
  rank: string;
  role: string;
  unit: string;
  email: string;
  status: string;
  lastActive: string;
  blockchainHash?: string;
}

interface ActivityLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  details: string;
  blockchainHash: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

const UsersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [rankFilter, setRankFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditPermissionsModalOpen, setIsEditPermissionsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [activityUserFilter, setActivityUserFilter] = useState('all');
  const [activityTypeFilter, setActivityTypeFilter] = useState('all');

  // Mock data
  const mockUsers: User[] = [
    {
      id: 'USR-001',
      name: 'John Smith',
      rank: 'SGT',
      role: 'Unit Manager',
      unit: '1st Battalion',
      email: 'john.smith@army.mil',
      status: 'Active',
      lastActive: '2024-03-15T10:30:00Z',
      blockchainHash: '0x1234...5678',
    },
    {
      id: 'USR-002',
      name: 'Sarah Johnson',
      rank: 'CPL',
      role: 'Inventory Manager',
      unit: '2nd Battalion',
      email: 'sarah.johnson@army.mil',
      status: 'Active',
      lastActive: '2024-03-14T15:45:00Z',
      blockchainHash: '0x8765...4321',
    },
  ];

  const mockRoles: Role[] = [
    {
      id: 'ROLE-001',
      name: 'Commander',
      description: 'Full access to all features and management capabilities',
      permissions: [
        'Manage Users',
        'Approve Transfers',
        'View Reports',
        'Manage Inventory',
      ],
    },
    {
      id: 'ROLE-002',
      name: 'Logistics Officer',
      description: 'Manages inventory and supply chain operations',
      permissions: [
        'View Inventory',
        'Request Transfers',
        'Generate Reports',
      ],
    },
    {
      id: 'ROLE-003',
      name: 'Supply Sergeant',
      description: 'Handles day-to-day inventory management',
      permissions: [
        'View Inventory',
        'Update Item Status',
        'Request Maintenance',
      ],
    },
  ];

  const mockActivityLogs: ActivityLog[] = [
    {
      id: 'LOG-001',
      user: 'LT Smith',
      action: 'Approved Transfer',
      timestamp: '2024-03-15T10:30:00Z',
      details: 'Transfer T001: M4 Carbine (SN: 123456)',
      blockchainHash: '0x1234...5678',
    },
    {
      id: 'LOG-002',
      user: 'SGT Johnson',
      action: 'Updated User Role',
      timestamp: '2024-03-14T15:45:00Z',
      details: 'Changed CPL Davis role to Supply Sergeant',
      blockchainHash: '0x8765...4321',
    },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedUsers(mockUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (id: string) => {
    setSelectedUsers(prev =>
      prev.includes(id)
        ? prev.filter(userId => userId !== id)
        : [...prev, id]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const renderAllUsersTab = () => (
    <>
      {/* Filters */}
      <DashboardCard sx={{ mb: 3 }}>
        <div className="card-header">
          <Typography variant="h6">Filters</Typography>
        </div>
        <div className="card-content">
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={roleFilter}
                label="Role"
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="commander">Commander</MenuItem>
                <MenuItem value="logistics">Logistics Officer</MenuItem>
                <MenuItem value="soldier">Soldier</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Rank</InputLabel>
              <Select
                value={rankFilter}
                label="Rank"
                onChange={(e) => setRankFilter(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="lt">LT</MenuItem>
                <MenuItem value="sgt">SGT</MenuItem>
                <MenuItem value="cpt">CPT</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" color="primary" sx={{ ml: 'auto' }}>
              Apply Filters
            </Button>
            <Button variant="outlined">
              Reset Filters
            </Button>
          </Box>
        </div>
      </DashboardCard>

      {/* Users Table */}
      <DashboardCard>
        <div className="card-header">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">User List</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonAddIcon />}
              onClick={() => setIsAddUserModalOpen(true)}
            >
              Add New User
            </Button>
          </Box>
        </div>
        <div className="card-content">
          {selectedUsers.length > 0 && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2">
                {selectedUsers.length} users selected
              </Typography>
              <Button
                variant="contained"
                color="error"
                size="small"
                startIcon={<BlockIcon />}
              >
                Deactivate Selected
              </Button>
            </Box>
          )}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedUsers.length > 0 && selectedUsers.length < mockUsers.length}
                      checked={selectedUsers.length === mockUsers.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Rank</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Last Active</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar>{getInitials(user.name)}</Avatar>
                        <Typography variant="body2">{user.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{user.rank}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.unit}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{format(new Date(user.lastActive), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        color={getStatusColor(user.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Tooltip title="Edit User">
                          <IconButton size="small">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Blockchain Record">
                          <IconButton size="small">
                            <LinkIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Deactivate User">
                          <IconButton size="small" color="error">
                            <BlockIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={100}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </div>
      </DashboardCard>
    </>
  );

  const renderRolesTab = () => (
    <Grid container spacing={3}>
      {mockRoles.map((role) => (
        <Grid item xs={12} sm={6} md={4} key={role.id}>
          <RoleCard>
            <Box className="role-header">
              <Typography variant="h6">{role.name}</Typography>
            </Box>
            <Typography variant="body2" className="role-description">
              {role.description}
            </Typography>
            <List className="role-permissions">
              {role.permissions.map((permission, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <VpnKeyIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={permission} />
                </ListItem>
              ))}
            </List>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setSelectedRole(role);
                setIsEditPermissionsModalOpen(true);
              }}
            >
              Edit Permissions
            </Button>
          </RoleCard>
        </Grid>
      ))}
      <Grid item xs={12} sm={6} md={4}>
        <RoleCard sx={{ justifyContent: 'center', alignItems: 'center' }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
            sx={{ width: '100%', height: '100%' }}
          >
            Create New Role
          </Button>
        </RoleCard>
      </Grid>
    </Grid>
  );

  const renderActivityLogsTab = () => (
    <>
      {/* Activity Filters */}
      <DashboardCard sx={{ mb: 3 }}>
        <div className="card-header">
          <Typography variant="h6">Activity Filters</Typography>
        </div>
        <div className="card-content">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <DateRangePicker
                startText="From Date"
                endText="To Date"
                value={dateRange}
                onChange={(newValue: [Date | null, Date | null]) => setDateRange(newValue)}
                renderInput={(startProps: any, endProps: any) => (
                  <>
                    <TextField {...startProps} size="small" />
                    <Box sx={{ mx: 2 }}> to </Box>
                    <TextField {...endProps} size="small" />
                  </>
                )}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>User</InputLabel>
                <Select
                  value={activityUserFilter}
                  label="User"
                  onChange={(e) => setActivityUserFilter(e.target.value)}
                >
                  <MenuItem value="all">All Users</MenuItem>
                  <MenuItem value="lt_smith">LT Smith</MenuItem>
                  <MenuItem value="sgt_johnson">SGT Johnson</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Action Type</InputLabel>
                <Select
                  value={activityTypeFilter}
                  label="Action Type"
                  onChange={(e) => setActivityTypeFilter(e.target.value)}
                >
                  <MenuItem value="all">All Actions</MenuItem>
                  <MenuItem value="login">Login</MenuItem>
                  <MenuItem value="transfer">Transfer Approval</MenuItem>
                  <MenuItem value="user_update">User Update</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
              >
                Apply Filters
              </Button>
            </Grid>
          </Grid>
        </div>
      </DashboardCard>

      {/* Activity Logs Table */}
      <DashboardCard>
        <div className="card-header">
          <Typography variant="h6">Activity Logs</Typography>
        </div>
        <div className="card-content">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell align="right">Blockchain Record</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockActivityLogs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>{log.user}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')}</TableCell>
                    <TableCell>{log.details}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Blockchain Record">
                        <IconButton size="small">
                          <LinkIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={100}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </div>
      </DashboardCard>
    </>
  );

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                USERS
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage system users and their permissions
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                placeholder="Search by name, rank, or role..."
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 300 }}
              />
              <Tooltip title="Last blockchain sync: 2 minutes ago">
                <Badge color="success" variant="dot">
                  <IconButton onClick={() => setLoading(true)}>
                    {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
                  </IconButton>
                </Badge>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        {/* Tabs Section */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab
              icon={<PersonIcon />}
              iconPosition="start"
              label="All Users"
            />
            <Tab
              icon={<SecurityIcon />}
              iconPosition="start"
              label="Roles & Permissions"
            />
            <Tab
              icon={<HistoryIcon />}
              iconPosition="start"
              label="Activity Logs"
            />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ mt: 3 }}>
          {activeTab === 0 && renderAllUsersTab()}
          {activeTab === 1 && renderRolesTab()}
          {activeTab === 2 && renderActivityLogsTab()}
        </Box>

        {/* Footer */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            HandReceipt v1.0
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Last Updated: {format(new Date(), 'MM/dd/yyyy')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link href="#" underline="hover">Help</Link>
            <Link href="#" underline="hover">Support</Link>
          </Box>
        </Box>

        {/* Modals */}
        <Dialog
          open={isAddUserModalOpen}
          onClose={() => setIsAddUserModalOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add New User</DialogTitle>
          <DialogContent>
            {/* Add user form fields here */}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsAddUserModalOpen(false)}>Cancel</Button>
            <Button variant="contained" color="primary">Save</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={isEditPermissionsModalOpen}
          onClose={() => setIsEditPermissionsModalOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit Permissions: {selectedRole?.name}</DialogTitle>
          <DialogContent>
            <List>
              {selectedRole?.permissions.map((permission, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <VpnKeyIcon />
                  </ListItemIcon>
                  <ListItemText primary={permission} />
                  <ListItemSecondaryAction>
                    <Switch defaultChecked />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEditPermissionsModalOpen(false)}>Cancel</Button>
            <Button variant="contained" color="primary">Save Changes</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default UsersPage; 