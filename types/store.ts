import { IPeer, IPeerMessage } from "./peer";

// RTC

export interface IRTCState {
  isConnected: boolean;
  peers: IPeer[];
  messages: IPeerMessage[];
}

export type RTCActionType = "SET_IS_CONNECTED" | "ADD_PEER" | "REMOVE_PEER" | "ADD_MESSAGE" | "RESET_RTC";

export interface IRTCAction {
  type: RTCActionType;
  payload?: any;
}

export interface IRTCContext {
  state: IRTCState;
  dispatch: React.Dispatch<IRTCAction>;
}

// Local Stream

export interface ILocalStreamState {
  localStream: MediaStream | null;
  isMuted: boolean;
}

export type LocalStreamActionType = "SET_LOCAL_STREAM" | "SET_IS_MUTED" | "RESET_LOCAL_STREAM";

export interface ILocalStreamAction {
  type: LocalStreamActionType;
  payload?: any;
}

export interface ILocalStreamContext {
  state: ILocalStreamState;
  dispatch: React.Dispatch<ILocalStreamAction>;
}
