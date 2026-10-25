import assert from 'node:assert/strict';
import test from 'node:test';
import { playthrough } from './neonArena.playthrough.mjs';
import { GameSimulation } from '../../src/brain-boost/neon-arena/GameSimulation.ts';

test('input-only modern pilot completes the actual default seed through all three bosses', () => {
  const first = playthrough(42819);
  assert.equal(first.stalled, undefined); assert.equal(first.wave, 16); assert.equal(first.bosses, 3);
  assert.deepEqual(first.unlocked, ['machinegun', 'shotgun', 'flame', 'cascade', 'rail']);
  assert.ok(first.health > 0); assert.ok(first.time < 600); assert.equal(first.trace.length, 15);
  assert.deepEqual(playthrough(42819), first, 'full-run outcomes must reproduce from the same seed and input policy');
});
test('an idle marine receives ordinary contact damage and cannot advance waves without combat', () => {
  const s = new GameSimulation(42819); s.ready(); s.start();
  for (let i = 0; i < 60 * 180 && s.phase !== 'GAME_OVER'; i++) s.step();
  assert.equal(s.phase, 'GAME_OVER'); assert.equal(s.health, 0); assert.equal(s.wave, 1); assert.equal(s.kills, 0);
});
