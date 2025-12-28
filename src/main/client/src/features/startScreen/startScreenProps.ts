import { useState, useEffect } from "react";
import {
  useLazyInitializeMatchQuery,
  useJoinMatchMutation,
  useLazySubscribeMatchQuery,
  useStartMatchMutation,
} from "../api/matchSlice";
import { useAppDispatch } from "../../redux/hooks";
import { setMatchId } from "../../redux/gameInfoRedux";
import { useLocation, useNavigate } from "react-router-dom";

export const useStartScreenProps = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState<string>("");
  const [requestedColor, setRequestedColor] = useState<number | null>(null);
  const [gameId, setGameId] = useState<string>("");
  const [isGameCreator, setIsGameCreator] = useState<boolean>(false);
  const [selectedPage, setSelectedPage] = useState(1);
  const [joinedMatch, setJoinedMatch] = useState(false);
  const dispatch = useAppDispatch();

  const [initializeMatch, { isLoading, isSuccess, isError, error }] =
    useLazyInitializeMatchQuery();
  const [subscribeMatch, { data }] = useLazySubscribeMatchQuery();
  const [joinMatch] = useJoinMatchMutation();
  const [startMatch] = useStartMatchMutation();

  const gameStatus = data?.gameStatus;

  useEffect(() => {
    console.log("gameStatus", gameStatus)
    if (gameStatus === "IN_PROGRESS" && location.pathname !== "/match") {
      navigate("/match");
    }
  }, [gameStatus, location.pathname, navigate]);

  const handleInitializeMatchClick = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    try {
      const res = await initializeMatch("null").unwrap();
      console.log("initialize", res, res.gameId);
      setPlayerName("");
      setGameId(res?.gameId);
      setSelectedPage(3);
      setIsGameCreator(true);
    } catch (err) {
      console.error("Failed to initialize match:", err);
    }
  };

  const handleSubscribeMatchClick = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    // update and replace with subscribe match
    try {
      const res = await subscribeMatch(gameId);
      console.log("subscribe", res.data);
      dispatch(setMatchId(res.data.gameId));
      setSelectedPage(4);
    } catch (err) {
      console.error("Failed to subscribe to match", err);
    }
  };

  const handleJoinMatchClick = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await joinMatch({
        playerName,
        gameId,
        requestedColor,
      }).unwrap();
      console.log("join", res);
      setJoinedMatch(true);
    } catch (err) {
      console.error("Failed to join match", err);
    }
  };

  const handleStartMatchClick = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await startMatch(data.gameId).unwrap();
      console.log("start", res);
    } catch (err) {
      console.error("Failed to join match", err);
    }
  };

  return {
    handleInitializeMatchClick,
    handleJoinMatchClick,
    handleSubscribeMatchClick,
    handleStartMatchClick,
    data,
    isLoading,
    isSuccess,
    isError,
    error,
    setPlayerName,
    setGameId,
    setRequestedColor,
    requestedColor,
    playerName,
    gameId,
    isGameCreator,
    selectedPage,
    setSelectedPage,
    joinedMatch,
  };
};
