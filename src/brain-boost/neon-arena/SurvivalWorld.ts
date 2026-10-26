import * as THREE from 'three';
import { CONFIG, type GameSimulation } from './GameSimulation';
import { splitViewports, type Viewport } from './LocalControls';
import { LEGACY_ARENA, type ArenaDefinition } from './ArenaDefinition';

/** All world geometry is shared or instanced; combat is read-only here. */
export class SurvivalWorld {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.OrthographicCamera(-22, 22, 22, -22, .1, 130);
  readonly cameras = [this.camera, this.camera.clone()];
  viewports: Viewport[] = [{ x: 0, y: 0, width: 1, height: 1 }];
  private geometries = new Set<THREE.BufferGeometry>(); private materials = new Set<THREE.Material>(); private textures = new Set<THREE.Texture>();
  private dummy = new THREE.Object3D(); private color = new THREE.Color(); private marine = new THREE.Group();
  private floorMaterial!: THREE.MeshStandardMaterial; private mapPhase = -1;
  private gun = new THREE.Group(); private boots: THREE.Mesh[] = []; private suit!: THREE.MeshStandardMaterial;
  private body!: THREE.InstancedMesh; private heads!: THREE.InstancedMesh; private legs!: THREE.InstancedMesh; private plates!: THREE.InstancedMesh;
  private bossParts!: THREE.InstancedMesh;
  private thoraxes!: THREE.InstancedMesh; private feelers!: THREE.InstancedMesh; private eyes!: THREE.InstancedMesh; private elytra!: THREE.InstancedMesh; private cores!: THREE.InstancedMesh; private fangs!: THREE.InstancedMesh; private spines!: THREE.InstancedMesh; private sacs!: THREE.InstancedMesh; private reticles!: THREE.InstancedMesh; private fragments!: THREE.InstancedMesh;
  private items!: THREE.InstancedMesh; private crosses!: THREE.InstancedMesh; private dropMedkits!: THREE.InstancedMesh; private dropArmor!: THREE.InstancedMesh; private dropAmmo!: THREE.InstancedMesh; private dropGrenades!: THREE.InstancedMesh; private bullets!: THREE.InstancedMesh; private warnings!: THREE.InstancedMesh;
  private stains!: THREE.InstancedMesh; private enemyShadows!: THREE.InstancedMesh; private blasts!: THREE.InstancedMesh; private trails!: THREE.LineSegments; private flame!: THREE.Group; private shock!: THREE.Mesh;
  private torch = new THREE.PointLight(0xbde9cf, 12, 14, 1.8); private flash = new THREE.PointLight(0xff9c35, 0, 9, 2);
  private lastTime = 0; private steam!: THREE.Points; private contact!: THREE.InstancedMesh;
  private contamination!: THREE.InstancedMesh; private roots!: THREE.InstancedMesh; private eggs!: THREE.InstancedMesh;
  private frames = Array.from({ length: 2 }, () => ({ width: 44, height: 44, follow: new THREE.Vector2(), lastPlayer: new THREE.Vector2(0, 3) }));
  private marineViews: { body: THREE.Group; gun: THREE.Group; boots: THREE.Mesh[]; suit: THREE.MeshStandardMaterial; torch: THREE.PointLight; flash: THREE.PointLight; flame: THREE.Group; shock: THREE.Mesh }[] = [];
  private corpses: { x: number; z: number; born: number; id: number }[] = []; private lastEvent = 0;
  private remains = true; private followTarget = new THREE.Vector2();
  private up = new THREE.Vector3(0, 1, 0); private flameAxis = new THREE.Vector3();
  constructor(private reduced: boolean, private arena: ArenaDefinition = LEGACY_ARENA) { this.build(); }
  private geo<T extends THREE.BufferGeometry>(g: T) { this.geometries.add(g); return g; }
  private mat<T extends THREE.Material>(m: T) { this.materials.add(m); return m; }
  private standard(color: number, emissive = 0, intensity = 0) { return this.mat(new THREE.MeshStandardMaterial({ color, roughness: .8, metalness: .12, emissive, emissiveIntensity: intensity })); }
  private mesh(g: THREE.BufferGeometry, m: THREE.Material, parent: THREE.Object3D, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) {
    const mesh = new THREE.Mesh(g, m); mesh.position.set(x, y, z); mesh.scale.set(sx, sy, sz); parent.add(mesh); return mesh;
  }
  private pool(g: THREE.BufferGeometry, m: THREE.Material, count: number) { const pool = new THREE.InstancedMesh(g, m, count); pool.instanceMatrix.setUsage(THREE.DynamicDrawUsage); pool.frustumCulled = false; pool.count = 0; this.scene.add(pool); return pool; }
  private instance(pool: THREE.InstancedMesh, i: number, x: number, y: number, z: number, sx: number, sy: number, sz: number, angle = 0, tilt = 0) {
    this.dummy.position.set(x, y, z); this.dummy.rotation.set(tilt, angle, 0); this.dummy.scale.set(sx, sy, sz); this.dummy.updateMatrix(); pool.setMatrixAt(i, this.dummy.matrix);
  }
  private groundTextures() {
    const size = 512, canvas = document.createElement('canvas'); canvas.width = canvas.height = size; const ctx = canvas.getContext('2d')!;
    let seed = 8192; const random = () => { seed = Math.imul(seed, 1664525) + 1013904223 | 0; return (seed >>> 0) / 4294967296; };
    ctx.fillStyle = '#273338'; ctx.fillRect(0, 0, size, size);
    for (let row = 0; row < 4; row++) for (let col = 0; col < 4; col++) {
      const x = col * 128, y = row * 128, shade = 34 + Math.floor(random() * 9);
      ctx.fillStyle = `rgb(${shade},${shade + 10},${shade + 13})`; ctx.fillRect(x + 3, y + 3, 122, 122);
      ctx.strokeStyle = '#142025'; ctx.lineWidth = 3; ctx.strokeRect(x + 2, y + 2, 124, 124);
      ctx.strokeStyle = '#4a595b'; ctx.lineWidth = 1; ctx.strokeRect(x + 5, y + 5, 118, 118);
      for (const dx of [11, 117]) for (const dy of [11, 117]) { ctx.fillStyle = '#10191d'; ctx.beginPath(); ctx.arc(x + dx, y + dy, 2, 0, 7); ctx.fill(); ctx.fillStyle = '#67716c'; ctx.fillRect(x + dx, y + dy - 1, 1, 1); }
      if ((row + col) % 3 === 0) { ctx.fillStyle = '#5c5938'; ctx.fillRect(x + 18, y + 17, 35, 3); ctx.fillStyle = '#171e20'; for (let i = 0; i < 7; i++) ctx.fillRect(x + 20 + i * 5, y + 17, 2, 3); }
    }
    for (let i = 0; i < 22000; i++) { const v = Math.floor(random() * 40); ctx.fillStyle = `rgba(${65 + v},${61 + v},${50 + v},.09)`; ctx.fillRect(random() * size, random() * size, 1, 1 + random() * 3); }
    ctx.strokeStyle = '#69634b33'; ctx.lineWidth = .5;
    for (let i = 0; i < 180; i++) { const x = random() * size, y = random() * size; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + random() * 24, y + random() * 8); ctx.stroke(); }
    const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace;
    const normals = new Uint8Array(size * size * 4), rough = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4, seamX = x % 128, seamY = y % 128;
      normals[i] = seamX < 4 ? 90 : seamX > 123 ? 165 : 127 + Math.floor(random() * 4);
      normals[i + 1] = seamY < 4 ? 90 : seamY > 123 ? 165 : 127 + Math.floor(random() * 4); normals[i + 2] = 248; normals[i + 3] = 255;
      rough[i] = rough[i + 1] = rough[i + 2] = seamX < 6 || seamY < 6 ? 235 : 155 + Math.floor(random() * 50); rough[i + 3] = 255;
    }
    const normalMap = new THREE.DataTexture(normals, size, size), roughnessMap = new THREE.DataTexture(rough, size, size);
    for (const texture of [map, normalMap, roughnessMap]) { texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(7, 7); texture.minFilter = THREE.LinearMipmapLinearFilter; texture.magFilter = THREE.LinearFilter; texture.generateMipmaps = true; texture.needsUpdate = true; this.textures.add(texture); }
    return { map, normalMap, roughnessMap };
  }
  private build() {
    this.scene.background = new THREE.Color(0x03090f); this.scene.fog = new THREE.FogExp2(0x06111a, .008);
    this.scene.add(new THREE.HemisphereLight(0xa9c9d7, 0x202a24, 1.6));
    const key = new THREE.DirectionalLight(0xc2e4f5, 2.6); key.position.set(-12, 30, 9); this.scene.add(key, this.torch, this.flash);
    const box = this.geo(new THREE.BoxGeometry(1, 1, 1)), sphere = this.geo(new THREE.SphereGeometry(1, 10, 7));
    const shell = this.standard(0xffffff), olive = this.standard(0x5d6733), metal = this.standard(0x3b4c49), dark = this.standard(0x17221b);
    const cyan = this.standard(0x88e7ff, 0x00bfff, .8), amber = this.standard(0xffc86c, 0xff6313, 1);
    const floor = this.mat(new THREE.MeshStandardMaterial({ ...this.groundTextures(), color: 0x98acb0, roughness: .92, metalness: .22, normalScale: new THREE.Vector2(.45, .45) }));
    this.floorMaterial = floor;
    const ground = this.mesh(this.geo(new THREE.PlaneGeometry(this.arena.floorSize, this.arena.floorSize)), floor, this.scene); ground.rotation.x = -Math.PI / 2;
    const rubble = this.pool(this.geo(new THREE.IcosahedronGeometry(1, 0)), olive, 420);
    for (let i = 0; i < 420; i++) {
      const a = i * 2.39996;
      const boundary = i < 240, side = i % 4, along = (Math.floor(i / 4) / 59 * 2 - 1) * this.arena.wall;
      const x = boundary ? side === 0 || side === 2 ? along : (side === 1 ? 1 : -1) * (this.arena.wall + .6) : (this.arena.obstacles[i % 6].x + Math.cos(a) * (1.9 + i % 4 * .12));
      const z = boundary ? side === 1 || side === 3 ? along : (side === 2 ? 1 : -1) * (this.arena.wall + .6) : (this.arena.obstacles[i % 6].z + Math.sin(a) * (1.9 + i % 4 * .12));
      const scale = boundary ? .5 + i % 7 * .14 : .08 + i % 5 * .035;
      this.instance(rubble, i, x, boundary ? .4 : .04, z, scale, boundary ? scale : .08, scale, a);
    }
    rubble.count = 420; rubble.instanceMatrix.needsUpdate = true;
    const ribs = this.pool(box, this.standard(0x42535d), 80), lamps = this.pool(box, this.standard(0xffffff, 0x589cac, .7), 80);
    const wallDistance = this.arena.wall;
    for (let i = 0; i < 4; i++) {
      const wall = new THREE.Group(); wall.rotation.y = i * Math.PI / 2; this.scene.add(wall);
      this.mesh(box, metal, wall, 0, .9, -wallDistance, wallDistance * 2, 1.8, this.arena.wallThickness);
      const pipe = this.mesh(this.geo(new THREE.CylinderGeometry(.18, .18, wallDistance * 2, 8)), dark, wall, 0, 1.3, -wallDistance + .65); pipe.rotation.z = Math.PI / 2;
      for (let j = 0; j < 20; j++) {
        const x = -wallDistance + 1.2 + j * (wallDistance * 2 - 2.4) / 19, n = i * 20 + j, angle = i * Math.PI / 2;
        const wx = Math.cos(angle) * x - Math.sin(angle) * wallDistance, wz = -Math.sin(angle) * x - Math.cos(angle) * wallDistance;
        this.instance(ribs, n, wx, 1.35, wz, .28, 2.7, 1.05, angle);
        this.instance(lamps, n, wx, 2.7, wz, .15, .12, .7, angle); lamps.setColorAt(n, this.color.setHex(j % 5 ? 0x62b8cc : 0xe8a64f));
      }
    }
    this.finish(ribs, 80); this.finish(lamps, 80, true);
    const vents = this.pool(box, this.standard(0x445158), 48), slots = this.pool(box, this.standard(0x0b161a), 192);
    for (let i = 0; i < 48; i++) {
      const side = i % 4, a = side * Math.PI / 2, offset = (Math.floor(i / 4) - 5.5) * 4.1;
      const x = Math.cos(a) * offset - Math.sin(a) * (wallDistance + 1), z = -Math.sin(a) * offset - Math.cos(a) * (wallDistance + 1);
      this.instance(vents, i, x, .8, z, 2.3, 1.6, 1.2, a);
      for (let j = 0; j < 4; j++) this.instance(slots, i * 4 + j, x + Math.cos(a) * (j - 1.5) * .4, 1.62, z - Math.sin(a) * (j - 1.5) * .4, .17, .025, .8, a);
    }
    this.finish(vents, 48); this.finish(slots, 192);
    const membrane = this.pool(sphere, this.standard(0x435533, 0x1d300d, .15), 90);
    for (let i = 0; i < 90; i++) {
      const side = i % 4, a = side * Math.PI / 2, along = Math.sin(i * 12.7) * (wallDistance - 1), inward = 1.3 + i % 4 * .3;
      const x = Math.cos(a) * along - Math.sin(a) * (wallDistance - inward), z = -Math.sin(a) * along - Math.cos(a) * (wallDistance - inward);
      this.instance(membrane, i, x, .035, z, .5 + i % 4 * .4, .06, .4 + i % 5 * .3, i);
    }
    this.finish(membrane, 90);
    // Organic sectors stay low and peripheral so they add material variety
    // without hiding advancing enemies or changing the logical arena.
    const contamination = this.pool(this.geo(new THREE.CircleGeometry(1, 18)), this.mat(new THREE.MeshBasicMaterial({ color: 0x18351f, transparent: true, opacity: .42, depthWrite: false })), 18);
    const roots = this.pool(box, this.standard(0x263a25, 0x153f25, .16), 48);
    const eggs = this.pool(this.geo(new THREE.SphereGeometry(1, 8, 5)), this.standard(0x526d3b, 0x2a521f, .28), 24);
    for (let i = 0; i < 18; i++) {
      const side = i % 4, a = side * Math.PI / 2, along = (Math.floor(i / 4) - 1.5) * 5.1;
      const x = Math.cos(a) * along - Math.sin(a) * (wallDistance - 2.1), z = -Math.sin(a) * along - Math.cos(a) * (wallDistance - 2.1);
      this.instance(contamination, i, x, .022, z, 1.2 + i % 3 * .35, 1.2 + i % 3 * .35, 1, a + .2, -Math.PI / 2);
      for (let j = 0; j < 2; j++) {
        const n = i * 2 + j, offset = (j ? 1 : -1) * (.28 + i % 3 * .08);
        this.instance(roots, n, x + Math.cos(a) * offset, .1, z - Math.sin(a) * offset, .11 + i % 2 * .04, .16 + j * .1, .72 + i % 3 * .15, a + (j ? .5 : -.5), j ? -.18 : .18);
      }
    }
    for (let i = 0; i < 24; i++) {
      const o = this.arena.obstacles[i % this.arena.obstacles.length], a = i * 2.39996, radius = o.radius + 1.8 + (i % 3) * .25;
      this.instance(eggs, i, o.x + Math.cos(a) * radius, .16 + i % 2 * .04, o.z + Math.sin(a) * radius, .16 + i % 3 * .05, .22 + i % 2 * .06, .16 + i % 3 * .04, a);
      eggs.setColorAt(i, this.color.setHex(i % 4 === 0 ? 0x7a9b48 : 0x4b6739));
    }
    this.finish(contamination, 18); this.finish(roots, 48); this.finish(eggs, 24, true);
    this.contamination = contamination; this.roots = roots; this.eggs = eggs;
    this.contact = this.pool(this.geo(new THREE.CircleGeometry(1, 24)), this.mat(new THREE.MeshBasicMaterial({ color: 0x020709, transparent: true, opacity: .4, depthWrite: false })), this.arena.obstacles.length + 2);
    const steamGeometry = this.geo(new THREE.BufferGeometry()); steamGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(32 * 3), 3));
    this.steam = new THREE.Points(steamGeometry, this.mat(new THREE.PointsMaterial({ color: 0x92c1c7, size: .55, transparent: true, opacity: .12, depthWrite: false, sizeAttenuation: true }))); this.steam.frustumCulled = false; this.scene.add(this.steam);
    // Circular generator bases match the simulation's cover exactly; fittings stay inside.
    const pedestal = this.geo(new THREE.CylinderGeometry(1, 1, 1, 16)), coil = this.geo(new THREE.TorusGeometry(1, .045, 5, 28));
    const casing = this.standard(0x67777b), machinery = this.standard(0x28383c), wiring = this.standard(0x7eb9ac, 0x187d75, .35);
    for (const o of this.arena.obstacles) {
      this.mesh(pedestal, machinery, this.scene, o.x, .35, o.z, o.radius, .7, o.radius);
      this.mesh(pedestal, casing, this.scene, o.x, .76, o.z, o.radius * .87, .15, o.radius * .87);
      this.mesh(box, metal, this.scene, o.x, .98, o.z, o.radius * 1.05, .35, o.radius * 1.05).rotation.y = .3;
      const ring = this.mesh(coil, wiring, this.scene, o.x, .86, o.z, o.radius * .8, o.radius * .8, o.radius * .8); ring.rotation.x = Math.PI / 2;
      for (let j = 0; j < 3; j++) this.mesh(box, dark, this.scene, o.x - o.radius * .3 + j * o.radius * .3, 1.17, o.z, .09, .04, o.radius * .7);
    }
    const markings = this.pool(box, this.standard(0x8e9865), 56);
    for (let i = 0; i < 56; i++) {
      const side = i % 4, a = side * Math.PI / 2, along = (Math.floor(i / 4) - 6.5) * 2.7;
      const x = Math.cos(a) * along - Math.sin(a) * 18.5, z = -Math.sin(a) * along - Math.cos(a) * 18.5;
      this.instance(markings, i, x, .018, z, .65, .012, .085, a + .45);
    }
    this.finish(markings, 56);
    this.gun.name = 'weapon';
    this.suit = this.standard(0xb6c8ad); this.scene.add(this.marine); this.marine.add(this.gun);
    this.marine.scale.setScalar(1.15);
    this.mesh(box, this.suit, this.marine, 0, .7, 0, .65, .8, .45);
    this.mesh(box, metal, this.marine, 0, .95, -.35, .5, .5, .3);
    this.mesh(sphere, metal, this.marine, 0, 1.3, .2, .36, .33, .34);
    this.mesh(box, cyan, this.marine, 0, 1.44, .47, .43, .12, .12);
    for (const sign of [-1, 1]) {
      this.mesh(sphere, this.suit, this.marine, sign * .48, .97, 0, .25, .24, .3);
      this.boots.push(this.mesh(box, dark, this.marine, sign * .2, .18, 0, .25, .35, .5));
      this.mesh(box, this.suit, this.gun, sign * .27, .85, .38, .18, .2, .55);
    }
    this.mesh(box, metal, this.gun, .15, .91, .75, .22, .24, .95);
    this.mesh(box, amber, this.gun, .15, .93, 1.25, .12, .13, .12);
    this.boots.forEach((boot, i) => { boot.name = `boot-${i}`; });
    this.body = this.pool(sphere, shell, CONFIG.maxEnemies);
    this.heads = this.pool(sphere, shell, CONFIG.maxEnemies);
    this.legs = this.pool(box, this.standard(0xa39a68), CONFIG.maxEnemies * 12);
    this.thoraxes = this.pool(sphere, shell, CONFIG.maxEnemies);
    this.feelers = this.pool(box, this.standard(0xd9c695), CONFIG.maxEnemies * 6);
    this.eyes = this.pool(sphere, this.mat(new THREE.MeshBasicMaterial({ color: 0xffffff })), CONFIG.maxEnemies * 4);
    this.elytra = this.pool(sphere, this.mat(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .38, metalness: .25 })), CONFIG.maxEnemies * 2);
    this.cores = this.pool(sphere, this.mat(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .28, metalness: .08, emissive: 0xffffff, emissiveIntensity: .85 })), CONFIG.maxEnemies);
    this.fangs = this.pool(this.geo(new THREE.ConeGeometry(1, 1, 5)), this.mat(new THREE.MeshStandardMaterial({ color: 0xe6d9b1, roughness: .45, metalness: .05 })), CONFIG.maxEnemies * 2);
    this.spines = this.pool(this.geo(new THREE.ConeGeometry(1, 1, 6)), this.mat(new THREE.MeshStandardMaterial({ color: 0x422a2d, roughness: .72, metalness: .08 })), CONFIG.maxEnemies * 4);
    this.sacs = this.pool(sphere, this.mat(new THREE.MeshStandardMaterial({ color: 0x80d34d, roughness: .42, metalness: .05, emissive: 0x214d16, emissiveIntensity: .55 })), CONFIG.maxEnemies);
    this.reticles = this.pool(this.geo(new THREE.RingGeometry(.85, 1, 24)), this.mat(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .8, side: THREE.DoubleSide, depthWrite: false })), 2);
    this.fragments = this.pool(this.geo(new THREE.TetrahedronGeometry(1)), this.mat(new THREE.MeshBasicMaterial({ color: 0xffffff })), CONFIG.maxEvents * 6);
    this.plates = this.pool(this.geo(new THREE.ConeGeometry(1, 1, 5)), metal, CONFIG.maxEnemies * 3);
    this.bossParts = this.pool(sphere, this.standard(0xffffff, 0x4b1d08, .3), CONFIG.maxEnemies * 6);
    this.items = this.pool(box, this.standard(0xffffff, 0x334422, .3), CONFIG.maxPickups);
    this.dropMedkits = this.pool(box, this.standard(0xf06d69, 0x8d1717, .45), CONFIG.maxPickups);
    this.dropArmor = this.pool(box, this.standard(0x63dfff, 0x116b86, .55), CONFIG.maxPickups);
    this.dropAmmo = this.pool(box, this.standard(0xe5c95b, 0x765316, .45), CONFIG.maxPickups);
    this.dropGrenades = this.pool(this.geo(new THREE.SphereGeometry(1, 10, 7)), this.standard(0xff9138, 0x8b250b, .65), CONFIG.maxPickups);
    this.crosses = this.pool(box, this.standard(0xc6ff87, 0x559922, 1), CONFIG.maxPickups * 2);
    this.bullets = this.pool(sphere, this.mat(new THREE.MeshBasicMaterial({ color: 0xffffff })), CONFIG.maxProjectiles);
    this.warnings = this.pool(this.geo(new THREE.RingGeometry(.88, 1, 32)), this.mat(new THREE.MeshBasicMaterial({ color: 0xff4a25, side: THREE.DoubleSide, transparent: true, opacity: .8 })), CONFIG.maxEnemies);
    this.stains = this.pool(this.geo(new THREE.CircleGeometry(1, 9)), this.mat(new THREE.MeshBasicMaterial({ color: 0x542c1e, transparent: true, opacity: .48, depthWrite: false })), 80);
    this.enemyShadows = this.pool(this.geo(new THREE.CircleGeometry(1, 16)), this.mat(new THREE.MeshBasicMaterial({ color: 0x020608, transparent: true, opacity: .38, depthWrite: false })), CONFIG.maxEnemies);
    this.blasts = this.pool(sphere, this.mat(new THREE.MeshBasicMaterial({ color: 0xff9922, transparent: true, opacity: .4, depthWrite: false, blending: THREE.AdditiveBlending })), CONFIG.maxEvents);
    this.shock = this.mesh(this.geo(new THREE.TorusGeometry(1, .04, 5, 64)), cyan, this.scene); this.shock.rotation.x = Math.PI / 2;
    // Layered flame: orange pressure envelope, hot yellow body and white core.
    // Separate meshes make the fire read as volume instead of a flat triangle.
    this.flame = new THREE.Group(); this.flame.name = 'flamethrower-fire'; this.scene.add(this.flame);
    [
      this.mesh(this.geo(new THREE.ConeGeometry(2.8, 6, 14, 3, true)), this.mat(new THREE.MeshBasicMaterial({ color: 0xff3d12, transparent: true, opacity: .22, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })), this.flame),
      this.mesh(this.geo(new THREE.ConeGeometry(1.95, 4.9, 12, 3, true)), this.mat(new THREE.MeshBasicMaterial({ color: 0xff9d18, transparent: true, opacity: .48, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })), this.flame),
      this.mesh(this.geo(new THREE.ConeGeometry(.92, 3.7, 10, 3, true)), this.mat(new THREE.MeshBasicMaterial({ color: 0xfff2a0, transparent: true, opacity: .78, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })), this.flame),
    ];
    const lineGeo = this.geo(new THREE.BufferGeometry()); lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array((CONFIG.maxProjectiles + CONFIG.maxEnemies + 2) * 6), 3));
    this.trails = new THREE.LineSegments(lineGeo, this.mat(new THREE.LineBasicMaterial({ color: 0xe4db9a, transparent: true, opacity: .65 }))); this.trails.frustumCulled = false; this.scene.add(this.trails);
    this.marineViews.push({ body: this.marine, gun: this.gun, boots: this.boots, suit: this.suit, torch: this.torch, flash: this.flash, flame: this.flame, shock: this.shock });
    const second = this.marine.clone(true), secondSuit = this.mat(this.suit.clone()); secondSuit.color.setHex(0xd49e61);
    second.traverse(node => { if (node instanceof THREE.Mesh) { if (node.material === this.suit) node.material = secondSuit; else if (node.material === cyan) node.material = amber; } });
    const torch = this.torch.clone(), flash = this.flash.clone(), flame = this.flame.clone(), shock = this.shock.clone();
    torch.color.setHex(0xffd59b); shock.material = this.standard(0xffda98, 0xff9019, .8);
    this.scene.add(second, torch, flash, flame, shock);
    this.marineViews.push({ body: second, gun: second.getObjectByName('weapon') as THREE.Group, boots: [second.getObjectByName('boot-0') as THREE.Mesh, second.getObjectByName('boot-1') as THREE.Mesh], suit: secondSuit, torch, flash, flame, shock });
  }
  resize(width: number, height: number, count = 1) {
    this.viewports = splitViewports(width, height, count);
    this.viewports.forEach((rect, i) => {
      if (!rect.width || !rect.height) return;
      const aspect = rect.width / rect.height, frame = this.frames[i], camera = this.cameras[i];
      frame.width = count === 2 ? Math.min(32, Math.max(20, 28 * aspect)) : Math.min(46, Math.max(27, 42 * aspect)); frame.height = frame.width / aspect;
      const maxX = Math.max(0, this.arena.wall - frame.width / 2), maxZ = Math.max(0, this.arena.wall - frame.height / 2);
      frame.follow.x = Math.max(-maxX, Math.min(maxX, frame.follow.x)); frame.follow.y = Math.max(-maxZ, Math.min(maxZ, frame.follow.y));
      camera.left = -frame.width / 2; camera.right = frame.width / 2; camera.top = frame.height / 2; camera.bottom = -frame.height / 2; camera.updateProjectionMatrix();
    });
  }
  setRemains(enabled: boolean) { this.remains = enabled; }
  setMapPhase(phase: number) {
    const next = Math.max(0, Math.floor(Number.isFinite(phase) ? phase : 0)); if (next === this.mapPhase) return; this.mapPhase = next;
    const palette = [
      { floor: 0x98acb0, glow: 0x0b2026, bg: 0x03090f, fog: 0x06111a, torch: 0xbde9cf },
      { floor: 0x829a8f, glow: 0x183d25, bg: 0x07130f, fog: 0x0d2417, torch: 0x8dff9d },
      { floor: 0x887e9a, glow: 0x32164c, bg: 0x100716, fog: 0x21102a, torch: 0xd1a3ff },
      { floor: 0x707983, glow: 0x102b42, bg: 0x030711, fog: 0x0a1524, torch: 0x83d8ff },
    ][next % 4];
    this.floorMaterial.color.setHex(palette.floor); this.floorMaterial.emissive.setHex(palette.glow); this.floorMaterial.emissiveIntensity = next === 0 ? .08 : .12 + (next % 3) * .025;
    this.scene.background = new THREE.Color(palette.bg); this.scene.fog = new THREE.FogExp2(palette.fog, .008); this.torch.color.setHex(palette.torch);
    this.contamination.visible = next > 0; this.roots.visible = next > 0; this.eggs.visible = next > 0;
    const contaminationMaterial = this.contamination.material as THREE.MeshBasicMaterial;
    const rootsMaterial = this.roots.material as THREE.MeshStandardMaterial;
    const eggsMaterial = this.eggs.material as THREE.MeshStandardMaterial;
    const organicPalette = [
      { stain: 0x18351f, root: 0x263a25, egg: 0x526d3b, emissive: 0x153f25 },
      { stain: 0x234c2c, root: 0x31542e, egg: 0x7a9b48, emissive: 0x2d6a2b },
      { stain: 0x442246, root: 0x4f2854, egg: 0xa356c0, emissive: 0x6b1f73 },
      { stain: 0x183b58, root: 0x244b60, egg: 0x55a7c2, emissive: 0x1b6680 },
    ][next % 4];
    contaminationMaterial.color.setHex(organicPalette.stain);
    rootsMaterial.color.setHex(organicPalette.root); rootsMaterial.emissive.setHex(organicPalette.emissive);
    eggsMaterial.color.setHex(organicPalette.egg); eggsMaterial.emissive.setHex(organicPalette.emissive);
  }
  draw(s: GameSimulation) {
    this.setMapPhase(s.mapPhase);
    const t = s.elapsed, dt = Math.max(0, Math.min(.1, t - this.lastTime)); this.lastTime = t;
    const living = s.players.filter(p => p.health > 0);
    const critical = living.length > 0 && living.some(p => p.health < 32);
    const fog = this.scene.fog;
    if (fog instanceof THREE.FogExp2) {
      const tension = critical ? .0019 : s.phase === 'GAME_OVER' ? .0012 : 0;
      fog.density = .008 + tension + (!this.reduced ? Math.sin(t * .7) * .00035 : 0);
    }
    this.marineViews.forEach((view, i) => {
      const p = s.players[i]; view.body.visible = !!p; view.torch.visible = !!p; view.flash.visible = !!p;
      if (!p) { view.flame.visible = view.shock.visible = false; return; }
      const follow = p.health > 0 ? p : s.nearestPlayer(p.x, p.z), frame = this.frames[i], camera = this.cameras[i];
      const maxX = Math.max(0, this.arena.wall - frame.width / 2), maxZ = Math.max(0, this.arena.wall - frame.height / 2);
      const targetX = Math.max(-maxX, Math.min(maxX, follow.x)), targetZ = Math.max(-maxZ, Math.min(maxZ, follow.z));
      frame.follow.lerp(this.followTarget.set(targetX, targetZ), this.reduced ? 1 : 1 - Math.exp(-dt * 9));
      const shake = !this.reduced && p.invulnerable > .45 ? Math.sin(t * 91) * .06 : 0;
      camera.position.set(frame.follow.x + shake, 48, frame.follow.y + 8); camera.lookAt(frame.follow.x, 0, frame.follow.y); camera.updateMatrixWorld();
      view.body.position.set(p.x, p.health > 0 ? 0 : -.1, p.z); view.body.rotation.set(p.health > 0 ? 0 : Math.PI / 2, Math.PI / 2 - p.heading, 0); view.gun.rotation.y = p.heading - p.fireAngle;
      view.suit.emissive.setHex(p.health <= 0 ? 0 : p.invulnerable > 0 ? 0x993311 : p.shield > 0 ? 0x116677 : 0); view.suit.emissiveIntensity = .5;
      const moving = s.phase === 'PLAYING' && p.health > 0 && Math.hypot(p.x - frame.lastPlayer.x, p.z - frame.lastPlayer.y) > .001; frame.lastPlayer.set(p.x, p.z);
      view.boots.forEach((boot, j) => { boot.position.z = -.45 + (this.reduced || !moving ? 0 : Math.sin(t * 13 + j * Math.PI) * .16); });
      const flicker = this.reduced ? 1 : 1 + Math.sin(t * 17 + i * 2.7) * .045 + Math.sin(t * 31 + i) * .025;
      view.torch.position.set(follow.x, 4, follow.z);
      view.torch.intensity = (critical ? 15 : 11) * flicker;
      view.torch.distance = critical ? 11.5 : 14;
    });
    let shadows = 0;
    for (const o of this.arena.obstacles) this.instance(this.contact, shadows++, o.x + .15, .025, o.z + .1, o.radius * 1.15, o.radius * 1.15, 1, 0, -Math.PI / 2);
    for (const p of s.players) this.instance(this.contact, shadows++, p.x, .028, p.z, .65, .65, 1, 0, -Math.PI / 2);
    this.finish(this.contact, shadows);
    const steamPosition = this.steam.geometry.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < 32; i++) { const side = i % 4, a = side * Math.PI / 2, along = Math.sin(Math.floor(i / 4) * 3.9) * (this.arena.wall - 1), rise = this.reduced ? (i % 5) * .2 : (t * .35 + i * .17) % 2; steamPosition.setXYZ(i, Math.cos(a) * along - Math.sin(a) * (this.arena.wall - .8) + Math.sin(i + rise) * .25, .4 + rise, -Math.sin(a) * along - Math.cos(a) * (this.arena.wall - .8)); } steamPosition.needsUpdate = true;
    let count = 0, lc = 0, pc = 0, wc = 0, bossCount = 0, fc = 0, fangCount = 0, ec = 0, shellCount = 0, spineCount = 0, sacCount = 0, shadowCount = 0;
    for (const e of s.enemies) {
      const scale = e.state === 'DYING' ? Math.max(.01, 1 - e.age / .35) : e.state === 'SPAWNING' ? Math.min(1, e.age / .65) : 1;
      const target = s.nearestPlayer(e.x, e.z);
      // Mobile top-down cameras need extra silhouette scale so mandibles,
      // spines and acid sacs remain readable beside the HUD.
      const visualScale = e.boss ? 1.14 : 1.28;
      const r = e.radius * scale * visualScale, a = Math.atan2(target.x - e.x, target.z - e.z);
      this.instance(this.enemyShadows, shadowCount++, e.x, .025, e.z, r * 1.3, r * .42, r * 1.3, a, -Math.PI / 2);
      const skitter = e.kind === 'skitter', beetle = e.kind === 'carapace' || e.kind === 'maw', mantis = e.kind === 'stalker', acid = e.kind === 'spitter' || e.kind === 'brood';
      const bossPhase = e.boss && e.hp <= e.maxHp / 2 ? 2 : 1;
      const flash = !this.reduced && e.hitFlash > 0;
      const color = flash ? 0xfff3d3 : e.burn > 0 ? 0xe68524 : e.boss && bossPhase === 2 ? 0x9e315e : beetle ? 0x6d1f35 : acid ? 0x287d4c : mantis ? 0x8b2456 : e.boss ? 0x64247e : skitter ? 0x9b4b28 : 0x754034;
      const part = (pool: THREE.InstancedMesh, index: number, lx: number, y: number, lz: number, sx: number, sy: number, sz: number, turn = 0) => {
        this.instance(pool, index, e.x + Math.cos(a) * lx * r + Math.sin(a) * lz * r, y * r, e.z - Math.sin(a) * lx * r + Math.cos(a) * lz * r, sx * r, sy * r, sz * r, a + turn);
      };
      const motionRate = skitter ? 22 : mantis ? 7 : acid ? 4 : beetle ? 5 : 9;
      const bob = this.reduced ? 0 : Math.sin(t * motionRate + e.id * 1.73) * (skitter ? .09 : mantis ? .06 : .035);
      const twist = this.reduced ? 0 : Math.sin(t * (motionRate * .63) + e.id) * (mantis ? .08 : .035);
      // Abdomen, narrow thorax and head are separate volumes, not one generic blob.
      const pulse = acid && !this.reduced ? 1 + Math.sin(t * 5 + e.id) * .06 : 1;
      part(this.body, count, 0, .58 + bob, -.42, acid ? 1.02 * pulse : mantis ? .53 : skitter ? .58 : .79, acid ? .8 : skitter ? .4 : .56, mantis ? 1.2 : skitter ? .78 : .92, twist);
      this.body.setColorAt(count, this.color.setHex(color));
      part(this.thoraxes, count, 0, .5 + bob * .7, .46, mantis ? .3 : skitter ? .36 : .5, mantis ? .4 : skitter ? .3 : .4, mantis ? .88 : skitter ? .46 : .55, -twist * .8);
      this.thoraxes.setColorAt(count, this.color.setHex(flash ? 0xfff3d3 : beetle ? 0x351522 : acid ? 0x17452c : mantis ? 0x3d1437 : skitter ? 0x542314 : 0x3e2524));
      part(this.heads, count, 0, .57 + bob * 1.15, 1.02, mantis ? .7 : skitter ? .36 : .48, mantis ? .36 : skitter ? .27 : .36, mantis ? .3 : skitter ? .34 : .48, -twist);
      this.heads.setColorAt(count, this.color.setHex(flash ? 0xffffff : beetle ? 0x8e2842 : acid ? 0x58b83d : mantis ? 0xc23567 : skitter ? 0xc06b31 : 0xa64f38));
      const coreColor = flash ? 0xffffff : e.boss && bossPhase === 2 ? 0xfff06a : acid ? (e.kind === 'brood' ? 0xd6ff55 : 0x9dff62) : mantis ? 0xff4b55 : e.boss ? 0xf08cff : 0xffbd52;
      part(this.cores, count, 0, e.boss ? .74 : .7, acid ? .82 : .96, e.boss ? .26 : acid ? .18 : .14, e.boss ? .3 : .16, e.boss ? .26 : .14);
      this.cores.setColorAt(count, this.color.setHex(coreColor));
      if (acid) {
        part(this.sacs, sacCount, 0, .86, -.26, .24 * pulse, .2 * pulse, .3 * pulse);
        this.sacs.setColorAt(sacCount++, this.color.setHex(flash ? 0xffffff : e.kind === 'brood' ? 0xd8ff55 : 0x75e84e));
      }
      if (beetle || e.boss) for (let j = 0; j < 4; j++) {
        const side = j % 2 ? 1 : -1, row = Math.floor(j / 2) - .5;
        part(this.spines, spineCount, side * (.32 + Math.abs(row) * .12), .9 + Math.abs(row) * .18, row * .46 - .35, .13, .42, .13, side * .18);
        this.spines.setColorAt(spineCount++, this.color.setHex(flash ? 0xffffff : e.boss ? 0xa95a76 : 0x4a2930));
      }
      for (const side of [-1, 1]) {
        const jaw = mantis || beetle || e.kind === 'skitter';
        if (jaw) this.instance(this.fangs, fangCount++, e.x + Math.cos(a) * side * r * .2 + Math.sin(a) * r * 1.48, r * .42, e.z - Math.sin(a) * side * r * .2 + Math.cos(a) * r * 1.48, r * (mantis ? .11 : .16), r * (mantis ? .42 : .28), r * .11, a + side * .38, mantis ? -.35 : -.15);
      }
      for (const side of [-1, 1]) {
        // Bright compound eyes remain readable against the dark floor.
        part(this.eyes, ec, side * (mantis ? .5 : .3), .78, 1.27, .13, .12, .16);
        this.eyes.setColorAt(ec++, this.color.setHex(mantis ? 0xff4e38 : acid ? 0xbfff43 : e.boss ? 0xe298ff : 0xffb83d));
        // Articulated antennae and inward-facing mandibles, with beetle-sized jaws.
        part(this.feelers, fc++, side * .4, .67, 1.63, .055, .055, .65, side * .38);
        part(this.feelers, fc++, side * (beetle ? .48 : .28), .4, beetle ? 1.65 : 1.48, beetle ? .17 : .09, .13, beetle ? .85 : .35, -side * .36);
        part(this.feelers, fc++, side * (beetle ? .35 : .23), .4, beetle ? 2.23 : 1.72, .075, .12, beetle ? .36 : .15, side * .8);
        if (beetle) {
          part(this.elytra, shellCount, side * .38, .7, -.37, .46, .62, 1.06);
          this.elytra.setColorAt(shellCount++, this.color.setHex(flash ? 0xfff3d3 : e.boss ? 0x8d3151 : 0x6d263e));
        } else if (acid) {
          part(this.elytra, shellCount, side * .74, .69, -.55, .37 * pulse, .42 * pulse, .63);
          this.elytra.setColorAt(shellCount++, this.color.setHex(flash ? 0xfff3d3 : e.kind === 'brood' ? 0xb7e943 : 0x4dcc55));
        }
      }
      count++;
      for (let j = 0; j < 6; j++) {
        const side = j % 2 ? 1 : -1, row = Math.floor(j / 2) - 1;
        const gait = this.reduced ? 0 : Math.sin(t * (e.kind === 'carapace' ? 5 : 13) + j * 2 + e.id) * .17;
        const claw = mantis && row === 1;
        const lx = side * r * (claw ? .85 : 1), lz = row * r * (claw ? 1.3 : .7) + gait;
        const x = e.x + Math.cos(a) * lx + Math.sin(a) * lz, z = e.z - Math.sin(a) * lx + Math.cos(a) * lz;
        this.instance(this.legs, lc++, x, r * (claw ? .72 : .32), z, r * (claw ? 1.2 : .9), r * (claw ? .18 : .12), r * .14, a + side * (claw ? -.8 : .35 + row * .35));
        this.instance(this.legs, lc++, x + Math.cos(a) * side * r * .45, r * .13, z - Math.sin(a) * side * r * .45, r * (claw ? .85 : .48), r * .13, r * (claw ? .22 : .13), a - side * (claw ? 1.3 : .5));
      }
      for (let j = 0; j < 3; j++) {
        const dorsal = j - 1;
        const stalkerBlade = mantis && j > 0;
        const spitterCrest = acid && j !== 1;
        const plateY = stalkerBlade ? .58 + Math.abs(dorsal) * .12 : spitterCrest ? .98 : 1.1;
        const plateX = stalkerBlade ? dorsal * .72 : dorsal * .6;
        const plateZ = stalkerBlade ? -.05 : dorsal * .6;
        const plateScale = stalkerBlade ? .26 : spitterCrest ? .3 : .45;
        this.instance(this.plates, pc++, e.x + Math.cos(a) * plateX * r + Math.sin(a) * plateZ * r, plateY * r + bob, e.z - Math.sin(a) * plateX * r + Math.cos(a) * plateZ * r, plateScale * r, r * (stalkerBlade ? .9 : e.boss ? 1.2 : .5), (stalkerBlade ? .18 : spitterCrest ? .32 : .5) * r, a + (stalkerBlade ? (dorsal < 0 ? -.55 : .55) : 0), stalkerBlade ? (dorsal < 0 ? -.35 : .35) : 0);
        this.plates.setColorAt(pc - 1, this.color.setHex(flash ? 0xffffff : stalkerBlade ? 0xc23567 : spitterCrest ? 0x75e84e : e.boss ? 0x8d3151 : 0x4a2930));
      }
      if (e.boss) for (let j = 0; j < 6; j++) {
        const bossPhase = e.hp <= e.maxHp / 2 ? 2 : 1;
        const phasePulse = bossPhase === 2 && !this.reduced ? 1 + Math.sin(t * 9 + j) * .1 : 1;
        const angle = j * Math.PI / 3 + (e.kind === 'sovereign' && !this.reduced ? t * (bossPhase === 2 ? 1.25 : .7) : a);
        const distance = r * (e.kind === 'sovereign' ? (bossPhase === 2 ? 2.25 : 1.85) : (bossPhase === 2 ? 1.35 : 1.1));
        const jaw = e.kind === 'maw';
        this.instance(this.bossParts, bossCount, e.x + Math.sin(angle) * distance, jaw ? .35 : r * (.7 + (bossPhase === 2 ? .1 : 0)), e.z + Math.cos(angle) * distance, r * (jaw ? .18 : .38) * phasePulse, r * .3 * phasePulse, r * (jaw ? .85 : .5), angle);
        this.bossParts.setColorAt(bossCount++, this.color.setHex(e.warning > 0 ? 0xffc36b : bossPhase === 2 ? (e.kind === 'sovereign' ? 0xff3d82 : jaw ? 0xff704f : 0xb9d94a) : e.kind === 'sovereign' ? 0xbb668b : jaw ? 0xd5bc7c : 0x769b43));
      }
      if (e.warning > 0) { this.instance(this.warnings, wc++, e.x, .09, e.z, r * 1.8, r * 1.8, r * 1.8, 0, -Math.PI / 2); }
    }
    this.finish(this.body, count, true); this.finish(this.heads, count, true); this.finish(this.cores, count, true); this.finish(this.fangs, fangCount); this.finish(this.legs, lc); this.finish(this.plates, pc, true); this.finish(this.warnings, wc);
    this.finish(this.bossParts, bossCount, true); this.finish(this.thoraxes, count, true); this.finish(this.feelers, fc); this.finish(this.eyes, ec, true); this.finish(this.elytra, shellCount, true); this.finish(this.spines, spineCount, true); this.finish(this.sacs, sacCount, true);
    this.finish(this.enemyShadows, shadowCount);
    let rc = 0;
    for (const p of s.players) {
      const target = s.enemies.find(e => e.id === p.targetId && e.state === 'ADVANCING');
      if (!target || p.health <= 0 || s.phase !== 'PLAYING') continue;
      const r = target.radius + .35;
      this.instance(this.reticles, rc, target.x, .06, target.z, r, r, r, 0, -Math.PI / 2);
      this.reticles.setColorAt(rc++, this.color.setHex(p.id === 0 ? 0x59eaff : 0xffce70));
    }
    this.finish(this.reticles, rc, true);
    let lines = 0, bc = 0;
    const attr = this.trails.geometry.getAttribute('position') as THREE.BufferAttribute;
    for (const b of s.projectiles) {
      this.instance(this.bullets, bc, b.x, .65, b.z, b.hostile ? .22 : .09, .1, b.hostile ? .22 : .09);
      this.bullets.setColorAt(bc++, this.color.setHex(b.hostile ? 0x91ff35 : b.weapon === 'rail' ? 0x55eeff : b.weapon === 'cascade' ? 0xff8833 : 0xffe8a0));
      attr.setXYZ(lines++, b.x, .65, b.z); attr.setXYZ(lines++, b.x - b.vx * .025, .65, b.z - b.vz * .025);
    }
    for (const e of s.enemies) if (e.warning > 0 && ['stalker', 'maw', 'spitter', 'sovereign'].includes(e.kind)) { attr.setXYZ(lines++, e.x, .1, e.z); attr.setXYZ(lines++, e.x + e.aimX * 7, .1, e.z + e.aimZ * 7); }
    for (const p of s.players) if (p.health > 0) { attr.setXYZ(lines++, p.x, .15, p.z); attr.setXYZ(lines++, p.x + Math.cos(p.fireAngle) * 2.7, .15, p.z + Math.sin(p.fireAngle) * 2.7); }
    attr.needsUpdate = true; this.trails.geometry.setDrawRange(0, lines); this.finish(this.bullets, bc, true);
    let ic = 0, genericc = 0, medc = 0, armorc = 0, ammoc = 0, grenadec = 0;
    for (const item of s.pickups) {
      const color = item.kind === 'medkit' ? 0xff655c : item.kind === 'shield' ? 0x61d9ff : item.kind === 'haste' ? 0xe8bb4b : 0x9ed950;
      if (item.kind === 'medkit') {
        this.instance(this.dropMedkits, medc++, item.x, .42, item.z, .72, .3, .46, .2);
        this.instance(this.crosses, ic * 2, item.x, .62, item.z, .12, .045, .42); this.crosses.setColorAt(ic * 2, this.color.setHex(0xffffff));
        this.instance(this.crosses, ic * 2 + 1, item.x, .62, item.z, .42, .045, .12); this.crosses.setColorAt(ic * 2 + 1, this.color.setHex(0xffffff));
      } else if (item.kind === 'ammo') {
        this.instance(this.dropAmmo, ammoc++, item.x, .4, item.z, .62, .35, .45, .12);
        this.instance(this.crosses, ic * 2, item.x - .14, .62, item.z, .08, .05, .34); this.crosses.setColorAt(ic * 2, this.color.setHex(0xffef9a));
        this.instance(this.crosses, ic * 2 + 1, item.x + .14, .62, item.z, .08, .05, .34); this.crosses.setColorAt(ic * 2 + 1, this.color.setHex(0xffef9a));
      } else if (item.kind === 'shield') {
        // Two raised shoulders and vertical straps make this read as a vest,
        // not as a generic energy cube, while remaining instanced and cheap.
        this.instance(this.dropArmor, armorc++, item.x, .38, item.z, .72, .24, .46, .25);
        this.instance(this.crosses, ic * 2, item.x - .24, .63, item.z, .08, .06, .28); this.crosses.setColorAt(ic * 2, this.color.setHex(0xb7f5ff));
        this.instance(this.crosses, ic * 2 + 1, item.x + .24, .63, item.z, .08, .06, .28); this.crosses.setColorAt(ic * 2 + 1, this.color.setHex(0xb7f5ff));
      } else if (item.kind === 'grenade') {
        this.instance(this.dropGrenades, grenadec++, item.x, .48, item.z, .32, .42, .32, .3);
        this.instance(this.crosses, ic * 2, item.x, .76, item.z, .08, .08, .2, .3); this.crosses.setColorAt(ic * 2, this.color.setHex(0xffd26a));
        this.instance(this.crosses, ic * 2 + 1, item.x, .77, item.z, .2, .06, .08, .3); this.crosses.setColorAt(ic * 2 + 1, this.color.setHex(0xffd26a));
      } else {
        const angle = .9;
        this.instance(this.items, genericc, item.x, .4, item.z, .6, .25, .6, .3); this.items.setColorAt(genericc++, this.color.setHex(color));
        this.instance(this.crosses, ic * 2, item.x - .1, .55, item.z, .13, .04, .4, angle); this.crosses.setColorAt(ic * 2, this.color.setHex(0xf2d66b));
        this.instance(this.crosses, ic * 2 + 1, item.x + .1, .55, item.z, .13, .04, .4, -angle); this.crosses.setColorAt(ic * 2 + 1, this.color.setHex(0xf2d66b));
      }
      ic++;
    }
    this.finish(this.items, genericc, true); this.finish(this.dropMedkits, medc); this.finish(this.dropArmor, armorc); this.finish(this.dropAmmo, ammoc); this.finish(this.dropGrenades, grenadec); this.finish(this.crosses, ic * 2);
    let fragmentCount = 0;
    let blastCount = 0; const firing = [false, false], flaming = [false, false];
    for (const event of s.events) {
      if (event.kind === 'kill' && event.id > this.lastEvent) { this.corpses.push({ x: event.x, z: event.z, born: t, id: event.id }); }
      if (event.kind === 'kill' && event.age < .3) {
        // Keep the effect pools visually dense without flooding mobile GPUs
        // when a late wave already contains a large active horde.
        const age = event.age, pieces = this.reduced ? 2 : s.enemies.length > 150 ? 3 : s.enemies.length > 90 ? 4 : 6;
        for (let j = 0; j < pieces; j++) {
          const a = j * Math.PI / 3 + event.id, distance = age * (2.5 + j % 3);
          const size = Math.max(.01, .11 * (1 - age / .3));
          this.instance(this.fragments, fragmentCount, event.x + Math.cos(a) * distance, .2 + Math.sin(age / .3 * Math.PI) * .6, event.z + Math.sin(a) * distance, size, size, size, a + age * 9);
          this.fragments.setColorAt(fragmentCount++, this.color.setHex(j % 2 ? 0xd0b583 : 0x98bd44));
        }
      }
      if (event.kind === 'explosion') { const r = .3 + event.age * 7; this.instance(this.blasts, blastCount++, event.x, .5, event.z, r, .5, r); }
      if (event.kind === 'shot' && event.age < .06) firing[event.playerId ?? 0] = true;
      if (event.kind === 'flame' && event.age < .15) flaming[event.playerId ?? 0] = true;
      this.lastEvent = Math.max(this.lastEvent, event.id);
    }
    this.finish(this.fragments, fragmentCount, true);
    this.corpses = this.corpses.filter(c => t - c.born < 18).slice(-80);
    this.corpses.forEach((c, i) => this.instance(this.stains, i, c.x, .018 + i * .0001, c.z, .8, 1, .8, 0, -Math.PI / 2)); this.finish(this.stains, this.remains ? this.corpses.length : 0); this.finish(this.blasts, blastCount);
    for (const [i, p] of s.players.entries()) {
      const view = this.marineViews[i];
      view.flash.position.set(p.x + Math.cos(p.fireAngle), 1.5, p.z + Math.sin(p.fireAngle)); view.flash.intensity = p.health <= 0 ? 0 : firing[i] ? 18 : flaming[i] ? 28 : 0;
      view.flame.visible = p.health > 0 && flaming[i];
      const flamePulse = 1 + (this.reduced ? 0 : Math.sin(t * 38 + i * 2.1) * .12);
      const flameReach = 2.7 + (this.reduced ? 0 : Math.sin(t * 31 + i) * .14);
      view.flame.scale.set(.82 * flamePulse, .9 + flamePulse * .18, .82 * flamePulse);
      view.flame.position.set(p.x + Math.cos(p.fireAngle) * flameReach, .7 + (this.reduced ? 0 : Math.sin(t * 42 + i) * .05), p.z + Math.sin(p.fireAngle) * flameReach);
      view.flame.quaternion.setFromUnitVectors(this.up, this.flameAxis.set(-Math.cos(p.fireAngle), 0, -Math.sin(p.fireAngle)));
      if (!this.reduced && flaming[i]) view.flame.rotateZ(Math.sin(t * 29 + i) * .08);
      if (flaming[i] && !this.reduced) view.flame.children.forEach((layer, layerIndex) => {
        const phase = t * (18 + layerIndex * 7) + i * 2.4;
        layer.rotation.y = Math.sin(phase) * (.18 + layerIndex * .04);
        layer.rotation.x = Math.cos(phase * .73) * (.08 + layerIndex * .025);
        layer.scale.set(1 + Math.sin(phase * 1.17) * .1, 1 + Math.cos(phase) * .12, 1 + Math.sin(phase * .81) * .08);
      });
      view.shock.visible = p.health > 0 && p.shockAge >= 0; view.shock.position.set(p.shockOrigin.x, .1, p.shockOrigin.z); view.shock.scale.setScalar(Math.max(.01, s.shockRadiusFor(p)));
    }

  }
  private finish(pool: THREE.InstancedMesh, count: number, colors = false) { pool.count = count; pool.instanceMatrix.needsUpdate = true; if (colors && pool.instanceColor) pool.instanceColor.needsUpdate = true; }
  dispose() {
    this.scene.traverse(node => { if (node instanceof THREE.InstancedMesh) node.dispose(); });
    this.geometries.forEach(g => g.dispose()); this.materials.forEach(m => m.dispose()); this.textures.forEach(t => t.dispose()); this.scene.clear();
  }
}
