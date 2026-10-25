export type ArenaDiagnostics = { fps: number; frameP95: number; updateMs: number; renderMs: number; calls: number; triangles: number; geometries: number; textures: number; enemies: number };
/** CPU timings and frame counts only. This does not estimate GPU time or VRAM. */
export class RenderMetrics {
  private samples: { dt: number; update: number; render: number }[] = [];
  reset() { this.samples = []; }
  observe(dt: number, update: number, render: number) { if (Number.isFinite(dt) && dt > 0 && dt < .5) { this.samples.push({ dt, update, render }); if (this.samples.length > 180) this.samples.shift(); } }
  read() {
    const n = this.samples.length; if (!n) return { fps: 0, frameP95: 0, updateMs: 0, renderMs: 0 };
    const times = this.samples.map(s => s.dt).sort((a, b) => a - b);
    return { fps: n / this.samples.reduce((sum, s) => sum + s.dt, 0), frameP95: times[Math.ceil(n * .95) - 1] * 1000, updateMs: this.samples.reduce((sum, s) => sum + s.update, 0) / n, renderMs: this.samples.reduce((sum, s) => sum + s.render, 0) / n };
  }
}
