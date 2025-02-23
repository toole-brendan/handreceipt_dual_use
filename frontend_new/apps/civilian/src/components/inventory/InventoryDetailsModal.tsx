import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Chip,
  Divider,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Link,
} from '@mui/material';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
import { InventoryItem, InventoryTransaction } from '@shared/types/inventory';

interface InventoryDetailsModalProps {
  open: boolean;
  onClose: () => void;
  item: InventoryItem;
  transactions: InventoryTransaction[];
  onEdit: (item: InventoryItem) => void;
  onMarkUsed: (item: InventoryItem) => void;
  onDownloadQR: (item: InventoryItem) => void;
  onPrintQR: (item: InventoryItem) => void;
}

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <Grid container spacing={2} sx={{ mb: 1 }}>
    <Grid item xs={4}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Grid>
    <Grid item xs={8}>
      <Typography variant="body2">{value}</Typography>
    </Grid>
  </Grid>
);

export const InventoryDetailsModal: React.FC<InventoryDetailsModalProps> = ({
  open,
  onClose,
  item,
  transactions,
  onEdit,
  onMarkUsed,
  onDownloadQR,
  onPrintQR,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Item Details - {item.name}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={8}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <InfoRow label="SKU" value={item.sku} />
              <InfoRow
                label="Category"
                value={item.category.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
              />
              <InfoRow label="Quantity" value={`${item.quantity} ${item.unit}`} />
              <InfoRow label="Location" value={item.location} />
              <InfoRow
                label="Status"
                value={
                  <Chip
                    label={item.status.split('_').join(' ')}
                    size="small"
                    color={item.status === 'IN_STOCK' ? 'success' : 'default'}
                  />
                }
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Coffee Details
              </Typography>
              <InfoRow
                label="Roast Date"
                value={item.roastDate ? format(new Date(item.roastDate), 'MMM dd, yyyy') : '-'}
              />
              <InfoRow
                label="Best By Date"
                value={format(new Date(item.bestByDate), 'MMM dd, yyyy')}
              />
              <InfoRow label="Supplier" value={item.supplier || '-'} />
              <InfoRow label="Origin" value={item.origin || '-'} />
              <InfoRow
                label="Certifications"
                value={
                  item.certifications.length > 0 ? (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {item.certifications.map((cert) => (
                        <Chip key={cert} label={cert} size="small" />
                      ))}
                    </Box>
                  ) : (
                    '-'
                  )
                }
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box>
              <Typography variant="h6" gutterBottom>
                Blockchain Information
              </Typography>
              <InfoRow
                label="Status"
                value={
                  <Chip
                    label={item.blockchainStatus}
                    color={item.blockchainStatus === 'VERIFIED' ? 'success' : 'warning'}
                    size="small"
                  />
                }
              />
              {item.transactionHash && (
                <InfoRow
                  label="Transaction Hash"
                  value={
                    <Link href={`https://etherscan.io/tx/${item.transactionHash}`} target="_blank">
                      {item.transactionHash.substring(0, 16)}...
                    </Link>
                  }
                />
              )}
            </Box>
          </Grid>

          <Grid item xs={4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" gutterBottom>
                QR Code
              </Typography>
              <Box sx={{ mb: 2 }}>
                <QRCodeSVG value={JSON.stringify({ id: item.id, sku: item.sku })} size={200} />
              </Box>
              <Button variant="outlined" size="small" onClick={() => onDownloadQR(item)} sx={{ mr: 1 }}>
                Download
              </Button>
              <Button variant="outlined" size="small" onClick={() => onPrintQR(item)}>
                Print
              </Button>
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Transaction History
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{format(new Date(transaction.date), 'MMM dd, yyyy HH:mm')}</TableCell>
                  <TableCell>{transaction.action}</TableCell>
                  <TableCell>{transaction.location}</TableCell>
                  <TableCell>{transaction.quantity}</TableCell>
                  <TableCell>{transaction.notes || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onMarkUsed(item)} color="warning">
          Mark as Used/Sold
        </Button>
        <Button onClick={() => onEdit(item)} color="primary">
          Edit
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}; 