class NoiseGeneratorProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const { color = "white" } = options?.processorOptions || {};
    this.color = color;
    this.brownLast = 0;
    this.pink = {
      b0: 0,
      b1: 0,
      b2: 0,
      b3: 0,
      b4: 0,
      b5: 0,
      b6: 0,
    };
  }

  process(_inputs, outputs) {
    const output = outputs[0];
    if (!output || output.length === 0) {
      return true;
    }

    const channel = output[0];

    if (this.color === "brown") {
      for (let i = 0; i < channel.length; i += 1) {
        const white = Math.random() * 2 - 1;
        this.brownLast = (this.brownLast + 0.02 * white) / 1.02;
        channel[i] = this.brownLast * 3.5;
      }
      return true;
    }

    if (this.color === "pink") {
      let { b0, b1, b2, b3, b4, b5, b6 } = this.pink;
      for (let i = 0; i < channel.length; i += 1) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;

        const pink =
          b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        b6 = white * 0.115926;
        channel[i] = pink * 0.11;
      }
      this.pink = { b0, b1, b2, b3, b4, b5, b6 };
      return true;
    }

    for (let i = 0; i < channel.length; i += 1) {
      channel[i] = Math.random() * 2 - 1;
    }

    return true;
  }
}

registerProcessor("noise-generator", NoiseGeneratorProcessor);

