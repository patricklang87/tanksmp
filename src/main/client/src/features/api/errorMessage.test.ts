import { getErrorMessage } from "./errorMessage";

describe("getErrorMessage", () => {
  it("uses the message from the server's error body", () => {
    const error = { status: 400, data: { message: "That tank color has already been claimed." } };
    expect(getErrorMessage(error)).toBe("That tank color has already been claimed.");
  });

  it("explains a network failure", () => {
    expect(getErrorMessage({ status: "FETCH_ERROR", error: "Failed to fetch" })).toMatch(
      /could not reach the server/i
    );
  });

  it("falls back to a generic message for anything else", () => {
    expect(getErrorMessage({ status: 500, data: "boom" })).toMatch(/something went wrong/i);
    expect(getErrorMessage(undefined)).toMatch(/something went wrong/i);
  });
});
