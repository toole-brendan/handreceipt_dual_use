import React from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Stack,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { PaymentFilters, PaymentStatus, PaymentType } from '@shared/types/payments';
import { Search } from '@mui/icons-material';

interface PaymentsFiltersProps {
  filters: PaymentFilters;
  onFiltersChange: (filters: PaymentFilters) => void;
  onReset: () => void;
}

export const PaymentsFilters: React.FC<PaymentsFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
}) => {
  const handleDateChange = (type: 'startDate' | 'endDate') => (date: Date | null) => {
    if (!date) {
      const { dateRange, ...rest } = filters;
      onFiltersChange(rest);
      return;
    }

    onFiltersChange({
      ...filters,
      dateRange: {
        startDate: type === 'startDate' ? date.toISOString() : (filters.dateRange?.startDate || date.toISOString()),
        endDate: type === 'endDate' ? date.toISOString() : (filters.dateRange?.endDate || date.toISOString()),
      },
    });
  };

  const handleQuickDateSelect = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    onFiltersChange({
      ...filters,
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    });
  };

  return (
    <Box
      sx={{
        p: 2,
        mb: 3,
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: 1,
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ mb: 2 }}
      >
        <FormControl sx={{ minWidth: 200 }}>
          <DatePicker
            label="Start Date"
            value={filters.dateRange?.startDate ? new Date(filters.dateRange.startDate) : null}
            onChange={handleDateChange('startDate')}
          />
        </FormControl>
        
        <FormControl sx={{ minWidth: 200 }}>
          <DatePicker
            label="End Date"
            value={filters.dateRange?.endDate ? new Date(filters.dateRange.endDate) : null}
            onChange={handleDateChange('endDate')}
          />
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Payment Type</InputLabel>
          <Select
            value={filters.type || ''}
            label="Payment Type"
            onChange={(e) => onFiltersChange({ ...filters, type: e.target.value as PaymentType })}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="INCOMING">Incoming</MenuItem>
            <MenuItem value="OUTGOING">Outgoing</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status || ''}
            label="Status"
            onChange={(e) => onFiltersChange({ ...filters, status: e.target.value as PaymentStatus })}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="COMPLETED">Completed</MenuItem>
            <MenuItem value="FAILED">Failed</MenuItem>
          </Select>
        </FormControl>

        <TextField
          placeholder="Search by Transaction ID, Order Number, or Recipient"
          value={filters.search || ''}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          InputProps={{
            startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
          }}
          sx={{ flexGrow: 1 }}
        />

        <Button
          variant="outlined"
          onClick={onReset}
          sx={{ minWidth: 100 }}
        >
          Reset Filters
        </Button>
      </Stack>

      <Stack
        direction="row"
        spacing={1}
        sx={{ mt: 1 }}
      >
        <Button size="small" onClick={() => handleQuickDateSelect(7)}>Last 7 Days</Button>
        <Button size="small" onClick={() => handleQuickDateSelect(30)}>Last 30 Days</Button>
        <Button size="small" onClick={() => {
          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          onFiltersChange({
            ...filters,
            dateRange: {
              startDate: startOfMonth.toISOString(),
              endDate: now.toISOString(),
            },
          });
        }}>This Month</Button>
      </Stack>
    </Box>
  );
};

export default PaymentsFilters; 