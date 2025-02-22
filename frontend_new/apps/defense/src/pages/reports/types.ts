export type ReportType = 'inventory' | 'transfers' | 'maintenance' | 'custom';

export interface MetricChange {
  value: string;
  timeframe: string;
  isPositive: boolean;
}

export interface Metric {
  value: string;
  change: MetricChange;
}

export interface InventoryMetrics {
  totalItems: Metric;
  itemsInGoodCondition: Metric;
  itemsNeedingMaintenance: Metric;
  criticalItems: Metric;
}

export interface TransferMetrics {
  totalTransfers: Metric;
  pendingApprovals: Metric;
  awaitingConfirmations: Metric;
  completedTransfers: Metric;
}

export interface MaintenanceMetrics {
  scheduledTasks: Metric;
  inProgressTasks: Metric;
  completedTasks: Metric;
  overdueTasks: Metric;
}

export interface ReportMetrics {
  inventory: InventoryMetrics;
  transfers: TransferMetrics;
  maintenance: MaintenanceMetrics;
}

export interface BlockchainRecord {
  transactionId: string;
  timestamp: string;
  action: string;
  personnel: {
    name: string;
    rank: string;
    unit: string;
  };
  details: Record<string, unknown>;
}

export interface ReportData {
  id: string;
  type: ReportType;
  title: string;
  description?: string;
  createdAt: string;
  createdBy: {
    name: string;
    rank: string;
    unit: string;
  };
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  blockchainRecords: BlockchainRecord[];
  data: Record<string, unknown>;
}

export interface ReportFilter {
  dateRange?: {
    start: string;
    end: string;
  };
  status?: string[];
  unit?: string[];
  personnel?: string[];
  equipment?: string[];
  customFields?: Record<string, unknown>;
}

export interface CustomReportConfig {
  title: string;
  description?: string;
  filters: ReportFilter;
  metrics: string[];
  visualizations: {
    type: 'bar' | 'line' | 'pie' | 'table';
    config: Record<string, unknown>;
  }[];
} 