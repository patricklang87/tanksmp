import { useState } from "react";
import {
  useInitializeMatchMutation,
  useJoinMatchMutation,
} from "../api/apiSlice";

export const useStartScreenProps = () => {
  const [playerName, setPlayerName] = useState<string>("");
  const [requestedColor, setRequestedColor] = useState<number | null>(null);
  const [gameId, setGameId] = useState<string>("");
  const [createNewMatch, setCreateNewMatch] = useState<boolean>(true);

  const [initializeMatch, { data, isLoading, isSuccess, isError, error }] =
    useInitializeMatchMutation();
  const [joinMatch] = useJoinMatchMutation();

  const handleInitializeMatchClick = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    try {
      const res = await initializeMatch({ playerName, requestedColor }).unwrap();
      console.log("initialize", res);
      setPlayerName("");
    } catch (err) {
      console.error("Failed to initialize match:", err);
    }
  };

  const handleJoinMatchClick = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await joinMatch({ playerName, gameId, requestedColor });
      console.log("join", res.data);
    } catch (err) {
      console.error("Failed to join match", err);
    }
  };

  return {
    handleInitializeMatchClick,
    handleJoinMatchClick,
    data,
    isLoading,
    isSuccess,
    isError,
    error,
    setPlayerName,
    setGameId,
    setRequestedColor,
    requestedColor,
    createNewMatch,
    setCreateNewMatch,
  };
};
