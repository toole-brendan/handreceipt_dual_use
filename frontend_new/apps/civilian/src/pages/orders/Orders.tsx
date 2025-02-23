import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

// Mock data
const mockOrders = [
  {
    id: 'ORD-001',
    customer: 'John Doe',
    date: '2024-02-22',
    total: 1299.99,
    status: 'Pending',
    items: 3,
  },
  {
    id: 'ORD-002',
    customer: 'Jane Smith',
    date: '2024-02-21',
    total: 799.50,
    status: 'Processing',
    items: 2,
  },
  {
    id: 'ORD-003',
    customer: 'Bob Johnson',
    date: '2024-02-20',
    total: 2499.99,
    status: 'Completed',
    items: 5,
  },
  {
    id: 'ORD-004',
    customer: 'Alice Brown',
    date: '2024-02-19',
    total: 149.99,
    status: 'Cancelled',
    items: 1,
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending':
      return 'warning';
    case 'Processing':
      return 'info';
    case 'Completed':
      return 'success';
    case 'Cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const Orders: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Orders
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="right">Items</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell align="right">
                  ${order.total.toFixed(2)}
                </TableCell>
                <TableCell align="right">{order.items}</TableCell>
                <TableCell>
                  <Chip
                    label={order.status}
                    color={getStatusColor(order.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="View Order">
                    <IconButton size="small">
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit Order">
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Orders; 