import assert from 'node:assert/strict';
import { createServer } from 'vite';
const { chromium } = await import(process.env.NEON_PLAYWRIGHT_MODULE || 'playwright');
const server = await createServer({ server: { host: '127.0.0.1', port: 5185, strictPort: true } });
let browser;
try {
  await server.listen();
  browser = await chromium.launch({ executablePath: process.env.NEON_BROWSER_EXECUTABLE || undefined, args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 1000 } }), page = await context.newPage(), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => {
    window.qaVoiceNodes = 0; const oscillator = AudioContext.prototype.createOscillator, connect = AudioNode.prototype.connect;
    AudioContext.prototype.createOscillator = function (...args) { window.qaVoiceNodes++; return oscillator.apply(this, args); };
    AudioNode.prototype.connect = function (target, ...args) { if (target instanceof AudioDestinationNode) { const analyser = this.context.createAnalyser(); analyser.fftSize = 2048; window.qaAudio = analyser; connect.call(this, analyser); return connect.call(analyser, target); } return connect.call(this, target, ...args); };
    window.qaRms = () => { if (!window.qaAudio) return 0; const data = new Float32Array(2048); window.qaAudio.getFloatTimeDomainData(data); return Math.sqrt(data.reduce((sum, v) => sum + v * v, 0) / data.length); };
    localStorage.setItem('digitalboost_app_screen', 'main'); localStorage.setItem('digitalboost:brain-boost:audio-enabled:v1', 'false'); });
  await page.goto('http://127.0.0.1:5185/', { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    const { GameSimulation, createEnemy } = await import('/src/brain-boost/neon-arena/GameSimulation.ts');
    const { SurvivalWorld } = await import('/src/brain-boost/neon-arena/SurvivalWorld.ts');
    const original = GameSimulation.prototype.start, draw = SurvivalWorld.prototype.draw;
    GameSimulation.prototype.start = function () { const result = original.call(this); if (result) { window.qaAim = this; const e = createEnemy('skitter', 900000, -5, 3); e.speed = 0; this.enemies = [e]; } return result; };
    SurvivalWorld.prototype.draw = function (s) { draw.call(this, s); window.qaWorld = this; };
  });
  await page.getByRole('button', { name: 'Abrir disciplina Focus Lab', exact: true }).click();
  await page.getByRole('button', { name: /Neon Arena: Virus Survivor/ }).click(); await page.waitForSelector('[data-neon-phase="READY"]');
  assert.equal(await page.getByRole('combobox', { name: 'Modo de apuntado', exact: true }).inputValue(), 'assisted');
  await page.getByRole('button', { name: 'Iniciar supervivencia →', exact: true }).click();
  await page.waitForFunction(() => window.qaAim?.player.targetId === 900000);
  assert.equal(await page.evaluate(() => window.qaWorld.reticles.count), 1); console.log('assisted default acquires target PASS');
  await page.locator('.na-canvas canvas').focus(); await page.keyboard.down('f');
  await page.waitForFunction(() => window.qaAim.kills >= 1); await page.keyboard.up('f');
  assert.equal(await page.evaluate(() => window.qaAim.player.x === 0 && window.qaAim.player.z === 3), true);
  console.log('stationary marine kills enemy behind using F PASS');
  await page.getByRole('button', { name: 'Pausa', exact: true }).click();
  await page.getByRole('combobox', { name: 'Modo de apuntado', exact: true }).selectOption('modern');
  await page.getByRole('button', { name: 'Reanudar partida', exact: true }).click();
  const expected = await page.evaluate(async () => {
    const p = window.qaAim.player, point = window.qaWorld.camera.position.clone().set(p.x + 5, 0, p.z + 2).project(window.qaWorld.camera);
    const rect = document.querySelector('.na-canvas canvas').getBoundingClientRect(); return { x: rect.x + (point.x + 1) / 2 * rect.width, y: rect.y + (1 - point.y) / 2 * rect.height, angle: Math.atan2(2, 5) };
  });
  await page.mouse.move(expected.x, expected.y); await page.mouse.down();
  await page.waitForFunction(angle => Math.abs(window.qaAim.player.fireAngle - angle) < .015, expected.angle); await page.mouse.up();
  // Read actual instanced geometry in a controlled gallery, with no production debug hook.
  await page.evaluate(async () => {
    const { createEnemy } = await import('/src/brain-boost/neon-arena/GameSimulation.ts'); const s = window.qaAim;
    const kinds = ['skitter', 'carapace', 'spitter', 'stalker', 'brood', 'maw', 'sovereign'];
    s.enemies = kinds.map((kind, i) => { const e = createEnemy(kind, 910000 + i, (i % 4 - 1.5) * 6, i < 4 ? -2 : 9); e.speed = 0; e.attackClock = 100; return e; });
    s.clearInput(); window.qaWorld.draw(s); s.pause();
  });
  await page.waitForSelector('[data-neon-phase="PAUSED"]');
  const counts = await page.evaluate(() => ({ bodies: window.qaWorld.body.count, thoraxes: window.qaWorld.thoraxes.count, eyes: window.qaWorld.eyes.count, jaws: window.qaWorld.feelers.count, shells: window.qaWorld.elytra.count }));
  assert.deepEqual(counts, { bodies: 7, thoraxes: 7, eyes: 14, jaws: 42, shells: 8 });
  await page.locator('.na-overlay').evaluate(e => e.style.visibility = 'hidden');
  await page.locator('.na-stage').screenshot({ path: '/tmp/neon-aim-creature-gallery.png' });
  await page.locator('.na-overlay').evaluate(e => e.style.visibility = '');
  await page.getByRole('button', { name: 'Reanudar partida', exact: true }).click();
  await page.evaluate(async () => {
    const { createEnemy } = await import('/src/brain-boost/neon-arena/GameSimulation.ts');
    const s = window.qaAim, e = createEnemy('brood', 950000, s.player.x + 3, s.player.z); e.hp = 1; e.speed = 0; e.warning = 1; s.enemies = [e];
  });
  await page.getByRole('button', { name: /SHOCKWAVE/ }).click(); await page.waitForFunction(() => window.qaAim.unlockedThisRun.includes('flame'));
  await page.evaluate(async () => {
    const { createEnemy } = await import('/src/brain-boost/neon-arena/GameSimulation.ts');
    const s = window.qaAim; s.player.health = 1; s.player.invulnerable = 0; const e = createEnemy('skitter', 960000, s.player.x, s.player.z); e.speed = 0; s.enemies = [e];
  });
  await page.waitForSelector('[data-neon-phase="GAME_OVER"]');
  assert.match(await page.locator('.na-run-unlocks').innerText(), /ARMAS OBTENIDAS.*Lanzallamas/);
  assert.ok(await page.evaluate(() => JSON.parse(localStorage.getItem('digitalboost:brain-boost:neon-arena:arsenal:v1')).unlocked.includes('flame')));
  console.log('real boss reward appears in final result and survives session PASS');
  await page.getByRole('button', { name: 'Sonido OFF', exact: true }).click();
  await page.waitForTimeout(800);
  for (const kind of ['skitter', 'carapace', 'spitter', 'stalker', 'brood', 'maw', 'sovereign']) {
    const rms = await page.evaluate(async kind => {
      const { playNeonCreatureSfx } = await import('/src/brain-boost/brainBoostAudio.ts'); playNeonCreatureSfx(kind, 'boss');
      await new Promise(resolve => setTimeout(resolve, 60)); return window.qaRms();
    }, kind);
    assert.ok(rms > .000001, `${kind} voice emits actual audio, RMS ${rms}`); await page.waitForTimeout(150);
  }
  await page.waitForTimeout(500);
  const voices = await page.evaluate(async () => {
    const { playNeonCreatureSfx } = await import('/src/brain-boost/brainBoostAudio.ts'); const before = window.qaVoiceNodes;
    for (let i = 0; i < 100; i++) playNeonCreatureSfx('skitter', 'death'); return window.qaVoiceNodes - before;
  });
  assert.equal(voices, 1, '100 simultaneous creature cues must schedule a single gated voice');
  await page.getByRole('button', { name: 'Sonido ON', exact: true }).click();
  const muted = await page.evaluate(async () => { const { playNeonCreatureSfx } = await import('/src/brain-boost/brainBoostAudio.ts'); const before = window.qaVoiceNodes; playNeonCreatureSfx('maw', 'boss'); return window.qaVoiceNodes - before; });
  assert.equal(muted, 0); console.log('seven creature voices emit measured audio; horde voice budget and shared mute PASS');
  await page.getByRole('button', { name: 'Salir', exact: true }).click(); assert.deepEqual(errors, []);
  console.log('default 360 assist kills a target behind the marine; real raycaster manual aim; seven creature meshes; exit PASS');
  await context.close();
} finally { await browser?.close(); await server.close(); }
