import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import SelectTankColor from "./SelectTankColor";
import GameIdDisplay from "./GameIdDisplay";
import IsFalsy from "../../components/common/logic/IsFalsy";
import IsTruthy from "../../components/common/logic/IsTruthy";
const JoinMatch = ({ handleJoinMatchClick, handleStartMatchClick, setPlayerName, playerName, requestedColor, gameId, data, setRequestedColor, joinedMatch, isGameCreator, }) => {
    let disableJoinButton = false;
    if (playerName.length < 3 ||
        !(typeof requestedColor === "number") ||
        !gameId.length) {
        disableJoinButton = true;
    }
    return (_jsxs(_Fragment, { children: [_jsx(GameIdDisplay, { gameId: data?.gameId }), _jsx(SelectTankColor, { data: data, setRequestedColor: setRequestedColor, requestedColor: requestedColor }), _jsx(IsFalsy, { value: joinedMatch, children: _jsxs("form", { onSubmit: handleJoinMatchClick, children: [_jsxs("label", { className: "form-label", htmlFor: "playerName", children: [_jsx("strong", { children: "Enter Player Name" }), _jsx("br", {})] }), _jsx("input", { type: "text", id: "playerName", className: "form-control", maxLength: 8, onChange: (e) => setPlayerName(e.target.value) }), _jsx("br", {}), _jsx("button", { type: "submit", disabled: disableJoinButton, children: "Join" })] }) }), _jsxs(IsTruthy, { value: joinedMatch, children: [_jsx(IsFalsy, { value: isGameCreator, children: _jsx("p", { children: "Awaiting match start..." }) }), _jsx(IsTruthy, { value: isGameCreator, children: _jsx("form", { onSubmit: handleStartMatchClick, children: _jsx("button", { type: "submit", children: "Start Game" }) }) })] })] }));
};
export default JoinMatch;
