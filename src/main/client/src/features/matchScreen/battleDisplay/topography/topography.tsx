import Canvas from "../../../../components/common/canvas/canvas"
import { colorSchemes } from "../../../../constants"
import { drawTopography } from "./topographyProps";
import { skipToken } from "@reduxjs/toolkit/query";
import { useAppSelector } from "../../../../redux/hooks";
import { selectMatchId } from "../../../../redux/sessionSlice";
import { useGetMatchQuery } from "../../../api/matchSlice";

const Topography = () => {
  const matchId = useAppSelector(selectMatchId);
  const { data } = useGetMatchQuery(matchId ?? skipToken);
  if (!data) return null;
  const { topography, colorSchema } = data;
  const colors = colorSchemes[colorSchema as keyof typeof colorSchemes];

  return <Canvas staticShapes={drawTopography} customProps={{ topography, colors}} />;
};

export default Topography;
