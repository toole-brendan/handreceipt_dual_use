import React from 'react';
import {
  Box,
  Card,
  Stack,
  Typography,
  TextField,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Button } from '@shared/components/base/Button';
import { StatusChip } from '@shared/components/common/mui/StatusChip';
import { mapPropertyStatusToChipStatus, getStatusLabel } from '../../utils/statusMapping';
import { useProperty } from '../../hooks/useProperty';
import type { PropertyItem } from '../../types/property';

// Mock data for recipients - this would come from an API in production
const mockRecipients = [
  { id: '1', rank: 'SGT', name: 'Smith, John', unit: 'A Co, 1-12 IN' },
  { id: '2', rank: 'SPC', name: 'Johnson, Mike', unit: 'B Co, 1-12 IN' },
  { id: '3', rank: 'SSG', name: 'Williams, Sarah', unit: 'HHC, 1-12 IN' },
];

interface TransferDialogProps {
  open: boolean;
  onClose: () => void;
  item: PropertyItem;
  onConfirm: () => void;
}

const TransferDialog: React.FC<TransferDialogProps> = ({
  open,
  onClose,
  item,
  onConfirm,
}) => {
  const [selectedRecipient, setSelectedRecipient] = React.useState<typeof mockRecipients[0] | null>(null);
  const [notes, setNotes] = React.useState('');

  const handleConfirm = () => {
    if (selectedRecipient) {
      // In production, this would dispatch the transfer action
      onConfirm();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Transfer Equipment</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Item Details */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary">Item</Typography>
            <Typography variant="body1">{item.nomenclature}</Typography>
            <Typography variant="body2" color="text.secondary">
              NSN: {item.nsn} | Serial: {item.serialNumber}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <StatusChip
                status={mapPropertyStatusToChipStatus(item.status)}
                label={getStatusLabel(item.status)}
              />
            </Box>
          </Box>

          {/* Recipient Selection */}
          <Autocomplete
            options={mockRecipients}
            getOptionLabel={(option) => `${option.rank} ${option.name} (${option.unit})`}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Transfer To"
                required
                helperText="Search by name, rank, or unit"
              />
            )}
            value={selectedRecipient}
            onChange={(_, newValue) => setSelectedRecipient(newValue)}
          />

          {/* Transfer Notes */}
          <TextField
            label="Transfer Notes"
            multiline
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any relevant notes about this transfer..."
          />

          {/* Transfer Requirements */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary">Requirements</Typography>
            <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
              <li>Recipient must sign DA Form 2062</li>
              <li>Sub-hand receipt must be generated</li>
              <li>Command approval required for sensitive items</li>
            </ul>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleConfirm}
          disabled={!selectedRecipient}
        >
          Initiate Transfer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const QuickTransferModule: React.FC = () => {
  const [selectedItem, setSelectedItem] = React.useState<PropertyItem | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { equipmentList } = useProperty();

  const handleTransferClick = (item: PropertyItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const handleTransferConfirm = () => {
    // In production, this would handle the transfer confirmation
    console.log('Transfer confirmed');
  };

  return (
    <Card>
      <Stack spacing={2} sx={{ p: 3 }}>
        <Typography variant="h6">Quick Transfer</Typography>
        <Typography variant="body2" color="text.secondary">
          Select equipment to initiate a transfer to another user
        </Typography>

        {/* Equipment Selection */}
        <Autocomplete
          options={equipmentList}
          getOptionLabel={(option) => `${option.nomenclature} (${option.serialNumber})`}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Equipment"
              helperText="Search by nomenclature or serial number"
            />
          )}
          renderOption={(props, option) => (
            <li {...props}>
              <Stack spacing={0.5}>
                <Typography variant="body1">{option.nomenclature}</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    SN: {option.serialNumber}
                  </Typography>
                  <StatusChip
                    status={mapPropertyStatusToChipStatus(option.status)}
                    label={getStatusLabel(option.status)}
                  />
                </Stack>
              </Stack>
            </li>
          )}
          onChange={(_, newValue) => newValue && handleTransferClick(newValue)}
        />
      </Stack>

      {/* Transfer Dialog */}
      {selectedItem && (
        <TransferDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          item={selectedItem}
          onConfirm={handleTransferConfirm}
        />
      )}
    </Card>
  );
};
