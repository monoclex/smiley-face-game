/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest"],
  },
  testPathIgnorePatterns: [".*\\.test-helper\\..*"],
};

export default config;
