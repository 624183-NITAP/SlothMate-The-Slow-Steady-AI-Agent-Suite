/**
 * SlothMate Procedural Ambient Sound Synthesizer
 * Built entirely with Web Audio API. 
 * 100% offline, zero audio files required, zero latency!
 */

class SlothAudioEngine {
  constructor() {
    this.ctx = null;
    this.isInitialized = false;
    this.isPlaying = false;
    this.volumes = {
      rain: 0.35,
      wind: 0.25,
      brown: 0.40,
      chimes: 0.30
    };
    this.nodes = {};
    this.chimeInterval = null;
  }

  init() {
    if (this.isInitialized) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Channel Gains
    this.gainNodes = {
      rain: this.ctx.createGain(),
      wind: this.ctx.createGain(),
      brown: this.ctx.createGain(),
      chimes: this.ctx.createGain()
    };

    for (const key in this.gainNodes) {
      this.gainNodes[key].gain.setValueAtTime(this.volumes[key], this.ctx.currentTime);
      this.gainNodes[key].connect(this.masterGain);
    }

    this.isInitialized = true;
  }

  // Generate Brown Noise Buffer (Sloth Deep Relaxation)
  createBrownNoiseNode() {
    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Gain compensation
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;

    // Filter to warm low frequencies
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.gainNodes.brown);

    return whiteNoise;
  }

  // Generate Tropical Rain (Filtered Pink Noise with Droplet modulations)
  createRainNode() {
    const bufferSize = this.ctx.sampleRate * 3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const rainSource = this.ctx.createBufferSource();
    rainSource.buffer = buffer;
    rainSource.loop = true;

    const rainFilter = this.ctx.createBiquadFilter();
    rainFilter.type = 'bandpass';
    rainFilter.frequency.setValueAtTime(1000, this.ctx.currentTime);
    rainFilter.Q.setValueAtTime(0.8, this.ctx.currentTime);

    rainSource.connect(rainFilter);
    rainFilter.connect(this.gainNodes.rain);

    return rainSource;
  }

  // Generate Canopy Wind (Filtered noise with LFO sway)
  createWindNode() {
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const windSource = this.ctx.createBufferSource();
    windSource.buffer = buffer;
    windSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);
    filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    // LFO to simulate gentle swaying wind
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // 8-second cycle
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(250, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    windSource.connect(filter);
    filter.connect(this.gainNodes.wind);

    this.nodes.windLfo = lfo;
    return windSource;
  }

  // Play a gentle bell/chime note
  playChimeNote(freq = 528) {
    if (!this.ctx || !this.isPlaying) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Exponential decay bell envelope
    chimeGain.gain.setValueAtTime(0.001, now);
    chimeGain.gain.linearRampToValueAtTime(0.4, now + 0.05);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 5.0);

    osc.connect(chimeGain);
    chimeGain.connect(this.gainNodes.chimes);

    osc.start(now);
    osc.stop(now + 5.2);
  }

  start() {
    this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isPlaying) return;

    this.nodes.brown = this.createBrownNoiseNode();
    this.nodes.rain = this.createRainNode();
    this.nodes.wind = this.createWindNode();

    this.nodes.brown.start();
    this.nodes.rain.start();
    this.nodes.wind.start();

    // Occasional gentle chime (frequencies: 432Hz, 528Hz, 639Hz, 741Hz - relaxing solfeggio frequencies)
    const chimes = [432, 528, 639, 741, 852];
    this.playChimeNote(528);
    this.chimeInterval = setInterval(() => {
      if (this.isPlaying) {
        const freq = chimes[Math.floor(Math.random() * chimes.length)];
        this.playChimeNote(freq);
      }
    }, 14000);

    this.isPlaying = true;
  }

  stop() {
    if (!this.isPlaying) return;

    if (this.nodes.brown) this.nodes.brown.stop();
    if (this.nodes.rain) this.nodes.rain.stop();
    if (this.nodes.wind) this.nodes.wind.stop();
    if (this.nodes.windLfo) this.nodes.windLfo.stop();
    if (this.chimeInterval) clearInterval(this.chimeInterval);

    this.isPlaying = false;
  }

  setVolume(channel, value) {
    this.volumes[channel] = parseFloat(value);
    if (this.gainNodes && this.gainNodes[channel] && this.ctx) {
      this.gainNodes[channel].gain.setTargetAtTime(this.volumes[channel], this.ctx.currentTime, 0.05);
    }
  }

  setMasterVolume(value) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(parseFloat(value), this.ctx.currentTime, 0.05);
    }
  }
}

window.slothAudio = new SlothAudioEngine();
