import assert from 'node:assert/strict';
import test from 'node:test';
import { CONFIG, FixedClock, GameSimulation } from '../../src/brain-boost/neon-arena/GameSimulation.ts';

function game() { const s = new GameSimulation(72); s.ready(); s.start(); return s; }
function run(s: GameSimulation, seconds: number) { for (let i = 0; i < seconds * 60; i++) s.step(); }

test('combat is reproducible and bounded for a fixed seed and inputs', () => {
  const a = game(), b = game();
  for (let i = 0; i < 36000; i++) {
    if (i % 300 === 0) { a.move(9, 8); b.move(9, 8); a.shock(); b.shock(); }
    a.step(); b.step();
    assert.ok(a.enemies.length <= CONFIG.maxEnemies);
    assert.ok(a.events.length <= CONFIG.maxEvents);
    assert.ok(a.health >= 0 && a.health <= CONFIG.health);
  }
  assert.deepEqual(a.snapshot(), b.snapshot()); assert.deepEqual(a.enemies, b.enemies);
});
test('paused simulation freezes combat, wave, cooldown and time', () => {
  const s = game(); run(s, 3); s.shock(); s.pause();
  const before = JSON.stringify(s); run(s, 30); s.move(10, 10);
  assert.equal(s.shock(), false); assert.equal(JSON.stringify(s), before);
  s.resume(); s.step(); assert.ok(s.elapsed > 3);
});
test('one reactor collision applies damage once; game over is terminal', () => {
  const s = game(); s.health = 7;
  s.enemies.push({ id: 100, kind: 'swarm', x: 1, z: 0, hp: 24, radius: .5, speed: 1, damage: 7, value: 10, age: 1, state: 'ADVANCING' });
  s.step(); assert.equal(s.phase, 'GAME_OVER'); assert.equal(s.health, 0);
  const before = JSON.stringify(s); run(s, 20); s.shock(); s.move(8, 8);
  assert.equal(JSON.stringify(s), before); assert.equal(s.start(), false);
});
test('expanding shockwave damages an intersected target only once', () => {
  const s = game(), baseline = game();
  for (const sim of [s, baseline]) {
    sim.drone = { x: -12, z: -12 }; sim.target = { ...sim.drone };
    sim.enemies.push({ id: 100, kind: 'brute', x: -12, z: -11, hp: 1000, radius: 1, speed: 0, damage: 20, value: 40, age: 1, state: 'ADVANCING' });
  }
  assert.equal(s.shock(), true); assert.equal(s.shock(), false);
  run(s, 1); run(baseline, 1);
  assert.equal(baseline.enemies[0].hp - s.enemies[0].hp, 85);
  assert.equal(s.cooldown > 10, true);
});
test('wave transition completes once, pauses and explicitly heals at the boundary', () => {
  const s = game();
  for (let i = 0; i < 5000 && s.phase === 'PLAYING'; i++) {
    s.step(); s.health = 100;
    for (const e of s.enemies) e.state = 'REMOVED';
  }
  assert.equal(s.phase, 'WAVE_TRANSITION'); s.health = 98; s.pause();
  run(s, 10); assert.equal(s.wave, 1); s.resume(); run(s, 3);
  assert.equal(s.wave, 2); assert.equal(s.health, 100);
});
test('fixed timestep produces equal outcomes at 30, 60 and 120 FPS', () => {
  const outcomes = [30, 60, 120].map(fps => {
    const s = game(), clock = new FixedClock();
    for (let i = 0; i < fps * 10; i++) clock.advance(1 / fps, () => s.step());
    return s.snapshot();
  });
  assert.deepEqual(outcomes[0], outcomes[1]); assert.deepEqual(outcomes[1], outcomes[2]);
});
test('catch-up is capped, invalid inputs rejected and dispose is irreversible', () => {
  const clock = new FixedClock(); let count = 0; clock.advance(120, () => count++);
  assert.equal(count, CONFIG.maxSteps); clock.reset(); clock.advance(NaN, () => count++);
  assert.equal(count, CONFIG.maxSteps);
  const s = game(); s.move(Infinity, 0); assert.deepEqual(s.target, { x: 0, z: 6 });
  s.move(100, -100); assert.deepEqual(s.target, { x: 14, z: -14 });
  s.dispose(); const before = JSON.stringify(s); s.step(); s.ready(); s.start(); s.shock();
  assert.equal(JSON.stringify(s), before); assert.equal(s.phase, 'DISPOSED');
});
