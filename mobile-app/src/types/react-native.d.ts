declare module 'react-native' {
  export interface NativeModulesStatic {
    RFIDModule: {
      scanTag(): Promise<RFIDScanResult>;
    };
  }
  
  export const NativeModules: NativeModulesStatic;
  export const Platform: {
    OS: 'ios' | 'android';
    select<T>(specifics: { ios?: T; android?: T; }): T;
  };
} 