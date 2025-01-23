import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
export default function CreateNewMatch({ handleInitializeMatchClick, isLoading, isError, error, }) {
    return (_jsx(_Fragment, { children: _jsx("form", { onSubmit: handleInitializeMatchClick, children: _jsxs("button", { type: "submit", children: [isLoading ? "Initializing..." : "Create New Match", isError && _jsxs("p", { children: ["Error: ", error?.toString()] })] }) }) }));
}
