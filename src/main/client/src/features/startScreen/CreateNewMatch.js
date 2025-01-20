import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function CreateNewMatch({ handleInitializeMatchClick, isLoading, isSuccess, data, isError, error, }) {
    return (_jsxs("form", { onSubmit: handleInitializeMatchClick, children: [_jsx("button", { type: "submit", children: isLoading ? "Initializing..." : "Create" }), isSuccess && _jsxs("p", { children: ["Game Id: ", data.gameId] }), isError && _jsxs("p", { children: ["Error: ", error?.toString()] })] }));
}
