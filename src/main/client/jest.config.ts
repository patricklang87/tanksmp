import type { Config } from "jest";

const jestConfig: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  roots: ["<rootDir>/src"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      { tsconfig: { jsx: "react-jsx", module: "CommonJS", moduleResolution: "node10", esModuleInterop: true, ignoreDeprecations: "5.0" } },
    ],
  },
  moduleNameMapper: {
    "\\.(css|less|scss)$": "identity-obj-proxy",
    "\\.(png|jpe?g|gif|svg|webp)$": "<rootDir>/src/test-utils/fileMock.ts",
  },
};

export default jestConfig;
