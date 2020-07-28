import * as React from "react";
import { RTCContext } from "store/context/RTCContext";

export const useRTCContext = () => {
  const context = React.useContext(RTCContext);

  return context;
};
