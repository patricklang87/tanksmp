const ErrorMessage = ({ message }: { message: string | null }) =>
  message ? (
    <p className="lobby-error" role="alert">
      {message}
    </p>
  ) : null;

export default ErrorMessage;
