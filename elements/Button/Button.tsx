import * as React from "react";
import { cns, playFeedback } from "utils";
import css from "./Button.module.scss";

export interface IButtonProps {
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
  label: string;
  className?: string;
  onClick?: Function;
  active?: boolean;
  disabled?: boolean;
  noSound?: boolean;
}

export const Button: React.FC<IButtonProps> = ({
  type,
  label,
  className,
  onClick,
  active,
  disabled,
  noSound
}) => {
  const handleOnClick = () => {
    if (!noSound) playFeedback("pop");
    if (onClick) onClick();
  };

  return (
    <button
      type={type}
      className={cns([css.button, className, [css.active, active]])}
      onClick={handleOnClick}
      disabled={disabled}
    >
      <span>{label}</span>
    </button>
  );
};
