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
