import React from 'react';
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
  Divider,
  Alert,
  Stack,
  Chip,
} from '@mui/material';
import { Plus, X } from 'lucide-react';
import { PharmaceuticalLocation } from '@/mocks/api/pharmaceuticals-locations.mock';

export interface LocationFormData {
  name: string;
  type: PharmaceuticalLocation['type'];
  address: string;
  capacity: {
    total: string;
    used: string;
    unit: string;
  };
  temperature: {
    min: string;
    max: string;
    unit: 'C' | 'F';
  };
  humidity: {
    min: string;
    max: string;
  };
  certifications: string[];
  status: PharmaceuticalLocation['status'];
  securityLevel: PharmaceuticalLocation['securityLevel'];
}

interface LocationFormProps {
  initialData?: Partial<LocationFormData>;
  onSubmit: (data: LocationFormData) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

const LOCATION_TYPES: PharmaceuticalLocation['type'][] = [
  'Manufacturing Plant',
  'Warehouse',
  'Quality Control Lab',
  'Distribution Center',
];

const LOCATION_STATUSES: PharmaceuticalLocation['status'][] = [
  'Operational',
  'Maintenance',
  'Shutdown',
  'Alert',
];

const SECURITY_LEVELS: PharmaceuticalLocation['securityLevel'][] = [
  'High',
  'Medium',
  'Standard',
];

const COMMON_CERTIFICATIONS = [
  'FDA GMP',
  'ISO 9001:2015',
  'WHO GMP',
  'ISO/IEC 17025',
  'FDA Registered',
  'USP Certified',
  'GDP Certified',
];

const initialFormState: LocationFormData = {
  name: '',
  type: 'Warehouse',
  address: '',
  capacity: {
    total: '',
    used: '0',
    unit: 'units',
  },
  temperature: {
    min: '',
    max: '',
    unit: 'C',
  },
  humidity: {
    min: '',
    max: '',
  },
  certifications: [],
  status: 'Operational',
  securityLevel: 'Standard',
};

const LocationForm: React.FC<LocationFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEdit = false,
}) => {
  const [form, setForm] = React.useState<LocationFormData>({
    ...initialFormState,
    ...initialData,
  });
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [newCertification, setNewCertification] = React.useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      capacity: {
        ...prev.capacity,
        [name]: value,
      },
    }));
  };

  const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      temperature: {
        ...prev.temperature,
        [name]: value,
      },
    }));
  };

  const handleHumidityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      humidity: {
        ...prev.humidity,
        [name]: value,
      },
    }));
  };

  const addCertification = (cert: string) => {
    if (cert && !form.certifications.includes(cert)) {
      setForm(prev => ({
        ...prev,
        certifications: [...prev.certifications, cert],
      }));
      setNewCertification('');
    }
  };

  const removeCertification = (cert: string) => {
    setForm(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c !== cert),
    }));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!form.name) errors.push('Name is required');
    if (!form.address) errors.push('Address is required');
    if (!form.capacity.total) errors.push('Total capacity is required');
    if (!form.capacity.unit) errors.push('Capacity unit is required');
    if (!form.temperature.min) errors.push('Minimum temperature is required');
    if (!form.temperature.max) errors.push('Maximum temperature is required');
    if (!form.humidity.min) errors.push('Minimum humidity is required');
    if (!form.humidity.max) errors.push('Maximum humidity is required');

    // Validate ranges
    const minTemp = Number(form.temperature.min);
    const maxTemp = Number(form.temperature.max);
    if (maxTemp <= minTemp) {
      errors.push('Maximum temperature must be greater than minimum temperature');
    }

    const minHumidity = Number(form.humidity.min);
    const maxHumidity = Number(form.humidity.max);
    if (maxHumidity <= minHumidity) {
      errors.push('Maximum humidity must be greater than minimum humidity');
    }

    const totalCapacity = Number(form.capacity.total);
    const usedCapacity = Number(form.capacity.used);
    if (usedCapacity > totalCapacity) {
      errors.push('Used capacity cannot exceed total capacity');
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join('\n'));
      }

      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Basic Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="name"
                label="Location Name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                name="type"
                label="Location Type"
                value={form.type}
                onChange={handleChange}
                required
              >
                {LOCATION_TYPES.map(type => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                name="status"
                label="Status"
                value={form.status}
                onChange={handleChange}
                required
              >
                {LOCATION_STATUSES.map(status => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="address"
                label="Address"
                value={form.address}
                onChange={handleChange}
                required
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Divider />
        </Grid>

        {/* Capacity */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Capacity
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                name="total"
                label="Total Capacity"
                type="number"
                value={form.capacity.total}
                onChange={handleCapacityChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                name="used"
                label="Used Capacity"
                type="number"
                value={form.capacity.used}
                onChange={handleCapacityChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                name="unit"
                label="Unit"
                value={form.capacity.unit}
                onChange={handleCapacityChange}
                required
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Divider />
        </Grid>

        {/* Environmental Controls */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Environmental Controls
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Temperature Range (°{form.temperature.unit})
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    name="min"
                    label="Min"
                    type="number"
                    value={form.temperature.min}
                    onChange={handleTemperatureChange}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    name="max"
                    label="Max"
                    type="number"
                    value={form.temperature.max}
                    onChange={handleTemperatureChange}
                    required
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Humidity Range (%)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    name="min"
                    label="Min"
                    type="number"
                    value={form.humidity.min}
                    onChange={handleHumidityChange}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    name="max"
                    label="Max"
                    type="number"
                    value={form.humidity.max}
                    onChange={handleHumidityChange}
                    required
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Divider />
        </Grid>

        {/* Security & Certifications */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Security & Certifications
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                name="securityLevel"
                label="Security Level"
                value={form.securityLevel}
                onChange={handleChange}
                required
              >
                {SECURITY_LEVELS.map(level => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                label="Add Certification"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCertification(newCertification);
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <Button
                      onClick={() => addCertification(newCertification)}
                      disabled={!newCertification}
                    >
                      <Plus size={20} />
                    </Button>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Common Certifications
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {COMMON_CERTIFICATIONS.map((cert) => (
                  <Chip
                    key={cert}
                    label={cert}
                    onClick={() => addCertification(cert)}
                    disabled={form.certifications.includes(cert)}
                    size="small"
                  />
                ))}
              </Box>
              <Typography variant="subtitle2" gutterBottom>
                Selected Certifications
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {form.certifications.map((cert) => (
                  <Chip
                    key={cert}
                    label={cert}
                    onDelete={() => removeCertification(cert)}
                    size="small"
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </Grid>

        {/* Error Message */}
        {error && (
          <Grid item xs={12}>
            <Alert severity="error">{error}</Alert>
          </Grid>
        )}

        {/* Form Actions */}
        <Grid item xs={12}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={onCancel}
              startIcon={<X size={20} />}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Saving...' : isEdit ? 'Update Location' : 'Create Location'}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LocationForm;
