import Stomp from "stompjs";
import SockJS from "sockjs-client/dist/sockjs";
const url = "http://localhost:8080";
export const connectToSocket = (gameId) => {
    console.log("connecting to the game");
    const socket = new SockJS(url + "/ws");
    console.log("gameId in connectToSocket", gameId);
    console.log("created socketjs", socket);
    const stompClient = Stomp.over(socket);
    console.log("stomp client,", stompClient);
    stompClient.connect([], () => {
        stompClient.subscribe("/topic/game-progress/" + gameId, (message) => {
            const recievedMessage = JSON.parse(message.body);
            console.log("message recieved", recievedMessage);
        });
    });
    return stompClient;
};
