import GameIdDisplay from "./GameIdDisplay";
import { lobbyConstants, tankColor } from "../../constants";
import { arrayToRgba } from "../../util/color";
import type { Game } from "../../types";

const WaitingRoom = ({
  game,
  ownPlayerIndex,
  isHost,
  onStartMatch,
  isStarting,
}: {
  game: Game;
  ownPlayerIndex: number | null;
  isHost: boolean;
  onStartMatch: () => Promise<void>;
  isStarting: boolean;
}) => {
  const hasEnoughPlayers = game.players.length >= lobbyConstants.minPlayersToStart;

  return (
    <>
      <GameIdDisplay gameId={game.gameId} />
      <h2>
        Players ({game.players.length}/{game.maxPlayerCount})
      </h2>
      <ul className="player-list">
        {game.players.map((player) => (
          <li key={player.playerIndex} className="player-list-item">
            <span
              className="player-color-swatch"
              data-testid={`player-color-${player.playerIndex}`}
              style={{ backgroundColor: arrayToRgba(tankColor[player.tank.colorIndex]) }}
            />
            {player.name}
            {player.playerIndex === ownPlayerIndex ? " (you)" : ""}
            {player.playerIndex === game.hostPlayerIndex ? " - host" : ""}
          </li>
        ))}
      </ul>

      {isHost ? (
        <>
          <button
            type="button"
            className="button-primary"
            onClick={onStartMatch}
            disabled={!hasEnoughPlayers || isStarting}
          >
            {isStarting ? "Starting..." : "Start Game"}
          </button>
          {!hasEnoughPlayers && (
            <p className="waiting-hint">
              Waiting for at least {lobbyConstants.minPlayersToStart} players. Share the match ID
              above!
            </p>
          )}
        </>
      ) : (
        <p className="waiting-hint">Waiting for the host to start the match...</p>
      )}
    </>
  );
};

export default WaitingRoom;
