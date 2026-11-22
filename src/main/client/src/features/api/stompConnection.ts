import Stomp from "stompjs";
import SockJS from "sockjs-client/dist/sockjs";

// Relative URL: the socket connects to whichever host served the page (proxied by Vite in development).
const SOCKET_ENDPOINT = "/ws";

export const connectToSocket = () => {
  const socket = new SockJS(SOCKET_ENDPOINT);
  const stompClient = Stomp.over(socket);

  return stompClient;
};
