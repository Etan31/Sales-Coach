// Native ESM Jest config (server package.json has "type": "module"). Run via
// `cross-env NODE_OPTIONS=--experimental-vm-modules jest` (see package.json "test" script).
module.exports = {
  testEnvironment: 'node',
  transform: {},
  setupFiles: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: ['src/**/*.js', '!src/index.js', '!src/**/*.test.js', '!src/test-helpers/**'],
  testPathIgnorePatterns: ['/node_modules/']
};
