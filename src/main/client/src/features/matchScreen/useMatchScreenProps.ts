import { useEffect } from "react";
import { useGetMatchQuery } from "../api/matchSlice";
import { useNavigate } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";
import { useAppSelector } from "../../redux/hooks";
import { selectMatchId } from "../../redux/sessionSlice";

const useMatchScreenProps = () => {
  const matchId = useAppSelector(selectMatchId);
  const navigate = useNavigate();

  const { data, isError } = useGetMatchQuery(matchId ?? skipToken);
  const gameStatus = data?.gameStatus;

  // Send players back to the lobby when there is no match to show. While the match is still
  // loading after a refresh there is nothing to decide yet.
  useEffect(() => {
    const matchIsNotRunning = gameStatus === "NEW";
    if (!matchId || isError || matchIsNotRunning) {
      navigate("/");
    }
  }, [matchId, isError, gameStatus, navigate]);

  return { data };
};

export default useMatchScreenProps;
