import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import CreateNewMatch from "./CreateNewMatch";
const CreateOrJoin = ({ setSelectedPage, isError, isSuccess, isLoading, error, handleInitializeMatchClick, }) => {
    return (_jsxs("div", { children: [_jsx(CreateNewMatch, { isError: isError, isSuccess: isSuccess, isLoading: isLoading, error: error, handleInitializeMatchClick: handleInitializeMatchClick }), _jsx("button", { onClick: () => setSelectedPage(3), children: "Join Existing Match" })] }));
};
export default CreateOrJoin;
