export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

export interface Asset {
  id: string;
  name: string;
  description?: string;
  serialNumber: string;
  category: string;
  status: 'active' | 'maintenance' | 'retired';
  currentHolder: string;
  dateAssigned: string;
  rfidTag?: string;
} 