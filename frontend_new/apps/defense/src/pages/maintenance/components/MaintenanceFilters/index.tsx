import React, { useState } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Button,
  Divider,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Filter, X } from 'lucide-react';
import type {
  FiltersState,
  MaintenanceStatus,
  MaintenancePriority,
  MaintenanceCategory,
} from '../../types';

interface MaintenanceFiltersProps {
  filters: FiltersState;
  onFiltersChange: (filters: FiltersState) => void;
}

const STATUS_OPTIONS: MaintenanceStatus[] = [
  'pending_approval',
  'scheduled',
  'in_progress',
  'completed',
  'cancelled',
  'rejected',
];

const PRIORITY_OPTIONS: MaintenancePriority[] = [
  'routine',
  'urgent',
  'emergency',
];

const CATEGORY_OPTIONS: MaintenanceCategory[] = [
  'preventive',
  'corrective',
  'condition_based',
  'predictive',
];

export const MaintenanceFilters: React.FC<MaintenanceFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [tempFilters, setTempFilters] = useState<FiltersState>(filters);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleApply = () => {
    onFiltersChange(tempFilters);
    handleClose();
  };

  const handleReset = () => {
    const resetFilters: FiltersState = {};
    setTempFilters(resetFilters);
    onFiltersChange(resetFilters);
    handleClose();
  };

  const handleStatusChange = (status: MaintenanceStatus) => {
    setTempFilters((prev) => ({
      ...prev,
      status: prev.status?.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...(prev.status || []), status],
    }));
  };

  const handlePriorityChange = (priority: MaintenancePriority) => {
    setTempFilters((prev) => ({
      ...prev,
      priority: prev.priority?.includes(priority)
        ? prev.priority.filter((p) => p !== priority)
        : [...(prev.priority || []), priority],
    }));
  };

  const handleCategoryChange = (category: MaintenanceCategory) => {
    setTempFilters((prev) => ({
      ...prev,
      category: prev.category?.includes(category)
        ? prev.category.filter((c) => c !== category)
        : [...(prev.category || []), category],
    }));
  };

  const handleDateRangeChange = (
    type: 'start' | 'end',
    date: Date | null
  ) => {
    setTempFilters((prev) => ({
      ...prev,
      dateRange: prev.dateRange ? {
        ...prev.dateRange,
        [type]: date,
      } : date ? {
        start: type === 'start' ? date : undefined,
        end: type === 'end' ? date : undefined,
      } : undefined,
    }));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value;
    setTempFilters((prev) => ({
      ...prev,
      searchTerm,
    }));
    onFiltersChange({ ...tempFilters, searchTerm });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.status?.length) count += 1;
    if (filters.priority?.length) count += 1;
    if (filters.category?.length) count += 1;
    if (filters.dateRange?.start || filters.dateRange?.end) count += 1;
    if (filters.searchTerm) count += 1;
    return count;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search maintenance tasks..."
          value={filters.searchTerm || ''}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1 }}
        />
        <IconButton
          onClick={handleClick}
          sx={{
            bgcolor: getActiveFiltersCount() > 0 ? 'primary.main' : 'transparent',
            color: getActiveFiltersCount() > 0 ? 'white' : 'inherit',
            '&:hover': {
              bgcolor: getActiveFiltersCount() > 0 ? 'primary.dark' : 'action.hover',
            },
          }}
        >
          <Filter />
        </IconButton>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 320,
            p: 2,
          },
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Status
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {STATUS_OPTIONS.map((status) => (
            <FormControlLabel
              key={status}
              control={
                <Checkbox
                  checked={tempFilters.status?.includes(status) || false}
                  onChange={() => handleStatusChange(status)}
                  size="small"
                />
              }
              label={status.replace('_', ' ')}
            />
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Priority
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {PRIORITY_OPTIONS.map((priority) => (
            <FormControlLabel
              key={priority}
              control={
                <Checkbox
                  checked={tempFilters.priority?.includes(priority) || false}
                  onChange={() => handlePriorityChange(priority)}
                  size="small"
                />
              }
              label={priority}
            />
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Category
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {CATEGORY_OPTIONS.map((category) => (
            <FormControlLabel
              key={category}
              control={
                <Checkbox
                  checked={tempFilters.category?.includes(category) || false}
                  onChange={() => handleCategoryChange(category)}
                  size="small"
                />
              }
              label={category.replace('_', ' ')}
            />
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Date Range
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <DatePicker
            label="Start Date"
            value={tempFilters.dateRange?.start || null}
            onChange={(date) => handleDateRangeChange('start', date)}
            slotProps={{ textField: { size: 'small' } }}
          />
          <DatePicker
            label="End Date"
            value={tempFilters.dateRange?.end || null}
            onChange={(date) => handleDateRangeChange('end', date)}
            slotProps={{ textField: { size: 'small' } }}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={handleReset} size="small">
            Reset
          </Button>
          <Button
            onClick={handleApply}
            variant="contained"
            size="small"
          >
            Apply Filters
          </Button>
        </Box>
      </Menu>

      {getActiveFiltersCount() > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
          {filters.status?.map((status) => (
            <Chip
              key={status}
              label={`Status: ${status.replace('_', ' ')}`}
              onDelete={() => {
                const newFilters = {
                  ...filters,
                  status: filters.status?.filter((s) => s !== status),
                };
                onFiltersChange(newFilters);
              }}
              size="small"
            />
          ))}
          {filters.priority?.map((priority) => (
            <Chip
              key={priority}
              label={`Priority: ${priority}`}
              onDelete={() => {
                const newFilters = {
                  ...filters,
                  priority: filters.priority?.filter((p) => p !== priority),
                };
                onFiltersChange(newFilters);
              }}
              size="small"
            />
          ))}
          {filters.category?.map((category) => (
            <Chip
              key={category}
              label={`Category: ${category.replace('_', ' ')}`}
              onDelete={() => {
                const newFilters = {
                  ...filters,
                  category: filters.category?.filter((c) => c !== category),
                };
                onFiltersChange(newFilters);
              }}
              size="small"
            />
          ))}
          {(filters.dateRange?.start || filters.dateRange?.end) && (
            <Chip
              label="Date Range"
              onDelete={() => {
                const newFilters = {
                  ...filters,
                  dateRange: undefined,
                };
                onFiltersChange(newFilters);
              }}
              size="small"
            />
          )}
        </Box>
      )}
    </Box>
  );
}; 