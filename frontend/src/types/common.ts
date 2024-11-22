/* frontend/src/types/common.ts */

export interface DateRange {
  start: string;
  end: string;
}

export const createEmptyDateRange = (): DateRange => ({
  start: '',
  end: ''
});

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  timestamp: string;
}

export interface TransferRequest {
  id: string;
  assetId: string;
  assetName: string;
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
} 