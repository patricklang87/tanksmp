import React from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import IsTruthy from "../../components/common/logic/IsTruthy";

const GameIdDisplay = ({ gameId }: { gameId: string }) => {
  return (
    <IsTruthy value={!!gameId}>
      <CopyToClipboard onCopy={() => console.log("copied: ", gameId)} text={gameId}>
        <>
          {" "}
          <p>
            <strong>Joining Game:</strong> {gameId}
          </p>
          <button>Copy Game ID</button>
        </>
      </CopyToClipboard>
    </IsTruthy>
  );
};

export default GameIdDisplay;
