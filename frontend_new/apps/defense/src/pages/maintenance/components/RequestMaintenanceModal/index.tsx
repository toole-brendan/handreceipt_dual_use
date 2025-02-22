import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Typography,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import type {
  MaintenancePriority,
  MaintenanceCategory,
} from '../../types';

interface RequestMaintenanceModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: MaintenanceRequestData) => void;
}

interface MaintenanceRequestData {
  title: string;
  description: string;
  priority: MaintenancePriority;
  category: MaintenanceCategory;
  equipment: {
    id: string;
    name: string;
    serialNumber: string;
  };
  scheduledDate?: Date;
  estimatedDuration: string;
  notes?: string;
}

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

// Mock equipment data - replace with actual data
const MOCK_EQUIPMENT = [
  {
    id: '1',
    name: 'M1A2 Abrams',
    serialNumber: 'AB123456',
  },
  {
    id: '2',
    name: 'M2A3 Bradley',
    serialNumber: 'BR789012',
  },
  {
    id: '3',
    name: 'M109A6 Paladin',
    serialNumber: 'PA345678',
  },
];

export const RequestMaintenanceModal: React.FC<RequestMaintenanceModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = React.useState<MaintenanceRequestData>({
    title: '',
    description: '',
    priority: 'routine',
    category: 'preventive',
    equipment: MOCK_EQUIPMENT[0],
    estimatedDuration: '',
  });

  const handleChange = (field: keyof MaintenanceRequestData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEquipmentChange = (equipmentId: string) => {
    const equipment = MOCK_EQUIPMENT.find((e) => e.id === equipmentId);
    if (equipment) {
      handleChange('equipment', equipment);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit,
      }}
    >
      <DialogTitle>Request Maintenance</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              label="Title"
              required
              fullWidth
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Description"
              required
              fullWidth
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Equipment</InputLabel>
              <Select
                value={formData.equipment.id}
                onChange={(e) => handleEquipmentChange(e.target.value)}
                label="Equipment"
              >
                {MOCK_EQUIPMENT.map((equipment) => (
                  <MenuItem key={equipment.id} value={equipment.id}>
                    <Box>
                      <Typography variant="body2">
                        {equipment.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        SN: {equipment.serialNumber}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                label="Priority"
              >
                {PRIORITY_OPTIONS.map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    {priority.replace('_', ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                label="Category"
              >
                {CATEGORY_OPTIONS.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category.replace('_', ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Estimated Duration"
              required
              fullWidth
              placeholder="e.g., 2 hours, 1 day"
              value={formData.estimatedDuration}
              onChange={(e) => handleChange('estimatedDuration', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <DateTimePicker
              label="Scheduled Date (Optional)"
              value={formData.scheduledDate}
              onChange={(date) => handleChange('scheduledDate', date)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Additional Notes"
              fullWidth
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="contained">
          Submit Request
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 