import { useEffect } from "react";
import { useSubscribeMatchQuery } from "../api/matchSlice";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../redux/hooks";
import { selectMatchId } from "../../redux/gameInfoRedux";

const useMatchScreenProps = () => {
  const matchId = useAppSelector(selectMatchId);
  console.log("matchid", matchId);

  const { data } = useSubscribeMatchQuery(matchId);
  const { gameStatus } = data;

  console.log("in match screen", data);
  const navigate = useNavigate();

  useEffect(() => {
    if (!data || !matchId || gameStatus !== "IN_PROGRESS") {
      navigate("/");
    }
  }, [data]);

  return { data };
};

export default useMatchScreenProps;
