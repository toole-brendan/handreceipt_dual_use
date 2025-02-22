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
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import BuildIcon from '@mui/icons-material/Build';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import LinkIcon from '@mui/icons-material/Link';
import DescriptionIcon from '@mui/icons-material/Description';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

interface InventoryItem {
  id: string;
  name: string;
  serialNumber: string;
  category: string;
  condition: 'Good' | 'Fair' | 'Poor';
  readiness: 'Operational' | 'Needs Maintenance' | 'In Repair';
  assignedTo: string;
  location: string;
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

  const renderHeader = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
        <img
          src="/assets/images/101st-airborne-logo.png"
          alt="101st Airborne Division"
          style={{ width: 50, height: 50, marginRight: 16 }}
        />
        <Box>
          <Typography variant="h4" gutterBottom>
            Unit Inventory
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Captain John Doe, Company Commander, F CO - 2-506, 3BCT, 101st Airborne Division
          </Typography>
        </Box>
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
        <IconButton onClick={handleRefresh} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
        </IconButton>
      </Box>
    </Box>
  );

  const renderSummaryCards = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={2.4}>
        <Card sx={{ p: 2 }}>
          <Typography variant="h4" color="primary" gutterBottom>
            {summaryData.totalItems}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Total Items
          </Typography>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <Card sx={{ p: 2 }}>
          <Typography variant="h4" color="success.main" gutterBottom>
            {summaryData.goodCondition} ({Math.round((summaryData.goodCondition / summaryData.totalItems) * 100)}%)
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Good Condition
          </Typography>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <Card sx={{ p: 2 }}>
          <Typography variant="h4" color="warning.main" gutterBottom>
            {summaryData.needsMaintenance}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Needs Maintenance
          </Typography>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <Card sx={{ p: 2 }}>
          <Typography variant="h4" color="error.main" gutterBottom>
            {summaryData.criticalItems}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Critical Items
          </Typography>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <Card sx={{ p: 2 }}>
          <Typography variant="h4" color="info.main" gutterBottom>
            {summaryData.readinessPercentage}%
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Readiness
          </Typography>
        </Card>
      </Grid>
    </Grid>
  );

  const renderFilters = () => (
    <Box sx={{ mb: 3 }}>
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
                <MenuItem value="gear">Personal Gear</MenuItem>
                <MenuItem value="comms">Communication</MenuItem>
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
              <InputLabel>Assigned To</InputLabel>
              <Select
                value={assignedTo}
                label="Assigned To"
                onChange={(e) => setAssignedTo(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="lt-smith">LT Smith</MenuItem>
                <MenuItem value="sgt-jones">SGT Jones</MenuItem>
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
                <MenuItem value="supply">Supply Room</MenuItem>
                <MenuItem value="field">Field</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Grid>
        <Grid item xs={12} md={2}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" color="primary" fullWidth>
              Apply Filters
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );

  const renderInventoryTable = () => (
    <TableContainer component={Paper} sx={{ mb: 3 }}>
      <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
        {selectedItems.length > 0 && (
          <>
            <Button variant="contained" color="primary" startIcon={<SwapHorizIcon />}>
              Transfer Selected
            </Button>
            <Button variant="contained" color="warning" startIcon={<BuildIcon />}>
              Request Maintenance
            </Button>
          </>
        )}
      </Box>
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
            <TableCell>Readiness</TableCell>
            <TableCell>Assigned To</TableCell>
            <TableCell>Location</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mockItems.map((item) => (
            <TableRow key={item.id} hover>
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
              <TableCell>
                <Chip
                  label={item.readiness}
                  color={getStatusColor(item.readiness)}
                  size="small"
                />
              </TableCell>
              <TableCell>{item.assignedTo}</TableCell>
              <TableCell>{item.location}</TableCell>
              <TableCell align="center">
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                  <Tooltip title="View Details">
                    <IconButton size="small">
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Transfer">
                    <IconButton size="small">
                      <SwapHorizIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Request Maintenance">
                    <IconButton size="small">
                      <BuildIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="View Blockchain Record">
                    <IconButton size="small">
                      <LinkIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={mockItems.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
      />
    </TableContainer>
  );

  const renderVisualizations = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} md={6}>
        <Card sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Inventory by Category
          </Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
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
                  formatter={(value, name, props) => [
                    `${value}% (${props.payload.count} items)`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Items by Condition
          </Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conditionData}>
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="value">
                  {conditionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Card>
      </Grid>
    </Grid>
  );

  const renderQuickActions = () => (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          startIcon={<DescriptionIcon />}
        >
          Generate Report
        </Button>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Button
          variant="contained"
          color="secondary"
          fullWidth
          startIcon={<SwapHorizIcon />}
        >
          Initiate Bulk Transfer
        </Button>
      </Grid>
    </Grid>
  );

  const renderFooter = () => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, pt: 2, borderTop: 1, borderColor: 'divider' }}>
      <Typography variant="body2" color="text.secondary">
        HandReceipt v1.0 | Blockchain Synced: {format(lastUpdated, 'MM/dd/yyyy HH:mm')} ✓
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Link href="#" underline="hover">Export to CSV</Link>
        <Link href="#" underline="hover">Help</Link>
        <Link href="#" underline="hover">Support</Link>
      </Box>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {renderHeader()}
      {renderSummaryCards()}
      {renderFilters()}
      {renderInventoryTable()}
      {renderVisualizations()}
      {renderQuickActions()}
      {renderFooter()}
    </Container>
  );
};

export default UnitInventoryPage; 