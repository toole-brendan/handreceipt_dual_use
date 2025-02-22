import React from 'react';
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Paper,
  Divider,
  Grid
} from '@mui/material';

export interface ReportField {
  id: string;
  label: string;
  category: string;
  defaultSelected?: boolean;
}

interface ReportCustomizationProps {
  availableFields: ReportField[];
  selectedFields: string[];
  onFieldToggle: (fieldId: string) => void;
}

const ReportCustomization: React.FC<ReportCustomizationProps> = ({
  availableFields,
  selectedFields,
  onFieldToggle
}) => {
  // Group fields by category
  const fieldsByCategory = availableFields.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, ReportField[]>);

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Customize Report Fields
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Select the fields you want to include in your report
      </Typography>

      <Grid container spacing={3}>
        {Object.entries(fieldsByCategory).map(([category, fields]) => (
          <Grid item xs={12} md={6} key={category}>
            <Box>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                {category}
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <FormGroup>
                {fields.map((field) => (
                  <FormControlLabel
                    key={field.id}
                    control={
                      <Checkbox
                        checked={selectedFields.includes(field.id)}
                        onChange={() => onFieldToggle(field.id)}
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        {field.label}
                      </Typography>
                    }
                  />
                ))}
              </FormGroup>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

// Example fields for different report types
export const INVENTORY_REPORT_FIELDS: ReportField[] = [
  { id: 'name', label: 'Product Name', category: 'Product Information', defaultSelected: true },
  { id: 'sku', label: 'SKU', category: 'Product Information', defaultSelected: true },
  { id: 'category', label: 'Category', category: 'Product Information' },
  { id: 'description', label: 'Description', category: 'Product Information' },
  { id: 'manufacturer', label: 'Manufacturer', category: 'Product Information' },
  { id: 'quantity', label: 'Quantity', category: 'Inventory', defaultSelected: true },
  { id: 'unitOfMeasure', label: 'Unit of Measure', category: 'Inventory', defaultSelected: true },
  { id: 'unitCost', label: 'Unit Cost ($)', category: 'Valuation', defaultSelected: true },
  { id: 'totalValue', label: 'Total Value ($)', category: 'Valuation', defaultSelected: true },
  { id: 'location', label: 'Location', category: 'Inventory', defaultSelected: true },
  { id: 'status', label: 'Status', category: 'Inventory', defaultSelected: true },
  { id: 'batchNumber', label: 'Batch Number', category: 'Inventory' },
  { id: 'expiryDate', label: 'Expiry Date', category: 'Inventory' },
  { id: 'storageConditions', label: 'Storage Conditions', category: 'Inventory' },
  { id: 'blockchainData.timestamp', label: 'Last Updated', category: 'Blockchain' },
  { id: 'blockchainData.transactionHash', label: 'Transaction Hash', category: 'Blockchain' },
  { id: 'blockchainData.verified', label: 'Blockchain Verified', category: 'Blockchain' }
];

export const SHIPMENT_REPORT_FIELDS: ReportField[] = [
  { id: 'shipment_id', label: 'Shipment ID', category: 'Shipment Information', defaultSelected: true },
  { id: 'origin', label: 'Origin', category: 'Shipment Information', defaultSelected: true },
  { id: 'destination', label: 'Destination', category: 'Shipment Information', defaultSelected: true },
  { id: 'status', label: 'Status', category: 'Shipment Information', defaultSelected: true },
  { id: 'carrier', label: 'Carrier', category: 'Shipment Information' },
  { id: 'tracking_number', label: 'Tracking Number', category: 'Shipment Information' },
  { id: 'products', label: 'Products', category: 'Contents', defaultSelected: true },
  { id: 'quantity', label: 'Quantity', category: 'Contents', defaultSelected: true },
  { id: 'shipping_date', label: 'Shipping Date', category: 'Dates', defaultSelected: true },
  { id: 'estimated_delivery', label: 'Estimated Delivery', category: 'Dates' },
  { id: 'actual_delivery', label: 'Actual Delivery', category: 'Dates' },
];

export const PROVENANCE_REPORT_FIELDS: ReportField[] = [
  { id: 'product_id', label: 'Product ID', category: 'Product Information', defaultSelected: true },
  { id: 'product_name', label: 'Product Name', category: 'Product Information', defaultSelected: true },
  { id: 'transaction_hash', label: 'Transaction Hash', category: 'Blockchain', defaultSelected: true },
  { id: 'timestamp', label: 'Timestamp', category: 'Event Information', defaultSelected: true },
  { id: 'action', label: 'Action', category: 'Event Information', defaultSelected: true },
  { id: 'location', label: 'Location', category: 'Event Information', defaultSelected: true },
  { id: 'actor', label: 'Actor', category: 'Event Information', defaultSelected: true },
  { id: 'documents', label: 'Documents', category: 'Additional Information' },
  { id: 'sensor_data', label: 'Sensor Data', category: 'Additional Information' },
  { id: 'verification_status', label: 'Verification Status', category: 'Blockchain' },
];

export default ReportCustomization;
