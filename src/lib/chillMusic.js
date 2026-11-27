/**
 * Pure Web Audio Lo-Fi Chill Ambient Music & SFX Engine
 * for "Đuổi Bắt Đồng Nghĩa – Trái Nghĩa".
 *
 * Zero external audio files — synthesizes:
 * - Warm Rhodes electric piano chord loop (Fmaj7 -> Em7 -> Dm7 -> Cmaj7 / Am9) through ~1350 Hz lowpass
 * - Soft C-major pentatonic kalimba/bell melody motif
 * - Ultra-soft muted chill percussion (gentle sub kick + quiet brushed hat at 74 BPM)
 * - Smooth linearRampToValueAtTime fade-in/out and TTS ducking (~22%)
 * - Click-free gameplay SFX (jump, correct streak chime, gentle wrong stumble, scene breeze, victory)
 * - Graceful no-op in SSR/jsdom or environments without Web Audio API
 */

const TEMPO_BPM = 74;
const EIGHTH_NOTE_SECONDS = 60 / TEMPO_BPM / 2;
const SCHEDULER_INTERVAL_MS = 120;
const SCHEDULE_AHEAD_SECONDS = 0.28;
const LOFI_SWING_SECONDS = 0.018;

const MUSIC_BASE_GAIN = 0.42;
const DUCKED_GAIN = 0.22;
const RHODES_LOWPASS_HZ = 1350;

/**
 * 8-bar cozy lo-fi progression:
 * Bars 0-3: Fmaj7 -> Em7 -> Dm7 -> Cmaj7
 * Bars 4-7: Fmaj7 -> Em7 -> Dm7 -> Am9
 */
const CHORD_PROGRESSION = Object.freeze([
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
 * Null entries leave warm breathing room so the music stays relaxing and non-intrusive.
 */
const PENTATONIC_MOTIF = Object.freeze({
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

const STREAK_PENTATONIC_HZ = Object.freeze([
  523.25, // C5
  587.33, // D5
  659.25, // E5
  783.99, // G5
  880.0, // A5
  1046.5, // C6
]);

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
 * Create a self-contained Web Audio lo-fi chill background music & gameplay SFX engine.
 */
export function createChillAudioEngine() {
  let ctx = null;
  let masterGain = null;
  let musicDuckGain = null;
  let musicBus = null;
  let rhodesFilter = null;
  let sfxBus = null;
  let noiseBuffer = null;

  let muted = false;
  let ducked = false;
  let playing = false;
  let disposed = false;

  let schedulerId = null;
  let currentStep = 0;
  let nextStepTime = 0;

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
      const filter = instance.createBiquadFilter();

      master.gain.value = muted ? 0 : 1;
      duckGain.gain.value = ducked ? DUCKED_GAIN : 1;
      music.gain.value = 0;
      sfx.gain.value = 0.72;

      filter.type = "lowpass";
      filter.frequency.value = RHODES_LOWPASS_HZ;
      filter.Q.value = 0.7;

      filter.connect(music);
      music.connect(duckGain);
      duckGain.connect(master);
      sfx.connect(master);
      master.connect(instance.destination);

      ctx = instance;
      masterGain = master;
      musicDuckGain = duckGain;
      musicBus = music;
      rhodesFilter = filter;
      sfxBus = sfx;

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
      const length = Math.max(1, Math.floor(sampleRate * 0.45));
      const buffer = audioCtx.createBuffer(1, length, sampleRate);
      if (typeof buffer.getChannelData === "function") {
        const data = buffer.getChannelData(0);
        // Gently smoothed noise for soft lo-fi brushed percussion & breeze
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

  function scheduleRhodesChord(audioCtx, chord, startTime, durationSec) {
    if (!rhodesFilter) return;

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
      bassGain.connect(rhodesFilter);
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
        voiceGain.connect(rhodesFilter);

        osc.start(noteStart);
        tine.start(noteStart);
        osc.stop(noteEnd);
        tine.stop(Math.min(noteEnd, noteStart + 0.36));
      } catch {
        // Safe no-op
      }
    });
  }

  function scheduleKalimbaNote(audioCtx, freq, startTime, targetBus = musicBus, gainLevel = 0.062) {
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

  function scheduleSoftKick(audioCtx, startTime, accent = 1) {
    if (!musicBus) return;
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
      env.connect(musicBus);

      osc.start(startTime);
      osc.stop(startTime + 0.25);
    } catch {
      // Safe no-op
    }
  }

  function scheduleBrushedHat(audioCtx, startTime, accent = 1) {
    if (!musicBus || typeof audioCtx.createBufferSource !== "function") return;
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
      env.connect(musicBus);

      src.start(startTime);
      src.stop(startTime + 0.07);
    } catch {
      // Safe no-op
    }
  }

  function scheduleStep(audioCtx, stepIndex, time) {
    const stepInBar = stepIndex % 8;
    const barIndex = Math.floor(stepIndex / 8) % CHORD_PROGRESSION.length;
    const swungTime = stepInBar % 2 === 1 ? time + LOFI_SWING_SECONDS : time;

    // 1. Cozy Rhodes chord on beat 1 of each bar
    if (stepInBar === 0) {
      const chord = CHORD_PROGRESSION[barIndex];
      scheduleRhodesChord(audioCtx, chord, time, EIGHTH_NOTE_SECONDS * 8);
    }

    // 2. Soft pentatonic kalimba motif
    const melodyHz = PENTATONIC_MOTIF[stepIndex % 64];
    if (melodyHz) {
      scheduleKalimbaNote(audioCtx, melodyHz, swungTime, musicBus, 0.055);
    }

    // 3. Ultra-soft chill sub kick (beat 1 & gentle syncopated lift on step 5)
    if (stepInBar === 0) {
      scheduleSoftKick(audioCtx, time, 1.0);
    } else if (stepInBar === 5) {
      scheduleSoftKick(audioCtx, swungTime, 0.58);
    }

    // 4. Quiet brushed hat on gentle 8th-note groove
    if (stepInBar === 2 || stepInBar === 6) {
      scheduleBrushedHat(audioCtx, time, 1.0);
    } else if (stepInBar === 1 || stepInBar === 4 || stepInBar === 7) {
      scheduleBrushedHat(audioCtx, swungTime, 0.55);
    }
  }

  function runScheduler() {
    if (!playing || disposed || !ctx) return;
    const now = ctx.currentTime || 0;

    // Recover gracefully if the browser tab was backgrounded for a long time
    if (nextStepTime < now - 0.5) {
      nextStepTime = now + 0.04;
    }

    while (nextStepTime < now + SCHEDULE_AHEAD_SECONDS) {
      scheduleStep(ctx, currentStep, nextStepTime);
      currentStep = (currentStep + 1) % 64;
      nextStepTime += EIGHTH_NOTE_SECONDS;
    }
  }

  function startMusic() {
    if (disposed) return;
    const audioCtx = ensureContext();
    if (!audioCtx) return;

    resumeIfSuspended(audioCtx);
    const now = audioCtx.currentTime || 0;

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
    if (schedulerId !== null) {
      clearInterval(schedulerId);
      schedulerId = null;
    }
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

  function PENTATONIC_CHIME(index) {
    const clamped = Math.max(0, Math.min(STREAK_PENTATONIC_HZ.length - 1, index));
    return STREAK_PENTATONIC_HZ[clamped];
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
    rhodesFilter = null;
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
    startMusic,
    stopMusic,
    setMuted,
    isMuted,
    duck,
    playJumpSfx,
    playCorrectSfx,
    playWrongSfx,
    playSceneChangeSfx,
    playVictorySfx,
    dispose,
  };
}
