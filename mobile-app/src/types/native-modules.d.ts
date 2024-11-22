// mobile-app/src/types/native-modules.d.ts

declare module 'react-native' {
  interface NativeModulesStatic {
    RNSecureStorage: {
      generateRandomBytes(size: number): Promise<string>;
      setItem(key: string, value: string, options?: {
        accessible?: string;
        authenticateType?: string;
      }): Promise<void>;
      getItem(key: string): Promise<string>;
    };
    RFIDModule: {
      scanTag(): Promise<RFIDScanResult>;
      isSupported(): Promise<boolean>;
      initialize(): Promise<void>;
      cleanup(): Promise<void>;
    };
  }
} 