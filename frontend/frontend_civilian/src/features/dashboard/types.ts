export interface DashboardMetric {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isUpward: boolean;
    label: string;
  };
}

export interface DashboardActivity {
  id: string;
  type: 'product' | 'shipment' | 'location' | 'alert' | 'security';
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'warning' | 'error';
}

export interface DashboardAlert {
  id: string;
  type: 'error' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read?: boolean;
  onDismiss?: () => void;
}

export interface InventoryLevel {
  category: string;
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

export interface ShipmentStatus {
  status: string;
  count: number;
}

export interface DeliveryTrendData {
  date: string;
  onTime: number;
  delayed: number;
}

export interface DashboardData {
  deliveryTrend: DeliveryTrendData[];
  metrics: {
    activeShipments: DashboardMetric;
    totalProducts: DashboardMetric;
    inventoryValue: DashboardMetric;
    onTimeDelivery: DashboardMetric;
  };
  inventoryLevels: InventoryLevel[];
  shipmentStatuses: ShipmentStatus[];
  recentActivities: DashboardActivity[];
  alerts: DashboardAlert[];
}
