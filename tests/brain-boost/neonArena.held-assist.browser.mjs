import assert from 'node:assert/strict';
import { createServer } from 'vite';
const { chromium } = await import(process.env.NEON_PLAYWRIGHT_MODULE || 'playwright');
const server = await createServer({ server: { host: '127.0.0.1', port: 5187, strictPort: true } });
let browser;
try {
  await server.listen();
  browser = await chromium.launch({ executablePath: process.env.NEON_BROWSER_EXECUTABLE || undefined, args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const touch of [false, true]) {
    const context = await browser.newContext({ viewport: touch ? { width: 390, height: 844 } : { width: 1280, height: 1000 }, hasTouch: touch, isMobile: touch, reducedMotion: 'reduce' }), page = await context.newPage(), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(() => { localStorage.setItem('digitalboost_app_screen', 'main'); localStorage.setItem('digitalboost:brain-boost:audio-enabled:v1', 'false'); });
    await page.goto('http://127.0.0.1:5187/', { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      const { GameSimulation } = await import('/src/brain-boost/neon-arena/GameSimulation.ts'); const start = GameSimulation.prototype.start;
      GameSimulation.prototype.start = function () { const ok = start.call(this); if (ok) window.qaHeld = this; return ok; };
    });
    await page.getByRole('button', { name: 'Nightmare Protocolo', exact: true }).click();
    await page.getByRole('button', { name: /Neon Arena: Virus Survivor/ }).click(); await page.waitForSelector('[data-neon-phase="READY"]');
    await page.getByRole('button', { name: 'Iniciar supervivencia →', exact: true }).click();
    const fixture = async () => page.evaluate(async () => {
      const { createEnemy } = await import('/src/brain-boost/neon-arena/GameSimulation.ts'); const s = window.qaHeld;
      s.enemies = [-5, 5].map((x, i) => { const e = createEnemy('skitter', 990000 + i, x, 3); e.hp = e.maxHp = 36; e.speed = 0; return e; }); s.projectiles = []; s.clearInput();
    });
    const assertRetarget = async () => {
      await page.waitForFunction(() => window.qaHeld.enemies.filter(e => e.id >= 990000).every(e => e.hp === 0), { }, { timeout: 15000 });
      assert.equal(await page.evaluate(() => window.qaHeld.player.aim), null, 'held fire cannot inject a manual heading in assisted mode');
      assert.equal(await page.evaluate(() => window.qaHeld.player.input.firing), true, 'retarget happens without releasing fire');
      assert.equal(await page.evaluate(() => window.qaHeld.player.x === 0 && window.qaHeld.player.z === 3), true);
    };
    if (!touch) {
      await fixture(); const canvas = await page.locator('.na-canvas canvas').boundingBox();
      await page.mouse.move(canvas.x + canvas.width * .8, canvas.y + canvas.height * .7); await page.mouse.down();
      await assertRetarget(); await page.mouse.up(); console.log('held mouse on canvas kills left/right targets without losing assist PASS');
    }
    await fixture(); const fire = await page.locator('[data-na-fire]').boundingBox(); const x = fire.x + fire.width * .7, y = fire.y + fire.height * .5;
    if (touch) {
      const cdp = await context.newCDPSession(page);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + 10, y: y + 10, id: 1 }] });
      await assertRetarget(); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    } else {
      await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + 10, y + 10); await assertRetarget(); await page.mouse.up();
    }
    await page.waitForFunction(() => window.qaHeld.player.input.firing === false);
    assert.equal(await page.locator('[data-na-fire]').getAttribute('data-active'), 'false');
    if (touch) {
      await page.getByRole('button', { name: 'Pausa', exact: true }).click();
      await page.getByRole('combobox', { name: 'Modo de apuntado', exact: true }).selectOption('modern');
      await page.getByRole('button', { name: 'Reanudar partida', exact: true }).click();
      const cdp = await context.newCDPSession(page), cx = fire.x + fire.width / 2, cy = fire.y + fire.height / 2;
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx, y: cy, id: 2 }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: cx + 15, y: cy - 20, id: 2 }] });
      await page.waitForFunction(() => Math.abs(window.qaHeld.player.fireAngle - Math.atan2(-20, 15)) < .02 && window.qaHeld.player.targetId === null);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      console.log('modern touch retains explicit manual aiming PASS');
    }
    await page.getByRole('button', { name: 'Salir', exact: true }).click(); assert.deepEqual(errors, []);
    console.log(`${touch ? 'touch' : 'mouse'}: off-center held FUEGO + drag preserves 360 assist, retargets both sides, release stops fire PASS`);
    await context.close();
  }
} finally { await browser?.close(); await server.close(); }
