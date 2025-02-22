import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import type { ReportType, ReportData, ReportFilter } from '../../types';

interface GenerateReportModalProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (data: ReportData) => void;
}

const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: 'inventory', label: 'Inventory Report' },
  { value: 'transfers', label: 'Transfers Report' },
  { value: 'maintenance', label: 'Maintenance Report' },
  { value: 'custom', label: 'Custom Report' },
];

const STATUS_OPTIONS = ['draft', 'pending', 'approved', 'rejected'];
const UNIT_OPTIONS = ['F CO - 2-506', '3BCT', '101st Airborne'];
const PERSONNEL_OPTIONS = ['CPT John Doe', 'SFC Jane Smith', 'SSG Bob Johnson'];
const EQUIPMENT_OPTIONS = ['M4 Carbine', 'HMMWV', 'JLTV', 'M240B'];

export const GenerateReportModal: React.FC<GenerateReportModalProps> = ({
  open,
  onClose,
  onGenerate,
}) => {
  const [reportType, setReportType] = useState<ReportType>('inventory');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const reportData: ReportData = {
      id: `RPT-${new Date().getTime()}`,
      type: reportType,
      title,
      description,
      createdAt: new Date().toISOString(),
      createdBy: {
        name: 'CPT John Doe',
        rank: 'CPT',
        unit: 'F CO - 2-506',
      },
      status: 'draft',
      blockchainRecords: [],
      data: {
        filters,
      },
    };
    onGenerate(reportData);
  };

  const handleFilterChange = (field: keyof ReportFilter, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (field: 'start' | 'end', value: Date | null) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value ? value.toISOString() : '',
      },
    }));
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
              onDelete={() =>
                handleFilterChange(
                  field as keyof ReportFilter,
                  (filters[field as keyof ReportFilter] as string[]).filter(
                    (item) => item !== value
                  )
                )
              }
              size="small"
            />
          );
        });
      }
    });

    return chips;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Generate New Report</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as ReportType)}
                  label="Report Type"
                >
                  {REPORT_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Report Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Filters
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Start Date"
                value={filters.dateRange?.start ? new Date(filters.dateRange.start) : null}
                onChange={(date) => handleDateChange('start', date)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="End Date"
                value={filters.dateRange?.end ? new Date(filters.dateRange.end) : null}
                onChange={(date) => handleDateChange('end', date)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  multiple
                  value={filters.status || []}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Status"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Unit</InputLabel>
                <Select
                  multiple
                  value={filters.unit || []}
                  onChange={(e) => handleFilterChange('unit', e.target.value)}
                  label="Unit"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {UNIT_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Personnel</InputLabel>
                <Select
                  multiple
                  value={filters.personnel || []}
                  onChange={(e) => handleFilterChange('personnel', e.target.value)}
                  label="Personnel"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {PERSONNEL_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {reportType === 'inventory' && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Equipment</InputLabel>
                  <Select
                    multiple
                    value={filters.equipment || []}
                    onChange={(e) => handleFilterChange('equipment', e.target.value)}
                    label="Equipment"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {EQUIPMENT_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {renderFilterChips()}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Generate Report
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}; 