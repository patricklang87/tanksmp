import { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { LuCopy, LuCopyCheck } from "react-icons/lu";

const GameIdDisplay = ({ gameId }: { gameId: string }) => {
  const [copied, setCopied] = useState<boolean>(false);

  return (
    <div className="game-id-container">
      <div>
        <p>
          <strong>Match ID</strong>
          <br />
          {gameId}
        </p>
      </div>
      <div className="game-id-flex-item">
        <CopyToClipboard onCopy={() => setCopied(true)} text={gameId}>
          <button type="button" aria-label="Copy match ID">
            {copied ? <LuCopyCheck /> : <LuCopy />}
          </button>
        </CopyToClipboard>
      </div>
    </div>
  );
};

export default GameIdDisplay;
