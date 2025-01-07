import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { 
// useTestConnectionQuery,
useInitializeMatchMutation } from "../api/apiSlice";
// import { initiateGame } from "../gameDisplay/gameControls";
// import { useAppDispatch } from "../../redux/hooks";
// import { tankColor } from "../../constants";
const StartScreen = () => {
    const [playerName, setPlayerName] = useState("");
    // const {
    //   data: message,
    //   isLoading,
    //   isSuccess,
    //   isError,
    //   error
    // } = useTestConnectionQuery({});
    // let content;
    // if (isLoading) {
    //   content = <p>... Loading ...</p>
    // } else if (isSuccess) {
    //   content = JSON.stringify(message)
    // } else if (isError) {
    //   content = <p>{error.toString()}</p>
    // } else {
    //   content = <p>something here</p>
    // }
    const [initializeMatch, { isLoading, isSuccess, isError, error }] = useInitializeMatchMutation();
    const handleInitializeMatchClick = async (e) => {
        e.preventDefault();
        try {
            const res = await initializeMatch(JSON.stringify(playerName)).unwrap(); // Unwrap the promise for direct access to data or error
            console.log("response", res);
            setPlayerName('');
        }
        catch (err) {
            console.error('Failed to initialize match:', err);
        }
    };
    return (_jsxs(_Fragment, { children: [_jsx("h1", { className: "title-card", children: "Tanks fer Nuthin'!" }), _jsxs("form", { onSubmit: handleInitializeMatchClick, children: [_jsx("input", { type: "text", id: "playerName", className: "form-control", maxLength: 8, onChange: (e) => setPlayerName(e.target.value) }), _jsx("br", {}), _jsx("label", { className: "form-label", htmlFor: "playerName", children: "Player Name" }), _jsx("button", { type: "submit", disabled: isLoading, children: isLoading ? 'Initializing...' : 'Initialize Match' }), isSuccess && _jsx("p", { children: "Match created successfully!" }), isError && _jsxs("p", { children: ["Error: ", error.toString()] })] }), _jsx("p", { children: "Game Code Will Go Here" })] }));
};
export default StartScreen;
