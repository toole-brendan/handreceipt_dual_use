import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  IconButton,
  Card,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tooltip,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Link,
  TablePagination,
  Checkbox,
  CircularProgress,
  styled,
  Badge,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  Tab,
  Tabs,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Build as BuildIcon,
  SwapHoriz as SwapHorizIcon,
  Link as LinkIcon,
  Description as DescriptionIcon,
  Add as AddIcon,
  QrCode as QrCodeIcon,
  Print as PrintIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Storage as StorageIcon,
  Assignment as AssignmentIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
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

interface InventoryItem {
  id: string;
  name: string;
  serialNumber: string;
  category: string;
  condition: 'Good' | 'Fair' | 'Poor';
  readiness: 'Operational' | 'Needs Maintenance' | 'In Repair';
  assignedTo: string;
  location: string;
  lastUpdated: string;
  blockchainHash?: string;
  criticalItem?: boolean;
}

const UnitInventoryPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [condition, setCondition] = useState('all');
  const [readiness, setReadiness] = useState('all');
  const [assignedTo, setAssignedTo] = useState('all');
  const [location, setLocation] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isBlockchainModalOpen, setIsBlockchainModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Mock data for demonstration
  const summaryData = {
    totalItems: 1245,
    goodCondition: 1100,
    needsMaintenance: 100,
    criticalItems: 500,
    readinessPercentage: 92,
  };

  const mockItems: InventoryItem[] = [
    {
      id: '1',
      name: 'M4 Carbine',
      serialNumber: '123456',
      category: 'Weapons',
      condition: 'Good',
      readiness: 'Operational',
      assignedTo: 'LT Smith',
      location: 'Armory',
      lastUpdated: '2024-04-15T10:30:00Z',
      blockchainHash: '0x1234...5678',
      criticalItem: true,
    },
    {
      id: '2',
      name: 'Kevlar Helmet',
      serialNumber: '789012',
      category: 'Personal Gear',
      condition: 'Fair',
      readiness: 'Needs Maintenance',
      assignedTo: 'SGT Jones',
      location: 'Supply Room',
      lastUpdated: '2024-04-14T15:45:00Z',
      blockchainHash: '0x8765...4321',
    },
    // Add more mock items as needed
  ];

  const categoryData = [
    { name: 'Weapons', value: 40, count: 498 },
    { name: 'Vehicles', value: 25, count: 311 },
    { name: 'Personal Gear', value: 20, count: 249 },
    { name: 'Other', value: 15, count: 187 },
  ];

  const conditionData = [
    { name: 'Good', value: 1100, color: '#4caf50' },
    { name: 'Fair', value: 100, color: '#ff9800' },
    { name: 'Poor', value: 45, color: '#f44336' },
  ];

  const readinessTrendData = [
    { month: 'Jan', readiness: 90 },
    { month: 'Feb', readiness: 88 },
    { month: 'Mar', readiness: 92 },
    { month: 'Apr', readiness: 94 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const handleRefresh = useCallback(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLastUpdated(new Date());
      setLoading(false);
    }, 1000);
  }, []);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedItems(mockItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action ${action} for items:`, selectedItems);
    setAnchorEl(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Good':
      case 'Operational':
        return 'success';
      case 'Fair':
      case 'Needs Maintenance':
        return 'warning';
      case 'Poor':
      case 'In Repair':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                UNIT INVENTORY
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                placeholder="Search by item name, serial number..."
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
              <Tooltip title="Last blockchain sync: 5 minutes ago">
                <Badge color="success" variant="dot">
                  <IconButton onClick={handleRefresh} disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
                  </IconButton>
                </Badge>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        {/* Summary Cards Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <DashboardCard>
              <div className="card-content">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <StorageIcon color="primary" />
                  <Typography variant="h4" color="primary">
                    {summaryData.totalItems}
                  </Typography>
                </Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Items
                </Typography>
              </div>
            </DashboardCard>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <DashboardCard>
              <div className="card-content">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CheckCircleIcon color="success" />
                  <Typography variant="h4" color="success.main">
                    {summaryData.goodCondition} ({Math.round((summaryData.goodCondition / summaryData.totalItems) * 100)}%)
                  </Typography>
                </Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Good Condition
                </Typography>
              </div>
            </DashboardCard>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <DashboardCard>
              <div className="card-content">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <BuildIcon color="warning" />
                  <Typography variant="h4" color="warning.main">
                    {summaryData.needsMaintenance}
                  </Typography>
                </Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Needs Maintenance
                </Typography>
              </div>
            </DashboardCard>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <DashboardCard>
              <div className="card-content">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <WarningIcon color="error" />
                  <Typography variant="h4" color="error.main">
                    {summaryData.criticalItems}
                  </Typography>
                </Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Critical Items
                </Typography>
              </div>
            </DashboardCard>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <DashboardCard>
              <div className="card-content">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AssignmentIcon color="info" />
                  <Typography variant="h4" color="info.main">
                    {summaryData.readinessPercentage}%
                  </Typography>
                </Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Readiness
                </Typography>
              </div>
            </DashboardCard>
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <DashboardCard>
              <div className="card-header">
                <Typography variant="h6">Category Distribution</Typography>
              </div>
              <div className="card-content">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <Box sx={{ bgcolor: 'background.paper', p: 1, border: 1, borderColor: 'divider' }}>
                              <Typography variant="body2">{`${data.name}: ${data.value}% (${data.count} items)`}</Typography>
                            </Box>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </DashboardCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <DashboardCard>
              <div className="card-header">
                <Typography variant="h6">Condition Overview</Typography>
              </div>
              <div className="card-content">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={conditionData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="value" fill="#8884d8">
                      {conditionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </DashboardCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <DashboardCard>
              <div className="card-header">
                <Typography variant="h6">Readiness Trend</Typography>
              </div>
              <div className="card-content">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={readinessTrendData}>
                    <XAxis dataKey="month" />
                    <YAxis domain={[80, 100]} />
                    <RechartsTooltip />
                    <Line type="monotone" dataKey="readiness" stroke="#2196f3" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </DashboardCard>
          </Grid>
        </Grid>

        {/* Filters Section */}
        <DashboardCard sx={{ mb: 3 }}>
          <div className="card-header">
            <Typography variant="h6">Filters</Typography>
          </div>
          <div className="card-content">
            <Grid container spacing={2}>
              <Grid item xs={12} md={10}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={category}
                      label="Category"
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="weapons">Weapons</MenuItem>
                      <MenuItem value="vehicles">Vehicles</MenuItem>
                      <MenuItem value="comms">Communications</MenuItem>
                      <MenuItem value="gear">Personal Gear</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Condition</InputLabel>
                    <Select
                      value={condition}
                      label="Condition"
                      onChange={(e) => setCondition(e.target.value)}
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="good">Good</MenuItem>
                      <MenuItem value="fair">Fair</MenuItem>
                      <MenuItem value="poor">Poor</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Readiness</InputLabel>
                    <Select
                      value={readiness}
                      label="Readiness"
                      onChange={(e) => setReadiness(e.target.value)}
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="operational">Operational</MenuItem>
                      <MenuItem value="maintenance">Needs Maintenance</MenuItem>
                      <MenuItem value="repair">In Repair</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Location</InputLabel>
                    <Select
                      value={location}
                      label="Location"
                      onChange={(e) => setLocation(e.target.value)}
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="armory">Armory</MenuItem>
                      <MenuItem value="motorpool">Motor Pool</MenuItem>
                      <MenuItem value="supply">Supply Room</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Assigned To</InputLabel>
                    <Select
                      value={assignedTo}
                      label="Assigned To"
                      onChange={(e) => setAssignedTo(e.target.value)}
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="lt_smith">LT Smith</MenuItem>
                      <MenuItem value="sgt_jones">SGT Jones</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
              <Grid item xs={12} md={2}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<DownloadIcon />}
                  >
                    Export Report
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </div>
        </DashboardCard>

        {/* Bulk Actions Menu */}
        {selectedItems.length > 0 && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">
              {selectedItems.length} items selected
            </Typography>
            <Button
              size="small"
              startIcon={<GroupIcon />}
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              Bulk Actions
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem onClick={() => handleBulkAction('assign')}>
                <ListItemIcon>
                  <GroupIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Assign To...</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleBulkAction('transfer')}>
                <ListItemIcon>
                  <SwapHorizIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Transfer To...</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleBulkAction('maintenance')}>
                <ListItemIcon>
                  <BuildIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Request Maintenance</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => handleBulkAction('print')}>
                <ListItemIcon>
                  <PrintIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Print QR Codes</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        )}

        {/* Inventory Table Section */}
        <DashboardCard>
          <div className="card-header">
            <Typography variant="h6">Inventory Items</Typography>
          </div>
          <div className="card-content">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={selectedItems.length > 0 && selectedItems.length < mockItems.length}
                        checked={selectedItems.length === mockItems.length}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell>Item Name</TableCell>
                    <TableCell>Serial Number</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Condition</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Assigned To</TableCell>
                    <TableCell>Last Updated</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockItems.map((item) => (
                    <TableRow 
                      key={item.id}
                      sx={item.criticalItem ? { 
                        '& > *': { borderColor: 'error.main' },
                        borderLeft: 2,
                        borderColor: 'error.main'
                      } : {}}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                        />
                      </TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.serialNumber}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.condition}
                          color={getStatusColor(item.condition)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>{item.assignedTo}</TableCell>
                      <TableCell>{format(new Date(item.lastUpdated), 'MMM dd, yyyy')}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton size="small">
                              <InfoIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Request Maintenance">
                            <IconButton size="small">
                              <BuildIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Transfer">
                            <IconButton size="small">
                              <SwapHorizIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View Blockchain Record">
                            <IconButton 
                              size="small"
                              onClick={() => {
                                setSelectedItem(item);
                                setIsBlockchainModalOpen(true);
                              }}
                            >
                              <LinkIcon fontSize="small" />
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

        {/* Footer Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            HandReceipt v1.0
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link href="#" underline="hover">Export to CSV</Link>
            <Link href="#" underline="hover">Help</Link>
            <Link href="#" underline="hover">Support</Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default UnitInventoryPage; 