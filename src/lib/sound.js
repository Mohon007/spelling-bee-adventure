// Small sound effects made with Web Audio (no files to download).
let ctx = null;
let on = true;

export function setSoundOn(value) {
  on = value;
}

function audio() {
  if (!on || typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    ctx = new Ctx();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, start, length, type = 'triangle', volume = 0.14) {
  const c = audio();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t = c.currentTime + start;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(t);
  osc.stop(t + length + 0.05);
}

export const sfx = {
  tap() {
    tone(700, 0, 0.08, 'triangle', 0.07);
  },
  correct() {
    tone(523, 0, 0.16);
    tone(659, 0.1, 0.16);
    tone(784, 0.2, 0.32);
  },
  oops() {
    tone(330, 0, 0.18, 'sine', 0.1);
    tone(262, 0.14, 0.26, 'sine', 0.1);
  },
  win() {
    [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.22));
  },
  clap() {
    const c = audio();
    if (!c) return;
    const length = Math.floor(c.sampleRate * 0.12);
    const buffer = c.createBuffer(1, length, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
    const src = c.createBufferSource();
    src.buffer = buffer;
    const filter = c.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1400;
    const gain = c.createGain();
    gain.gain.value = 0.7;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(c.destination);
    src.start();
  },
};
