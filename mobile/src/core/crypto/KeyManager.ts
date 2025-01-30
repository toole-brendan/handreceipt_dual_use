import { NativeModules } from 'react-native';
import { KeyStorage, HybridKey } from './storage';

export class KeyManager {
  constructor(private readonly storage: KeyStorage) {}

  async generateKeyPair(): Promise<CryptoKeyPair> {
    // Generate WebCrypto key pair for cross-platform compatibility
    const webCryptoResult = await crypto.subtle.generateKey(
      {
        name: 'ECDSA',
        namedCurve: 'P-256'
      },
      true,
      ['sign', 'verify']
    ) as CryptoKeyPair;

    // Try to generate native Ed25519 keys if available
    let nativeKeys = null;
    if (NativeModules.HandReceiptMobile?.generateEd25519KeyPair) {
      try {
        nativeKeys = await NativeModules.HandReceiptMobile.generateEd25519KeyPair();
      } catch (error: unknown) {
        console.warn('Native key generation failed:', error);
      }
    }

    // Store hybrid key
    await this.storage.store({
      webCrypto: webCryptoResult.privateKey,
      ...(nativeKeys && {
        native: {
          type: 'Ed25519' as const,
          publicKey: nativeKeys.public_key,
          privateKey: nativeKeys.private_key
        }
      })
    });

    return webCryptoResult;
  }

  async sign(data: BufferSource): Promise<ArrayBuffer> {
    const key = await this.storage.retrieve();
    if (!key) {
      throw new Error('No signing key available');
    }

    // Try native signing if available
    if (key.native?.type === 'Ed25519' && NativeModules.HandReceiptMobile?.signEd25519) {
      try {
        return await NativeModules.HandReceiptMobile.signEd25519(
          key.native.privateKey,
          data
        );
      } catch (error: unknown) {
        console.warn('Native signing failed, falling back to WebCrypto:', error);
      }
    }

    // Fallback to WebCrypto
    return crypto.subtle.sign(
      {
        name: 'ECDSA',
        hash: { name: 'SHA-256' },
      },
      key.webCrypto,
      data
    );
  }

  async verify(
    signature: BufferSource,
    data: BufferSource,
    publicKey: CryptoKey
  ): Promise<boolean> {
    return crypto.subtle.verify(
      {
        name: 'ECDSA',
        hash: { name: 'SHA-256' },
      },
      publicKey,
      signature,
      data
    );
  }

  async validateKey(publicKey: string): Promise<boolean> {
    const response = await fetch('/api/keys/validate', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({public_key: publicKey})
    });
    return response.ok;
  }
}
