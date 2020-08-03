import { useLocalStreamContext } from "store";
import { mediaStreamConstraints } from "config";
import { createNoiseGate } from "./createNoiseGate";

export const useLocalStream = () => {
  const { state, dispatch } = useLocalStreamContext();

  // Controllers

  const startLocalStream: () => Promise<MediaStream | null> = () =>
    new Promise(async (resolve, reject) => {
      const localStream = await navigator.mediaDevices.getUserMedia(mediaStreamConstraints);

      if (localStream) {
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(localStream);
        const noiseGate = createNoiseGate(audioContext);

        source.connect(noiseGate);
        noiseGate.connect(audioContext.destination);

        dispatch({ type: "SET_LOCAL_STREAM", payload: localStream });
        resolve(localStream);
      } else {
        reject(null);
      }
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
