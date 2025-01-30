declare global {
  interface ArrayBufferTypes {
    ArrayBuffer: ArrayBuffer;
    SharedArrayBuffer: SharedArrayBuffer;
  }

  type ArrayBufferLike = ArrayBufferTypes[keyof ArrayBufferTypes];
  type TypedArray = Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array | BigInt64Array | BigUint64Array;
  type ArrayBufferView = TypedArray | DataView;
  type BufferSource = ArrayBufferView | ArrayBuffer;
  
  interface CryptoKeyPair {
    privateKey: CryptoKey;
    publicKey: CryptoKey;
  }

  interface Crypto {
    subtle: SubtleCrypto;
    getRandomValues<T extends ArrayBufferView | null>(array: T): T;
  }

  interface SubtleCrypto {
    digest(algorithm: AlgorithmIdentifier, data: BufferSource): Promise<ArrayBuffer>;
    generateKey(
      algorithm: Algorithm,
      extractable: boolean,
      keyUsages: KeyUsage[]
    ): Promise<CryptoKey | CryptoKeyPair>;
    sign(
      algorithm: AlgorithmIdentifier,
      key: CryptoKey,
      data: BufferSource
    ): Promise<ArrayBuffer>;
    verify(
      algorithm: AlgorithmIdentifier,
      key: CryptoKey,
      signature: BufferSource,
      data: BufferSource
    ): Promise<boolean>;
  }

  type AlgorithmIdentifier = Algorithm | string;
  type KeyUsage = 'encrypt' | 'decrypt' | 'sign' | 'verify' | 'deriveKey' | 'deriveBits' | 'wrapKey' | 'unwrapKey';

  interface Algorithm {
    name: string;
    [propName: string]: any;
  }
}

export {};
