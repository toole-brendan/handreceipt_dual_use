import type { DashboardData } from './types';

// Helper function to generate dates for the last 7 days
const getLast7Days = () => {
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

// Generate delivery trend data
const generateDeliveryTrendData = () => {
  return getLast7Days().map(date => ({
    date,
    onTime: Math.floor(Math.random() * 50) + 50, // 50-100 deliveries
    delayed: Math.floor(Math.random() * 20) + 5,  // 5-25 deliveries
  }));
};

export const mockDashboardData: DashboardData = {
  metrics: {
    activeShipments: {
      id: 'active-shipments',
      title: 'Active Shipments',
      value: 147,
      trend: {
        value: 12.5,
        isUpward: true,
        label: '12.5% increase from last month'
      }
    },
    totalProducts: {
      id: 'total-products',
      title: 'Total Products',
      value: '2,584',
      trend: {
        value: 3.2,
        isUpward: true,
        label: '3.2% increase from last month'
      }
    },
    inventoryValue: {
      id: 'inventory-value',
      title: 'Inventory Value',
      value: '$1.2M',
      trend: {
        value: 8.4,
        isUpward: true,
        label: '8.4% increase from last month'
      }
    },
    onTimeDelivery: {
      id: 'on-time-delivery',
      title: 'On-Time Delivery',
      value: '94.8%',
      trend: {
        value: 2.1,
        isUpward: false,
        label: '2.1% decrease from last month'
      }
    }
  },
  inventoryLevels: [
    {
      category: 'Electronics',
      inStock: 450,
      lowStock: 120,
      outOfStock: 30
    },
    {
      category: 'Apparel',
      inStock: 680,
      lowStock: 90,
      outOfStock: 15
    },
    {
      category: 'Home Goods',
      inStock: 320,
      lowStock: 75,
      outOfStock: 25
    },
    {
      category: 'Automotive',
      inStock: 240,
      lowStock: 60,
      outOfStock: 10
    }
  ],
  shipmentStatuses: [
    {
      status: 'In Transit',
      count: 87
    },
    {
      status: 'Pending',
      count: 35
    },
    {
      status: 'Delivered',
      count: 142
    },
    {
      status: 'Delayed',
      count: 25
    }
  ],
  recentActivities: [
    {
      id: '1',
      type: 'shipment',
      title: 'New Shipment Created',
      description: 'Shipment #12345 has been created and is ready for pickup',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
      status: 'success'
    },
    {
      id: '2',
      type: 'alert',
      title: 'Temperature Alert',
      description: 'Temperature exceeded threshold for Shipment #12340',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
      status: 'error'
    },
    {
      id: '3',
      type: 'product',
      title: 'Low Stock Alert',
      description: 'Product SKU-789 is running low on stock',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      status: 'warning'
    },
    {
      id: '4',
      type: 'location',
      title: 'New Location Added',
      description: 'Warehouse #5 has been added to the system',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
      status: 'success'
    },
    {
      id: '5',
      type: 'security',
      title: 'Security Check Completed',
      description: 'Monthly security audit completed successfully',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
      status: 'success'
    }
  ],
  deliveryTrend: generateDeliveryTrendData(),
  
  alerts: [
    {
      id: '1',
      type: 'error',
      title: 'Temperature Excursion',
      message: 'Temperature exceeded threshold for cold chain shipment #12340',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      read: false
    },
    {
      id: '2',
      type: 'warning',
      title: 'Low Stock Alert',
      message: 'Multiple products are running low on stock',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      read: false
    },
    {
      id: '3',
      type: 'info',
      title: 'System Maintenance',
      message: 'Scheduled maintenance in 2 hours',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      read: true
    }
  ]
};
