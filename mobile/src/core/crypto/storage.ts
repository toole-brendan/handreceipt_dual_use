import { NativeModules } from 'react-native';

export interface HybridKey {
  webCrypto: CryptoKey;
  native?: {
    type: 'Ed25519';
    publicKey: string;
    privateKey: string;
  };
}

export interface KeyStorage {
  readonly namespace: string;
  store(key: HybridKey): Promise<void>;
  retrieve(): Promise<HybridKey | null>;
  remove(): Promise<void>;
}

export class SecureKeyStorage implements KeyStorage {
  constructor(readonly namespace: string) {}

  async store(key: HybridKey): Promise<void> {
    const serialized = JSON.stringify({
      webCrypto: await crypto.subtle.exportKey('jwk', key.webCrypto),
      native: key.native
    });
    await NativeModules.HandReceiptMobile.storeKey(serialized, this.namespace);
  }

  async retrieve(): Promise<HybridKey | null> {
    const stored = await NativeModules.HandReceiptMobile.retrieveKey(this.namespace);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    return {
      webCrypto: await crypto.subtle.importKey(
        'jwk',
        parsed.webCrypto,
        {
          name: 'ECDSA',
          namedCurve: 'P-256'
        },
        true,
        ['sign']
      ),
      native: parsed.native
    };
  }

  async remove(): Promise<void> {
    await NativeModules.HandReceiptMobile.deleteKey(this.namespace);
  }
}