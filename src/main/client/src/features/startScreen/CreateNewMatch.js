import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
export default function CreateNewMatch({ handleInitializeMatchClick, setPlayerName, isLoading, isSuccess, data, isError, error, playerName, requestedColor, }) {
    let disableCreateButton = false;
    if (playerName.length < 3 || !(typeof requestedColor === "number") || isLoading) {
        disableCreateButton = true;
    }
    return (_jsxs("form", { onSubmit: handleInitializeMatchClick, children: [_jsxs("label", { className: "form-label", htmlFor: "playerName", children: ["Player Name:", " "] }), _jsx("input", { type: "text", id: "playerName", className: "form-control", maxLength: 8, onChange: (e) => setPlayerName(e.target.value) }), _jsx("br", {}), _jsx("button", { type: "submit", disabled: disableCreateButton, children: isLoading ? "Initializing..." : "Create" }), isSuccess && _jsxs("p", { children: ["Game Id: ", data.gameId] }), isError && _jsxs("p", { children: ["Error: ", error?.toString()] })] }));
}
