import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import SelectTankColor from "./SelectTankColor";
import GameIdDisplay from "./GameIdDisplay";
const JoinMatch = ({ handleJoinMatchClick, setPlayerName, playerName, requestedColor, gameId, data, setRequestedColor, }) => {
    let disableJoinButton = false;
    if (playerName.length < 3 ||
        !(typeof requestedColor === "number") ||
        !gameId.length) {
        disableJoinButton = true;
    }
    return (_jsxs(_Fragment, { children: [_jsx(GameIdDisplay, { gameId: data?.gameId }), _jsx(SelectTankColor, { data: data, setRequestedColor: setRequestedColor, requestedColor: requestedColor }), _jsxs("form", { onSubmit: handleJoinMatchClick, children: [_jsxs("label", { className: "form-label", htmlFor: "playerName", children: ["Player Name:", " "] }), _jsx("input", { type: "text", id: "playerName", className: "form-control", maxLength: 8, onChange: (e) => setPlayerName(e.target.value) }), _jsx("br", {}), _jsx("button", { type: "submit", disabled: disableJoinButton, children: "Join" })] })] }));
};
export default JoinMatch;
