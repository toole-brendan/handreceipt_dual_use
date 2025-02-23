import React from 'react';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Link,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  QrCode2 as QrCodeIcon,
  FileDownload as FileDownloadIcon,
  Launch as LaunchIcon,
} from '@mui/icons-material';
import type { Shipment } from '@shared/types/shipments';

interface ShipmentDetailsModalProps {
  open: boolean;
  onClose: () => void;
  shipment: Shipment;
  onGenerateQrCode: (shipmentId: string) => void;
  onDownloadQrCode: (shipmentId: string) => void;
  onConfirmReceipt: (shipmentId: string) => void;
  onUpdateStatus: (shipmentId: string, status: string) => void;
}

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 900,
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 1,
  p: 4,
  overflow: 'auto',
};

export const ShipmentDetailsModal: React.FC<ShipmentDetailsModalProps> = ({
  open,
  onClose,
  shipment,
  onGenerateQrCode,
  onDownloadQrCode,
  onConfirmReceipt,
  onUpdateStatus,
}) => {
  const isOutbound = shipment.type === 'OUTBOUND';
  const canConfirmReceipt = !isOutbound && shipment.status === 'IN_TRANSIT';

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">
            Shipment Details - {shipment.id}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Basic Information */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>Shipment Information</Typography>
            <Box sx={{ display: 'grid', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Order Number:</Typography>
                <Link href={`/orders/${shipment.orderId}`}>{shipment.orderId}</Link>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Type:</Typography>
                <Typography>{isOutbound ? 'Outbound' : 'Inbound'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">{isOutbound ? 'Customer' : 'Supplier'}:</Typography>
                <Typography>{isOutbound ? shipment.customer.name : shipment.supplier.name}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Shipment Date:</Typography>
                <Typography>{new Date(shipment.shipmentDate).toLocaleDateString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Expected Delivery:</Typography>
                <Typography>{new Date(shipment.expectedDeliveryDate).toLocaleDateString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Status:</Typography>
                <Typography color={
                  shipment.status === 'DELIVERED' ? 'success.main' :
                  shipment.status === 'IN_TRANSIT' ? 'info.main' :
                  shipment.status === 'DELAYED' ? 'warning.main' : 'error.main'
                }>
                  {shipment.status.replace('_', ' ')}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>Blockchain & Payment</Typography>
            <Box sx={{ display: 'grid', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Blockchain Status:</Typography>
                <Typography>{shipment.blockchain.status}</Typography>
              </Box>
              {shipment.blockchain.transactionHash && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Transaction Hash:</Typography>
                  <Link href={`https://etherscan.io/tx/${shipment.blockchain.transactionHash}`} target="_blank">
                    {shipment.blockchain.transactionHash.slice(0, 10)}...
                    <LaunchIcon sx={{ fontSize: 14, ml: 0.5 }} />
                  </Link>
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Payment Status:</Typography>
                <Typography>{shipment.payment.status.replace('_', ' ')}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Amount:</Typography>
                <Typography>
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: shipment.payment.currency
                  }).format(shipment.payment.amount)}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Items Table */}
        <Typography variant="h6" gutterBottom>Items</Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item Name</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Unit Price</TableCell>
                <TableCell align="right">Total Price</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {shipment.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell align="right">{item.quantity} {item.unit}</TableCell>
                  <TableCell align="right">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: shipment.payment.currency
                    }).format(item.unitPrice)}
                  </TableCell>
                  <TableCell align="right">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: shipment.payment.currency
                    }).format(item.totalPrice)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* QR Code Section for Outbound Shipments */}
        {isOutbound && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>QR Code</Typography>
            {shipment.blockchain.qrCode ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <img
                  src={shipment.blockchain.qrCode}
                  alt="Shipment QR Code"
                  style={{ width: 150, height: 150 }}
                />
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  onClick={() => onDownloadQrCode(shipment.id)}
                >
                  Download QR Code
                </Button>
              </Box>
            ) : (
              <Button
                variant="contained"
                startIcon={<QrCodeIcon />}
                onClick={() => onGenerateQrCode(shipment.id)}
              >
                Generate QR Code
              </Button>
            )}
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          {canConfirmReceipt && (
            <Tooltip title="Confirm receipt of this shipment">
              <Button
                variant="contained"
                color="success"
                onClick={() => onConfirmReceipt(shipment.id)}
              >
                Confirm Receipt
              </Button>
            </Tooltip>
          )}
          <Button
            variant="outlined"
            onClick={onClose}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}; 