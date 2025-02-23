import React from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Grid,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { InventoryCategory, InventoryStatus, InventoryFilters as IInventoryFilters } from '@shared/types/inventory';

const LOCATIONS = ['All', 'Warehouse A', 'Roasting Facility', 'Distribution Center'];

interface InventoryFiltersProps {
  filters: IInventoryFilters;
  onFiltersChange: (filters: IInventoryFilters) => void;
  onResetFilters: () => void;
}

export const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  filters,
  onFiltersChange,
  onResetFilters,
}) => {
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: event.target.value });
  };

  const handleCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, category: event.target.value as InventoryCategory });
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, status: event.target.value as InventoryStatus });
  };

  const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, location: event.target.value });
  };

  const handleStartDateChange = (date: Date | null) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        startDate: date?.toISOString() || '',
        endDate: filters.dateRange?.endDate || '',
      },
    });
  };

  const handleEndDateChange = (date: Date | null) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        startDate: filters.dateRange?.startDate || '',
        endDate: date?.toISOString() || '',
      },
    });
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            placeholder="Search by Item Name, SKU, or Batch Number"
            value={filters.search || ''}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: filters.search && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => onFiltersChange({ ...filters, search: '' })}
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            select
            fullWidth
            label="Category"
            value={filters.category || ''}
            onChange={handleCategoryChange}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="RAW_MATERIALS">Raw Materials</MenuItem>
            <MenuItem value="WORK_IN_PROGRESS">Work in Progress</MenuItem>
            <MenuItem value="FINISHED_GOODS">Finished Goods</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            select
            fullWidth
            label="Status"
            value={filters.status || ''}
            onChange={handleStatusChange}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="IN_STOCK">In Stock</MenuItem>
            <MenuItem value="RESERVED">Reserved</MenuItem>
            <MenuItem value="IN_TRANSIT">In Transit</MenuItem>
            <MenuItem value="OUT_OF_STOCK">Out of Stock</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            select
            fullWidth
            label="Location"
            value={filters.location || ''}
            onChange={handleLocationChange}
          >
            {LOCATIONS.map((location) => (
              <MenuItem key={location} value={location === 'All' ? '' : location}>
                {location}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={2}>
          <DatePicker
            label="Start Date"
            value={filters.dateRange?.startDate ? new Date(filters.dateRange.startDate) : null}
            onChange={handleStartDateChange}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <DatePicker
            label="End Date"
            value={filters.dateRange?.endDate ? new Date(filters.dateRange.endDate) : null}
            onChange={handleEndDateChange}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Grid>
        <Grid item xs={12} sm={1}>
          <Button
            variant="outlined"
            onClick={onResetFilters}
            fullWidth
          >
            Reset
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}; 