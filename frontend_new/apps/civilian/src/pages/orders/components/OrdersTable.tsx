import React from 'react';
import {
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
  Tooltip,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  LocalShipping as ShipIcon,
  Download as ReceiveIcon,
} from '@mui/icons-material';
import { Order, OrderType } from '../types';

interface OrdersTableProps {
  orders: Order[];
  type: OrderType;
  onViewDetails: (orderId: string) => void;
  onShipOrder?: (orderId: string) => void;
  onReceiveOrder?: (orderId: string) => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  type,
  onViewDetails,
  onShipOrder,
  onReceiveOrder,
}) => {
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

  const filteredOrders = orders.filter(order => order.type === type);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Order Number</TableCell>
            <TableCell>{type === 'purchase' ? 'Supplier' : 'Customer'}</TableCell>
            <TableCell>Order Date</TableCell>
            <TableCell>Delivery Date</TableCell>
            <TableCell align="right">Total Amount</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center">
                No {type} orders found. Use the button below to create one.
              </TableCell>
            </TableRow>
          ) : (
            filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {order.orderNumber}
                    {order.blockchainStatus === 'confirmed' && (
                      <Chip
                        label="Blockchain Verified"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                  </Stack>
                </TableCell>
                <TableCell>{order.supplierOrCustomer}</TableCell>
                <TableCell>{order.orderDate}</TableCell>
                <TableCell>{order.deliveryDate}</TableCell>
                <TableCell align="right">
                  ${order.totalAmount.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Chip
                    label={order.status}
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => onViewDetails(order.id)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    {type === 'sales' && order.status === 'processing' && onShipOrder && (
                      <Tooltip title="Ship Order">
                        <IconButton
                          size="small"
                          onClick={() => onShipOrder(order.id)}
                        >
                          <ShipIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {type === 'purchase' && order.status === 'shipped' && onReceiveOrder && (
                      <Tooltip title="Receive Order">
                        <IconButton
                          size="small"
                          onClick={() => onReceiveOrder(order.id)}
                        >
                          <ReceiveIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}; 