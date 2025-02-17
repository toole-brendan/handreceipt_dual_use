import React from 'react';
import {
  Box,
  Paper,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  Typography,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Search, X } from 'lucide-react';
import { Transaction } from './TransactionTable';
import { mockEntities } from '@/mocks/mockData';
import dayjs, { Dayjs } from 'dayjs';

const TRANSACTION_TYPES = [
  'Batch Created',
  'Shipment In Transit',
  'Temperature Excursion',
  'Quality Check Passed',
  'Quality Check Failed',
  'Dispensing',
  'Return',
  'Disposal'
] as const;

interface TransactionFilters {
  search: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  types: string[];
  productSearch: string;
  batchLotNumber: string;
  fromLocation: string;
  toLocation: string;
  status: ('Completed' | 'Pending' | 'Failed')[];
}

interface TransactionFiltersProps {
  filters: TransactionFilters;
  onFilterChange: (filters: TransactionFilters) => void;
  onClearFilters: () => void;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters
}) => {
  const handleChange = (field: keyof TransactionFilters, value: any) => {
    onFilterChange({
      ...filters,
      [field]: value
    });
  };

  const handleTypeToggle = (type: string) => {
    const types = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type];
    handleChange('types', types);
  };

  const handleStatusToggle = (status: 'Completed' | 'Pending' | 'Failed') => {
    const statuses = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    handleChange('status', statuses);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Failed':
        return 'error';
      default:
        return 'default';
    }
  };

  // Combine all locations from entities
  const allLocations = [
    ...mockEntities.manufacturers,
    ...mockEntities.distributionCenters,
    ...mockEntities.pharmacies
  ];

  const activeFiltersCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (Array.isArray(value)) {
      return count + (value.length > 0 ? 1 : 0);
    }
    if (value instanceof dayjs) {
      return count + (value ? 1 : 0);
    }
    return count + (value ? 1 : 0);
  }, 0);

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      {/* Top Row - Search and Date Range */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          placeholder="Search across all fields..."
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} />
              </InputAdornment>
            )
          }}
          sx={{ flex: 1 }}
        />
        <DateTimePicker
          label="Start Date"
          value={filters.startDate}
          onChange={(date) => handleChange('startDate', date)}
          slotProps={{
            textField: {
              size: 'medium',
              sx: { width: 200 }
            }
          }}
        />
        <DateTimePicker
          label="End Date"
          value={filters.endDate}
          onChange={(date) => handleChange('endDate', date)}
          slotProps={{
            textField: {
              size: 'medium',
              sx: { width: 200 }
            }
          }}
        />
        {activeFiltersCount > 0 && (
          <Tooltip title="Clear all filters">
            <IconButton onClick={onClearFilters} color="primary">
              <X size={20} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Second Row - Product and Batch/Lot */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Product Search"
          placeholder="Search by product name or ID"
          value={filters.productSearch}
          onChange={(e) => handleChange('productSearch', e.target.value)}
          sx={{ flex: 1 }}
        />
        <TextField
          label="Batch/Lot Number"
          placeholder="Search by batch or lot number"
          value={filters.batchLotNumber}
          onChange={(e) => handleChange('batchLotNumber', e.target.value)}
          sx={{ flex: 1 }}
        />
      </Box>

      {/* Third Row - Locations */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          select
          label="From Location"
          value={filters.fromLocation}
          onChange={(e) => handleChange('fromLocation', e.target.value)}
          sx={{ flex: 1 }}
        >
          <MenuItem value="">All Locations</MenuItem>
          {allLocations.map((location) => (
            <MenuItem key={location.id} value={location.id}>
              {location.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="To Location"
          value={filters.toLocation}
          onChange={(e) => handleChange('toLocation', e.target.value)}
          sx={{ flex: 1 }}
        >
          <MenuItem value="">All Locations</MenuItem>
          {allLocations.map((location) => (
            <MenuItem key={location.id} value={location.id}>
              {location.name}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Fourth Row - Transaction Types and Status */}
      <Box>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Transaction Types
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {TRANSACTION_TYPES.map((type) => (
            <Chip
              key={type}
              label={type}
              onClick={() => handleTypeToggle(type)}
              variant={filters.types.includes(type) ? 'filled' : 'outlined'}
              color={filters.types.includes(type) ? 'primary' : 'default'}
            />
          ))}
        </Box>

        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Status
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {(['Completed', 'Pending', 'Failed'] as const).map((status) => (
            <Chip
              key={status}
              label={status}
              onClick={() => handleStatusToggle(status)}
              variant={filters.status.includes(status) ? 'filled' : 'outlined'}
              color={filters.status.includes(status) ? getStatusColor(status) : 'default'}
            />
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

export default TransactionFilters;
