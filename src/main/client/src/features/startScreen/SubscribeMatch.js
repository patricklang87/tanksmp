import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
const SubscribeMatch = ({ handleSubscribeMatchClick, setGameId, gameId, }) => {
    return (_jsxs("form", { onSubmit: handleSubscribeMatchClick, children: [_jsxs("label", { className: "form-label", htmlFor: "gameId", children: ["Game Id:", " "] }), _jsx("input", { type: "text", id: "gameId", className: "form-control", onChange: (e) => setGameId(e.target.value) }), _jsx("br", {}), _jsx("button", { type: "submit", disabled: !gameId, children: "Join" })] }));
};
export default SubscribeMatch;
