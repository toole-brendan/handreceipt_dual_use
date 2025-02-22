import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import baseConfig from '../../config/jest.base';
import { compilerOptions } from './tsconfig.json';

const config: Config = {
  ...baseConfig,
  rootDir: '.',
  displayName: 'civilian',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, {
      prefix: '<rootDir>/',
    }),
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png|jpg|jpeg)$': '<rootDir>/src/test/__mocks__/fileMock.ts',
  },
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        jsc: {
          transform: {
            react: {
              runtime: 'automatic',
            },
          },
        },
      },
    ],
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/',
    '/test/',
    '\\.d\\.ts$',
    'index\\.ts',
  ],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
};

export default config;
