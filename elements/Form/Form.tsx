import * as React from "react";
import { Input } from "elements/Input/Input";
import { Button, IButtonProps } from "elements/Button/Button";

interface IFormProps {
  className?: string;
  onSubmit?: Function;
}

type Form = React.FC<IFormProps> & {
  Input: typeof Input;
  Submit: typeof Button;
};

export const Form: Form = ({ children, className, onSubmit }) => {
  return (
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        if (onSubmit) onSubmit();
      }}
    >
      {children}
    </form>
  );
};

Form.Input = Input;
Form.Submit = (props: IButtonProps) => <Button type="submit" {...props} />;
