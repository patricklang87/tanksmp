import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  useCreateMatchMutation,
  useGetMatchQuery,
  useJoinMatchMutation,
  useLazyGetMatchQuery,
  useStartMatchMutation,
} from "../api/matchSlice";
import { getErrorMessage } from "../api/errorMessage";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  matchSelected,
  seatClaimed,
  selectMatchId,
  selectPlayerIndex,
  selectPlayerToken,
  sessionCleared,
} from "../../redux/sessionSlice";
import { useSlowRequestNotice } from "./useSlowRequestNotice";

export type LobbyStep = "chooseMode" | "enterMatchId" | "joinMatch" | "waitingRoom";

type SubmitEvent = Pick<FormEvent<HTMLFormElement>, "preventDefault">;

/** A refresh keeps the seat: a stored token means the player already joined. */
const deriveInitialStep = (matchId: string | null, playerToken: string | null): LobbyStep => {
  if (matchId && playerToken) return "waitingRoom";
  if (matchId) return "joinMatch";
  return "chooseMode";
};

export const useLobby = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const matchId = useAppSelector(selectMatchId);
  const playerIndex = useAppSelector(selectPlayerIndex);
  const playerToken = useAppSelector(selectPlayerToken);

  const [step, setStep] = useState<LobbyStep>(() => deriveInitialStep(matchId, playerToken));
  const [matchIdInput, setMatchIdInput] = useState<string>("");
  const [playerName, setPlayerName] = useState<string>("");
  const [requestedColor, setRequestedColor] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [createMatch, createMatchResult] = useCreateMatchMutation();
  const [lookUpMatch, lookUpMatchResult] = useLazyGetMatchQuery();
  const [joinMatch, joinMatchResult] = useJoinMatchMutation();
  const [startMatch, startMatchResult] = useStartMatchMutation();
  // Live match data: the first response, then updates pushed over the socket.
  const {
    data: game,
    isFetching: isLoadingMatch,
    error: loadMatchError,
  } = useGetMatchQuery(matchId ?? skipToken);

  const isRequestPending =
    createMatchResult.isLoading ||
    lookUpMatchResult.isFetching ||
    joinMatchResult.isLoading ||
    isLoadingMatch;
  const isWakingServerNoticeVisible = useSlowRequestNotice(isRequestPending);

  // The stored match no longer exists (for example the server restarted): start over.
  useEffect(() => {
    if (!loadMatchError) return;
    dispatch(sessionCleared());
    setStep("chooseMode");
    setErrorMessage(getErrorMessage(loadMatchError));
  }, [loadMatchError, dispatch]);

  const gameStatus = game?.gameStatus;
  const hasSeat = playerToken !== null;
  useEffect(() => {
    if (gameStatus === "IN_PROGRESS" && hasSeat) {
      navigate("/match");
    }
  }, [gameStatus, hasSeat, navigate]);

  const isHost =
    game !== undefined && game.hostPlayerIndex !== null && game.hostPlayerIndex === playerIndex;

  const handleCreateMatch = async (): Promise<void> => {
    setErrorMessage(null);
    try {
      const createdGame = await createMatch().unwrap();
      dispatch(matchSelected(createdGame.gameId));
      setStep("joinMatch");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  const handleLookUpMatch = async (event: SubmitEvent): Promise<void> => {
    event.preventDefault();
    setErrorMessage(null);
    try {
      const foundGame = await lookUpMatch(matchIdInput.trim()).unwrap();
      dispatch(matchSelected(foundGame.gameId));
      setStep("joinMatch");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  const handleJoinMatch = async (event: SubmitEvent): Promise<void> => {
    event.preventDefault();
    if (!matchId || requestedColor === null) return;
    setErrorMessage(null);
    try {
      const joined = await joinMatch({
        matchId,
        playerName: playerName.trim(),
        requestedColor,
      }).unwrap();
      dispatch(
        seatClaimed({
          matchId: joined.game.gameId,
          playerIndex: joined.playerIndex,
          playerToken: joined.playerToken,
        })
      );
      setStep("waitingRoom");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  const handleStartMatch = async (): Promise<void> => {
    if (!matchId || !playerToken) return;
    setErrorMessage(null);
    try {
      await startMatch({ matchId, playerToken }).unwrap();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  const handleChooseJoinExisting = (): void => {
    setErrorMessage(null);
    setStep("enterMatchId");
  };

  const handleBackToStart = (): void => {
    dispatch(sessionCleared());
    setErrorMessage(null);
    setRequestedColor(null);
    setStep("chooseMode");
  };

  return {
    step,
    matchId,
    game,
    playerIndex,
    isHost,
    matchIdInput,
    setMatchIdInput,
    playerName,
    setPlayerName,
    requestedColor,
    setRequestedColor,
    errorMessage,
    isWakingServerNoticeVisible,
    isCreatingMatch: createMatchResult.isLoading,
    isLookingUpMatch: lookUpMatchResult.isFetching,
    isJoiningMatch: joinMatchResult.isLoading,
    isStartingMatch: startMatchResult.isLoading,
    handleCreateMatch,
    handleLookUpMatch,
    handleJoinMatch,
    handleStartMatch,
    handleChooseJoinExisting,
    handleBackToStart,
  };
};
