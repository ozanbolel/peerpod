import * as React from "react";
import { cns } from "utils";
import css from "./Input.module.scss";

interface IInputProps {
  ref?: React.RefObject<HTMLInputElement>;
  type?: React.InputHTMLAttributes<HTMLInputElement>["type"];
  className?: string;
  controller?: [any, React.Dispatch<React.SetStateAction<any>>];
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  length?: number;
  min?: number;
  max?: number;
  required?: boolean;
}

export const Input: React.FC<IInputProps> = ({
  ref,
  type,
  className,
  controller,
  placeholder,
  minLength,
  maxLength,
  length,
  min,
  max,
  required
}) => {
  const state = controller ? controller[0] : undefined;
  const setState = controller ? controller[1] : undefined;

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (setState) setState(event.target.value);
  };

  return (
    <input
      ref={ref}
      type={type}
      className={cns([css.input, className])}
      value={state}
      onChange={handleOnChange}
      placeholder={placeholder}
      minLength={length ? length : minLength}
      maxLength={length ? length : maxLength}
      min={min}
      max={max}
      required={required}
    />
  );
};
