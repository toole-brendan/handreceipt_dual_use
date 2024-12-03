export interface RFIDScanResult {
  tagId: string;
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  success: boolean;
  error?: string;
} 