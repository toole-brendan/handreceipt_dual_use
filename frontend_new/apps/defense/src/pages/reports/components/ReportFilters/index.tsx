import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Chip,
  IconButton,
  Collapse,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { ChevronDown, ChevronUp, X as CloseIcon } from 'lucide-react';
import type { ReportType, ReportFilter } from '../../types';

interface ReportFiltersProps {
  type: ReportType;
  onFiltersChange: (filters: ReportFilter) => void;
}

const STATUS_OPTIONS = ['draft', 'pending', 'approved', 'rejected'];
const UNIT_OPTIONS = ['F CO - 2-506', '3BCT', '101st Airborne'];
const PERSONNEL_OPTIONS = ['CPT John Doe', 'SFC Jane Smith', 'SSG Bob Johnson'];
const EQUIPMENT_OPTIONS = ['M4 Carbine', 'HMMWV', 'JLTV', 'M240B'];

export const ReportFilters: React.FC<ReportFiltersProps> = ({ type, onFiltersChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<ReportFilter>({
    dateRange: {
      start: '',
      end: '',
    },
    status: [],
    unit: [],
    personnel: [],
    equipment: [],
  });

  const handleFilterChange = (field: keyof ReportFilter, value: any) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDateChange = (field: 'start' | 'end', value: Date | null) => {
    const newDateRange = {
      ...filters.dateRange,
      [field]: value ? value.toISOString() : '',
    };
    handleFilterChange('dateRange', newDateRange);
  };

  const handleChipDelete = (field: keyof ReportFilter, value: string) => {
    if (Array.isArray(filters[field])) {
      handleFilterChange(
        field,
        (filters[field] as string[]).filter((item) => item !== value)
      );
    }
  };

  const renderFilterChips = () => {
    const chips: JSX.Element[] = [];

    if (filters.dateRange?.start) {
      chips.push(
        <Chip
          key="start-date"
          label={`From: ${new Date(filters.dateRange.start).toLocaleDateString()}`}
          onDelete={() => handleDateChange('start', null)}
          size="small"
        />
      );
    }

    if (filters.dateRange?.end) {
      chips.push(
        <Chip
          key="end-date"
          label={`To: ${new Date(filters.dateRange.end).toLocaleDateString()}`}
          onDelete={() => handleDateChange('end', null)}
          size="small"
        />
      );
    }

    ['status', 'unit', 'personnel', 'equipment'].forEach((field) => {
      const values = filters[field as keyof ReportFilter] as string[];
      if (Array.isArray(values)) {
        values.forEach((value) => {
          chips.push(
            <Chip
              key={`${field}-${value}`}
              label={`${field.charAt(0).toUpperCase() + field.slice(1)}: ${value}`}
              onDelete={() => handleChipDelete(field as keyof ReportFilter, value)}
              size="small"
            />
          );
        });
      }
    });

    return chips;
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Filters</Typography>
        <IconButton size="small" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </IconButton>
      </Box>

      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {renderFilterChips()}
      </Box>

      <Collapse in={isExpanded}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <DatePicker
              label="Start Date"
              value={filters.dateRange?.start ? new Date(filters.dateRange.start) : null}
              onChange={(date) => handleDateChange('start', date)}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DatePicker
              label="End Date"
              value={filters.dateRange?.end ? new Date(filters.dateRange.end) : null}
              onChange={(date) => handleDateChange('end', date)}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Status"
              SelectProps={{ multiple: true }}
              value={filters.status || []}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Unit"
              SelectProps={{ multiple: true }}
              value={filters.unit || []}
              onChange={(e) => handleFilterChange('unit', e.target.value)}
            >
              {UNIT_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Personnel"
              SelectProps={{ multiple: true }}
              value={filters.personnel || []}
              onChange={(e) => handleFilterChange('personnel', e.target.value)}
            >
              {PERSONNEL_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          {type === 'inventory' && (
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Equipment"
                SelectProps={{ multiple: true }}
                value={filters.equipment || []}
                onChange={(e) => handleFilterChange('equipment', e.target.value)}
              >
                {EQUIPMENT_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          )}
        </Grid>
      </Collapse>
    </Paper>
  );
}; 