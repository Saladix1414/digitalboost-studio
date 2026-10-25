import assert from 'node:assert/strict';
import test from 'node:test';
import { CONFIG, FixedClock, GameSimulation, createEnemy } from '../../src/brain-boost/neon-arena/GameSimulation.ts';
import { OBSTACLES, WEAPONS, PROGRESS_KEY, normalizeProgress, readProgress, saveProgress } from '../../src/brain-boost/neon-arena/SurvivalRules.ts';
function game(progress?: unknown) { const s = new GameSimulation(72, progress); s.ready(); s.start(); return s; }
function run(s: GameSimulation, seconds: number) { for (let i = 0; i < seconds * 60; i++) s.step(); }
const all = { version: 1, unlocked: ['machinegun', 'shotgun', 'flame', 'cascade', 'rail'], bosses: [] };
test('fixed timestep produces identical gameplay at 30/60/120 FPS', () => {
  const results = [30, 60, 120].map(fps => { const s = game(), clock = new FixedClock(); s.setInput(.4, -.2, true); for (let i = 0; i < fps * 15; i++) clock.advance(1 / fps, () => s.step()); return [s.snapshot(), s.projectiles]; });
  assert.deepEqual(results[0], results[1]); assert.deepEqual(results[1], results[2]);
});
test('classic heading quantizes to eight directions; gun offset is exactly 45 degrees and persists at rest', () => {
  const s = game(); s.setInput(1, 0, true); s.step(); assert.equal(s.player.heading, 0); assert.equal(s.player.fireAngle, Math.PI / 4);
  const b = s.projectiles[0]; assert.ok(b.vx > 0 && b.vz > 0); assert.ok(Math.abs(b.vx - b.vz) < 2);
  s.setInput(0, 0, false); s.step(); assert.equal(s.player.fireAngle, Math.PI / 4);
  s.setInput(0, 0, true, -1); s.step(); assert.equal(s.player.fireAngle, -1);
});
test('diagonal speed is normalized and nonfinite input is rejected', () => {
  const a = game(), b = game(); a.setInput(1, 0, false); b.setInput(1, 1, false); run(a, 1); run(b, 1);
  assert.ok(Math.abs(Math.hypot(a.player.x, a.player.z - 3) - Math.hypot(b.player.x, b.player.z - 3)) < 1e-8);
  const before = JSON.stringify(b); b.setInput(Infinity, 0, true); assert.equal(JSON.stringify(b), before);
});
test('contact damage is rate limited, enemy remains alive and follows the player rather than the origin', () => {
  const s = game(); const e = createEnemy('carapace', 10000, s.player.x, s.player.z); e.speed = 0; s.enemies.push(e); s.step(); assert.equal(s.health, 83); run(s, .4); assert.equal(s.health, 83); assert.equal(e.state, 'ADVANCING'); run(s, .4); assert.equal(s.health, 66);
  const chasing = game(); chasing.player.x = 9; const other = createEnemy('skitter', 99, 6, 3); chasing.enemies.push(other); chasing.step(); assert.ok(other.x > 6);
});
test('pause, defeat and dispose freeze every combat authority', () => {
  const s = game(); run(s, 2); s.shock(); s.pause(); const paused = JSON.stringify(s); run(s, 4); s.setInput(1, 1, true); s.shock(); assert.equal(JSON.stringify(s), paused);
  s.resume(); s.health = 1; s.enemies = [createEnemy('skitter', 9999, s.player.x, s.player.z)]; s.player.invulnerable = 0; s.step(); assert.equal(s.phase, 'GAME_OVER');
  const ended = JSON.stringify(s); run(s, 5); s.shock(); s.equip('machinegun'); s.setInput(1, 0, true); assert.equal(JSON.stringify(s), ended);
  s.dispose(); const disposed = JSON.stringify(s); s.start(); s.ready(); s.step(); assert.equal(JSON.stringify(s), disposed);
});
test('shockwave damages each enemy exactly once and cannot be spammed', () => {
  const s = game(); const e = createEnemy('carapace', 9999, 2, 3); e.hp = 1000; e.speed = 0; s.enemies.push(e); assert.equal(s.shock(), true); assert.equal(s.shock(), false); run(s, .6); assert.equal(e.hp, 910); assert.ok(s.cooldown > 11);
});
test('boss defeat grants one permanent reward immediately and cannot grant it twice', () => {
  for (const [kind, weapon] of [['brood', 'flame'], ['maw', 'cascade'], ['sovereign', 'rail']] as const) {
    const s = game(); const e = createEnemy(kind, 9999, 2, 3); e.hp = 1; e.warning = 1; s.enemies.push(e); s.shock(); run(s, .2);
    assert.equal(e.state, 'DYING'); assert.equal(s.bossesKilled, 1); assert.equal(s.progressRevision, 1); assert.ok(s.progress.unlocked.includes(weapon)); run(s, .2); assert.equal(s.bossesKilled, 1);
    const values = new Map<string, string>(); const storage = { getItem: (k: string) => values.get(k) ?? null, setItem: (k: string, v: string) => { values.set(k, v); } };
    saveProgress(s.progress, storage); const next = new GameSimulation(1, readProgress(storage)); assert.equal(next.equip(weapon), false); next.ready(); assert.equal(next.equip(weapon), true); assert.ok(values.has(PROGRESS_KEY));
  }
});
test('arsenal rejects locked weapons and switching never resets cooldowns', () => {
  const s = game(all); s.equip('shotgun'); s.setInput(0, 0, true); s.step(); const cooldown = s.cooldowns.shotgun; assert.equal(s.ammo.shotgun, 29); s.equip('machinegun'); s.equip('shotgun'); assert.equal(s.cooldowns.shotgun, cooldown);
  s.ammo.shotgun = 0; run(s, 1); assert.equal(s.equipped, 'machinegun'); assert.equal(game().equip('rail'), false);
});
test('rail penetrates at most four enemies and each target only once; swept bullets do not tunnel', () => {
  const s = game(all); s.equip('rail'); s.setInput(0, 0, true, 0);
  for (let i = 0; i < 6; i++) { const e = createEnemy('carapace', 10000 + i, 2 + i * 1.8, 3); e.hp = 1000; e.speed = 0; e.radius = .5; s.enemies.push(e); }
  s.step(); s.setInput(0, 0, false); run(s, .3);
  assert.equal(s.enemies.filter(e => e.hp === 890).length, 4); assert.equal(s.enemies.filter(e => e.hp === 1000).length, 2);
});
test('flame is a directional bounded cone and burns over simulation time', () => {
  const s = game(all); s.equip('flame'); const front = createEnemy('carapace', 10000, 3, 3), back = createEnemy('carapace', 10001, -3, 3); front.speed = back.speed = 0; s.enemies.push(front, back); s.setInput(0, 0, true, 0); s.step(); assert.ok(front.hp < 125); assert.equal(back.hp, 125); assert.equal(s.ammo.flame, 149); s.setInput(0, 0, false); run(s, .5); assert.ok(front.hp < 116);
});
test('cascade detonates five scheduled blasts without unbounded recursion', () => {
  const s = game(all); s.equip('cascade'); s.setInput(0, 0, true, 0); s.step(); s.setInput(0, 0, false);
  let seen = new Set<number>(); for (let i = 0; i < 100; i++) { s.step(); for (const e of s.events) if (e.kind === 'explosion') seen.add(e.id); }
  assert.equal(seen.size, 5); assert.equal(s.ammo.cascade, 11);
});
test('pickups require proximity, heal is capped and temporary buffs have limits', () => {
  const s = game(); s.health = 90; s.pickups.push({ id: 9000, kind: 'medkit', x: 8, z: 8, life: 10 }); s.step(); assert.equal(s.health, 90); s.pickups[0].x = s.player.x; s.pickups[0].z = s.player.z; s.step(); assert.equal(s.health, 100); assert.equal(s.pickups.length, 0);
  for (let i = 0; i < 8; i++) s.pickups.push({ id: i, kind: 'shield', x: s.player.x, z: s.player.z, life: 2 }); s.step(); assert.equal(s.player.shield, 12);
});
test('obstacles agree with player collision and waves do not apply hidden reactor healing', () => {
  const s = game(); const o = OBSTACLES[0]; s.player.x = o.x; s.player.z = o.z; s.setInput(1, 0, false); s.step(); assert.ok(Math.hypot(s.player.x - o.x, s.player.z - o.z) >= o.radius + .49);
  s.health = 70; for (let i = 0; i < 3000 && s.phase === 'PLAYING'; i++) { for (const e of s.enemies) e.state = 'REMOVED'; s.step(); }
  assert.equal(s.phase, 'WAVE_TRANSITION'); s.pause(); run(s, 5); assert.equal(s.wave, 1); s.resume(); run(s, 2.1); assert.equal(s.wave, 2); assert.equal(s.health, 70);
});
test('corrupt progress fails safe, merges without losing unlocks and supports unavailable storage', () => {
  assert.deepEqual(normalizeProgress({ version: 1, unlocked: ['rail', 'rail', 'evil'], bosses: ['maw', 'evil'] }), { version: 1, unlocked: ['machinegun', 'rail'], bosses: ['maw'] });
  assert.deepEqual(readProgress({ getItem: () => '{bad' }).unlocked, ['machinegun']);
  assert.doesNotThrow(() => saveProgress(normalizeProgress(all), { getItem: () => { throw Error(); }, setItem: () => { throw Error(); } }));
  assert.equal(normalizeProgress({ version: 90, unlocked: ['rail'] }).unlocked.length, 1);
});
test('stress remains bounded and reproducible for seeded input; catch-up is capped', () => {
  const a = game(all), b = game(all); for (let i = 0; i < 12000; i++) { if (i % 90 === 0) { for (const s of [a, b]) { s.setInput(Math.cos(i), Math.sin(i), true); s.shock(); } } a.step(); b.step(); assert.ok(a.enemies.length <= a.maxEnemies); assert.ok(a.projectiles.length <= CONFIG.maxProjectiles); assert.ok(a.events.length <= CONFIG.maxEvents); assert.ok(a.pickups.length <= CONFIG.maxPickups); }
  assert.deepEqual(a.snapshot(), b.snapshot()); const clock = new FixedClock(); let ticks = 0; clock.advance(500, () => ticks++); assert.equal(ticks, 6); assert.ok(WEAPONS.rail.pierce <= 4);
});
