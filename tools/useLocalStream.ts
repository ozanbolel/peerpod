import * as React from "react";
import { useLocalStreamContext } from "store";
import { mediaStreamConstraints } from "config";
import { SoundMeter } from "./SoundMeter";

export const useLocalStream = () => {
  const [gateInterval, setGateInterval] = React.useState<NodeJS.Timeout>();
  const { state, dispatch } = useLocalStreamContext();

  // Controllers

  const startLocalStream: () => Promise<MediaStream | null> = () =>
    new Promise(async (resolve, reject) => {
      const localStream = await navigator.mediaDevices.getUserMedia(mediaStreamConstraints);
      const meterStream = await navigator.mediaDevices.getUserMedia(mediaStreamConstraints);

      if (localStream && meterStream) {
        dispatch({ type: "SET_LOCAL_STREAM", payload: localStream });
        dispatch({ type: "SET_METER_STREAM", payload: meterStream });
        resolve(localStream);
      } else {
        reject(null);
      }
    });

  const stopLocalStream = () => {
    const { localStream, meterStream } = state;

    if (localStream && meterStream) {
      for (let track of localStream.getTracks()) track.stop();
      for (let track of meterStream.getTracks()) track.stop();
      dispatch({ type: "RESET_STREAMS" });
    }
  };

  const toggleMuted = () => {
    dispatch({ type: "SET_IS_MUTED", payload: !state.isMuted });
  };

  // Noise Gate

  React.useEffect(() => {
    const { localStream, meterStream, isMuted } = state;

    if (localStream && meterStream) {
      const soundMeter = new SoundMeter(meterStream);
      const mic = localStream.getAudioTracks()[0];

      if (isMuted) {
        if (gateInterval) clearInterval(gateInterval);
        mic.enabled = false;
      } else {
        mic.enabled = true;
        soundMeter.start(() => {
          const gateKeeper = () => (soundMeter.instant > 0.01 ? (mic.enabled = true) : (mic.enabled = false));
          const interval = setInterval(gateKeeper, 10);
          setGateInterval(interval);
        });
      }

      return () => {
        soundMeter.stop();
      };
    }
  }, [state]);

  // Return

  return {
    startLocalStream,
    stopLocalStream,
    toggleMuted,
    ...state
  };
};
