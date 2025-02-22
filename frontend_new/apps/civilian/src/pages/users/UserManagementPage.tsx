import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Button,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Avatar,
  Chip,
  Switch,
  Drawer,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  History as HistoryIcon,
  AccountCircle as UserIcon,
  Business as CompanyIcon,
  VerifiedUser as VerifiedIcon,
  Warning as WarningIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';
import { CivilianChip } from '../../components/common/CivilianChip';

// Mock data for users and roles
const mockUserData = {
  internalUsers: [
    {
      id: "USR001",
      name: "Maria Rodriguez",
      role: "Farm Manager",
      department: "Production",
      walletId: "0x8a7d...23f9",
      status: "active",
      lastActive: "2024-02-22T10:30:00Z",
      permissions: ["inventory.edit", "quality.approve", "contracts.view"],
      location: "Huila, Colombia",
    },
    {
      id: "USR002",
      name: "John Smith",
      role: "Finance Officer",
      department: "Finance",
      walletId: "0x9b3e...45d1",
      status: "active",
      lastActive: "2024-02-22T09:15:00Z",
      permissions: ["payments.approve", "reports.view", "contracts.sign"],
      location: "Head Office",
    },
    {
      id: "USR003",
      name: "Sarah Chen",
      role: "Quality Auditor",
      department: "Quality Assurance",
      walletId: "0x7c4f...89e2",
      status: "active",
      lastActive: "2024-02-21T16:45:00Z",
      permissions: ["quality.approve", "inventory.view", "reports.edit"],
      location: "Processing Center",
    },
  ],
  externalPartners: [
    {
      id: "EXT001",
      name: "Finca La Palma",
      type: "Farm",
      contact: "Carlos Mendoza",
      walletId: "0x5d2e...67f8",
      status: "active",
      lastActive: "2024-02-22T08:00:00Z",
      permissions: ["inventory.add", "quality.view"],
      certifications: ["Organic", "Fair Trade"],
    },
    {
      id: "EXT002",
      name: "Global Logistics Ltd",
      type: "Carrier",
      contact: "David Wilson",
      walletId: "0x3a1b...90c4",
      status: "active",
      lastActive: "2024-02-21T14:20:00Z",
      permissions: ["shipping.edit", "tracking.view"],
      certifications: [],
    },
  ],
  roles: [
    {
      id: "ROLE001",
      name: "Farm Manager",
      description: "Manages farm operations and quality control",
      permissions: {
        inventory: ["view", "edit"],
        quality: ["view", "approve"],
        contracts: ["view"],
        reports: ["view"],
      },
    },
    {
      id: "ROLE002",
      name: "Finance Officer",
      description: "Handles payments and financial operations",
      permissions: {
        payments: ["view", "approve"],
        contracts: ["view", "sign"],
        reports: ["view", "edit"],
      },
    },
  ],
  activityLogs: [
    {
      id: "LOG001",
      timestamp: "2024-02-22T10:30:00Z",
      user: "Maria Rodriguez",
      action: "Updated harvest records for Lot #123",
      module: "Inventory",
      txId: "0x1234...5678",
    },
    {
      id: "LOG002",
      timestamp: "2024-02-22T09:15:00Z",
      user: "John Smith",
      action: "Approved payment to Finca La Palma",
      module: "Payments",
      txId: "0x5678...9012",
    },
  ],
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const UserManagementPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleUserClick = (userId: string) => {
    setSelectedUser(userId);
    setDrawerOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Top Action Bar */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
        <TextField
          size="small"
          placeholder="Search users..."
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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          color="primary"
        >
          Add User
        </Button>
        <Button
          variant="outlined"
          startIcon={<SecurityIcon />}
        >
          Security Settings
        </Button>
        <IconButton>
          <Tooltip title="Refresh">
            <RefreshIcon />
          </Tooltip>
        </IconButton>
      </Stack>

      {/* Tabs */}
      <Tabs value={selectedTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Internal Users" />
        <Tab label="External Partners" />
        <Tab label="Roles & Permissions" />
        <Tab label="Activity Logs" />
      </Tabs>

      {/* Internal Users Tab */}
      <TabPanel value={selectedTab} index={0}>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Wallet ID</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockUserData.internalUsers.map((user) => (
                <TableRow
                  key={user.id}
                  hover
                  onClick={() => handleUserClick(user.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar>{user.name[0]}</Avatar>
                      <Box>
                        <Typography variant="subtitle2">{user.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.department}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <CivilianChip
                      label={user.role}
                      size="small"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>{user.location}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {user.walletId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <CivilianChip
                      label={user.status}
                      size="small"
                      color={user.status === 'active' ? 'success' : 'error'}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small">
                        <BlockIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* External Partners Tab */}
      <TabPanel value={selectedTab} index={1}>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Partner</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Certifications</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockUserData.externalPartners.map((partner) => (
                <TableRow
                  key={partner.id}
                  hover
                  onClick={() => handleUserClick(partner.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar>
                        <CompanyIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">{partner.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {partner.type}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <CivilianChip
                      label={partner.type}
                      size="small"
                      color="info"
                    />
                  </TableCell>
                  <TableCell>{partner.contact}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      {partner.certifications.map((cert) => (
                        <CivilianChip
                          key={cert}
                          label={cert}
                          size="small"
                          color="success"
                        />
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <CivilianChip
                      label={partner.status}
                      size="small"
                      color={partner.status === 'active' ? 'success' : 'error'}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small">
                        <BlockIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Roles & Permissions Tab */}
      <TabPanel value={selectedTab} index={2}>
        <Grid container spacing={3}>
          {mockUserData.roles.map((role) => (
            <Grid item xs={12} md={6} key={role.id}>
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">{role.name}</Typography>
                      <IconButton size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {role.description}
                    </Typography>
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>Permissions</Typography>
                      {Object.entries(role.permissions).map(([module, perms]) => (
                        <Stack key={module} direction="row" spacing={1} sx={{ mb: 1 }}>
                          <Typography variant="body2" sx={{ minWidth: 100 }}>
                            {module}:
                          </Typography>
                          <Stack direction="row" spacing={0.5}>
                            {perms.map((perm) => (
                              <CivilianChip
                                key={perm}
                                label={perm}
                                size="small"
                                color="info"
                              />
                            ))}
                          </Stack>
                        </Stack>
                      ))}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Activity Logs Tab */}
      <TabPanel value={selectedTab} index={3}>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Module</TableCell>
                <TableCell>Transaction ID</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockUserData.activityLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>{log.user}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>
                    <CivilianChip
                      label={log.module}
                      size="small"
                      color="info"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {log.txId}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* User Detail Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: 400 } }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>User Details</Typography>
          {/* Add user details content here */}
        </Box>
      </Drawer>

      {/* Floating Action Button */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
      >
        <Tooltip title="Scan QR Code">
          <IconButton
            color="primary"
            sx={{
              bgcolor: 'background.paper',
              boxShadow: 2,
              '&:hover': { bgcolor: 'background.paper' },
            }}
          >
            <QrCodeIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default UserManagementPage; 