import * as React from "react";
import { cns, playFeedback } from "tools";
import css from "./Button.module.scss";

interface IButtonProps {
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
  label: string;
  className?: string;
  onClick?: Function;
  active?: boolean;
  disabled?: boolean;
}

export const Button: React.FC<IButtonProps> = ({ type, label, className, onClick, active, disabled }) => {
  const handleOnClick = () => {
    playFeedback("pop");
    if (onClick) onClick();
  };

  return (
    <button type={type} className={cns([css.button, className, [css.active, active]])} onClick={handleOnClick} disabled={disabled}>
      <span>{label}</span>
    </button>
  );
};
