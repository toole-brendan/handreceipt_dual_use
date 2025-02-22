import React from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Chip,
  OutlinedInput,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Search as SearchIcon, X as ClearIcon } from 'lucide-react';
import type { FiltersState, TransferStatus } from '../../types';

const STATUS_OPTIONS: { value: TransferStatus; label: string }[] = [
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'awaiting_confirmation', label: 'Awaiting Confirmation' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
];

interface TransferFiltersProps {
  filters: FiltersState;
  onFiltersChange: (filters: FiltersState) => void;
  personnel: Array<{
    id: string;
    name: string;
    rank: string;
    unit: string;
  }>;
}

export const TransferFilters: React.FC<TransferFiltersProps> = ({
  filters,
  onFiltersChange,
  personnel,
}) => {
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: event.target.value });
  };

  const handleDateChange = (field: 'start' | 'end', value: Date | null) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: value?.toISOString() || '',
      },
    });
  };

  const handleStatusChange = (event: any) => {
    onFiltersChange({
      ...filters,
      status: event.target.value as TransferStatus[],
    });
  };

  const handlePersonnelChange = (event: any) => {
    onFiltersChange({
      ...filters,
      personnel: event.target.value as string[],
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      search: '',
      dateRange: { start: '', end: '' },
      status: [],
      personnel: [],
    });
  };

  return (
    <Box sx={{ 
      p: 2, 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 2,
      backgroundColor: 'background.paper',
      borderRadius: 1,
      boxShadow: 1,
    }}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        {/* Search Field */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search by Transfer ID, Item, or Personnel..."
          value={filters.search}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon size={20} />
              </InputAdornment>
            ),
            endAdornment: filters.search && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => onFiltersChange({ ...filters, search: '' })}
                >
                  <ClearIcon size={16} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Date Range Pickers */}
        <DatePicker
          label="From Date"
          value={filters.dateRange?.start ? new Date(filters.dateRange.start) : null}
          onChange={(date) => handleDateChange('start', date)}
          slotProps={{ textField: { size: 'small' } }}
        />
        <DatePicker
          label="To Date"
          value={filters.dateRange?.end ? new Date(filters.dateRange.end) : null}
          onChange={(date) => handleDateChange('end', date)}
          slotProps={{ textField: { size: 'small' } }}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        {/* Status Filter */}
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Status</InputLabel>
          <Select
            multiple
            value={filters.status || []}
            onChange={handleStatusChange}
            input={<OutlinedInput label="Status" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip
                    key={value}
                    label={STATUS_OPTIONS.find((opt) => opt.value === value)?.label}
                    size="small"
                  />
                ))}
              </Box>
            )}
          >
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Personnel Filter */}
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Personnel</InputLabel>
          <Select
            multiple
            value={filters.personnel || []}
            onChange={handlePersonnelChange}
            input={<OutlinedInput label="Personnel" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((id) => {
                  const person = personnel.find((p) => p.id === id);
                  return (
                    <Chip
                      key={id}
                      label={person ? `${person.rank} ${person.name}` : id}
                      size="small"
                    />
                  );
                })}
              </Box>
            )}
          >
            {personnel.map((person) => (
              <MenuItem key={person.id} value={person.id}>
                {`${person.rank} ${person.name} - ${person.unit}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Clear Filters Button */}
        <Button
          variant="outlined"
          onClick={handleClearFilters}
          startIcon={<ClearIcon size={16} />}
        >
          Clear Filters
        </Button>
      </Box>
    </Box>
  );
}; 