import { NativeModules } from 'react-native';

declare module 'react-native' {
  interface NativeModulesStatic {
    HandReceiptMobile: {
      generateEd25519KeyPair(): Promise<{
        public_key: string;
        private_key: string;
      }>;
      signEd25519(privateKey: string, data: BufferSource): Promise<ArrayBuffer>;
      storeKey(key: string, namespace: string): Promise<void>;
      retrieveKey(namespace: string): Promise<string | null>;
      deleteKey(namespace: string): Promise<void>;
    };
  }
}

export interface NativeKeyPair {
  public_key: string;
  private_key: string;
}