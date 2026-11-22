import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "util";

// react-router needs these, and the jsdom test environment does not provide them.
Object.assign(globalThis, { TextEncoder, TextDecoder });

// jsdom has no fetch. Tests mock the API hooks, so a request reaching the network is a mistake.
if (typeof globalThis.fetch === "undefined") {
  globalThis.fetch = () => Promise.reject(new Error("Network access is not available in tests."));
}
import "jest-canvas-mock";
