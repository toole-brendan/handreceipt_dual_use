export type MaintenanceStatus = 
  | 'pending_approval'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export type MaintenancePriority = 
  | 'routine'
  | 'urgent'
  | 'emergency';

export type MaintenanceCategory = 
  | 'preventive'
  | 'corrective'
  | 'condition_based'
  | 'predictive';

export interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  category: MaintenanceCategory;
  equipment: {
    id: string;
    name: string;
    serialNumber: string;
    model: string;
    nsn: string; // National Stock Number
  };
  requestedBy: {
    id: string;
    name: string;
    rank: string;
    unit: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    rank: string;
    unit: string;
  };
  dates: {
    requested: string;
    scheduled?: string;
    started?: string;
    completed?: string;
  };
  estimatedDuration: string;
  actualDuration?: string;
  parts?: Array<{
    id: string;
    name: string;
    nsn: string;
    quantity: number;
    status: 'available' | 'on_order' | 'backordered';
  }>;
  blockchainRecords: Array<{
    transactionId: string;
    timestamp: string;
    action: string;
    performedBy: {
      id: string;
      name: string;
      rank: string;
    };
  }>;
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
  }>;
  notes?: string[];
}

export interface MaintenanceMetrics {
  totalScheduled: MetricItem;
  inProgress: MetricItem;
  completedThisMonth: MetricItem;
  overdueTasks: MetricItem;
  avgCompletionTime: MetricItem;
}

export interface MetricItem {
  value: string;
  change: MetricChange;
}

export interface MetricChange {
  value: string;
  timeframe: string;
  isPositive: boolean;
}

export interface FiltersState {
  status?: MaintenanceStatus[];
  priority?: MaintenancePriority[];
  category?: MaintenanceCategory[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  equipment?: string[];
  requestedBy?: string[];
  assignedTo?: string[];
  searchTerm?: string;
}

export interface ChartData {
  label: string;
  value: number;
  color: string;
}

export interface DA2404FormData {
  organizationName: string;
  nomenclature: string;
  registrationNumber: string;
  miles: number;
  hours: number;
  date: string;
  inspectedBy: {
    name: string;
    rank: string;
    signature?: string;
  };
  approvedBy: {
    name: string;
    rank: string;
    signature?: string;
  };
  deficiencies: Array<{
    item: string;
    deficiency: string;
    correctedBy?: string;
    supervisorInitials?: string;
  }>;
  shortcomings: Array<{
    item: string;
    shortcoming: string;
    correctedBy?: string;
    supervisorInitials?: string;
  }>;
} 