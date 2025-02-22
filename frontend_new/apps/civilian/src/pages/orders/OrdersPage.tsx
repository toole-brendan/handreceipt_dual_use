import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { OrderTimeline } from '../../components/dashboard';
import { CivilianStatusChip } from '../../components/common/CivilianStatusChip';

// Mock data for orders
const mockOrders = [
  {
    id: "ORD001",
    product: "Ethiopian Yirgacheffe - Premium",
    status: 'processing' as const,
    customer: "Coffee Bean Co.",
    amount: 5000,
    quantity: "500 kg",
    startDate: "2025-02-21",
    estimatedDelivery: "2025-02-25",
    smartContract: "0x1234...5678",
    milestones: [
      {
        type: 'order' as const,
        date: "2025-02-21T09:00:00",
        completed: true
      },
      {
        type: 'payment' as const,
        date: "2025-02-21T09:05:00",
        completed: true
      },
      {
        type: 'shipping' as const,
        date: "2025-02-23T14:30:00",
        completed: false
      },
      {
        type: 'delivery' as const,
        date: "2025-02-25T11:00:00",
        completed: false
      }
    ]
  },
  {
    id: "ORD002",
    product: "Colombian Supremo - Organic",
    status: 'shipped' as const,
    customer: "Artisan Roasters Ltd",
    amount: 7500,
    quantity: "750 kg",
    startDate: "2025-02-20",
    estimatedDelivery: "2025-02-23",
    smartContract: "0x9876...4321",
    milestones: [
      {
        type: 'order' as const,
        date: "2025-02-20T10:15:00",
        completed: true
      },
      {
        type: 'payment' as const,
        date: "2025-02-20T10:20:00",
        completed: true
      },
      {
        type: 'shipping' as const,
        date: "2025-02-21T16:45:00",
        completed: true
      },
      {
        type: 'delivery' as const,
        date: "2025-02-23T12:00:00",
        completed: false
      }
    ]
  }
];

// Mock data for stats
const mockStats = {
  totalOrders: 25,
  pendingOrders: 8,
  completedOrders: 15,
  disputedOrders: 2,
  totalValue: 125000, // in USDC
};

const OrdersPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading orders...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Coffee Bean Orders
      </Typography>

      {/* Stats Bar */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">Total Orders</Typography>
            <Typography variant="h6">{mockStats.totalOrders}</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">Pending</Typography>
            <Typography variant="h6">{mockStats.pendingOrders}</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">Completed</Typography>
            <Typography variant="h6">{mockStats.completedOrders}</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">Disputed</Typography>
            <Typography variant="h6">{mockStats.disputedOrders}</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">Total Value (USDC)</Typography>
            <Typography variant="h6">${mockStats.totalValue.toLocaleString()}</Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column - Orders List */}
        <Grid item xs={12} md={4}>
          <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>Recent Orders</Typography>
            {mockOrders.map((order) => (
              <Box key={order.id} sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="subtitle1">{order.product}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Order ID: {order.id}
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">
                    ${order.amount.toLocaleString()} USDC
                  </Typography>
                  <CivilianStatusChip status={order.status} />
                </Box>
              </Box>
            ))}
          </Box>
        </Grid>

        {/* Center Column - Order Details */}
        <Grid item xs={12} md={8}>
          <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>Order Timeline</Typography>
            <OrderTimeline orders={mockOrders} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrdersPage;
