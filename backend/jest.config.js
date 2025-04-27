/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+.tsx?$': ['ts-jest', {}],
  },
  // ignore files from test/helpers
  testPathIgnorePatterns: ['<rootDir>/test/helpers/'],
  coveragePathIgnorePatterns: ['<rootDir>/test/helpers/'],
};
    