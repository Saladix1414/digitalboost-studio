import { LEGACY_ARENA, type ArenaDefinition } from './ArenaDefinition.ts';
import { firstBlockTime, WEAPONS, type WeaponId } from './SurvivalRules.ts';
import type { Enemy } from './GameSimulation.ts';
export type AimMode = 'assisted' | 'modern' | 'classic';
/** Bounded analytic interception. Bullets retain normal swept collision and straight trajectories. */
export function interceptAngle(x: number, z: number, enemy: Pick<Enemy, 'x' | 'z' | 'vx' | 'vz'>, speed: number, life: number, arena: ArenaDefinition = LEGACY_ARENA) {
  const dx = enemy.x - x, dz = enemy.z - z;
  if (speed <= 0) return Math.atan2(dz, dx);
  const a = enemy.vx ** 2 + enemy.vz ** 2 - speed ** 2, b = 2 * (dx * enemy.vx + dz * enemy.vz), c = dx ** 2 + dz ** 2;
  let time = 0;
  if (Math.abs(a) < 1e-6) { if (b < -1e-6) time = -c / b; }
  else { const d = b * b - 4 * a * c; if (d >= 0) { const roots = [(-b - Math.sqrt(d)) / (2 * a), (-b + Math.sqrt(d)) / (2 * a)].filter(t => t > 0); if (roots.length) time = Math.min(...roots); } }
  time = Math.min(time, life, .7);
  const tx = enemy.x + enemy.vx * time, tz = enemy.z + enemy.vz * time;
  // Never lead into solid cover; direct fire remains a valid fallback.
  return firstBlockTime(x, z, tx, tz, 0, arena.halfExtent, arena.obstacles) === Infinity ? Math.atan2(tz - z, tx - x) : Math.atan2(dz, dx);
}
export function selectAimTarget(x: number, z: number, weapon: WeaponId, enemies: readonly Enemy[], locked: number | null, arena: ArenaDefinition = LEGACY_ARENA) {
  const w = WEAPONS[weapon], range = Math.min(15, weapon === 'flame' ? 6 : weapon === 'cascade' ? w.speed * w.life : w.speed * w.life + .9);
  let target: Enemy | undefined, best = Infinity;
  for (const e of enemies) {
    const d = Math.hypot(e.x - x, e.z - z);
    if (e.state !== 'ADVANCING' || e.hp <= 0 || d > range || firstBlockTime(x, z, e.x, e.z, 0, arena.halfExtent, arena.obstacles) !== Infinity) continue;
    // Stable lock avoids flicker, but an immediate contact threat takes priority.
    const score = d < 2.5 ? d * .35 : d * (e.id === locked ? .78 : 1);
    if (score < best || score === best && e.id < (target?.id ?? Infinity)) { best = score; target = e; }
  }
  return target;
}
