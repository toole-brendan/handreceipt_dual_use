import { Asset } from './types';

class ApiClient {
  private baseUrl: string;
  private headers: { [key: string]: string };
  
  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getAuthToken();
    
    const headers = {
      ...this.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('API request failed:', {
        endpoint,
        error,
      });
      throw error;
    }
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      // Implement your token storage/retrieval logic here
      return localStorage.getItem('token');
    } catch {
      return null;
    }
  }

  async verifyQRCode(data: string): Promise<string> {
    const response = await this.request<{ assetId: string }>('/qr/verify', {
      method: 'POST',
      body: JSON.stringify({ qr_data: data }),
    });
    return response.assetId;
  }

  async getAssetQRCode(assetId: string): Promise<string> {
    const response = await this.request<{ qr_code: string }>(`/qr/generate/${assetId}`);
    return response.qr_code;
  }

  async getAsset(id: string): Promise<Asset> {
    return this.request<Asset>(`/assets/${id}`);
  }

  async verifyAsset(assetId: string): Promise<void> {
    await this.request('/assets/verify', {
      method: 'POST',
      body: JSON.stringify({ asset_id: assetId }),
    });
  }

  async transferAsset(transaction: TransferTransaction): Promise<TransferResponse> {
    return this.request<TransferResponse>('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }

  async getTransferStatus(transferId: string): Promise<TransferStatus> {
    return this.request<TransferStatus>(`/transactions/${transferId}/status`);
  }
}

export interface TransferTransaction {
  asset_id: string;
  timestamp: string;
  action: 'TRANSFER';
  metadata: {
    previous_owner?: string;
    transfer_location?: string;
    notes?: string;
    [key: string]: any;
  };
}

export interface TransferResponse {
  transfer_id: string;
  status: TransferStatus;
  timestamp: string;
  message?: string;
}

export enum TransferStatus {
  Pending = 'PENDING',
  Processing = 'PROCESSING',
  Completed = 'COMPLETED',
  Failed = 'FAILED',
}

export const api = new ApiClient();
