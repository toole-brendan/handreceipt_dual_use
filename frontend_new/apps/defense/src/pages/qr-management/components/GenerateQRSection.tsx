import React, { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Autocomplete,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
} from '@mui/material';
import { RemoveRedEye as PreviewIcon } from '@mui/icons-material';
import type { ItemDetails, QRCodeDetails, GenerateQRFormData, TrackingAction } from '../types';
import { MetadataSection } from './MetadataSection';
import { PreviewModal } from './PreviewModal';

// Mock data - replace with actual data from your API
const mockItems: ItemDetails[] = [
  {
    id: '1',
    name: 'Rifle, 5.56mm, M4',
    serialNumber: 'SN12345',
    currentStatus: 'Issued',
    location: 'Armory A',
    assignedTo: 'PFC Smith',
  },
  // Add more mock items as needed
];

interface Props {
  onQRGenerated: (qrDetails: QRCodeDetails) => void;
}

export const GenerateQRSection: React.FC<Props> = ({ onQRGenerated }) => {
  const [selectedItem, setSelectedItem] = useState<ItemDetails | null>(null);
  const [formData, setFormData] = useState<GenerateQRFormData>({
    itemId: '',
    actionType: 'TRANSFER',
    actionDetails: {},
    metadata: {
      serialNumber: true,
      currentStatus: false,
      location: false,
      assignedUser: false,
      timestamp: true,
    },
  });
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleItemSelect = (item: ItemDetails | null) => {
    setSelectedItem(item);
    setFormData(prev => ({
      ...prev,
      itemId: item?.id || '',
    }));
  };

  const handleActionTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const actionType = event.target.value as TrackingAction;
    setFormData(prev => ({
      ...prev,
      actionType,
      actionDetails: {}, // Reset action details when type changes
    }));
  };

  const handleActionDetailsChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      actionDetails: {
        ...prev.actionDetails,
        [field]: value,
      },
    }));
  };

  const handleMetadataChange = (metadata: GenerateQRFormData['metadata']) => {
    setFormData(prev => ({
      ...prev,
      metadata,
    }));
  };

  const handlePreview = () => {
    setIsPreviewOpen(true);
  };

  const handleGenerateQR = () => {
    // Mock QR generation - replace with actual API call
    const newQR: QRCodeDetails = {
      id: `QR${Math.random().toString(36).substr(2, 9)}`,
      itemId: selectedItem?.id || '',
      itemName: selectedItem?.name || '',
      serialNumber: selectedItem?.serialNumber || '',
      action: {
        type: formData.actionType,
        details: formData.actionDetails,
      },
      createdDate: new Date().toISOString(),
      status: 'PENDING',
      metadata: formData.metadata,
    };
    onQRGenerated(newQR);
    setIsPreviewOpen(false);
  };

  const renderActionFields = () => {
    switch (formData.actionType) {
      case 'TRANSFER':
        return (
          <TextField
            fullWidth
            label="Recipient"
            value={formData.actionDetails.recipientName || ''}
            onChange={(e) => handleActionDetailsChange('recipientName', e.target.value)}
            required
          />
        );
      case 'UPDATE_STATUS':
        return (
          <TextField
            fullWidth
            label="New Status"
            select
            value={formData.actionDetails.newStatus || ''}
            onChange={(e) => handleActionDetailsChange('newStatus', e.target.value)}
            required
          >
            <option value="SERVICEABLE">Serviceable</option>
            <option value="UNSERVICEABLE">Unserviceable</option>
            <option value="IN_MAINTENANCE">In Maintenance</option>
          </TextField>
        );
      case 'MAINTENANCE':
      case 'LOST_DAMAGED':
        return (
          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={3}
            value={formData.actionDetails.notes || ''}
            onChange={(e) => handleActionDetailsChange('notes', e.target.value)}
            required
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Item Selection */}
        <Grid item xs={12} md={6}>
          <Autocomplete
            options={mockItems}
            getOptionLabel={(item) => `${item.name} - ${item.serialNumber}`}
            value={selectedItem}
            onChange={(_, newValue) => handleItemSelect(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Item"
                required
                fullWidth
              />
            )}
          />

          {selectedItem && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Item Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Name: {selectedItem.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Serial Number: {selectedItem.serialNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Current Status: {selectedItem.currentStatus}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Location: {selectedItem.location}
                    </Typography>
                  </Grid>
                  {selectedItem.assignedTo && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Assigned To: {selectedItem.assignedTo}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Action Selection and Details */}
        <Grid item xs={12} md={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Select Tracking Action</FormLabel>
            <RadioGroup
              value={formData.actionType}
              onChange={handleActionTypeChange}
            >
              <FormControlLabel
                value="TRANSFER"
                control={<Radio />}
                label="Transfer Property"
              />
              <FormControlLabel
                value="UPDATE_STATUS"
                control={<Radio />}
                label="Update Status"
              />
              <FormControlLabel
                value="MAINTENANCE"
                control={<Radio />}
                label="Report Maintenance"
              />
              <FormControlLabel
                value="LOST_DAMAGED"
                control={<Radio />}
                label="Mark as Lost/Damaged"
              />
            </RadioGroup>
          </FormControl>

          <Box mt={2}>{renderActionFields()}</Box>
        </Grid>

        {/* Metadata Section */}
        <Grid item xs={12}>
          <Divider sx={{ my: 3 }} />
          <MetadataSection
            metadata={formData.metadata}
            onChange={handleMetadataChange}
          />
        </Grid>

        {/* Buttons */}
        <Grid item xs={12}>
          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={handlePreview}
              disabled={!selectedItem || !formData.actionType}
              startIcon={<PreviewIcon />}
            >
              Preview QR Code
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGenerateQR}
              disabled={!selectedItem || !formData.actionType}
            >
              Generate QR Code
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Preview Modal */}
      <PreviewModal
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onConfirm={handleGenerateQR}
        formData={formData}
        selectedItem={selectedItem}
      />
    </Box>
  );
}; 