type PlayFeedbackType = "pop" | "on" | "off" | "message";

export const playFeedback = (type: PlayFeedbackType) => {
  const audio = new Audio("/audio/" + type + ".mp3");
  audio.volume = 0.5;
  audio.play();
};
