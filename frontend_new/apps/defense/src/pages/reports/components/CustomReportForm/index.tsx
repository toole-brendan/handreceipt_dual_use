import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Paper,
  Divider,
} from '@mui/material';
import { Plus, X as CloseIcon, MoveUp, MoveDown } from 'lucide-react';
import type { CustomReportConfig } from '../../types';

interface CustomReportFormProps {
  onGenerate: (config: CustomReportConfig) => void;
}

const METRIC_OPTIONS = [
  'Total Items',
  'Items in Good Condition',
  'Items Needing Maintenance',
  'Critical Items',
  'Total Transfers',
  'Pending Approvals',
  'Completed Transfers',
  'Scheduled Tasks',
  'In Progress Tasks',
  'Completed Tasks',
  'Overdue Tasks',
];

const VISUALIZATION_TYPES = [
  { value: 'bar', label: 'Bar Chart' },
  { value: 'line', label: 'Line Chart' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'table', label: 'Table' },
];

export const CustomReportForm: React.FC<CustomReportFormProps> = ({ onGenerate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [visualizations, setVisualizations] = useState<
    { type: 'bar' | 'line' | 'pie' | 'table'; config: Record<string, unknown> }[]
  >([]);

  const handleAddMetric = (metric: string) => {
    if (!selectedMetrics.includes(metric)) {
      setSelectedMetrics([...selectedMetrics, metric]);
    }
  };

  const handleRemoveMetric = (metric: string) => {
    setSelectedMetrics(selectedMetrics.filter((m) => m !== metric));
  };

  const handleAddVisualization = (type: 'bar' | 'line' | 'pie' | 'table') => {
    setVisualizations([...visualizations, { type, config: {} }]);
  };

  const handleRemoveVisualization = (index: number) => {
    setVisualizations(visualizations.filter((_, i) => i !== index));
  };

  const handleMoveVisualization = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === visualizations.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newVisualizations = [...visualizations];
    [newVisualizations[index], newVisualizations[newIndex]] = [
      newVisualizations[newIndex],
      newVisualizations[index],
    ];
    setVisualizations(newVisualizations);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const config: CustomReportConfig = {
      title,
      description,
      filters: {
        dateRange: {
          start: '',
          end: '',
        },
        status: [],
        unit: [],
        personnel: [],
        equipment: [],
      },
      metrics: selectedMetrics,
      visualizations,
    };
    onGenerate(config);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={3}>
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
          <Typography variant="h6" gutterBottom>
            Metrics
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Add Metric</InputLabel>
            <Select
              value=""
              onChange={(e) => handleAddMetric(e.target.value)}
              label="Add Metric"
            >
              {METRIC_OPTIONS.map((metric) => (
                <MenuItem
                  key={metric}
                  value={metric}
                  disabled={selectedMetrics.includes(metric)}
                >
                  {metric}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {selectedMetrics.map((metric) => (
              <Chip
                key={metric}
                label={metric}
                onDelete={() => handleRemoveMetric(metric)}
                size="small"
              />
            ))}
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Visualizations</Typography>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Add Visualization</InputLabel>
              <Select
                value=""
                onChange={(e) => handleAddVisualization(e.target.value as any)}
                label="Add Visualization"
              >
                {VISUALIZATION_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {visualizations.map((visualization, index) => (
            <Paper key={index} sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">
                  {VISUALIZATION_TYPES.find((t) => t.value === visualization.type)?.label}
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <IconButton
                  size="small"
                  onClick={() => handleMoveVisualization(index, 'up')}
                  disabled={index === 0}
                >
                  <MoveUp size={18} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleMoveVisualization(index, 'down')}
                  disabled={index === visualizations.length - 1}
                >
                  <MoveDown size={18} />
                </IconButton>
                <IconButton size="small" onClick={() => handleRemoveVisualization(index)}>
                  <CloseIcon size={18} />
                </IconButton>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Configuration options for this visualization will be added here.
              </Typography>
            </Paper>
          ))}
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button type="submit" variant="contained" disabled={!title || selectedMetrics.length === 0}>
              Generate Custom Report
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}; 