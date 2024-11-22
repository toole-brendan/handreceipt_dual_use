export interface RFIDScanResult {
  id: string;
  type: string;
  data: string;
  timestamp: string;
  metadata?: {
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    [key: string]: any;
  };
}

export interface RFIDError {
  code: string;
  message: string;
  details?: any;
}

export interface RFIDModuleInterface {
  scanTag(): Promise<RFIDScanResult>;
  isSupported(): Promise<boolean>;
  initialize(): Promise<void>;
  cleanup(): Promise<void>;
} 