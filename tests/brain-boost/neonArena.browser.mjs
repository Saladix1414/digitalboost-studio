// Optional browser check. Install Playwright in a test environment; no production dependency.
import assert from 'node:assert/strict';
import { createServer } from 'vite';
const { chromium } = await import(process.env.NEON_PLAYWRIGHT_MODULE || 'playwright');
const server = await createServer({ server: { host: '127.0.0.1', port: 5179, strictPort: true } });
let browser;
try {
  await server.listen();
  browser = await chromium.launch({
    executablePath: process.env.NEON_BROWSER_EXECUTABLE || undefined,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  for (const mobile of [false, true]) {
    const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 1000 }, hasTouch: mobile, isMobile: mobile, reducedMotion: mobile ? 'reduce' : 'no-preference' });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(() => {
      localStorage.setItem('digitalboost_app_screen', 'main');
      localStorage.setItem('digitalboost:brain-boost:audio-enabled:v1', 'false');
      const pending = new Set(), original = requestAnimationFrame, cancel = cancelAnimationFrame;
      window.requestAnimationFrame = callback => {
        const owned = new Error().stack.includes('NeonArenaEngine');
        const id = original(time => { pending.delete(id); callback(time); });
        if (owned) pending.add(id); return id;
      };
      window.cancelAnimationFrame = id => { pending.delete(id); cancel(id); };
      window.neonPendingFrames = () => pending.size;
    });
    await page.goto('http://127.0.0.1:5179/', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Abrir disciplina Focus Lab', exact: true }).click();
    const select = () => page.getByRole('button', { name: /Neon Arena: Virus Survivor/ }).click();
    await select(); await page.waitForSelector('[data-neon-phase="READY"]');
    assert.equal(await page.locator('.na-canvas canvas').count(), 1, 'StrictMode must leave one canvas');
    assert.equal(await page.evaluate(() => window.neonPendingFrames()), 1, 'one owned frame loop');
    await page.getByRole('button', { name: 'Iniciar defensa →', exact: true }).click();
    await page.waitForSelector('[data-neon-phase="PLAYING"]');
    await page.waitForTimeout(1600);
    const canvas = await page.locator('.na-canvas canvas').elementHandle();
    if (mobile) {
      const bounds = await canvas.boundingBox();
      const cdp = await context.newCDPSession(page);
      const x = bounds.x + bounds.width * .7, y = bounds.y + bounds.height * .65;
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - 35, y: y - 20 }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      assert.equal(await canvas.evaluate(c => getComputedStyle(c).touchAction), 'none');
    } else {
      await canvas.focus(); await page.keyboard.down('ArrowRight'); await page.waitForTimeout(250); await page.keyboard.up('ArrowRight');
    }
    await page.getByRole('button', { name: 'Pausa', exact: true }).click();
    await page.waitForSelector('[data-neon-phase="PAUSED"]');
    const frozen = await page.locator('.na-footer').innerText();
    await page.waitForTimeout(1100); assert.equal(await page.locator('.na-footer').innerText(), frozen);
    await page.getByRole('button', { name: 'Reanudar partida', exact: true }).click();
    await page.getByRole('button', { name: /SHOCKWAVE/ }).click();
    await page.waitForFunction(() => document.querySelector('.na-combat-bar button')?.disabled === true);
    assert.equal(await page.locator('.na-stage').evaluate(e => e.scrollWidth <= e.clientWidth), true);
    await page.screenshot({ path: `/tmp/neon-${mobile ? 'touch' : 'desktop'}-verified.png` });
    await page.getByRole('button', { name: 'Salir', exact: true }).click();
    assert.equal(await page.locator('.na-canvas canvas').count(), 0);
    await page.waitForTimeout(100);
    assert.equal(await page.evaluate(() => window.neonPendingFrames()), 0, 'exit cancels the owned loop');
    assert.equal(await canvas.evaluate(c => c.getContext('webgl2').isContextLost()), true, 'exit releases GPU context');
    await select(); await page.waitForSelector('[data-neon-phase="READY"]');
    await page.locator('.na-canvas canvas').evaluate(c => c.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
    await page.waitForSelector('[data-neon-phase="ERROR"]');
    await page.getByRole('button', { name: 'Reintentar escena', exact: true }).click();
    await page.waitForSelector('[data-neon-phase="READY"]');
    await page.getByRole('button', { name: 'Salir', exact: true }).click();
    await page.getByRole('button', { name: /Focus Protocol/ }).click();
    await page.waitForSelector('[data-brain-boost-stage="targets"]');
    assert.equal(await page.locator('.na-canvas canvas').count(), 0);
    assert.deepEqual(errors, []);
    console.log(`${mobile ? 'touch/reduced-motion' : 'desktop'}: selection, StrictMode, play, controls, pause, Shockwave, exit/GPU release, context recovery, sibling game PASS`);
    await context.close();
  }
} finally { await browser?.close(); await server.close(); }
