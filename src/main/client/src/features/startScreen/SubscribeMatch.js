import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import GameIdDisplay from "./GameIdDisplay";
import IsFalsy from "../../components/common/logic/IsFalsy";
import IsTruthy from "../../components/common/logic/IsTruthy";
const SubscribeMatch = ({ handleSubscribeMatchClick, setGameId, gameId, isGameCreator, }) => {
    return (_jsxs(_Fragment, { children: [_jsx(IsTruthy, { value: isGameCreator, children: _jsx(GameIdDisplay, { gameId: gameId }) }), _jsxs("form", { onSubmit: handleSubscribeMatchClick, children: [_jsx(IsFalsy, { value: isGameCreator, children: _jsxs("div", { children: [_jsxs("label", { className: "form-label", htmlFor: "gameId", children: ["Game Id:", " "] }), _jsx("input", { type: "text", id: "gameId", className: "form-control", onChange: (e) => setGameId(e.target.value) })] }) }), _jsx("br", {}), _jsx("button", { type: "submit", disabled: !gameId, children: isGameCreator ? "Continue" : "Subscribe" })] })] }));
};
export default SubscribeMatch;
