import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  MenuItem,
  Paper,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  FormHelperText
} from '@mui/material';
import { ArrowLeft, Save } from 'lucide-react';
import { PharmaceuticalProduct } from '@/mocks/api/pharmaceuticals-products.mock';
import { ROUTES } from '@/constants/routes';
import DashboardCard from '@/components/common/DashboardCard';
import BlockchainBadge from '@/components/common/BlockchainBadge';

const CATEGORIES: PharmaceuticalProduct['category'][] = [
  'API',
  'Excipient',
  'Raw Material',
  'Finished Drug',
  'Packaging Material'
];

const STATUSES: PharmaceuticalProduct['status'][] = [
  'In Stock',
  'Low Stock',
  'Quarantined',
  'Approved',
  'Rejected',
  'Expired',
  'Recalled',
  'Archived'
];

interface FormErrors {
  [key: string]: string;
}

const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<Partial<PharmaceuticalProduct>>({
    name: '',
    sku: '',
    category: undefined,
    description: '',
    unitOfMeasure: '',
    manufacturer: '',
    storageConditions: '',
    status: 'In Stock',
    quantity: 0,
    location: ''
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.sku?.trim()) {
      newErrors.sku = 'SKU is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.unitOfMeasure?.trim()) {
      newErrors.unitOfMeasure = 'Unit of measure is required';
    }

    if (!formData.manufacturer?.trim()) {
      newErrors.manufacturer = 'Manufacturer is required';
    }

    if (!formData.storageConditions?.trim()) {
      newErrors.storageConditions = 'Storage conditions are required';
    }

    if (!formData.location?.trim()) {
      newErrors.location = 'Location is required';
    }

    if (typeof formData.quantity !== 'number' || formData.quantity < 0) {
      newErrors.quantity = 'Quantity must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Simulate blockchain transaction
      const transactionHash = `0x${Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)).join('')}`;

      const newProduct: PharmaceuticalProduct = {
        id: `PROD-${Date.now()}`,
        ...formData as Omit<PharmaceuticalProduct, 'id' | 'blockchainData'>,
        blockchainData: {
          transactionHash,
          timestamp: new Date().toISOString(),
          verified: true
        }
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Navigate back to catalog
      navigate(ROUTES.PRODUCTS.CATALOG);
    } catch (error) {
      setErrors({
        submit: 'Failed to create product. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof PharmaceuticalProduct) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: field === 'quantity' ? Number(value) : value
    }));

    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSelectChange = (field: keyof PharmaceuticalProduct) => (
    e: SelectChangeEvent<string>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowLeft size={20} />}
            onClick={() => navigate(ROUTES.PRODUCTS.CATALOG)}
          >
            Back to Catalog
          </Button>
          <Typography variant="h4">Add New Product</Typography>
          <BlockchainBadge
            status="Ready for Blockchain"
            showTooltip={true}
          />
        </Box>
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <DashboardCard title="Basic Information">
              <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Product Name"
                      value={formData.name}
                      onChange={handleInputChange('name')}
                      error={!!errors.name}
                      helperText={errors.name}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="SKU"
                      value={formData.sku}
                      onChange={handleInputChange('sku')}
                      error={!!errors.sku}
                      helperText={errors.sku}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!errors.category} required>
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={formData.category || ''}
                        label="Category"
                        onChange={handleSelectChange('category')}
                      >
                        {CATEGORIES.map((category) => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.category && (
                        <FormHelperText>{errors.category}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Unit of Measure"
                      value={formData.unitOfMeasure}
                      onChange={handleInputChange('unitOfMeasure')}
                      error={!!errors.unitOfMeasure}
                      helperText={errors.unitOfMeasure}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Description"
                      value={formData.description}
                      onChange={handleInputChange('description')}
                      error={!!errors.description}
                      helperText={errors.description}
                      required
                    />
                  </Grid>
                </Grid>
              </Box>
            </DashboardCard>
          </Grid>

          {/* Manufacturing Information */}
          <Grid item xs={12}>
            <DashboardCard title="Manufacturing Information">
              <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Manufacturer"
                      value={formData.manufacturer}
                      onChange={handleInputChange('manufacturer')}
                      error={!!errors.manufacturer}
                      helperText={errors.manufacturer}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Batch Number"
                      value={formData.batchNumber || ''}
                      onChange={handleInputChange('batchNumber')}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Expiry Date"
                      value={formData.expiryDate || ''}
                      onChange={handleInputChange('expiryDate')}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Storage Conditions"
                      value={formData.storageConditions}
                      onChange={handleInputChange('storageConditions')}
                      error={!!errors.storageConditions}
                      helperText={errors.storageConditions}
                      required
                    />
                  </Grid>
                </Grid>
              </Box>
            </DashboardCard>
          </Grid>

          {/* Inventory Information */}
          <Grid item xs={12}>
            <DashboardCard title="Inventory Information">
              <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth error={!!errors.status} required>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={formData.status || ''}
                        label="Status"
                        onChange={handleSelectChange('status')}
                      >
                        {STATUSES.map((status) => (
                          <MenuItem key={status} value={status}>
                            {status}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.status && (
                        <FormHelperText>{errors.status}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Quantity"
                      value={formData.quantity}
                      onChange={handleInputChange('quantity')}
                      error={!!errors.quantity}
                      helperText={errors.quantity}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Location"
                      value={formData.location}
                      onChange={handleInputChange('location')}
                      error={!!errors.location}
                      helperText={errors.location}
                      required
                    />
                  </Grid>
                </Grid>
              </Box>
            </DashboardCard>
          </Grid>
        </Grid>

        {/* Error Message */}
        {errors.submit && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errors.submit}
          </Alert>
        )}

        {/* Submit Button */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Save size={20} />}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating Product...' : 'Create Product'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default AddProduct;
