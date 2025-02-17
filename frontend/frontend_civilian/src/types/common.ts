import { SelectProps as MuiSelectProps } from '@mui/material';
export interface DateRange {
  startDate: string;
  endDate: string;
}

export const createEmptyDateRange = (): DateRange => ({
  startDate: '',
  endDate: ''
});

export interface PaginationState {
  page: number;
  perPage: number;
  total: number;
}

export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterState {
  search?: string;
  status?: string[];
  category?: string[];
  dateRange?: DateRange;
  [key: string]: any;
}

export interface TableState {
  pagination: PaginationState;
  sort: SortState;
  filters: FilterState;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}

export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface AsyncState<T> {
  data: T | null;
  loading: LoadingState;
  error: string | null;
}

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  optional?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export interface SelectProps extends Omit<MuiSelectProps<any>, 'error'> {
  label?: string;
  error?: string;
  hint?: string;
  options?: SelectOption[];
  placeholder?: string;
}
