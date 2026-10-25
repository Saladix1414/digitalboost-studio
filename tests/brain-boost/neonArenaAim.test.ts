import assert from 'node:assert/strict';
import test from 'node:test';
import { interceptAngle, selectAimTarget } from '../../src/brain-boost/neon-arena/AimAssist.ts';
import { GameSimulation, createEnemy, FixedClock } from '../../src/brain-boost/neon-arena/GameSimulation.ts';
const start = (count: 1 | 2 = 1) => { const s = new GameSimulation(42819, null, 120, count); s.ready(); s.start(); return s; };
test('assisted acquisition excludes corpses, spawn animations, cover and weapon range', () => {
  const dead = createEnemy('skitter', 1, 0, 2); dead.state = 'DYING';
  const spawning = createEnemy('skitter', 2, 0, 3); spawning.state = 'SPAWNING';
  const covered = createEnemy('skitter', 3, -12, -8.72);
  assert.equal(selectAimTarget(0, 0, 'machinegun', [covered], null), undefined);
  const far = createEnemy('skitter', 4, 19, 0);
  const valid = createEnemy('skitter', 5, 5, 0);
  assert.equal(selectAimTarget(0, 0, 'machinegun', [dead, spawning, covered, far, valid], null)?.id, 5);
  assert.equal(selectAimTarget(0, 0, 'flame', [createEnemy('skitter', 6, 8, 0)], null), undefined);
});
test('target lock resists small distance changes but yields to immediate contact threats', () => {
  const locked = createEnemy('skitter', 10, 0, 8), other = createEnemy('skitter', 11, 7, 0);
  assert.equal(selectAimTarget(0, 0, 'machinegun', [other, locked], 10)?.id, 10);
  other.x = 2; assert.equal(selectAimTarget(0, 0, 'machinegun', [other, locked], 10)?.id, 11);
  locked.state = 'DYING'; assert.equal(selectAimTarget(0, 0, 'machinegun', [locked], 10), undefined);
});
test('interception leads moving targets and remains finite for stationary and unreachable targets', () => {
  const target = { x: 10, z: 0, vx: 0, vz: 4 }, angle = interceptAngle(0, 0, target, 37, .9);
  assert.ok(angle > 0); const time = 10 / (Math.cos(angle) * 37);
  assert.ok(Math.abs(Math.sin(angle) * 37 * time - 4 * time) < 1e-8);
  assert.equal(interceptAngle(0, 0, target, 0, 1), 0);
  assert.ok(Number.isFinite(interceptAngle(0, 0, { ...target, vx: 100 }, 20, .9)));
});
test('assisted firing tracks all four quadrants and real bullets kill without moving the marine', () => {
  for (const [x, z] of [[5, 3], [-5, 3], [0, 8], [0, -2]]) {
    const s = start(); s.setAimMode('assisted'); const e = createEnemy('skitter', 9000, x, z); e.speed = 0; s.enemies = [e];
    s.setInput(0, 0, true); for (let i = 0; i < 28; i++) s.step();
    assert.equal(e.hp, 0, `target ${x},${z}`); assert.equal(s.kills, 1); assert.equal(s.player.x, 0); assert.equal(s.player.z, 3);
  }
});
test('assist never fires automatically and explicit aim overrides target acquisition', () => {
  const s = start(); s.setAimMode('assisted'); s.enemies = [createEnemy('skitter', 9000, 5, 3)]; s.step();
  assert.equal(s.projectiles.length, 0); assert.equal(s.player.targetId, 9000);
  s.setInput(0, 0, true, Math.PI); s.step(); assert.equal(s.player.fireAngle, Math.PI); assert.equal(s.player.targetId, null);
  assert.ok(s.projectiles.every(b => b.vx < 0)); s.pause(); const before = JSON.stringify(s); s.step(); assert.equal(JSON.stringify(s), before);
});
test('co-op targeting and manual/classic preferences are independent', () => {
  const s = start(2); s.setAimMode('assisted', 0); s.setAimMode('modern', 1);
  s.enemies = [createEnemy('skitter', 9000, -7, 3)]; s.setInput(0, 0, true, null, 0); s.setInput(0, 0, true, Math.PI / 2, 1); s.step();
  assert.equal(s.players[0].targetId, 9000); assert.ok(Math.abs(s.players[0].fireAngle) > 3); assert.equal(s.players[1].targetId, null); assert.equal(s.players[1].fireAngle, Math.PI / 2);
  s.setAimMode('classic', 0); s.setInput(1, 0, false, null, 0); s.step(); assert.equal(s.player.fireAngle, Math.PI / 4);
});
test('hit feedback and run unlocks follow confirmed combat and persist only as authorized progress', () => {
  const s = start(); const e = createEnemy('brood', 9000, 3, 3); e.speed = 0; s.enemies = [e]; s.setInput(0, 0, true, 0);
  for (let i = 0; i < 8; i++) s.step(); assert.ok(e.hp < e.maxHp); assert.ok(e.hitFlash > 0);
  e.hp = 1; s.shock(); for (let i = 0; i < 20; i++) s.step();
  assert.deepEqual(s.snapshot().unlockedThisRun, ['flame']); assert.equal(s.events.filter(e => e.kind === 'kill').length, 1);
  const next = new GameSimulation(42819, s.progress); assert.deepEqual(next.snapshot().unlockedThisRun, []); assert.ok(next.progress.unlocked.includes('flame'));
});
test('assisted combat remains fixed-step deterministic across rendering rates', () => {
  const results = [30, 60, 120].map(fps => { const s = start(); s.setAimMode('assisted'); s.setInput(0, 0, true); const clock = new FixedClock(); for (let i = 0; i < fps * 10; i++) clock.advance(1 / fps, () => s.step()); return s.snapshot(); });
  assert.deepEqual(results[0], results[1]); assert.deepEqual(results[1], results[2]);
});
