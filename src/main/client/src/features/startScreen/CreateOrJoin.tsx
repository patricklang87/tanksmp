import CreateNewMatch from "./CreateNewMatch";

const CreateOrJoin = ({
  onCreateMatch,
  onChooseJoinExisting,
  isCreating,
}: {
  onCreateMatch: () => Promise<void>;
  onChooseJoinExisting: () => void;
  isCreating: boolean;
}) => (
  <div>
    <CreateNewMatch onCreateMatch={onCreateMatch} isCreating={isCreating} />
    <button type="button" onClick={onChooseJoinExisting}>
      Join Existing Match
    </button>
  </div>
);

export default CreateOrJoin;
