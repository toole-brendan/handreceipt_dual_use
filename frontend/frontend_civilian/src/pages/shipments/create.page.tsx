import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  MenuItem,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import { Plus, Trash2, FileText, Upload } from 'lucide-react';
import DashboardCard from '@/components/common/DashboardCard';
import { PharmaceuticalShipment } from '@/mocks/api/pharmaceuticals-shipments.mock';
import { mockPharmaceuticalLocations } from '@/mocks/api/pharmaceuticals-locations.mock';
import { mockPharmaceuticalProducts } from '@/mocks/api/pharmaceuticals-products.mock';
import { CreateShipmentData, createShipment, validateShipmentData } from '@/components/shipments/shipmentUtils';
import { ROUTES } from '@/constants/routes';

interface ShipmentForm {
  referenceNumber: string;
  type: PharmaceuticalShipment['type'];
  priority: PharmaceuticalShipment['priority'];
  fromLocationId: string;
  toLocationId: string;
  carrier: {
    name: string;
    trackingNumber?: string;
    vehicleId?: string;
    driverName?: string;
  };
  items: {
    productId: string;
    batchNumber: string;
    quantity: string;
    unit: string;
  }[];
  temperature: {
    min: string;
    max: string;
    unit: 'C' | 'F';
  };
  humidity: {
    min: string;
    max: string;
  };
  expectedDeparture: string;
  expectedArrival: string;
}

const initialFormState: ShipmentForm = {
  referenceNumber: '',
  type: 'Internal Transfer',
  priority: 'Standard',
  fromLocationId: '',
  toLocationId: '',
  carrier: {
    name: '',
    trackingNumber: '',
    vehicleId: '',
    driverName: '',
  },
  items: [
    {
      productId: '',
      batchNumber: '',
      quantity: '',
      unit: '',
    },
  ],
  temperature: {
    min: '',
    max: '',
    unit: 'C',
  },
  humidity: {
    min: '',
    max: '',
  },
  expectedDeparture: '',
  expectedArrival: '',
};

const SHIPMENT_TYPES: PharmaceuticalShipment['type'][] = [
  'Domestic',
  'International',
  'Internal Transfer',
];

const PRIORITIES: PharmaceuticalShipment['priority'][] = [
  'Standard',
  'Express',
  'Critical',
];

const CreateShipment: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<ShipmentForm>(initialFormState);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter out the selected origin location from destination options
  const destinationOptions = useMemo(() => 
    mockPharmaceuticalLocations.filter(loc => loc.id !== form.fromLocationId),
    [form.fromLocationId]
  );

  // Get product details for selected products
  const selectedProducts = useMemo(() => 
    form.items.map(item => ({
      item,
      product: mockPharmaceuticalProducts.find(p => p.id === item.productId)
    })),
    [form.items]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCarrierChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      carrier: {
        ...prev.carrier,
        [name]: value,
      },
    }));
  };

  const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      temperature: {
        ...prev.temperature,
        [name]: value,
      },
    }));
  };

  const handleHumidityChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      humidity: {
        ...prev.humidity,
        [name]: value,
      },
    }));
  };

  const handleItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i !== index) return item;
        
        // If changing product, update unit from product details
        if (name === 'productId') {
          const product = mockPharmaceuticalProducts.find(p => p.id === value);
          return {
            ...item,
            [name]: value,
            unit: product?.unitOfMeasure || ''
          };
        }
        
        return { ...item, [name]: value };
      }),
    }));
  };

  const addItem = () => {
    setForm(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: '',
          batchNumber: '',
          quantity: '',
          unit: '',
        },
      ],
    }));
  };

  const removeItem = (index: number) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      setLoading(true);

      // Convert form data to CreateShipmentData
      const shipmentData: CreateShipmentData = {
        ...form,
        items: form.items.map(item => ({
          ...item,
          quantity: Number(item.quantity)
        })),
        temperature: {
          min: Number(form.temperature.min),
          max: Number(form.temperature.max),
          unit: form.temperature.unit
        },
        humidity: {
          min: Number(form.humidity.min),
          max: Number(form.humidity.max)
        },
        documents: selectedFiles
      };

      // Validate data
      const validationErrors = validateShipmentData(shipmentData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join('\n'));
      }

      // Create shipment with blockchain transaction
      await createShipment(shipmentData);

      // Navigate back to tracking page on success
      navigate(ROUTES.SHIPMENTS.ROOT);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Create Shipment
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          {/* Basic Information */}
          <DashboardCard title="Basic Information">
            <Box sx={{ p: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="referenceNumber"
                    label="Reference Number"
                    value={form.referenceNumber}
                    onChange={handleChange}
                    placeholder="Enter reference number"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    name="type"
                    label="Shipment Type"
                    value={form.type}
                    onChange={handleChange}
                    variant="outlined"
                  >
                    {SHIPMENT_TYPES.map(type => (
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
                    name="priority"
                    label="Priority"
                    value={form.priority}
                    onChange={handleChange}
                    variant="outlined"
                  >
                    {PRIORITIES.map(priority => (
                      <MenuItem key={priority} value={priority}>
                        {priority}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    name="fromLocationId"
                    label="From Location"
                    value={form.fromLocationId}
                    onChange={handleChange}
                    variant="outlined"
                  >
                    {mockPharmaceuticalLocations.map(location => (
                      <MenuItem key={location.id} value={location.id}>
                        {location.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    name="toLocationId"
                    label="To Location"
                    value={form.toLocationId}
                    onChange={handleChange}
                    variant="outlined"
                    disabled={!form.fromLocationId}
                  >
                    {destinationOptions.map(location => (
                      <MenuItem key={location.id} value={location.id}>
                        {location.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Box>
          </DashboardCard>

          {/* Items */}
          <Box sx={{ mt: 3 }}>
            <DashboardCard
              title="Items"
              action={
                <Button
                  variant="outlined"
                  startIcon={<Plus size={20} />}
                  onClick={addItem}
                >
                  Add Item
                </Button>
              }
            >
              <Box sx={{ p: 2 }}>
                {form.items.map((item, index) => (
                  <Box key={index}>
                    {index > 0 && <Divider sx={{ my: 2 }} />}
                    <Grid container spacing={3} alignItems="center">
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          select
                          name="productId"
                          label="Product"
                          value={item.productId}
                          onChange={(e) => handleItemChange(index, e)}
                          variant="outlined"
                        >
                          {mockPharmaceuticalProducts.map(product => (
                            <MenuItem key={product.id} value={product.id}>
                              {product.name}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          name="batchNumber"
                          label="Batch Number"
                          value={item.batchNumber}
                          onChange={(e) => handleItemChange(index, e)}
                          placeholder="Enter batch number"
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField
                          fullWidth
                          name="quantity"
                          label="Quantity"
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, e)}
                          placeholder="Enter quantity"
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          disabled
                          name="unit"
                          label="Unit"
                          value={item.unit}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} md={1}>
                        <Tooltip title="Remove Item">
                          <IconButton
                            color="error"
                            onClick={() => removeItem(index)}
                            disabled={form.items.length === 1}
                          >
                            <Trash2 size={20} />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Box>
            </DashboardCard>
          </Box>
        </Grid>

        <Grid item xs={12} lg={4}>
          {/* Carrier Information */}
          <DashboardCard title="Carrier Information">
            <Box sx={{ p: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="name"
                    label="Carrier Name"
                    value={form.carrier.name}
                    onChange={handleCarrierChange}
                    placeholder="Enter carrier name"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="trackingNumber"
                    label="Tracking Number"
                    value={form.carrier.trackingNumber}
                    onChange={handleCarrierChange}
                    placeholder="Enter tracking number"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="vehicleId"
                    label="Vehicle ID"
                    value={form.carrier.vehicleId}
                    onChange={handleCarrierChange}
                    placeholder="Enter vehicle ID"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="driverName"
                    label="Driver Name"
                    value={form.carrier.driverName}
                    onChange={handleCarrierChange}
                    placeholder="Enter driver name"
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Box>
          </DashboardCard>

          {/* Environmental Requirements */}
          <Box sx={{ mt: 3 }}>
            <DashboardCard title="Environmental Requirements">
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Temperature Range
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      name="min"
                      label="Min"
                      type="number"
                      value={form.temperature.min}
                      onChange={handleTemperatureChange}
                      InputProps={{
                        endAdornment: `°${form.temperature.unit}`,
                      }}
                      variant="outlined"
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
                      InputProps={{
                        endAdornment: `°${form.temperature.unit}`,
                      }}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>

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
                      InputProps={{
                        endAdornment: '%',
                      }}
                      variant="outlined"
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
                      InputProps={{
                        endAdornment: '%',
                      }}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </Box>
            </DashboardCard>
          </Box>

          {/* Schedule */}
          <Box sx={{ mt: 3 }}>
            <DashboardCard title="Schedule">
              <Box sx={{ p: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="expectedDeparture"
                      label="Expected Departure"
                      type="datetime-local"
                      value={form.expectedDeparture}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="expectedArrival"
                      label="Expected Arrival"
                      type="datetime-local"
                      value={form.expectedArrival}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </Box>
            </DashboardCard>
          </Box>

          {/* Documents & Actions */}
          <Box sx={{ mt: 3 }}>
            <DashboardCard title="Documents & Actions">
              <Box sx={{ p: 2 }}>
                {/* File Input (hidden) */}
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  multiple
                  onChange={handleFileChange}
                />

                {/* Selected Files List */}
                {selectedFiles.length > 0 && (
                  <List sx={{ mb: 2 }}>
                    {selectedFiles.map((file, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={file.name}
                          secondary={`${(file.size / 1024).toFixed(1)} KB`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            color="error"
                            onClick={() => removeFile(index)}
                          >
                            <Trash2 size={20} />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Upload size={20} />}
                  sx={{ mb: 2 }}
                  onClick={handleFileSelect}
                >
                  Upload Documents
                </Button>

                <Button
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  onClick={handleSubmit}
                  sx={{ mb: 2 }}
                >
                  {loading ? 'Creating...' : 'Create Shipment'}
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate(ROUTES.SHIPMENTS.ROOT)}
                >
                  Cancel
                </Button>
              </Box>
            </DashboardCard>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreateShipment;
