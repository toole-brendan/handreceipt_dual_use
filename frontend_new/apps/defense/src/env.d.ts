/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: 'development' | 'production' | 'test';
  readonly BASE_URL: string;
  readonly PROD: boolean;
  readonly DEV: boolean;
  readonly SSR: boolean;

  // Common environment variables
  readonly VITE_API_URL: string;
  readonly VITE_WS_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;

  // Defense-specific environment variables
  readonly VITE_BLOCKCHAIN_URL: string;
  readonly VITE_DEFENSE_SPECIFIC_FEATURE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
