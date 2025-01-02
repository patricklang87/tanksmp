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


  return (
    <>
      <h1 className="title-card">Tanks fer Nuthin'!</h1>

      <div className="form-outline">
        <input
          type="text"
          id="playerName"
          className="form-control"
          maxLength={8}
          onChange={(e) => setPlayerName(e.target.value)}
        /> 
        <br />
        <label className="form-label" htmlFor="playerName">
          Player Name
        </label>
      </div>
      <button
        onClick={() => console.log(playerName)}
      >
        Create New Game
      </button>


      <p>Game Code Will Go Here</p>


      {/* {invalidPlayerCount && (
        <p>Number of Players must be between 2 and {maxPlayerCount}.</p>
      )} */}
    </>
  );
};

export default StartScreen;
