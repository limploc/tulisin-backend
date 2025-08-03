import { createDefaultPreset } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
export default {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  setupFilesAfterEnv: ["<rootDir>/test/setup.ts"],
  // Run tests sequentially to avoid race conditions
  maxWorkers: 1,
  // Force exit after all tests complete
  forceExit: true,
  // Clear mocks between test files
  clearMocks: true,
  // Reset modules between test files
  resetModules: true,
  // Set environment variables for testing
  setupFiles: ["<rootDir>/test/setupEnv.js"],
};
