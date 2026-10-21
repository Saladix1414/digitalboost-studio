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
  neural:  { primary: "#22d3ee", secondary: "#a78bfa", glow: "#0e7490" },
  spatial: { primary: "#67e8f9", secondary: "#c084fc", glow: "#164e63" },
  logic:   { primary: "#38bdf8", secondary: "#a3e635", glow: "#1e40af" },
  memory:  { primary: "#22d3ee", secondary: "#818cf8", glow: "#155e75" },
  focus:   { primary: "#34d399", secondary: "#fbbf24", glow: "#065f46" },
  ocean:   { primary: "#67e8f9", secondary: "#60a5fa", glow: "#075985" },
  dragon:  { primary: "#c084fc", secondary: "#fb7185", glow: "#581c87" },
  numbers: { primary: "#22d3ee", secondary: "#a78bfa", glow: "#3730a3" },
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
  ctx.globalAlpha = intensity;

  const glow = ctx.createRadialGradient(
    width * 0.76, height * 0.18, 0,
    width * 0.76, height * 0.18, Math.max(width, height) * 0.78,
  );
  glow.addColorStop(0, rgba(palette.glow, 0.24));
  glow.addColorStop(1, rgba(palette.glow, 0));

  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  const spacing = 42;
  const offset = (elapsed * 0.006) % spacing;

  ctx.beginPath();
  ctx.strokeStyle = rgba(palette.primary, 0.105);
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
    ctx.arc(x, y, particle.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.beginPath();
  ctx.strokeStyle = rgba(palette.secondary, 0.12);
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

  ctx.restore();
}
