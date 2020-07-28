export class SoundMeter {
  context: AudioContext;
  instant: number;
  avg: number;
  script: ScriptProcessorNode;
  mic: MediaStreamAudioSourceNode;

  constructor(stream: MediaStream) {
    this.context = new AudioContext();
    this.instant = 0.0;
    this.avg = 0.0;
    this.script = this.context.createScriptProcessor(2048, 1, 1);
    this.mic = this.mic = this.context.createMediaStreamSource(stream);

    const that = this;

    this.script.onaudioprocess = function (event) {
      const input = event.inputBuffer.getChannelData(0);
      let i;
      let sum = 0.0;
      let clipcount = 0;

      for (i = 0; i < input.length; ++i) {
        sum += input[i] * input[i];

        if (Math.abs(input[i]) > 0.99) {
          clipcount += 1;
        }
      }

      that.instant = Math.sqrt(sum / input.length);
      that.avg = 0.95 * that.avg + 0.05 * that.instant;
    };
  }

  start(callback: Function) {
    try {
      this.mic.connect(this.script);
      this.script.connect(this.context.destination);

      if (typeof callback !== "undefined") {
        callback(null);
      }
    } catch (error) {
      console.error(error);

      if (typeof callback !== "undefined") {
        callback(error);
      }
    }
  }

  stop() {
    this.mic.disconnect();
    this.script.disconnect();
  }
}
