import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { CONFIG, FixedClock, GameSimulation } from './GameSimulation';

type Snapshot = ReturnType<GameSimulation['snapshot']>;
export class NeonArenaEngine {
  readonly simulation = new GameSimulation();
  private renderer!: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(48, 1, .1, 220);
  private reactor = new THREE.Group(); private drone = new THREE.Group();
  private enemies!: THREE.InstancedMesh; private spikes!: THREE.InstancedMesh;
  private shock!: THREE.Mesh; private beams!: THREE.LineSegments; private sparks!: THREE.Points;
  private beamHalo!: THREE.InstancedMesh; private coreLight!: THREE.PointLight;
  private energy!: THREE.Points;
  private cameraHome = new THREE.Vector3(); private color = new THREE.Color();
  private beamStart = new THREE.Vector3(); private beamEnd = new THREE.Vector3();
  private beamDirection = new THREE.Vector3(); private up = new THREE.Vector3(0, 1, 0);
  private composer?: EffectComposer; private bloom?: UnrealBloomPass;
  private observer?: ResizeObserver; private cleanup: (() => void)[] = [];
  private geometries = new Set<THREE.BufferGeometry>(); private materials = new Set<THREE.Material>();
  private raf = 0; private disposed = false; private lastTime = 0; private publishAt = 0;
  private clock = new FixedClock(); private dummy = new THREE.Object3D();
  private ray = new THREE.Raycaster(); private plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -.7);
  private point = new THREE.Vector3(); private pointer = new THREE.Vector2();
  private keys = new Set<string>(); private activePointer: number | null = null;
  private low: boolean; private reduced: boolean; private previousHealth: number = CONFIG.health;
  private publishedPhase = 'LOADING';
  private badFrames = 0; private resolution = 1;
  constructor(private host: HTMLDivElement, private notify: (snapshot: Snapshot) => void, private fail: (message: string) => void) {
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.low = matchMedia('(pointer: coarse)').matches || this.reduced;
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl2', { antialias: !this.low, alpha: false });
      if (!context) throw new Error('WebGL 2 no está disponible. Probá activar la aceleración gráfica o usar otro navegador.');
      this.renderer = new THREE.WebGLRenderer({ canvas, context, antialias: !this.low });
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1;
      canvas.setAttribute('aria-label', 'Arena 3D. Arrastrá para mover el dron; flechas o WASD; espacio para Shockwave.');
      canvas.tabIndex = 0;
      host.append(canvas);
      this.build();
      if (!this.low) {
        try {
          this.composer = new EffectComposer(this.renderer);
          this.composer.addPass(new RenderPass(this.scene, this.camera));
          this.bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), .32, .22, 1.6);
          this.composer.addPass(this.bloom); this.composer.addPass(new OutputPass());
        } catch { this.disposeComposer(); }
      }
      this.bind(canvas);
      this.observer = new ResizeObserver(() => this.resize()); this.observer.observe(host); this.resize();
      this.simulation.ready(); this.notify(this.simulation.snapshot());
      this.raf = requestAnimationFrame(this.frame);
    } catch (error) {
      this.dispose(); throw error;
    }
  }
  private geo<T extends THREE.BufferGeometry>(g: T) { this.geometries.add(g); return g; }
  private mat<T extends THREE.Material>(m: T) { this.materials.add(m); return m; }
  private metal(color: number, emissive = 0, intensity = 0) {
    return this.mat(new THREE.MeshStandardMaterial({ color, metalness: .38, roughness: .42, emissive, emissiveIntensity: intensity }));
  }
  private mesh(g: THREE.BufferGeometry, m: THREE.Material, parent: THREE.Object3D, x = 0, y = 0, z = 0) {
    const mesh = new THREE.Mesh(g, m); mesh.position.set(x, y, z); parent.add(mesh); return mesh;
  }
  private build() {
    this.scene.background = new THREE.Color(0x030711); this.scene.fog = new THREE.FogExp2(0x06142d, .012);
    this.scene.add(new THREE.HemisphereLight(0x80cfff, 0x151030, 1.5));
    const moon = new THREE.DirectionalLight(0x8bbdff, 3.2); moon.position.set(-15, 28, 10); this.scene.add(moon);
    this.coreLight = new THREE.PointLight(0x00f3ff, 22, 28, 1.6); this.coreLight.position.set(0, 5, 0); this.scene.add(this.coreLight);
    const rim = new THREE.PointLight(0xff00dd, 70, 42, 1.8); rim.position.set(-19, 8, -18); this.scene.add(rim);
    const steel = this.metal(0x152c44), dark = this.metal(0x081322), light = this.metal(0x345670);
    const cyan = this.metal(0x79eaff, 0x00f3ff, 1.6), blue = this.metal(0x168bff, 0x168bff, 1.2);
    const red = this.metal(0xff234b, 0xff1744, 1.6);
    const box = this.geo(new THREE.BoxGeometry(1, 1, 1));
    const base = this.mesh(box, dark, this.scene, 0, -1.2, 0); base.scale.set(34, 2, 34);
    // Individually raised floor tiles, shared geometry/material and a single draw call.
    const panels = new THREE.InstancedMesh(box, steel, 100); this.scene.add(panels);
    const insets = new THREE.InstancedMesh(box, light, 200); this.scene.add(insets);
    for (let i = 0; i < 100; i++) {
      this.dummy.position.set((i % 10 - 4.5) * 3.2, -.12, (Math.floor(i / 10) - 4.5) * 3.2);
      this.dummy.scale.set(3.08, .24, 3.08); this.dummy.updateMatrix(); panels.setMatrixAt(i, this.dummy.matrix);
      for (let j = 0; j < 2; j++) {
        this.dummy.position.set((i % 10 - 4.5) * 3.2 - 1.1, .045, (Math.floor(i / 10) - 4.5) * 3.2 - .7 + j * .4);
        this.dummy.scale.set(.35, .09, .12); this.dummy.updateMatrix(); insets.setMatrixAt(i * 2 + j, this.dummy.matrix);
      }
    }
    const grid = new THREE.GridHelper(32, 10, 0x00c8e8, 0x163c54); grid.position.y = .02;
    this.geometries.add(grid.geometry); (Array.isArray(grid.material) ? grid.material : [grid.material]).forEach(m => this.materials.add(m)); this.scene.add(grid);
    for (let i = 0; i < 4; i++) {
      const edge = new THREE.Group(); edge.rotation.y = i * Math.PI / 2; this.scene.add(edge);
      const rail = this.mesh(box, light, edge, 0, .4, -16.5); rail.scale.set(33, .8, .6);
      const strip = this.mesh(box, cyan, edge, 0, .85, -16.5); strip.scale.set(32, .07, .13);
      for (let j = -1; j <= 1; j++) {
        const pylon = this.mesh(box, steel, edge, j * 12, 1.1, -16.2); pylon.scale.set(1.3, 2.2, 1.3);
        const cap = this.mesh(box, blue, edge, j * 12, 2.2, -16.2); cap.scale.set(.9, .15, .9);
      }
      const conduit = this.mesh(box, cyan, edge, 0, .1, -9); conduit.scale.set(.12, .04, 13);
    }
    // Deterministic city skyline, instanced buildings and luminous facades.
    const city = new THREE.InstancedMesh(box, dark, 80), windows = new THREE.InstancedMesh(box, blue, 240);
    this.scene.add(city, windows);
    for (let i = 0; i < 80; i++) {
      const a = i * 2.39996, r = 36 + (i % 5) * 7, h = 5 + (i * 17 % 23);
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      this.dummy.position.set(x, h / 2 - 4, z); this.dummy.scale.set(2 + i % 3, h, 2.5); this.dummy.updateMatrix(); city.setMatrixAt(i, this.dummy.matrix);
      for (let j = 0; j < 3; j++) {
        this.dummy.position.set(x, h * (.22 + j * .22) - 4, z + 1.27);
        this.dummy.scale.set(1.6, .15, .07); this.dummy.updateMatrix(); windows.setMatrixAt(i * 3 + j, this.dummy.matrix);
      }
      if (i % 8 === 0) {
        const antenna = this.mesh(box, light, this.scene, x, h - 2, z); antenna.scale.set(.12, 5, .12);
        this.mesh(this.geo(new THREE.OctahedronGeometry(.4)), red, this.scene, x, h + .5, z);
        const holo = this.mesh(this.geo(new THREE.PlaneGeometry(2.2, 3.4)), this.mat(new THREE.MeshBasicMaterial({ color: i % 16 ? 0x168bff : 0xff00dd, transparent: true, opacity: .24, side: THREE.DoubleSide, depthWrite: false })), this.scene, x, h * .7, z + 1.35);
        holo.rotation.z = .12;
        const bridge = this.mesh(box, light, this.scene, x + 3, 1.5, z); bridge.scale.set(6, .25, .7);
      }
    }
    this.scene.add(this.reactor);
    this.mesh(this.geo(new THREE.CylinderGeometry(3.3, 3.7, .7, 12)), steel, this.reactor, 0, .4);
    this.mesh(this.geo(new THREE.CylinderGeometry(2.2, 2.8, 1, 12)), light, this.reactor, 0, 1);
    this.mesh(this.geo(new THREE.CylinderGeometry(.75, 1, 3.6, 16)), cyan, this.reactor, 0, 3);
    this.mesh(this.geo(new THREE.IcosahedronGeometry(1.1, 1)), cyan, this.reactor, 0, 3.3).userData.core = true;
    const torus = this.geo(new THREE.TorusGeometry(2.1, .09, 8, 48));
    for (let i = 0; i < 4; i++) {
      const ring = this.mesh(torus, i % 2 ? cyan : blue, this.reactor, 0, 1.7 + i * .9);
      ring.rotation.x = Math.PI / 2 + (i === 2 ? .3 : 0); ring.userData.orbit = i + 1;
    }
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2;
      const coil = this.mesh(box, steel, this.reactor, Math.cos(a) * 2.1, 2.1, Math.sin(a) * 2.1);
      coil.scale.set(.45, 3.4, .65); coil.rotation.y = -a;
      const segment = this.mesh(box, cyan, this.reactor, Math.cos(a) * 2.35, 1, Math.sin(a) * 2.35);
      segment.scale.set(.15, .8, .4); segment.rotation.y = -a;
    }
    this.scene.add(this.drone);
    this.mesh(this.geo(new THREE.OctahedronGeometry(.6)), cyan, this.drone);
    const body = this.mesh(box, light, this.drone); body.scale.set(1.8, .25, .8);
    for (const x of [-.9, .9]) {
      const thruster = this.mesh(this.geo(new THREE.TorusGeometry(.32, .09, 6, 16)), blue, this.drone, x, 0, 0); thruster.rotation.x = Math.PI / 2;
    }
    this.enemies = new THREE.InstancedMesh(this.geo(new THREE.IcosahedronGeometry(1, 0)), red, CONFIG.maxEnemies);
    this.spikes = new THREE.InstancedMesh(this.geo(new THREE.OctahedronGeometry(1)), red, CONFIG.maxEnemies * 3);
    this.enemies.instanceMatrix.setUsage(THREE.DynamicDrawUsage); this.spikes.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.enemies.frustumCulled = false; this.spikes.frustumCulled = false; this.scene.add(this.enemies, this.spikes);
    this.shock = this.mesh(this.geo(new THREE.TorusGeometry(1, .045, 6, 96)), cyan, this.scene); this.shock.rotation.x = Math.PI / 2; this.shock.visible = false;
    const beamGeo = this.geo(new THREE.BufferGeometry()); beamGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(CONFIG.maxEvents * 6), 3));
    this.beams = new THREE.LineSegments(beamGeo, this.mat(new THREE.LineBasicMaterial({ color: 0xbfffff, transparent: true, opacity: .95 })));
    this.beams.frustumCulled = false; this.scene.add(this.beams);
    this.beamHalo = new THREE.InstancedMesh(this.geo(new THREE.CylinderGeometry(.045, .045, 1, 6)), this.mat(new THREE.MeshBasicMaterial({ color: 0x00f3ff, transparent: true, opacity: .35, blending: THREE.AdditiveBlending, depthWrite: false })), CONFIG.maxEvents);
    this.beamHalo.instanceMatrix.setUsage(THREE.DynamicDrawUsage); this.beamHalo.frustumCulled = false; this.scene.add(this.beamHalo);
    const sparkGeo = this.geo(new THREE.BufferGeometry()); sparkGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(CONFIG.maxEvents * 8 * 3), 3));
    this.sparks = new THREE.Points(sparkGeo, this.mat(new THREE.PointsMaterial({ color: 0x00f3ff, size: .14, transparent: true, opacity: .8, blending: THREE.AdditiveBlending, depthWrite: false })));
    this.sparks.frustumCulled = false; this.scene.add(this.sparks);
    const energyGeo = this.geo(new THREE.BufferGeometry()); energyGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(48 * 3), 3));
    this.energy = new THREE.Points(energyGeo, this.mat(new THREE.PointsMaterial({ color: 0x7afaff, size: .075, transparent: true, opacity: .65, blending: THREE.AdditiveBlending, depthWrite: false })));
    this.energy.frustumCulled = false; this.energy.visible = !this.reduced; this.scene.add(this.energy);
  }
  private bind(canvas: HTMLCanvasElement) {
    const listen = (target: EventTarget, name: string, fn: EventListener) => {
      target.addEventListener(name, fn); this.cleanup.push(() => target.removeEventListener(name, fn));
    };
    const aim = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect(); if (!rect.width || !rect.height) return;
      this.pointer.set((e.clientX - rect.left) / rect.width * 2 - 1, -(e.clientY - rect.top) / rect.height * 2 + 1);
      this.ray.setFromCamera(this.pointer, this.camera);
      if (this.ray.ray.intersectPlane(this.plane, this.point)) this.simulation.move(this.point.x, this.point.z);
    };
    listen(canvas, 'pointerdown', ((e: PointerEvent) => {
      if (this.simulation.phase !== 'PLAYING' || this.activePointer !== null) return;
      this.activePointer = e.pointerId; canvas.focus({ preventScroll: true }); canvas.setPointerCapture(e.pointerId); aim(e);
    }) as EventListener);
    listen(canvas, 'pointermove', ((e: PointerEvent) => { if (this.activePointer === e.pointerId) aim(e); }) as EventListener);
    const release = () => { if (this.activePointer !== null && canvas.hasPointerCapture(this.activePointer)) canvas.releasePointerCapture(this.activePointer); this.activePointer = null; };
    for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) listen(canvas, name, release);
    this.cleanup.push(release);
    listen(canvas, 'keydown', ((e: KeyboardEvent) => {
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', ' ', 'p'].includes(e.key)) return;
      e.preventDefault(); this.keys.add(e.key);
      if (e.repeat) return;
      if (e.key === ' ') this.simulation.shock();
      if (e.key === 'p') this.togglePause();
    }) as EventListener);
    listen(canvas, 'keyup', ((e: KeyboardEvent) => { this.keys.delete(e.key); }) as EventListener);
    listen(canvas, 'blur', () => { this.keys.clear(); });
    listen(window, 'blur', () => { this.pause(); release(); });
    listen(document, 'visibilitychange', () => {
      if (document.hidden) this.pause();
      this.lastTime = 0; this.clock.reset();
    });
    listen(canvas, 'webglcontextlost', ((e: Event) => {
      e.preventDefault(); this.simulation.transition('ERROR'); cancelAnimationFrame(this.raf);
      this.keys.clear(); release(); this.fail('Se perdió el contexto gráfico. Reiniciá la escena para volver a jugar.');
    }) as EventListener);
  }
  private resize() {
    if (this.disposed) return;
    const w = Math.max(1, this.host.clientWidth), h = Math.max(1, this.host.clientHeight);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, this.low ? 1.25 : 1.75) * this.resolution);
    this.renderer.setSize(w, h); this.camera.aspect = w / h;
    const distance = Math.max(45, 38 / Math.min(1, this.camera.aspect));
    this.cameraHome.set(0, distance * .82, distance * .66);
    this.camera.position.copy(this.cameraHome); this.camera.lookAt(0, 0, 0); this.camera.updateProjectionMatrix(); this.camera.updateMatrixWorld();
    if (this.composer) { this.composer.setPixelRatio(this.renderer.getPixelRatio()); this.composer.setSize(w, h); }
  }
  start() { this.simulation.start(); this.resetClock(); this.renderer.domElement.focus({ preventScroll: true }); }
  pause() { this.simulation.pause(); this.keys.clear(); this.resetClock(); }
  togglePause() { this.simulation.phase === 'PAUSED' ? this.simulation.resume() : this.simulation.pause(); this.keys.clear(); this.resetClock(); }
  private resetClock() { this.lastTime = 0; this.clock.reset(); this.notify(this.simulation.snapshot()); }
  private frame = (time: number) => {
    if (this.disposed) return;
    try {
      const delta = this.lastTime ? (time - this.lastTime) / 1000 : 0; this.lastTime = time;
      if (document.hidden) { this.clock.reset(); this.raf = requestAnimationFrame(this.frame); return; }
      if (delta > .028) this.badFrames++; else this.badFrames = Math.max(0, this.badFrames - 1);
      if (this.badFrames > 100 && this.resolution > .65) { this.resolution *= .8; this.disposeComposer(); this.resize(); this.badFrames = 0; }
      const s = this.simulation;
      this.clock.advance(delta, () => {
        const x = Number(this.keys.has('d') || this.keys.has('ArrowRight')) - Number(this.keys.has('a') || this.keys.has('ArrowLeft'));
        const z = Number(this.keys.has('s') || this.keys.has('ArrowDown')) - Number(this.keys.has('w') || this.keys.has('ArrowUp'));
        if (x || z) s.move(s.drone.x + x, s.drone.z + z);
        s.step();
      });
      this.draw();
      if (time - this.publishAt > 100 || s.health !== this.previousHealth || s.phase !== this.publishedPhase) {
        this.publishAt = time; this.previousHealth = s.health; this.publishedPhase = s.phase; this.notify(s.snapshot());
      }
      this.raf = requestAnimationFrame(this.frame);
    } catch (error) {
      this.simulation.transition('ERROR'); this.fail(error instanceof Error ? error.message : 'Error de renderizado');
    }
  };
  private draw() {
    const s = this.simulation, t = s.elapsed;
    const impact = s.events.find(e => e.kind === 'impact' && e.age < .25);
    this.coreLight.color.setHex(impact || s.health <= 25 ? 0xff1744 : 0x00f3ff);
    this.camera.position.copy(this.cameraHome);
    if (impact && !this.reduced) this.camera.position.x += Math.sin(impact.age * 95) * (.25 - impact.age) * .8;
    this.drone.position.set(s.drone.x, 1.4 + (this.reduced ? 0 : Math.sin(t * 5) * .1), s.drone.z);
    this.drone.rotation.y = t * .7;
    for (const child of this.reactor.children) {
      if (child.userData.orbit && !this.reduced) child.rotation.z = t * .2 * child.userData.orbit;
      if (child.userData.core) child.scale.setScalar(this.reduced ? 1 : 1 + Math.sin(t * 3) * .06 + (impact ? .15 : 0));
    }
    let count = 0, spikeCount = 0;
    for (const e of s.enemies) {
      const scale = e.radius * (e.state === 'DYING' ? Math.max(0, 1 - e.age / .28) : e.state === 'SPAWNING' ? Math.min(1, e.age / .35) : 1);
      this.dummy.position.set(e.x, .8, e.z); this.dummy.rotation.set(t * .5, e.id + t, 0);
      this.dummy.scale.setScalar(scale); this.dummy.updateMatrix(); this.enemies.setMatrixAt(count, this.dummy.matrix);
      this.enemies.setColorAt(count, this.color.setHex(e.kind === 'elite' ? 0xff50cc : e.kind === 'brute' ? 0xff6644 : 0xff1744)); count++;
      for (let j = 0; j < 3; j++) {
        this.dummy.rotation.set(0, j * Math.PI / 3 + t, j * Math.PI / 3);
        this.dummy.scale.set(scale * .35, scale * (e.kind === 'brute' ? 1.5 : 2), scale * .35);
        this.dummy.updateMatrix(); this.spikes.setMatrixAt(spikeCount++, this.dummy.matrix);
      }
    }
    this.enemies.count = count; this.enemies.instanceMatrix.needsUpdate = true;
    if (this.enemies.instanceColor) this.enemies.instanceColor.needsUpdate = true;
    this.spikes.count = spikeCount; this.spikes.instanceMatrix.needsUpdate = true;
    this.shock.visible = s.shockAge >= 0; this.shock.position.set(s.shockOrigin.x, .3, s.shockOrigin.z); this.shock.scale.setScalar(Math.max(.01, s.shockRadius));
    const beam = this.beams.geometry.getAttribute('position') as THREE.BufferAttribute;
    const spark = this.sparks.geometry.getAttribute('position') as THREE.BufferAttribute;
    if (!this.reduced) {
      const energy = this.energy.geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < 48; i++) {
        const height = (i * .17 + t * 1.8) % 7, angle = i * 2.39996 + t * .6;
        energy.setXYZ(i, Math.cos(angle) * (1 + height * .05), height + 1, Math.sin(angle) * (1 + height * .05));
      }
      energy.needsUpdate = true;
    }
    let b = 0, p = 0, halos = 0;
    for (const e of s.events) {
      if (e.kind === 'beam' && e.age < .09) {
        beam.setXYZ(b++, e.x, 1.4, e.z); beam.setXYZ(b++, e.toX!, .9, e.toZ!);
        this.beamStart.set(e.x, 1.4, e.z); this.beamEnd.set(e.toX!, .9, e.toZ!);
        this.beamDirection.subVectors(this.beamEnd, this.beamStart);
        this.dummy.position.copy(this.beamStart).add(this.beamEnd).multiplyScalar(.5);
        this.dummy.scale.set(1, this.beamDirection.length(), 1);
        this.dummy.quaternion.setFromUnitVectors(this.up, this.beamDirection.normalize());
        this.dummy.updateMatrix(); this.beamHalo.setMatrixAt(halos++, this.dummy.matrix);
      }
      if (!this.reduced) {
        for (let j = 0; j < 8; j++) {
          const a = j * Math.PI / 4, r = e.age * 5;
          spark.setXYZ(p++, (e.toX ?? e.x) + Math.cos(a) * r, .6 + Math.sin(e.age * 5) * (j % 3), (e.toZ ?? e.z) + Math.sin(a) * r);
        }
      }
    }
    beam.needsUpdate = true; spark.needsUpdate = true;
    this.beamHalo.count = halos; this.beamHalo.instanceMatrix.needsUpdate = true;
    this.beams.geometry.setDrawRange(0, b); this.sparks.geometry.setDrawRange(0, p);
    if (this.composer) {
      try { this.composer.render(); } catch { this.disposeComposer(); this.renderer.render(this.scene, this.camera); }
    } else this.renderer.render(this.scene, this.camera);
  }
  private disposeComposer() {
    if (!this.composer) return;
    for (const pass of this.composer.passes) pass.dispose(); this.composer.dispose(); this.composer = undefined;
  }
  dispose() {
    if (this.disposed) return; this.disposed = true;
    cancelAnimationFrame(this.raf); this.observer?.disconnect(); this.cleanup.reverse().forEach(fn => fn()); this.cleanup = [];
    this.keys.clear(); this.simulation.dispose(); this.disposeComposer();
    this.geometries.forEach(g => g.dispose()); this.materials.forEach(m => m.dispose());
    this.scene.traverse(node => { if (node instanceof THREE.InstancedMesh) node.dispose(); });
    this.scene.clear();
    if (this.renderer) { this.renderer.dispose(); this.renderer.forceContextLoss(); this.renderer.domElement.remove(); }
  }
}
