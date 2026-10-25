import assert from 'node:assert/strict';
import { createServer } from 'vite';
const { chromium } = await import(process.env.NEON_PLAYWRIGHT_MODULE || 'playwright');
const server = await createServer({ server: { host: '127.0.0.1', port: 5183, strictPort: true } });
let browser;
try {
  await server.listen(); browser = await chromium.launch({ executablePath: process.env.NEON_BROWSER_EXECUTABLE || undefined, args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const mobile of [false, true]) {
    const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 1000 }, hasTouch: mobile, isMobile: mobile, reducedMotion: mobile ? 'reduce' : 'no-preference' });
    const page = await context.newPage(), errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(() => {
      localStorage.setItem('digitalboost_app_screen', 'main'); localStorage.setItem('digitalboost:brain-boost:audio-enabled:v1', 'false'); localStorage.setItem('digitalboost:brain-boost:neon-arena:best:v1', '777');
      localStorage.setItem('digitalboost:brain-boost:neon-arena:arsenal:v1', JSON.stringify({ version: 1, unlocked: ['machinegun', 'shotgun', 'flame', 'cascade', 'rail'], bosses: [] }));
      const pending = new Set(), original = requestAnimationFrame, cancel = cancelAnimationFrame;
      window.requestAnimationFrame = callback => { const owned = new Error().stack.includes('NeonArenaEngine'); const id = original(t => { pending.delete(id); callback(t); }); if (owned) pending.add(id); return id; };
      window.cancelAnimationFrame = id => { pending.delete(id); cancel(id); }; window.qaCoopFrames = () => pending.size;
      const scissor = WebGL2RenderingContext.prototype.scissor; window.qaScissors = [];
      WebGL2RenderingContext.prototype.scissor = function (...args) { window.qaScissors.push(args); window.qaScissors = window.qaScissors.slice(-40); return scissor.apply(this, args); };
      window.qaDraws = 0;
      for (const name of ['drawElements', 'drawArrays', 'drawElementsInstanced', 'drawArraysInstanced']) {
        const original = WebGL2RenderingContext.prototype[name]; WebGL2RenderingContext.prototype[name] = function (...args) { window.qaDraws++; return original.apply(this, args); };
      }
      const set = window.setInterval, clear = window.clearInterval, music = new Set();
      window.setInterval = (fn, ...args) => { const id = set(fn, ...args); if (new Error().stack.includes('brainBoostAudio')) music.add(id); return id; };
      window.clearInterval = id => { music.delete(id); clear(id); }; window.qaMusic = () => music.size;
      window.qaPads = []; Object.defineProperty(navigator, 'getGamepads', { value: () => window.qaPads });
    });
    await page.goto('http://127.0.0.1:5183/', { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      const { GameSimulation } = await import('/src/brain-boost/neon-arena/GameSimulation.ts'); const original = GameSimulation.prototype.start;
      GameSimulation.prototype.start = function () { const ok = original.call(this); if (ok) window.qaTeam = this; return ok; };
    });
    await page.getByRole('button', { name: 'Nightmare Protocolo', exact: true }).click();
    await page.getByRole('button', { name: /Neon Arena: Virus Survivor/ }).click(); await page.waitForSelector('[data-neon-phase="READY"]');
    await page.getByRole('combobox', { name: 'Cantidad de jugadores', exact: true }).selectOption('2');
    await page.waitForSelector('[data-neon-players="2"]'); assert.equal(await page.locator('.na-canvas canvas').count(), 1); assert.equal(await page.evaluate(() => window.qaCoopFrames()), 1);
    await page.getByRole('combobox', { name: 'Arma inicial P1', exact: true }).selectOption('shotgun');
    await page.getByRole('combobox', { name: 'Arma inicial P2', exact: true }).selectOption('flame');
    await page.getByRole('button', { name: 'Iniciar supervivencia →', exact: true }).click(); await page.waitForSelector('[data-neon-phase="PLAYING"]');
    await page.locator('.na-stage').evaluate(e => e.scrollIntoView({ block: 'center' }));
    assert.equal(await page.getByRole('combobox', { name: 'Cantidad de jugadores', exact: true }).count(), 0, 'lobby mode cannot change during play');
    const canvas = await page.locator('.na-canvas canvas').elementHandle();
    const before = await page.evaluate(() => window.qaTeam.players.map(p => ({ x: p.x, z: p.z, ammo: p.ammo[p.equipped] })));
    if (mobile) {
      const boxes = await Promise.all([page.locator('[data-na-stick][data-na-player="0"]').boundingBox(), page.locator('[data-na-fire][data-na-player="0"]').boundingBox(), page.locator('[data-na-stick][data-na-player="1"]').boundingBox(), page.locator('[data-na-fire][data-na-player="1"]').boundingBox()]);
      const points = boxes.map((b, i) => ({ id: i + 1, x: b.x + b.width / 2, y: b.y + b.height / 2 }));
      const cdp = await context.newCDPSession(page); await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: points });
      const moved = points.map((p, i) => i % 2 ? p : { ...p, x: p.x + (i === 0 ? 22 : -22), y: p.y + (i === 0 ? -14 : 14) });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: moved });
      await page.waitForFunction(initial => window.qaTeam.players.every((p, i) => Math.hypot(p.x - initial[i].x, p.z - initial[i].z) > .1), before);
      for (const selector of ['[data-na-stick]', '[data-na-fire]']) assert.equal(await page.locator(`${selector}[data-active="true"]`).count(), 2);
      await page.waitForFunction(initial => window.qaTeam.players.every((p, i) => p.ammo[p.equipped] < initial[i].ammo), before);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      assert.equal(await page.locator('[data-active="true"]').count(), 0);
    } else {
      await canvas.focus(); for (const key of ['w', 'f', 'ArrowDown', 'j']) await page.keyboard.down(key);
      await page.waitForFunction(initial => window.qaTeam.players[0].z < initial[0].z - .1 && window.qaTeam.players[1].z > initial[1].z + .1, before);
      await page.waitForFunction(initial => window.qaTeam.players.every((p, i) => p.ammo[p.equipped] < initial[i].ammo), before);
      for (const key of ['w', 'f', 'ArrowDown', 'j']) await page.keyboard.up(key);
    }
    await page.getByRole('button', { name: 'SHOCKWAVE P2', exact: true }).click(); await page.waitForFunction(() => window.qaTeam.players[1].cooldown > 0);
    assert.equal(await page.evaluate(() => window.qaTeam.players[0].cooldown), 0);
    const rects = await page.locator('.na-player-pane').evaluateAll(es => es.map(e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }));
    assert.equal(mobile ? rects[1].y > rects[0].y : rects[1].x > rects[0].x, true);
    assert.equal(await page.locator('.na-stage').evaluate(e => e.scrollWidth <= e.clientWidth), true);
    assert.ok(await page.evaluate(() => new Set(window.qaScissors.map(r => JSON.stringify(r))).size >= 2), 'single context renders distinct scissor views');
    await page.screenshot({ path: `/tmp/neon-coop-${mobile ? 'touch' : 'desktop'}.png` });
    await page.getByRole('button', { name: 'Sonido OFF', exact: true }).click(); await page.waitForFunction(() => window.qaMusic() === 1);
    await page.getByRole('button', { name: 'Pausa', exact: true }).click(); await page.waitForSelector('[data-neon-phase="PAUSED"]');
    await page.waitForFunction(() => { const now = performance.now(); if (window.qaStableDraws !== window.qaDraws) { window.qaStableDraws = window.qaDraws; window.qaStableAt = now; } return now - (window.qaStableAt ?? now) > 250; });
    const draws = await page.evaluate(() => window.qaDraws); assert.equal(await page.evaluate(() => window.qaMusic()), 0);
    const frozen = await page.evaluate(() => window.qaTeam.elapsed); await page.waitForTimeout(600); assert.equal(await page.evaluate(() => window.qaTeam.elapsed), frozen);
    assert.equal(await page.evaluate(() => window.qaDraws), draws, 'paused co-op does not continuously redraw both views');
    await page.getByRole('button', { name: 'Reanudar partida', exact: true }).click();
    await page.waitForFunction(() => window.qaMusic() === 1); await page.getByRole('button', { name: 'Sonido ON', exact: true }).click(); await page.waitForFunction(() => window.qaMusic() === 0);
    if (mobile) {
      await page.setViewportSize({ width: 844, height: 390 }); await page.waitForTimeout(400);
      await page.waitForFunction(() => { const es = [...document.querySelectorAll('.na-player-pane')].map(e => e.getBoundingClientRect()); return es[1].x > es[0].x; });
      await page.setViewportSize({ width: 390, height: 844 });
    } else {
      const positions = await page.evaluate(() => window.qaTeam.players.map(p => ({ x: p.x, z: p.z })));
      await page.evaluate(() => { window.qaPads = [0, 1].map(index => ({ index, connected: true, axes: index ? [0, -1, 0, 0] : [1, 0, 0, 0], buttons: Array.from({ length: 10 }, (_, i) => ({ pressed: i === 0, value: i === 0 ? 1 : 0 })) })); });
      await page.waitForFunction(initial => window.qaTeam.players[0].x > initial[0].x + .1 && window.qaTeam.players[1].z < initial[1].z - .1, positions);
      await page.evaluate(() => { window.qaPads[0] = null; }); await page.waitForSelector('[data-neon-phase="PAUSED"]');
      await page.evaluate(() => { window.qaPads = []; }); await page.waitForTimeout(100); await page.getByRole('button', { name: 'Reanudar partida', exact: true }).click();
    }
    await page.evaluate(async () => {
      const { createEnemy } = await import('/src/brain-boost/neon-arena/GameSimulation.ts'); const s = window.qaTeam, p = s.players[1]; p.health = 1; p.invulnerable = 0; const e = createEnemy('skitter', 900000, p.x, p.z); e.speed = 0; s.enemies = [e];
    });
    await page.waitForFunction(() => window.qaTeam.players[1].health === 0); await page.waitForSelector('.na-fallen');
    assert.equal(await page.locator('.na-game').getAttribute('data-neon-phase'), 'PLAYING');
    assert.equal(await page.evaluate(() => localStorage.getItem('digitalboost:brain-boost:neon-arena:best:coop:v1')), null, 'one fallen marine does not finalize the team record');
    await page.evaluate(async () => { const { createEnemy } = await import('/src/brain-boost/neon-arena/GameSimulation.ts'); const s = window.qaTeam, p = s.players[0]; p.health = 1; p.invulnerable = 0; const e = createEnemy('skitter', 900001, p.x, p.z); e.speed = 0; s.enemies.push(e); });
    await page.waitForSelector('[data-neon-phase="GAME_OVER"]'); await page.waitForFunction(() => localStorage.getItem('digitalboost:brain-boost:neon-arena:best:coop:v1') !== null);
    assert.equal(await page.evaluate(() => localStorage.getItem('digitalboost:brain-boost:neon-arena:best:v1')), '777');
    await page.getByRole('button', { name: 'Nueva partida', exact: true }).click(); await page.waitForSelector('[data-neon-phase="READY"]'); assert.equal(await page.locator('.na-game').getAttribute('data-neon-players'), '2');
    await page.getByRole('combobox', { name: 'Cantidad de jugadores', exact: true }).selectOption('1'); assert.equal(await page.locator('.na-player-pane').count(), 1);
    await page.getByRole('button', { name: 'Salir', exact: true }).click(); await page.waitForTimeout(100);
    assert.equal(await page.evaluate(() => window.qaCoopFrames()), 0); assert.equal(await page.locator('.na-canvas canvas').count(), 0);
    assert.equal(await canvas.evaluate(c => c.getContext('webgl2').isContextLost()), true);
    assert.deepEqual(errors, []);
    console.log(`${mobile ? 'touch: four pointers + rotation' : 'desktop: two keyboards + two gamepads + disconnect pause'}; independent resources, one RAF/context, split views, team defeat/restart, separate records, GPU cleanup PASS`);
    await context.close();
  }
} finally { await browser?.close(); await server.close(); }
