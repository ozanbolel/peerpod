import * as React from "react";
import { io } from "socket.io-client";
import { useRTCContext } from "store";
import { serverUrl, rtcConfig, rtcOfferOptions } from "config";
import {
  IPeerCore,
  IPeerProfile,
  IPeerOffer,
  IPeerAnswer,
  IPeerCandidate,
  ILocalStreamState,
  IPeerMessageData,
  ISongInfo,
  ISongSyncInfo
} from "types";
import { generateId } from "./generateId";
import { useInterval } from "./useInterval";

export const useRTC = (
  roomId: string,
  nickname: string,
  startLocalStream: () => Promise<void>,
  localStream: ILocalStreamState["localStream"],
  stopLocalStream: Function
) => {
  const socket = React.useRef(io(serverUrl, { autoConnect: false })).current;
  const refSongAudio = React.useRef<HTMLAudioElement>(null);
  const { state, dispatch } = useRTCContext();

  // Connection

  const connect = () => {
    if (!state.isConnected) {
      startLocalStream()
        .then(() => {
          dispatch({ type: "SET_IS_CONNECTED", payload: true });
          if (!socket.connected) socket.open();
          setTimeout(() => {
            socket.emit("discover", { roomId });
          }, 500);
          setTimeout(() => {
            socket.emit("song-request-sync");
          }, 1000);
        })
        .catch(() => {});
    }
  };

  const disconnect = () => {
    socket.close();
    stopLocalStream();

    dispatch({ type: "RESET_RTC" });
  };

  // Keep Server Awake

  useInterval(() => {
    socket.emit("ping");
  }, 20 * 60 * 1000);

  // Chat

  const sendMessage = (message: string) => {
    dispatch({
      type: "ADD_MESSAGE",
      payload: { id: generateId(), nickname, message }
    });
    socket.emit("message", { nickname, message });

    if (message.substring(0, 6) === "!play ") {
      const query = message.substring(6);
      if (query) socket.emit("song-request", { query });
    }

    if (message.substring(0, 10) === "!playlist ") {
      const query = message.substring(10);
      if (query) socket.emit("song-request-playlist", { query });
    }

    if (message === "!sync") {
      socket.emit("song-request-sync");
    }

    if (message === "!skip") {
      socket.emit("song-request-skip");
    }

    if (message.substring(0, 5) === "!add ") {
      const query = message.substring(5);
      if (query) socket.emit("song-request-add", { query });
    }

    if (message === "!stop") {
      socket.emit("song-request-stop");
    }
  };

  // Music Control

  const skipSong = () => {
    dispatch({ type: "SKIP_SONG" });
  };

  const addSong = (data: ISongInfo) => {
    dispatch({ type: "ADD_SONG", payload: data });
  };

  const removeSongQueue = () => {
    dispatch({ type: "SET_SONG_QUEUE", payload: undefined });
  };

  // Create Peer Connection

  const createPeerConnection = (
    id: IPeerProfile["id"],
    localStream: ILocalStreamState["localStream"]
  ) => {
    if (localStream) {
      const peerConnection = new RTCPeerConnection(rtcConfig);

      peerConnection.onicecandidate = (event) => {
        const { candidate } = event;
        if (candidate)
          socket.emit("iceCandidate", {
            senderId: socket.id,
            destId: id,
            candidate
          });
      };

      for (let track of localStream.getTracks()) peerConnection.addTrack(track);

      return peerConnection;
    }
  };

  // Add Peer

  const addPeer = (data: IPeerProfile, connection: RTCPeerConnection) => {
    const peer = { id: data.id, nickname: data.nickname, connection };
    dispatch({ type: "ADD_PEER", payload: peer });
  };

  // On Discover

  React.useEffect(() => {
    socket.on("discover", (data: IPeerCore) => {
      socket.emit("handshake", { destId: data.id, nickname });
    });

    return () => {
      socket.off("discover");
    };
  }, [nickname]);

  // On Handshake

  React.useEffect(() => {
    socket.on("handshake", async (data: IPeerProfile) => {
      const peerConnection = createPeerConnection(data.id, localStream);

      if (peerConnection) {
        addPeer(data, peerConnection);

        const offer = await peerConnection.createOffer(rtcOfferOptions);
        peerConnection.setLocalDescription(offer);

        socket.emit("offer", {
          senderId: socket.id,
          destId: data.id,
          nickname,
          offer
        });
      }
    });

    return () => {
      socket.off("handshake");
    };
  }, [localStream, nickname]);

  // On Offer

  React.useEffect(() => {
    socket.on("offer", async (data: IPeerOffer) => {
      const peerConnection = createPeerConnection(data.id, localStream);

      if (peerConnection) {
        addPeer(data, peerConnection);

        peerConnection.setRemoteDescription(
          new RTCSessionDescription(data.offer)
        );
        const answer = await peerConnection.createAnswer();
        peerConnection.setLocalDescription(answer);

        socket.emit("answer", { senderId: socket.id, destId: data.id, answer });
      }
    });

    return () => {
      socket.off("offer");
    };
  }, [localStream]);

  // On Answer

  React.useEffect(() => {
    socket.on("answer", (data: IPeerAnswer) => {
      const peerConnection = state.peers.find(
        (peer) => peer.id === data.id
      )?.connection;
      if (peerConnection)
        peerConnection.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );
    });

    return () => {
      socket.off("answer");
    };
  }, [state.peers]);

  // On Ice Candidate

  React.useEffect(() => {
    socket.on("iceCandidate", (data: IPeerCandidate) => {
      const peerConnection = state.peers.find(
        (peer) => peer.id === data.id
      )?.connection;
      if (peerConnection)
        peerConnection.addIceCandidate(data.candidate).catch(() => {});
    });

    return () => {
      socket.off("iceCandidate");
    };
  }, [state.peers]);

  // On Disconnected

  React.useEffect(() => {
    socket.on("disconnected", (data: IPeerCore) => {
      const peerConnection = state.peers.find(
        (peer) => peer.id === data.id
      )?.connection;

      if (peerConnection) {
        peerConnection.close();
        dispatch({ type: "REMOVE_PEER", payload: data.id });
      }
    });

    return () => {
      socket.off("disconnected");
    };
  }, [state.peers]);

  // On Message

  React.useEffect(() => {
    socket.on("message", (data: IPeerMessageData) => {
      dispatch({ type: "ADD_MESSAGE", payload: { id: generateId(), ...data } });
    });

    return () => {
      socket.off("message");
    };
  }, []);

  // On Song Queue

  React.useEffect(() => {
    socket.on("song-queue", (data: ISongInfo[]) => {
      dispatch({ type: "SET_SONG_QUEUE", payload: data });
    });

    return () => {
      socket.off("song-queue");
    };
  }, []);

  // On Song Sync Request

  React.useEffect(() => {
    socket.on("song-request-sync", () => {
      socket.emit("song-sync", {
        songQueue: state.songQueue,
        songIndex: state.songIndex,
        currentTime: refSongAudio.current?.currentTime || 0
      } as ISongSyncInfo);
    });

    return () => {
      socket.off("song-request-sync");
    };
  }, [JSON.stringify(state.songQueue), state.songIndex]);

  // On Song Sync

  React.useEffect(() => {
    socket.on("song-sync", async (data: ISongSyncInfo) => {
      dispatch({ type: "SET_SONG_QUEUE", payload: data.songQueue });
      dispatch({ type: "SET_SONG_INDEX", payload: data.songIndex });
      if (refSongAudio.current) {
        refSongAudio.current.currentTime = data.currentTime;
      }
    });

    return () => {
      socket.off("song-sync");
    };
  }, []);

  // On Song Skip

  React.useEffect(() => {
    socket.on("song-skip", skipSong);

    return () => {
      socket.off("song-skip");
    };
  }, []);

  // On Song Add

  React.useEffect(() => {
    socket.on("song-add", addSong);

    return () => {
      socket.off("song-add");
    };
  }, []);

  // On Song Stop

  React.useEffect(() => {
    socket.on("song-stop", removeSongQueue);

    return () => {
      socket.off("song-stop");
    };
  }, []);

  // Return

  return {
    connect,
    disconnect,
    sendMessage,
    skipSong,
    refSongAudio,
    ...state
  };
};
