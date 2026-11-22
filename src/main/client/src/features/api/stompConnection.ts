import Stomp from "stompjs";
import SockJS from "sockjs-client/dist/sockjs";
import type { AimUpdate } from "../../types";

// Relative URL: the socket connects to whichever host served the page (proxied by Vite in development).
const SOCKET_ENDPOINT = "/ws";

// The connection opened for the match being watched; shared so other code can send over it.
let sharedStompClient: Stomp.Client | null = null;

export const connectToSocket = () => {
  const socket = new SockJS(SOCKET_ENDPOINT);
  const stompClient = Stomp.over(socket);
  // stompjs logs every frame to the console by default.
  stompClient.debug = () => undefined;

  return stompClient;
};

/** Makes `stompClient` the connection `sendAimUpdate` uses. */
export const setSharedStompClient = (stompClient: Stomp.Client): void => {
  sharedStompClient = stompClient;
};

/** Stops `sendAimUpdate` using `stompClient`, unless a newer connection has replaced it already. */
export const releaseSharedStompClient = (stompClient: Stomp.Client): void => {
  if (sharedStompClient === stompClient) sharedStompClient = null;
};

/** What a player sends while aiming. The token proves who is aiming and is never broadcast back. */
export type AimUpdateMessage = Omit<AimUpdate, "playerIndex"> & { playerToken: string };

/**
 * Sends the local player's live aim. Aim previews are best effort, so nothing is queued or
 * retried: without an established connection the update is simply dropped.
 */
export const sendAimUpdate = (matchId: string, aimUpdate: AimUpdateMessage): void => {
  if (!sharedStompClient?.connected) return;
  sharedStompClient.send(`/app/matches/${matchId}/aim`, {}, JSON.stringify(aimUpdate));
};
