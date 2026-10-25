import assert from 'node:assert/strict';
import { createServer } from 'vite';
const { chromium } = await import(process.env.NEON_PLAYWRIGHT_MODULE || 'playwright');
const server = await createServer({ server: { host: '127.0.0.1', port: 5181, strictPort: true } });
let browser;
try {
  await server.listen(); browser = await chromium.launch({ executablePath: process.env.NEON_BROWSER_EXECUTABLE || undefined, args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 1000 } }), page = await context.newPage(), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => {
    localStorage.setItem('digitalboost_app_screen', 'main'); localStorage.setItem('digitalboost:brain-boost:audio-enabled:v1', 'false');
  });
  await page.goto('http://127.0.0.1:5181/', { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    const { GameSimulation, createEnemy } = await import('/src/brain-boost/neon-arena/GameSimulation.ts');
    const original = GameSimulation.prototype.start;
    // Controlled encounter fixture, injected only by this test. No production debug entry point.
    window.qaBoss = 'brood';
    GameSimulation.prototype.start = function () {
      const result = original.call(this); if (!result) return result;
      const kind = window.qaBoss; this.wave = kind === 'brood' ? 5 : kind === 'maw' ? 10 : 15;
      const enemy = createEnemy(kind, 900000, this.player.x + 3, this.player.z, this.wave); enemy.speed = 0;
      this.enemies = [enemy]; window.qaEncounter = this; return result;
    };
  });
  await page.getByRole('button', { name: 'Abrir disciplina Focus Lab', exact: true }).click();
  const select = () => page.getByRole('button', { name: /Neon Arena: Virus Survivor/ }).click();
  for (const [boss, weapon] of [['brood', 'flame'], ['maw', 'cascade'], ['sovereign', 'rail']]) {
    await page.evaluate(value => { window.qaBoss = value; }, boss);
    await select(); await page.waitForSelector('[data-neon-phase="READY"]');
    await page.getByRole('button', { name: 'Iniciar supervivencia →', exact: true }).click();
    await page.waitForSelector('.na-boss');
    await page.screenshot({ path: `/tmp/neon-v4-${boss}-qa.png` });
    await page.evaluate(() => { const enemy = window.qaEncounter.enemies.find(e => e.boss); enemy.hp = 1; enemy.warning = 1; });
    await page.getByRole('button', { name: /SHOCKWAVE/ }).click();
    await page.waitForFunction(id => JSON.parse(localStorage.getItem('digitalboost:brain-boost:neon-arena:arsenal:v1') || '{}').unlocked?.includes(id), weapon);
    await page.waitForSelector('.na-notice');
    await page.waitForSelector('[data-na-director]');
    assert.match(await page.locator('[data-na-director]').innerText(), new RegExp(`OLA ${boss === 'brood' ? 10 : boss === 'maw' ? 15 : 20}`));
    assert.equal(await page.locator('.na-weapon-bar button').count() >= 2, true);
    await page.getByRole('button', { name: 'Salir', exact: true }).click();
    console.log(`${boss}: real HUD + Shockwave defeat + immediate persisted ${weapon} unlock PASS`);
  }
  await select(); await page.waitForSelector('[data-neon-phase="READY"]');
  const loadout = page.locator('.na-loadout');
  await loadout.getByRole('button', { name: 'Lanzallamas', exact: true }).click();
  assert.equal(await loadout.getByRole('button', { name: 'Lanzallamas', exact: true }).getAttribute('aria-pressed'), 'true');
  await page.getByRole('button', { name: 'Iniciar supervivencia →', exact: true }).click();
  const before = await page.evaluate(() => window.qaEncounter.ammo.flame);
  await page.locator('canvas').focus(); await page.keyboard.down('f'); await page.waitForTimeout(700); await page.keyboard.up('f');
  assert.ok(await page.evaluate(() => window.qaEncounter.ammo.flame) < before);
  await page.getByRole('button', { name: 'Salir', exact: true }).click(); assert.deepEqual(errors, []);
  console.log('new session equips persisted weapon and consumes real fuel PASS'); await context.close();

  const soundContext = await browser.newContext({ viewport: { width: 1000, height: 1000 } }), sound = await soundContext.newPage();
  await sound.addInitScript(() => {
    localStorage.setItem('digitalboost_app_screen', 'main'); localStorage.setItem('digitalboost:brain-boost:audio-enabled:v1', 'true');
    const connect = AudioNode.prototype.connect;
    AudioNode.prototype.connect = function (destination, ...args) {
      if (destination instanceof AudioDestinationNode) {
        const analyser = this.context.createAnalyser(); analyser.fftSize = 2048; window.qaAnalyser = analyser;
        connect.call(this, analyser); return connect.call(analyser, destination);
      }
      return connect.call(this, destination, ...args);
    };
    const intervals = new Set(), set = window.setInterval, clear = window.clearInterval;
    window.setInterval = (callback, ...args) => { const id = set(callback, ...args); if (new Error().stack.includes('brainBoostAudio')) intervals.add(id); return id; };
    window.clearInterval = id => { intervals.delete(id); clear(id); };
    window.qaAudioIntervals = () => intervals.size;
    window.qaAudioRms = () => { if (!window.qaAnalyser) return 0; const data = new Float32Array(2048); window.qaAnalyser.getFloatTimeDomainData(data); return Math.sqrt(data.reduce((n, v) => n + v * v, 0) / data.length); };
  });
  await sound.goto('http://127.0.0.1:5181/', { waitUntil: 'networkidle' });
  await sound.getByRole('button', { name: 'Abrir disciplina Focus Lab', exact: true }).click();
  await sound.getByRole('button', { name: /Neon Arena: Virus Survivor/ }).click(); await sound.waitForSelector('[data-neon-phase="READY"]');
  await sound.getByRole('button', { name: 'Iniciar supervivencia →', exact: true }).click();
  await sound.waitForFunction(() => window.qaAudioRms() > .001);
  assert.equal(await sound.evaluate(() => window.qaAudioIntervals()), 1);
  const audible = await sound.evaluate(() => window.qaAudioRms());
  await sound.getByRole('button', { name: 'Pausa', exact: true }).click();
  await sound.waitForFunction(() => window.qaAudioIntervals() === 0); await sound.waitForTimeout(900);
  assert.ok(await sound.evaluate(() => window.qaAudioRms()) < .0001);
  await sound.getByRole('button', { name: 'Reanudar partida', exact: true }).click(); await sound.waitForFunction(() => window.qaAudioRms() > .001);
  await sound.getByRole('button', { name: 'Sonido ON', exact: true }).click(); await sound.waitForFunction(() => window.qaAudioIntervals() === 0);
  await sound.getByRole('button', { name: 'Salir', exact: true }).click(); await sound.waitForTimeout(800);
  assert.equal(await sound.evaluate(() => window.qaAudioIntervals()), 0);
  console.log(`original shared-context music: measured RMS ${audible.toFixed(5)}, single scheduler, pause silence, resume, mute, exit PASS`);
  await soundContext.close();
} finally { await browser?.close(); await server.close(); }
