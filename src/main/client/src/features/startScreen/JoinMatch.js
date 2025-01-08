import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
const JoinMatch = ({ handleJoinMatchClick, setGameId, setPlayerName }) => {
    return (_jsxs("form", { onSubmit: handleJoinMatchClick, children: [_jsxs("label", { className: "form-label", htmlFor: "playerName", children: ["Player Name:", " "] }), _jsx("input", { type: "text", id: "playerName", className: "form-control", maxLength: 8, onChange: (e) => setPlayerName(e.target.value) }), _jsx("br", {}), _jsxs("label", { className: "form-label", htmlFor: "gameId", children: ["Game Id:", " "] }), _jsx("input", { type: "text", id: "gameId", className: "form-control", onChange: (e) => setGameId(e.target.value) }), _jsx("br", {}), _jsx("button", { type: "submit", children: "Join" })] }));
};
export default JoinMatch;
