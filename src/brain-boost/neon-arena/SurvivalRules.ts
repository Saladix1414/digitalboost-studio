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
export const OBSTACLES = [
  { x: -11, z: -8, radius: 1.7 }, { x: 10, z: -10, radius: 1.5 },
  { x: -12, z: 10, radius: 1.6 }, { x: 12, z: 9, radius: 1.5 },
  { x: -4, z: -15, radius: 1.2 }, { x: 5, z: 15, radius: 1.2 },
];
export function segmentDistance(px: number, pz: number, ax: number, az: number, bx: number, bz: number) {
  const dx = bx - ax, dz = bz - az, d = dx * dx + dz * dz;
  const t = d ? Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / d)) : 0;
  return { distance: Math.hypot(px - ax - dx * t, pz - az - dz * t), t };
}
