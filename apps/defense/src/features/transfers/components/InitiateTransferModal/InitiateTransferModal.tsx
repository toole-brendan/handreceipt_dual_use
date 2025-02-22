import React, { useState } from 'react';
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
  Box,
  Typography,
  IconButton,
  Chip,
  OutlinedInput,
  useTheme,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { QrCode, X as CloseIcon, Plus, Scan } from 'lucide-react';
import type { InitiateTransferData, Category, TransferType } from '../../types';

interface InitiateTransferModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: InitiateTransferData) => void;
  availableItems: Array<{
    id: string;
    name: string;
    serialNumber: string;
    category: Category;
  }>;
  availableRecipients: Array<{
    id: string;
    name: string;
    rank: string;
    unit: string;
  }>;
}

export const InitiateTransferModal: React.FC<InitiateTransferModalProps> = ({
  open,
  onClose,
  onSubmit,
  availableItems,
  availableRecipients,
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState<InitiateTransferData>({
    items: [],
    recipient: {
      id: '',
      name: '',
      rank: '',
      unit: '',
    },
    type: 'outgoing',
    dateNeeded: new Date().toISOString(),
  });

  const handleItemSelect = (event: any) => {
    const selectedIds = event.target.value as string[];
    const selectedItems = availableItems.filter((item) => selectedIds.includes(item.id));
    setFormData({ ...formData, items: selectedItems });
  };

  const handleRecipientSelect = (event: any) => {
    const selectedId = event.target.value;
    const selectedRecipient = availableRecipients.find((r) => r.id === selectedId);
    if (selectedRecipient) {
      setFormData({ ...formData, recipient: selectedRecipient });
    }
  };

  const handleTypeSelect = (event: any) => {
    setFormData({ ...formData, type: event.target.value as TransferType });
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData({ ...formData, dateNeeded: date.toISOString() });
    }
  };

  const handleNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, notes: event.target.value });
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  const handleScanQR = () => {
    // Implement QR code scanning
    console.log('Scanning QR code...');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1,
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">Initiate New Transfer</Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              color: 'text.primary',
            },
          }}
        >
          <CloseIcon size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Items Selection */}
          <FormControl fullWidth>
            <InputLabel>Select Items</InputLabel>
            <Select
              multiple
              value={formData.items.map((item) => item.id)}
              onChange={handleItemSelect}
              input={<OutlinedInput label="Select Items" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {formData.items.map((item) => (
                    <Chip
                      key={item.id}
                      label={`${item.name} (${item.serialNumber})`}
                      size="small"
                    />
                  ))}
                </Box>
              )}
            >
              {availableItems.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {`${item.name} - ${item.serialNumber} (${item.category})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<QrCode />}
              onClick={handleScanQR}
              sx={{ flexGrow: 1 }}
            >
              Add Items by QR Code
            </Button>
            <Button
              variant="outlined"
              startIcon={<Scan />}
              onClick={handleScanQR}
              sx={{ flexGrow: 1 }}
            >
              Scan Multiple Items
            </Button>
          </Box>

          {/* Recipient Selection */}
          <FormControl fullWidth>
            <InputLabel>Select Recipient</InputLabel>
            <Select
              value={formData.recipient.id}
              onChange={handleRecipientSelect}
              input={<OutlinedInput label="Select Recipient" />}
            >
              {availableRecipients.map((recipient) => (
                <MenuItem key={recipient.id} value={recipient.id}>
                  {`${recipient.rank} ${recipient.name} - ${recipient.unit}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Transfer Type */}
          <FormControl fullWidth>
            <InputLabel>Transfer Type</InputLabel>
            <Select
              value={formData.type}
              onChange={handleTypeSelect}
              input={<OutlinedInput label="Transfer Type" />}
            >
              <MenuItem value="outgoing">Permanent Transfer</MenuItem>
              <MenuItem value="temporary_loan">Temporary Loan</MenuItem>
            </Select>
          </FormControl>

          {/* Date Needed */}
          <DatePicker
            label="Date Needed"
            value={new Date(formData.dateNeeded)}
            onChange={handleDateChange}
            slotProps={{ textField: { fullWidth: true } }}
          />

          {/* Notes */}
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Notes"
            value={formData.notes || ''}
            onChange={handleNotesChange}
            placeholder="Add any additional notes or instructions..."
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={<Plus size={16} />}
          disabled={formData.items.length === 0 || !formData.recipient.id}
        >
          Initiate Transfer
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 