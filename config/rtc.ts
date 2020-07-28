export const mediaTrackConstraints: MediaTrackConstraints = {
  channelCount: 1,
  sampleSize: 16,
  sampleRate: 48000,
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true
};

export const mediaStreamConstraints: MediaStreamConstraints = {
  audio: mediaTrackConstraints,
  video: false
};

export const rtcConfig: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
    { urls: "stun:stun01.sipphone.com" },
    { urls: "stun:stun.ekiga.net" },
    { urls: "stun:stun.fwdnet.net" },
    { urls: "stun:stun.ideasip.com" },
    { urls: "stun:stun.iptel.org" },
    { urls: "stun:stun.rixtelecom.se" },
    { urls: "stun:stun.schlund.de" },
    { urls: "stun:stunserver.org" },
    { urls: "stun:stun.softjoys.com" },
    { urls: "stun:stun.voiparound.com" },
    { urls: "stun:stun.voipbuster.com" },
    { urls: "stun:stun.voipstunt.com" },
    { urls: "stun:stun.voxgratia.org" },
    { urls: "stun:stun.xten.com" }
  ]
};

export const rtcOfferOptions: RTCOfferOptions = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: false
};
