export type BrainBoostGame =
  | "memory-matrix"
  | "memory-pairs"
  | "ocean-echoes"
  | "logic-reactor"
  | "number-patterns"
  | "spatial-rift";

export type BrainBoostCue =
  | "start"
  | "tap"
  | "reveal"
  | "correct"
  | "incorrect"
  | "hint"
  | "advance"
  | "complete"
  | "game-over";

type Profile = {
  root: number;
  intervals: number[];
};

type AudioGraph = {
  context: AudioContext;
  master: GainNode;
  music: GainNode;
  effects: GainNode;
  ambience: GainNode;
};

type AmbientScene = {
  game: BrainBoostGame;
  context: AudioContext;
  envelope: GainNode;
  oscillators: OscillatorNode[];
};

const STORAGE_KEY = "digitalboost:brain-boost:audio-enabled:v1";
const MUSIC_VOLUME_KEY = `${STORAGE_KEY}:music-volume`;
const EFFECTS_VOLUME_KEY = `${STORAGE_KEY}:effects-volume`;
const AMBIENCE_VOLUME_KEY = `${STORAGE_KEY}:ambience-volume`;

const PROFILES: Record<BrainBoostGame, Profile> = {
  "memory-matrix": { root: 220, intervals: [0, 7, 12, 19] },
  "memory-pairs": { root: 196, intervals: [0, 3, 7, 10] },
  "ocean-echoes": { root: 174.61, intervals: [0, 5, 12, 17] },
  "logic-reactor": { root: 164.81, intervals: [0, 4, 7, 11] },
  "number-patterns": { root: 220, intervals: [0, 2, 7, 9] },
  "spatial-rift": { root: 146.83, intervals: [0, 5, 10, 17] },
};

const CUES: Record<BrainBoostCue, number[]> = {
  start: [-12, 0, 7, 12, 19],
  tap: [12],
  reveal: [0, 12],
  correct: [0, 4, 7, 12],
  incorrect: [-3, -9],
  hint: [0, 7, 12],
  advance: [0, 7, 12],
  complete: [0, 4, 7, 12, 16, 24],
  "game-over": [12, 7, 3, -5],
};

let enabledCache: boolean | null = null;
let graph: AudioGraph | null = null;
let activeScene: AmbientScene | null = null;

export function isBrainBoostAudioEnabled(): boolean {
  if (enabledCache !== null) return enabledCache;

  try {
    enabledCache =
      typeof window === "undefined" ||
      window.localStorage.getItem(STORAGE_KEY) !== "false";
  } catch {
    enabledCache = true;
  }

  return enabledCache;
}

function readStoredVolume(key: string, fallback: number): number {
  try {
    const raw = typeof window === "undefined"
      ? null
      : window.localStorage.getItem(key);
    if (raw === null) return fallback;
    const value = Number(raw);
    return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : fallback;
  } catch {
    return fallback;
  }
}

function getGraph(): AudioGraph | null {
  if (
    typeof window === "undefined" ||
    typeof window.AudioContext === "undefined"
  ) {
    return null;
  }

  if (graph?.context.state === "closed") {
    graph = null;
    activeScene = null;
  }

  if (graph) return graph;

  try {
    const context = new window.AudioContext();
    const master = context.createGain();
    const music = context.createGain();
    const effects = context.createGain();
    const ambience = context.createGain();
    const compressor = context.createDynamicsCompressor();

    master.gain.value = isBrainBoostAudioEnabled() ? 0.72 : 0.0001;
    music.gain.value = readStoredVolume(MUSIC_VOLUME_KEY, 0.58);
    effects.gain.value = readStoredVolume(EFFECTS_VOLUME_KEY, 0.7);
    ambience.gain.value = readStoredVolume(AMBIENCE_VOLUME_KEY, 0.24);

    compressor.threshold.value = -22;
    compressor.knee.value = 18;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.004;
    compressor.release.value = 0.22;

    music.connect(master);
    effects.connect(master);
    ambience.connect(master);
    master.connect(compressor);
    compressor.connect(context.destination);

    graph = { context, master, music, effects, ambience };
    return graph;
  } catch {
    return null;
  }
}

function resume(context: AudioContext): void {
  if (context.state === "suspended") {
    void context.resume().catch(() => undefined);
  }
}

export function setBrainBoostAudioEnabled(value: boolean): void {
  enabledCache = value;

  try {
    window.localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // El audio no depende de que el almacenamiento este disponible.
  }

  const audio = graph ?? (value ? getGraph() : null);
  if (audio) {
    const now = audio.context.currentTime;
    audio.master.gain.cancelScheduledValues(now);
    audio.master.gain.setTargetAtTime(
      value ? 0.72 : 0.0001,
      now,
      0.035,
    );
    if (value) resume(audio.context);
  }

  if (!value) {
    stopBrainBoostMusic();
    stopBrainBoostAmbience();
  }
}

export function playBrainBoostSfx(
  game: BrainBoostGame,
  cue: BrainBoostCue,
): void {
  if (!isBrainBoostAudioEnabled()) return;

  const audio = getGraph();
  if (!audio) return;

  const { context, effects } = audio;
  resume(context);

  const profile = PROFILES[game];
  const notes = CUES[cue];
  const startAt = context.currentTime + 0.015;
  const gap = cue === "tap" ? 0 : cue === "complete" ? 0.065 : 0.055;
  const duration = cue === "tap" ? 0.07
    : cue === "incorrect" ? 0.23
    : cue === "complete" ? 0.32
    : 0.19;
  const level = cue === "tap" ? 0.012
    : cue === "incorrect" ? 0.014
    : 0.018;
  const wave: OscillatorType =
    cue === "tap" ? "square"
    : cue === "incorrect" ? "triangle"
    : "sine";

  notes.forEach((step, index) => {
    const at = startAt + index * gap;
    const frequency = Math.max(
      55,
      Math.min(1500, profile.root * Math.pow(2, step / 12)),
    );

    const oscillator = context.createOscillator();
    const filter = context.createBiquadFilter();
    const envelope = context.createGain();

    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(frequency, at);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(
      Math.min(4200, Math.max(750, frequency * 5)),
      at,
    );
    filter.Q.value = 0.65;

    envelope.gain.setValueAtTime(0.0001, at);
    envelope.gain.exponentialRampToValueAtTime(level, at + 0.014);
    envelope.gain.setValueAtTime(level * 0.65, at + duration * 0.5);
    envelope.gain.exponentialRampToValueAtTime(
      0.0001,
      at + duration,
    );

    oscillator.connect(filter);
    filter.connect(envelope);
    envelope.connect(effects);

    oscillator.addEventListener("ended", () => {
      oscillator.disconnect();
      filter.disconnect();
      envelope.disconnect();
    }, { once: true });

    oscillator.start(at);
    oscillator.stop(at + duration + 0.025);
  });
}

export function startBrainBoostAmbience(game: BrainBoostGame): void {
  if (!isBrainBoostAudioEnabled()) return;

  const audio = getGraph();
  if (!audio) return;

  if (activeScene?.game === game) {
    resume(audio.context);
    return;
  }

  stopBrainBoostAmbience();
  resume(audio.context);

  const { context, ambience } = audio;
  const profile = PROFILES[game];
  const now = context.currentTime;
  const envelope = context.createGain();
  const oscillators: OscillatorNode[] = [];

  envelope.gain.setValueAtTime(0.0001, now);
  envelope.gain.exponentialRampToValueAtTime(0.13, now + 0.8);
  envelope.connect(ambience);

  profile.intervals.forEach((interval, index) => {
    const oscillator = context.createOscillator();
    const filter = context.createBiquadFilter();
    const voice = context.createGain();
    const frequency = profile.root * Math.pow(2, interval / 12);

    oscillator.type = index === 1 ? "triangle" : "sine";
    oscillator.frequency.value = Math.min(900, frequency);

    filter.type = "lowpass";
    filter.frequency.value = game === "ocean-echoes" ? 850 : 1400;
    filter.Q.value = 0.45;

    voice.gain.value = [0.29, 0.2, 0.13, 0.08][index];

    oscillator.connect(filter);
    filter.connect(voice);
    voice.connect(envelope);

    oscillator.addEventListener("ended", () => {
      oscillator.disconnect();
      filter.disconnect();
      voice.disconnect();
    }, { once: true });

    oscillator.start(now);
    oscillators.push(oscillator);
  });

  activeScene = { game, context, envelope, oscillators };
}

export function stopBrainBoostAmbience(game?: BrainBoostGame): void {
  const scene = activeScene;
  if (!scene || (game && scene.game !== game)) return;

  activeScene = null;
  const now = scene.context.currentTime;

  scene.envelope.gain.cancelScheduledValues(now);
  scene.envelope.gain.setValueAtTime(
    Math.max(0.0001, scene.envelope.gain.value),
    now,
  );
  scene.envelope.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

  for (const oscillator of scene.oscillators) {
    try {
      oscillator.stop(now + 0.29);
    } catch {
      // Ignorar osciladores que ya hayan terminado.
    }
  }

  window.setTimeout(() => {
    try {
      scene.envelope.disconnect();
    } catch {
      // El contexto podria haberse cerrado durante la transicion.
    }
  }, 380);
}

type CyberAssaultMusicState = {
  context: AudioContext;
  envelope: GainNode;
  timer: number;
  step: number;
  nextAt: number;
};

let cyberAssaultMusic: CyberAssaultMusicState | null = null;

const CYBER_MELODY: Array<number | null> = [
  64, null, 67, 71, 74, null, 71, 67,
  64, null, 62, 64, 67, null, 62, null,
];
const CYBER_BASS = [40, 43, 38, 39];
const CYBER_BASS_STEPS = [0, 7, 12, 7];
const CYBER_BAR_SHIFT = [0, 3, -2, -1];

function cyberMidi(note: number): number {
  return 440 * Math.pow(2, (note - 69) / 12);
}

function cyberTone(
  context: AudioContext,
  output: AudioNode,
  note: number,
  at: number,
  duration: number,
  level: number,
  wave: OscillatorType,
): void {
  const osc = context.createOscillator();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();

  osc.type = wave;
  osc.frequency.setValueAtTime(cyberMidi(note), at);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(wave === "square" ? 2700 : 950, at);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(level, at + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(output);

  osc.addEventListener("ended", () => {
    osc.disconnect();
    filter.disconnect();
    gain.disconnect();
  }, { once: true });

  osc.start(at);
  osc.stop(at + duration + 0.015);
}

function cyberNoise(
  context: AudioContext,
  output: AudioNode,
  at: number,
  duration: number,
  level: number,
  cutoff: number,
): void {
  const length = Math.max(1, Math.floor(context.sampleRate * duration));
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();

  source.buffer = buffer;
  filter.type = cutoff > 3000 ? "highpass" : "bandpass";
  filter.frequency.setValueAtTime(cutoff, at);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(level, at + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(output);

  source.addEventListener("ended", () => {
    source.disconnect();
    filter.disconnect();
    gain.disconnect();
  }, { once: true });

  source.start(at);
  source.stop(at + duration + 0.015);
}

function cyberKick(
  context: AudioContext,
  output: AudioNode,
  at: number,
): void {
  const osc = context.createOscillator();
  const gain = context.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(125, at);
  osc.frequency.exponentialRampToValueAtTime(43, at + 0.09);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(0.055, at + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.115);

  osc.connect(gain);
  gain.connect(output);
  osc.addEventListener("ended", () => {
    osc.disconnect();
    gain.disconnect();
  }, { once: true });

  osc.start(at);
  osc.stop(at + 0.13);
}

function scheduleCyberStep(
  state: CyberAssaultMusicState,
  step: number,
  at: number,
): void {
  const context = state.context;
  const pos = step % 16;
  const bar = Math.floor(step / 16) % 4;
  const melody = CYBER_MELODY[pos];

  if (melody !== null) {
    cyberTone(
      context, state.envelope, melody + CYBER_BAR_SHIFT[bar],
      at, 0.115, 0.04, "square",
    );
  }

  if (pos % 4 === 0) {
    cyberTone(
      context, state.envelope,
      CYBER_BASS[bar] + CYBER_BASS_STEPS[pos / 4],
      at, 0.2, 0.065, "triangle",
    );
  }

  if (pos === 0 || pos === 8) {
    cyberKick(context, state.envelope, at);
  }

  if (pos === 4 || pos === 12) {
    cyberNoise(context, state.envelope, at, 0.075, 0.016, 1700);
  }

  if (pos % 2 === 0) {
    cyberNoise(
      context, state.envelope, at, 0.025,
      pos % 4 === 0 ? 0.005 : 0.003, 6200,
    );
  }
}

export function startCyberAssaultMusic(): void {
  if (!isBrainBoostAudioEnabled()) return;

  const audio = getGraph();
  if (!audio || audio.context.state === "closed") return;

  if (cyberAssaultMusic?.context === audio.context) {
    resume(audio.context);
    return;
  }

  stopBrainBoostMusic();
  resume(audio.context);

  const context = audio.context;
  const envelope = context.createGain();
  const now = context.currentTime;

  envelope.gain.setValueAtTime(0.0001, now);
  envelope.gain.exponentialRampToValueAtTime(0.9, now + 0.3);
  envelope.connect(audio.music);

  const state: CyberAssaultMusicState = {
    context,
    envelope,
    timer: 0,
    step: 0,
    nextAt: now + 0.04,
  };
  cyberAssaultMusic = state;

  const stepDuration = 60 / 112 / 4;

  state.timer = window.setInterval(() => {
    if (cyberAssaultMusic !== state || context.state === "closed") {
      window.clearInterval(state.timer);
      return;
    }

    const horizon = context.currentTime + 0.12;
    while (state.nextAt < horizon) {
      scheduleCyberStep(state, state.step, state.nextAt);
      state.step = (state.step + 1) % 64;
      state.nextAt += stepDuration;
    }
  }, 25);
}

export function stopBrainBoostMusic(): void {
  const state = cyberAssaultMusic;
  if (!state) return;

  cyberAssaultMusic = null;
  window.clearInterval(state.timer);
  if (state.context.state === "closed") return;

  const now = state.context.currentTime;
  state.envelope.gain.cancelScheduledValues(now);
  state.envelope.gain.setValueAtTime(
    Math.max(0.0001, state.envelope.gain.value), now,
  );
  state.envelope.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

  window.setTimeout(() => {
    try {
      state.envelope.disconnect();
    } catch {
      // El contexto pudo cerrarse durante el fundido.
    }
  }, 380);
}

export function setBrainBoostMusicVolume(value: number): void {
  const volume = Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;

  try {
    window.localStorage.setItem(MUSIC_VOLUME_KEY, String(volume));
  } catch {
    // El audio sigue funcionando sin almacenamiento.
  }

  if (!graph || graph.context.state === "closed") return;
  const now = graph.context.currentTime;
  graph.music.gain.cancelScheduledValues(now);
  graph.music.gain.setTargetAtTime(volume, now, 0.035);
}
