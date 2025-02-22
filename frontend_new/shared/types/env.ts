export interface BaseEnv {
  MODE: 'development' | 'production' | 'test';
  BASE_URL: string;
  PROD: boolean;
  DEV: boolean;
  SSR: boolean;
}

export interface CommonEnv extends BaseEnv {
  VITE_API_URL: string;
  VITE_WS_URL: string;
  VITE_APP_NAME: string;
  VITE_APP_VERSION: string;
}

export interface CivilianEnv extends CommonEnv {
  VITE_CIVILIAN_SPECIFIC_FEATURE?: string;
}

export interface DefenseEnv extends CommonEnv {
  VITE_BLOCKCHAIN_URL: string;
  VITE_DEFENSE_SPECIFIC_FEATURE?: string;
}

export function validateEnv<T extends CommonEnv>(env: T, requiredKeys: (keyof T)[]): void {
  for (const key of requiredKeys) {
    if (!env[key]) {
      throw new Error(`Missing required environment variable: ${String(key)}`);
    }
  }
}

export const commonRequiredKeys: (keyof CommonEnv)[] = [
  'VITE_API_URL',
  'VITE_WS_URL',
  'VITE_APP_NAME',
  'VITE_APP_VERSION'
];

export const defenseRequiredKeys: (keyof DefenseEnv)[] = [
  ...commonRequiredKeys,
  'VITE_BLOCKCHAIN_URL'
];
