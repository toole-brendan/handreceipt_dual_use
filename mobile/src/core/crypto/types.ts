declare global {
  interface Window {
    crypto: Crypto;
  }

  interface Crypto {
    subtle: SubtleCrypto;
  }

  // Add TextEncoder type
  class TextEncoder {
    encode(input?: string): Uint8Array;
  }

  class TextDecoder {
    decode(input?: Uint8Array | ArrayBuffer): string;
  }

  interface CryptoKeyPair {
    privateKey: CryptoKey;
    publicKey: CryptoKey;
  }

  interface CryptoKey {
    readonly algorithm: KeyAlgorithm;
    readonly extractable: boolean;
    readonly type: string;
    readonly usages: string[];
  }

  interface KeyAlgorithm {
    name: string;
  }

  interface SubtleCrypto {
    generateKey(
      algorithm: EcKeyGenParams,
      extractable: boolean,
      keyUsages: string[]
    ): Promise<CryptoKeyPair>;
    
    sign(
      algorithm: EcdsaParams,
      key: CryptoKey,
      data: ArrayBuffer
    ): Promise<ArrayBuffer>;
    
    verify(
      algorithm: EcdsaParams,
      key: CryptoKey,
      signature: ArrayBuffer,
      data: ArrayBuffer
    ): Promise<boolean>;
    
    exportKey(
      format: 'jwk',
      key: CryptoKey
    ): Promise<JsonWebKey>;
    
    importKey(
      format: 'jwk',
      keyData: JsonWebKey,
      algorithm: EcKeyImportParams,
      extractable: boolean,
      keyUsages: string[]
    ): Promise<CryptoKey>;
  }

  interface EcKeyGenParams {
    name: 'ECDSA';
    namedCurve: string;
  }

  interface EcdsaParams {
    name: 'ECDSA';
    hash: { name: string };
  }

  interface EcKeyImportParams {
    name: 'ECDSA';
    namedCurve: string;
  }

  interface JsonWebKey {
    kty: string;
    crv: string;
    x: string;
    y: string;
    d?: string;
    ext: boolean;
    key_ops: string[];
  }

  const crypto: Crypto;
}

export {};
