import { useLocalStreamContext } from "store";
import { mediaStreamConstraints } from "config";

export const useLocalStream = () => {
  const { state, dispatch } = useLocalStreamContext();

  // Controllers

  const startLocalStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia(
      mediaStreamConstraints
    );
    dispatch({ type: "SET_LOCAL_STREAM", payload: stream });
  };

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
