import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { GameSimulation, CONFIG, createEnemy } from '../../src/brain-boost/neon-arena/GameSimulation.ts';
for (const count of [120, 240]) {
  const s = new GameSimulation(72, null, count); s.ready(); s.start();
  for (let i = 0; i < count; i++) { const a = i * 2.39996, r = 4 + i % 14; s.enemies.push(createEnemy(i % 5 ? 'skitter' : 'spitter', 10000 + i, Math.cos(a) * r, Math.sin(a) * r)); }
  const timings = [];
  for (let tick = 0; tick < 3600; tick++) {
    // Explicit benchmark invulnerability keeps the harness alive; not a production mode.
    s.player.invulnerable = 2; s.setInput(Math.cos(tick / 120), Math.sin(tick / 120), true);
    const start = performance.now(); s.step(); timings.push(performance.now() - start);
    assert.ok(s.enemies.length <= count); assert.ok(s.projectiles.length <= CONFIG.maxProjectiles); assert.ok(s.events.length <= CONFIG.maxEvents);
  }
  timings.sort((a, b) => a - b);
  console.log(JSON.stringify({ initialEnemies: count, steps: 3600, meanMs: +(timings.reduce((a, b) => a + b, 0) / timings.length).toFixed(3), p95Ms: +timings[Math.floor(timings.length * .95)].toFixed(3), maxMs: +timings.at(-1).toFixed(3), finalEnemies: s.enemies.length }));
}
