import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import useMatchScreenProps from "./useMatchScreenProps";
import BattleDisplay from "./battleDisplay/BattleDIsplay";
const MatchScreen = () => {
    const { data } = useMatchScreenProps();
    console.log("match screen data", data);
    return _jsxs(_Fragment, { children: [_jsx("p", { children: "Match Display" }), _jsx(BattleDisplay, {})] });
};
export default MatchScreen;
