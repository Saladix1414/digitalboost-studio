export interface SpatialPoint {
  x: number;
  y: number;
}

export interface SpatialChoice {
  id: string;
  label: string;
  rotationDeg: number;
  mirrored: boolean;
}

export interface SpatialPuzzle {
  level: number;
  title: string;
  subtitle: string;
  prompt: string;
  rotationDeg: number;
  vertices: SpatialPoint[];
  choices: SpatialChoice[];
  correctChoiceId: string;
  explanation: string;
  hints: [string, string];
}

type RandomSource = () => number;

const SHAPES: SpatialPoint[][] = [
  [
    { x: -0.68, y: -0.36 },
    { x: -0.13, y: -0.55 },
    { x: 0.19, y: -0.28 },
    { x: 0.62, y: -0.08 },
    { x: 0.31, y: 0.19 },
    { x: 0.44, y: 0.57 },
    { x: -0.19, y: 0.47 },
    { x: -0.38, y: 0.12 },
    { x: -0.64, y: 0.20 },
  ],
  [
    { x: -0.58, y: -0.43 },
    { x: -0.02, y: -0.61 },
    { x: 0.30, y: -0.22 },
    { x: 0.58, y: -0.34 },
    { x: 0.49, y: 0.08 },
    { x: 0.19, y: 0.18 },
    { x: 0.36, y: 0.55 },
    { x: -0.34, y: 0.42 },
    { x: -0.18, y: 0.03 },
  ],
  [
    { x: -0.54, y: -0.48 },
    { x: 0.04, y: -0.58 },
    { x: 0.48, y: -0.29 },
    { x: 0.25, y: 0.03 },
    { x: 0.58, y: 0.39 },
    { x: -0.05, y: 0.55 },
    { x: -0.26, y: 0.23 },
    { x: -0.60, y: 0.12 },
  ],
];

function createRandom(seed: number): RandomSource {
  let state = (Math.trunc(seed) >>> 0) || 0x9e3779b9;

  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function shuffle<T>(items: T[], random: RandomSource): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function safeLevel(level: number): number {
  return Number.isFinite(level)
    ? Math.max(1, Math.min(99, Math.floor(level)))
    : 1;
}

export function generateSpatialPuzzle(
  level: number,
  seed: number,
): SpatialPuzzle {
  const safe = safeLevel(level);
  const random = createRandom(seed);
  const vertices = SHAPES[Math.floor(random() * SHAPES.length)].map(
    (point) => ({ ...point }),
  );

  const anglePool =
    safe <= 10
      ? [90, 180, 270]
      : safe <= 30
        ? [45, 90, 135, 180, 225, 270, 315]
        : [30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

  const rotationDeg =
    anglePool[Math.floor(random() * anglePool.length)];

  const otherAngles = shuffle(
    anglePool.filter((angle) => angle !== rotationDeg),
    random,
  ).slice(0, 2);

  const candidates = shuffle(
    [
      { rotationDeg, mirrored: false },
      ...otherAngles.map((angle) => ({
        rotationDeg: angle,
        mirrored: false,
      })),
      { rotationDeg, mirrored: true },
    ],
    random,
  );

  const choices: SpatialChoice[] = candidates.map((choice, index) => ({
    ...choice,
    id: `spatial-${String.fromCharCode(65 + index)}`,
    label: String.fromCharCode(65 + index),
  }));

  const correct = choices.find(
    (choice) =>
      choice.rotationDeg === rotationDeg && !choice.mirrored,
  );

  if (!correct) {
    throw new Error("No se pudo generar la transformación correcta.");
  }

  return {
    level: safe,
    title:
      safe <= 10
        ? "Orientation Initiation"
        : safe <= 30
          ? "Vector Rotation"
          : "Spatial Rift",
    subtitle: "GEOMETRÍA / ROTACIÓN MENTAL",
    prompt:
      `Imaginá la pieza girando ${rotationDeg}° en sentido horario. ` +
      "Elegí la misma pieza rotada, sin reflejarla.",
    rotationDeg,
    vertices,
    choices,
    correctChoiceId: correct.id,
    explanation:
      `La transformación correcta gira cada punto ${rotationDeg}° en sentido horario. ` +
      "Una rotación conserva la orientación de la figura; un reflejo invierte su disposición.",
    hints: [
      "Seguí dos vértices asimétricos de la pieza. Un giro cambia su posición, no las conexiones entre ellos.",
      `Buscá una pieza girada ${rotationDeg}°. Descartá la que invierte la figura como si estuviera frente a un espejo.`,
    ],
  };
}

export function transformSpatialVertices(
  vertices: readonly SpatialPoint[],
  rotationDeg: number,
  mirrored: boolean,
): SpatialPoint[] {
  const radians = (rotationDeg * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  return vertices.map((point) => {
    const x = mirrored ? -point.x : point.x;

    return {
      x: x * cos - point.y * sin,
      y: x * sin + point.y * cos,
    };
  });
}

function drawPolygon(
  ctx: CanvasRenderingContext2D,
  vertices: readonly SpatialPoint[],
  cx: number,
  cy: number,
  size: number,
  rotationDeg: number,
  mirrored: boolean,
  fill: string,
  stroke: string,
  lineWidth: number,
): void {
  const points = transformSpatialVertices(vertices, rotationDeg, mirrored);
  if (points.length === 0) return;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  ctx.moveTo(points[0].x * size, points[0].y * size);

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x * size, points[i].y * size);
  }

  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = "round";
  ctx.stroke();
  ctx.restore();
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  elapsedMs: number,
): void {
  const spacing = 27;
  const offset = (elapsedMs * 0.009) % spacing;

  ctx.save();
  ctx.strokeStyle = "rgba(70, 190, 230, 0.075)";
  ctx.lineWidth = 1;
  ctx.beginPath();

  for (let x = -spacing + offset; x < width + spacing; x += spacing) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }

  for (let y = -spacing + offset; y < height + spacing; y += spacing) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }

  ctx.stroke();
  ctx.restore();
}

export function drawSpatialRiftScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  puzzle: SpatialPuzzle,
  elapsedMs: number,
): void {
  if (width <= 0 || height <= 0) return;

  ctx.clearRect(0, 0, width, height);

  const background = ctx.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, "#071a31");
  background.addColorStop(0.54, "#071020");
  background.addColorStop(1, "#170e32");

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  drawGrid(ctx, width, height, elapsedMs);

  for (let i = 0; i < 20; i++) {
    const travel =
      (elapsedMs * (0.004 + (i % 4) * 0.001) + i * 73) %
      Math.max(width, 1);
    const x = travel;
    const y = (i * 47 + 19) % Math.max(height, 1);
    const alpha = 0.18 + (Math.sin(elapsedMs * 0.001 + i) + 1) * 0.15;

    ctx.fillStyle = `rgba(103, 232, 249, ${alpha})`;
    ctx.fillRect(x, y, i % 3 === 0 ? 2 : 1, i % 3 === 0 ? 2 : 1);
  }

  const size = Math.min(width, height) * 0.32;
  const baseX = width * 0.29;
  const centerY = height * 0.51;
  const float = Math.sin(elapsedMs * 0.0012) * 2.5;

  ctx.save();
  ctx.strokeStyle = "rgba(103, 232, 249, 0.17)";
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.ellipse(baseX, centerY + float, size * 0.91, size * 0.76, 0, 0, Math.PI * 2);
  ctx.stroke();

  drawPolygon(
    ctx,
    puzzle.vertices,
    baseX,
    centerY + float,
    size,
    0,
    false,
    "rgba(6, 182, 212, 0.24)",
    "#67e8f9",
    2.2,
  );
  ctx.restore();

  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "800 10px system-ui, sans-serif";
  ctx.fillStyle = "rgba(165, 243, 252, 0.8)";
  ctx.fillText("PIEZA BASE", baseX, height - 18);

  const gaugeX = width * 0.73;
  const gaugeY = height * 0.48;
  const radius = Math.min(height * 0.235, width * 0.12, 72);
  const pulse = 1 + Math.sin(elapsedMs * 0.002) * 0.035;

  ctx.strokeStyle = "rgba(167, 139, 250, 0.18)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(gaugeX, gaugeY, radius * 1.35 * pulse, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "rgba(103, 232, 249, 0.20)";
  ctx.beginPath();
  ctx.arc(gaugeX, gaugeY, radius, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8 - Math.PI / 2;
    const x1 = gaugeX + Math.cos(angle) * radius * 0.88;
    const y1 = gaugeY + Math.sin(angle) * radius * 0.88;
    const x2 = gaugeX + Math.cos(angle) * radius;
    const y2 = gaugeY + Math.sin(angle) * radius;

    ctx.strokeStyle = "rgba(196, 181, 253, 0.62)";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + (puzzle.rotationDeg * Math.PI) / 180;

  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#a78bfa";
  ctx.beginPath();
  ctx.arc(gaugeX, gaugeY, radius * 0.72, startAngle, endAngle);
  ctx.stroke();

  const markerX = gaugeX + Math.cos(endAngle) * radius * 0.72;
  const markerY = gaugeY + Math.sin(endAngle) * radius * 0.72;

  ctx.fillStyle = "#67e8f9";
  ctx.beginPath();
  ctx.arc(markerX, markerY, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.textAlign = "center";
  ctx.fillStyle = "#e0f2fe";
  ctx.font = `900 ${Math.max(19, Math.min(27, radius * 0.43))}px system-ui, sans-serif`;
  ctx.fillText(`${puzzle.rotationDeg}°`, gaugeX, gaugeY + 8);

  ctx.font = "800 10px system-ui, sans-serif";
  ctx.fillStyle = "rgba(196, 181, 253, 0.88)";
  ctx.fillText("GIRO OBJETIVO", gaugeX, height - 18);
  ctx.restore();
}

export function drawSpatialChoicePreview(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  puzzle: SpatialPuzzle,
  choice: SpatialChoice,
): void {
  if (width <= 0 || height <= 0) return;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#071329";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(103, 232, 249, 0.07)";
  ctx.lineWidth = 1;
  ctx.beginPath();

  for (let x = 0; x < width; x += 18) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  for (let y = 0; y < height; y += 18) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();

  const fill = choice.mirrored
    ? "rgba(167, 139, 250, 0.24)"
    : "rgba(6, 182, 212, 0.22)";
  const stroke = choice.mirrored ? "#c4b5fd" : "#67e8f9";

  drawPolygon(
    ctx,
    puzzle.vertices,
    width / 2,
    height / 2,
    Math.min(width, height) * 0.66,
    choice.rotationDeg,
    choice.mirrored,
    fill,
    stroke,
    1.8,
  );
}
