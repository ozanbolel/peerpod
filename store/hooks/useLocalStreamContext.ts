import * as React from "react";
import { LocalStreamContext } from "store/context/LocalStreamContext";

export const useLocalStreamContext = () => {
  const context = React.useContext(LocalStreamContext);

  return context;
};
