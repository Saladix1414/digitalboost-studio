export type ArenaDefinition = Readonly<{
  id: 'legacy' | 'colony'; halfExtent: number; floorSize: number; wall: number; wallThickness: number; spawnRadius: number;
  obstacles: readonly Readonly<{ x: number; z: number; radius: number }>[];
}>;
const obstacles = Object.freeze([
  { x: -11, z: -8, radius: 1.7 }, { x: 10, z: -10, radius: 1.5 },
  { x: -12, z: 10, radius: 1.6 }, { x: 12, z: 9, radius: 1.5 },
  { x: -4, z: -15, radius: 1.2 }, { x: 5, z: 15, radius: 1.2 },
].map(o => Object.freeze(o)));
/** Legacy retains exact coordinates/operations for the accepted seeded campaign. */
export const LEGACY_ARENA: ArenaDefinition = Object.freeze({ id: 'legacy', halfExtent: 21, floorSize: 49, wall: 22, wallThickness: .8, spawnRadius: 20, obstacles });
export const COLONY_ARENA: ArenaDefinition = Object.freeze({ id: 'colony', halfExtent: 25, floorSize: 57, wall: 25.4, wallThickness: .8, spawnRadius: 24, obstacles });
export const DEFAULT_ARENA = COLONY_ARENA;
