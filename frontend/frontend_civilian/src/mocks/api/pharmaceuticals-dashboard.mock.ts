import { PharmaceuticalProduct } from './pharmaceuticals-products.mock';
import { PharmaceuticalLocation } from './pharmaceuticals-locations.mock';
import { PharmaceuticalShipment } from './pharmaceuticals-shipments.mock';
import { PharmaceuticalTransaction } from './pharmaceuticals-transactions.mock';

export interface DashboardMetric {
  id: string;
  label: string;
  value: number;
  unit?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
    label: string;
  };
  status?: 'success' | 'warning' | 'error';
}

export interface DashboardAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  locationId?: string;
  productId?: string;
  batchNumber?: string;
  status: 'New' | 'Acknowledged' | 'Resolved';
}

export interface DashboardActivity {
  id: string;
  type: 'product' | 'shipment' | 'location' | 'alert' | 'security';
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'warning' | 'error';
  metadata?: Record<string, any>;
}

export interface DashboardData {
  metrics: {
    activeShipments: DashboardMetric;
    totalProducts: DashboardMetric;
    inventoryValue: DashboardMetric;
    qualityCompliance: DashboardMetric;
    temperatureExcursions: DashboardMetric;
    batchesInProduction: DashboardMetric;
  };
  inventoryLevels: {
    category: string;
    inStock: number;
    lowStock: number;
    outOfStock: number;
  }[];
  shipmentStatuses: {
    status: string;
    count: number;
  }[];
  recentActivities: DashboardActivity[];
  alerts: DashboardAlert[];
}

export const mockDashboardData: DashboardData = {
  metrics: {
    activeShipments: {
      id: 'active-shipments',
      label: 'Active Shipments',
      value: 12,
      trend: {
        value: 20,
        direction: 'up',
        label: 'vs. last week'
      },
      status: 'success'
    },
    totalProducts: {
      id: 'total-products',
      label: 'Total Products',
      value: 156,
      unit: 'SKUs',
      trend: {
        value: 5,
        direction: 'up',
        label: 'new this month'
      }
    },
    inventoryValue: {
      id: 'inventory-value',
      label: 'Inventory Value',
      value: 2500000,
      unit: 'USD',
      trend: {
        value: 12,
        direction: 'up',
        label: 'vs. last month'
      },
      status: 'success'
    },
    qualityCompliance: {
      id: 'quality-compliance',
      label: 'Quality Compliance',
      value: 98.5,
      unit: '%',
      trend: {
        value: 0.5,
        direction: 'down',
        label: 'vs. target'
      },
      status: 'warning'
    },
    temperatureExcursions: {
      id: 'temperature-excursions',
      label: 'Temperature Excursions',
      value: 3,
      trend: {
        value: 2,
        direction: 'up',
        label: 'vs. last week'
      },
      status: 'error'
    },
    batchesInProduction: {
      id: 'batches-in-production',
      label: 'Batches in Production',
      value: 8,
      trend: {
        value: 1,
        direction: 'down',
        label: 'vs. last week'
      }
    }
  },
  inventoryLevels: [
    {
      category: 'Active Ingredients',
      inStock: 45,
      lowStock: 12,
      outOfStock: 3
    },
    {
      category: 'Excipients',
      inStock: 68,
      lowStock: 8,
      outOfStock: 1
    },
    {
      category: 'Finished Drugs',
      inStock: 92,
      lowStock: 15,
      outOfStock: 5
    },
    {
      category: 'Packaging Materials',
      inStock: 156,
      lowStock: 23,
      outOfStock: 2
    }
  ],
  shipmentStatuses: [
    { status: 'In Transit', count: 8 },
    { status: 'Preparing', count: 4 },
    { status: 'Delivered', count: 15 },
    { status: 'Delayed', count: 2 }
  ],
  recentActivities: [
    {
      id: 'ACT001',
      type: 'shipment',
      title: 'New Shipment Created',
      description: 'Shipment SHIP-2024-002 created for PainAway Tablets',
      timestamp: '2024-02-14T11:30:00Z',
      status: 'success',
      metadata: {
        shipmentId: 'SHP002',
        productId: 'FD001'
      }
    },
    {
      id: 'ACT002',
      type: 'alert',
      title: 'Temperature Warning',
      description: 'Temperature approaching upper limit in shipment SHIP-2024-002',
      timestamp: '2024-02-14T09:00:00Z',
      status: 'warning',
      metadata: {
        shipmentId: 'SHP002',
        temperature: 23.1
      }
    },
    {
      id: 'ACT003',
      type: 'product',
      title: 'Quality Control Failed',
      description: 'Batch IBU-2024-001 failed quality control test',
      timestamp: '2024-02-13T14:00:00Z',
      status: 'error',
      metadata: {
        productId: 'API002',
        batchNumber: 'IBU-2024-001'
      }
    }
  ],
  alerts: [
    {
      id: 'ALT001',
      type: 'warning',
      title: 'Temperature Excursion',
      message: 'Temperature approaching upper limit (23.1°C) in shipment SHIP-2024-002',
      timestamp: '2024-02-14T09:00:00Z',
      locationId: 'DC001',
      productId: 'FD001',
      status: 'New'
    },
    {
      id: 'ALT002',
      type: 'critical',
      title: 'Failed Quality Control',
      message: 'Batch IBU-2024-001 failed quality control test. Purity below specification.',
      timestamp: '2024-02-13T14:00:00Z',
      locationId: 'QC001',
      productId: 'API002',
      batchNumber: 'IBU-2024-001',
      status: 'Acknowledged'
    },
    {
      id: 'ALT003',
      type: 'info',
      title: 'Low Stock Alert',
      message: 'Packaging materials (PKG001) quantity below reorder point',
      timestamp: '2024-02-12T10:15:00Z',
      locationId: 'WH002',
      productId: 'PKG001',
      status: 'New'
    }
  ]
};

export const getDashboardMetrics = (): DashboardData['metrics'] => {
  return mockDashboardData.metrics;
};

export const getDashboardInventoryLevels = (): DashboardData['inventoryLevels'] => {
  return mockDashboardData.inventoryLevels;
};

export const getDashboardShipmentStatuses = (): DashboardData['shipmentStatuses'] => {
  return mockDashboardData.shipmentStatuses;
};

export const getDashboardRecentActivities = (limit?: number): DashboardActivity[] => {
  const activities = mockDashboardData.recentActivities;
  return limit ? activities.slice(0, limit) : activities;
};

export const getDashboardAlerts = (status?: DashboardAlert['status']): DashboardAlert[] => {
  const alerts = mockDashboardData.alerts;
  return status ? alerts.filter(alert => alert.status === status) : alerts;
};

export const getMetricTrends = (metricId: string, days: number = 7): { date: string; value: number }[] => {
  // Mock function to generate trend data for a specific metric
  const today = new Date();
  const trend: { date: string; value: number }[] = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    trend.push({
      date: date.toISOString().split('T')[0],
      value: Math.random() * 100 // Replace with more realistic trend data generation
    });
  }
  
  return trend;
};
