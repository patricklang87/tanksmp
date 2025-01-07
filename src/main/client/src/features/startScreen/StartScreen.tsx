import { useState } from "react";
import {
  // useTestConnectionQuery,
  useInitializeMatchMutation
} from "../api/apiSlice";
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
  const handleInitializeMatchClick = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const res = await initializeMatch(JSON.stringify(playerName)).unwrap(); // Unwrap the promise for direct access to data or error
      console.log("response", res)
      setPlayerName('');
    } catch (err) {
      console.error('Failed to initialize match:', err);
    }
  
  }

  return (
    <>
      
      <h1 className="title-card">Tanks fer Nuthin'!</h1>
{/* {content} */}
      {/* <div className="form-outline">
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
      </button> */}


      <form onSubmit={handleInitializeMatchClick}>
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
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Initializing...' : 'Initialize Match'}
      </button>
      {isSuccess && <p>Match created successfully!</p>}
      {isError && <p>Error: {error.toString()}</p>}
    </form>


      <p>Game Code Will Go Here</p>


      {/* {invalidPlayerCount && (
        <p>Number of Players must be between 2 and {maxPlayerCount}.</p>
      )} */}
    </>
  );
};

export default StartScreen;
