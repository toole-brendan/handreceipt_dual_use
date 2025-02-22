import { CivilianEnv, validateEnv, commonRequiredKeys } from '@shared/types/env';

const env = {
  MODE: import.meta.env.MODE as 'development' | 'production' | 'test',
  BASE_URL: import.meta.env.BASE_URL,
  PROD: import.meta.env.PROD,
  DEV: import.meta.env.DEV,
  SSR: import.meta.env.SSR,

  // Common environment variables
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_WS_URL: import.meta.env.VITE_WS_URL,
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME || 'Hand Receipt - Civilian',
  VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',

  // Civilian-specific environment variables
  VITE_CIVILIAN_SPECIFIC_FEATURE: import.meta.env.VITE_CIVILIAN_SPECIFIC_FEATURE,
} as const satisfies CivilianEnv;

// Validate required environment variables
validateEnv(env, commonRequiredKeys);

export default env;
