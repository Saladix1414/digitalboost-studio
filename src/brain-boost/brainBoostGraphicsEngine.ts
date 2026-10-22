export type BrainBoostTheme =
  | "neural"
  | "spatial"
  | "logic"
  | "memory"
  | "focus"
  | "ocean"
  | "dragon"
  | "numbers";

export interface BrainBoostPalette {
  primary: string;
  secondary: string;
  glow: string;
}

export interface BrainBoostParticle {
  x: number;
  y: number;
  speed: number;
  radius: number;
  phase: number;
}

const PALETTES: Record<BrainBoostTheme, BrainBoostPalette> = {
  neural:  { primary: "#38bdf8", secondary: "#f0abfc", glow: "#164e63" },
  spatial: { primary: "#22d3ee", secondary: "#e879f9", glow: "#4c1d95" },
  logic:   { primary: "#a3e635", secondary: "#38bdf8", glow: "#365314" },
  memory:  { primary: "#22f5ff", secondary: "#f472ff", glow: "#0e7490" },
  focus:   { primary: "#34d399", secondary: "#fbbf24", glow: "#065f46" },
  ocean:   { primary: "#2dd4bf", secondary: "#60a5fa", glow: "#0e7490" },
  dragon:  { primary: "#fbbf24", secondary: "#fb7185", glow: "#9f1239" },
  numbers: { primary: "#facc15", secondary: "#22d3ee", glow: "#92400e" },
};

export function resolveBrainBoostPalette(
  theme: BrainBoostTheme,
): BrainBoostPalette {
  return { ...PALETTES[theme] };
}

function seededValue(index: number, seed: number): number {
  const value = Math.sin(index * 127.1 + seed * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

export function createBrainBoostParticle(
  index: number,
  seed = 41,
): BrainBoostParticle {
  const safeIndex = Number.isFinite(index) ? Math.trunc(index) : 0;
  const safeSeed = Number.isFinite(seed) ? seed : 41;

  return {
    x: seededValue(safeIndex * 4 + 1, safeSeed),
    y: seededValue(safeIndex * 4 + 2, safeSeed),
    speed: 0.008 + seededValue(safeIndex * 4 + 3, safeSeed) * 0.022,
    radius: 0.7 + seededValue(safeIndex * 4 + 4, safeSeed) * 1.6,
    phase: seededValue(safeIndex * 4 + 5, safeSeed) * Math.PI * 2,
  };
}

function rgba(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${Math.max(0, Math.min(1, alpha))})`;
}

export interface AmbientRenderOptions {
  intensity?: number;
  seed?: number;
}

/**
 * Draws a transparent animated layer.
 * The host canvas owns its dimensions and animation lifecycle.
 */

function drawThemeSignature(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  elapsedMs: number,
  theme: BrainBoostTheme,
  seed: number,
): void {
  const p = resolveBrainBoostPalette(theme);
  const unit = Math.min(width, height);
  const time = elapsedMs * 0.001;

  function line(
    x1: number, y1: number, x2: number, y2: number,
    color = p.primary, alpha = 0.75, thickness = 1.6,
  ) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = rgba(color, alpha);
    ctx.lineWidth = thickness;
    ctx.stroke();
  }

  function ring(
    x: number, y: number, radius: number,
    color = p.primary, alpha = 0.8, thickness = 1.5,
  ) {
    ctx.beginPath();
    ctx.arc(x, y, Math.max(0.5, radius), 0, Math.PI * 2);
    ctx.strokeStyle = rgba(color, alpha);
    ctx.lineWidth = thickness;
    ctx.stroke();
  }

  function dot(
    x: number, y: number, radius: number,
    color = p.primary, alpha = 0.95,
  ) {
    ctx.beginPath();
    ctx.arc(x, y, Math.max(0.5, radius), 0, Math.PI * 2);
    ctx.fillStyle = rgba(color, alpha);
    ctx.fill();
  }

  function path(
    points: Array<[number, number]>,
    color = p.primary, alpha = 0.75, thickness = 1.6,
  ) {
    if (points.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i += 1) {
      ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.strokeStyle = rgba(color, alpha);
    ctx.lineWidth = thickness;
    ctx.stroke();
  }

  switch (theme) {
    case "memory": {
      const xs = [0.2, 0.5, 0.8].map(v => width * v);
      const ys = [0.25, 0.5, 0.75].map(v => height * v);
      ys.forEach(y => line(xs[0], y, xs[2], y, p.primary, 0.44, 2.2));
      xs.forEach(x => line(x, ys[0], x, ys[2], p.secondary, 0.36, 1.8));
      ys.forEach((y, row) => xs.forEach((x, col) => {
        const c = (row + col) % 2 ? p.secondary : p.primary;
        const r = unit * (0.015 + 0.003 * Math.sin(time * 2 + row + col));
        ring(x, y, r * 2.2, c, 0.8, 1.7);
        ring(x, y, r * 1.35, c, 0.96, 1.2);
        dot(x, y, r * 0.45, c);
      }));
      break;
    }

    case "ocean": {
      for (let i = 0; i < 14; i += 1) {
        const x = seededValue(i + 101, seed) * width;
        const startY = seededValue(i + 121, seed) * height;
        const speed = 5 + seededValue(i + 141, seed) * 15;
        const y = ((startY - time * speed) % height + height) % height;
        const r = unit * (0.008 + seededValue(i + 161, seed) * 0.018);
        ring(x, y, r, i % 3 ? p.primary : p.secondary, 0.9);
        ring(x, y, r * 0.55, p.primary, 0.55, 1);
        dot(x - r * 0.3, y - r * 0.35, r * 0.12, "#ffffff", 0.8);
      }
      for (let w = 0; w < 3; w += 1) {
        const points: Array<[number, number]> = [];
        for (let i = 0; i <= 24; i += 1) {
          const x = width * i / 24;
          const y = height * (0.72 + w * 0.075) +
            Math.sin(i * 0.48 + time * (w % 2 ? 0.8 : -0.7)) * unit * 0.017;
          points.push([x, y]);
        }
        path(points, w === 1 ? p.secondary : p.primary, 0.72, 1.8);
      }
      break;
    }

    case "dragon": {
      for (let side = 0; side < 2; side += 1) {
        const x = width * (side ? 0.88 : 0.12);
        for (let i = 0; i < 5; i += 1) {
          const y = height * (0.15 + i * 0.17);
          const r = unit * (0.012 + seededValue(i + side * 7, seed) * 0.012);
          const c = (i + side) % 2 ? p.secondary : p.primary;
          path([[x, y-r*1.7], [x+r, y], [x, y+r*1.7],
            [x-r, y], [x, y-r*1.7]], c, 0.9, 1.7);
          line(x-r*0.55, y, x+r*0.55, y, c, 0.6, 1);
        }
      }
      const spine: Array<[number, number]> = [];
      for (let i = 0; i <= 14; i += 1) {
        spine.push([
          width * (0.16 + i * 0.048),
          height * (0.46 + (i % 2 ? 0.035 : -0.035) +
            Math.sin(time + i * 0.55) * 0.012),
        ]);
      }
      path(spine, p.primary, 0.8, 2.2);
      break;
    }

    case "numbers": {
      const values = [0.2, 0.3, 0.24, 0.42, 0.34, 0.6, 0.49, 0.72];
      const left = width * 0.51;
      const chartWidth = width * 0.43;
      const baseY = height * 0.85;
      const barWidth = chartWidth / 14;
      const points: Array<[number, number]> = [];
      line(left, baseY, left + chartWidth, baseY, p.secondary, 0.7, 1.5);
      values.forEach((v, i) => {
        const x = left + i * chartWidth / values.length;
        const h = height * v * 0.19;
        const y = baseY - h;
        ctx.fillStyle = rgba(i % 2 ? p.secondary : p.primary, 0.66);
        ctx.fillRect(x, y, barWidth, h);
        points.push([x + barWidth / 2, y]);
      });
      path(points, p.primary, 0.95, 2.1);
      points.forEach(([x, y]) => dot(x, y, unit * 0.005, p.secondary));
      break;
    }

    case "logic": {
      const nodes: Array<[number, number]> = [
        [0.08, 0.22], [0.29, 0.22], [0.29, 0.46],
        [0.52, 0.46], [0.52, 0.26], [0.86, 0.26],
        [0.86, 0.70], [0.62, 0.70], [0.62, 0.84], [0.2, 0.84],
      ];
      const links: Array<[number, number]> = [
        [0,1], [1,2], [2,3], [3,4], [4,5],
        [3,6], [6,7], [7,8], [8,9],
      ];
      links.forEach(([a,b], i) => {
        const from = nodes[a];
        const to = nodes[b];
        line(from[0]*width, from[1]*height, to[0]*width, from[1]*height,
          i % 2 ? p.secondary : p.primary, 0.72, 1.9);
        line(to[0]*width, from[1]*height, to[0]*width, to[1]*height,
          i % 2 ? p.secondary : p.primary, 0.72, 1.9);
      });
      nodes.forEach(([x,y], i) => {
        const c = i % 2 ? p.secondary : p.primary;
        ring(x*width, y*height, unit*0.014, c, 0.95, 1.8);
        dot(x*width, y*height, unit*0.0045, c);
      });
      break;
    }

    case "spatial": {
      const cx = width * 0.73;
      const cy = height * 0.5;
      const base = unit * 0.16;
      [0.65, 0.94, 1.24, 1.5].forEach((scale, i) => {
        ring(cx, cy, base*scale, i % 2 ? p.secondary : p.primary, 0.86, 1.7);
      });
      for (let i = 0; i < 16; i += 1) {
        const a = i * Math.PI / 8 + time * 0.24;
        const r1 = base * 0.9;
        const r2 = base * (i % 2 ? 1.3 : 1.48);
        line(cx+Math.cos(a)*r1, cy+Math.sin(a)*r1,
          cx+Math.cos(a)*r2, cy+Math.sin(a)*r2,
          i % 2 ? p.secondary : p.primary, 0.82, 1.5);
        dot(cx+Math.cos(a)*r2, cy+Math.sin(a)*r2, unit*0.0045,
          i % 2 ? p.secondary : p.primary);
      }
      break;
    }

    case "focus": {
      for (const [cx, cy, c] of [
        [width*0.18, height*0.28, p.primary],
        [width*0.82, height*0.71, p.secondary],
      ] as Array<[number, number, string]>) {
        [0.035, 0.06, 0.09].forEach(s => ring(cx, cy, unit*s, c, 0.8, 1.6));
        line(cx-unit*0.12, cy, cx-unit*0.075, cy, c, 0.95, 2.2);
        line(cx+unit*0.075, cy, cx+unit*0.12, cy, c, 0.95, 2.2);
        line(cx, cy-unit*0.12, cx, cy-unit*0.075, c, 0.95, 2.2);
        line(cx, cy+unit*0.075, cx, cy+unit*0.12, c, 0.95, 2.2);
        dot(cx, cy, unit*0.006, c);
      }
      break;
    }

    case "neural": {
      const nodes: Array<[number, number]> = [
        [0.15,0.24], [0.35,0.13], [0.48,0.36],
        [0.24,0.55], [0.7,0.21], [0.82,0.48], [0.58,0.76],
      ];
      const links: Array<[number, number]> = [
        [0,1], [0,3], [1,2], [2,3], [2,4], [2,6], [4,5], [5,6],
      ];
      links.forEach(([a,b], i) => line(
        nodes[a][0]*width, nodes[a][1]*height,
        nodes[b][0]*width, nodes[b][1]*height,
        i % 2 ? p.secondary : p.primary, 0.75, 1.8,
      ));
      nodes.forEach(([x,y], i) => {
        ring(x*width, y*height, unit*0.012,
          i % 2 ? p.secondary : p.primary, 0.9, 1.5);
        dot(x*width, y*height, unit*0.0045, p.primary);
      });
      break;
    }
  }
}

export function drawBrainBoostAmbient(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  elapsedMs: number,
  theme: BrainBoostTheme,
  options: AmbientRenderOptions = {},
): void {
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  ) {
    return;
  }

  const palette = resolveBrainBoostPalette(theme);
  const intensity = Math.max(0, Math.min(1, options.intensity ?? 0.65));
  const elapsed = Number.isFinite(elapsedMs) ? Math.max(0, elapsedMs) : 0;
  const seed = options.seed ?? 41;

  if (intensity === 0) return;

  ctx.save();
  ctx.globalAlpha = Math.min(1, intensity * 2.2);

  const glow = ctx.createRadialGradient(
    width * 0.76, height * 0.18, 0,
    width * 0.76, height * 0.18, Math.max(width, height) * 0.78,
  );
  glow.addColorStop(0, rgba(palette.glow, 0.42));
  glow.addColorStop(1, rgba(palette.glow, 0));

  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  const spacing = 42;
  const offset = (elapsed * 0.006) % spacing;

  ctx.beginPath();
  ctx.strokeStyle = rgba(palette.primary, 0.18);
  ctx.lineWidth = 0.7;

  for (let x = -spacing + offset; x < width + spacing; x += spacing) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }

  for (let y = -spacing + offset; y < height + spacing; y += spacing) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }

  ctx.stroke();

  const particleCount = Math.min(
    36,
    Math.max(12, Math.round((width * height) / 18000)),
  );

  for (let index = 0; index < particleCount; index += 1) {
    const particle = createBrainBoostParticle(index, seed);
    const x = ((particle.x * width + elapsed * particle.speed * 0.035) % width + width) % width;
    const drift = Math.sin(elapsed * 0.0007 + particle.phase) * 8;
    const y = Math.max(0, Math.min(height, particle.y * height + drift));
    const pulse = 0.45 + 0.35 * Math.sin(elapsed * 0.001 + particle.phase);

    ctx.beginPath();
    ctx.fillStyle = rgba(palette.primary, pulse);
    ctx.arc(x, y, particle.radius * 1.45, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.beginPath();
  ctx.strokeStyle = rgba(palette.secondary, 0.24);
  ctx.lineWidth = 1;

  const ringRadius = Math.min(width, height) * 0.22;
  ctx.arc(
    width * 0.82,
    height * 0.72,
    ringRadius,
    elapsed * 0.00015,
    elapsed * 0.00015 + Math.PI * 1.3,
  );
  ctx.stroke();

  drawThemeSignature(ctx, width, height, elapsed, theme, seed);
  ctx.restore();
}
