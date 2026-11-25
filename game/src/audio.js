// Warung Rush — sound effects, synthesized with WebAudio.
// No audio files: every sound is a small oscillator or noise burst built
// at runtime, so the game loads nothing over the network.

let audioCtx = null;
let muted = false;

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

function ctx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function tone(freq, dur, type, vol, when = 0) {
  if (muted) return;
  const ac = ctx();
  if (!ac) return;
  const t0 = ac.currentTime + when;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function noise(dur, vol, freq) {
  if (muted) return;
  const ac = ctx();
  if (!ac) return;
  const len = Math.floor(ac.sampleRate * dur);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ac.createBufferSource();
  src.buffer = buf;
  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  const gain = ac.createGain();
  gain.gain.value = vol;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ac.destination);
  src.start();
}

export const sfx = {
  click() {
    tone(660, 0.07, 'triangle', 0.12);
  },
  pickup() {
    tone(520, 0.06, 'sine', 0.12);
    tone(780, 0.08, 'sine', 0.1, 0.05);
  },
  chop() {
    noise(0.08, 0.25, 900);
    tone(180, 0.06, 'square', 0.08);
  },
  sizzle() {
    noise(0.5, 0.12, 4200);
  },
  boil() {
    noise(0.35, 0.1, 700);
    tone(220, 0.2, 'sine', 0.06);
  },
  grill() {
    noise(0.4, 0.12, 1800);
  },
  plated() {
    tone(880, 0.1, 'triangle', 0.14);
    tone(1174, 0.14, 'triangle', 0.12, 0.08);
  },
  serve() {
    tone(1046, 0.12, 'triangle', 0.16);
    tone(1318, 0.12, 'triangle', 0.16, 0.09);
    tone(1568, 0.22, 'triangle', 0.16, 0.18);
  },
  error() {
    tone(160, 0.18, 'square', 0.1);
  },
  expire() {
    tone(392, 0.15, 'sawtooth', 0.08);
    tone(311, 0.22, 'sawtooth', 0.08, 0.12);
  },
  tick() {
    tone(980, 0.05, 'square', 0.06);
  },
  start() {
    tone(523, 0.1, 'triangle', 0.14);
    tone(659, 0.1, 'triangle', 0.14, 0.09);
    tone(784, 0.18, 'triangle', 0.14, 0.18);
  },
  done() {
    tone(784, 0.14, 'triangle', 0.16);
    tone(1046, 0.14, 'triangle', 0.16, 0.12);
    tone(784, 0.14, 'triangle', 0.14, 0.24);
    tone(1046, 0.3, 'triangle', 0.16, 0.36);
  },
};
