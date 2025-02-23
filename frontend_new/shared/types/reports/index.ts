/**
 * Types for report table configuration and data
 */

export interface ReportColumn {
  /** Unique identifier for the column */
  id: string;
  
  /** Display label for the column */
  label: string;
  
  /** Optional function to format cell values */
  format?: (value: any) => string;
  
  /** Whether the column can be sorted */
  sortable?: boolean;
  
  /** Minimum width of the column */
  minWidth?: number;
  
  /** Whether to right-align the content */
  numeric?: boolean;
  
  /** Whether the column can be filtered */
  filterable?: boolean;
}

export interface ReportTableProps {
  /** Title of the report */
  title: string;
  
  /** Optional subtitle */
  subtitle?: string;
  
  /** Column definitions */
  columns: ReportColumn[];
  
  /** Row data */
  data: Record<string, any>[];
  
  /** Whether to show export options */
  showExport?: boolean;
  
  /** Whether to show filtering options */
  showFilter?: boolean;
  
  /** Whether to show pagination */
  showPagination?: boolean;
}

export interface ReportDateRange {
  startDate: string;
  endDate: string;
}

export interface ReportSummaryStats {
  totalSales: number;
  totalShipments: number;
  totalPayments: number;
  totalBlockchainTransactions: number;
}

export interface SalesData {
  date: string;
  revenue: number;
  quantity: number;
}

export interface TopSellingProduct {
  id: string;
  name: string;
  revenue: number;
  quantity: number;
}

export interface InventoryDistribution {
  name: string;
  quantity: number;
}

export interface LowStockItem {
  id: string;
  name: string;
  currentStock: number;
  minThreshold: number;
}

export interface ShipmentRoute {
  id: string;
  origin: string;
  destination: string;
  distance: number;
  time: number;
}

export interface RecentShipment {
  id: string;
  productName: string;
  quantity: number;
  origin: string;
  destination: string;
  status: string;
  date: string;
}

export interface PaymentStatus {
  status: string;
  count: number;
  amount: number;
}

export interface OverduePayment {
  id: string;
  customerName: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
}

export interface BlockchainTransaction {
  id: string;
  type: string;
  status: string;
  timestamp: string;
  hash: string;
}

export interface TransactionVolume {
  date: string;
  count: number;
}

export type TimeGranularity = 'daily' | 'weekly' | 'monthly';
export type ValueMetric = 'revenue' | 'quantity';
export type DistributionType = 'category' | 'location';
export type ShipmentType = 'inbound' | 'outbound';
export type PaymentType = 'incoming' | 'outgoing';

export interface ReportFilters {
  dateRange: ReportDateRange;
  timeGranularity: TimeGranularity;
  valueMetric: ValueMetric;
  distributionType: DistributionType;
  shipmentType: ShipmentType;
  paymentType: PaymentType;
}
