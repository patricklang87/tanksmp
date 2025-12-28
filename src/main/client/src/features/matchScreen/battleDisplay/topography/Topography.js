import { jsx as _jsx } from "react/jsx-runtime";
import Canvas from "../../../../components/common/canvas/canvas";
import { colorSchemes } from "../../../../constants";
import { drawTopography } from "./topographyProps";
import { useAppSelector } from "../../../../redux/hooks";
import { selectMatchId } from "../../../../redux/gameInfoRedux";
import { useSubscribeMatchQuery } from "../../../api/matchSlice";
const Topography = () => {
    const matchId = useAppSelector(selectMatchId);
    const { data } = useSubscribeMatchQuery(matchId);
    const { topography, colorSchema } = data;
    const colors = colorSchemes[colorSchema];
    console.log("in topography", topography);
    return _jsx(Canvas, { staticShapes: drawTopography, customProps: { topography, colors } });
};
export default Topography;
