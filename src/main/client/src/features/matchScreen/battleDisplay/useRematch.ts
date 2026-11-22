import { useState } from "react";
import { useRematchMatchMutation } from "../../api/matchSlice";
import { getErrorMessage } from "../../api/errorMessage";
import { useAppSelector } from "../../../redux/hooks";
import { selectPlayerIndex, selectPlayerToken } from "../../../redux/sessionSlice";
import type { Game } from "../../../types";

/** Whether this browser tab holds the host's seat, and how the host restarts the finished match. */
export const useRematch = (game: Game) => {
  const playerIndex = useAppSelector(selectPlayerIndex);
  const playerToken = useAppSelector(selectPlayerToken);
  const [rematchMatch, { isLoading: isRematching }] = useRematchMatchMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isHost = playerIndex !== null && playerIndex === game.hostPlayerIndex;

  const startRematch = async () => {
    if (!isHost || !playerToken) return;
    setErrorMessage(null);
    try {
      await rematchMatch({ matchId: game.gameId, playerToken }).unwrap();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  return { isHost, isRematching, errorMessage, startRematch };
};
