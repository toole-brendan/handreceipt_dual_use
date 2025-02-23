import React from 'react';
import {
  Box,
  Tabs,
  Tab,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { OrderType, OrderStatus, OrderFilters as OrderFiltersType } from '../types';

interface OrderFiltersProps {
  filters: OrderFiltersType;
  onFiltersChange: (filters: OrderFiltersType) => void;
}

export const OrderFilters: React.FC<OrderFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const handleTypeChange = (_: React.SyntheticEvent, type: OrderType) => {
    onFiltersChange({ ...filters, type });
  };

  const handleStatusChange = (event: any) => {
    onFiltersChange({ ...filters, status: event.target.value });
  };

  const handleDateRangeChange = (field: 'start' | 'end') => (event: any) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: event.target.value,
      },
    });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, searchQuery: event.target.value });
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Tabs
        value={filters.type}
        onChange={handleTypeChange}
        sx={{ mb: 2 }}
      >
        <Tab label="Purchase Orders" value="purchase" />
        <Tab label="Sales Orders" value="sales" />
      </Tabs>

      <Stack direction="row" spacing={2}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            label="Status"
            onChange={handleStatusChange}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="placed">Placed</MenuItem>
            <MenuItem value="processing">Processing</MenuItem>
            <MenuItem value="shipped">Shipped</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>

        <TextField
          size="small"
          type="date"
          label="From"
          value={filters.dateRange.start}
          onChange={handleDateRangeChange('start')}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          size="small"
          type="date"
          label="To"
          value={filters.dateRange.end}
          onChange={handleDateRangeChange('end')}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          size="small"
          placeholder="Search by Order Number, Supplier, or Customer"
          value={filters.searchQuery}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Stack>
    </Box>
  );
}; 