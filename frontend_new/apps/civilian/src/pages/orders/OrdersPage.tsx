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

// Enhanced mock data for orders
const mockOrders = [
  {
    id: "ORD001",
    product: "Ethiopian Yirgacheffe - Premium",
    status: 'processing' as OrderStatus,
    customer: "Coffee Bean Co.",
    amount: 5000,
    quantity: "500 kg",
    startDate: "2025-02-21",
    estimatedDelivery: "2025-02-25",
    smartContract: "0x1234...5678",
    blockchainStatus: "confirmed",
    paymentStatus: "escrow",
    milestones: [
      { type: 'order' as const, date: "2025-02-21T09:00:00", completed: true },
      { type: 'payment' as const, date: "2025-02-21T09:05:00", completed: true },
      { type: 'shipping' as const, date: "2025-02-23T14:30:00", completed: false },
      { type: 'delivery' as const, date: "2025-02-25T11:00:00", completed: false }
    ]
  },
  {
    id: "ORD002",
    product: "Colombian Supremo - Organic",
    status: 'shipped' as OrderStatus,
    customer: "Artisan Roasters Ltd",
    amount: 7500,
    quantity: "750 kg",
    startDate: "2025-02-20",
    estimatedDelivery: "2025-02-23",
    smartContract: "0x9876...4321",
    blockchainStatus: "confirmed",
    paymentStatus: "completed",
    milestones: [
      { type: 'order' as const, date: "2025-02-20T10:15:00", completed: true },
      { type: 'payment' as const, date: "2025-02-20T10:20:00", completed: true },
      { type: 'shipping' as const, date: "2025-02-21T16:45:00", completed: true },
      { type: 'delivery' as const, date: "2025-02-23T12:00:00", completed: false }
    ]
  }
];

// Enhanced mock stats
const mockStats = {
  totalOrders: 25,
  pendingOrders: 8,
  ordersInTransit: 5,
  completedOrders: 15,
  disputedOrders: 2,
  totalValue: 125000,
  activeContracts: 15,
};

const OrdersPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Top Stats Bar */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Total Orders</Typography>
              <Typography variant="h6">{mockStats.totalOrders}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Pending Orders</Typography>
              <Typography variant="h6">{mockStats.pendingOrders}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">In Transit</Typography>
              <Typography variant="h6">{mockStats.ordersInTransit}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Total Value (USDC)</Typography>
              <Typography variant="h6">${mockStats.totalValue.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Active Contracts</Typography>
              <Typography variant="h6">{mockStats.activeContracts}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Bar */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          size="small"
          placeholder="Search orders..."
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          color="primary"
        >
          New Order
        </Button>
        <IconButton>
          <Tooltip title="Import Orders">
            <ImportIcon />
          </Tooltip>
        </IconButton>
        <IconButton>
          <Tooltip title="Export Orders">
            <ExportIcon />
          </Tooltip>
        </IconButton>
        <IconButton>
          <Tooltip title="Scan QR Code">
            <QrCodeIcon />
          </Tooltip>
        </IconButton>
        <IconButton>
          <Tooltip title="Refresh">
            <RefreshIcon />
          </Tooltip>
        </IconButton>
      </Stack>

      {/* Tabs */}
      <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="All Orders" />
        <Tab label="Purchase Orders" />
        <Tab label="Sales Orders" />
        <Tab label="Returns" />
      </Tabs>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column - Orders List */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Orders</Typography>
              <Stack spacing={2}>
                {mockOrders.map((order) => (
                  <Box
                    key={order.id}
                    sx={{
                      p: 2,
                      bgcolor: selectedOrder === order.id ? 'action.selected' : 'background.default',
                      borderRadius: 1,
                      cursor: 'pointer',
                    }}
                    onClick={() => setSelectedOrder(order.id)}
                  >
                    <Typography variant="subtitle1">{order.product}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Order ID: {order.id}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <OrderStatusChip status={order.status} />
                      <CivilianChip
                        size="small"
                        label={order.blockchainStatus}
                        color={order.blockchainStatus === 'confirmed' ? 'success' : 'warning'}
                      />
                    </Stack>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      ${order.amount.toLocaleString()} USDC
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Center Column - Order Details */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Order Details</Typography>
              {selectedOrder ? (
                <Stack spacing={3}>
                  {/* Order Summary */}
                  <Box>
                    <Typography variant="subtitle1">Order Summary</Typography>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Customer</Typography>
                        <Typography variant="body1">
                          {mockOrders.find(o => o.id === selectedOrder)?.customer}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Smart Contract</Typography>
                        <Typography variant="body1">
                          {mockOrders.find(o => o.id === selectedOrder)?.smartContract}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Timeline */}
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>Order Timeline</Typography>
                    <OrderTimeline
                      orders={[mockOrders.find(o => o.id === selectedOrder)!]}
                    />
                  </Box>
                </Stack>
              ) : (
                <Typography color="text.secondary">Select an order to view details</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Actions & Analytics */}
        <Grid item xs={12} md={3}>
          <Stack spacing={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Quick Actions</Typography>
                <Stack spacing={2}>
                  <Button
                    variant="outlined"
                    fullWidth
                    disabled={!selectedOrder}
                  >
                    Release Payment
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    disabled={!selectedOrder}
                  >
                    Update Status
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    disabled={!selectedOrder}
                    color="error"
                  >
                    Report Issue
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Smart Contract Status</Typography>
                {selectedOrder ? (
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      Payment Status
                    </Typography>
                    <CivilianChip
                      label={mockOrders.find(o => o.id === selectedOrder)?.paymentStatus || 'unknown'}
                      color="info"
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Blockchain Status
                    </Typography>
                    <CivilianChip
                      label={mockOrders.find(o => o.id === selectedOrder)?.blockchainStatus || 'unknown'}
                      color="success"
                    />
                  </Stack>
                ) : (
                  <Typography color="text.secondary">Select an order to view status</Typography>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrdersPage;
