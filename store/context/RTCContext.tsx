import * as React from "react";
import { IRTCState, IRTCAction, IRTCContext } from "types";

const rtcInitialState: IRTCState = {
  isConnected: false,
  peers: [],
  messages: []
};

const rtcReducer = (state: IRTCState, action: IRTCAction) => {
  switch (action.type) {
    case "SET_IS_CONNECTED":
      return Object.assign({}, state, {
        isConnected: action.payload
      });

    case "ADD_PEER":
      return Object.assign({}, state, {
        peers: [...state.peers, action.payload]
      });

    case "REMOVE_PEER":
      return Object.assign({}, state, {
        peers: state.peers.filter((peer) => peer.id !== action.payload)
      });

    case "RESET_PEERS":
      return Object.assign({}, state, {
        peers: rtcInitialState.peers
      });

    case "ADD_MESSAGE":
      return Object.assign({}, state, {
        messages: [...state.messages, action.payload]
      });

    default:
      return state;
  }
};

export const RTCContext = React.createContext({} as IRTCContext);

const RTCContextProvider: React.FC = ({ children }) => {
  const [state, dispatch] = React.useReducer(rtcReducer, rtcInitialState);
  return <RTCContext.Provider value={{ state, dispatch }}>{children}</RTCContext.Provider>;
};

export default RTCContextProvider;
