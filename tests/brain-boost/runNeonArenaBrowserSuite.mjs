import { access } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const suites = {
  smoke: 'neonArena.browser.mjs',
  immersive: 'neonArena.immersive.browser.mjs',
  'held-assist': 'neonArena.held-assist.browser.mjs',
  aim: 'neonArena.aim.browser.mjs',
  coop: 'neonArena.coop.browser.mjs',
  progression: 'neonArena.progression.browser.mjs',
  score: 'neonArena.score.browser.mjs',
  industrial: 'neonArena.industrial.browser.mjs',
};
const requested = process.argv.slice(2);
const selected = requested.length ? requested : Object.keys(suites);
const unknown = selected.filter(name => !suites[name]);
if (unknown.length) {
  console.error(`Suite de navegador desconocida: ${unknown.join(', ')}`);
  console.error(`Disponibles: ${Object.keys(suites).join(', ')}`);
  process.exit(2);
}

async function firstExecutable() {
  if (process.env.NEON_BROWSER_EXECUTABLE) return process.env.NEON_BROWSER_EXECUTABLE;
  const candidates = [
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ];
  for (const candidate of candidates) {
    try { await access(candidate); return candidate; } catch { /* Try the next host browser. */ }
  }
  return '';
}

const executable = await firstExecutable();
if (process.platform === 'android' && !executable) {
  console.error('Playwright no ofrece Chromium para Termux/Android. Ejecutá esta suite en Debian o CI.');
  console.error('La comprobación Android real se registra por separado en docs/brain-boost/neon-arena-browser-validation.md.');
  process.exit(2);
}

const env = { ...process.env };
if (executable) env.NEON_BROWSER_EXECUTABLE = executable;
console.log(`Neon Arena browser: ${selected.join(', ')} · ${executable || 'Chromium administrado por Playwright'}`);

try {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({
    executablePath: executable || undefined,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  await browser.close();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error('No se pudo iniciar Chromium para la validación de Neon Arena.');
  if (/Operation not permitted|socket\(\) failed/i.test(message)) {
    console.error('El host bloquea los sockets/procesos requeridos por Chromium; ejecutá la suite en Debian o CI sin esa restricción.');
  } else {
    console.error(message);
    console.error('Instalá Chromium o ejecutá `npx playwright install chromium`.');
  }
  process.exit(2);
}

for (const name of selected) {
  const file = new URL(suites[name], import.meta.url);
  const started = performance.now();
  const code = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [file.pathname], { env, stdio: 'inherit' });
    child.once('error', reject);
    child.once('exit', value => resolve(value ?? 1));
  });
  if (code !== 0) {
    console.error(`FAIL ${name} (${code})`);
    process.exit(code);
  }
  console.log(`PASS ${name} (${((performance.now() - started) / 1000).toFixed(1)}s)`);
}
