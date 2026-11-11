import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createServer } from 'vite';
import { installIndustrialFixture } from './neonArenaIndustrialFixture.mjs';

const { chromium } = await import(process.env.NEON_PLAYWRIGHT_MODULE || 'playwright');
const output = resolve(process.env.NEON_CAPTURE_DIR || '/tmp/neon-industrial');
const baseline = process.env.NEON_BASELINE === '1';
const server = await createServer({ server: { host: '127.0.0.1', port: 5193, strictPort: true } });
let browser;

async function open(viewport, { coop = false, reduced = false } = {}) {
  const context = await browser.newContext({ viewport, hasTouch: true, isMobile: true,
    reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    localStorage.setItem('digitalboost_app_screen', 'main');
    localStorage.setItem('digitalboost:brain-boost:audio-enabled:v1', 'false');
    localStorage.setItem('digitalboost:brain-boost:neon-arena:arsenal:v1',
      JSON.stringify({ version: 1, unlocked: ['machinegun', 'shotgun', 'flame'], bosses: [] }));
    HTMLElement.prototype.requestFullscreen = () => Promise.reject(new Error('fixture uses viewport fullscreen'));
  });
  await page.goto('http://127.0.0.1:5193/', { waitUntil: 'networkidle' });
  await page.evaluate(installIndustrialFixture);
  await page.getByRole('button', { name: /Entrar en Nightmare Protocolo/ }).click();
  await page.getByRole('button', { name: /Neon Arena: Virus Survivor/ }).click();
  await page.waitForSelector('[data-neon-phase="READY"]');
  if (coop) await page.getByRole('button', { name: 'Cooperativo', exact: true }).click();
  await page.getByRole('button', { name: 'Ajustes', exact: true }).click();
  await page.getByRole('combobox', { name: 'Calidad gráfica' }).selectOption('low');
  await page.getByLabel('Diagnóstico de rendimiento').check();
  await page.getByRole('button', { name: 'Iniciar supervivencia →', exact: true }).click();
  await page.waitForFunction(() => window.qaWorld?.marineViews[0].armor && window.qaArena?.projectiles.some(p => p.hostile));
  await page.waitForFunction(() => document.querySelector('.na-hud').textContent.includes('04'));
  await page.waitForTimeout(2000);
  return { page, context, errors };
}

async function capture(session, name) {
  const { page, errors } = session;
  assert.deepEqual(errors, []);
  const metrics = await page.evaluate(() => {
    const engine = window.qaEngine;
    return { ...engine.metrics.read(), ...engine.renderer.info.render,
      resolution: engine.resolution, canvas: [engine.width, engine.height], enemies: engine.simulation.enemies.length };
  });
  await page.addStyleTag({ content: '.na-diagnostics { visibility: hidden }' });
  await page.screenshot({ path: resolve(output, name + '.png') });
  console.log(JSON.stringify({ name, ...metrics }));
}

async function captureSequence({ page, errors }) {
  const frame = async (name, action) => {
    await page.evaluate(action);
    await page.waitForTimeout(100);
    assert.deepEqual(errors, []);
    await page.screenshot({ path: resolve(output, name + '.png') });
  };
  await frame('05-secuencia-movimiento', () => window.qaAdvance(12, true));
  await frame('06-secuencia-disparo', () => window.qaAdvance(4, false));
  await frame('07-secuencia-acido', () => window.qaAdvance(36, false));
  await frame('08-secuencia-salud-critica', () => window.qaCritical());
}

try {
  await mkdir(output, { recursive: true });
  await server.listen();
  browser = await chromium.launch({ executablePath: process.env.NEON_BROWSER_EXECUTABLE,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const landscape = { width: 1536, height: 864 };
  const solo = await open(landscape);
  await capture(solo, baseline ? '01-antes' : '02-despues');
  if (!baseline) await captureSequence(solo);
  await solo.context.close();
  if (!baseline && process.env.NEON_LANDSCAPE_ONLY !== '1') {
    const mobile = await open({ width: 390, height: 844 }, { reduced: true });
    await capture(mobile, '03-movil-vertical');
    await mobile.context.close();
    const coop = await open(landscape, { coop: true });
    await capture(coop, '04-cooperativo');
    await coop.context.close();
  }
} finally {
  await browser?.close();
  await server.close();
}
