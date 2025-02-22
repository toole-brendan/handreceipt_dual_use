import { Theme } from '@mui/material/styles';

export interface DashboardStyles {
  dashboardContainer: React.CSSProperties;
  companyInfo: React.CSSProperties;
  metricCard: React.CSSProperties;
  categoryChart: React.CSSProperties;
  criticalItems: React.CSSProperties;
  notifications: React.CSSProperties;
  recentActivity: React.CSSProperties;
  personnelOverview: React.CSSProperties;
}

export interface MetricsStats {
  total: number;
  serviceableItems: number;
  maintenanceNeeded: number;
  pendingTransfers: number;
  overdueItems: number;
}

export interface KeyMetricsCardsProps {
  stats: MetricsStats;
  styles: DashboardStyles;
}

export interface CategoryData {
  name: string;
  value: number;
  count: number;
}

export interface CriticalItem {
  name: string;
  issue: string;
  status: 'critical' | 'warning';
}

export interface InventoryStats {
  categories: CategoryData[];
  criticalItems: CriticalItem[];
}

export interface UnitInventoryOverviewProps {
  stats: InventoryStats;
  styles: DashboardStyles;
  chartColors: {
    weapons: string;
    vehicles: string;
    communications: string;
    other: string;
  };
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user: {
    name: string;
    rank: string;
  };
  status: 'COMPLETED' | 'PENDING' | 'IN PROGRESS' | 'REJECTED';
}

export interface RecentActivityFeedProps {
  activities: Activity[];
  styles: DashboardStyles;
}

export interface Notification {
  id: string;
  type: 'high' | 'medium' | 'low';
  message: string;
  timestamp: string;
}

export interface NotificationsPanelProps {
  notifications: Notification[];
  styles: DashboardStyles;
}

export interface TransferItem {
  id: string;
  itemName: string;
  from: string;
  to: string;
}

export interface MaintenanceItem {
  id: string;
  itemName: string;
  type: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ActionableStats {
  pendingTransfers: {
    count: number;
    items: TransferItem[];
  };
  maintenanceRequests: {
    count: number;
    items: MaintenanceItem[];
  };
}

export interface ActionableTasksProps {
  stats: ActionableStats;
  styles: DashboardStyles;
}

export interface PersonnelStats {
  total: number;
  available: number;
  deployed: number;
  onLeave: number;
}

export interface PersonnelOverviewProps {
  stats: PersonnelStats;
  styles: DashboardStyles;
} 