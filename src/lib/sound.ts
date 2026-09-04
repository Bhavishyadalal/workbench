"use client";

// Tiny synthesized sound effects via the Web Audio API — no audio assets,
// nothing to fetch. Keeps the "runs entirely client-side" promise trivially.

let sharedCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!sharedCtx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    sharedCtx = new Ctor();
  }
  if (sharedCtx.state === "suspended") {
    sharedCtx.resume().catch(() => {});
  }
  return sharedCtx;
}

function tone(freq: number, startOffset: number, duration: number, peak: number, ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  const start = ctx.currentTime + startOffset;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + Math.min(0.02, duration / 3));
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

/** A soft, short click for button presses. */
export function playClick() {
  const ctx = getCtx();
  if (!ctx) return;
  tone(720, 0, 0.06, 0.045, ctx);
}

/** A brief three-note major chime for completed actions. */
export function playChime() {
  const ctx = getCtx();
  if (!ctx) return;
  [523.25, 659.25, 783.99].forEach((freq, i) => tone(freq, i * 0.07, 0.35, 0.05, ctx));
}
