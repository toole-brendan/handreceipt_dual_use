import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import HandReceiptModule from '../native/HandReceiptMobile';
import { Transfer, TransferRequest, TransferStatus, QRScanResult } from '../types/sync';
import { Property, PropertyStatus, SyncStatus } from '../types/scanner';
import { API_URL } from '@env';

// Default values if env vars are not set
const DEFAULT_API_URL = 'http://localhost:8080';
const DEFAULT_API_TIMEOUT = 30000;

class ApiClient {
  private api: AxiosInstance;
  private offlineQueue: Array<{
    method: string;
    endpoint: string;
    data?: any;
  }> = [];

  constructor() {
    this.api = axios.create({
      baseURL: API_URL || DEFAULT_API_URL,
      timeout: DEFAULT_API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for auth token
    this.api.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          try {
            // Try to refresh token using native module
            const user = await HandReceiptModule.getCurrentUser();
            if (user) {
              // Retry original request
              return this.api.request(error.config);
            }
          } catch (refreshError) {
            // Handle refresh failure
            await AsyncStorage.removeItem('auth_token');
            throw refreshError;
          }
        }
        throw error;
      }
    );

    // Initialize offline queue processing
    this.initOfflineSync();
  }

  private async initOfflineSync() {
    NetInfo.addEventListener(async (state) => {
      if (state.isConnected && this.offlineQueue.length > 0) {
        await this.processOfflineQueue();
      }
    });
  }

  private async processOfflineQueue() {
    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const request of queue) {
      try {
        await this.api.request({
          method: request.method,
          url: request.endpoint,
          data: request.data,
        });
      } catch (error: unknown) {
        console.error('Failed to process offline request:', error);
        this.offlineQueue.push(request);
      }
    }
  }

  private async handleOfflineRequest(
    method: string,
    endpoint: string,
    data?: any
  ) {
    const isConnected = (await NetInfo.fetch()).isConnected;
    
    if (!isConnected) {
      this.offlineQueue.push({ method, endpoint, data });
      await AsyncStorage.setItem(
        'offline_queue',
        JSON.stringify(this.offlineQueue)
      );
      throw new Error('Offline mode: Request queued');
    }
  }

  // Property APIs
  async getProperties(): Promise<Property[]> {
    try {
      await this.handleOfflineRequest('GET', '/api/properties');
      const response = await this.api.get('/api/properties');
      await AsyncStorage.setItem('cached_properties', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        const cached = await AsyncStorage.getItem('cached_properties');
        if (cached) return JSON.parse(cached);
      }
      throw error;
    }
  }

  async getPropertyById(id: string): Promise<Property> {
    try {
      await this.handleOfflineRequest('GET', `/api/properties/${id}`);
      const response = await this.api.get(`/api/properties/${id}`);
      await AsyncStorage.setItem(`cached_property_${id}`, JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        const cached = await AsyncStorage.getItem(`cached_property_${id}`);
        if (cached) return JSON.parse(cached);
      }
      throw error;
    }
  }

  async createProperty(property: Partial<Property>): Promise<Property> {
    const response = await this.api.post('/api/properties', property);
    return response.data;
  }

  async updateProperty(id: string, property: Partial<Property>): Promise<Property> {
    const response = await this.api.put(`/api/properties/${id}`, property);
    return response.data;
  }

  async getPropertyQR(id: string): Promise<string> {
    const response = await this.api.get(`/api/properties/${id}/qr`);
    return response.data.qrCode;
  }

  async getPropertySyncStatus(id: string): Promise<SyncStatus> {
    const response = await this.api.get(`/api/properties/${id}/sync`);
    return response.data.status;
  }

  // Transfer APIs
  async createTransfer(transfer: TransferRequest): Promise<Transfer> {
    try {
      await this.handleOfflineRequest('POST', '/api/transfers', transfer);
      await HandReceiptModule.storeTransfer(transfer);
      const response = await this.api.post('/api/transfers', transfer);
      return response.data;
    } catch (error) {
      if (error instanceof Error && error.message === 'Offline mode: Request queued') {
        await HandReceiptModule.storeTransfer(transfer);
      }
      throw error;
    }
  }

  async getTransfer(id: string): Promise<Transfer> {
    const response = await this.api.get(`/api/transfers/${id}`);
    return response.data;
  }

  async approveTransfer(id: string): Promise<Transfer> {
    const response = await this.api.post(`/api/transfers/${id}/approve`);
    return response.data;
  }

  async scanQRTransfer(qrData: QRScanResult): Promise<Transfer> {
    const response = await this.api.post('/api/transfers/scan-qr', qrData);
    return response.data;
  }

  async getPendingTransfers(): Promise<Transfer[]> {
    const response = await this.api.get('/api/transfers/pending');
    return response.data;
  }

  async getTransferStatus(id: string): Promise<TransferStatus> {
    const response = await this.api.get(`/api/transfers/${id}/status`);
    return response.data.status;
  }

  async getPropertyTransfers(propertyId: string): Promise<Transfer[]> {
    const response = await this.api.get(`/api/transfers/property/${propertyId}`);
    return response.data;
  }

  // Mobile-specific APIs
  async getMobileSyncStatus(id: string): Promise<SyncStatus> {
    const response = await this.api.get(`/api/mobile/sync/${id}`);
    return response.data.status;
  }

  // User APIs
  async login(credentials: { username: string; password: string }): Promise<void> {
    const response = await this.api.post('/api/user/login', credentials);
    await AsyncStorage.setItem('auth_token', response.data.token);
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('auth_token');
    await this.api.post('/api/user/logout');
  }

  async getUserProfile(): Promise<any> {
    const response = await this.api.get('/api/user/profile');
    return response.data;
  }

  // Sync APIs
  async syncOfflineData(): Promise<void> {
    try {
      const result = await HandReceiptModule.syncPendingTransfers();
      console.log('Sync result:', result);
      await this.processOfflineQueue();
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }
}

export const api = new ApiClient();
export default api; 