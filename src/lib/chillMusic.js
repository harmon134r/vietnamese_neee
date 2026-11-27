/**
 * Pure Web Audio Chill Ambient Music & SFX Engine
 * for "Đuổi Bắt Đồng Nghĩa – Trái Nghĩa".
 *
 * Zero external audio files — synthesizes 3 selectable chill tracks:
 * 1. "lofi-garden" (74 BPM, C Maj / A Min):
 *    Warm Rhodes chords (Fmaj7 -> Em7 -> Dm7 -> Cmaj7 / Am9) + C-major pentatonic kalimba + soft kick & brushed hat
 * 2. "ocean-breeze" (68 BPM, F Maj / D Min):
 *    Acoustic nylon-guitar plucked arpeggios (Bbmaj7 -> Am7 -> Gm7 -> C9 / Fmaj7) + warm sine-pad + bossa wood-rim & airy wave shimmer
 * 3. "night-tea" (64 BPM, D Major Pentatonic D-E-F#-A-B):
 *    Vietnamese/East-Asian pentatonic harp/guzheng plucked harmonics (Dmaj9 -> Bm7 -> Gmaj7 -> A6sus4) + breathy flute pad + soft muted low pulse
 *
 * Also provides:
 * - Click-free live track switching with isolated track sub-bus crossfade & single scheduler timer
 * - Smooth linearRampToValueAtTime fade-in/out and TTS ducking (~22%)
 * - Crisp playful gameplay SFX (jump, vault, crash/shatter, correct streak chime, gentle wrong stumble, scene breeze, victory)
 * - Graceful no-op in SSR/jsdom or environments without Web Audio API
 */

export const DEFAULT_TRACK_ID = "lofi-garden";

export const CHILL_TRACKS = Object.freeze([
  Object.freeze({
    id: "lofi-garden",
    labelVi: "Chiều Thu Lo-Fi",
    subtitleVi: "Rhodes & Kalimba · 74 BPM",
    bpm: 74,
  }),
  Object.freeze({
    id: "ocean-breeze",
    labelVi: "Gió Biển Hoàng Hôn",
    subtitleVi: "Guitar mộc & Sóng dịu · 68 BPM",
    bpm: 68,
  }),
  Object.freeze({
    id: "night-tea",
    labelVi: "Trà Đêm Phố Cổ",
    subtitleVi: "Ngũ cung & Sáo êm · 64 BPM",
    bpm: 64,
  }),
]);

const TRACK_META_BY_ID = Object.freeze(
  Object.fromEntries(CHILL_TRACKS.map((track) => [track.id, track]))
);

const SCHEDULER_INTERVAL_MS = 120;
const SCHEDULE_AHEAD_SECONDS = 0.28;

const MUSIC_BASE_GAIN = 0.42;
const DUCKED_GAIN = 0.22;

const RHODES_LOWPASS_HZ = 1350;
const OCEAN_LOWPASS_HZ = 1550;
const NIGHT_TEA_LOWPASS_HZ = 1800;

const TRACK_AUDIO_CONFIG = Object.freeze({
  "lofi-garden": Object.freeze({
    bpm: 74,
    eighthNoteSec: 60 / 74 / 2,
    swingSec: 0.018,
    lowpassHz: RHODES_LOWPASS_HZ,
    lowpassQ: 0.7,
  }),
  "ocean-breeze": Object.freeze({
    bpm: 68,
    eighthNoteSec: 60 / 68 / 2,
    swingSec: 0.008,
    lowpassHz: OCEAN_LOWPASS_HZ,
    lowpassQ: 0.65,
  }),
  "night-tea": Object.freeze({
    bpm: 64,
    eighthNoteSec: 60 / 64 / 2,
    swingSec: 0.01,
    lowpassHz: NIGHT_TEA_LOWPASS_HZ,
    lowpassQ: 0.6,
  }),
});

/**
 * Track 1 ("lofi-garden") — 8-bar cozy lo-fi progression (C Maj / A Min):
 * Bars 0-3: Fmaj7 -> Em7 -> Dm7 -> Cmaj7
 * Bars 4-7: Fmaj7 -> Em7 -> Dm7 -> Am9
 */
const LOFI_CHORD_PROGRESSION = Object.freeze([
  Object.freeze({ name: "Fmaj7", bass: 87.31, notes: Object.freeze([174.61, 220.0, 261.63, 329.63]) }),
  Object.freeze({ name: "Em7", bass: 82.41, notes: Object.freeze([164.81, 196.0, 246.94, 293.66]) }),
  Object.freeze({ name: "Dm7", bass: 73.42, notes: Object.freeze([146.83, 174.61, 220.0, 261.63]) }),
  Object.freeze({ name: "Cmaj7", bass: 65.41, notes: Object.freeze([130.81, 164.81, 196.0, 246.94]) }),
  Object.freeze({ name: "Fmaj7", bass: 87.31, notes: Object.freeze([174.61, 220.0, 261.63, 329.63]) }),
  Object.freeze({ name: "Em7", bass: 82.41, notes: Object.freeze([164.81, 196.0, 246.94, 293.66]) }),
  Object.freeze({ name: "Dm7", bass: 73.42, notes: Object.freeze([146.83, 174.61, 220.0, 261.63]) }),
  Object.freeze({ name: "Am9", bass: 110.0, notes: Object.freeze([164.81, 196.0, 246.94, 329.63]) }),
]);

/**
 * Sparse C-major pentatonic kalimba notes mapped across 64 eighth-note steps (8 bars).
 */
const LOFI_PENTATONIC_MOTIF = Object.freeze({
  2: 659.25, // E5
  5: 783.99, // G5
  10: 659.25, // E5
  14: 587.33, // D5
  18: 523.25, // C5
  21: 659.25, // E5
  26: 783.99, // G5
  30: 880.0, // A5
  34: 783.99, // G5
  37: 659.25, // E5
  42: 587.33, // D5
  46: 523.25, // C5
  50: 659.25, // E5
  53: 783.99, // G5
  58: 880.0, // A5
  61: 783.99, // G5
});

/**
 * Track 2 ("ocean-breeze") — 8-bar sunset acoustic bossa progression (F Maj / D Min):
 * Bars 0-3: Bbmaj7 -> Am7 -> Gm7 -> C9
 * Bars 4-7: Bbmaj7 -> Am7 -> Gm7 -> Fmaj7
 */
const OCEAN_CHORD_PROGRESSION = Object.freeze([
  Object.freeze({
    name: "Bbmaj7",
    bass: 116.54, // Bb2
    pad: Object.freeze([233.08, 293.66, 349.23, 440.0]), // Bb3 D4 F4 A4
    arp: Object.freeze([116.54, 233.08, 293.66, 349.23, 440.0, 349.23, 293.66, 440.0]),
  }),
  Object.freeze({
    name: "Am7",
    bass: 110.0, // A2
    pad: Object.freeze([220.0, 261.63, 329.63, 392.0]), // A3 C4 E4 G4
    arp: Object.freeze([110.0, 220.0, 261.63, 329.63, 392.0, 329.63, 261.63, 392.0]),
  }),
  Object.freeze({
    name: "Gm7",
    bass: 98.0, // G2
    pad: Object.freeze([196.0, 233.08, 293.66, 349.23]), // G3 Bb3 D4 F4
    arp: Object.freeze([98.0, 196.0, 233.08, 293.66, 349.23, 293.66, 233.08, 349.23]),
  }),
  Object.freeze({
    name: "C9",
    bass: 130.81, // C3
    pad: Object.freeze([196.0, 233.08, 293.66, 329.63]), // G3 Bb3 D4 E4
    arp: Object.freeze([130.81, 196.0, 233.08, 293.66, 329.63, 293.66, 233.08, 329.63]),
  }),
  Object.freeze({
    name: "Bbmaj7",
    bass: 116.54, // Bb2
    pad: Object.freeze([233.08, 293.66, 349.23, 440.0]),
    arp: Object.freeze([116.54, 233.08, 293.66, 349.23, 440.0, 349.23, 293.66, 440.0]),
  }),
  Object.freeze({
    name: "Am7",
    bass: 110.0, // A2
    pad: Object.freeze([220.0, 261.63, 329.63, 392.0]),
    arp: Object.freeze([110.0, 220.0, 261.63, 329.63, 392.0, 329.63, 261.63, 392.0]),
  }),
  Object.freeze({
    name: "Gm7",
    bass: 98.0, // G2
    pad: Object.freeze([196.0, 233.08, 293.66, 349.23]),
    arp: Object.freeze([98.0, 196.0, 233.08, 293.66, 349.23, 293.66, 233.08, 349.23]),
  }),
  Object.freeze({
    name: "Fmaj7",
    bass: 87.31, // F2
    pad: Object.freeze([174.61, 220.0, 261.63, 329.63]), // F3 A3 C4 E4
    arp: Object.freeze([87.31, 174.61, 220.0, 261.63, 329.63, 261.63, 220.0, 329.63]),
  }),
]);

/**
 * Delicate sunset acoustic top-string accents (F Maj / D Min) across 64 steps.
 */
const OCEAN_MELODY_MOTIF = Object.freeze({
  3: 698.46, // F5
  6: 659.25, // E5
  11: 587.33, // D5
  19: 523.25, // C5
  22: 587.33, // D5
  27: 659.25, // E5
  35: 698.46, // F5
  38: 783.99, // G5
  43: 659.25, // E5
  51: 587.33, // D5
  54: 523.25, // C5
  59: 659.25, // E5
  62: 698.46, // F5
});

/**
 * Track 3 ("night-tea") — 8-bar serene D Major Pentatonic progression (D-E-F#-A-B):
 * Bars 0-3: Dmaj9 -> Bm7 -> Gmaj7 -> A6sus4
 * Bars 4-7: Dmaj9 -> Bm7 -> Gmaj7 -> A6sus4
 */
const NIGHT_TEA_PROGRESSION = Object.freeze([
  Object.freeze({
    name: "Dmaj9",
    bass: 73.42, // D2
    pad: Object.freeze([146.83, 220.0, 293.66, 329.63]), // D3 A3 D4 E4
    fluteHz: 739.99, // F#5
    harp: Object.freeze([293.66, 369.99, 440.0]), // D4 F#4 A4
  }),
  Object.freeze({
    name: "Bm7",
    bass: 123.47, // B2
    pad: Object.freeze([185.0, 220.0, 246.94, 293.66]), // F#3 A3 B3 D4
    fluteHz: 659.25, // E5
    harp: Object.freeze([246.94, 293.66, 440.0]), // B3 D4 A4
  }),
  Object.freeze({
    name: "Gmaj7",
    bass: 98.0, // G2
    pad: Object.freeze([196.0, 246.94, 293.66, 369.99]), // G3 B3 D4 F#4
    fluteHz: 587.33, // D5
    harp: Object.freeze([246.94, 369.99, 440.0]), // B3 F#4 A4
  }),
  Object.freeze({
    name: "A6sus4",
    bass: 110.0, // A2
    pad: Object.freeze([220.0, 293.66, 329.63, 369.99]), // A3 D4 E4 F#4
    fluteHz: 659.25, // E5
    harp: Object.freeze([220.0, 329.63, 369.99]), // A3 E4 F#4
  }),
  Object.freeze({
    name: "Dmaj9",
    bass: 73.42, // D2
    pad: Object.freeze([146.83, 220.0, 293.66, 329.63]),
    fluteHz: 880.0, // A5
    harp: Object.freeze([293.66, 369.99, 587.33]), // D4 F#4 D5
  }),
  Object.freeze({
    name: "Bm7",
    bass: 123.47, // B2
    pad: Object.freeze([185.0, 220.0, 246.94, 293.66]),
    fluteHz: 739.99, // F#5
    harp: Object.freeze([246.94, 369.99, 493.88]), // B3 F#4 B4
  }),
  Object.freeze({
    name: "Gmaj7",
    bass: 98.0, // G2
    pad: Object.freeze([196.0, 246.94, 293.66, 369.99]),
    fluteHz: 659.25, // E5
    harp: Object.freeze([246.94, 293.66, 587.33]), // B3 D4 D5
  }),
  Object.freeze({
    name: "A6sus4",
    bass: 110.0, // A2
    pad: Object.freeze([220.0, 293.66, 329.63, 369.99]),
    fluteHz: 587.33, // D5
    harp: Object.freeze([220.0, 293.66, 440.0]), // A3 D4 A4
  }),
]);

/**
 * Serene D Major Pentatonic (D-E-F#-A-B) đàn tranh / guzheng melody across 64 steps.
 */
const NIGHT_TEA_PENTATONIC_MOTIF = Object.freeze({
  2: 587.33, // D5
  4: 659.25, // E5
  6: 739.99, // F#5
  10: 880.0, // A5
  13: 739.99, // F#5
  18: 659.25, // E5
  21: 587.33, // D5
  26: 739.99, // F#5
  29: 659.25, // E5
  34: 880.0, // A5
  36: 987.77, // B5
  38: 880.0, // A5
  42: 739.99, // F#5
  46: 659.25, // E5
  50: 587.33, // D5
  53: 739.99, // F#5
  58: 659.25, // E5
  61: 587.33, // D5
});

const STREAK_PENTATONIC_HZ = Object.freeze([
  523.25, // C5
  587.33, // D5
  659.25, // E5
  783.99, // G5
  880.0, // A5
  1046.5, // C6
]);

function resolveTrackId(trackId) {
  if (typeof trackId === "string" && Object.prototype.hasOwnProperty.call(TRACK_META_BY_ID, trackId)) {
    return trackId;
  }
  return DEFAULT_TRACK_ID;
}

function getTrackConfig(trackId) {
  return TRACK_AUDIO_CONFIG[resolveTrackId(trackId)] || TRACK_AUDIO_CONFIG[DEFAULT_TRACK_ID];
}

function getAudioContextCtor() {
  if (typeof globalThis === "undefined") return null;
  return globalThis.AudioContext || globalThis.webkitAudioContext || null;
}

/**
 * Smoothly ramp an AudioParam without clicks, resilient to partial Web Audio mocks.
 */
function smoothRamp(param, targetValue, durationSec, now) {
  if (!param) return;
  const safeNow = Number.isFinite(now) ? now : 0;
  const safeTarget = Number.isFinite(targetValue) ? targetValue : 0;
  const currentValue = Number.isFinite(param.value) ? param.value : safeTarget;

  try {
    if (typeof param.cancelScheduledValues === "function") {
      param.cancelScheduledValues(safeNow);
    }
    if (typeof param.setValueAtTime === "function") {
      param.setValueAtTime(currentValue, safeNow);
    }
    if (typeof param.linearRampToValueAtTime === "function") {
      param.linearRampToValueAtTime(safeTarget, safeNow + Math.max(0.01, durationSec));
    } else {
      param.value = safeTarget;
    }
  } catch {
    // Never throw from audio parameter automation
  }
}

/**
 * Create a self-contained Web Audio chill background music & gameplay SFX engine.
 */
export function createChillAudioEngine(initialTrackId = DEFAULT_TRACK_ID) {
  let ctx = null;
  let masterGain = null;
  let musicDuckGain = null;
  let musicBus = null;
  let activeTrackBus = null;
  let activeTrackFilter = null;
  let activeTrackBusId = null;
  let sfxBus = null;
  let noiseBuffer = null;

  let currentTrackId = resolveTrackId(initialTrackId);
  let muted = false;
  let ducked = false;
  let playing = false;
  let disposed = false;

  let schedulerId = null;
  let currentStep = 0;
  let nextStepTime = 0;

  function createTrackSubBus(audioCtx, trackId, fadeInSec = 0) {
    if (!audioCtx || !musicBus) return;
    const cfg = getTrackConfig(trackId);
    const now = audioCtx.currentTime || 0;

    // Fade out any previous track sub-bus cleanly so live track switches never click or clash keys
    if (activeTrackBus) {
      smoothRamp(activeTrackBus.gain, 0.0001, 0.16, now);
    }

    try {
      const trackGain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      filter.type = "lowpass";
      filter.frequency.value = cfg.lowpassHz;
      filter.Q.value = cfg.lowpassQ;

      if (fadeInSec > 0) {
        trackGain.gain.value = 0.0001;
        smoothRamp(trackGain.gain, 1, fadeInSec, now);
      } else {
        trackGain.gain.value = 1;
      }

      filter.connect(trackGain);
      trackGain.connect(musicBus);

      activeTrackBus = trackGain;
      activeTrackFilter = filter;
      activeTrackBusId = trackId;
    } catch {
      // Safe no-op on partial mocks
    }
  }

  function ensureContext() {
    if (disposed) return null;
    if (ctx) return ctx;

    const AudioCtx = getAudioContextCtor();
    if (!AudioCtx) return null;

    try {
      const instance = new AudioCtx();
      const master = instance.createGain();
      const duckGain = instance.createGain();
      const music = instance.createGain();
      const sfx = instance.createGain();

      master.gain.value = muted ? 0 : 1;
      duckGain.gain.value = ducked ? DUCKED_GAIN : 1;
      music.gain.value = 0;
      sfx.gain.value = 0.72;

      music.connect(duckGain);
      duckGain.connect(master);
      sfx.connect(master);
      master.connect(instance.destination);

      ctx = instance;
      masterGain = master;
      musicDuckGain = duckGain;
      musicBus = music;
      sfxBus = sfx;

      createTrackSubBus(instance, currentTrackId, 0);

      return ctx;
    } catch {
      ctx = null;
      return null;
    }
  }

  function resumeIfSuspended(audioCtx) {
    if (!audioCtx || typeof audioCtx.resume !== "function") return;
    if (audioCtx.state === "suspended") {
      try {
        const res = audioCtx.resume();
        if (res && typeof res.catch === "function") {
          res.catch(() => {});
        }
      } catch {
        // Ignore resume rejection outside user gesture
      }
    }
  }

  function getNoiseBuffer(audioCtx) {
    if (noiseBuffer) return noiseBuffer;
    if (!audioCtx || typeof audioCtx.createBuffer !== "function") return null;

    try {
      const sampleRate = audioCtx.sampleRate || 44100;
      // 1.8s gently smoothed noise buffer supports brushed hats, ocean waves, breeze & wooden crack
      const length = Math.max(1, Math.floor(sampleRate * 1.8));
      const buffer = audioCtx.createBuffer(1, length, sampleRate);
      if (typeof buffer.getChannelData === "function") {
        const data = buffer.getChannelData(0);
        let last = 0;
        for (let i = 0; i < length; i += 1) {
          const white = Math.random() * 2 - 1;
          last = (last + 0.35 * white) / 1.35;
          data[i] = last;
        }
      }
      noiseBuffer = buffer;
      return noiseBuffer;
    } catch {
      return null;
    }
  }

  // =========================================================================
  // TRACK 1: "lofi-garden" — Rhodes & Kalimba (74 BPM, C Maj / A Min)
  // =========================================================================

  function scheduleRhodesChord(audioCtx, chord, startTime, durationSec, targetFilter) {
    if (!targetFilter) return;

    // Warm sub bass root
    try {
      const bassOsc = audioCtx.createOscillator();
      const bassGain = audioCtx.createGain();
      bassOsc.type = "sine";
      bassOsc.frequency.setValueAtTime(chord.bass, startTime);

      bassGain.gain.setValueAtTime(0.0001, startTime);
      bassGain.gain.linearRampToValueAtTime(0.16, startTime + 0.05);
      bassGain.gain.linearRampToValueAtTime(0.11, startTime + durationSec * 0.7);
      bassGain.gain.linearRampToValueAtTime(0.0001, startTime + durationSec - 0.03);

      bassOsc.connect(bassGain);
      bassGain.connect(targetFilter);
      bassOsc.start(startTime);
      bassOsc.stop(startTime + durationSec);
    } catch {
      // Safe no-op on mock errors
    }

    // Rhodes electric piano chord voices with gentle human strum stagger
    chord.notes.forEach((freq, idx) => {
      const noteStart = startTime + idx * 0.024;
      const noteEnd = startTime + durationSec;

      try {
        const osc = audioCtx.createOscillator();
        const tine = audioCtx.createOscillator();
        const voiceGain = audioCtx.createGain();
        const tineGain = audioCtx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, noteStart);
        if (osc.detune && typeof osc.detune.setValueAtTime === "function") {
          osc.detune.setValueAtTime((idx % 2 === 0 ? 1 : -1) * 2.5, noteStart);
        }

        tine.type = "triangle";
        tine.frequency.setValueAtTime(freq * 2, noteStart);

        const peak = 0.095 / Math.sqrt(chord.notes.length);
        voiceGain.gain.setValueAtTime(0.0001, noteStart);
        voiceGain.gain.linearRampToValueAtTime(peak, noteStart + 0.035);
        voiceGain.gain.linearRampToValueAtTime(peak * 0.58, noteStart + durationSec * 0.55);
        voiceGain.gain.linearRampToValueAtTime(0.0001, Math.max(noteStart + 0.1, noteEnd - 0.04));

        tineGain.gain.setValueAtTime(0.0001, noteStart);
        tineGain.gain.linearRampToValueAtTime(peak * 0.22, noteStart + 0.02);
        tineGain.gain.linearRampToValueAtTime(0.0001, noteStart + 0.32);

        osc.connect(voiceGain);
        tine.connect(tineGain);
        tineGain.connect(voiceGain);
        voiceGain.connect(targetFilter);

        osc.start(noteStart);
        tine.start(noteStart);
        osc.stop(noteEnd);
        tine.stop(Math.min(noteEnd, noteStart + 0.36));
      } catch {
        // Safe no-op
      }
    });
  }

  function scheduleKalimbaNote(audioCtx, freq, startTime, targetBus = activeTrackBus || musicBus, gainLevel = 0.062) {
    if (!targetBus) return;
    try {
      const osc = audioCtx.createOscillator();
      const overtone = audioCtx.createOscillator();
      const env = audioCtx.createGain();
      const overtoneGain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);

      overtone.type = "sine";
      overtone.frequency.setValueAtTime(freq * 2.98, startTime);

      env.gain.setValueAtTime(0.0001, startTime);
      env.gain.linearRampToValueAtTime(gainLevel, startTime + 0.014);
      env.gain.linearRampToValueAtTime(gainLevel * 0.28, startTime + 0.22);
      env.gain.linearRampToValueAtTime(0.0001, startTime + 0.68);

      overtoneGain.gain.setValueAtTime(0.0001, startTime);
      overtoneGain.gain.linearRampToValueAtTime(gainLevel * 0.18, startTime + 0.008);
      overtoneGain.gain.linearRampToValueAtTime(0.0001, startTime + 0.11);

      osc.connect(env);
      overtone.connect(overtoneGain);
      overtoneGain.connect(env);
      env.connect(targetBus);

      osc.start(startTime);
      overtone.start(startTime);
      osc.stop(startTime + 0.72);
      overtone.stop(startTime + 0.14);
    } catch {
      // Safe no-op
    }
  }

  function scheduleSoftKick(audioCtx, startTime, targetBus, accent = 1) {
    if (!targetBus) return;
    try {
      const osc = audioCtx.createOscillator();
      const env = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(106, startTime);
      osc.frequency.linearRampToValueAtTime(46, startTime + 0.11);

      const level = 0.14 * accent;
      env.gain.setValueAtTime(0.0001, startTime);
      env.gain.linearRampToValueAtTime(level, startTime + 0.008);
      env.gain.linearRampToValueAtTime(0.0001, startTime + 0.23);

      osc.connect(env);
      env.connect(targetBus);

      osc.start(startTime);
      osc.stop(startTime + 0.25);
    } catch {
      // Safe no-op
    }
  }

  function scheduleBrushedHat(audioCtx, startTime, targetBus, accent = 1) {
    if (!targetBus || typeof audioCtx.createBufferSource !== "function") return;
    const buf = getNoiseBuffer(audioCtx);
    if (!buf) return;

    try {
      const src = audioCtx.createBufferSource();
      const filter = audioCtx.createBiquadFilter();
      const env = audioCtx.createGain();

      src.buffer = buf;
      filter.type = "bandpass";
      filter.frequency.value = 5400;
      filter.Q.value = 1.2;

      const level = 0.026 * accent;
      env.gain.setValueAtTime(0.0001, startTime);
      env.gain.linearRampToValueAtTime(level, startTime + 0.007);
      env.gain.linearRampToValueAtTime(0.0001, startTime + 0.055);

      src.connect(filter);
      filter.connect(env);
      env.connect(targetBus);

      src.start(startTime);
      src.stop(startTime + 0.07);
    } catch {
      // Safe no-op
    }
  }

  function scheduleLofiGardenStep(audioCtx, stepIndex, time, cfg) {
    const stepInBar = stepIndex % 8;
    const barIndex = Math.floor(stepIndex / 8) % LOFI_CHORD_PROGRESSION.length;
    const swungTime = stepInBar % 2 === 1 ? time + cfg.swingSec : time;
    const trackBus = activeTrackBus || musicBus;
    const trackFilter = activeTrackFilter || trackBus;

    // 1. Cozy Rhodes chord on beat 1 of each bar
    if (stepInBar === 0) {
      const chord = LOFI_CHORD_PROGRESSION[barIndex];
      scheduleRhodesChord(audioCtx, chord, time, cfg.eighthNoteSec * 8, trackFilter);
    }

    // 2. Soft pentatonic kalimba motif
    const melodyHz = LOFI_PENTATONIC_MOTIF[stepIndex % 64];
    if (melodyHz) {
      scheduleKalimbaNote(audioCtx, melodyHz, swungTime, trackBus, 0.055);
    }

    // 3. Ultra-soft chill sub kick (beat 1 & gentle syncopated lift on step 5)
    if (stepInBar === 0) {
      scheduleSoftKick(audioCtx, time, trackBus, 1.0);
    } else if (stepInBar === 5) {
      scheduleSoftKick(audioCtx, swungTime, trackBus, 0.58);
    }

    // 4. Quiet brushed hat on gentle 8th-note groove
    if (stepInBar === 2 || stepInBar === 6) {
      scheduleBrushedHat(audioCtx, time, trackBus, 1.0);
    } else if (stepInBar === 1 || stepInBar === 4 || stepInBar === 7) {
      scheduleBrushedHat(audioCtx, swungTime, trackBus, 0.55);
    }
  }

  // =========================================================================
  // TRACK 2: "ocean-breeze" — Nylon Guitar & Soft Waves (68 BPM, F Maj / D Min)
  // =========================================================================

  function scheduleWarmSinePad(audioCtx, chord, startTime, durationSec, targetFilter) {
    if (!targetFilter) return;

    // Soft warm bass foundation
    try {
      const bassOsc = audioCtx.createOscillator();
      const bassGain = audioCtx.createGain();
      bassOsc.type = "sine";
      bassOsc.frequency.setValueAtTime(chord.bass, startTime);

      bassGain.gain.setValueAtTime(0.0001, startTime);
      bassGain.gain.linearRampToValueAtTime(0.11, startTime + 0.22);
      bassGain.gain.linearRampToValueAtTime(0.085, startTime + durationSec * 0.72);
      bassGain.gain.linearRampToValueAtTime(0.0001, startTime + durationSec - 0.04);

      bassOsc.connect(bassGain);
      bassGain.connect(targetFilter);
      bassOsc.start(startTime);
      bassOsc.stop(startTime + durationSec);
    } catch {
      // Safe no-op
    }

    // Lush slow-bloom sine pad chord voices
    chord.pad.forEach((freq, idx) => {
      try {
        const osc = audioCtx.createOscillator();
        const env = audioCtx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);
        if (osc.detune && typeof osc.detune.setValueAtTime === "function") {
          osc.detune.setValueAtTime((idx % 2 === 0 ? 1 : -1) * 3.2, startTime);
        }

        const peak = 0.056 / Math.sqrt(chord.pad.length);
        env.gain.setValueAtTime(0.0001, startTime);
        env.gain.linearRampToValueAtTime(peak, startTime + 0.42);
        env.gain.linearRampToValueAtTime(peak * 0.72, startTime + durationSec * 0.75);
        env.gain.linearRampToValueAtTime(0.0001, startTime + durationSec - 0.05);

        osc.connect(env);
        env.connect(targetFilter);
        osc.start(startTime);
        osc.stop(startTime + durationSec);
      } catch {
        // Safe no-op
      }
    });
  }

  function scheduleNylonPluck(audioCtx, freq, startTime, targetBus, gainLevel = 0.075, sustainSec = 0.92) {
    if (!targetBus) return;
    try {
      const bodyOsc = audioCtx.createOscillator();
      const harmonicOsc = audioCtx.createOscillator();
      const pluckFilter = audioCtx.createBiquadFilter();
      const env = audioCtx.createGain();
      const harmonicGain = audioCtx.createGain();

      bodyOsc.type = "triangle";
      bodyOsc.frequency.setValueAtTime(freq, startTime);

      harmonicOsc.type = "sine";
      harmonicOsc.frequency.setValueAtTime(freq * 2, startTime);

      // Dynamic finger-pluck lowpass contour for warm nylon string timbre
      pluckFilter.type = "lowpass";
      pluckFilter.Q.value = 0.75;
      pluckFilter.frequency.setValueAtTime(Math.min(2200, Math.max(950, freq * 4.2)), startTime);
      pluckFilter.frequency.linearRampToValueAtTime(Math.max(580, freq * 1.8), startTime + 0.26);

      env.gain.setValueAtTime(0.0001, startTime);
      env.gain.linearRampToValueAtTime(gainLevel, startTime + 0.012);
      env.gain.linearRampToValueAtTime(gainLevel * 0.34, startTime + 0.25);
      env.gain.linearRampToValueAtTime(0.0001, startTime + sustainSec);

      harmonicGain.gain.setValueAtTime(0.0001, startTime);
      harmonicGain.gain.linearRampToValueAtTime(gainLevel * 0.24, startTime + 0.009);
      harmonicGain.gain.linearRampToValueAtTime(0.0001, startTime + 0.14);

      bodyOsc.connect(pluckFilter);
      harmonicOsc.connect(harmonicGain);
      harmonicGain.connect(pluckFilter);
      pluckFilter.connect(env);
      env.connect(targetBus);

      bodyOsc.start(startTime);
      harmonicOsc.start(startTime);
      bodyOsc.stop(startTime + sustainSec + 0.03);
      harmonicOsc.stop(startTime + 0.17);
    } catch {
      // Safe no-op
    }
  }

  function scheduleWoodRim(audioCtx, startTime, targetBus, accent = 1) {
    if (!targetBus) return;
    try {
      const osc = audioCtx.createOscillator();
      const env = audioCtx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(760, startTime);
      osc.frequency.linearRampToValueAtTime(410, startTime + 0.022);

      const level = 0.042 * accent;
      env.gain.setValueAtTime(0.0001, startTime);
      env.gain.linearRampToValueAtTime(level, startTime + 0.005);
      env.gain.linearRampToValueAtTime(0.0001, startTime + 0.045);

      osc.connect(env);
      env.connect(targetBus);

      osc.start(startTime);
      osc.stop(startTime + 0.055);
    } catch {
      // Safe no-op
    }

    // Subtle organic wooden tap air
    if (typeof audioCtx.createBufferSource === "function") {
      const buf = getNoiseBuffer(audioCtx);
      if (!buf) return;
      try {
        const src = audioCtx.createBufferSource();
        const filter = audioCtx.createBiquadFilter();
        const env = audioCtx.createGain();

        src.buffer = buf;
        filter.type = "bandpass";
        filter.frequency.value = 1750;
        filter.Q.value = 2.8;

        env.gain.setValueAtTime(0.0001, startTime);
        env.gain.linearRampToValueAtTime(0.02 * accent, startTime + 0.004);
        env.gain.linearRampToValueAtTime(0.0001, startTime + 0.032);

        src.connect(filter);
        filter.connect(env);
        env.connect(targetBus);

        src.start(startTime);
        src.stop(startTime + 0.04);
      } catch {
        // Safe no-op
      }
    }
  }

  function scheduleWaveShimmer(audioCtx, startTime, targetBus) {
    if (!targetBus || typeof audioCtx.createBufferSource !== "function") return;
    const buf = getNoiseBuffer(audioCtx);
    if (!buf) return;

    try {
      const src = audioCtx.createBufferSource();
      const filter = audioCtx.createBiquadFilter();
      const env = audioCtx.createGain();

      src.buffer = buf;
      filter.type = "bandpass";
      filter.Q.value = 0.9;
      filter.frequency.setValueAtTime(320, startTime);
      filter.frequency.linearRampToValueAtTime(860, startTime + 0.72);
      filter.frequency.linearRampToValueAtTime(280, startTime + 1.65);

      env.gain.setValueAtTime(0.0001, startTime);
      env.gain.linearRampToValueAtTime(0.036, startTime + 0.58);
      env.gain.linearRampToValueAtTime(0.018, startTime + 1.15);
      env.gain.linearRampToValueAtTime(0.0001, startTime + 1.7);

      src.connect(filter);
      filter.connect(env);
      env.connect(targetBus);

      src.start(startTime);
      src.stop(startTime + 1.74);
    } catch {
      // Safe no-op
    }
  }

  function scheduleOceanBreezeStep(audioCtx, stepIndex, time, cfg) {
    const stepInBar = stepIndex % 8;
    const barIndex = Math.floor(stepIndex / 8) % OCEAN_CHORD_PROGRESSION.length;
    const chord = OCEAN_CHORD_PROGRESSION[barIndex];
    const grooveTime = stepInBar % 2 === 1 ? time + cfg.swingSec : time;
    const trackBus = activeTrackBus || musicBus;
    const trackFilter = activeTrackFilter || trackBus;

    // 1. Lush warm sine-pad chord on beat 1 of each bar
    if (stepInBar === 0) {
      scheduleWarmSinePad(audioCtx, chord, time, cfg.eighthNoteSec * 8, trackFilter);
    }

    // 2. Warm acoustic nylon-guitar plucked bossa arpeggio
    if (stepInBar === 0) {
      // Thumb bass + inner string fingerpick
      scheduleNylonPluck(audioCtx, chord.arp[0], time, trackFilter, 0.088, 1.05);
      scheduleNylonPluck(audioCtx, chord.arp[2], time + 0.018, trackFilter, 0.062, 0.85);
    } else if (stepInBar === 2) {
      scheduleNylonPluck(audioCtx, chord.arp[3], time, trackFilter, 0.066, 0.82);
    } else if (stepInBar === 3) {
      // Syncopated bossa lift
      scheduleNylonPluck(audioCtx, chord.arp[4], grooveTime, trackFilter, 0.072, 0.9);
    } else if (stepInBar === 5) {
      scheduleNylonPluck(audioCtx, chord.arp[5], grooveTime, trackFilter, 0.064, 0.85);
    } else if (stepInBar === 6) {
      scheduleNylonPluck(audioCtx, chord.arp[6], time, trackFilter, 0.058, 0.78);
    } else if (stepInBar === 7 && barIndex % 2 === 0) {
      scheduleNylonPluck(audioCtx, chord.arp[7], grooveTime, trackFilter, 0.052, 0.72);
    }

    // 3. Delicate sunset melody shimmer on high strings
    const melodyHz = OCEAN_MELODY_MOTIF[stepIndex % 64];
    if (melodyHz) {
      scheduleNylonPluck(audioCtx, melodyHz, grooveTime, trackBus, 0.048, 0.95);
    }

    // 4. Gentle syncopated bossa-chill wood-rim & soft heartbeat bass tap
    if (stepInBar === 0) {
      scheduleSoftKick(audioCtx, time, trackBus, 0.62);
      scheduleWoodRim(audioCtx, time, trackBus, 0.75);
    } else if (stepInBar === 3) {
      scheduleWoodRim(audioCtx, grooveTime, trackBus, 1.0);
    } else if (stepInBar === 6 && barIndex % 2 === 0) {
      scheduleWoodRim(audioCtx, time, trackBus, 0.68);
    } else if (stepInBar === 5 && barIndex % 2 === 1) {
      scheduleWoodRim(audioCtx, grooveTime, trackBus, 0.65);
    }

    // 5. Airy ocean wave-shimmer swell every 2 bars
    if (stepInBar === 0 && barIndex % 2 === 0) {
      scheduleWaveShimmer(audioCtx, time + 0.04, trackBus);
    }
  }

  // =========================================================================
  // TRACK 3: "night-tea" — Pentatonic Guzheng & Soft Flute (64 BPM, D Maj Pentatonic)
  // =========================================================================

  function scheduleGuzhengPluck(audioCtx, freq, startTime, targetBus, gainLevel = 0.068, sustainSec = 1.25) {
    if (!targetBus) return;
    try {
      const fundamental = audioCtx.createOscillator();
      const secondHarm = audioCtx.createOscillator();
      const bellHarm = audioCtx.createOscillator();
      const filter = audioCtx.createBiquadFilter();
      const env = audioCtx.createGain();
      const secondGain = audioCtx.createGain();
      const bellGain = audioCtx.createGain();

      fundamental.type = "sine";
      // Subtle silk-string pitch settle for authentic đàn tranh / guzheng feel
      fundamental.frequency.setValueAtTime(freq * 0.996, startTime);
      fundamental.frequency.linearRampToValueAtTime(freq, startTime + 0.032);

      secondHarm.type = "triangle";
      secondHarm.frequency.setValueAtTime(freq * 2, startTime);

      bellHarm.type = "sine";
      bellHarm.frequency.setValueAtTime(freq * 3, startTime);

      filter.type = "lowpass";
      filter.Q.value = 0.7;
      filter.frequency.setValueAtTime(Math.min(2600, Math.max(1200, freq * 3.6)), startTime);
      filter.frequency.linearRampToValueAtTime(Math.max(760, freq * 1.9), startTime + 0.42);

      env.gain.setValueAtTime(0.0001, startTime);
      env.gain.linearRampToValueAtTime(gainLevel, startTime + 0.014);
      env.gain.linearRampToValueAtTime(gainLevel * 0.36, startTime + 0.32);
      env.gain.linearRampToValueAtTime(0.0001, startTime + sustainSec);

      secondGain.gain.setValueAtTime(0.0001, startTime);
      secondGain.gain.linearRampToValueAtTime(gainLevel * 0.28, startTime + 0.01);
      secondGain.gain.linearRampToValueAtTime(0.0001, startTime + 0.38);

      bellGain.gain.setValueAtTime(0.0001, startTime);
      bellGain.gain.linearRampToValueAtTime(gainLevel * 0.14, startTime + 0.008);
      bellGain.gain.linearRampToValueAtTime(0.0001, startTime + 0.19);

      fundamental.connect(filter);
      secondHarm.connect(secondGain);
      secondGain.connect(filter);
      bellHarm.connect(bellGain);
      bellGain.connect(filter);

      filter.connect(env);
      env.connect(targetBus);

      fundamental.start(startTime);
      secondHarm.start(startTime);
      bellHarm.start(startTime);

      fundamental.stop(startTime + sustainSec + 0.04);
      secondHarm.stop(startTime + 0.42);
      bellHarm.stop(startTime + 0.22);
    } catch {
      // Safe no-op
    }
  }

  function scheduleFlutePad(audioCtx, chord, startTime, durationSec, targetFilter, targetBus) {
    if (!targetFilter) return;

    // Warm resonant low drone root
    try {
      const rootOsc = audioCtx.createOscillator();
      const rootGain = audioCtx.createGain();
      rootOsc.type = "sine";
      rootOsc.frequency.setValueAtTime(chord.bass, startTime);

      rootGain.gain.setValueAtTime(0.0001, startTime);
      rootGain.gain.linearRampToValueAtTime(0.11, startTime + 0.35);
      rootGain.gain.linearRampToValueAtTime(0.08, startTime + durationSec * 0.72);
      rootGain.gain.linearRampToValueAtTime(0.0001, startTime + durationSec - 0.05);

      rootOsc.connect(rootGain);
      rootGain.connect(targetFilter);
      rootOsc.start(startTime);
      rootOsc.stop(startTime + durationSec);
    } catch {
      // Safe no-op
    }

    // Soft pentatonic pad bed
    chord.pad.forEach((freq, idx) => {
      try {
        const osc = audioCtx.createOscillator();
        const env = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);
        if (osc.detune && typeof osc.detune.setValueAtTime === "function") {
          osc.detune.setValueAtTime((idx % 2 === 0 ? 1 : -1) * 2.2, startTime);
        }

        const peak = 0.048 / Math.sqrt(chord.pad.length);
        env.gain.setValueAtTime(0.0001, startTime);
        env.gain.linearRampToValueAtTime(peak, startTime + 0.55);
        env.gain.linearRampToValueAtTime(peak * 0.65, startTime + durationSec * 0.78);
        env.gain.linearRampToValueAtTime(0.0001, startTime + durationSec - 0.05);

        osc.connect(env);
        env.connect(targetFilter);
        osc.start(startTime);
        osc.stop(startTime + durationSec);
      } catch {
        // Safe no-op
      }
    });

    // Warm breathy bamboo-flute-like triangle overtone voice
    try {
      const fluteOsc = audioCtx.createOscillator();
      const fluteFilter = audioCtx.createBiquadFilter();
      const fluteEnv = audioCtx.createGain();

      fluteOsc.type = "triangle";
      fluteOsc.frequency.setValueAtTime(chord.fluteHz * 0.992, startTime + 0.15);
      fluteOsc.frequency.linearRampToValueAtTime(chord.fluteHz, startTime + 0.55);

      fluteFilter.type = "lowpass";
      fluteFilter.frequency.value = 1400;
      fluteFilter.Q.value = 0.8;

      fluteEnv.gain.setValueAtTime(0.0001, startTime + 0.15);
      fluteEnv.gain.linearRampToValueAtTime(0.032, startTime + 0.78);
      fluteEnv.gain.linearRampToValueAtTime(0.022, startTime + durationSec * 0.72);
      fluteEnv.gain.linearRampToValueAtTime(0.0001, startTime + durationSec - 0.08);

      fluteOsc.connect(fluteFilter);
      fluteFilter.connect(fluteEnv);
      fluteEnv.connect(targetFilter);

      fluteOsc.start(startTime + 0.15);
      fluteOsc.stop(startTime + durationSec);
    } catch {
      // Safe no-op
    }

    // Whisper of bamboo-flute breath air
    if (targetBus && typeof audioCtx.createBufferSource === "function") {
      const buf = getNoiseBuffer(audioCtx);
      if (buf) {
        try {
          const src = audioCtx.createBufferSource();
          const filter = audioCtx.createBiquadFilter();
          const env = audioCtx.createGain();

          src.buffer = buf;
          filter.type = "bandpass";
          filter.frequency.value = 1150;
          filter.Q.value = 2.4;

          env.gain.setValueAtTime(0.0001, startTime + 0.2);
          env.gain.linearRampToValueAtTime(0.011, startTime + 0.75);
          env.gain.linearRampToValueAtTime(0.0001, startTime + 1.55);

          src.connect(filter);
          filter.connect(env);
          env.connect(targetBus);

          src.start(startTime + 0.2);
          src.stop(startTime + 1.6);
        } catch {
          // Safe no-op
        }
      }
    }
  }

  function scheduleMutedLowPulse(audioCtx, startTime, targetBus, accent = 1) {
    if (!targetBus) return;
    try {
      const osc = audioCtx.createOscillator();
      const env = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(84, startTime);
      osc.frequency.linearRampToValueAtTime(48, startTime + 0.15);

      const level = 0.095 * accent;
      env.gain.setValueAtTime(0.0001, startTime);
      env.gain.linearRampToValueAtTime(level, startTime + 0.018);
      env.gain.linearRampToValueAtTime(0.0001, startTime + 0.28);

      osc.connect(env);
      env.connect(targetBus);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
    } catch {
      // Safe no-op
    }
  }

  function scheduleSoftWoodTap(audioCtx, startTime, targetBus) {
    if (!targetBus) return;
    try {
      const osc = audioCtx.createOscillator();
      const env = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(610, startTime);
      osc.frequency.linearRampToValueAtTime(510, startTime + 0.045);

      env.gain.setValueAtTime(0.0001, startTime);
      env.gain.linearRampToValueAtTime(0.024, startTime + 0.008);
      env.gain.linearRampToValueAtTime(0.0001, startTime + 0.085);

      osc.connect(env);
      env.connect(targetBus);

      osc.start(startTime);
      osc.stop(startTime + 0.1);
    } catch {
      // Safe no-op
    }
  }

  function scheduleNightTeaStep(audioCtx, stepIndex, time, cfg) {
    const stepInBar = stepIndex % 8;
    const barIndex = Math.floor(stepIndex / 8) % NIGHT_TEA_PROGRESSION.length;
    const chord = NIGHT_TEA_PROGRESSION[barIndex];
    const gentleTime = stepInBar % 2 === 1 ? time + cfg.swingSec : time;
    const trackBus = activeTrackBus || musicBus;
    const trackFilter = activeTrackFilter || trackBus;

    // 1. Warm breathy flute overtone pad + cascading pentatonic harp brush on beat 1
    if (stepInBar === 0) {
      scheduleFlutePad(audioCtx, chord, time, cfg.eighthNoteSec * 8, trackFilter, trackBus);
      chord.harp.forEach((hz, idx) => {
        scheduleGuzhengPluck(audioCtx, hz, time + idx * 0.072, trackFilter, 0.056, 1.3);
      });
    }

    // 2. Serene D Major Pentatonic đàn tranh / guzheng melody
    const melodyHz = NIGHT_TEA_PENTATONIC_MOTIF[stepIndex % 64];
    if (melodyHz) {
      scheduleGuzhengPluck(audioCtx, melodyHz, gentleTime, trackBus, 0.064, 1.35);
    }

    // 3. Whisper-soft muted low pulse & distant tea-house wood tap
    if (stepInBar === 0) {
      scheduleMutedLowPulse(audioCtx, time, trackBus, 1.0);
    } else if (stepInBar === 4 && barIndex % 2 === 0) {
      scheduleMutedLowPulse(audioCtx, time, trackBus, 0.52);
    } else if (stepInBar === 6 && barIndex % 2 === 1) {
      scheduleSoftWoodTap(audioCtx, time, trackBus);
    }
  }

  // =========================================================================
  // SCHEDULER & TRACK SWITCHING
  // =========================================================================

  function scheduleStep(audioCtx, stepIndex, time) {
    const cfg = getTrackConfig(currentTrackId);
    if (currentTrackId === "ocean-breeze") {
      scheduleOceanBreezeStep(audioCtx, stepIndex, time, cfg);
    } else if (currentTrackId === "night-tea") {
      scheduleNightTeaStep(audioCtx, stepIndex, time, cfg);
    } else {
      scheduleLofiGardenStep(audioCtx, stepIndex, time, cfg);
    }
  }

  function clearSchedulerTimer() {
    if (schedulerId !== null) {
      clearInterval(schedulerId);
      schedulerId = null;
    }
  }

  function runScheduler() {
    if (!playing || disposed || !ctx) return;
    const now = ctx.currentTime || 0;
    const cfg = getTrackConfig(currentTrackId);

    // Recover gracefully if the browser tab was backgrounded for a long time
    if (nextStepTime < now - 0.5) {
      nextStepTime = now + 0.04;
    }

    while (nextStepTime < now + SCHEDULE_AHEAD_SECONDS) {
      scheduleStep(ctx, currentStep, nextStepTime);
      currentStep = (currentStep + 1) % 64;
      nextStepTime += cfg.eighthNoteSec;
    }
  }

  function getTrack() {
    return currentTrackId;
  }

  function setTrack(trackId) {
    const nextTrackId = resolveTrackId(trackId);
    if (disposed) return currentTrackId;

    if (nextTrackId === currentTrackId) {
      return currentTrackId;
    }

    currentTrackId = nextTrackId;

    if (!ctx || !musicBus) {
      return currentTrackId;
    }

    if (playing) {
      // Smoothly crossfade sub-buses & reschedule cleanly at the new track's BPM with zero overlapping timers
      clearSchedulerTimer();
      const now = ctx.currentTime || 0;
      createTrackSubBus(ctx, currentTrackId, 0.26);
      currentStep = 0;
      nextStepTime = now + 0.06;
      runScheduler();
      schedulerId = setInterval(runScheduler, SCHEDULER_INTERVAL_MS);
    } else {
      // Update sub-bus silently for the next startMusic()
      createTrackSubBus(ctx, currentTrackId, 0);
    }

    return currentTrackId;
  }

  function startMusic() {
    if (disposed) return;
    const audioCtx = ensureContext();
    if (!audioCtx) return;

    resumeIfSuspended(audioCtx);
    const now = audioCtx.currentTime || 0;

    if (activeTrackBusId !== currentTrackId || !activeTrackBus) {
      createTrackSubBus(audioCtx, currentTrackId, 0);
    }

    if (!playing) {
      playing = true;
      currentStep = 0;
      nextStepTime = now + 0.05;
      smoothRamp(musicBus?.gain, MUSIC_BASE_GAIN, 0.75, now);
      runScheduler();
      if (schedulerId === null) {
        schedulerId = setInterval(runScheduler, SCHEDULER_INTERVAL_MS);
      }
    } else {
      smoothRamp(musicBus?.gain, MUSIC_BASE_GAIN, 0.35, now);
    }
  }

  function stopMusic() {
    clearSchedulerTimer();
    playing = false;

    if (disposed || !ctx || !musicBus) return;
    const now = ctx.currentTime || 0;
    smoothRamp(musicBus.gain, 0.0001, 0.4, now);
  }

  function setMuted(nextMuted) {
    muted = Boolean(nextMuted);
    if (disposed || !ctx || !masterGain) return;
    const now = ctx.currentTime || 0;
    smoothRamp(masterGain.gain, muted ? 0 : 1, 0.08, now);
  }

  function isMuted() {
    return muted;
  }

  function duck(isDucked) {
    ducked = Boolean(isDucked);
    if (disposed || !ctx || !musicDuckGain) return;
    const now = ctx.currentTime || 0;
    smoothRamp(musicDuckGain.gain, ducked ? DUCKED_GAIN : 1, 0.18, now);
  }

  // =========================================================================
  // GAMEPLAY SFX
  // =========================================================================

  function prepareSfxContext() {
    if (disposed || muted) return null;
    const audioCtx = ensureContext();
    if (!audioCtx || !sfxBus) return null;
    resumeIfSuspended(audioCtx);
    return audioCtx;
  }

  function playJumpSfx() {
    const audioCtx = prepareSfxContext();
    if (!audioCtx) return;

    const now = audioCtx.currentTime || 0;
    try {
      const osc = audioCtx.createOscillator();
      const shimmer = audioCtx.createOscillator();
      const env = audioCtx.createGain();
      const shimmerGain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(290, now);
      osc.frequency.linearRampToValueAtTime(580, now + 0.13);

      shimmer.type = "triangle";
      shimmer.frequency.setValueAtTime(580, now);
      shimmer.frequency.linearRampToValueAtTime(860, now + 0.12);

      env.gain.setValueAtTime(0.0001, now);
      env.gain.linearRampToValueAtTime(0.18, now + 0.015);
      env.gain.linearRampToValueAtTime(0.0001, now + 0.17);

      shimmerGain.gain.setValueAtTime(0.0001, now);
      shimmerGain.gain.linearRampToValueAtTime(0.06, now + 0.015);
      shimmerGain.gain.linearRampToValueAtTime(0.0001, now + 0.13);

      osc.connect(env);
      shimmer.connect(shimmerGain);
      shimmerGain.connect(env);
      env.connect(sfxBus);

      osc.start(now);
      shimmer.start(now);
      osc.stop(now + 0.19);
      shimmer.stop(now + 0.15);
    } catch {
      // Safe no-op
    }
  }

  /**
   * Light joyful springy upward sweep when the cat vaults cleanly over a hurdle!
   */
  function playVaultSfx() {
    const audioCtx = prepareSfxContext();
    if (!audioCtx) return;

    const now = audioCtx.currentTime || 0;
    try {
      const springOsc = audioCtx.createOscillator();
      const overtoneOsc = audioCtx.createOscillator();
      const env = audioCtx.createGain();
      const overtoneGain = audioCtx.createGain();

      springOsc.type = "sine";
      springOsc.frequency.setValueAtTime(260, now);
      springOsc.frequency.linearRampToValueAtTime(440, now + 0.065);
      springOsc.frequency.linearRampToValueAtTime(760, now + 0.175);

      overtoneOsc.type = "triangle";
      overtoneOsc.frequency.setValueAtTime(520, now);
      overtoneOsc.frequency.linearRampToValueAtTime(1174.66, now + 0.16);

      env.gain.setValueAtTime(0.0001, now);
      env.gain.linearRampToValueAtTime(0.18, now + 0.016);
      env.gain.linearRampToValueAtTime(0.11, now + 0.11);
      env.gain.linearRampToValueAtTime(0.0001, now + 0.22);

      overtoneGain.gain.setValueAtTime(0.0001, now);
      overtoneGain.gain.linearRampToValueAtTime(0.065, now + 0.014);
      overtoneGain.gain.linearRampToValueAtTime(0.0001, now + 0.17);

      springOsc.connect(env);
      overtoneOsc.connect(overtoneGain);
      overtoneGain.connect(env);
      env.connect(sfxBus);

      springOsc.start(now);
      overtoneOsc.start(now);
      springOsc.stop(now + 0.24);
      overtoneOsc.stop(now + 0.19);
    } catch {
      // Safe no-op
    }

    // Crisp playful apex sparkle at peak of the leap
    scheduleKalimbaNote(audioCtx, 783.99, now + 0.075, sfxBus, 0.095); // G5
    scheduleKalimbaNote(audioCtx, 1046.5, now + 0.135, sfxBus, 0.11); // C6
  }

  /**
   * Crisp playful wooden hurdle shatter / crackle + descending wood-plank clatter + gentle stumble thud.
   */
  function playCrashSfx() {
    const audioCtx = prepareSfxContext();
    if (!audioCtx) return;

    const now = audioCtx.currentTime || 0;

    // 1. Filtered short wooden snap / crackle noise burst
    const buf = getNoiseBuffer(audioCtx);
    if (buf && typeof audioCtx.createBufferSource === "function") {
      try {
        const src = audioCtx.createBufferSource();
        const crackFilter = audioCtx.createBiquadFilter();
        const crackEnv = audioCtx.createGain();

        src.buffer = buf;
        crackFilter.type = "bandpass";
        crackFilter.Q.value = 1.4;
        crackFilter.frequency.setValueAtTime(1480, now);
        crackFilter.frequency.linearRampToValueAtTime(640, now + 0.11);

        crackEnv.gain.setValueAtTime(0.0001, now);
        crackEnv.gain.linearRampToValueAtTime(0.2, now + 0.008);
        crackEnv.gain.linearRampToValueAtTime(0.06, now + 0.055);
        crackEnv.gain.linearRampToValueAtTime(0.0001, now + 0.125);

        src.connect(crackFilter);
        crackFilter.connect(crackEnv);
        crackEnv.connect(sfxBus);

        src.start(now);
        src.stop(now + 0.14);
      } catch {
        // Safe no-op
      }
    }

    // 2. Descending hollow wood-plank clatter (3 playful tumbling slats)
    try {
      const woodFilter = audioCtx.createBiquadFilter();
      woodFilter.type = "lowpass";
      woodFilter.frequency.value = 1250;
      woodFilter.Q.value = 0.8;
      woodFilter.connect(sfxBus);

      [
        { offset: 0.025, fromHz: 520, toHz: 335, gain: 0.14, dur: 0.075 },
        { offset: 0.095, fromHz: 410, toHz: 255, gain: 0.115, dur: 0.085 },
        { offset: 0.168, fromHz: 305, toHz: 190, gain: 0.088, dur: 0.092 },
      ].forEach((plank) => {
        const start = now + plank.offset;
        const osc = audioCtx.createOscillator();
        const env = audioCtx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(plank.fromHz, start);
        osc.frequency.linearRampToValueAtTime(plank.toHz, start + plank.dur);

        env.gain.setValueAtTime(0.0001, start);
        env.gain.linearRampToValueAtTime(plank.gain, start + 0.008);
        env.gain.linearRampToValueAtTime(0.0001, start + plank.dur);

        osc.connect(env);
        env.connect(woodFilter);

        osc.start(start);
        osc.stop(start + plank.dur + 0.02);
      });
    } catch {
      // Safe no-op
    }

    // 3. Gentle muffled cartoon stumble thud (warm, never harsh)
    try {
      const thudFilter = audioCtx.createBiquadFilter();
      const thudOsc = audioCtx.createOscillator();
      const thudEnv = audioCtx.createGain();

      thudFilter.type = "lowpass";
      thudFilter.frequency.value = 360;

      thudOsc.type = "sine";
      thudOsc.frequency.setValueAtTime(155, now);
      thudOsc.frequency.linearRampToValueAtTime(68, now + 0.16);

      thudEnv.gain.setValueAtTime(0.0001, now);
      thudEnv.gain.linearRampToValueAtTime(0.19, now + 0.012);
      thudEnv.gain.linearRampToValueAtTime(0.0001, now + 0.18);

      thudOsc.connect(thudEnv);
      thudEnv.connect(thudFilter);
      thudFilter.connect(sfxBus);

      thudOsc.start(now);
      thudOsc.stop(now + 0.2);
    } catch {
      // Safe no-op
    }
  }

  function PENTATONIC_CHIME(index) {
    const clamped = Math.max(0, Math.min(STREAK_PENTATONIC_HZ.length - 1, index));
    return STREAK_PENTATONIC_HZ[clamped];
  }

  function playCorrectSfx(streak = 1) {
    const audioCtx = prepareSfxContext();
    if (!audioCtx) return;

    const now = audioCtx.currentTime || 0;
    const safeStreak = Number.isFinite(Number(streak)) ? Math.max(1, Math.floor(Number(streak))) : 1;
    const baseOffset = Math.min(2, Math.floor((safeStreak - 1) / 3));

    const chordNotes = [
      PENTATONIC_CHIME(baseOffset),
      PENTATONIC_CHIME(baseOffset + 1),
      PENTATONIC_CHIME(baseOffset + 2),
    ];
    if (safeStreak >= 3) {
      chordNotes.push(PENTATONIC_CHIME(baseOffset + 3));
    }

    chordNotes.forEach((hz, idx) => {
      scheduleKalimbaNote(audioCtx, hz, now + idx * 0.055, sfxBus, 0.16);
    });
  }

  function playWrongSfx() {
    const audioCtx = prepareSfxContext();
    if (!audioCtx) return;

    const now = audioCtx.currentTime || 0;
    try {
      const filter = audioCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 420;
      filter.connect(sfxBus);

      // Gentle two-step muffled cartoon stumble thud
      [
        { offset: 0, fromHz: 185, toHz: 96, gain: 0.22, dur: 0.14 },
        { offset: 0.095, fromHz: 132, toHz: 78, gain: 0.16, dur: 0.15 },
      ].forEach((hit) => {
        const start = now + hit.offset;
        const osc = audioCtx.createOscillator();
        const env = audioCtx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(hit.fromHz, start);
        osc.frequency.linearRampToValueAtTime(hit.toHz, start + hit.dur);

        env.gain.setValueAtTime(0.0001, start);
        env.gain.linearRampToValueAtTime(hit.gain, start + 0.012);
        env.gain.linearRampToValueAtTime(0.0001, start + hit.dur);

        osc.connect(env);
        env.connect(filter);

        osc.start(start);
        osc.stop(start + hit.dur + 0.02);
      });
    } catch {
      // Safe no-op
    }
  }

  function playSceneChangeSfx() {
    const audioCtx = prepareSfxContext();
    if (!audioCtx) return;

    const now = audioCtx.currentTime || 0;

    // Dreamy soft breeze sweep
    const buf = getNoiseBuffer(audioCtx);
    if (buf && typeof audioCtx.createBufferSource === "function") {
      try {
        const src = audioCtx.createBufferSource();
        const filter = audioCtx.createBiquadFilter();
        const env = audioCtx.createGain();

        src.buffer = buf;
        filter.type = "bandpass";
        filter.Q.value = 1.6;
        filter.frequency.setValueAtTime(650, now);
        filter.frequency.linearRampToValueAtTime(1650, now + 0.22);
        filter.frequency.linearRampToValueAtTime(880, now + 0.44);

        env.gain.setValueAtTime(0.0001, now);
        env.gain.linearRampToValueAtTime(0.09, now + 0.12);
        env.gain.linearRampToValueAtTime(0.0001, now + 0.44);

        src.connect(filter);
        filter.connect(env);
        env.connect(sfxBus);

        src.start(now);
        src.stop(now + 0.45);
      } catch {
        // Safe no-op
      }
    }

    // Soft wind-chime shimmer
    [659.25, 783.99, 987.77, 1174.66].forEach((hz, idx) => {
      scheduleKalimbaNote(audioCtx, hz, now + 0.04 + idx * 0.075, sfxBus, 0.09);
    });
  }

  function playVictorySfx() {
    const audioCtx = prepareSfxContext();
    if (!audioCtx) return;

    const now = audioCtx.currentTime || 0;
    // Warm resolving Cmaj9 arpeggio
    const arpeggio = [261.63, 329.63, 392.0, 493.88, 587.33, 783.99];
    arpeggio.forEach((hz, idx) => {
      scheduleKalimbaNote(audioCtx, hz, now + idx * 0.085, sfxBus, idx === arpeggio.length - 1 ? 0.18 : 0.13);
    });
  }

  function dispose() {
    if (disposed) return;
    stopMusic();
    disposed = true;

    const instance = ctx;
    ctx = null;
    masterGain = null;
    musicDuckGain = null;
    musicBus = null;
    activeTrackBus = null;
    activeTrackFilter = null;
    activeTrackBusId = null;
    sfxBus = null;
    noiseBuffer = null;

    if (instance && typeof instance.close === "function") {
      try {
        const res = instance.close();
        if (res && typeof res.catch === "function") {
          res.catch(() => {});
        }
      } catch {
        // Ignore close failures on already-closed context
      }
    }
  }

  return {
    getTrack,
    setTrack,
    startMusic,
    stopMusic,
    setMuted,
    isMuted,
    duck,
    playJumpSfx,
    playVaultSfx,
    playCrashSfx,
    playCorrectSfx,
    playWrongSfx,
    playSceneChangeSfx,
    playVictorySfx,
    dispose,
  };
}
