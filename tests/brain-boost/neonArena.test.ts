import assert from 'node:assert/strict';
import test from 'node:test';
import { CONFIG, FixedClock, GameSimulation, createEnemy } from '../../src/brain-boost/neon-arena/GameSimulation.ts';
import { OBSTACLES, WEAPONS, PROGRESS_KEY, bossForWave, nextBossEncounter, supplyForRoll, normalizeProgress, readProgress, saveProgress } from '../../src/brain-boost/neon-arena/SurvivalRules.ts';
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
    const s = game(); s.wave = kind === 'brood' ? 5 : kind === 'maw' ? 10 : 15;
    const e = createEnemy(kind, 9999, 2, 3); e.hp = 1; e.warning = 1; s.enemies.push(e); s.shock(); run(s, .2);
    assert.equal(e.state, 'DYING'); assert.equal(s.bossesKilled, 1); assert.equal(s.progressRevision, 1); assert.ok(s.progress.unlocked.includes(weapon)); run(s, .2); assert.equal(s.bossesKilled, 1);
    assert.equal(s.snapshot().nextEncounter.wave, s.wave + 5);
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
test('boss phase two increases capped brood pressure and exposes a phase indicator', () => {
  const counts: number[] = [];
  for (const phaseTwo of [false, true]) {
    const s = game(); const boss = createEnemy('brood', 9999, 9, 0); boss.speed = 0; boss.attackClock = 0; if (phaseTwo) boss.hp = boss.maxHp / 2;
    s.enemies.push(boss); run(s, 1.2); counts.push(s.enemies.filter(e => e.kind === 'skitter').length); assert.equal(s.snapshot().boss?.phase, phaseTwo ? 2 : 1);
  }
  assert.equal(counts[1] - counts[0], 2);
});
test('Maw armor has an explicit vulnerability window rather than requiring its own locked reward', () => {
  const health: number[] = [];
  for (const exposed of [false, true]) {
    const s = game(); const boss = createEnemy('maw', 9999, 3, 3); boss.speed = 0; boss.hp = 1000; boss.warning = exposed ? 1 : 0; s.enemies.push(boss); s.shock(); run(s, .3); health.push(boss.hp);
  }
  assert.equal(health[0], 968.5); assert.equal(health[1], 910);
});
test('ranged attacks have a wind-up and preserve the announced attack direction', () => {
  const s = game(); const e = createEnemy('spitter', 9999, 8, 3); e.attackClock = 0; e.speed = 0; s.enemies.push(e);
  run(s, .4); assert.equal(s.projectiles.filter(b => b.hostile).length, 0); assert.ok(e.warning > 0);
  s.player.z = 10; run(s, .6); const bullet = s.projectiles.find(b => b.hostile); assert.ok(bullet); assert.ok(bullet.vx < 0); assert.ok(Math.abs(bullet.vz) < .001);
});
test('solid debris blocks hostile projectiles before they can damage the marine', () => {
  const s = game(); s.player.x = -8.4; s.player.z = -8;
  s.projectiles.push({ id: 55555, x: -16, z: -8, vx: 600, vz: 0, life: 2, damage: 25, radius: .1, weapon: 'machinegun', hostile: true, hits: new Set(), remaining: 1 });
  s.step(); assert.equal(s.health, 100); assert.equal(s.projectiles.length, 0);
});
test('rail hits a creature before an obstacle but cannot hit another behind it in the same step', () => {
  const s = game(); s.player.x = 0; s.player.z = 0;
  for (const [id, x] of [[50000, -14.5], [50001, -8.4]]) { const e = createEnemy('skitter', id, x, -8); e.speed = 0; e.hp = 100; s.enemies.push(e); }
  s.projectiles.push({ id: 55555, x: -16, z: -8, vx: 600, vz: 0, life: 2, damage: 20, radius: .1, weapon: 'rail', hostile: false, hits: new Set(), remaining: 4 });
  s.step(); assert.equal(s.enemies[0].hp, 80); assert.equal(s.enemies[1].hp, 100);
});
test('flame damage respects cover instead of burning through a solid nest', () => {
  const s = game(all); s.player.x = -14; s.player.z = -8; const e = createEnemy('skitter', 50000, -8.4, -8); e.speed = 0; s.enemies.push(e); s.equip('flame'); s.setInput(0, 0, true, 0); s.step(); assert.equal(e.hp, e.maxHp); assert.equal(e.burn, 0);
});
test('supply tables never generate ammunition or grenades for locked weapons', () => {
  for (let i = 0; i < 100; i++) {
    const initial = supplyForRoll(i / 100, ['machinegun']); assert.ok(['medkit', 'shield', 'haste'].includes(initial));
    assert.notEqual(supplyForRoll(i / 100, ['machinegun', 'shotgun']), 'grenade');
  }
  assert.equal(supplyForRoll(.99, ['machinegun', 'flame', 'cascade']), 'grenade');
  assert.equal(supplyForRoll(NaN, ['machinegun']), 'medkit');
});
test('full-health medkits and full reserves remain on the floor until they can help', () => {
  const s = game(all); const p = s.player;
  s.pickups.push({ id: 9000, kind: 'medkit', x: p.x, z: p.z, life: 10 }); s.step(); assert.equal(s.pickups.length, 1);
  s.health = 80; s.step(); assert.equal(s.pickups.length, 0); assert.equal(s.health, 100);
  s.ammo.shotgun = 60; s.ammo.flame = 300; s.ammo.rail = 56;
  s.pickups.push({ id: 9001, kind: 'ammo', x: p.x, z: p.z, life: 10 }); s.step(); assert.equal(s.pickups.length, 1);
  s.ammo.shotgun = 59; s.step(); assert.equal(s.pickups.length, 0); assert.equal(s.ammo.shotgun, 60);
});
test('grenades only refill cascade and stacked buffs are not wasted every subsequent frame', () => {
  const s = game(all); const p = s.player; s.ammo.shotgun = 0; s.ammo.flame = 1; s.ammo.cascade = 5;
  s.pickups.push({ id: 9000, kind: 'grenade', x: p.x, z: p.z, life: 10 }); s.step(); assert.equal(s.ammo.cascade, 10); assert.equal(s.ammo.shotgun, 0); assert.equal(s.ammo.flame, 1);
  p.shield = 12; s.pickups.push({ id: 9001, kind: 'shield', x: p.x, z: p.z, life: 10 }); run(s, 1); assert.equal(s.pickups.length, 1); assert.ok(p.shield < 12);
  run(s, 5.1); assert.equal(s.pickups.length, 0); assert.ok(p.shield > 10);
});
test('director counters distinguish active and pending creatures; encounter preview follows the actual boss cycle', () => {
  const s = game(); assert.equal(s.snapshot().activeEnemies, 0); assert.equal(s.snapshot().pendingEnemies, 16); run(s, .4);
  assert.equal(s.snapshot().activeEnemies, 1); assert.equal(s.snapshot().pendingEnemies, 15);
  assert.equal(s.snapshot().nextEncounter.wave, 5); assert.equal(nextBossEncounter(5, true).wave, 10);
  assert.equal(nextBossEncounter(10, true).kind, 'sovereign'); assert.equal(bossForWave(20), 'maw'); assert.equal(nextBossEncounter(16).wave, 20);
  assert.equal(nextBossEncounter(NaN).wave, 5);
});
