import React from 'react';
import { Box, Grid, TextField, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export interface ReportFiltersProps {
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  productId: string;
  location: string;
  onDateRangeChange: (field: 'start' | 'end', value: Date | null) => void;
  onProductChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  products: Array<{ id: string; name: string }>;
  locations: Array<{ id: string; name: string }>;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({
  dateRange,
  productId,
  location,
  onDateRangeChange,
  onProductChange,
  onLocationChange,
  products,
  locations
}) => {
  // Ensure dateRange has default values if undefined
  const safeDateRange = dateRange || { start: null, end: null };

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2}>
        {/* Date Range */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <DatePicker
                label="Start Date"
                value={safeDateRange.start}
                onChange={(newValue) => onDateRangeChange('start', newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small"
                  }
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <DatePicker
                label="End Date"
                value={safeDateRange.end}
                onChange={(newValue) => onDateRangeChange('end', newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small"
                  }
                }}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Product Filter */}
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Product</InputLabel>
            <Select
              value={productId}
              label="Product"
              onChange={(e) => onProductChange(e.target.value)}
            >
              <MenuItem value="">All Products</MenuItem>
              {products.map((product) => (
                <MenuItem key={product.id} value={product.id}>
                  {product.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Location Filter */}
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Location</InputLabel>
            <Select
              value={location}
              label="Location"
              onChange={(e) => onLocationChange(e.target.value)}
            >
              <MenuItem value="">All Locations</MenuItem>
              {locations.map((loc) => (
                <MenuItem key={loc.id} value={loc.id}>
                  {loc.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportFilters;
