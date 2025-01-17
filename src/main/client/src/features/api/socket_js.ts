import Stomp from "stompjs";
import SockJS from "sockjs-client/dist/sockjs";


const url = "http://localhost:8080";

export const connectToSocket = (gameId: string): void => {
  console.log("connecting to the game");
  const socket = new SockJS(url + "/ws");
  console.log("gameId in connectToSocket", gameId);

  console.log("created socketjs",socket);
  const stompClient = Stomp.over(socket);
  console.log("stomp client,", stompClient )
  // stompClient.connect({}, (frame) => {
  //   console.log("connected to the frame: " + frame);
  //   stompClient.subscribe("/topic/game-progress/" + gameId, (response) => {
  //     const data = JSON.parse(response.body);
  //       console.log(data);
  //       // displayResponse(data);
  //   });
  // });
  stompClient.connect([], () => {
    stompClient.subscribe("/topic/game-progress/" + gameId, (message) => {
      const recievedMessage = JSON.parse(message.body);
      console.log("message recieved", recievedMessage)
      // setMessages((prevMessages: ListMessage[]) => [
      //   ...prevMessages,
      //   recievedMessage,
      // ]);
    });
  });
};

// const socket = new SockJS("http://localhost:8080/ws");
// const client = Stomp.over(socket);

// client.connect([], () => {
//   client.subscribe("/topic/messages", (message) => {
//     const recievedMessage = JSON.parse(message.body);
//     console.log("message recieved", recievedMessage)
//     setMessages((prevMessages: ListMessage[]) => [
//       ...prevMessages,
//       recievedMessage,
//     ]);
//   });
// });