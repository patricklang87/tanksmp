<h1 align="center">Tanks fer Nuthin' — Multiplayer</h1>

<p align="center">The online multiplayer version of <a href="https://github.com/patricklang87/tanks_2">Tanks fer Nuthin'</a>, an artillery game inspired by "Scorched Earth". A Java Spring Boot server creates matches, generates the terrain and broadcasts game state to every player over websockets. The React/TypeScript client is bundled into the Spring Boot app.</p>

## Status

Work in progress. Players can create a match, join it with a name and tank color, and start the game. Turn-taking over the websocket connection is next.

## How it works

| Endpoint | Method | Purpose |
|---|---|---|
| `/match/initialize` | GET | Create a new match (random terrain and color scheme) and return it, including its `gameId` |
| `/match/initialize/{gameId}` | GET | Fetch a match and broadcast its current state to subscribers |
| `/match/join` | POST | `{ gameId, playerName, requestedColor }`: join a match that hasn't started (up to 6 players) |
| `/match/start` | POST | `{ gameId }`: start the match |
| `/match/gameplay` | POST | Submit a turn (stub) |

Clients connect to the STOMP endpoint at `/ws` (SockJS) and subscribe to `/topic/game-progress/{gameId}`. Every change to a match is pushed there.

Games are stored in memory, so restarting the server clears all matches.

## Run the project

Requires Java 21. Maven and Node are downloaded automatically by the Maven wrapper and the `frontend-maven-plugin`.

```bash
./mvnw spring-boot:run
```

This builds the client in `src/main/client` and serves the app at http://localhost:8080.

To work on the client with hot reload, keep the server running and in a second terminal:

```bash
cd src/main/client
npm install
npm run dev
```

## Run the tests

```bash
./mvnw test
```

The suite covers:
- **`GameService`**: creating matches, joining (unknown match, duplicate names, full matches, already-started matches) and starting matches.
- **`Topography`**: generated terrain is evenly spaced and stays within the canvas for every landscape type.
- **`GameController`**: create → join → start through the REST API, plus 404/400 error responses.

Tests run on every push and pull request via GitHub Actions.

## Built with

- Java 21, Spring Boot 3 (Web, WebSocket/STOMP), Lombok, Maven
- TypeScript, React, Redux Toolkit / RTK Query, SockJS + stompjs, Vite
- JUnit 5, AssertJ, MockMvc

## Author

**Patrick Lang**

- [Profile](https://github.com/patricklang87 "Patrick Lang")
