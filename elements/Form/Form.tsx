import * as React from "react";
import { Input } from "elements/Input/Input";
import { Button } from "elements/Button/Button";

interface IFormProps {
  className?: string;
  onSubmit?: Function;
}

type Form = React.FC<IFormProps> & {
  Input: typeof Input;
  Button: typeof Button;
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
Form.Button = Button;
