import { isTruthy } from "../../../util/evaluate";

const IsFalsy = ({
  value,
  validationFunction = isTruthy,
  children,
}: {
  value: string | number | boolean;
  validationFunction?: (value: string | number | boolean) => boolean | null;
  children: React.ReactNode;
}) => {
  return validationFunction(value) ? null : children;
};

export default IsFalsy;