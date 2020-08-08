import { useLocalStreamContext } from "store";
import { mediaStreamConstraints } from "config";
import { StreamModule } from "./StreamModule";

export const useLocalStream = () => {
  const { state, dispatch } = useLocalStreamContext();

  // Controllers

  const startLocalStream: () => Promise<MediaStream | null> = () =>
    new Promise(async (resolve, reject) => {
      const audioContext = new AudioContext();
      const destination = audioContext.createMediaStreamDestination();
      const streamModule = new StreamModule(audioContext, 4096);

      streamModule
        .setup(
          mediaStreamConstraints,
          () => {},
          () => {
            reject(null);
          }
        )
        .ready()
        .start(destination);

      streamModule.module("noisegate").param("level", 1);

      dispatch({ type: "SET_LOCAL_STREAM", payload: destination.stream });
      resolve(destination.stream);
    });

  const stopLocalStream = () => {
    const { localStream } = state;

    if (localStream) {
      for (let track of localStream.getTracks()) track.stop();
      dispatch({ type: "RESET_LOCAL_STREAM" });
    }
  };

  const toggleMuted = () => {
    const { localStream, isMuted } = state;

    if (localStream) {
      const mic = localStream.getAudioTracks()[0];

      if (isMuted) {
        mic.enabled = true;
      } else {
        mic.enabled = false;
      }

      dispatch({ type: "SET_IS_MUTED", payload: !isMuted });
    }
  };

  // Return

  return {
    startLocalStream,
    stopLocalStream,
    toggleMuted,
    ...state
  };
};
