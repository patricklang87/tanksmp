import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import GameIdDisplay from "./GameIdDisplay";
export default function CreateNewMatch({ handleInitializeMatchClick, isLoading, data, isError, error, }) {
    return (_jsxs(_Fragment, { children: [_jsx("form", { onSubmit: handleInitializeMatchClick, children: _jsxs("button", { type: "submit", disabled: data?.gameId, children: [isLoading ? "Initializing..." : "Create", isError && _jsxs("p", { children: ["Error: ", error?.toString()] })] }) }), _jsx(GameIdDisplay, { gameId: data?.gameId })] }));
}
