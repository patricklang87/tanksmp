import { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import IsTruthy from "../../components/common/logic/IsTruthy";
import { LuCopy } from "react-icons/lu";
import { LuCopyCheck } from "react-icons/lu";

const GameIdDisplay = ({ gameId }: { gameId: string }) => {
  const [copied, setCopied] = useState<boolean>(false);

  return (
    <IsTruthy value={!!gameId}>
      <div className="game-id-container">
        <div>
          <p>
            <strong>Game Id</strong>
            <br />
            {gameId}
          </p>
        </div>
        <div className="game-id-flex-item">
          <CopyToClipboard onCopy={() => setCopied(true)} text={gameId}>
            <button>{copied ? <LuCopyCheck /> : <LuCopy />}</button>
          </CopyToClipboard>
        </div>
      </div>
    </IsTruthy>
  );
};

export default GameIdDisplay;
