/**
 * Common types shared between civilian and defense apps
 */

// Re-export API types
export * from './api';

/**
 * Date range interface
 */
export interface DateRange {
  /** Start date */
  start: string;
  /** End date */
  end: string;
}

/**
 * Pagination state interface
 */
export interface PaginationState {
  /** Current page number */
  page: number;
  /** Items per page */
  perPage: number;
  /** Total number of items */
  total: number;
}

/**
 * Sort state interface
 */
export interface SortState {
  /** Field to sort by */
  field: string;
  /** Sort direction */
  direction: 'asc' | 'desc';
}

/**
 * Filter state interface
 */
export interface FilterState {
  /** Search query */
  search?: string;
  /** Filter values by field */
  filters: Record<string, any>;
}

/**
 * Table state interface
 */
export interface TableState {
  /** Pagination state */
  pagination: PaginationState;
  /** Sort state */
  sort: SortState;
  /** Filter state */
  filter: FilterState;
}

/**
 * Select option interface
 */
export interface SelectOption {
  /** Option value */
  value: string | number;
  /** Option label */
  label: string;
  /** Option group */
  group?: string;
  /** Whether option is disabled */
  disabled?: boolean;
}

/**
 * Loading state type
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Async state interface
 */
export interface AsyncState<T = any, E = Error> {
  /** Data */
  data: T | null;
  /** Loading state */
  loading: boolean;
  /** Error */
  error: E | null;
}
