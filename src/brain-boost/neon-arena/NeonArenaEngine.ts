import { RenderMetrics, type ArenaDiagnostics } from './RenderMetrics';
import { DEFAULT_ARENA } from './ArenaDefinition';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { CONFIG, FixedClock, GameSimulation, type CombatEvent } from './GameSimulation';
import { SurvivalWorld } from './SurvivalWorld';
import { LocalGamepads, keyboardAction, keyboardInput } from './LocalControls';
import { WEAPON_IDS, type Progress } from './SurvivalRules';
import type { AimMode } from './AimAssist';
type Snapshot = ReturnType<GameSimulation['snapshot']>;
type Options = { progress?: Progress; playerCount?: 1 | 2; onProgress?: (progress: Progress) => void; onCue?: (event: CombatEvent) => void; onDiagnostics?: (value: ArenaDiagnostics | null) => void };
const controls = () => ({ x: 0, z: 0, mouseFire: false, touchFire: false, aim: null as number | null });
export class NeonArenaEngine {
  readonly simulation: GameSimulation;
  private renderer!: THREE.WebGLRenderer; private world!: SurvivalWorld;
  private composer?: EffectComposer; private observer?: ResizeObserver;
  private cleanup: (() => void)[] = []; private clock = new FixedClock(); private keys = new Set<string>();
  private pointers = new Map<number, { kind: 'stick' | 'fire'; playerId: number; x: number; y: number; element: HTMLElement }>();
  private inputs = [controls(), controls()]; private modes: AimMode[] = ['assisted', 'assisted']; private pads = new LocalGamepads();
  private ray = new THREE.Raycaster(); private plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); private pointer = new THREE.Vector2(); private point = new THREE.Vector3();
  private diagnostics = false; private metrics = new RenderMetrics(); private metricAt = 0;
  private raf = 0; private disposed = false; private lastTime = 0; private publishAt = 0; private publishedPhase = 'LOADING';
  private progressRevision = 0; private lastEvent = 0; private badFrames = 0; private resolution = 1; private low: boolean; private reduced: boolean; private width = 1; private height = 1; private needsRender = true;
  constructor(private host: HTMLDivElement, private notify: (snapshot: Snapshot) => void, private fail: (message: string) => void, private options: Options = {}) {
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches; this.low = matchMedia('(pointer: coarse)').matches || this.reduced;
    this.simulation = new GameSimulation(42819, options.progress, this.low ? 120 : 240, options.playerCount ?? 1, DEFAULT_ARENA);
    try {
      const canvas = document.createElement('canvas'), context = canvas.getContext('webgl2', { antialias: !this.low });
      if (!context) throw new Error('WebGL 2 no está disponible en este navegador.');
      this.renderer = new THREE.WebGLRenderer({ canvas, context, antialias: !this.low });
      this.renderer.info.autoReset = false;
      this.renderer.outputColorSpace = THREE.SRGBColorSpace; this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.15;
      canvas.tabIndex = 0; canvas.setAttribute('aria-label', 'Arena 3D. P1: WASD, F y espacio. P2 cooperativo: flechas, J y K. P: pausa.'); host.append(canvas);
      this.world = new SurvivalWorld(this.reduced, this.simulation.arena); this.configureComposer(); this.bind(canvas);
      this.observer = new ResizeObserver(() => this.resize()); this.observer.observe(host); this.resize();
      this.modes.forEach((mode, i) => this.simulation.setAimMode(mode, i)); this.simulation.ready(); this.world.draw(this.simulation); this.notify(this.simulation.snapshot()); this.raf = requestAnimationFrame(this.frame);
    } catch (error) { this.dispose(); throw error; }
  }
  setPlayerCount(count: 1 | 2) {
    if (!this.simulation.setPlayerCount(count)) return false;
    this.modes.forEach((mode, i) => this.simulation.setAimMode(mode, i)); this.releaseInputs(); this.configureComposer(); this.resize(); this.world.draw(this.simulation); this.notify(this.simulation.snapshot()); return true;
  }
  setMode(mode: AimMode, playerId = 0) { if (playerId < 0 || playerId > 1) return; this.modes[playerId] = mode; this.simulation.setAimMode(mode, playerId); this.releaseInputs(); }
  setQuality(quality: 'auto' | 'low' | 'high' | 'horde') { this.low = quality === 'low' || quality === 'horde' || quality === 'auto' && matchMedia('(pointer: coarse)').matches || this.reduced; this.resolution = quality === 'horde' ? .78 : 1; this.configureComposer(); this.resize(); }
  setDiagnostics(enabled: boolean) { this.diagnostics = enabled; this.metrics.reset(); if (!enabled) this.options.onDiagnostics?.(null); }
  setRemains(enabled: boolean) { this.world.setRemains(enabled); this.needsRender = true; }
  private cycle(playerId: number) {
    const p = this.simulation.players[playerId]; if (!p) return;
    const ids = this.simulation.progress.unlocked, next = ids[(ids.indexOf(p.equipped) + 1) % ids.length]; this.simulation.equip(next, playerId);
  }
  private bind(canvas: HTMLCanvasElement) {
    const stage = this.host.parentElement!;
    const listen = (target: EventTarget, name: string, fn: EventListener) => { target.addEventListener(name, fn); this.cleanup.push(() => target.removeEventListener(name, fn)); };
    // Long-pressing FIRE on Android must stay inside the game. Without these
    // guards Chrome opens its page context menu and cancels the held pointer.
    const consumeBrowserGesture = (e: Event) => { e.preventDefault(); };
    for (const event of ['contextmenu', 'selectstart', 'dragstart', 'gesturestart']) listen(stage, event, consumeBrowserGesture);
    const playerAt = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect(), x = e.clientX - rect.left, y = e.clientY - rect.top;
      const i = this.world.viewports.findIndex(v => x >= v.x && x < v.x + v.width && y >= v.y && y < v.y + v.height); return Math.max(0, i);
    };
    const aimAt = (e: PointerEvent, playerId: number) => {
      if (this.modes[playerId] !== 'modern') return;
      const rect = canvas.getBoundingClientRect(), view = this.world.viewports[playerId], p = this.simulation.players[playerId];
      if (!view?.width || !view.height || !p) return;
      this.pointer.set((e.clientX - rect.left - view.x) / view.width * 2 - 1, -(e.clientY - rect.top - view.y) / view.height * 2 + 1);
      this.ray.setFromCamera(this.pointer, this.world.cameras[playerId]);
      if (this.ray.ray.intersectPlane(this.plane, this.point)) this.inputs[playerId].aim = Math.atan2(this.point.z - p.z, this.point.x - p.x);
    };
    listen(stage, 'pointerdown', ((e: PointerEvent) => {
      if (this.simulation.phase !== 'PLAYING') return;
      const target = e.target as HTMLElement, control = target.closest<HTMLElement>('[data-na-stick], [data-na-fire]');
      if (control) {
        const playerId = Number(control.dataset.naPlayer ?? 0), kind = control.hasAttribute('data-na-stick') ? 'stick' : 'fire';
        if (!this.simulation.players[playerId]?.health || [...this.pointers.values()].some(p => p.kind === kind && p.playerId === playerId)) return;
        e.preventDefault(); canvas.focus({ preventScroll: true }); control.setPointerCapture(e.pointerId);
        const rect = control.getBoundingClientRect(); this.pointers.set(e.pointerId, { kind, playerId, x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, element: control });
        if (kind === 'fire') { this.inputs[playerId].touchFire = true; this.inputs[playerId].aim = null; } control.dataset.active = 'true'; return;
      }
      if (target === canvas && e.button === 0 && e.pointerType === 'mouse') {
        const playerId = playerAt(e); if (!this.simulation.players[playerId]?.health) return;
        this.inputs[playerId].mouseFire = true; canvas.focus({ preventScroll: true }); canvas.setPointerCapture(e.pointerId);
        this.pointers.set(e.pointerId, { kind: 'fire', playerId, x: e.clientX, y: e.clientY, element: canvas }); aimAt(e, playerId);
      }
    }) as EventListener);
    listen(stage, 'pointermove', ((e: PointerEvent) => {
      if (this.simulation.phase !== 'PLAYING') return;
      const active = this.pointers.get(e.pointerId);
      if (active?.kind === 'stick') {
        const dx = e.clientX - active.x, dz = e.clientY - active.y, distance = Math.max(38, Math.hypot(dx, dz)), input = this.inputs[active.playerId]; input.x = dx / distance; input.z = dz / distance;
        active.element.style.setProperty('--stick-x', `${input.x * 24}px`); active.element.style.setProperty('--stick-y', `${input.z * 24}px`);
      } else if (active?.element.hasAttribute('data-na-fire') && this.modes[active.playerId] === 'modern') {
        const dx = e.clientX - active.x, dz = e.clientY - active.y; const input = this.inputs[active.playerId], d = Math.hypot(dx, dz); input.aim = d > 8 ? Math.atan2(dz, dx) : null; active.element.style.setProperty('--stick-x', `${dx / Math.max(38, d) * 20}px`); active.element.style.setProperty('--stick-y', `${dz / Math.max(38, d) * 20}px`);
      } else if (e.pointerType === 'mouse') aimAt(e, active?.playerId ?? playerAt(e));
    }) as EventListener);
    const release = ((e: PointerEvent) => {
      const active = this.pointers.get(e.pointerId); if (!active) return; this.pointers.delete(e.pointerId); const input = this.inputs[active.playerId];
      if (active.kind === 'stick') input.x = input.z = 0; else { input.mouseFire = input.touchFire = false; if (active.element.hasAttribute('data-na-fire')) input.aim = null; }
      active.element.dataset.active = 'false'; active.element.style.setProperty('--stick-x', '0px'); active.element.style.setProperty('--stick-y', '0px');
      if (active.element.hasPointerCapture(e.pointerId)) active.element.releasePointerCapture(e.pointerId);
    }) as EventListener;
    for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) listen(stage, event, release);
    listen(canvas, 'keydown', ((e: KeyboardEvent) => {
      const code = e.code || (e.key.length === 1 ? `Key${e.key.toUpperCase()}` : e.key), action = keyboardAction(code, this.simulation.players.length);
      if (!action && !['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyJ', 'ControlRight', 'Numpad0', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(code)) return;
      e.preventDefault(); this.keys.add(code); if (e.repeat || !action) return;
      if (action.action === 'pause') this.togglePause(); if (action.action === 'shock') this.simulation.shock(action.playerId);
      if (action.action === 'cycle') this.cycle(action.playerId); if (action.action === 'equip') this.simulation.equip(WEAPON_IDS[action.index!], action.playerId);
    }) as EventListener);
    listen(canvas, 'keyup', ((e: KeyboardEvent) => { this.keys.delete(e.code || (e.key.length === 1 ? `Key${e.key.toUpperCase()}` : e.key)); }) as EventListener);
    listen(canvas, 'blur', () => this.releaseInputs()); listen(window, 'blur', () => this.pause());
    listen(document, 'visibilitychange', () => { if (document.hidden) this.pause(); this.lastTime = 0; this.clock.reset(); });
    listen(canvas, 'webglcontextlost', ((e: Event) => { e.preventDefault(); this.simulation.transition('ERROR'); this.releaseInputs(); cancelAnimationFrame(this.raf); this.notify(this.simulation.snapshot()); this.fail('Se perdió el contexto gráfico. Reiniciá la escena para volver a jugar.'); }) as EventListener);
  }
  private releaseInputs() {
    const active = [...this.pointers]; this.pointers.clear();
    for (const [id, p] of active) { p.element.dataset.active = 'false'; p.element.style.setProperty('--stick-x', '0px'); p.element.style.setProperty('--stick-y', '0px'); if (p.element.hasPointerCapture(id)) p.element.releasePointerCapture(id); }
    this.keys.clear(); this.inputs = [controls(), controls()]; this.simulation.clearInput();
  }
  private configureComposer() {
    this.disposeComposer(); if (this.low || this.simulation.players.length === 2 || this.resolution < .99) return;
    try { this.composer = new EffectComposer(this.renderer); this.composer.addPass(new RenderPass(this.world.scene, this.world.camera)); this.composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), .18, .15, 1.5)); this.composer.addPass(new OutputPass()); } catch { this.disposeComposer(); }
  }
  private resize() {
    if (this.disposed) return;
    const width = Math.max(1, this.host.clientWidth), height = Math.max(1, this.host.clientHeight);
    // Rotation/layout changes invalidate pointer geometry. A DPR-only quality drop does not.
    if (width !== this.width || height !== this.height) { this.releaseInputs(); this.clock.reset(); this.lastTime = 0; }
    this.needsRender = true; this.width = width; this.height = height;
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, this.low || this.simulation.players.length === 2 ? 1.25 : 1.75) * this.resolution);
    this.renderer.setSize(this.width, this.height); this.world.resize(this.width, this.height, this.simulation.players.length);
    if (this.composer) { this.composer.setPixelRatio(this.renderer.getPixelRatio()); this.composer.setSize(this.width, this.height); }
  }
  start() { this.simulation.start(); this.resetClock(); this.renderer.domElement.focus({ preventScroll: true }); }
  pause() { this.simulation.pause(); this.releaseInputs(); this.resetClock(); }
  togglePause() { this.simulation.phase === 'PAUSED' ? this.simulation.resume() : this.simulation.pause(); this.releaseInputs(); this.resetClock(); this.renderer.domElement.focus({ preventScroll: true }); }
  private resetClock() { this.lastTime = 0; this.clock.reset(); this.needsRender = true; this.notify(this.simulation.snapshot()); }
  private render() {
    this.renderer.info.reset();
    if (this.composer) try { this.composer.render(); return; } catch { this.disposeComposer(); }
    const r = this.renderer; r.setScissorTest(true);
    try { this.world.viewports.forEach((view, i) => { if (!view.width || !view.height) return; const y = this.height - view.y - view.height; r.setViewport(view.x, y, view.width, view.height); r.setScissor(view.x, y, view.width, view.height); r.render(this.world.scene, this.world.cameras[i]); }); }
    finally { r.setScissorTest(false); r.setViewport(0, 0, this.width, this.height); }
  }
  private frame = (time: number) => {
    if (this.disposed) return;
    try {
      const delta = this.lastTime ? (time - this.lastTime) / 1000 : 0; this.lastTime = time;
      if (document.hidden) { this.clock.reset(); this.raf = requestAnimationFrame(this.frame); return; }
      this.badFrames = !['PLAYING', 'WAVE_TRANSITION'].includes(this.simulation.phase) ? 0 : delta > .03 ? this.badFrames + 1 : Math.max(0, this.badFrames - 1);
      // Mobile GPUs can fall behind only when a horde and effects overlap;
      // lower DPR before the browser starts dropping touch frames. Never
      // reduce below a readable 60% internal resolution.
      if (this.badFrames > 72 && this.resolution > .6) { this.resolution = Math.max(.6, this.resolution * .82); this.disposeComposer(); this.resize(); this.badFrames = 0; }
      let rawPads: (Gamepad | null)[] = []; try { rawPads = [...(navigator.getGamepads?.() ?? [])]; } catch { /* Keyboard/touch stay available when the browser restricts gamepads. */ }
      const pads = this.pads.sample(rawPads, this.simulation.players.length);
      if (pads.disconnected && ['PLAYING', 'WAVE_TRANSITION'].includes(this.simulation.phase)) this.pause();
      else if (pads.inputs.some(p => p.pause)) this.togglePause();
      pads.inputs.forEach((p, i) => { if (p.shock) this.simulation.shock(i); if (p.cycle) this.cycle(i); if (this.modes[i] === 'modern' && p.aim !== null) this.inputs[i].aim = p.aim; });
      const s = this.simulation;
      const updateStart = performance.now();
      this.clock.advance(delta, () => {
        s.players.forEach((p, i) => { const key = keyboardInput(this.keys, i, s.players.length), input = this.inputs[i], pad = pads.inputs[i]; s.setInput(key.x + input.x + pad.x, key.z + input.z + pad.z, key.firing || input.mouseFire || input.touchFire || pad.firing, this.modes[i] === 'modern' ? input.aim : null, i); });
        s.step(); if (s.progressRevision !== this.progressRevision) { this.progressRevision = s.progressRevision; this.options.onProgress?.(s.progress); }
      });
      const updateMs = performance.now() - updateStart;
      for (const e of s.events) if (e.id > this.lastEvent) { this.options.onCue?.(e); this.lastEvent = e.id; }
      if (['PLAYING', 'WAVE_TRANSITION'].includes(s.phase) || this.needsRender || s.phase !== this.publishedPhase) { const before = performance.now(); this.world.draw(s); this.render(); if (this.diagnostics && ['PLAYING', 'WAVE_TRANSITION'].includes(s.phase)) this.metrics.observe(delta, updateMs, performance.now() - before); this.needsRender = false; }
      if (this.diagnostics && time - this.metricAt > 1000) { this.metricAt = time; const info = this.renderer.info; this.options.onDiagnostics?.({ ...this.metrics.read(), calls: info.render.calls, triangles: info.render.triangles, geometries: info.memory.geometries, textures: info.memory.textures, enemies: s.enemies.length }); }
      if (!['PLAYING', 'WAVE_TRANSITION'].includes(s.phase)) this.metrics.reset();
      if (time - this.publishAt > 100 || s.phase !== this.publishedPhase) { this.publishAt = time; this.publishedPhase = s.phase; this.notify(s.snapshot()); }
      this.raf = requestAnimationFrame(this.frame);
    } catch (error) { this.simulation.transition('ERROR'); this.releaseInputs(); this.notify(this.simulation.snapshot()); this.fail(error instanceof Error ? error.message : 'Error de renderizado'); }
  };
  private disposeComposer() { if (!this.composer) return; for (const pass of this.composer.passes) pass.dispose(); this.composer.dispose(); this.composer = undefined; }
  dispose() {
    if (this.disposed) return; this.disposed = true; cancelAnimationFrame(this.raf); this.releaseInputs(); this.observer?.disconnect(); this.cleanup.reverse().forEach(fn => fn()); this.cleanup = [];
    this.simulation.dispose(); this.disposeComposer(); this.world?.dispose();
    if (this.renderer) { this.renderer.dispose(); this.renderer.forceContextLoss(); this.renderer.domElement.remove(); }
  }
}
