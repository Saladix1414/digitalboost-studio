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
  private gun = new THREE.Group(); private boots: THREE.Mesh[] = []; private suit!: THREE.MeshStandardMaterial;
  private body!: THREE.InstancedMesh; private heads!: THREE.InstancedMesh; private legs!: THREE.InstancedMesh; private plates!: THREE.InstancedMesh;
  private bossParts!: THREE.InstancedMesh;
  private thoraxes!: THREE.InstancedMesh; private feelers!: THREE.InstancedMesh; private eyes!: THREE.InstancedMesh; private elytra!: THREE.InstancedMesh; private reticles!: THREE.InstancedMesh; private fragments!: THREE.InstancedMesh;
  private items!: THREE.InstancedMesh; private crosses!: THREE.InstancedMesh; private bullets!: THREE.InstancedMesh; private warnings!: THREE.InstancedMesh;
  private stains!: THREE.InstancedMesh; private blasts!: THREE.InstancedMesh; private trails!: THREE.LineSegments; private flame!: THREE.Mesh; private shock!: THREE.Mesh;
  private torch = new THREE.PointLight(0xbde9cf, 12, 14, 1.8); private flash = new THREE.PointLight(0xff9c35, 0, 9, 2);
  private lastTime = 0;
  private frames = Array.from({ length: 2 }, () => ({ width: 44, height: 44, follow: new THREE.Vector2(), lastPlayer: new THREE.Vector2(0, 3) }));
  private marineViews: { body: THREE.Group; gun: THREE.Group; boots: THREE.Mesh[]; suit: THREE.MeshStandardMaterial; torch: THREE.PointLight; flash: THREE.PointLight; flame: THREE.Mesh; shock: THREE.Mesh }[] = [];
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
  private groundTexture() {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256; const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#161c12'; ctx.fillRect(0, 0, 256, 256);
    let seed = 8192; const random = () => { seed = Math.imul(seed, 1664525) + 1013904223 | 0; return (seed >>> 0) / 4294967296; };
    for (let i = 0; i < 16000; i++) {
      const n = Math.floor(random() * 28); ctx.fillStyle = `rgb(${20 + n},${28 + n},${15 + n * .6})`;
      ctx.fillRect(random() * 256, random() * 256, 1 + random() * 4, 1 + random() * 3);
    }
    ctx.strokeStyle = '#303a20'; ctx.lineWidth = 2;
    for (let i = 0; i < 60; i++) { ctx.beginPath(); const x = random() * 256, y = random() * 256; ctx.moveTo(x, y); ctx.bezierCurveTo(x + 15, y - 30, x - 30, y + 15, x + 40, y + 20); ctx.stroke(); }
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(6, 6); this.textures.add(texture); return texture;
  }
  private build() {
    this.scene.background = new THREE.Color(0x050907); this.scene.fog = new THREE.FogExp2(0x080e09, .009);
    this.scene.add(new THREE.HemisphereLight(0xa6c9b5, 0x33301e, 2.1));
    const key = new THREE.DirectionalLight(0xffe5b4, 2.4); key.position.set(-12, 30, 9); this.scene.add(key, this.torch, this.flash);
    const box = this.geo(new THREE.BoxGeometry(1, 1, 1)), sphere = this.geo(new THREE.SphereGeometry(1, 10, 7));
    const shell = this.standard(0xffffff), olive = this.standard(0x5d6733), metal = this.standard(0x3b4c49), dark = this.standard(0x17221b);
    const cyan = this.standard(0x88e7ff, 0x00bfff, .8), amber = this.standard(0xffc86c, 0xff6313, 1);
    const floor = this.mat(new THREE.MeshStandardMaterial({ map: this.groundTexture(), color: 0xb0bba0, roughness: .87, metalness: .04 }));
    const ground = this.mesh(this.geo(new THREE.PlaneGeometry(this.arena.floorSize, this.arena.floorSize)), floor, this.scene); ground.rotation.x = -Math.PI / 2;
    const rubble = this.pool(this.geo(new THREE.IcosahedronGeometry(1, 0)), olive, 420);
    for (let i = 0; i < 420; i++) {
      const a = i * 2.39996, r = i < 240 ? this.arena.wall + i % 3 * .5 : 3 + (i * 17 % 190) / 10;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      const boundary = i < 240, scale = boundary ? .5 + i % 7 * .14 : .08 + i % 5 * .035;
      this.instance(rubble, i, x, boundary ? .4 : .04, z, scale, boundary ? scale : .08, scale, a);
    }
    rubble.count = 420; rubble.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < 4; i++) {
      const wall = new THREE.Group(); wall.rotation.y = i * Math.PI / 2; this.scene.add(wall);
      this.mesh(box, metal, wall, 0, .5, -this.arena.wall, this.arena.wall * 2, 1, .8);
      for (let j = -2; j <= 2; j++) {
        this.mesh(box, dark, wall, j * 9, 1.1, -this.arena.wall, 1.4, 2.2, 1.4);
        this.mesh(box, amber, wall, j * 9, 2.1, -this.arena.wall + .1, .5, .12, .5);
      }
    }
    // These exact circles also define simulation collision: visible debris never hides a different collider.
    for (const o of this.arena.obstacles) {
      this.mesh(sphere, olive, this.scene, o.x, .45, o.z, o.radius, .8, o.radius);
      this.mesh(box, metal, this.scene, o.x, .6, o.z, o.radius * 1.2, .7, o.radius * 1.1).rotation.y = o.x;
      this.mesh(sphere, this.standard(0x596f32, 0x315711, .15), this.scene, o.x + .3, 1, o.z, o.radius * .55, .55, o.radius * .65);
    }
    const veins = this.pool(this.geo(new THREE.CylinderGeometry(.06, .09, 1, 5)), olive, 100);
    for (let i = 0; i < 100; i++) this.instance(veins, i, Math.sin(i * 5.3) * 21, .08, Math.cos(i * 2.7) * 21, 1, .4 + i % 5 * .3, 1, i * .7, Math.PI / 2);
    veins.count = 100; veins.instanceMatrix.needsUpdate = true;
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
    this.reticles = this.pool(this.geo(new THREE.RingGeometry(.85, 1, 24)), this.mat(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .8, side: THREE.DoubleSide, depthWrite: false })), 2);
    this.fragments = this.pool(this.geo(new THREE.TetrahedronGeometry(1)), this.mat(new THREE.MeshBasicMaterial({ color: 0xffffff })), CONFIG.maxEvents * 6);
    this.plates = this.pool(this.geo(new THREE.ConeGeometry(1, 1, 5)), metal, CONFIG.maxEnemies * 3);
    this.bossParts = this.pool(sphere, this.standard(0xffffff, 0x4b1d08, .3), CONFIG.maxEnemies * 6);
    this.items = this.pool(box, this.standard(0xffffff, 0x334422, .3), CONFIG.maxPickups);
    this.crosses = this.pool(box, this.standard(0xc6ff87, 0x559922, 1), CONFIG.maxPickups * 2);
    this.bullets = this.pool(sphere, this.mat(new THREE.MeshBasicMaterial({ color: 0xffffff })), CONFIG.maxProjectiles);
    this.warnings = this.pool(this.geo(new THREE.RingGeometry(.88, 1, 32)), this.mat(new THREE.MeshBasicMaterial({ color: 0xff4a25, side: THREE.DoubleSide, transparent: true, opacity: .8 })), CONFIG.maxEnemies);
    this.stains = this.pool(this.geo(new THREE.CircleGeometry(1, 9)), this.mat(new THREE.MeshBasicMaterial({ color: 0x542c1e, transparent: true, opacity: .48, depthWrite: false })), 80);
    this.blasts = this.pool(sphere, this.mat(new THREE.MeshBasicMaterial({ color: 0xff9922, transparent: true, opacity: .4, depthWrite: false, blending: THREE.AdditiveBlending })), CONFIG.maxEvents);
    this.shock = this.mesh(this.geo(new THREE.TorusGeometry(1, .04, 5, 64)), cyan, this.scene); this.shock.rotation.x = Math.PI / 2;
    this.flame = this.mesh(this.geo(new THREE.ConeGeometry(2.8, 6, 12, 1, true)), this.mat(new THREE.MeshBasicMaterial({ color: 0xff8d24, transparent: true, opacity: .36, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })), this.scene);
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
  draw(s: GameSimulation) {
    const t = s.elapsed, dt = Math.max(0, Math.min(.1, t - this.lastTime)); this.lastTime = t;
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
      view.torch.position.set(follow.x, 4, follow.z);
    });
    let count = 0, lc = 0, pc = 0, wc = 0, bossCount = 0, fc = 0, ec = 0, shellCount = 0;
    for (const e of s.enemies) {
      const scale = e.state === 'DYING' ? Math.max(.01, 1 - e.age / .35) : e.state === 'SPAWNING' ? Math.min(1, e.age / .65) : 1;
      const target = s.nearestPlayer(e.x, e.z);
      const r = e.radius * scale, a = Math.atan2(target.x - e.x, target.z - e.z);
      const beetle = e.kind === 'carapace' || e.kind === 'maw', mantis = e.kind === 'stalker', acid = e.kind === 'spitter' || e.kind === 'brood';
      const flash = !this.reduced && e.hitFlash > 0;
      const color = flash ? 0xfff3d3 : e.burn > 0 ? 0xe68524 : beetle ? 0xad8251 : acid ? 0x83b349 : mantis ? 0xb94f4a : e.boss ? 0xa16ac2 : 0xb5ad70;
      const part = (pool: THREE.InstancedMesh, index: number, lx: number, y: number, lz: number, sx: number, sy: number, sz: number, turn = 0) => {
        this.instance(pool, index, e.x + Math.cos(a) * lx * r + Math.sin(a) * lz * r, y * r, e.z - Math.sin(a) * lx * r + Math.cos(a) * lz * r, sx * r, sy * r, sz * r, a + turn);
      };
      // Abdomen, narrow thorax and head are separate volumes, not one generic blob.
      const pulse = acid && !this.reduced ? 1 + Math.sin(t * 5 + e.id) * .06 : 1;
      part(this.body, count, 0, .58, -.42, acid ? 1.02 * pulse : mantis ? .53 : .79, acid ? .8 : .56, mantis ? 1.2 : .92);
      this.body.setColorAt(count, this.color.setHex(color));
      part(this.thoraxes, count, 0, .5, .46, mantis ? .3 : .5, .4, mantis ? .88 : .55);
      this.thoraxes.setColorAt(count, this.color.setHex(flash ? 0xfff3d3 : beetle ? 0x544733 : 0x655b3b));
      part(this.heads, count, 0, .57, 1.02, mantis ? .7 : .48, .36, mantis ? .3 : .48);
      this.heads.setColorAt(count, this.color.setHex(flash ? 0xffffff : beetle ? 0xb49a65 : 0xc9b282));
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
          this.elytra.setColorAt(shellCount++, this.color.setHex(flash ? 0xfff3d3 : 0xb58a54));
        } else if (acid) {
          part(this.elytra, shellCount, side * .74, .69, -.55, .37 * pulse, .42 * pulse, .63);
          this.elytra.setColorAt(shellCount++, this.color.setHex(flash ? 0xfff3d3 : 0xa3d84a));
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
      for (let j = 0; j < 3; j++) this.instance(this.plates, pc++, e.x + Math.sin(a) * (j - 1) * r * .6, r * 1.1, e.z + Math.cos(a) * (j - 1) * r * .6, r * .45, r * (e.boss ? 1.2 : .5), r * .5, a);
      if (e.boss) for (let j = 0; j < 6; j++) {
        const angle = j * Math.PI / 3 + (e.kind === 'sovereign' && !this.reduced ? t * .7 : a);
        const distance = r * (e.kind === 'sovereign' ? 1.85 : 1.1);
        const jaw = e.kind === 'maw';
        this.instance(this.bossParts, bossCount, e.x + Math.sin(angle) * distance, jaw ? .35 : r * .7, e.z + Math.cos(angle) * distance, r * (jaw ? .18 : .38), r * .3, r * (jaw ? .85 : .5), angle);
        this.bossParts.setColorAt(bossCount++, this.color.setHex(e.warning > 0 ? 0xffc36b : e.kind === 'sovereign' ? 0xbb668b : jaw ? 0xd5bc7c : 0x769b43));
      }
      if (e.warning > 0) { this.instance(this.warnings, wc++, e.x, .09, e.z, r * 1.8, r * 1.8, r * 1.8, 0, -Math.PI / 2); }
    }
    this.finish(this.body, count, true); this.finish(this.heads, count, true); this.finish(this.legs, lc); this.finish(this.plates, pc); this.finish(this.warnings, wc);
    this.finish(this.bossParts, bossCount, true); this.finish(this.thoraxes, count, true); this.finish(this.feelers, fc); this.finish(this.eyes, ec, true); this.finish(this.elytra, shellCount, true);
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
    let ic = 0;
    for (const item of s.pickups) {
      const color = item.kind === 'medkit' ? 0xff655c : item.kind === 'shield' ? 0x61d9ff : item.kind === 'haste' ? 0xe8bb4b : 0x9ed950;
      this.instance(this.items, ic, item.x, .4, item.z, .6, .25, .6, .3); this.items.setColorAt(ic, this.color.setHex(color));
      if (item.kind === 'medkit') {
        this.instance(this.crosses, ic * 2, item.x, .55, item.z, .13, .04, .5); this.instance(this.crosses, ic * 2 + 1, item.x, .55, item.z, .5, .04, .13);
      } else if (item.kind === 'ammo') {
        this.instance(this.crosses, ic * 2, item.x - .14, .55, item.z, .1, .04, .45); this.instance(this.crosses, ic * 2 + 1, item.x + .14, .55, item.z, .1, .04, .45);
      } else {
        const angle = item.kind === 'grenade' ? Math.PI / 4 : item.kind === 'shield' ? .5 : .9;
        this.instance(this.crosses, ic * 2, item.x - .1, .55, item.z, .13, .04, .4, angle); this.instance(this.crosses, ic * 2 + 1, item.x + .1, .55, item.z, .13, .04, .4, -angle);
      }
      ic++;
    }
    this.finish(this.items, ic, true); this.finish(this.crosses, ic * 2);
    let fragmentCount = 0;
    let blastCount = 0; const firing = [false, false], flaming = [false, false];
    for (const event of s.events) {
      if (event.kind === 'kill' && event.id > this.lastEvent) { this.corpses.push({ x: event.x, z: event.z, born: t, id: event.id }); }
      if (event.kind === 'kill' && event.age < .3) {
        const age = event.age, pieces = this.reduced ? 2 : 6;
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
      view.flame.position.set(p.x + Math.cos(p.fireAngle) * 3, .7, p.z + Math.sin(p.fireAngle) * 3);
      view.flame.quaternion.setFromUnitVectors(this.up, this.flameAxis.set(-Math.cos(p.fireAngle), 0, -Math.sin(p.fireAngle)));
      view.shock.visible = p.health > 0 && p.shockAge >= 0; view.shock.position.set(p.shockOrigin.x, .1, p.shockOrigin.z); view.shock.scale.setScalar(Math.max(.01, s.shockRadiusFor(p)));
    }

  }
  private finish(pool: THREE.InstancedMesh, count: number, colors = false) { pool.count = count; pool.instanceMatrix.needsUpdate = true; if (colors && pool.instanceColor) pool.instanceColor.needsUpdate = true; }
  dispose() {
    this.scene.traverse(node => { if (node instanceof THREE.InstancedMesh) node.dispose(); });
    this.geometries.forEach(g => g.dispose()); this.materials.forEach(m => m.dispose()); this.textures.forEach(t => t.dispose()); this.scene.clear();
  }
}
