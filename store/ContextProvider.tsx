import * as React from "react";
import RTCContextProvider from "./context/RTCContext";
import LocalStreamContextProvider from "./context/LocalStreamContext";

const ContextProvider: React.FC = ({ children }) => {
  return (
    <RTCContextProvider>
      <LocalStreamContextProvider>{children}</LocalStreamContextProvider>
    </RTCContextProvider>
  );
};

export default ContextProvider;
