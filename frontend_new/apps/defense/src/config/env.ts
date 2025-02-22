import { DefenseEnv, validateEnv, defenseRequiredKeys } from '@shared/types/env';

const env = {
  MODE: import.meta.env.MODE as 'development' | 'production' | 'test',
  BASE_URL: import.meta.env.BASE_URL,
  PROD: import.meta.env.PROD,
  DEV: import.meta.env.DEV,
  SSR: import.meta.env.SSR,

  // Common environment variables
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_WS_URL: import.meta.env.VITE_WS_URL,
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME || 'Hand Receipt - Defense',
  VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',

  // Defense-specific environment variables
  VITE_BLOCKCHAIN_URL: import.meta.env.VITE_BLOCKCHAIN_URL,
  VITE_DEFENSE_SPECIFIC_FEATURE: import.meta.env.VITE_DEFENSE_SPECIFIC_FEATURE,
} as const satisfies DefenseEnv;

// Validate required environment variables
validateEnv(env, defenseRequiredKeys);

export default env;
