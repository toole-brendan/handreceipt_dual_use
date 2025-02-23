import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import type { GenerateQRFormData, ItemDetails } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  formData: GenerateQRFormData;
  selectedItem: ItemDetails | null;
}

export const PreviewModal: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
  formData,
  selectedItem,
}) => {
  if (!selectedItem) return null;

  const getActionText = (action: string): string => {
    switch (action) {
      case 'TRANSFER':
        return 'Transfer Property';
      case 'UPDATE_STATUS':
        return 'Update Status';
      case 'MAINTENANCE':
        return 'Report Maintenance';
      case 'LOST_DAMAGED':
        return 'Mark as Lost/Damaged';
      default:
        return action;
    }
  };

  const getMetadataList = (): string[] => {
    const list: string[] = [];
    if (formData.metadata.serialNumber) list.push('Serial Number');
    if (formData.metadata.currentStatus) list.push('Current Status');
    if (formData.metadata.location) list.push('Location');
    if (formData.metadata.assignedUser) list.push('Assigned User');
    if (formData.metadata.timestamp) list.push('Timestamp of Scan');
    if (formData.metadata.conditionNotes) {
      list.push(`Condition Notes: ${formData.metadata.conditionNotes}`);
    }
    if (formData.metadata.customField?.label && formData.metadata.customField?.value) {
      list.push(
        `${formData.metadata.customField.label}: ${formData.metadata.customField.value}`
      );
    }
    return list;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>QR Code Preview</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          {/* Placeholder for QR Code Image */}
          <Box
            sx={{
              width: '200px',
              height: '200px',
              backgroundColor: 'grey.100',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              borderRadius: 1,
            }}
          >
            <Typography color="text.secondary">QR Code Image</Typography>
          </Box>
        </Box>

        <Typography variant="h6" gutterBottom>
          Configuration Summary
        </Typography>

        <List>
          <ListItem>
            <ListItemText
              primary="Scan Action"
              secondary={getActionText(formData.actionType)}
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Item"
              secondary={`${selectedItem.name} - ${selectedItem.serialNumber}`}
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Metadata Included"
              secondary={getMetadataList().join(', ')}
            />
          </ListItem>
          {formData.actionDetails.recipientName && (
            <>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Recipient"
                  secondary={formData.actionDetails.recipientName}
                />
              </ListItem>
            </>
          )}
          {formData.actionDetails.notes && (
            <>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Notes"
                  secondary={formData.actionDetails.notes}
                />
              </ListItem>
            </>
          )}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Edit</Button>
        <Button onClick={onConfirm} variant="contained" color="primary">
          Confirm and Generate
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 