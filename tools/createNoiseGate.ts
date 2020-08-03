const compressorOptions: DynamicsCompressorOptions = {
  threshold: -50,
  knee: 40,
  ratio: 12,
  attack: 0,
  release: 0.25
};

const filterOptions: BiquadFilterOptions = {
  Q: 8.3,
  frequency: 355,
  gain: 3.0,
  type: "bandpass"
};

export const createNoiseGate = (audioContext: AudioContext) => {
  const compressor = new DynamicsCompressorNode(audioContext, compressorOptions);
  const filter = new BiquadFilterNode(audioContext, filterOptions);

  compressor.connect(filter);

  return filter;
};
