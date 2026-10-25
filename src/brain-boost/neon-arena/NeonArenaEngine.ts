import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { CONFIG, FixedClock, GameSimulation, type CombatEvent } from './GameSimulation';
import { SurvivalWorld } from './SurvivalWorld';
import { WEAPON_IDS, type Progress } from './SurvivalRules';
type Snapshot = ReturnType<GameSimulation['snapshot']>;
type Options = { progress?: Progress; onProgress?: (progress: Progress) => void; onCue?: (event: CombatEvent) => void };
export class NeonArenaEngine {
  readonly simulation: GameSimulation;
  private renderer!: THREE.WebGLRenderer; private world!: SurvivalWorld;
  private composer?: EffectComposer; private observer?: ResizeObserver;
  private cleanup: (() => void)[] = []; private clock = new FixedClock(); private keys = new Set<string>();
  private pointers = new Map<number, { kind: 'stick' | 'fire'; x: number; y: number; element: HTMLElement }>();
  private stick = { x: 0, z: 0 }; private mouseFire = false; private touchFire = false; private aim: number | null = null;
  private mode: 'classic' | 'modern' = 'classic'; private ray = new THREE.Raycaster(); private plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private pointer = new THREE.Vector2(); private point = new THREE.Vector3();
  private raf = 0; private disposed = false; private lastTime = 0; private publishAt = 0; private publishedPhase = 'LOADING';
  private progressRevision = 0; private lastEvent = 0; private badFrames = 0; private resolution = 1; private low: boolean; private reduced: boolean;
  constructor(private host: HTMLDivElement, private notify: (snapshot: Snapshot) => void, private fail: (message: string) => void, private options: Options = {}) {
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches; this.low = matchMedia('(pointer: coarse)').matches || this.reduced;
    this.simulation = new GameSimulation(42819, options.progress, this.low ? 120 : 240);
    try {
      const canvas = document.createElement('canvas'), context = canvas.getContext('webgl2', { antialias: !this.low });
      if (!context) throw new Error('WebGL 2 no está disponible en este navegador.');
      this.renderer = new THREE.WebGLRenderer({ canvas, context, antialias: !this.low });
      this.renderer.outputColorSpace = THREE.SRGBColorSpace; this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.15;
      canvas.tabIndex = 0; canvas.setAttribute('aria-label', 'Supervivencia 3D. WASD o flechas: moverse. F o ratón: disparar. Espacio: Shockwave. P: pausa.'); host.append(canvas);
      this.world = new SurvivalWorld(this.reduced);
      if (!this.low) try {
        this.composer = new EffectComposer(this.renderer); this.composer.addPass(new RenderPass(this.world.scene, this.world.camera));
        this.composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), .18, .15, 1.5)); this.composer.addPass(new OutputPass());
      } catch { this.disposeComposer(); }
      this.bind(canvas); this.observer = new ResizeObserver(() => this.resize()); this.observer.observe(host); this.resize();
      this.simulation.ready(); this.world.draw(this.simulation); this.notify(this.simulation.snapshot()); this.raf = requestAnimationFrame(this.frame);
    } catch (error) { this.dispose(); throw error; }
  }
  setMode(mode: 'classic' | 'modern') { this.mode = mode; this.releaseInputs(); }
  setRemains(enabled: boolean) { this.world.setRemains(enabled); }
  private bind(canvas: HTMLCanvasElement) {
    const stage = this.host.parentElement!;
    const listen = (target: EventTarget, name: string, fn: EventListener) => { target.addEventListener(name, fn); this.cleanup.push(() => target.removeEventListener(name, fn)); };
    const aimAt = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect(); if (!rect.width || !rect.height) return;
      this.pointer.set((e.clientX - rect.left) / rect.width * 2 - 1, -(e.clientY - rect.top) / rect.height * 2 + 1); this.ray.setFromCamera(this.pointer, this.world.camera);
      if (this.ray.ray.intersectPlane(this.plane, this.point)) this.aim = Math.atan2(this.point.z - this.simulation.player.z, this.point.x - this.simulation.player.x);
    };
    listen(stage, 'pointerdown', ((e: PointerEvent) => {
      if (this.simulation.phase !== 'PLAYING') return;
      const target = e.target as HTMLElement, control = target.closest<HTMLElement>('[data-na-stick], [data-na-fire]');
      if (control) {
        const kind = control.hasAttribute('data-na-stick') ? 'stick' : 'fire';
        if ([...this.pointers.values()].some(p => p.kind === kind)) return;
        e.preventDefault(); canvas.focus({ preventScroll: true }); control.setPointerCapture(e.pointerId);
        const rect = control.getBoundingClientRect(); this.pointers.set(e.pointerId, { kind, x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, element: control });
        if (kind === 'fire') this.touchFire = true;
        control.dataset.active = 'true'; return;
      }
      if (target === canvas && e.button === 0 && e.pointerType === 'mouse') { this.mouseFire = true; canvas.focus({ preventScroll: true }); canvas.setPointerCapture(e.pointerId); this.pointers.set(e.pointerId, { kind: 'fire', x: e.clientX, y: e.clientY, element: canvas }); aimAt(e); }
    }) as EventListener);
    listen(stage, 'pointermove', ((e: PointerEvent) => {
      const active = this.pointers.get(e.pointerId);
      if (active?.kind === 'stick') {
        const dx = e.clientX - active.x, dz = e.clientY - active.y, distance = Math.max(38, Math.hypot(dx, dz)); this.stick = { x: dx / distance, z: dz / distance };
        active.element.style.setProperty('--stick-x', `${this.stick.x * 24}px`); active.element.style.setProperty('--stick-y', `${this.stick.z * 24}px`);
      } else if (active?.element.hasAttribute('data-na-fire') && this.mode === 'modern') {
        const dx = e.clientX - active.x, dz = e.clientY - active.y; if (Math.hypot(dx, dz) > 8) this.aim = Math.atan2(dz, dx);
      } else if (e.pointerType === 'mouse') aimAt(e);
    }) as EventListener);
    const release = ((e: PointerEvent) => {
      const active = this.pointers.get(e.pointerId); if (!active) return; this.pointers.delete(e.pointerId);
      if (active.kind === 'stick') this.stick = { x: 0, z: 0 }; else { this.mouseFire = false; this.touchFire = false; }
      active.element.dataset.active = 'false'; active.element.style.setProperty('--stick-x', '0px'); active.element.style.setProperty('--stick-y', '0px');
      if (active.element.hasPointerCapture(e.pointerId)) active.element.releasePointerCapture(e.pointerId);
    }) as EventListener;
    for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) listen(stage, event, release);
    listen(canvas, 'keydown', ((e: KeyboardEvent) => {
      const key = e.key.toLowerCase(); if (!['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'f', ' ', 'p', '1', '2', '3', '4', '5'].includes(key)) return;
      e.preventDefault(); this.keys.add(key); if (e.repeat) return;
      if (key === ' ') this.simulation.shock(); if (key === 'p') this.togglePause(); if (/^[1-5]$/.test(key)) this.simulation.equip(WEAPON_IDS[Number(key) - 1]);
    }) as EventListener);
    listen(canvas, 'keyup', ((e: KeyboardEvent) => { this.keys.delete(e.key.toLowerCase()); }) as EventListener);
    listen(canvas, 'blur', () => this.releaseInputs());
    listen(window, 'blur', () => this.pause());
    listen(document, 'visibilitychange', () => { if (document.hidden) this.pause(); this.lastTime = 0; this.clock.reset(); });
    listen(canvas, 'webglcontextlost', ((e: Event) => { e.preventDefault(); this.simulation.transition('ERROR'); this.releaseInputs(); cancelAnimationFrame(this.raf); this.notify(this.simulation.snapshot()); this.fail('Se perdió el contexto gráfico. Reiniciá la escena para volver a jugar.'); }) as EventListener);
  }
  private releaseInputs() {
    const active = [...this.pointers]; this.pointers.clear();
    for (const [id, p] of active) { p.element.dataset.active = 'false'; p.element.style.setProperty('--stick-x', '0px'); p.element.style.setProperty('--stick-y', '0px'); if (p.element.hasPointerCapture(id)) p.element.releasePointerCapture(id); }
    this.keys.clear(); this.stick = { x: 0, z: 0 }; this.mouseFire = this.touchFire = false; this.aim = null; this.simulation.clearInput();
  }
  private resize() {
    if (this.disposed) return; const w = Math.max(1, this.host.clientWidth), h = Math.max(1, this.host.clientHeight);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, this.low ? 1.25 : 1.75) * this.resolution); this.renderer.setSize(w, h); this.world.resize(w, h);
    if (this.composer) { this.composer.setPixelRatio(this.renderer.getPixelRatio()); this.composer.setSize(w, h); }
  }
  start() { this.simulation.start(); this.resetClock(); this.renderer.domElement.focus({ preventScroll: true }); }
  pause() { this.simulation.pause(); this.releaseInputs(); this.resetClock(); }
  togglePause() { this.simulation.phase === 'PAUSED' ? this.simulation.resume() : this.simulation.pause(); this.releaseInputs(); this.resetClock(); this.renderer.domElement.focus({ preventScroll: true }); }
  private resetClock() { this.lastTime = 0; this.clock.reset(); this.notify(this.simulation.snapshot()); }
  private frame = (time: number) => {
    if (this.disposed) return;
    try {
      const delta = this.lastTime ? (time - this.lastTime) / 1000 : 0; this.lastTime = time;
      if (document.hidden) { this.clock.reset(); this.raf = requestAnimationFrame(this.frame); return; }
      this.badFrames = delta > .03 ? this.badFrames + 1 : Math.max(0, this.badFrames - 1);
      if (this.badFrames > 100 && this.resolution > .65) { this.resolution *= .8; this.disposeComposer(); this.resize(); this.badFrames = 0; }
      const s = this.simulation;
      this.clock.advance(delta, () => {
        const x = Number(this.keys.has('d') || this.keys.has('arrowright')) - Number(this.keys.has('a') || this.keys.has('arrowleft')) + this.stick.x;
        const z = Number(this.keys.has('s') || this.keys.has('arrowdown')) - Number(this.keys.has('w') || this.keys.has('arrowup')) + this.stick.z;
        s.setInput(x, z, this.keys.has('f') || this.mouseFire || this.touchFire, this.mode === 'modern' ? this.aim : null); s.step();
        // Rewards are persisted in the simulation step that grants them, not at game over.
        if (s.progressRevision !== this.progressRevision) { this.progressRevision = s.progressRevision; this.options.onProgress?.(s.progress); }
      });
      for (const e of s.events) if (e.id > this.lastEvent) { this.options.onCue?.(e); this.lastEvent = e.id; }
      this.world.draw(s);
      if (this.composer) try { this.composer.render(); } catch { this.disposeComposer(); this.renderer.render(this.world.scene, this.world.camera); }
      else this.renderer.render(this.world.scene, this.world.camera);
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
