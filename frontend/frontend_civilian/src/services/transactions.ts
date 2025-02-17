import { Asset } from '../types/shared';

export interface PropertyTransaction {
  id: string;
  type: 'transfer' | 'issue' | 'return' | 'maintenance';
  asset: Asset;
  fromUser?: string;
  toUser?: string;
  status: 'pending' | 'completed' | 'cancelled' | 'failed';
  timestamp: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface TransactionError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export async function fetchPropertyTransactions(): Promise<PropertyTransaction[]> {
  try {
    const response = await fetch('/api/transactions');
    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}

export async function exportPropertyTransactions(format: 'csv' | 'pdf' | 'xlsx'): Promise<Blob> {
  try {
    const response = await fetch(`/api/transactions/export?format=${format}`);
    if (!response.ok) {
      throw new Error('Failed to export transactions');
    }
    return response.blob();
  } catch (error) {
    console.error('Error exporting transactions:', error);
    throw error;
  }
}
