import { isFalsy, isTruthy } from "./evaluate";

describe("isTruthy", () => {
  it.each([1, "1", "Y", true, "true"])("treats %p as truthy", (value) => {
    expect(isTruthy(value)).toBe(true);
  });

  it.each([0, "0", "N", false, "false", "yes", 2, ""])("does not treat %p as truthy", (value) => {
    expect(isTruthy(value)).toBe(false);
  });
});

describe("isFalsy", () => {
  it.each([0, "0", "N", false, "false"])("treats %p as falsy", (value) => {
    expect(isFalsy(value)).toBe(true);
  });

  it.each([1, "1", "Y", true, "true", "no", ""])("does not treat %p as falsy", (value) => {
    expect(isFalsy(value)).toBe(false);
  });
});
