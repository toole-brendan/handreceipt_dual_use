declare global {
  interface TextEncoderConstructor {
    new(): TextEncoder;
    prototype: TextEncoder;
  }

  interface TextDecoderConstructor {
    new(label?: string, options?: { fatal?: boolean; ignoreBOM?: boolean }): TextDecoder;
    prototype: TextDecoder;
  }

  interface TextEncoder {
    encode(input?: string): Uint8Array;
    encodeInto(source: string, destination: Uint8Array): { read: number; written: number };
  }

  interface TextDecoder {
    decode(input?: ArrayBuffer | ArrayBufferView): string;
    readonly encoding: string;
    readonly fatal: boolean;
    readonly ignoreBOM: boolean;
  }

  const TextEncoder: TextEncoderConstructor;
  const TextDecoder: TextDecoderConstructor;
}

