export type ScoreMood = 'start' | 'horde' | 'danger' | 'boss' | 'victory';
export type ScoreStatus = 'idle' | 'loading' | 'score' | 'fallback';
export const SCORE = Object.freeze({ bpm: 128, bars: 8, loopSeconds: 15, names: ['atmosphere', 'bass', 'percussion', 'tension'] as const });
let status: ScoreStatus = 'idle';
const listeners = new Set<(value: ScoreStatus) => void>(), cache = new WeakMap<AudioContext, { promise: Promise<AudioBuffer[]>; controller: AbortController }>();
export function getContainmentStatus() { return status; }
export function subscribeContainmentStatus(fn: (value: ScoreStatus) => void) { listeners.add(fn); fn(status); return () => { listeners.delete(fn); }; }
export function setContainmentStatus(value: ScoreStatus) { if (status === value) return; status = value; for (const fn of listeners) fn(value); }
/** A 32-bar / 60-second arrangement over synchronized eight-bar stems. */
export function scoreGains(mood: ScoreMood, bar: number) {
  const phrase = Math.floor(Math.max(0, bar) / 8) % 4;
  if (mood === 'start') return [.4, phrase % 2 ? .15 : .08, .12, 0];
  if (mood === 'victory') return [.36, .12, .06, .08];
  if (mood === 'boss') return [.22, .4, .58, phrase === 2 ? .23 : .36];
  if (mood === 'danger') return [.26, .3, .4, .27];
  return [.27, phrase === 2 ? .24 : .34, phrase === 2 ? .26 : .44, phrase === 0 ? 0 : phrase === 3 ? .22 : .14];
}
export function loadContainmentScore(context: AudioContext): Promise<AudioBuffer[]> {
  const existing = cache.get(context); if (existing) return existing.promise;
  setContainmentStatus('loading');
  const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 12000);
  const ext = new Audio().canPlayType('audio/ogg; codecs="vorbis"') ? 'ogg' : 'mp3';
  const request = Promise.all(SCORE.names.map(async name => {
    const response = await fetch(`${import.meta.env.BASE_URL}brain-boost/audio/containment/${name}.${ext}`, { signal: controller.signal });
    if (!response.ok) throw new Error('Score unavailable');
    const buffer = await context.decodeAudioData(await response.arrayBuffer());
    if (Math.abs(buffer.duration - SCORE.loopSeconds) > .08) throw new Error('Invalid score loop length');
    return buffer;
  })).catch(error => { if (cache.get(context)?.controller === controller) cache.delete(context); controller.abort(); throw error; }).finally(() => clearTimeout(timeout));
  cache.set(context, { promise: request, controller }); return request;
}
export function releaseContainmentScore(context: AudioContext) { cache.get(context)?.controller.abort(); cache.delete(context); setContainmentStatus('idle'); }
export class ContainmentTransport {
  private voices: { source: AudioBufferSourceNode; gain: GainNode }[] = [];
  private context: AudioContext; private started: number; private offset: number; private stopped = false; private bar = -1;
  constructor(context: AudioContext, output: AudioNode, buffers: readonly AudioBuffer[], at: number, offset: number) {
    this.context = context; this.started = at; this.offset = offset;
    for (const buffer of buffers) {
      const source = context.createBufferSource(), gain = context.createGain(); source.buffer = buffer; source.loop = true; source.loopEnd = SCORE.loopSeconds;
      gain.gain.value = 0; source.connect(gain); gain.connect(output); source.onended = () => { source.disconnect(); gain.disconnect(); };
      source.start(at, offset % SCORE.loopSeconds); this.voices.push({ source, gain });
    }
  }
  tick(at: number, mood: ScoreMood) {
    if (this.stopped) return;
    const bar = Math.floor((this.offset + at - this.started) / (60 / SCORE.bpm * 4)); if (bar === this.bar) return;
    const boundary = this.bar < 0 ? at : Math.max(this.context.currentTime + .003, this.started + bar * (60 / SCORE.bpm * 4) - this.offset); this.bar = bar;
    const levels = scoreGains(mood, bar);
    this.voices.forEach((v, i) => { v.gain.gain.cancelScheduledValues(boundary); v.gain.gain.setTargetAtTime(levels[i], boundary, .16); });
  }
  stop() {
    if (this.stopped) return; this.stopped = true;
    const at = this.context.currentTime;
    for (const { source, gain } of this.voices) { gain.gain.cancelScheduledValues(at); gain.gain.setTargetAtTime(0, at, .025); source.stop(at + .15); }
    this.voices = [];
  }
}
