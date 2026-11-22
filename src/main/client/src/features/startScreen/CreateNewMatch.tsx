const CreateNewMatch = ({
  onCreateMatch,
  isCreating,
}: {
  onCreateMatch: () => Promise<void>;
  isCreating: boolean;
}) => (
  <button type="button" className="button-primary" onClick={onCreateMatch} disabled={isCreating}>
    {isCreating ? "Creating..." : "Create New Match"}
  </button>
);

export default CreateNewMatch;
