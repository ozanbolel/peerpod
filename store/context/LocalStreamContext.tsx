import * as React from "react";
import { ILocalStreamState, ILocalStreamAction, ILocalStreamContext } from "types";

const localStreamInitialState: ILocalStreamState = {
  localStream: null,
  meterStream: null,
  isMuted: false
};

const localStreamReducer = (state: ILocalStreamState, action: ILocalStreamAction) => {
  switch (action.type) {
    case "SET_LOCAL_STREAM":
      return Object.assign({}, state, {
        localStream: action.payload
      });

    case "SET_METER_STREAM":
      return Object.assign({}, state, {
        meterStream: action.payload
      });

    case "SET_IS_MUTED":
      return Object.assign({}, state, {
        isMuted: action.payload
      });

    case "RESET_STREAMS":
      return Object.assign({}, state, localStreamInitialState);

    default:
      return state;
  }
};

export const LocalStreamContext = React.createContext({} as ILocalStreamContext);

const LocalStreamContextProvider: React.FC = ({ children }) => {
  const [state, dispatch] = React.useReducer(localStreamReducer, localStreamInitialState);
  return <LocalStreamContext.Provider value={{ state, dispatch }}>{children}</LocalStreamContext.Provider>;
};

export default LocalStreamContextProvider;
