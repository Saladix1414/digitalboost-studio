/** Renderer-independent, seeded combat. All durations are simulation seconds. */
export type Phase = 'LOADING' | 'READY' | 'PLAYING' | 'PAUSED' | 'WAVE_TRANSITION' | 'GAME_OVER' | 'ERROR' | 'DISPOSED';
export type EnemyKind = 'swarm' | 'brute' | 'elite';
export type Enemy = { id: number; kind: EnemyKind; x: number; z: number; hp: number; radius: number; speed: number; damage: number; value: number; age: number; state: 'SPAWNING' | 'ADVANCING' | 'ATTACKING' | 'DYING' | 'REMOVED' };
export type CombatEvent = { kind: 'beam' | 'kill' | 'impact' | 'shock'; x: number; z: number; toX?: number; toZ?: number; age: number };
export const CONFIG = Object.freeze({ step: 1 / 60, maxSteps: 6, maxDelta: .1, arena: 15, maxEnemies: 72, maxEvents: 100, health: 100, shockCooldown: 12, shockRadius: 10, shockDuration: .7, droneSpeed: 14, range: 13, fireInterval: .16, damage: 16 });
const variants = {
  swarm: { hp: 24, speed: 1.7, radius: .48, damage: 7, value: 10 },
  brute: { hp: 105, speed: .73, radius: .95, damage: 20, value: 40 },
  elite: { hp: 65, speed: 1.3, radius: .65, damage: 13, value: 30 },
};
const allowed: Record<Phase, readonly Phase[]> = {
  LOADING: ['READY', 'ERROR', 'DISPOSED'], READY: ['PLAYING', 'ERROR', 'DISPOSED'],
  PLAYING: ['PAUSED', 'WAVE_TRANSITION', 'GAME_OVER', 'ERROR', 'DISPOSED'],
  PAUSED: ['PLAYING', 'WAVE_TRANSITION', 'ERROR', 'DISPOSED'],
  WAVE_TRANSITION: ['PLAYING', 'PAUSED', 'ERROR', 'DISPOSED'],
  GAME_OVER: ['READY', 'ERROR', 'DISPOSED'], ERROR: ['DISPOSED'], DISPOSED: [],
};
export class GameSimulation {
  phase: Phase = 'LOADING';
  health: number = CONFIG.health;
  score = 0; wave = 1; kills = 0; elapsed = 0;
  enemies: Enemy[] = []; events: CombatEvent[] = [];
  drone = { x: 0, z: 6 }; target = { x: 0, z: 6 };
  cooldown = 0; shockAge = -1; shockOrigin = { x: 0, z: 0 };
  private shockHits = new Set<number>();
  private nextId = 1; private randomSeed: number; private spawned = 0;
  private spawnClock = .7; private fireClock = 0; private transitionClock = 0;
  private resumePhase: 'PLAYING' | 'WAVE_TRANSITION' = 'PLAYING';
  constructor(seed = 42819) { this.randomSeed = seed >>> 0; }
  transition(next: Phase) { if (!allowed[this.phase].includes(next)) return false; this.phase = next; return true; }
  ready() { return this.transition('READY'); }
  start() { return this.phase === 'READY' && this.transition('PLAYING'); }
  pause() {
    if (this.phase !== 'PLAYING' && this.phase !== 'WAVE_TRANSITION') return false;
    this.resumePhase = this.phase; return this.transition('PAUSED');
  }
  resume() { return this.phase === 'PAUSED' && this.transition(this.resumePhase); }
  get waveSize() { return Math.min(60, 8 + this.wave * 4); }
  get shockRadius() { return this.shockAge < 0 ? 0 : CONFIG.shockRadius * Math.min(1, this.shockAge / CONFIG.shockDuration); }
  move(x: number, z: number) {
    if (this.phase !== 'PLAYING' || !Number.isFinite(x) || !Number.isFinite(z)) return;
    this.target = { x: Math.max(-14, Math.min(14, x)), z: Math.max(-14, Math.min(14, z)) };
  }
  shock() {
    if (this.phase !== 'PLAYING' || this.cooldown > 0 || this.shockAge >= 0) return false;
    this.cooldown = CONFIG.shockCooldown; this.shockAge = 0;
    this.shockOrigin = { ...this.drone }; this.shockHits.clear();
    this.emit({ kind: 'shock', ...this.drone, age: 0 }); return true;
  }
  private random() { this.randomSeed = (Math.imul(1664525, this.randomSeed) + 1013904223) >>> 0; return this.randomSeed / 4294967296; }
  private emit(event: CombatEvent) { if (this.events.length >= CONFIG.maxEvents) this.events.shift(); this.events.push(event); }
  private hit(enemy: Enemy, damage: number) {
    if (enemy.state !== 'ADVANCING') return;
    enemy.hp = Math.max(0, enemy.hp - damage);
    if (!enemy.hp) {
      enemy.state = 'DYING'; enemy.age = 0; this.score += enemy.value; this.kills++;
      this.emit({ kind: 'kill', x: enemy.x, z: enemy.z, age: 0 });
    }
  }
  private spawn() {
    const angle = this.random() * Math.PI * 2;
    const kind: EnemyKind = this.wave >= 3 && this.spawned % 7 === 6 ? 'elite' : this.wave >= 2 && this.spawned % 4 === 3 ? 'brute' : 'swarm';
    const v = variants[kind]; const scale = 1 + Math.min(2.5, (this.wave - 1) * .12);
    this.enemies.push({ ...v, hp: v.hp * scale, speed: v.speed * (1 + Math.min(.8, this.wave * .035)), id: this.nextId++, kind, x: Math.cos(angle) * 18, z: Math.sin(angle) * 18, age: 0, state: 'SPAWNING' });
    this.spawned++;
  }
  step(dt = CONFIG.step) {
    if (!Number.isFinite(dt) || dt <= 0 || dt > CONFIG.maxDelta) return;
    if (this.phase !== 'PLAYING' && this.phase !== 'WAVE_TRANSITION') return;
    this.elapsed += dt; this.cooldown = Math.max(0, this.cooldown - dt);
    for (const event of this.events) event.age += dt;
    this.events = this.events.filter(e => e.age < .55);
    if (this.phase === 'WAVE_TRANSITION') {
      this.transitionClock -= dt;
      if (this.transitionClock <= 0) {
        this.wave++; this.spawned = 0; this.spawnClock = .8;
        this.health = Math.min(CONFIG.health, this.health + 5); // Explicit recovery between waves.
        this.transition('PLAYING');
      }
      return;
    }
    const dx = this.target.x - this.drone.x, dz = this.target.z - this.drone.z;
    const distance = Math.hypot(dx, dz), travel = Math.min(distance, CONFIG.droneSpeed * dt);
    if (distance > .001) { this.drone.x += dx / distance * travel; this.drone.z += dz / distance * travel; }
    this.spawnClock -= dt;
    if (this.spawned < this.waveSize && this.spawnClock <= 0 && this.enemies.length < CONFIG.maxEnemies) {
      this.spawn(); this.spawnClock = Math.max(.2, .85 - this.wave * .035);
    }
    if (this.shockAge >= 0) {
      this.shockAge = Math.min(CONFIG.shockDuration, this.shockAge + dt);
      for (const e of this.enemies) {
        if (e.state === 'ADVANCING' && !this.shockHits.has(e.id) && Math.hypot(e.x - this.shockOrigin.x, e.z - this.shockOrigin.z) <= this.shockRadius + e.radius) {
          this.shockHits.add(e.id); this.hit(e, 85);
        }
      }
      if (this.shockAge >= CONFIG.shockDuration) this.shockAge = -1;
    }
    this.fireClock -= dt;
    let target: Enemy | undefined; let priority = Infinity;
    for (const e of this.enemies) {
      e.age += dt;
      if (e.state === 'SPAWNING') { if (e.age >= .35) { e.state = 'ADVANCING'; e.age = 0; } else continue; }
      if (e.state === 'DYING') { if (e.age > .28) e.state = 'REMOVED'; continue; }
      if (e.state !== 'ADVANCING') continue;
      const r = Math.hypot(e.x, e.z);
      if (r <= 2 + e.radius) {
        e.state = 'ATTACKING'; this.health = Math.max(0, this.health - e.damage);
        this.emit({ kind: 'impact', x: e.x, z: e.z, age: 0 }); e.state = 'REMOVED';
        if (!this.health) { this.transition('GAME_OVER'); return; }
        continue;
      }
      const swirl = e.kind === 'elite' ? Math.sin(e.age * 2) * .8 : 0;
      e.x += (-e.x / r - e.z / r * swirl) * e.speed * dt;
      e.z += (-e.z / r + e.x / r * swirl) * e.speed * dt;
      const range = Math.hypot(e.x - this.drone.x, e.z - this.drone.z);
      const threat = r - e.damage * .08 + range * .15;
      if (range <= CONFIG.range && threat < priority) { target = e; priority = threat; }
    }
    if (target && this.fireClock <= 0) {
      this.emit({ kind: 'beam', ...this.drone, toX: target.x, toZ: target.z, age: 0 });
      this.hit(target, CONFIG.damage); this.fireClock = CONFIG.fireInterval;
    }
    this.enemies = this.enemies.filter(e => e.state !== 'REMOVED');
    if (this.spawned === this.waveSize && this.enemies.length === 0) {
      this.transitionClock = 2.2; this.shockAge = -1; this.transition('WAVE_TRANSITION');
    }
  }
  snapshot() { return { phase: this.phase, health: this.health, score: this.score, wave: this.wave, kills: this.kills, elapsed: this.elapsed, cooldown: this.cooldown }; }
  dispose() { this.transition('DISPOSED'); this.enemies = []; this.events = []; this.shockHits.clear(); }
}

/** Stops catch-up spirals; reset on visibility/pause boundaries. */
export class FixedClock {
  private accumulator = 0;
  reset() { this.accumulator = 0; }
  advance(delta: number, tick: () => void) {
    if (!Number.isFinite(delta) || delta <= 0) return;
    this.accumulator += Math.min(CONFIG.maxDelta, delta);
    let count = 0;
    while (this.accumulator + 1e-10 >= CONFIG.step && count < CONFIG.maxSteps) {
      tick(); this.accumulator -= CONFIG.step; count++;
    }
    if (count === CONFIG.maxSteps) this.accumulator = 0;
  }
}
