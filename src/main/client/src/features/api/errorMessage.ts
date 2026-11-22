import type { ApiErrorBody } from "../../types";

const UNREACHABLE_SERVER_MESSAGE =
  "Could not reach the server. Check your connection and try again.";
const FALLBACK_MESSAGE = "Something went wrong. Please try again.";

const hasServerMessage = (data: unknown): data is ApiErrorBody =>
  typeof data === "object" &&
  data !== null &&
  typeof (data as Record<string, unknown>).message === "string";

/**
 * Turns an RTK Query error into text for the player. The server answers every failure with a
 * {"message": "..."} body (unknown match, name taken, color taken, match full, ...).
 */
export const getErrorMessage = (error: unknown): string => {
  if (typeof error !== "object" || error === null) return FALLBACK_MESSAGE;
  const { status, data } = error as { status?: unknown; data?: unknown };
  if (hasServerMessage(data)) return data.message;
  if (status === "FETCH_ERROR") return UNREACHABLE_SERVER_MESSAGE;
  return FALLBACK_MESSAGE;
};
