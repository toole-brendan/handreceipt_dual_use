import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FileUpload as ImportIcon,
  FileDownload as ExportIcon,
  QrCode as QrCodeIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { OrderTimeline } from '../../components/dashboard';
import { OrderStatusChip, OrderStatus } from '../../components/common/OrderStatusChip';
import { CivilianChip } from '../../components/common/CivilianChip';
import { BasePropertyStatus } from '@shared/types/property/base';
import { OrderSummary } from './components/OrderSummary';
import { OrderFilters } from './components/OrderFilters';
import { OrdersTable } from './components/OrdersTable';
import { OrderDetailsModal } from './components/OrderDetailsModal';
import { mockOrders, mockOrderSummary } from './mockData';
import { Order, OrderFilters as OrderFiltersType } from './types';

export const OrdersPage: React.FC = () => {
  // State
  const [filters, setFilters] = useState<OrderFiltersType>({
    type: 'sales',
    status: 'all',
    dateRange: {
      start: '',
      end: '',
    },
    searchQuery: '',
  });

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Handlers
  const handleFiltersChange = (newFilters: OrderFiltersType) => {
    setFilters(newFilters);
  };

  const handleViewDetails = (orderId: string) => {
    const order = mockOrders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setIsDetailsModalOpen(true);
    }
  };

  const handleShipOrder = (orderId: string) => {
    // TODO: Implement ship order functionality
    console.log('Ship order:', orderId);
  };

  const handleReceiveOrder = (orderId: string) => {
    // TODO: Implement receive order functionality
    console.log('Receive order:', orderId);
  };

  const handleCreateOrder = () => {
    // TODO: Implement create order functionality
    console.log('Create new order');
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h4">Orders</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateOrder}
          >
            Create New {filters.type === 'purchase' ? 'Purchase' : 'Sales'} Order
          </Button>
        </Box>
        <Typography color="text.secondary">
          Manage your purchase and sales orders here.
        </Typography>
      </Box>

      {/* Summary */}
      <OrderSummary summary={mockOrderSummary} />

      {/* Filters */}
      <OrderFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {/* Orders Table */}
      <OrdersTable
        orders={mockOrders}
        type={filters.type}
        onViewDetails={handleViewDetails}
        onShipOrder={handleShipOrder}
        onReceiveOrder={handleReceiveOrder}
      />

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        open={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onShipOrder={handleShipOrder}
        onReceiveOrder={handleReceiveOrder}
      />
    </Box>
  );
};

export default OrdersPage;
