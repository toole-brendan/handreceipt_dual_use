import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import {
  CivilianDashboardStatsBar,
  DonutChart,
  OrderTimeline,
  QuickActionsCard,
  SmartContractAlertsCard,
  SupplyChainMapCard,
  DashboardSkeleton,
  DashboardErrorBoundary
} from '../../components/dashboard';

// Mock data for stats bar
const mockDashboardData = {
  inventory: {
    totalItems: 150,
    lowStockItems: 25,
  },
  finance: {
    usdcBalance: 12500,
  },
  shipping: {
    recentShipments: 12,
  },
};

// Mock data for inventory breakdown
const inventoryBreakdownData = [
  { name: 'Green Coffee', value: 80, color: '#0088FE' },
  { name: 'Roasted Coffee', value: 50, color: '#00C49F' },
  { name: 'Processed Beans', value: 20, color: '#FFBB28' },
  { name: 'Defective Beans', value: 10, color: '#FF8042' },
];

// Mock data for smart contract alerts
const mockContractAlerts = [
  {
    id: 'contract-1',
    type: 'payment_release' as const,
    title: 'Payment Release: Ethiopian Yirgacheffe Order',
    description: 'Smart contract ready to release 70% payment upon delivery confirmation',
    progress: 70,
    urgency: 'medium' as const,
    dueDate: '2025-02-22'
  },
  {
    id: 'contract-2',
    type: 'pending_approval' as const,
    title: 'Contract Approval Required',
    description: 'New smart contract for Colombian Supremo bulk order requires approval',
    urgency: 'high' as const,
    dueDate: '2025-02-21'
  },
  {
    id: 'contract-3',
    type: 'expiring' as const,
    title: 'Contract Expiring Soon',
    description: 'Standing order contract for Brazilian Santos expires in 3 days',
    urgency: 'low' as const,
    dueDate: '2025-02-24'
  }
];

// Mock data for order timeline
const mockOrders: Array<{
  id: string;
  product: string;
  status: 'processing' | 'shipped' | 'delivered' | 'completed';
  startDate: string;
  estimatedDelivery: string;
  milestones: Array<{
    type: 'order' | 'shipping' | 'delivery' | 'payment';
    date: string;
    completed: boolean;
  }>;
}> = [
  {
    id: "ORD001",
    product: "Ethiopian Yirgacheffe",
    status: 'completed' as const,
    startDate: "2025-02-20",
    estimatedDelivery: "2025-02-22",
    milestones: [
      {
        type: 'order' as const,
        date: "2025-02-20T09:00:00",
        completed: true
      },
      {
        type: 'payment' as const,
        date: "2025-02-20T09:05:00",
        completed: true
      },
      {
        type: 'shipping' as const,
        date: "2025-02-21T14:30:00",
        completed: true
      },
      {
        type: 'delivery' as const,
        date: "2025-02-22T11:00:00",
        completed: true
      }
    ]
  },
  {
    id: "ORD002",
    product: "Colombian Supremo",
    status: 'shipped' as const,
    startDate: "2025-02-21",
    estimatedDelivery: "2025-02-23",
    milestones: [
      {
        type: 'order' as const,
        date: "2025-02-21T10:15:00",
        completed: true
      },
      {
        type: 'payment' as const,
        date: "2025-02-21T10:20:00",
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

const DashboardPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const dashboardContent = isLoading ? (
    <DashboardSkeleton />
  ) : (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Coffee Bean Inventory Dashboard
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <CivilianDashboardStatsBar
          inventory={mockDashboardData.inventory}
          finance={mockDashboardData.finance}
          shipping={mockDashboardData.shipping}
        />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Inventory Health Card
              </Typography>
              <DonutChart data={inventoryBreakdownData} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <OrderTimeline orders={mockOrders} />
        </Grid>
        <Grid item xs={12} md={6}>
          <QuickActionsCard />
        </Grid>
        <Grid item xs={12} md={6}>
          <SmartContractAlertsCard alerts={mockContractAlerts} />
        </Grid>
        <Grid item xs={12}>
          <SupplyChainMapCard />
        </Grid>
      </Grid>

      <Typography variant="body1" sx={{ mb: 4 }}>
        Welcome to your HandReceipt Coffee Bean Inventory Management System. Monitor your inventory levels,
        track shipments, and manage USDC transactions all in one place.
      </Typography>
      
      {/* Additional dashboard components will be added here */}
    </Box>
  );

  return (
    <DashboardErrorBoundary>
      {dashboardContent}
    </DashboardErrorBoundary>
  );
};

export default DashboardPage;
