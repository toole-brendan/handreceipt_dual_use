import React from 'react';
import {
  Box,
  TextField,
  MenuItem,
  InputAdornment,
  Stack,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { ShipmentType, ShipmentStatus, ShipmentFilters } from '@shared/types/shipments';

interface ShipmentFiltersProps {
  filters: ShipmentFilters;
  onFiltersChange: (filters: ShipmentFilters) => void;
}

export const ShipmentFilters: React.FC<ShipmentFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const handleChange = (field: keyof ShipmentFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [field]: value,
    });
  };

  return (
    <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          select
          label="Shipment Type"
          value={filters.type || ''}
          onChange={(e) => handleChange('type', e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="INBOUND">Inbound</MenuItem>
          <MenuItem value="OUTBOUND">Outbound</MenuItem>
        </TextField>

        <TextField
          select
          label="Status"
          value={filters.status || ''}
          onChange={(e) => handleChange('status', e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="IN_TRANSIT">In Transit</MenuItem>
          <MenuItem value="DELIVERED">Delivered</MenuItem>
          <MenuItem value="DELAYED">Delayed</MenuItem>
          <MenuItem value="CANCELLED">Cancelled</MenuItem>
        </TextField>

        <DatePicker
          label="Start Date"
          value={filters.dateRange?.startDate ? new Date(filters.dateRange.startDate) : null}
          onChange={(date) =>
            handleChange('dateRange', {
              ...filters.dateRange,
              startDate: date?.toISOString(),
            })
          }
          slotProps={{ textField: { sx: { minWidth: 150 } } }}
        />

        <DatePicker
          label="End Date"
          value={filters.dateRange?.endDate ? new Date(filters.dateRange.endDate) : null}
          onChange={(date) =>
            handleChange('dateRange', {
              ...filters.dateRange,
              endDate: date?.toISOString(),
            })
          }
          slotProps={{ textField: { sx: { minWidth: 150 } } }}
        />

        <TextField
          label="Search"
          placeholder="Search by Shipment ID, Order Number, or Name"
          value={filters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1 }}
        />
      </Stack>
    </Box>
  );
}; 