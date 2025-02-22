module.exports = {
  projects: [
    '<rootDir>/apps/civilian',
    '<rootDir>/apps/defense'
  ],
  collectCoverageFrom: [
    'apps/**/*.{ts,tsx}',
    'shared/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  ...require('./config/jest.base.js')
};
