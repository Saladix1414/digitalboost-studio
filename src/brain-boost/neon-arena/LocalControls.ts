export type Viewport = { x: number; y: number; width: number; height: number };
/** DOM/top-origin rectangles; WebGL converts y only at the render boundary. */
export function splitViewports(width: number, height: number, count: number): Viewport[] {
  const w = Math.max(1, Math.floor(width)), h = Math.max(1, Math.floor(height));
  if (count === 1) return [{ x: 0, y: 0, width: w, height: h }];
  if (w >= h) { const half = Math.floor(w / 2); return [{ x: 0, y: 0, width: half, height: h }, { x: half, y: 0, width: w - half, height: h }]; }
  const half = Math.floor(h / 2); return [{ x: 0, y: 0, width: w, height: half }, { x: 0, y: half, width: w, height: h - half }];
}
export function keyboardInput(keys: ReadonlySet<string>, playerId: number, count: number) {
  const arrow = playerId === 1 || count === 1;
  return {
    x: Number(playerId === 0 && keys.has('KeyD') || arrow && keys.has('ArrowRight')) - Number(playerId === 0 && keys.has('KeyA') || arrow && keys.has('ArrowLeft')),
    z: Number(playerId === 0 && keys.has('KeyS') || arrow && keys.has('ArrowDown')) - Number(playerId === 0 && keys.has('KeyW') || arrow && keys.has('ArrowUp')),
    firing: playerId === 0 ? keys.has('KeyF') : keys.has('ControlRight') || keys.has('KeyJ') || keys.has('Numpad0'),
  };
}
export function keyboardAction(code: string, count: number): { action: 'pause' | 'shock' | 'cycle' | 'equip'; playerId: number; index?: number } | null {
  if (code === 'KeyP') return { action: 'pause', playerId: 0 };
  if (code === 'Space') return { action: 'shock', playerId: 0 };
  if (code === 'KeyQ') return { action: 'cycle', playerId: 0 };
  if (/^Digit[1-5]$/.test(code)) return { action: 'equip', playerId: 0, index: Number(code.slice(-1)) - 1 };
  if (count === 2) {
    if (code === 'ShiftRight' || code === 'KeyK') return { action: 'shock', playerId: 1 };
    if (code === 'Enter' || code === 'KeyL') return { action: 'cycle', playerId: 1 };
    if (/^Numpad[1-5]$/.test(code)) return { action: 'equip', playerId: 1, index: Number(code.slice(-1)) - 1 };
  }
  return null;
}
export type PadLike = { index: number; connected: boolean; axes: readonly number[]; buttons: readonly { pressed: boolean; value?: number }[] };
export type PadInput = { x: number; z: number; aim: number | null; firing: boolean; shock: boolean; cycle: boolean; pause: boolean };
const empty = (): PadInput => ({ x: 0, z: 0, aim: null, firing: false, shock: false, cycle: false, pause: false });
export class LocalGamepads {
  readonly slots: (number | null)[] = [null, null];
  private previous = [{ shock: false, cycle: false, pause: false }, { shock: false, cycle: false, pause: false }];
  sample(pads: readonly (PadLike | null)[], count: number) {
    const connected = pads.filter((p): p is PadLike => !!p?.connected); let disconnected = false;
    for (let i = 0; i < 2; i++) if (this.slots[i] !== null && !connected.some(p => p.index === this.slots[i])) {
      if (i < count) disconnected = true; this.slots[i] = null; this.previous[i] = { shock: false, cycle: false, pause: false };
    }
    for (const pad of connected) if (!this.slots.includes(pad.index)) { const slot = this.slots.findIndex((value, i) => i < count && value === null); if (slot >= 0) this.slots[slot] = pad.index; }
    const inputs = Array.from({ length: count }, (_, i) => {
      const pad = connected.find(p => p.index === this.slots[i]); if (!pad) return empty();
      const axis = (n: number) => Number.isFinite(pad.axes[n]) ? Math.max(-1, Math.min(1, pad.axes[n])) : 0;
      const pressed = (n: number) => !!pad.buttons[n]?.pressed || (pad.buttons[n]?.value ?? 0) > .5;
      const x = axis(0), z = axis(1), n = Math.hypot(x, z), ax = axis(2), az = axis(3);
      const held = { shock: pressed(1), cycle: pressed(4), pause: pressed(9) }, old = this.previous[i]; this.previous[i] = held;
      return { x: n > .18 ? x / Math.max(1, n) : 0, z: n > .18 ? z / Math.max(1, n) : 0, aim: Math.hypot(ax, az) > .2 ? Math.atan2(az, ax) : null, firing: pressed(0) || pressed(7), shock: held.shock && !old.shock, cycle: held.cycle && !old.cycle, pause: held.pause && !old.pause };
    });
    return { inputs, disconnected };
  }
}
