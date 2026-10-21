import { useEffect, useRef } from "react";
import {
  drawBrainBoostAmbient,
  type BrainBoostTheme,
} from "./brainBoostGraphicsEngine";

interface BrainBoostCanvasProps {
  theme: BrainBoostTheme;
  intensity?: number;
  seed?: number;
  className?: string;
}

export default function BrainBoostCanvas({
  theme,
  intensity = 0.45,
  seed = 41,
  className = "",
}: BrainBoostCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });

    if (!ctx) return;

    const motionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    let reducedMotion = motionQuery.matches;
    let disposed = false;
    let frameId = 0;
    let startedAt: number | null = null;

    const paint = (elapsedMs: number) => {
      if (disposed) return;

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      if (width <= 0 || height <= 0) return;

      const dpr = Math.min(
        Math.max(window.devicePixelRatio || 1, 1),
        2,
      );

      const pixelWidth = Math.max(1, Math.round(width * dpr));
      const pixelHeight = Math.max(1, Math.round(height * dpr));

      if (
        canvas.width !== pixelWidth ||
        canvas.height !== pixelHeight
      ) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      drawBrainBoostAmbient(
        ctx,
        width,
        height,
        elapsedMs,
        theme,
        { intensity, seed },
      );
    };

    const animate = (timestamp: number) => {
      if (disposed || reducedMotion) return;

      if (startedAt === null) startedAt = timestamp;
      paint(timestamp - startedAt);

      frameId = window.requestAnimationFrame(animate);
    };

    const stopAnimation = () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }
    };

    const startAnimation = () => {
      stopAnimation();
      startedAt = null;
      frameId = window.requestAnimationFrame(animate);
    };

    const handleMotionChange = () => {
      reducedMotion = motionQuery.matches;
      stopAnimation();

      if (reducedMotion) {
        paint(0);
      } else {
        startAnimation();
      }
    };

    const observer = new ResizeObserver(() => {
      if (reducedMotion) paint(0);
    });

    observer.observe(canvas);
    motionQuery.addEventListener("change", handleMotionChange);

    if (reducedMotion) {
      paint(0);
    } else {
      startAnimation();
    }

    return () => {
      disposed = true;
      stopAnimation();
      observer.disconnect();
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }, [theme, intensity, seed]);

  return (
    <canvas
      ref={canvasRef}
      width={1}
      height={1}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
