export interface RFIDScanResult {
  tag_id: string;
  timestamp: string;
  success: boolean;
  error?: string;
}

export interface RFIDTag {
  id: string;
  assetId?: string;
  lastScanned?: string;
  status: 'active' | 'inactive' | 'error';
}

export interface RFIDScanResponse {
  success: boolean;
  data?: RFIDScanResult;
  error?: string;
} 