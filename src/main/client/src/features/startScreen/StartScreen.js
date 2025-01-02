import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
// import { initiateGame } from "../gameDisplay/gameControls";
// import { useAppDispatch } from "../../redux/hooks";
// import { tankColor } from "../../constants";
const StartScreen = () => {
    const [playerName, setPlayerName] = useState("");
    // const onCreateGameClicked = async () => {
    //   console.log("create game clicked:", playerName)
    //     try {
    //       await createNewGame({ playerName }).unwrap();
    //       setPlayerName("");
    //     } catch (err) {
    //       console.error("Failed to create new game", err);
    //     } 
    // };
    return (_jsxs(_Fragment, { children: [_jsx("h1", { className: "title-card", children: "Tanks fer Nuthin'!" }), _jsxs("div", { className: "form-outline", children: [_jsx("input", { type: "text", id: "playerName", className: "form-control", maxLength: 8, onChange: (e) => setPlayerName(e.target.value) }), _jsx("br", {}), _jsx("label", { className: "form-label", htmlFor: "playerName", children: "Player Name" })] }), _jsx("button", { onClick: () => console.log(playerName), children: "Create New Game" }), _jsx("p", { children: "Game Code Will Go Here" })] }));
};
export default StartScreen;
