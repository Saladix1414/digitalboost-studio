import assert from 'node:assert/strict';
import test from 'node:test';
import { LocalGamepads, keyboardAction, keyboardInput, splitViewports } from '../../src/brain-boost/neon-arena/LocalControls.ts';
import { CONFIG, FixedClock, GameSimulation, createEnemy } from '../../src/brain-boost/neon-arena/GameSimulation.ts';
const arsenal = { version: 1, unlocked: ['machinegun', 'shotgun', 'flame', 'cascade', 'rail'], bosses: [] };
function coop() { const s = new GameSimulation(72, arsenal, 120, 2); s.ready(); s.start(); return s; }
function run(s: GameSimulation, seconds: number) { for (let i = 0; i < seconds * 60; i++) s.step(); }

test('two marines own separate resources while solo compatibility accessors reference marine one', () => {
  const s = coop(); assert.equal(s.players.length, 2); assert.equal(s.player, s.players[0]); assert.notEqual(s.players[0].ammo, s.players[1].ammo);
  s.health = 76; assert.equal(s.players[0].health, 76); assert.equal(s.players[1].health, 100);
  s.equip('shotgun', 1); s.setInput(1, 0, true, null, 1); s.step(); assert.equal(s.players[1].ammo.shotgun, 29); assert.equal(s.ammo.shotgun, 30); assert.equal(s.equipped, 'machinegun');
});
test('inputs, aim and shockwave cooldown are independently addressed', () => {
  const s = coop(), x = s.players.map(p => p.x); s.setInput(1, 0, false, null, 0); s.setInput(-1, 0, true, Math.PI, 1); s.step();
  assert.ok(s.players[0].x > x[0]); assert.ok(s.players[1].x < x[1]); assert.equal(s.players[1].fireAngle, Math.PI); assert.ok(s.projectiles.every(b => b.playerId === 1));
  assert.equal(s.shock(1), true); assert.equal(s.players[0].cooldown, 0); assert.equal(s.shock(0), true); assert.equal(s.shock(1), false);
  s.clearInput(1); assert.equal(s.players[0].input.x, 1); assert.equal(s.players[1].input.x, 0);
});
test('enemies target the nearest living marine and ignore a fallen partner', () => {
  const s = coop(); s.players[0].x = -12; s.players[0].z = 0; s.players[1].x = 4; s.players[1].z = 0;
  const e = createEnemy('skitter', 9999, 6, 0); s.enemies.push(e); s.step(); assert.ok(e.x < 6); assert.equal(s.nearestPlayer(6, 0).id, 1);
  s.players[1].health = 0; assert.equal(s.nearestPlayer(6, 0).id, 0);
});
test('one marine can fall without ending the team game; dead marines cannot shoot or collect', () => {
  const s = coop(); const p = s.players[1]; p.health = 1; const e = createEnemy('skitter', 9999, p.x, p.z); e.speed = 0; s.enemies.push(e); s.step();
  assert.equal(p.health, 0); assert.equal(s.phase, 'PLAYING'); assert.equal(s.players[0].health, 100);
  assert.equal(s.shock(1), false); assert.equal(s.equip('rail', 1), false); s.setInput(1, 0, true, null, 1); assert.equal(p.input.firing, false);
  s.pickups.push({ id: 88888, kind: 'medkit', x: p.x, z: p.z, life: 10 }); s.step(); assert.equal(p.health, 0); assert.equal(s.pickups.length, 1);
});
test('team wipe is terminal and freezes shared combat', () => {
  const s = coop(); for (const p of s.players) { p.health = 1; const e = createEnemy('skitter', 9000 + p.id, p.x, p.z); e.speed = 0; s.enemies.push(e); }
  s.step(); assert.equal(s.phase, 'GAME_OVER'); assert.ok(s.players.every(p => p.health === 0)); const before = JSON.stringify(s); run(s, 4); s.shock(1); s.setInput(1, 0, true, null, 1); assert.equal(JSON.stringify(s), before);
});
test('finishing a wave rescues the fallen partner once with explicit 35 health', () => {
  const s = coop(); s.players[1].health = 0;
  for (let i = 0; i < 3000 && s.phase === 'PLAYING'; i++) { for (const e of s.enemies) e.state = 'REMOVED'; s.step(); }
  assert.equal(s.phase, 'WAVE_TRANSITION'); assert.equal(s.players[1].health, 0); s.pause(); run(s, 3); assert.equal(s.players[1].health, 0); s.resume(); run(s, 2.1);
  assert.equal(s.wave, 2); assert.equal(s.players[1].health, 35); assert.ok(s.players[1].invulnerable > 1); assert.equal(s.events.filter(e => e.kind === 'revive').length, 1);
});
test('one pickup goes to the nearest marine who can use it, without sharing the heal', () => {
  const s = coop(); s.players[0].x = 0; s.players[1].x = .5; s.players[1].health = 50;
  s.pickups.push({ id: 9000, kind: 'medkit', x: 0, z: 3, life: 10 }); s.step(); assert.equal(s.players[0].health, 100); assert.equal(s.players[1].health, 75); assert.equal(s.pickups.length, 0);
  s.players[0].health = 50; s.pickups.push({ id: 9001, kind: 'medkit', x: 0, z: 3, life: 10 }); s.step(); assert.equal(s.players[0].health, 75); assert.equal(s.players[1].health, 75);
});
test('hostile swept shots hit the first living marine only and friendly shots have no team damage', () => {
  const s = coop(); s.players[0].x = 4; s.players[1].x = 1;
  s.projectiles.push({ id: 8000, x: -2, z: 3, vx: 600, vz: 0, life: 2, damage: 10, radius: .1, weapon: 'machinegun', hostile: true, hits: new Set(), remaining: 1 }); s.step();
  assert.equal(s.players[1].health, 90); assert.equal(s.players[0].health, 100);
  s.projectiles.push({ id: 8001, x: -2, z: 3, vx: 600, vz: 0, life: 2, damage: 100, radius: .1, weapon: 'rail', hostile: false, playerId: 0, hits: new Set(), remaining: 4 }); s.step(); assert.equal(s.players[1].health, 90);
});
test('simultaneous shockwaves award a shared boss reward and score only once', () => {
  const s = new GameSimulation(72, null, 120, 2); s.ready(); s.start(); const e = createEnemy('brood', 9000, 0, 6); e.hp = 1; e.warning = 1; s.enemies.push(e); s.shock(0); s.shock(1); run(s, .2);
  assert.equal(s.bossesKilled, 1); assert.equal(s.score, 500); assert.equal(s.progressRevision, 1); assert.ok(s.progress.unlocked.includes('flame')); assert.equal(s.players[0].ammo.flame, 150); assert.equal(s.players[1].ammo.flame, 150);
});
test('co-op is fixed-step deterministic and cannot change participant count during a run', () => {
  const results = [30, 60, 120].map(fps => { const s = coop(), clock = new FixedClock(); s.setInput(1, 0, true, 0, 0); s.setInput(-1, 0, true, Math.PI, 1); for (let i = 0; i < fps * 10; i++) clock.advance(1 / fps, () => s.step()); assert.equal(s.setPlayerCount(1), false); return s.snapshot(); });
  assert.deepEqual(results[0], results[1]); assert.deepEqual(results[1], results[2]);
  const s = new GameSimulation(); s.ready(); assert.equal(s.setPlayerCount(2), true); assert.equal(s.waveSize, 23); assert.equal(s.snapshot().playerCount, 2); assert.equal(CONFIG.maxProjectiles, 320);
});
test('keyboard players and split viewports remain independent and cover odd-sized canvases without gaps', () => {
  const keys = new Set(['KeyW', 'ArrowDown', 'KeyJ']); assert.equal(keyboardInput(keys, 0, 2).z, -1); assert.equal(keyboardInput(keys, 1, 2).z, 1); assert.equal(keyboardInput(keys, 0, 2).firing, false); assert.equal(keyboardInput(keys, 1, 2).firing, true);
  assert.equal(keyboardAction('KeyK', 2)?.playerId, 1); assert.equal(keyboardAction('KeyK', 1), null); assert.equal(keyboardAction('Space', 2)?.playerId, 0);
  assert.deepEqual(splitViewports(901, 600, 2), [{ x: 0, y: 0, width: 450, height: 600 }, { x: 450, y: 0, width: 451, height: 600 }]);
  assert.deepEqual(splitViewports(390, 601, 2), [{ x: 0, y: 0, width: 390, height: 300 }, { x: 0, y: 300, width: 390, height: 301 }]);
});
test('two gamepads keep stable seats, dead zones and edge-triggered abilities across disconnection', () => {
  const pads = new LocalGamepads(), buttons = Array.from({ length: 10 }, () => ({ pressed: false }));
  const a = { index: 2, connected: true, axes: [.1, .1, 0, 0], buttons: buttons.map(b => ({ ...b })) };
  const b = { index: 7, connected: true, axes: [1, 1, 0, -1], buttons: buttons.map(b => ({ ...b })) }; b.buttons[0].pressed = true; b.buttons[1].pressed = true;
  let sample = pads.sample([a, b], 2); assert.equal(sample.inputs[0].x, 0); assert.equal(sample.inputs[1].shock, true); assert.equal(sample.inputs[1].firing, true); assert.ok(Math.abs(Math.hypot(sample.inputs[1].x, sample.inputs[1].z) - 1) < 1e-9);
  assert.equal(pads.sample([a, b], 2).inputs[1].shock, false);
  sample = pads.sample([b], 2); assert.equal(sample.disconnected, true); assert.equal(pads.slots[0], null); assert.equal(pads.slots[1], 7); assert.equal(sample.inputs[0].firing, false);
  pads.sample([a, b], 2); assert.deepEqual(pads.slots, [2, 7]);
});
test('spawn locations stay clear of both marines and co-op bosses use bounded team scaling', () => {
  const s = coop(); s.players[0].x = 20; s.players[0].z = 0; s.players[1].x = -20; s.players[1].z = 0;
  for (let i = 0; i < 600 && s.phase === 'PLAYING'; i++) { s.step(); for (const e of s.enemies) if (e.state === 'SPAWNING' && e.age <= CONFIG.step * 1.01) for (const p of s.players) if (p.health > 0) assert.ok(Math.hypot(e.x - p.x, e.z - p.z) >= 6); }
  const hp: number[] = [];
  for (const count of [1, 2] as const) {
    const game = new GameSimulation(72, null, 120, count); game.ready(); game.start(); game.wave = 5;
    for (let i = 0; i < 1800 && !game.enemies.some(e => e.boss); i++) { for (const e of game.enemies) e.state = 'REMOVED'; game.step(); }
    const boss = game.enemies.find(e => e.boss); assert.ok(boss); hp.push(boss.maxHp);
  }
  assert.deepEqual(hp, [700, 1050]);
});
test('pausing a shared match freezes both resources and invalid player IDs have no authority', () => {
  const s = coop(); s.setInput(1, 0, true, null, 0); s.setInput(0, -1, true, null, 1); run(s, .5); s.shock(0); s.shock(1); s.pause();
  const before = JSON.stringify(s); run(s, 10); s.setInput(1, 0, true, null, 1); s.setInput(1, 0, true, null, 100); assert.equal(s.shock(100), false); assert.equal(s.equip('rail', 100), false); assert.equal(JSON.stringify(s), before);
});
