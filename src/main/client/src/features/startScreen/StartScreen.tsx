import { useStartScreenProps } from "./startScreenProps";

const StartScreen = () => {
  const {
    handleInitializeMatchClick,
    handleJoinMatchClick,
    data,
    isLoading,
    isSuccess,
    isError,
    error,
    setPlayerName,
    // setRequestedColor,
    setGameId,
  } = useStartScreenProps();

  return (
    <>
      <h1 className="title-card">Tanks fer Nuthin'!</h1>

      <form onSubmit={handleInitializeMatchClick}>
      <label className="form-label" htmlFor="playerName">
          Player Name:{" "}
        </label>
        <input
          type="text"
          id="playerName"
          className="form-control"
          maxLength={8}
          onChange={(e) => setPlayerName(e.target.value)}
        />
        <br/>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Initializing..." : "Initialize Match"}
        </button>
        {isSuccess && <p>Game Id: {data.gameId}</p>}
        {isError && <p>Error: {error?.toString()}</p>}
      </form>
      <br />
      <p>*** OR ***</p>
      <br />
      <form onSubmit={handleJoinMatchClick}>
      <label className="form-label" htmlFor="gameId">
          Game Id:{" "}
        </label>
        <input
          type="text"
          id="gameId"
          className="form-control"
          onChange={(e) => setGameId(e.target.value)}
        />


          {/* <label className="form-label" htmlFor="requestedColor">
          Game Id:{" "}
        </label>
        <input
          type="text"
          id="gameId"
          className="form-control"
          onChange={() => setRequestedColor([10, 10, 10, 0])}
        /> */}
        <br/>
        <button type="submit" disabled={isLoading}>
          Join Game
        </button>
      </form>

    </>
  );
};

export default StartScreen;
