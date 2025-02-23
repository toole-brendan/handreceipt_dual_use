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
  FormControlLabel,
  Checkbox,
  IconButton,
  Box,
  Typography,
  Alert,
  SelectChangeEvent,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { InitiatePaymentData, PaymentType } from '@shared/types/payments';

interface InitiatePaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: InitiatePaymentData) => Promise<void>;
  recipients: Array<{ id: string; name: string }>;
  orders: Array<{ id: string; number: string }>;
}

export const InitiatePaymentModal: React.FC<InitiatePaymentModalProps> = ({
  open,
  onClose,
  onSubmit,
  recipients,
  orders,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<InitiatePaymentData>({
    type: 'OUTGOING',
    amount: 0,
  });
  const [enableSmartContract, setEnableSmartContract] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (formData.amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      await onSubmit({
        ...formData,
        enableSmartContract,
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = (field: keyof InitiatePaymentData) => (
    event: SelectChangeEvent
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleInputChange = (field: keyof InitiatePaymentData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit,
      }}
    >
      <DialogTitle sx={{ pr: 6 }}>
        Initiate New Payment
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Payment Type</InputLabel>
            <Select
              value={formData.type}
              label="Payment Type"
              onChange={handleSelectChange('type')}
              required
            >
              <MenuItem value="OUTGOING">Outgoing to Supplier</MenuItem>
              <MenuItem value="INCOMING">Incoming from Customer</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>{formData.type === 'OUTGOING' ? 'Recipient' : 'Sender'}</InputLabel>
            <Select
              value={formData.recipientId || ''}
              label={formData.type === 'OUTGOING' ? 'Recipient' : 'Sender'}
              onChange={handleSelectChange('recipientId')}
              required
            >
              {recipients.map((recipient) => (
                <MenuItem key={recipient.id} value={recipient.id}>
                  {recipient.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Amount (USDC)"
            type="number"
            value={formData.amount}
            onChange={handleInputChange('amount')}
            required
            inputProps={{
              min: 0.01,
              step: 0.01,
            }}
          />

          <FormControl fullWidth>
            <InputLabel>Related Order</InputLabel>
            <Select
              value={formData.orderId || ''}
              label="Related Order"
              onChange={handleSelectChange('orderId')}
            >
              <MenuItem value="">None</MenuItem>
              {orders.map((order) => (
                <MenuItem key={order.id} value={order.id}>
                  Order #{order.number}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Checkbox
                checked={enableSmartContract}
                onChange={(e) => setEnableSmartContract(e.target.checked)}
              />
            }
            label="Enable Smart Contract"
          />

          {enableSmartContract && (
            <Box sx={{ pl: 2 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Smart Contract Settings
              </Typography>
              <TextField
                fullWidth
                label="Condition"
                value={formData.smartContractCondition || ''}
                onChange={handleInputChange('smartContractCondition')}
                placeholder="e.g., Payment on Delivery"
                sx={{ mt: 1 }}
              />
              <TextField
                fullWidth
                label="Timeout (days)"
                type="number"
                value={formData.smartContractTimeout || ''}
                onChange={handleInputChange('smartContractTimeout')}
                inputProps={{ min: 1 }}
                sx={{ mt: 2 }}
              />
            </Box>
          )}

          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={2}
            value={formData.notes || ''}
            onChange={handleInputChange('notes')}
            placeholder="Add any additional notes about this payment"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Initiating...' : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InitiatePaymentModal; 