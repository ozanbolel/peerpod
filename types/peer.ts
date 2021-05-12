export interface IPeerCore {
  id: string;
}

export interface IPeerProfile extends IPeerCore {
  nickname: string;
}

export interface IPeer extends IPeerProfile {
  connection: RTCPeerConnection;
}

export interface IPeerOffer extends IPeerProfile {
  offer: RTCSessionDescriptionInit;
}

export interface IPeerAnswer extends IPeerCore {
  answer: RTCSessionDescriptionInit;
}

export interface IPeerCandidate extends IPeerCore {
  candidate: RTCIceCandidateInit;
}

export interface IPeerMessageData {
  nickname: IPeerProfile["nickname"];
  message: string;
}

export interface IPeerMessage extends IPeerMessageData {
  id: string;
}

export interface ISongInfo {
  title: string;
  url: string;
}
