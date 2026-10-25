import { LEGACY_ARENA } from './ArenaDefinition.ts';
export type WeaponId = 'machinegun' | 'shotgun' | 'flame' | 'cascade' | 'rail';
export const WEAPONS: Record<WeaponId, { name: string; interval: number; damage: number; speed: number; life: number; pellets: number; spread: number; pierce: number; reserve: number }> = {
  machinegun: { name: 'Ametralladora', interval: .105, damage: 18, speed: 37, life: .9, pellets: 1, spread: .035, pierce: 1, reserve: 0 },
  shotgun: { name: 'Escopeta', interval: .7, damage: 19, speed: 28, life: .38, pellets: 7, spread: .48, pierce: 1, reserve: 30 },
  flame: { name: 'Lanzallamas', interval: .12, damage: 9, speed: 0, life: .18, pellets: 0, spread: .55, pierce: 0, reserve: 150 },
  cascade: { name: 'Granada de cascada', interval: 1.4, damage: 75, speed: 13, life: .6, pellets: 1, spread: 0, pierce: 1, reserve: 12 },
  rail: { name: 'Rail Lance', interval: .9, damage: 110, speed: 75, life: .55, pellets: 1, spread: 0, pierce: 4, reserve: 28 },
};
export const WEAPON_IDS = Object.keys(WEAPONS) as WeaponId[];
export const PROGRESS_KEY = 'digitalboost:brain-boost:neon-arena:arsenal:v1';
export type Progress = { version: 1; unlocked: WeaponId[]; bosses: string[] };
export function normalizeProgress(raw: unknown): Progress {
  const p = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  const unlocked: WeaponId[] = ['machinegun'];
  if (p.version === 1 && Array.isArray(p.unlocked)) for (const id of p.unlocked) if (WEAPON_IDS.includes(id) && !unlocked.includes(id)) unlocked.push(id);
  const bosses = p.version === 1 && Array.isArray(p.bosses) ? [...new Set(p.bosses.filter((v): v is string => typeof v === 'string' && ['brood', 'maw', 'sovereign'].includes(v)))] : [];
  return { version: 1, unlocked, bosses };
}
export function readProgress(storage?: Pick<Storage, 'getItem'>): Progress {
  try { return normalizeProgress(JSON.parse(storage?.getItem(PROGRESS_KEY) || 'null')); } catch { return normalizeProgress(null); }
}
export function saveProgress(progress: Progress, storage?: Pick<Storage, 'getItem' | 'setItem'>) {
  const old = readProgress(storage);
  const merged = normalizeProgress({ version: 1, unlocked: [...old.unlocked, ...progress.unlocked], bosses: [...old.bosses, ...progress.bosses] });
  try { storage?.setItem(PROGRESS_KEY, JSON.stringify(merged)); } catch { /* In-memory progress remains valid. */ }
  return merged;
}
export const OBSTACLES = LEGACY_ARENA.obstacles;
export type PickupKind = 'medkit' | 'ammo' | 'grenade' | 'shield' | 'haste';
export function supplyForRoll(roll: number, unlocked: readonly WeaponId[]): PickupKind {
  const available: PickupKind[] = ['medkit', 'shield', 'haste'];
  if (unlocked.some(id => id !== 'machinegun' && id !== 'cascade')) available.push('ammo');
  if (unlocked.includes('cascade')) available.push('grenade');
  const value = Number.isFinite(roll) ? Math.max(0, Math.min(.999999, roll)) : 0;
  return available[Math.floor(value * available.length)];
}

export const BOSSES = {
  brood: { name: 'BROOD MOTHER', reward: 'flame' },
  maw: { name: 'IRON MAW', reward: 'cascade' },
  sovereign: { name: 'HIVE SOVEREIGN', reward: 'rail' },
} as const;
export function bossForWave(wave: number): keyof typeof BOSSES {
  return wave % 15 === 0 ? 'sovereign' : wave % 10 === 0 ? 'maw' : 'brood';
}
export function nextBossEncounter(wave: number, clearedCurrent = false) {
  const safeWave = Number.isSafeInteger(wave) && wave > 0 ? wave : 1;
  const encounterWave = safeWave % 5 === 0 && clearedCurrent ? safeWave + 5 : Math.ceil(safeWave / 5) * 5;
  const kind = bossForWave(encounterWave);
  return { wave: encounterWave, kind, ...BOSSES[kind] };
}

/** First intersection along a swept segment; Infinity means no intersection. */
export function segmentCircleEntry(cx: number, cz: number, radius: number, ax: number, az: number, bx: number, bz: number) {
  const dx = bx - ax, dz = bz - az, ox = ax - cx, oz = az - cz;
  const c = ox * ox + oz * oz - radius * radius;
  if (c <= 0) return 0;
  const a = dx * dx + dz * dz; if (a < 1e-12) return Infinity;
  const b = ox * dx + oz * dz, discriminant = b * b - a * c;
  if (discriminant < 0) return Infinity;
  const t = (-b - Math.sqrt(discriminant)) / a;
  return t >= 0 && t <= 1 ? t : Infinity;
}

export function firstBlockTime(ax: number, az: number, bx: number, bz: number, radius = 0, arena = 21, obstacles = OBSTACLES) {
  const edge = arena - radius;
  if (Math.abs(ax) >= edge || Math.abs(az) >= edge) return 0;
  let first = Infinity;
  if (bx > edge) first = Math.min(first, (edge - ax) / (bx - ax));
  if (bx < -edge) first = Math.min(first, (-edge - ax) / (bx - ax));
  if (bz > edge) first = Math.min(first, (edge - az) / (bz - az));
  if (bz < -edge) first = Math.min(first, (-edge - az) / (bz - az));
  for (const o of obstacles) first = Math.min(first, segmentCircleEntry(o.x, o.z, o.radius + radius, ax, az, bx, bz));
  return first;
}
