import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Chip,
  IconButton,
  Link,
  useTheme,
} from '@mui/material';
import {
  Print as PrintIcon,
  Download as DownloadIcon,
  Launch as LaunchIcon,
} from '@mui/icons-material';
import type { QRCodeDetails, QRStatus } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  qrDetails: QRCodeDetails | null;
}

export const QRDetailsModal: React.FC<Props> = ({ open, onClose, qrDetails }) => {
  const theme = useTheme();
  
  if (!qrDetails) return null;

  const getStatusColor = (status: QRStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'SCANNED':
        return 'success';
      case 'EXPIRED':
        return 'error';
      case 'CANCELLED':
        return 'default';
      default:
        return 'default';
    }
  };

  const handlePrint = () => {
    // Implement print functionality
    console.log('Print QR Code:', qrDetails.id);
  };

  const handleDownload = () => {
    // Implement download functionality
    console.log('Download QR Code:', qrDetails.id);
  };

  const handleViewDigitalTwin = () => {
    // Implement digital twin view functionality
    console.log('View Digital Twin:', qrDetails.itemId);
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
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">QR Code Details</Typography>
          <Box>
            <IconButton onClick={handlePrint} title="Print QR Code">
              <PrintIcon />
            </IconButton>
            <IconButton onClick={handleDownload} title="Download QR Code">
              <DownloadIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* QR Code Image */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                width: '100%',
                height: 300,
                backgroundColor: theme.palette.grey[100],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 1,
              }}
            >
              {/* Replace with actual QR code image */}
              <Typography color="text.secondary">QR Code Image</Typography>
            </Box>
          </Grid>

          {/* Details */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Item Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Item Name
                </Typography>
                <Typography variant="body1">{qrDetails.itemName}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Serial Number
                </Typography>
                <Typography variant="body1">{qrDetails.serialNumber}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Action
                </Typography>
                <Typography variant="body1">
                  {qrDetails.action.type}{' '}
                  {qrDetails.action.details.recipientName
                    ? `to ${qrDetails.action.details.recipientName}`
                    : ''}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={qrDetails.status}
                  color={getStatusColor(qrDetails.status)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Created Date
                </Typography>
                <Typography variant="body1">
                  {new Date(qrDetails.createdDate).toLocaleString()}
                </Typography>
              </Grid>
              {qrDetails.blockchainTxId && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Blockchain Transaction
                  </Typography>
                  <Link
                    href={`#/blockchain/${qrDetails.blockchainTxId}`}
                    target="_blank"
                    rel="noopener"
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                  >
                    View Transaction <LaunchIcon sx={{ fontSize: 16 }} />
                  </Link>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleViewDigitalTwin} color="primary">
          View Digital Twin
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}; 