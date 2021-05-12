import * as React from "react";
import { cns } from "utils";
import css from "./Icon.module.scss";

interface IIconProps {
  name: string;
  className?: string;
}

export const Icon: React.FC<IIconProps> = ({ name, className }) => {
  const href = "/icons.svg#" + name;

  return (
    <svg className={cns([css.icon, className])}>
      <use href={href} xlinkHref={href} />
    </svg>
  );
};
