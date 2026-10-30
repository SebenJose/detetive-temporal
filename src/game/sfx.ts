"use client";

// Small synthesized sound effects. No audio files: everything is generated with the Web Audio API
// and only starts after a player interaction, as browsers require.
const MUTE_KEY = "detetive-temporal:som-desligado";
let context: AudioContext | null = null;
let muted = false;
try { muted = localStorage.getItem(MUTE_KEY) === "1"; } catch { /* storage unavailable */ }

function audio() {
  if (muted || typeof window === "undefined") return null;
  try {
    context ??= new AudioContext();
    if (context.state === "suspended") void context.resume();
    return context;
  } catch { return null; }
}

function tone(frequency: number, start: number, length: number, { type = "square", volume = 0.05, slide = 0 }: { type?: OscillatorType; volume?: number; slide?: number } = {}) {
  const ctx = audio();
  if (!ctx) return;
  const at = ctx.currentTime + start, oscillator = ctx.createOscillator(), gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, at);
  if (slide) oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, frequency + slide), at + length);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(volume, at + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(at); oscillator.stop(at + length + 0.02);
}

export const sfx = {
  isMuted: () => muted,
  setMuted(value: boolean) {
    muted = value;
    try { localStorage.setItem(MUTE_KEY, value ? "1" : "0"); } catch { /* storage unavailable */ }
  },
  blip(pitch = 1) { tone(520 * pitch + Math.random() * 60, 0, 0.045, { volume: 0.025 }); },
  step() { tone(110 + Math.random() * 30, 0, 0.05, { type: "triangle", volume: 0.03, slide: -40 }); },
  click() { tone(660, 0, 0.05, { type: "triangle", volume: 0.04 }); },
  open() { tone(440, 0, 0.07, { type: "triangle", volume: 0.04 }); tone(660, 0.05, 0.08, { type: "triangle", volume: 0.04 }); },
  clue() { [523, 659, 784, 1047].forEach((note, index) => tone(note, index * 0.08, 0.16, { volume: 0.045 })); },
  door() { tone(220, 0, 0.35, { type: "sawtooth", volume: 0.03, slide: 500 }); tone(330, 0.1, 0.3, { type: "sine", volume: 0.04, slide: 400 }); },
  warp() { tone(180, 0, 0.9, { type: "sawtooth", volume: 0.03, slide: 1400 }); tone(90, 0.1, 0.8, { type: "sine", volume: 0.05, slide: 700 }); },
  error() { tone(200, 0, 0.14, { volume: 0.04 }); tone(150, 0.13, 0.22, { volume: 0.04 }); },
  success() { [392, 523, 659, 784, 659, 1047].forEach((note, index) => tone(note, index * 0.11, index === 5 ? 0.5 : 0.16, { volume: 0.05 })); },
};
