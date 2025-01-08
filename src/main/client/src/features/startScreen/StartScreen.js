import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useStartScreenProps } from "./startScreenProps";
const StartScreen = () => {
    const { handleInitializeMatchClick, handleJoinMatchClick, data, isLoading, isSuccess, isError, error, setPlayerName, 
    // setRequestedColor,
    setGameId, } = useStartScreenProps();
    return (_jsxs(_Fragment, { children: [_jsx("h1", { className: "title-card", children: "Tanks fer Nuthin'!" }), _jsxs("form", { onSubmit: handleInitializeMatchClick, children: [_jsxs("label", { className: "form-label", htmlFor: "playerName", children: ["Player Name:", " "] }), _jsx("input", { type: "text", id: "playerName", className: "form-control", maxLength: 8, onChange: (e) => setPlayerName(e.target.value) }), _jsx("br", {}), _jsx("button", { type: "submit", disabled: isLoading, children: isLoading ? "Initializing..." : "Initialize Match" }), isSuccess && _jsxs("p", { children: ["Game Id: ", data.gameId] }), isError && _jsxs("p", { children: ["Error: ", error?.toString()] })] }), _jsx("br", {}), _jsx("p", { children: "*** OR ***" }), _jsx("br", {}), _jsxs("form", { onSubmit: handleJoinMatchClick, children: [_jsxs("label", { className: "form-label", htmlFor: "gameId", children: ["Game Id:", " "] }), _jsx("input", { type: "text", id: "gameId", className: "form-control", onChange: (e) => setGameId(e.target.value) }), _jsx("br", {}), _jsx("button", { type: "submit", disabled: isLoading, children: "Join Game" })] })] }));
};
export default StartScreen;
