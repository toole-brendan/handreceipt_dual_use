import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Stack,
  Chip,
  IconButton,
  Link,
  Box,
} from '@mui/material';
import {
  LocalShipping as ShipIcon,
  Download as ReceiveIcon,
  Launch as LaunchIcon,
} from '@mui/icons-material';
import { Order } from '../types';

interface OrderDetailsModalProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  onShipOrder?: (orderId: string) => void;
  onReceiveOrder?: (orderId: string) => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  open,
  onClose,
  onShipOrder,
  onReceiveOrder,
}) => {
  if (!order) return null;

  const getStatusColor = (status: Order['status']): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status) {
      case 'placed':
        return 'info';
      case 'processing':
        return 'warning';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Order Details - {order.orderNumber}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {/* Order Information */}
          <Grid item xs={12}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  {order.type === 'purchase' ? 'Supplier' : 'Customer'}
                </Typography>
                <Typography variant="body1">
                  {order.supplierOrCustomer}
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Order Date
                  </Typography>
                  <Typography variant="body1">
                    {order.orderDate}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Delivery Date
                  </Typography>
                  <Typography variant="body1">
                    {order.deliveryDate}
                  </Typography>
                </Grid>
              </Grid>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={order.status}
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                  <Chip
                    label={order.paymentStatus}
                    color={order.paymentStatus === 'paid' ? 'success' : 'warning'}
                    size="small"
                  />
                  {order.blockchainStatus === 'confirmed' && (
                    <Chip
                      label="Blockchain Verified"
                      color="success"
                      variant="outlined"
                      size="small"
                    />
                  )}
                </Stack>
              </Box>
            </Stack>
          </Grid>

          {/* Order Items */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Order Items
            </Typography>
            <TableContainer component={Paper} variant="outlined">
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
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell align="right">
                        {item.quantity} {item.unit}
                      </TableCell>
                      <TableCell align="right">
                        ${item.unitPrice.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        ${item.totalPrice.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} align="right">
                      <Typography variant="subtitle1">Total</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle1">
                        ${order.totalAmount.toLocaleString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Blockchain Information */}
          {order.smartContract && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Blockchain Information
              </Typography>
              <Stack spacing={1}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Smart Contract Address
                  </Typography>
                  <Link
                    href={`https://etherscan.io/address/${order.smartContract.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                  >
                    {order.smartContract.address}
                    <LaunchIcon fontSize="small" />
                  </Link>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Transaction Hash
                  </Typography>
                  <Link
                    href={`https://etherscan.io/tx/${order.smartContract.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                  >
                    {order.smartContract.transactionHash}
                    <LaunchIcon fontSize="small" />
                  </Link>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Contract Status
                  </Typography>
                  <Chip
                    label={order.smartContract.status}
                    color={order.smartContract.status === 'active' ? 'success' : 'warning'}
                    size="small"
                  />
                </Box>
              </Stack>
            </Grid>
          )}

          {/* Actions */}
          <Grid item xs={12}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={onClose}>
                Close
              </Button>
              {order.type === 'sales' && order.status === 'processing' && onShipOrder && (
                <Button
                  variant="contained"
                  startIcon={<ShipIcon />}
                  onClick={() => onShipOrder(order.id)}
                >
                  Ship Order
                </Button>
              )}
              {order.type === 'purchase' && order.status === 'shipped' && onReceiveOrder && (
                <Button
                  variant="contained"
                  startIcon={<ReceiveIcon />}
                  onClick={() => onReceiveOrder(order.id)}
                >
                  Receive Order
                </Button>
              )}
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}; 