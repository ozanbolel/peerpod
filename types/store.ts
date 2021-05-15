import { IPeer, IPeerMessage, ISongInfo } from "./peer";

// RTC

export interface IRTCState {
  isConnected: boolean;
  peers: IPeer[];
  messages: IPeerMessage[];
  songQueue: ISongInfo[] | undefined;
  songIndex: number;
}

export type RTCActionType =
  | "SET_IS_CONNECTED"
  | "ADD_PEER"
  | "REMOVE_PEER"
  | "ADD_MESSAGE"
  | "SET_SONG_QUEUE"
  | "SET_SONG_INDEX"
  | "RESET_RTC";

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

export type LocalStreamActionType =
  | "SET_LOCAL_STREAM"
  | "SET_IS_MUTED"
  | "RESET_LOCAL_STREAM";

export interface ILocalStreamAction {
  type: LocalStreamActionType;
  payload?: any;
}

export interface ILocalStreamContext {
  state: ILocalStreamState;
  dispatch: React.Dispatch<ILocalStreamAction>;
}
