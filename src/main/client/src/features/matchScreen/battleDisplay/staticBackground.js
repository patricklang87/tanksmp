import { jsx as _jsx } from "react/jsx-runtime";
import Canvas from "../../../components/common/canvas/canvas";
import { canvasConstants, colorSchemes } from "../../../constants";
import { useAppSelector } from "../../../redux/hooks";
import { selectMatchId } from "../../../redux/gameInfoRedux";
import { useSubscribeMatchQuery } from "../../api/matchSlice";
const StaticBackground = () => {
    const matchId = useAppSelector(selectMatchId);
    const { data } = useSubscribeMatchQuery(matchId);
    const colorScheme = data.colorSchema;
    console.log("in static background", colorScheme, data);
    const drawStaticBackground = (ctx, rectDims) => {
        const { lineWidth = 1 } = rectDims;
        const settingColors = colorSchemes[colorScheme];
        ctx.lineWidth = lineWidth;
        const skyGrad = ctx.createLinearGradient(0, canvasConstants.height, 0, 0);
        skyGrad.addColorStop(0, settingColors.lowSkyColor);
        skyGrad.addColorStop(1, settingColors.skyColor);
        ctx.fillStyle = skyGrad;
        ctx.strokeStyle = skyGrad;
        ctx.fillRect(0, 0, canvasConstants.width, canvasConstants.height);
    };
    return _jsx(Canvas, { staticShapes: drawStaticBackground });
};
export default StaticBackground;
