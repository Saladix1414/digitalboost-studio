import test from "node:test";
import assert from "node:assert/strict";
import {
  createBrainBoostParticle,
  drawBrainBoostAmbient,
  resolveBrainBoostPalette,
  type BrainBoostTheme,
} from "../../src/brain-boost/brainBoostGraphicsEngine.ts";

const themes: BrainBoostTheme[] = [
  "neural",
  "spatial",
  "logic",
  "memory",
  "focus",
  "ocean",
  "dragon",
  "numbers",
];

test("todas las disciplinas tienen paletas completas", () => {
  for (const theme of themes) {
    const palette = resolveBrainBoostPalette(theme);

    for (const color of [
      palette.primary,
      palette.secondary,
      palette.glow,
    ]) {
      assert.match(color, /^#[0-9a-fA-F]{6}$/);
    }
  }
});

test("resolver una paleta devuelve una copia independiente", () => {
  const first = resolveBrainBoostPalette("spatial");
  first.primary = "#000000";

  assert.notEqual(
    resolveBrainBoostPalette("spatial").primary,
    "#000000",
  );
});

test("las partículas son deterministas para índice y semilla", () => {
  assert.deepEqual(
    createBrainBoostParticle(7, 19),
    createBrainBoostParticle(7, 19),
  );

  assert.notDeepEqual(
    createBrainBoostParticle(7, 19),
    createBrainBoostParticle(7, 20),
  );
});

test("las partículas respetan rangos válidos", () => {
  for (let index = 0; index < 200; index += 1) {
    const particle = createBrainBoostParticle(index, 123);

    assert.ok(particle.x >= 0 && particle.x < 1);
    assert.ok(particle.y >= 0 && particle.y < 1);
    assert.ok(particle.speed >= 0.008 && particle.speed <= 0.03);
    assert.ok(particle.radius >= 0.7 && particle.radius <= 2.3);
    assert.ok(particle.phase >= 0 && particle.phase < Math.PI * 2);
  }
});

function createFakeContext() {
  const calls: string[] = [];
  const gradient = { addColorStop() {} };

  const ctx = {
    globalAlpha: 1,
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
    save() { calls.push("save"); },
    restore() { calls.push("restore"); },
    createRadialGradient() {
      calls.push("gradient");
      return gradient;
    },
    fillRect() { calls.push("fillRect"); },
    beginPath() { calls.push("beginPath"); },
    moveTo() { calls.push("moveTo"); },
    lineTo() { calls.push("lineTo"); },
    stroke() { calls.push("stroke"); },
    arc() { calls.push("arc"); },
    fill() { calls.push("fill"); },
  } as unknown as CanvasRenderingContext2D;

  return { ctx, calls };
}

test("el renderizador dibuja una escena sin borrar el fondo anfitrión", () => {
  const { ctx, calls } = createFakeContext();

  drawBrainBoostAmbient(ctx, 360, 640, 1000, "spatial");

  assert.ok(calls.includes("gradient"));
  assert.ok(calls.includes("fillRect"));
  assert.ok(calls.includes("stroke"));
  assert.ok(calls.includes("arc"));
  assert.equal(calls[0], "save");
  assert.equal(calls.at(-1), "restore");
  assert.ok(!calls.includes("clearRect"));
});

test("cada disciplina dibuja su firma ambiental", () => {
  const themes = [
    "neural", "spatial", "logic", "memory",
    "focus", "ocean", "dragon", "numbers",
  ] as const;

  for (const theme of themes) {
    const { ctx, calls } = createFakeContext();
    drawBrainBoostAmbient(ctx, 360, 640, 1200, theme, {
      intensity: 0.3,
      seed: 17,
    });

    assert.ok(calls.includes("arc"), `Faltan elementos para ${theme}`);
    assert.ok(calls.includes("stroke"), `Faltan trazos para ${theme}`);
    assert.equal(calls[0], "save");
    assert.equal(calls.at(-1), "restore");
    assert.ok(!calls.includes("clearRect"));
  }
});

test("el renderizador no dibuja cuando el tamaño es inválido", () => {
  const { ctx, calls } = createFakeContext();

  drawBrainBoostAmbient(ctx, 0, 640, 1000, "neural");
  drawBrainBoostAmbient(ctx, 360, Number.NaN, 1000, "neural");

  assert.equal(calls.length, 0);
});

test("la intensidad cero no genera operaciones gráficas", () => {
  const { ctx, calls } = createFakeContext();

  drawBrainBoostAmbient(ctx, 360, 640, 1000, "memory", {
    intensity: 0,
  });

  assert.equal(calls.length, 0);
});
