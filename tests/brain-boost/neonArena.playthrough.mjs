/** Deterministic input-only pilot. No health/position/spawn mutations or debug invulnerability. */
import assert from 'node:assert/strict';
import { GameSimulation, CONFIG } from '../../src/brain-boost/neon-arena/GameSimulation.ts';
import { OBSTACLES } from '../../src/brain-boost/neon-arena/SurvivalRules.ts';
export function playthrough(seed, { seconds = 1200, maxEnemies = 120, useArsenal = true, classic = false } = {}) {
  const s = new GameSimulation(seed, null, maxEnemies); s.ready(); s.start();
  const trace = []; let lastWave = 0, lastKillTick = 0, oldKills = 0;
  for (let tick = 0; tick < 60 * seconds && s.phase !== 'GAME_OVER' && s.wave < 16; tick++) {
    if (s.phase === 'WAVE_TRANSITION') { s.step(); continue; }
    const p = s.player, enemies = s.enemies.filter(e => e.state === 'ADVANCING');
    const distance = e => Math.hypot(e.x - p.x, e.z - p.z);
    const nearest = enemies.reduce((best, e) => !best || distance(e) < distance(best) ? e : best, null);
    const boss = enemies.find(e => e.boss), target = boss && (!nearest || distance(nearest) > 5) ? boss : nearest;
    const orbit = tick / 300; let vx = Math.cos(orbit) * 9 - p.x, vz = Math.sin(orbit) * 9 - p.z;
    const desired = s.pickups.filter(item => item.kind === 'medkit' ? s.health < 80 : useArsenal && item.kind === 'ammo').sort((a, b) => distance(a) - distance(b))[0];
    if (desired) { vx = desired.x - p.x; vz = desired.z - p.z; }
    const magnitude = Math.hypot(vx, vz) || 1; vx /= magnitude; vz /= magnitude;
    let near = 0;
    for (const e of enemies) { const dx = p.x - e.x, dz = p.z - e.z, d = Math.hypot(dx, dz); if (d < 5) { const force = (5 - d) * .65; vx += dx / (d || 1) * force; vz += dz / (d || 1) * force; near++; } }
    for (const b of s.projectiles) if (b.hostile) { const dx = p.x - b.x, dz = p.z - b.z, d = Math.hypot(dx, dz); if (d < 3) { vx += dx / (d || 1) * (3 - d); vz += dz / (d || 1) * (3 - d); } }
    for (const o of OBSTACLES) { const dx = p.x - o.x, dz = p.z - o.z, d = Math.hypot(dx, dz); if (d < o.radius + 2) { vx += dx / (d || 1) * 2; vz += dz / (d || 1) * 2; } }
    if (Math.abs(p.x) > 16) vx -= p.x * .2; if (Math.abs(p.z) > 16) vz -= p.z * .2;
    if (near >= 2 || boss && distance(boss) < 6) s.shock();
    if (useArsenal && tick % 30 === 0) {
      const range = target ? distance(target) : Infinity;
      const id = boss && range > 5 && range < 10 && s.progress.unlocked.includes('cascade') && s.ammo.cascade > 0 && s.cooldowns.cascade === 0 ? 'cascade'
        : range < 6 && near >= 2 && s.progress.unlocked.includes('flame') && s.ammo.flame > 0 ? 'flame'
        : range < 8 && s.progress.unlocked.includes('shotgun') && s.ammo.shotgun > 0 && s.cooldowns.shotgun === 0 ? 'shotgun' : 'machinegun';
      s.equip(id);
    }
    s.setInput(vx, vz, true, classic || !target ? null : Math.atan2(target.z - p.z, target.x - p.x)); s.step();
    if (s.wave !== lastWave) { trace.push({ wave: s.wave, time: Math.floor(s.elapsed), health: +s.health.toFixed(1), kills: s.kills }); lastWave = s.wave; }
    if (s.kills !== oldKills) { oldKills = s.kills; lastKillTick = tick; }
    if (tick - lastKillTick > 60 * 100) return { seed, phase: s.phase, stalled: true, wave: s.wave, time: s.elapsed, health: s.health, trace };
    assert.ok(s.enemies.length <= s.maxEnemies); assert.ok(s.projectiles.length <= CONFIG.maxProjectiles); assert.ok(s.health >= 0 && s.health <= 100);
  }
  return { seed, phase: s.phase, wave: s.wave, time: +s.elapsed.toFixed(2), health: +s.health.toFixed(1), kills: s.kills, bosses: s.bossesKilled, unlocked: s.progress.unlocked, trace };
}
if (process.argv[1]?.endsWith('neonArena.playthrough.mjs')) {
  for (const seed of [72, 42819, 913]) console.log(JSON.stringify(playthrough(seed)));
}
