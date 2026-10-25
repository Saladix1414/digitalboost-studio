import { BOSSES, OBSTACLES, WEAPONS, bossForWave, firstBlockTime, nextBossEncounter, normalizeProgress, segmentCircleEntry, supplyForRoll, type PickupKind, type Progress, type WeaponId } from './SurvivalRules.ts';
import { interceptAngle, selectAimTarget, type AimMode } from './AimAssist.ts';
export type Phase = 'LOADING' | 'READY' | 'PLAYING' | 'PAUSED' | 'WAVE_TRANSITION' | 'GAME_OVER' | 'ERROR' | 'DISPOSED';
export type EnemyKind = 'skitter' | 'carapace' | 'spitter' | 'stalker' | 'brood' | 'maw' | 'sovereign';
export type Enemy = { id: number; kind: EnemyKind; x: number; z: number; hp: number; maxHp: number; radius: number; speed: number; damage: number; value: number; age: number; state: 'SPAWNING' | 'ADVANCING' | 'DYING' | 'REMOVED'; boss: boolean; attackClock: number; warning: number; aimX: number; aimZ: number; burn: number; burnClock: number; vx: number; vz: number; hitFlash: number };
export type CombatEvent = { id: number; kind: 'shot' | 'flame' | 'kill' | 'impact' | 'shock' | 'explosion' | 'pickup' | 'unlock' | 'revive' | 'boss' | 'creature'; x: number; z: number; angle?: number; age: number; weapon?: WeaponId; playerId?: number; creature?: EnemyKind };
export type Projectile = { id: number; x: number; z: number; vx: number; vz: number; life: number; damage: number; radius: number; weapon: WeaponId; hostile: boolean; hits: Set<number>; remaining: number; playerId?: number };
export type Pickup = { id: number; kind: PickupKind; x: number; z: number; life: number };
export const CONFIG = Object.freeze({ step: 1 / 60, maxSteps: 6, maxDelta: .1, arena: 21, maxEnemies: 240, maxProjectiles: 320, maxEvents: 100, maxPickups: 18, health: 100, shockCooldown: 12, shockRadius: 8, shockDuration: .5, playerSpeed: 7.5 });
export function createMarine(id: number, count = 1) {
  return {
    id, x: count === 1 ? 0 : id === 0 ? -2 : 2, z: 3, heading: -Math.PI / 2, fireAngle: -Math.PI / 4,
    invulnerable: 0, shield: 0, haste: 0, health: Number(CONFIG.health), equipped: 'machinegun' as WeaponId,
    ammo: { machinegun: 0, shotgun: 30, flame: 150, cascade: 12, rail: 28 },
    cooldowns: { machinegun: 0, shotgun: 0, flame: 0, cascade: 0, rail: 0 },
    cooldown: 0, shockAge: -1, shockOrigin: { x: 0, z: 0 }, shockHits: new Set<number>(),
    input: { x: 0, z: 0, firing: false }, aim: null as number | null, aimMode: 'classic' as AimMode, targetId: null as number | null,
  };
}
export type Marine = ReturnType<typeof createMarine>;
const stats = {
  skitter: { hp: 30, radius: .43, speed: 2.6, damage: 8, value: 10 },
  carapace: { hp: 125, radius: .9, speed: 1.25, damage: 17, value: 35 },
  spitter: { hp: 55, radius: .65, speed: 1.7, damage: 10, value: 25 },
  stalker: { hp: 48, radius: .55, speed: 3, damage: 13, value: 25 },
  brood: { hp: 700, radius: 1.8, speed: 1.2, damage: 15, value: 500 },
  maw: { hp: 1350, radius: 2, speed: 1.4, damage: 20, value: 900 },
  sovereign: { hp: 1900, radius: 1.7, speed: 1.5, damage: 18, value: 1400 },
};
export function createEnemy(kind: EnemyKind, id: number, x: number, z: number, wave = 1): Enemy {
  const v = stats[kind], boss = ['brood', 'maw', 'sovereign'].includes(kind);
  const hp = v.hp * (boss ? 1 + Math.min(1.5, Math.max(0, wave - 15) * .05) : 1 + Math.min(2, (wave - 1) * .07));
  return { ...v, hp, maxHp: hp, id, kind, x, z, boss, age: 0, state: 'ADVANCING', attackClock: 2, warning: 0, aimX: 0, aimZ: 0, burn: 0, burnClock: 0, vx: 0, vz: 0, hitFlash: 0 };
}
const allowed: Record<Phase, readonly Phase[]> = {
  LOADING: ['READY', 'ERROR', 'DISPOSED'], READY: ['PLAYING', 'ERROR', 'DISPOSED'],
  PLAYING: ['PAUSED', 'WAVE_TRANSITION', 'GAME_OVER', 'ERROR', 'DISPOSED'], PAUSED: ['PLAYING', 'WAVE_TRANSITION', 'ERROR', 'DISPOSED'],
  WAVE_TRANSITION: ['PLAYING', 'PAUSED', 'ERROR', 'DISPOSED'], GAME_OVER: ['ERROR', 'DISPOSED'], ERROR: ['DISPOSED'], DISPOSED: [],
};
class EnemyGrid {
  private cells = new Map<number, Enemy[]>();
  private key(x: number, z: number) { return Math.floor(x / 3) + 64 * Math.floor(z / 3); }
  rebuild(enemies: Enemy[]) {
    this.cells.clear();
    for (const e of enemies) if (e.state === 'ADVANCING') { const k = this.key(e.x, e.z), list = this.cells.get(k); if (list) list.push(e); else this.cells.set(k, [e]); }
  }
  *near(x: number, z: number, r: number): Generator<Enemy> {
    for (let a = Math.floor((x - r) / 3); a <= Math.floor((x + r) / 3); a++) for (let b = Math.floor((z - r) / 3); b <= Math.floor((z + r) / 3); b++) {
      const cell = this.cells.get(a + b * 64); if (cell) yield* cell;
    }
  }
}
export class GameSimulation {
  phase: Phase = 'LOADING';
  players: Marine[] = [createMarine(0)];
  // Legacy solo accessors point to the first marine; they never mirror gameplay state.
  get player() { return this.players[0]; }
  get health() { return this.player.health; } set health(value: number) { this.player.health = value; }
  get equipped() { return this.player.equipped; } set equipped(value: WeaponId) { this.player.equipped = value; }
  get ammo() { return this.player.ammo; }
  get cooldowns() { return this.player.cooldowns; }
  get cooldown() { return this.player.cooldown; }
  get shockAge() { return this.player.shockAge; }
  get shockOrigin() { return this.player.shockOrigin; }
  score = 0; wave = 1; kills = 0; elapsed = 0; bossesKilled = 0;
  enemies: Enemy[] = []; projectiles: Projectile[] = []; pickups: Pickup[] = []; events: CombatEvent[] = [];
  progress: Progress; progressRevision = 0; unlockedThisRun: WeaponId[] = [];
  private grid = new EnemyGrid(); private nextId = 1;
  private seed: number; private spawned = 0; private spawnClock = .3; private transitionClock = 0; private bossSpawned = false;
  private resumePhase: 'PLAYING' | 'WAVE_TRANSITION' = 'PLAYING';
  private explosions: { x: number; z: number; delay: number; damage: number; radius: number }[] = [];
  readonly maxEnemies: number;
  constructor(seed = 42819, progress: unknown = null, maxEnemies = 120, playerCount: 1 | 2 = 1) {
    this.seed = seed >>> 0; this.progress = normalizeProgress(progress); this.maxEnemies = Math.max(16, Math.min(CONFIG.maxEnemies, maxEnemies));
    this.setPlayerCount(playerCount);
  }
  transition(next: Phase) { if (!allowed[this.phase].includes(next)) return false; this.phase = next; return true; }
  ready() { return this.transition('READY'); }
  start() { return this.phase === 'READY' && this.transition('PLAYING'); }
  pause() { if (this.phase !== 'PLAYING' && this.phase !== 'WAVE_TRANSITION') return false; this.resumePhase = this.phase; this.clearInput(); return this.transition('PAUSED'); }
  resume() { return this.phase === 'PAUSED' && this.transition(this.resumePhase); }
  setPlayerCount(count: 1 | 2) {
    if (!['LOADING', 'READY'].includes(this.phase) || ![1, 2].includes(count)) return false;
    if (this.players.length === count) return true;
    this.players = Array.from({ length: count }, (_, id) => createMarine(id, count)); return true;
  }
  clearInput(playerId?: number) {
    for (const p of this.players) if (playerId === undefined || p.id === playerId) { p.input = { x: 0, z: 0, firing: false }; p.aim = null; p.targetId = null; }
  }
  setInput(x: number, z: number, firing: boolean, aim: number | null = null, playerId = 0) {
    const p = this.players[playerId];
    if (this.phase !== 'PLAYING' || !p || p.health <= 0 || !Number.isFinite(x) || !Number.isFinite(z)) return;
    const n = Math.max(1, Math.hypot(x, z)); p.input = { x: x / n, z: z / n, firing };
    p.aim = aim !== null && Number.isFinite(aim) ? aim : null;
  }
  setAimMode(mode: AimMode, playerId = 0) {
    const p = this.players[playerId]; if (!p || !['assisted', 'modern', 'classic'].includes(mode) || ['DISPOSED', 'ERROR', 'GAME_OVER'].includes(this.phase)) return false;
    p.aimMode = mode; this.clearInput(playerId); return true;
  }
  equip(id: WeaponId, playerId = 0) {
    const p = this.players[playerId];
    if (!p || p.health <= 0 || !['READY', 'PLAYING', 'WAVE_TRANSITION'].includes(this.phase) || !this.progress.unlocked.includes(id)) return false;
    p.equipped = id; return true;
  }
  get waveSize() { return Math.min(100, Math.ceil((12 + this.wave * 4) * (this.players.length === 2 ? 1.4 : 1))); }
  shockRadiusFor(p: Marine) { return p.shockAge < 0 ? 0 : CONFIG.shockRadius * Math.min(1, p.shockAge / CONFIG.shockDuration); }
  get shockRadius() { return this.shockRadiusFor(this.player); }
  shock(playerId = 0) {
    const p = this.players[playerId];
    if (this.phase !== 'PLAYING' || !p || p.health <= 0 || p.cooldown > 0 || p.shockAge >= 0) return false;
    p.cooldown = CONFIG.shockCooldown; p.shockAge = 0; p.shockOrigin = { x: p.x, z: p.z }; p.shockHits.clear(); this.emit('shock', p.x, p.z, undefined, undefined, p.id); return true;
  }
  nearestPlayer(x: number, z: number) {
    let target: Marine | undefined, best = Infinity;
    for (const p of this.players) if (p.health > 0) { const d = Math.hypot(p.x - x, p.z - z); if (d < best) { best = d; target = p; } }
    return target ?? this.player;
  }
  private random() { this.seed = (Math.imul(1664525, this.seed) + 1013904223) >>> 0; return this.seed / 4294967296; }
  private emit(kind: CombatEvent['kind'], x: number, z: number, weapon?: WeaponId, angle?: number, playerId?: number, creature?: EnemyKind) {
    if (this.events.length >= CONFIG.maxEvents) this.events.shift(); this.events.push({ id: this.nextId++, kind, x, z, age: 0, weapon, angle, playerId, creature });
  }
  private unlock(id: WeaponId, boss?: string) {
    let changed = false;
    if (!this.progress.unlocked.includes(id)) { this.progress.unlocked.push(id); this.unlockedThisRun.push(id); changed = true; for (const p of this.players) p.ammo[id] = WEAPONS[id].reserve; }
    if (boss && !this.progress.bosses.includes(boss)) { this.progress.bosses.push(boss); changed = true; }
    if (changed) { this.progressRevision++; this.emit('unlock', this.player.x, this.player.z, id); }
  }
  private hit(e: Enemy, damage: number) {
    if (e.state !== 'ADVANCING') return;
    // Iron Maw exposes its plates while preparing a charge.
    const armor = e.kind === 'maw' && e.warning <= 0 && e.attackClock > .4 ? .35 : 1;
    e.hp = Math.max(0, e.hp - damage * armor); e.hitFlash = .12;
    if (e.hp) return;
    e.state = 'DYING'; e.age = 0; this.score += e.value; this.kills++; this.emit('kill', e.x, e.z, undefined, undefined, undefined, e.kind);
    if (this.kills === 30) this.unlock('shotgun');
    if (e.boss) {
      // A confirmed boss death also proves that this wave's encounter appeared.
      this.bossSpawned = true;
      this.bossesKilled++; this.unlock(BOSSES[e.kind as keyof typeof BOSSES].reward, e.kind);
      this.drop('medkit', e.x, e.z); this.drop('ammo', e.x + 1, e.z);
    } else if (this.kills % 5 === 0) {
      this.drop(supplyForRoll(this.random(), this.progress.unlocked), e.x, e.z);
    }
  }
  private drop(kind: Pickup['kind'], x: number, z: number) { if (this.pickups.length < CONFIG.maxPickups) this.pickups.push({ id: this.nextId++, kind, x, z, life: 25 }); }
  private collect(kind: PickupKind, player: Marine) {
    if (kind === 'medkit') {
      if (player.health >= CONFIG.health) return false;
      player.health = Math.min(CONFIG.health, player.health + 25); return true;
    }
    if (kind === 'shield' || kind === 'haste') {
      if (player[kind] > 6) return false;
      player[kind] = Math.min(12, player[kind] + 6); return true;
    }
    let changed = false;
    for (const id of this.progress.unlocked) {
      if (id === 'machinegun' || (kind === 'grenade' ? id !== 'cascade' : id === 'cascade')) continue;
      const next = Math.min(WEAPONS[id].reserve * 2, player.ammo[id] + Math.ceil(WEAPONS[id].reserve * .35));
      if (next > player.ammo[id]) { player.ammo[id] = next; changed = true; }
    }
    return changed;
  }
  private hurt(damage: number, player: Marine) {
    if (this.phase !== 'PLAYING' || player.invulnerable > 0) return;
    player.health = Math.max(0, player.health - damage * (player.shield > 0 ? .4 : 1)); player.invulnerable = .65; this.emit('impact', player.x, player.z, undefined, undefined, player.id);
    if (player.health === 0) { this.clearInput(player.id); player.shockAge = -1; if (this.players.every(p => p.health <= 0)) this.transition('GAME_OVER'); }
  }
  private spawn(kind?: EnemyKind, origin?: { x: number; z: number }) {
    if (this.enemies.length >= this.maxEnemies) return false;
    const a = this.random() * Math.PI * 2;
    let x = Math.cos(a) * 20, z = Math.sin(a) * 20;
    if (!origin && this.wave === 1 && this.spawned < 6) { x = Math.cos(a) * 11; z = Math.sin(a) * 11; }
    if (origin) { x = Math.max(-20, Math.min(20, origin.x + Math.cos(a) * 3)); z = Math.max(-20, Math.min(20, origin.z + Math.sin(a) * 3)); }
    if (this.players.length === 1) {
      // Preserve the V4.1 solo spawn route; the two-player search changes seeded runs.
      if (Math.hypot(x - this.player.x, z - this.player.z) < 6) { x = -Math.sign(this.player.x || 1) * 20; z = -Math.sign(this.player.z || 1) * 18; }
      if (OBSTACLES.some(o => Math.hypot(x - o.x, z - o.z) < o.radius + 2)) { x = 20; z = -18; }
    } else {
      const safe = (px: number, pz: number) => this.players.every(p => p.health <= 0 || Math.hypot(px - p.x, pz - p.z) >= 6) && !OBSTACLES.some(o => Math.hypot(px - o.x, pz - o.z) < o.radius + 2);
      if (!safe(x, z)) {
        let found = false;
        for (let i = 0; i < 16; i++) { const angle = a + i * Math.PI / 8, px = Math.cos(angle) * 20, pz = Math.sin(angle) * 20; if (safe(px, pz)) { x = px; z = pz; found = true; break; } }
        if (!found) return false;
      }
    }
    const selected = kind ?? (this.wave >= 4 && this.spawned % 8 === 6 ? 'stalker' : this.wave >= 3 && this.spawned % 6 === 3 ? 'spitter' : this.wave >= 2 && this.spawned % 5 === 4 ? 'carapace' : 'skitter');
    const e = createEnemy(selected, this.nextId++, x, z, this.wave); if (e.boss && this.players.length === 2) e.hp = e.maxHp = e.maxHp * 1.5; e.state = 'SPAWNING'; this.enemies.push(e); if (e.boss) this.emit('boss', e.x, e.z, undefined, undefined, undefined, e.kind); return true;
  }
  private projectile(x: number, z: number, angle: number, weapon: WeaponId, hostile = false, damage?: number, playerId?: number) {
    if (this.projectiles.length >= CONFIG.maxProjectiles) return;
    const w = WEAPONS[weapon], speed = hostile ? 7 : w.speed;
    this.projectiles.push({ id: this.nextId++, x, z, vx: Math.cos(angle) * speed, vz: Math.sin(angle) * speed, life: hostile ? 5 : w.life, damage: damage ?? w.damage, radius: hostile ? .25 : .12, weapon, hostile, hits: new Set(), remaining: w.pierce, playerId });
  }
  private fire(p: Marine) {
    const id = p.equipped, w = WEAPONS[id];
    if (!p.input.firing || p.cooldowns[id] > 0) return;
    if (id !== 'machinegun' && p.ammo[id] <= 0) { p.equipped = 'machinegun'; return; }
    if (id !== 'machinegun') p.ammo[id]--;
    p.cooldowns[id] = w.interval * (p.haste > 0 ? .65 : 1);
    const a = p.fireAngle; this.emit(id === 'flame' ? 'flame' : 'shot', p.x, p.z, id, a, p.id);
    if (id === 'flame') {
      for (const e of this.grid.near(p.x, p.z, 7)) {
        const dx = e.x - p.x, dz = e.z - p.z, d = Math.hypot(dx, dz);
        if (e.state === 'ADVANCING' && d <= 6 + e.radius && (dx * Math.cos(a) + dz * Math.sin(a)) / Math.max(.01, d) > Math.cos(w.spread) && firstBlockTime(p.x, p.z, e.x, e.z) === Infinity) { this.hit(e, w.damage); e.burn = 2; }
      }
    } else for (let i = 0; i < w.pellets; i++) {
      const spread = id === 'shotgun' ? (i / (w.pellets - 1) - .5) * w.spread * 2 : (this.random() - .5) * w.spread;
      this.projectile(p.x + Math.cos(a) * .9, p.z + Math.sin(a) * .9, a + spread, id, false, undefined, p.id);
    }
  }
  private resolveObstacles(entity: { x: number; z: number }, radius: number) {
    entity.x = Math.max(-CONFIG.arena + radius, Math.min(CONFIG.arena - radius, entity.x)); entity.z = Math.max(-CONFIG.arena + radius, Math.min(CONFIG.arena - radius, entity.z));
    for (const o of OBSTACLES) { const dx = entity.x - o.x, dz = entity.z - o.z, d = Math.hypot(dx, dz), r = radius + o.radius; if (d < r) { entity.x = o.x + (d ? dx / d : 1) * r; entity.z = o.z + (d ? dz / d : 0) * r; } }
  }
  private enemyStep(e: Enemy, dt: number) {
    e.age += dt; e.hitFlash = Math.max(0, e.hitFlash - dt); e.vx = e.vz = 0;
    if (e.state === 'SPAWNING') { if (e.age < .65) return; e.state = 'ADVANCING'; e.age = 0; }
    if (e.state === 'DYING') { if (e.age > .35) e.state = 'REMOVED'; return; }
    if (e.state !== 'ADVANCING') return;
    if (e.burn > 0) { e.burn -= dt; e.burnClock -= dt; if (e.burnClock <= 0) { this.hit(e, 3); e.burnClock = .25; } if (e.state !== 'ADVANCING') return; }
    const target = this.nearestPlayer(e.x, e.z);
    const dx = target.x - e.x, dz = target.z - e.z, d = Math.max(.001, Math.hypot(dx, dz));
    e.attackClock -= dt;
    const ranged = e.kind === 'spitter' || e.kind === 'sovereign';
    const charger = e.kind === 'stalker' || e.kind === 'maw';
    if ((ranged || charger || e.kind === 'brood') && e.attackClock <= 0 && e.warning <= 0) { e.warning = e.boss && e.hp <= e.maxHp / 2 ? .7 : .9; e.aimX = dx / d; e.aimZ = dz / d; if (d < 14) this.emit('creature', e.x, e.z, undefined, undefined, undefined, e.kind); }
    if (e.warning > 0) {
      e.warning -= dt;
      if (e.warning <= 0) {
        if (e.kind === 'brood') { for (let i = 0; i < (e.hp <= e.maxHp / 2 ? 6 : 4); i++) this.spawn('skitter', e); }
        if (ranged) { const angle = Math.atan2(e.aimZ, e.aimX), n = e.boss ? (e.hp < e.maxHp / 2 ? 9 : 5) : 1; for (let i = 0; i < n; i++) this.projectile(e.x, e.z, angle + (i - (n - 1) / 2) * .2, 'machinegun', true, e.damage); }
        e.attackClock = charger ? .38 : e.boss ? (e.hp <= e.maxHp / 2 ? 2.8 : 3.8) : 2.7;
      } else return;
    }
    const charging = charger && e.attackClock < .38 && e.attackClock > 0;
    let vx = charging ? e.aimX * 15 : dx / d * e.speed, vz = charging ? e.aimZ * 15 : dz / d * e.speed;
    if (ranged && d < 9 && !charging) { vx *= -.45; vz *= -.45; }
    for (const other of this.grid.near(e.x, e.z, e.radius + 2)) {
      if (other.id === e.id) continue;
      const ox = e.x - other.x, oz = e.z - other.z, od = Math.hypot(ox, oz), separation = e.radius + other.radius + .15;
      if (od > .01 && od < separation) { vx += ox / od * (separation - od) * 3; vz += oz / od * (separation - od) * 3; }
    }
    if (!charging) for (const obstacle of OBSTACLES) {
      const ox = e.x - obstacle.x, oz = e.z - obstacle.z;
      if (Math.hypot(ox + vx * .25, oz + vz * .25) < obstacle.radius + e.radius + .25) {
        const side = ox * dz - oz * dx >= 0 ? 1 : -1, n = Math.max(.01, Math.hypot(ox, oz));
        vx = -oz / n * side * e.speed; vz = ox / n * side * e.speed; break;
      }
    }
    const oldX = e.x, oldZ = e.z; e.x += vx * dt; e.z += vz * dt; this.resolveObstacles(e, e.radius); e.vx = (e.x - oldX) / dt; e.vz = (e.z - oldZ) / dt;
    for (const p of this.players) if (p.health > 0 && Math.hypot(p.x - e.x, p.z - e.z) < e.radius + .5) this.hurt(e.damage, p);
  }
  private projectileStep(p: Projectile, dt: number) {
    const ax = p.x, az = p.z; p.x += p.vx * dt; p.z += p.vz * dt; p.life -= dt;
    const wallTime = firstBlockTime(ax, az, p.x, p.z, p.radius, CONFIG.arena);
    let stopTime = wallTime;
    if (p.hostile) {
      const targets = this.players.filter(m => m.health > 0).map(m => ({ marine: m, t: segmentCircleEntry(m.x, m.z, .55 + p.radius, ax, az, p.x, p.z) })).filter(hit => hit.t < wallTime).sort((a, b) => a.t - b.t || a.marine.id - b.marine.id);
      if (targets[0]) { this.hurt(p.damage, targets[0].marine); p.life = -1; stopTime = targets[0].t; }
    } else if (p.weapon !== 'cascade') {
      const targets = [...this.grid.near((ax + p.x) / 2, (az + p.z) / 2, Math.hypot(p.x - ax, p.z - az) / 2 + 3)].filter(e => e.state === 'ADVANCING' && !p.hits.has(e.id)).map(e => ({ e, t: segmentCircleEntry(e.x, e.z, e.radius + p.radius, ax, az, p.x, p.z) })).filter(h => h.t < wallTime).sort((a, b) => a.t - b.t || a.e.id - b.e.id);
      for (const { e, t } of targets) { this.hit(e, p.damage); p.hits.add(e.id); if (--p.remaining <= 0) { p.life = -1; stopTime = t; break; } }
    }
    if (stopTime !== Infinity) { p.x = ax + (p.x - ax) * stopTime; p.z = az + (p.z - az) * stopTime; p.life = -1; }
    if (p.weapon === 'cascade' && !p.hostile && p.life <= 0) {
      this.queueExplosion(p.x, p.z, 0, 75, 3.2);
      for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; this.queueExplosion(p.x + Math.cos(a) * 3, p.z + Math.sin(a) * 3, .18 + i * .09, 45, 2.4); }
    }
  }
  private queueExplosion(x: number, z: number, delay: number, damage: number, radius: number) { if (this.explosions.length < 32) this.explosions.push({ x, z, delay, damage, radius }); }
  step(dt = CONFIG.step) {
    if (!Number.isFinite(dt) || dt <= 0 || dt > CONFIG.maxDelta || !['PLAYING', 'WAVE_TRANSITION'].includes(this.phase)) return;
    this.elapsed += dt;
    for (const e of this.events) e.age += dt; this.events = this.events.filter(e => e.age < .55);
    for (const p of this.players) {
      p.cooldown = Math.max(0, p.cooldown - dt);
      for (const id of Object.keys(p.cooldowns) as WeaponId[]) p.cooldowns[id] = Math.max(0, p.cooldowns[id] - dt);
      p.invulnerable = Math.max(0, p.invulnerable - dt); p.shield = Math.max(0, p.shield - dt); p.haste = Math.max(0, p.haste - dt);
    }
    if (this.phase === 'WAVE_TRANSITION') {
      if ((this.transitionClock -= dt) <= 0) {
        const survivor = this.players.find(p => p.health > 0)!;
        for (const p of this.players) if (p.health <= 0) {
          p.health = 35; p.x = survivor.x + (p.id === 0 ? -1.2 : 1.2); p.z = survivor.z; this.resolveObstacles(p, .5); p.invulnerable = 2;
          this.emit('revive', p.x, p.z, undefined, undefined, p.id);
        }
        this.wave++; this.spawned = 0; this.bossSpawned = false; this.spawnClock = .5; this.transition('PLAYING');
      }
      return;
    }
    for (const p of this.players) if (p.health > 0) {
      if (Math.hypot(p.input.x, p.input.z) > .08) { p.heading = Math.round(Math.atan2(p.input.z, p.input.x) / (Math.PI / 4)) * Math.PI / 4; p.x += p.input.x * CONFIG.playerSpeed * dt; p.z += p.input.z * CONFIG.playerSpeed * dt; this.resolveObstacles(p, .5); }
      p.fireAngle = p.aim ?? p.heading + Math.PI / 4;
    }
    this.spawnClock -= dt;
    if (this.spawned < this.waveSize && this.spawnClock <= 0 && this.spawn()) { this.spawned++; this.spawnClock = Math.max(.12, .42 - this.wave * .016); }
    if (this.wave % 5 === 0 && !this.bossSpawned && this.spawned >= this.waveSize / 2) this.bossSpawned = this.spawn(bossForWave(this.wave));
    this.grid.rebuild(this.enemies);
    for (const e of this.enemies.slice()) { this.enemyStep(e, dt); if (this.phase === 'GAME_OVER') return; }
    this.grid.rebuild(this.enemies); for (const p of this.players) if (p.health > 0) {
      const locked = p.targetId; p.targetId = null;
      if (p.aimMode === 'assisted' && p.aim === null) {
        const target = selectAimTarget(p.x, p.z, p.equipped, this.enemies, locked);
        if (target) { const w = WEAPONS[p.equipped]; p.targetId = target.id; p.fireAngle = interceptAngle(p.x, p.z, target, w.speed, w.life); }
      }
      this.fire(p);
    }
    for (const p of this.players) if (p.health > 0 && p.shockAge >= 0) {
      p.shockAge = Math.min(CONFIG.shockDuration, p.shockAge + dt);
      for (const e of this.grid.near(p.shockOrigin.x, p.shockOrigin.z, CONFIG.shockRadius + 3)) if (e.state === 'ADVANCING' && !p.shockHits.has(e.id) && Math.hypot(e.x - p.shockOrigin.x, e.z - p.shockOrigin.z) <= this.shockRadiusFor(p) + e.radius) { p.shockHits.add(e.id); this.hit(e, 90); }
      if (p.shockAge >= CONFIG.shockDuration) p.shockAge = -1;
    }
    for (const bullet of this.projectiles) { this.projectileStep(bullet, dt); if (this.phase === 'GAME_OVER') return; }
    this.projectiles = this.projectiles.filter(b => b.life > 0);
    let processed = 0;
    for (const blast of this.explosions) { blast.delay -= dt; if (blast.delay <= 0 && processed < 8) { processed++; this.emit('explosion', blast.x, blast.z); for (const e of this.grid.near(blast.x, blast.z, blast.radius + 3)) if (Math.hypot(e.x - blast.x, e.z - blast.z) <= blast.radius + e.radius) this.hit(e, blast.damage); blast.delay = -999; } }
    this.explosions = this.explosions.filter(e => e.delay !== -999);
    for (const item of this.pickups) {
      item.life -= dt;
      const candidates = this.players.filter(p => p.health > 0 && Math.hypot(p.x - item.x, p.z - item.z) <= 1.3).sort((a, b) => Math.hypot(a.x - item.x, a.z - item.z) - Math.hypot(b.x - item.x, b.z - item.z) || a.id - b.id);
      const recipient = candidates.find(p => this.collect(item.kind, p));
      if (!recipient) continue;
      item.life = -1; this.emit('pickup', item.x, item.z, undefined, undefined, recipient.id);
    }
    this.pickups = this.pickups.filter(i => i.life > 0); this.enemies = this.enemies.filter(e => e.state !== 'REMOVED');
    if (this.spawned === this.waveSize && this.enemies.length === 0 && (this.wave % 5 !== 0 || this.bossSpawned)) { this.clearInput(); this.transitionClock = 2; for (const p of this.players) p.shockAge = -1; this.projectiles = []; this.transition('WAVE_TRANSITION'); }
  }
  snapshot() {
    const boss = this.enemies.find(e => e.boss && e.state !== 'DYING' && e.state !== 'REMOVED');
    const activeEnemies = this.enemies.filter(e => e.state === 'SPAWNING' || e.state === 'ADVANCING').length;
    const pendingEnemies = Math.max(0, this.waveSize - this.spawned) + (this.wave % 5 === 0 && !this.bossSpawned ? 1 : 0);
    const nextEncounter = nextBossEncounter(this.wave, this.bossSpawned && !boss);
    return { phase: this.phase, health: Math.ceil(this.health), score: this.score, wave: this.wave, kills: this.kills, elapsed: this.elapsed, cooldown: this.cooldown, weapon: this.equipped, ammo: this.ammo[this.equipped], unlocked: [...this.progress.unlocked], bossesKilled: this.bossesKilled, boss: boss ? { name: boss.kind as keyof typeof BOSSES, hp: boss.hp, maxHp: boss.maxHp, warning: boss.warning > 0, phase: boss.hp <= boss.maxHp / 2 ? 2 : 1 } : null, shield: this.player.shield, haste: this.player.haste, progressRevision: this.progressRevision, unlockedThisRun: [...this.unlockedThisRun], playerCount: this.players.length, marines: this.players.map(p => ({ id: p.id, health: Math.ceil(p.health), alive: p.health > 0, weapon: p.equipped, ammo: p.ammo[p.equipped], cooldown: p.cooldown, shield: p.shield, haste: p.haste })), activeEnemies, pendingEnemies, nextEncounter };
  }
  dispose() { this.transition('DISPOSED'); this.clearInput(); this.enemies = []; this.projectiles = []; this.pickups = []; this.events = []; this.explosions = []; for (const p of this.players) p.shockHits.clear(); this.grid.rebuild([]); }
}
export class FixedClock {
  private accumulator = 0;
  reset() { this.accumulator = 0; }
  advance(delta: number, tick: () => void) {
    if (!Number.isFinite(delta) || delta <= 0) return;
    this.accumulator += Math.min(CONFIG.maxDelta, delta); let count = 0;
    while (this.accumulator + 1e-10 >= CONFIG.step && count < CONFIG.maxSteps) { tick(); this.accumulator -= CONFIG.step; count++; }
    if (count === CONFIG.maxSteps) this.accumulator = 0;
  }
}
