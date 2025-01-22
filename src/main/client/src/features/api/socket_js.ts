import Stomp from "stompjs";
import SockJS from "sockjs-client/dist/sockjs";


const url = "http://localhost:8080";

export const connectToSocket = () => {
  const socket = new SockJS(url + "/ws");
  const stompClient = Stomp.over(socket);

  return stompClient;
};

