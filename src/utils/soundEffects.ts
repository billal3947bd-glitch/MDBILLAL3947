/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

let audioCtx: AudioContext | null = null;
let isMutedGlobal = typeof window !== "undefined" ? localStorage.getItem("math_sound_muted") === "true" : false;
let musicInterval: any = null;
let musicStep = 0;
const musicNotes = [
  261.63, 329.63, 392.00, 329.63, // C Major: C4, E4, G4, E4
  293.66, 349.23, 440.00, 349.23, // F Major: D4, F4, A4, F4
  329.63, 392.00, 493.88, 392.00, // G Major: E4, G4, B4, G4
  261.63, 329.63, 392.00, 523.25  // C Major High: C4, E4, G4, C5
];

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function stopBackgroundMusic() {
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
}

export function startBackgroundMusic() {
  if (musicInterval) return;
  const isMusicOn = localStorage.getItem("math_music_enabled") !== "false";
  if (!isMusicOn || isMutedGlobal) return;

  // Start loop
  musicInterval = setInterval(() => {
    try {
      const isMusicOnLatest = localStorage.getItem("math_music_enabled") !== "false";
      if (!isMusicOnLatest || isMutedGlobal) {
        stopBackgroundMusic();
        return;
      }

      const ctx = getAudioContext();
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      const freq = musicNotes[musicStep % musicNotes.length];
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Low volume pleasant synthesizer notes inside ambient background
      gain.gain.setValueAtTime(0.003, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.38);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);

      musicStep++;
    } catch (e) {
      console.warn("Music play error:", e);
    }
  }, 480);
}

export function setMuteState(muted: boolean) {
  isMutedGlobal = muted;
  localStorage.setItem("math_sound_muted", muted ? "true" : "false");
  if (muted) {
    stopBackgroundMusic();
  } else {
    startBackgroundMusic();
  }
}

export function getMuteState(): boolean {
  return isMutedGlobal;
}

/**
 * Plays a light wooden button click pop
 */
export function playClickSound() {
  if (isMutedGlobal) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {
    console.warn("SFX error:", e);
  }
}

/**
 * Plays a sweet ascending chime block for correct answers
 */
export function playCorrectSound() {
  if (isMutedGlobal) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Triple chime
    const notes = [523.25, 659.25, 1046.50]; // C5, E5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      
      gain.gain.setValueAtTime(0.0, now + idx * 0.07);
      gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.25);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.3);
    });
  } catch (e) {
    console.warn("SFX error:", e);
  }
}

/**
 * Plays a descending buzzing error chime for wrong answers
 */
export function playWrongSound() {
  if (isMutedGlobal) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(140, now);
    osc1.frequency.linearRampToValueAtTime(80, now + 0.24);

    osc2.type = "sine";
    osc2.frequency.setValueAtTime(145, now);
    osc2.frequency.linearRampToValueAtTime(82, now + 0.24);
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    
    osc1.start();
    osc2.start();
    osc1.stop(now + 0.26);
    osc2.stop(now + 0.26);
  } catch (e) {
    console.warn("SFX error:", e);
  }
}

/**
 * Plays a triumphant melody for leveling up
 */
export function playLevelUpSound() {
  if (isMutedGlobal) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const melody = [523.25, 587.33, 659.25, 783.99, 1046.50]; // C, D, E, G, C(hi)
    
    melody.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      
      gain.gain.setValueAtTime(0.0, now + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.1, now + idx * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.2);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.25);
    });
  } catch (e) {
    console.warn("SFX error:", e);
  }
}

/**
 * Music arpeggio for Game Over screen
 */
export function playGameOverSound() {
  if (isMutedGlobal) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const melody = [587.33, 523.25, 493.88, 440.00, 392.00, 349.23, 293.66]; // D5, C5, B4, A4, G4, F4, D4
    
    melody.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      
      gain.gain.setValueAtTime(0.0, now + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.1 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.5);
    });
  } catch (e) {
    console.warn("SFX error:", e);
  }
}
