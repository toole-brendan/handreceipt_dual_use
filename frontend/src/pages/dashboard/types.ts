// frontend/src/pages/dashboard/types.ts

export interface DashboardProps {
  timeRange?: string;
  filter?: string;
}

export interface AnalyticsData {
  date: string;
  assetUtilization: number;
  maintenanceEfficiency: number;
  transferCompletion: number;
}

export interface ChartData {
  timestamp: string;
  value: number;
}

export interface DashboardMetrics {
  assetCount: number;
  activeUsers: number;
  transactions: number;
  efficiency: number;
}

export interface DashboardFilters {
  timeRange: '24h' | '7d' | '30d' | '90d';
  category?: string;
  status?: string;
}

export interface SquadEquipmentStatus {
  type: string;
  assigned: number;
  serviceable: number;
  unserviceable: number;
  maintenance: MaintenanceItem[];
}

export interface MaintenanceItem {
  id: string;
  equipment: string;
  issue: string;
  priority: 'immediate' | 'routine';
  deadline: string;
}

export interface TeamEquipmentAlert {
  id: string;
  equipmentType: string;
  issue: string;
  soldier: string;
  timestamp: string;
  status: 'pending' | 'in-progress';
}

export interface PersonalEquipmentItem {
  id: string;
  type: string;
  serialNumber: string;
  status: 'serviceable' | 'unserviceable' | 'maintenance-required';
  lastMaintenance: string;
  nextMaintenance: string;
  issues?: string[];
}

export interface ScheduledEvent {
  id: string;
  type: 'inventory' | 'inspection' | 'maintenance';
  date: string;
  description: string;
  location: string;
  status: 'upcoming' | 'overdue';
}

export interface MaintenanceTask {
  id: string;
  equipment: string;
  task: string;
  deadline: string;
  priority: 'routine' | 'urgent';
  completed: boolean;
} 