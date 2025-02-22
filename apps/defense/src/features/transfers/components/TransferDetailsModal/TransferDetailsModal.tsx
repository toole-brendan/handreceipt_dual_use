import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Grid,
  Divider,
  Chip,
  useTheme,
} from '@mui/material';
import {
  X as CloseIcon,
  QrCode,
  Printer,
  ExternalLink,
  Clock,
  User,
  Package,
  FileText,
  Shield,
} from 'lucide-react';
import type { Transfer } from '../../types';

interface TransferDetailsModalProps {
  open: boolean;
  onClose: () => void;
  transfer: Transfer | null;
  onPrint?: () => void;
  onGenerateQR?: () => void;
  onViewBlockchain?: () => void;
}

const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}> = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
    <Box sx={{ color: 'text.secondary' }}>{icon}</Box>
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  </Box>
);

export const TransferDetailsModal: React.FC<TransferDetailsModalProps> = ({
  open,
  onClose,
  transfer,
  onPrint,
  onGenerateQR,
  onViewBlockchain,
}) => {
  const theme = useTheme();

  if (!transfer) return null;

  const getStatusColor = (status: Transfer['status']) => {
    const statusColors = {
      pending_approval: theme.palette.warning.main,
      awaiting_confirmation: theme.palette.info.main,
      completed: theme.palette.success.main,
      rejected: theme.palette.error.main,
      cancelled: theme.palette.error.main,
    };
    return statusColors[status];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
        <Box>
          <Typography variant="h6">Transfer Details</Typography>
          <Typography variant="caption" color="text.secondary">
            ID: {transfer.id}
          </Typography>
        </Box>
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
        <Box sx={{ mb: 3 }}>
          <Chip
            label={transfer.status.replace('_', ' ').toUpperCase()}
            sx={{
              backgroundColor: `${getStatusColor(transfer.status)}15`,
              color: getStatusColor(transfer.status),
              fontWeight: 500,
            }}
          />
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Transfer Information
            </Typography>
            <InfoRow
              icon={<Package size={16} />}
              label="Item"
              value={`${transfer.itemName} (${transfer.serialNumber})`}
            />
            <InfoRow
              icon={<User size={16} />}
              label="From"
              value={`${transfer.otherParty.rank} ${transfer.otherParty.name}`}
            />
            <InfoRow
              icon={<User size={16} />}
              label="To"
              value={`${transfer.otherParty.rank} ${transfer.otherParty.name}`}
            />
            <InfoRow
              icon={<Clock size={16} />}
              label="Date Requested"
              value={formatDate(transfer.dateRequested)}
            />
            {transfer.dateApproved && (
              <InfoRow
                icon={<Clock size={16} />}
                label="Date Approved"
                value={formatDate(transfer.dateApproved)}
              />
            )}
            {transfer.dateCompleted && (
              <InfoRow
                icon={<Clock size={16} />}
                label="Date Completed"
                value={formatDate(transfer.dateCompleted)}
              />
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Additional Details
            </Typography>
            <InfoRow
              icon={<Shield size={16} />}
              label="Category"
              value={transfer.category}
            />
            {transfer.approver && (
              <InfoRow
                icon={<User size={16} />}
                label="Approved By"
                value={`${transfer.approver.rank} ${transfer.approver.name}`}
              />
            )}
            {transfer.notes && (
              <InfoRow
                icon={<FileText size={16} />}
                label="Notes"
                value={transfer.notes}
              />
            )}
            {transfer.blockchainTxId && (
              <InfoRow
                icon={<ExternalLink size={16} />}
                label="Blockchain Transaction"
                value={
                  <Button
                    variant="text"
                    size="small"
                    onClick={onViewBlockchain}
                    startIcon={<ExternalLink size={16} />}
                  >
                    View Transaction
                  </Button>
                }
              />
            )}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="outlined"
          startIcon={<QrCode size={16} />}
          onClick={onGenerateQR}
        >
          Generate QR Code
        </Button>
        <Button
          variant="outlined"
          startIcon={<Printer size={16} />}
          onClick={onPrint}
        >
          Print Transfer Form
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}; 