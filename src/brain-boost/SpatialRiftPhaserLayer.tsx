import { useEffect, useRef } from "react";
import type PhaserTypes from "phaser";

export default function SpatialRiftPhaserLayer() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let game: PhaserTypes.Game | undefined;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    async function launch() {
      try {
        const module = await import("phaser");
        if (disposed) return;

        const Phaser = module.default;

        class RiftEffectsScene extends Phaser.Scene {
          private gfx!: PhaserTypes.GameObjects.Graphics;
          private responseKind: "correct" | "incorrect" | null = null;
          private responseStartedAt = 0;

          private readonly onAnswer = (event: Event) => {
            const detail = (
              event as CustomEvent<{ correct?: boolean }>
            ).detail;
            if (typeof detail?.correct !== "boolean") return;

            this.responseKind = detail.correct ? "correct" : "incorrect";
            this.responseStartedAt = this.time.now;
            this.drawAmbient(this.time.now);
          };

          private readonly onResize = () => {
            this.drawAmbient(this.time.now);
          };

          constructor() {
            super({ key: "SpatialRiftEffects" });
          }

          create() {
            this.gfx = this.add.graphics();
            this.scale.on("resize", this.onResize);
            window.addEventListener(
              "brainboost:spatial-rift-answer",
              this.onAnswer,
            );
            this.events.once("shutdown", () => {
              this.scale.off("resize", this.onResize);
              window.removeEventListener(
                "brainboost:spatial-rift-answer",
                this.onAnswer,
              );
            });
            this.drawAmbient(0);
          }

          update(time: number) {
            if (!reducedMotion) this.drawAmbient(time);
          }

          private traceEllipse(
            cx: number,
            cy: number,
            rx: number,
            ry: number,
            rotation: number,
            start: number,
            end: number,
            steps = 24,
          ) {
            const g = this.gfx;
            const cosR = Math.cos(rotation);
            const sinR = Math.sin(rotation);

            g.beginPath();

            for (let i = 0; i <= steps; i++) {
              const angle = start + ((end - start) * i) / steps;
              const px = Math.cos(angle) * rx;
              const py = Math.sin(angle) * ry;
              const x = cx + px * cosR - py * sinR;
              const y = cy + px * sinR + py * cosR;

              if (i === 0) g.moveTo(x, y);
              else g.lineTo(x, y);
            }

            g.strokePath();
          }

          private drawAmbient(time: number) {
            if (!this.gfx) return;

            const g = this.gfx;
            const w = Math.max(1, this.scale.width);
            const h = Math.max(1, this.scale.height);
            const t = time * 0.001;
            const cx = w * 0.73;
            const cy = h * 0.48;
            const r = Math.min(h * 0.235, w * 0.12, 72);
            const pulse = 1 + Math.sin(t * 2.1) * 0.045;
            let responseStrength = 0;

            if (this.responseKind) {
              const age = Math.max(0, time - this.responseStartedAt);
              if (age >= 1250) {
                this.responseKind = null;
              } else {
                responseStrength = 1 - age / 1250;
              }
            }

            g.clear();

            // Campo estelar: partículas de varias escalas.
            for (let i = 0; i < 58; i++) {
              const speed = 3 + (i % 5) * 2.2;
              const x = (
                i * 137.51 + t * speed + w * 2
              ) % w;
              const y = (
                i * 71.73 + Math.sin(t * 0.42 + i) * 9 + h * 3
              ) % h;
              const alpha =
                0.12 + (Math.sin(t * 1.8 + i * 2.4) + 1) * 0.16;
              const size = i % 11 === 0 ? 2.1 : i % 3 === 0 ? 1.4 : 0.8;

              g.fillStyle(
                i % 5 === 0 ? 0xa78bfa : 0x67e8f9,
                alpha,
              );
              g.fillCircle(x, y, size);

              if (i % 11 === 0) {
                g.lineStyle(1, 0x67e8f9, alpha * 0.65);
                g.beginPath();
                g.moveTo(x - 4, y);
                g.lineTo(x + 4, y);
                g.moveTo(x, y - 4);
                g.lineTo(x, y + 4);
                g.strokePath();
              }
            }

            // Conductores de energía entre la pieza y el portal.
            for (let strand = 0; strand < 4; strand++) {
              g.lineStyle(
                strand === 1 ? 1.5 : 0.8,
                strand % 2 === 0 ? 0x22d3ee : 0xa78bfa,
                strand === 1 ? 0.30 : 0.14,
              );
              g.beginPath();

              for (let i = 0; i <= 38; i++) {
                const p = i / 38;
                const x = w * (0.37 + p * 0.31);
                const wave =
                  Math.sin(t * 2.5 + p * 12 + strand * 1.7) *
                  h * (0.018 + strand * 0.003);
                const y = cy + wave + (strand - 1.5) * 4;

                if (i === 0) g.moveTo(x, y);
                else g.lineTo(x, y);
              }

              g.strokePath();
            }

            // Pulsos que viajan hacia el núcleo.
            for (let i = 0; i < 7; i++) {
              const p = (t * 0.22 + i / 7) % 1;
              const x = w * (0.38 + p * 0.30);
              const y =
                cy + Math.sin(t * 2.5 + i * 2) * h * 0.035;

              g.fillStyle(i % 2 ? 0xa78bfa : 0x67e8f9, 0.7);
              g.fillCircle(x, y, i % 3 === 0 ? 2.4 : 1.5);

              g.lineStyle(1, 0x67e8f9, 0.27);
              g.beginPath();
              g.moveTo(x - 7, y);
              g.lineTo(x - 2, y);
              g.strokePath();
            }

            // Halo volumétrico del portal.
            for (let i = 0; i < 5; i++) {
              const radius = r * (1.05 + i * 0.18) * pulse;
              g.lineStyle(
                i === 0 ? 2 : 1,
                i % 2 ? 0xa78bfa : 0x22d3ee,
                i === 0 ? 0.24 : 0.075,
              );
              this.traceEllipse(
                cx,
                cy,
                radius,
                radius * (0.76 + i * 0.025),
                t * (i % 2 ? -0.08 : 0.05),
                0,
                Math.PI * 2,
                64,
              );
            }

            // Tres pistas orbitales formadas por segmentos animados.
            for (let ring = 0; ring < 3; ring++) {
              const rotation =
                t * (ring === 1 ? -0.34 : 0.21) + ring * 0.48;
              const rx = r * (0.88 + ring * 0.29);
              const ry = r * (0.55 + ring * 0.18);
              const count = 10 + ring * 2;

              for (let segment = 0; segment < count; segment++) {
                const start =
                  (segment / count) * Math.PI * 2 + rotation;
                const span =
                  (Math.PI * 2 / count) *
                  (0.48 + (segment % 3) * 0.08);

                g.lineStyle(
                  ring === 0 ? 2.1 : 1.25,
                  (segment + ring) % 3 === 0
                    ? 0xa78bfa
                    : 0x67e8f9,
                  ring === 0 ? 0.75 : 0.38,
                );
                this.traceEllipse(
                  cx,
                  cy,
                  rx,
                  ry,
                  rotation * 0.45,
                  start,
                  start + span,
                  14,
                );
              }
            }

            // Radios luminosos alrededor del núcleo.
            for (let i = 0; i < 30; i++) {
              const angle = (i / 30) * Math.PI * 2 + t * 0.12;
              const inner = r * (0.67 + (i % 3) * 0.05);
              const outer =
                r * (0.88 + ((Math.sin(t * 2 + i) + 1) * 0.10));

              g.lineStyle(
                i % 4 === 0 ? 1.5 : 0.7,
                i % 4 === 0 ? 0xa78bfa : 0x67e8f9,
                i % 4 === 0 ? 0.55 : 0.22,
              );
              g.beginPath();
              g.moveTo(
                cx + Math.cos(angle) * inner,
                cy + Math.sin(angle) * inner * 0.76,
              );
              g.lineTo(
                cx + Math.cos(angle) * outer,
                cy + Math.sin(angle) * outer * 0.76,
              );
              g.strokePath();
            }

            // Nodos orbitales y sus conexiones.
            for (let i = 0; i < 6; i++) {
              const angle = t * (i % 2 ? -0.45 : 0.31) +
                (i / 6) * Math.PI * 2;
              const orbit = r * (0.96 + (i % 3) * 0.13);
              const x = cx + Math.cos(angle) * orbit;
              const y = cy + Math.sin(angle) * orbit * 0.72;
              const nodeR = i % 2 === 0 ? 3.2 : 2.1;

              g.lineStyle(1, 0x67e8f9, 0.25);
              g.beginPath();
              g.moveTo(x, y);
              g.lineTo(cx, cy);
              g.strokePath();

              g.fillStyle(0x67e8f9, 0.12);
              g.fillCircle(x, y, nodeR * 2.6);
              g.fillStyle(i % 2 ? 0xa78bfa : 0x67e8f9, 0.95);
              g.fillCircle(x, y, nodeR);
            }

            // Geometría luminosa en el corazón de la brecha.
            const coreRotation = -t * 0.42;
            const coreRadius = r * 0.37 * pulse;

            for (let i = 0; i < 3; i++) {
              const radius = coreRadius * (1 + i * 0.35);
              g.lineStyle(
                i === 0 ? 2 : 1,
                i === 1 ? 0xa78bfa : 0x67e8f9,
                0.50 - i * 0.10,
              );
              this.traceEllipse(
                cx,
                cy,
                radius,
                radius * 0.72,
                coreRotation + i * 0.8,
                0,
                Math.PI * 2,
                40,
              );
            }

            // Poliedro central.
            g.lineStyle(2, 0x67e8f9, 0.9);
            g.beginPath();

            for (let i = 0; i <= 6; i++) {
              const angle =
                (i / 6) * Math.PI * 2 - Math.PI / 2 + coreRotation;
              const x = cx + Math.cos(angle) * coreRadius;
              const y = cy + Math.sin(angle) * coreRadius * 0.82;

              if (i === 0) g.moveTo(x, y);
              else g.lineTo(x, y);
            }

            g.strokePath();

            // Marcas técnicas en los bordes de la escena.
            const marks = [
              [12, 15, 1, 1],
              [w - 12, 15, -1, 1],
              [12, h - 15, 1, -1],
              [w - 12, h - 15, -1, -1],
            ];

            for (let i = 0; i < marks.length; i++) {
              const [x, y, dx, dy] = marks[i];

              g.lineStyle(1.3, i % 2 ? 0xa78bfa : 0x67e8f9, 0.5);
              g.beginPath();
              g.moveTo(x, y + dy * 12);
              g.lineTo(x, y);
              g.lineTo(x + dx * 20, y);
              g.moveTo(x + dx * 5, y + dy * 5);
              g.lineTo(x + dx * 11, y + dy * 5);
              g.strokePath();
            }

            // Reacción temporal del portal a la respuesta del jugador.
            if (responseStrength > 0 && this.responseKind) {
              const correct = this.responseKind === "correct";
              const color = correct ? 0x67e8f9 : 0xfb7185;
              const expansion = (1 - responseStrength) * r * 0.72;
              const ringCount = correct ? 4 : 3;

              for (let i = 0; i < ringCount; i++) {
                const radius = r * (0.45 + i * 0.28) + expansion;
                g.lineStyle(
                  correct ? 2.2 : 1.8,
                  color,
                  responseStrength * (0.62 - i * 0.10),
                );
                this.traceEllipse(
                  cx,
                  cy,
                  radius,
                  radius * (correct ? 0.72 : 0.65),
                  t * (correct ? 0.18 : 0.75),
                  0,
                  Math.PI * 2,
                  44,
                );
              }

              // Chispas expulsadas desde el núcleo.
              for (let i = 0; i < 20; i++) {
                const angle = (i / 20) * Math.PI * 2 + t * 0.65;
                const distance =
                  r * (0.48 + (1 - responseStrength) * 1.15 +
                    (i % 4) * 0.08);
                const x = cx + Math.cos(angle) * distance;
                const y = cy + Math.sin(angle) * distance * 0.72;

                g.fillStyle(
                  color,
                  responseStrength * (0.35 + (i % 3) * 0.20),
                );
                g.fillCircle(
                  x,
                  y,
                  (correct ? 1.3 : 2) * responseStrength,
                );
              }

              // Distorsión breve cuando la respuesta es incorrecta.
              if (!correct) {
                for (let i = 0; i < 5; i++) {
                  const y =
                    cy + (i - 2) * r * 0.24 +
                    Math.sin(t * 18 + i) * r * 0.07 * responseStrength;

                  g.lineStyle(1.3, color, responseStrength * 0.52);
                  g.beginPath();
                  g.moveTo(cx - r * 1.18, y);
                  g.lineTo(cx - r * 0.42, y + r * 0.05);
                  g.lineTo(cx + r * 0.38, y - r * 0.04);
                  g.lineTo(cx + r * 1.18, y + r * 0.02);
                  g.strokePath();
                }
              }
            }
          }
        }

        game = new Phaser.Game({
          type: Phaser.AUTO,
          parent: host,
          width: 720,
          height: 320,
          transparent: true,
          canvasStyle:
            "display:block;width:100%;height:100%;pointer-events:none;",
          scale: {
            mode: Phaser.Scale.RESIZE,
            width: 720,
            height: 320,
          },
          fps: { target: 30 },
          render: { antialias: true },
          scene: RiftEffectsScene,
        });
      } catch (error) {
        if (!disposed) {
          console.warn(
            "[Brain Boost] Phaser FX no disponible; se conserva Canvas.",
            error,
          );
        }
      }
    }

    void launch();

    return () => {
      disposed = true;
      game?.destroy(true);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10"
    />
  );
}
