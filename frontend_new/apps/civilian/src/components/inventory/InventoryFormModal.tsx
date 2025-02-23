import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  Box,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { InventoryItem, NewInventoryItemData, InventoryCategory } from '@shared/types/inventory';

interface InventoryFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: NewInventoryItemData) => void;
  editItem?: InventoryItem;
}

const LOCATIONS = ['Warehouse A', 'Roasting Facility', 'Distribution Center'];
const CERTIFICATIONS = ['Organic', 'Fair Trade', 'Rainforest Alliance', 'Bird Friendly', 'UTZ Certified'];
const UNITS = ['kg', 'lbs', 'bags'];

export const InventoryFormModal: React.FC<InventoryFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  editItem,
}) => {
  const [formData, setFormData] = React.useState<NewInventoryItemData>(() => {
    if (editItem) {
      return {
        name: editItem.name,
        sku: editItem.sku,
        category: editItem.category,
        quantity: editItem.quantity,
        unit: editItem.unit,
        location: editItem.location,
        roastDate: editItem.roastDate,
        bestByDate: editItem.bestByDate,
        supplier: editItem.supplier || '',
        certifications: editItem.certifications,
        description: editItem.description || '',
        createDigitalTwin: false,
      };
    }
    return {
      name: '',
      category: 'RAW_MATERIALS' as InventoryCategory,
      quantity: 0,
      unit: 'kg',
      location: '',
      bestByDate: new Date().toISOString(),
      certifications: [],
      createDigitalTwin: true,
    };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof NewInventoryItemData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleNumberChange = (field: keyof NewInventoryItemData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseFloat(event.target.value);
    if (!isNaN(value)) {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleDateChange = (field: 'roastDate' | 'bestByDate') => (date: Date | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: date?.toISOString() || '',
    }));
  };

  const handleCheckboxChange = (field: keyof NewInventoryItemData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.checked,
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {editItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Item Name"
                value={formData.name}
                onChange={handleChange('name')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="SKU"
                value={formData.sku}
                onChange={handleChange('sku')}
                disabled={!!editItem}
                helperText={!editItem && "Leave blank for auto-generation"}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                required
                fullWidth
                label="Category"
                value={formData.category}
                onChange={handleChange('category')}
              >
                <MenuItem value="RAW_MATERIALS">Raw Materials</MenuItem>
                <MenuItem value="WORK_IN_PROGRESS">Work in Progress</MenuItem>
                <MenuItem value="FINISHED_GOODS">Finished Goods</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                required
                fullWidth
                type="number"
                label="Quantity"
                value={formData.quantity}
                onChange={handleNumberChange('quantity')}
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                required
                fullWidth
                label="Unit"
                value={formData.unit}
                onChange={handleChange('unit')}
              >
                {UNITS.map((unit) => (
                  <MenuItem key={unit} value={unit}>
                    {unit}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                required
                fullWidth
                label="Location"
                value={formData.location}
                onChange={handleChange('location')}
              >
                {LOCATIONS.map((location) => (
                  <MenuItem key={location} value={location}>
                    {location}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Roast Date"
                value={formData.roastDate ? new Date(formData.roastDate) : null}
                onChange={handleDateChange('roastDate')}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Best By Date"
                value={new Date(formData.bestByDate)}
                onChange={handleDateChange('bestByDate')}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Supplier"
                value={formData.supplier}
                onChange={handleChange('supplier')}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={CERTIFICATIONS}
                value={formData.certifications}
                onChange={(_, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    certifications: newValue,
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Certifications"
                    placeholder="Select certifications"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={handleChange('description')}
              />
            </Grid>
            {!editItem && (
              <Grid item xs={12}>
                <Box sx={{ mt: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.createDigitalTwin}
                        onChange={handleCheckboxChange('createDigitalTwin')}
                      />
                    }
                    label="Create Digital Twin on Blockchain"
                  />
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {editItem ? 'Save Changes' : 'Add Item'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}; 