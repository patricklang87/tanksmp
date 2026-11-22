import { useLobby } from "./useLobby";
import CreateOrJoin from "./CreateOrJoin";
import EnterMatchId from "./EnterMatchId";
import JoinMatch from "./JoinMatch";
import WaitingRoom from "./WaitingRoom";
import ErrorMessage from "./ErrorMessage";
import WakingServerNotice from "./WakingServerNotice";
import { GAME_TITLE } from "../../constants";
import "./startScreen.css";

const StartScreen = () => {
  const lobby = useLobby();

  return (
    <>
      <h1 className="title-card">{GAME_TITLE}</h1>
      <p className="subtitle">Turn-based artillery duels for up to six players</p>

      {lobby.isWakingServerNoticeVisible && <WakingServerNotice />}
      <ErrorMessage message={lobby.errorMessage} />

      <div className="lobby-card">
        {lobby.step === "chooseMode" && (
          <CreateOrJoin
            onCreateMatch={lobby.handleCreateMatch}
            onChooseJoinExisting={lobby.handleChooseJoinExisting}
            isCreating={lobby.isCreatingMatch}
          />
        )}

        {lobby.step === "enterMatchId" && (
          <EnterMatchId
            matchIdInput={lobby.matchIdInput}
            onMatchIdInputChange={lobby.setMatchIdInput}
            onSubmit={lobby.handleLookUpMatch}
            onBack={lobby.handleBackToStart}
            isLookingUp={lobby.isLookingUpMatch}
          />
        )}

        {lobby.step === "joinMatch" && lobby.matchId && (
          <JoinMatch
            matchId={lobby.matchId}
            claimedColors={lobby.game?.claimedColors}
            playerName={lobby.playerName}
            onPlayerNameChange={lobby.setPlayerName}
            requestedColor={lobby.requestedColor}
            onRequestedColorChange={lobby.setRequestedColor}
            onSubmit={lobby.handleJoinMatch}
            onBack={lobby.handleBackToStart}
            isJoining={lobby.isJoiningMatch}
          />
        )}

        {lobby.step === "waitingRoom" && lobby.game && (
          <WaitingRoom
            game={lobby.game}
            ownPlayerIndex={lobby.playerIndex}
            isHost={lobby.isHost}
            onStartMatch={lobby.handleStartMatch}
            isStarting={lobby.isStartingMatch}
          />
        )}
      </div>
    </>
  );
};

export default StartScreen;
