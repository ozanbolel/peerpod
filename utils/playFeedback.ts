type PlayFeedbackType = "pop" | "on" | "off" | "message";

export const playFeedback = (type: PlayFeedbackType) => {
  new Audio("/audio/" + type + ".mp3").play();
};
