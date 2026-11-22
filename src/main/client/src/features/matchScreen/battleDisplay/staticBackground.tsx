import Canvas from "../../../components/common/canvas/canvas"
import { canvasConstants, colorSchemes } from "../../../constants"
import { ColorScheme } from "../../../types";
import { useAppSelector } from "../../../redux/hooks";
import { selectMatchId } from "../../../redux/sessionSlice";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetMatchQuery } from "../../api/matchSlice";

const StaticBackground = () => {
  const matchId = useAppSelector(selectMatchId);
  const { data } = useGetMatchQuery(matchId ?? skipToken);
  const colorScheme = data?.colorSchema;

  const drawStaticBackground = (
    ctx: CanvasRenderingContext2D,
    rectDims: { lineWidth?: number }
  ) => {
    const { lineWidth = 1 } = rectDims;
    if (!colorScheme) return;
    const settingColors: ColorScheme = colorSchemes[colorScheme];
    ctx.lineWidth = lineWidth;
    const skyGrad=ctx.createLinearGradient(0, canvasConstants.height, 0,0);
    skyGrad.addColorStop(0, settingColors.lowSkyColor);
    skyGrad.addColorStop(1, settingColors.skyColor);
    ctx.fillStyle = skyGrad;
    ctx.strokeStyle = skyGrad;
    ctx.fillRect(0, 0, canvasConstants.width, canvasConstants.height);
  };

  return <Canvas staticShapes={drawStaticBackground} />;
};

export default StaticBackground;
