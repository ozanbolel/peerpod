const compressorOptions: DynamicsCompressorOptions = {
  threshold: -25,
  knee: 40,
  ratio: 12,
  attack: 0,
  release: 0.25
};

const filterOptions: BiquadFilterOptions = {
  Q: 1,
  frequency: 350,
  gain: 3,
  type: "bandpass"
};

export const createNoiseGate = (audioContext: AudioContext) => {
  const compressor = new DynamicsCompressorNode(audioContext, compressorOptions);
  const filter = new BiquadFilterNode(audioContext, filterOptions);

  compressor.connect(filter);

  return filter;
};
