import {
  useCreateMatchMutation,
  useGetMatchQuery,
  useJoinMatchMutation,
  useLazyGetMatchQuery,
  useStartMatchMutation,
} from "../features/api/matchSlice";
import type { Game } from "../types";

/** A mutation/lazy trigger whose call resolves with the value, like `trigger(args).unwrap()`. */
export const resolvingTrigger = <Value>(value: Value) =>
  jest.fn(() => ({ unwrap: () => Promise.resolve(value) }));

/** A trigger whose call rejects with an RTK Query style error. */
export const rejectingTrigger = (error: unknown) =>
  jest.fn(() => ({ unwrap: () => Promise.reject(error) }));

export const serverError = (status: number, message: string) => ({ status, data: { message } });

type TriggerMock = ReturnType<typeof resolvingTrigger> | ReturnType<typeof rejectingTrigger>;

/**
 * Wires the (automocked) matchSlice hooks. Call `jest.mock("../features/api/matchSlice")` in the
 * test file first.
 */
export const mockMatchApi = ({
  game,
  loadMatchError,
  createMatch = resolvingTrigger({}),
  lookUpMatch = resolvingTrigger({}),
  joinMatch = resolvingTrigger({}),
  startMatch = resolvingTrigger({}),
  isCreating = false,
}: {
  game?: Game;
  loadMatchError?: unknown;
  createMatch?: TriggerMock;
  lookUpMatch?: TriggerMock;
  joinMatch?: TriggerMock;
  startMatch?: TriggerMock;
  isCreating?: boolean;
} = {}) => {
  jest.mocked(useCreateMatchMutation).mockReturnValue([
    createMatch,
    { isLoading: isCreating },
  ] as never);
  jest.mocked(useLazyGetMatchQuery).mockReturnValue([
    lookUpMatch,
    { isFetching: false },
  ] as never);
  jest.mocked(useJoinMatchMutation).mockReturnValue([joinMatch, { isLoading: false }] as never);
  jest.mocked(useStartMatchMutation).mockReturnValue([startMatch, { isLoading: false }] as never);
  jest.mocked(useGetMatchQuery).mockReturnValue({
    data: game,
    isFetching: false,
    error: loadMatchError,
  } as never);
  return { createMatch, lookUpMatch, joinMatch, startMatch };
};
