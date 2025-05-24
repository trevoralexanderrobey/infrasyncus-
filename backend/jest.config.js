module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Skip dist folder and other build artifacts during tests
  testPathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/node_modules/',
    '<rootDir>/coverage/'
  ],
  // Only test source files, not built files
  testMatch: [
    '<rootDir>/src/**/*.spec.ts',
    '<rootDir>/src/**/*.test.ts'
  ],
  // Collect coverage only from source files
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/main.ts'
  ]
};
