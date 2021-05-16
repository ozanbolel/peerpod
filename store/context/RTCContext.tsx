import * as React from "react";
import { IRTCState, IRTCAction, IRTCContext } from "types";

const rtcInitialState: IRTCState = {
  isConnected: false,
  peers: [],
  messages: [],
  songQueue: undefined,
  songIndex: 0
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

    case "ADD_MESSAGE":
      return Object.assign({}, state, {
        messages: [...state.messages, action.payload]
      });

    case "SET_SONG_QUEUE":
      return Object.assign({}, state, {
        songQueue: action.payload,
        songIndex: 0
      });

    case "SET_SONG_INDEX":
      return Object.assign({}, state, {
        songIndex: action.payload
      });

    case "SKIP_SONG":
      return Object.assign({}, state, {
        songIndex: state.songQueue
          ? Math.min(state.songIndex + 1, state.songQueue.length - 1)
          : state.songIndex
      });

    case "ADD_SONG":
      return Object.assign({}, state, {
        songQueue: state.songQueue
          ? [...state.songQueue, action.payload]
          : [action.payload]
      });

    case "RESET_RTC":
      return rtcInitialState;

    default:
      return state;
  }
};

export const RTCContext = React.createContext({} as IRTCContext);

const RTCContextProvider: React.FC = ({ children }) => {
  const [state, dispatch] = React.useReducer(rtcReducer, rtcInitialState);
  return (
    <RTCContext.Provider value={{ state, dispatch }}>
      {children}
    </RTCContext.Provider>
  );
};

export default RTCContextProvider;
