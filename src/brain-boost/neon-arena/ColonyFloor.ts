import type { ArenaDefinition } from './ArenaDefinition';
import { COLONY_REACTOR_COLORS } from './ColonySectors';

type Point = readonly [number, number];

const PLATFORMS = {
  reactor: { base: '#413044', rim: '#956545', signal: '#d69a58' },
  coolant: { base: '#243944', rim: '#3c6970', signal: '#73b1b6' },
  freight: { base: '#373048', rim: '#66527d', signal: '#a284b2' },
};

export function paintColonyFloor(ctx: CanvasRenderingContext2D, arena: ArenaDefinition, size: number, sector = 0) {
  const scale = size / arena.floorSize;
  const edge = arena.halfExtent;
  ctx.setTransform(scale, 0, 0, scale, size / 2, size / 2);
  ctx.lineJoin = 'round';

  const line = (points: readonly Point[], color: string, width: number, closed = false) => {
    ctx.beginPath();
    ctx.moveTo(...points[0]);
    for (const point of points.slice(1)) ctx.lineTo(...point);
    if (closed) ctx.closePath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  };

  const deck = ctx.createLinearGradient(-edge, -edge, edge, edge);
  deck.addColorStop(0, '#302d3c');
  deck.addColorStop(.52, '#403744');
  deck.addColorStop(1, '#302b3d');
  ctx.fillStyle = deck;
  ctx.fillRect(-arena.floorSize / 2, -arena.floorSize / 2, arena.floorSize, arena.floorSize);

  // Staggered steel plates alternate dimensions without filling the lanes with detail.
  let seed = 713;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let row = 0, z = -29; z < 29; row++) {
    const height = row % 4 === 0 ? 3.1 : 4.1;
    for (let col = 0, x = -33 + (row % 2) * 2.5; x < 29; col++) {
      const width = [4.2, 6.3, 5.15, 7.25][(col + row * 3) % 4];
      ctx.fillStyle = random() > .4 ? '#a4b3d10b' : '#09081522';
      ctx.fillRect(x + .07, z + .08, width - .14, height - .16);
      line([[x, z + height - .1], [x, z], [x + width, z]], '#131421b5', .09);
      line([[x + .13, z + height - .25], [x + .13, z + .14], [x + width - .3, z + .14]], '#ced3e017', .055);
      ctx.fillStyle = '#171420';
      for (const dx of [.29, width - .42]) for (const dz of [.32, height - .45]) {
        ctx.fillRect(x + dx, z + dz, .13, .13);
      }
      ctx.fillStyle = '#b9acc066';
      for (const dx of [.29, width - .42]) for (const dz of [.32, height - .45]) {
        ctx.fillRect(x + dx + .015, z + dz, .09, .045);
      }
      const scratchX = x + 1 + random() * (width - 2), scratchZ = z + .8 + random() * 2;
      line([[scratchX, scratchZ], [scratchX + .62, scratchZ + .09]], '#c0aec033', .045);
      for (let i = 0; i < 9; i++) {
        const fleckX = x + .23 + random() * (width - .45), fleckZ = z + .2 + random() * (height - .45);
        ctx.fillStyle = i % 3 ? '#140e201c' : '#dbc0b820';
        ctx.fillRect(fleckX, fleckZ, .07 + random() * .2, .04 + random() * .08);
      }
      if ((col + row * 3) % 13 === 0) {
        ctx.fillStyle = '#191622';
        ctx.fillRect(x + .72, z + 2.2, 1.8, .66);
        ctx.strokeStyle = '#7a637d';
        ctx.lineWidth = .055;
        ctx.strokeRect(x + .72, z + 2.2, 1.8, .66);
        for (let slot = 0; slot < 7; slot++) {
          ctx.fillStyle = '#5e5065';
          ctx.fillRect(x + .86 + slot * .23, z + 2.31, .065, .45);
        }
      }
      x += width;
    }
    z += height;
  }

  const serviceBay = (outline: readonly Point[], fill: string, seam: string) => {
    line(outline, '#131321', .32, true);
    ctx.fillStyle = fill;
    ctx.fill();
    line(outline, seam, .09, true);
  };
  serviceBay([[-edge, -17], [-16, -17], [-12, -21], [-2, -21], [1, -18], [1, -12],
    [-6, -5], [-13, -5], [-17, -2], [-edge, -2]], '#31536045', '#567c896e');
  serviceBay([[3, -edge], [17, -edge], [17, -17], [22, -12], [22, -7], [15, 0],
    [10, 0], [4, -6], [4, -12], [3, -14]], '#673c4150', '#ac775f60');
  serviceBay([[-edge, 6], [-15, 6], [-9, 12], [5, 12], [12, 5], [edge, 5],
    [edge, 13], [15, 13], [8, 20], [-9, 20], [-16, 14], [-edge, 14]], '#58456d53', '#a080b95d');

  // Recessed supply lines are painted into the deck and remain traversable.
  const conduit = (points: readonly Point[], color: string) => {
    line(points, '#171323', 1.45);
    line(points, '#6d587088', 1.13);
    line(points, '#24202e', .94);
    line(points, '#b0a3b037', .65);
    line(points, '#24202e', .52);
    line(points, color, .19);
  };
  conduit([[-edge, -8], [-11, -8], [-4, -15], [-4, -edge]], '#669ba9');
  conduit([[10, -edge], [10, -10], [17, -3], [edge, -3]], '#bd885d');
  conduit([[-edge, 10], [-12, 10], [-7, 15], [5, 15], [12, 9], [edge, 9]], '#9778a8');

  // Cross-light falls over plate seams and painted utility channels.
  // Wide pools of reflected color are baked into the same floor texture.
  for (const { x, z, kind } of arena.obstacles) {
    if (kind !== 'reactor' && kind !== 'coolant') continue;
    const radius = kind === 'reactor' ? 8.6 : 5.8;
    const pool = ctx.createRadialGradient(x + .55, z + 1, .6, x + .55, z + 1, radius);
    const reflection = kind === 'reactor' ? COLONY_REACTOR_COLORS[sector] ?? COLONY_REACTOR_COLORS[0] : '#57c3bc';
    pool.addColorStop(0, `${reflection}76`);
    pool.addColorStop(.53, `${reflection}2e`);
    pool.addColorStop(1, '#ffffff00');
    ctx.fillStyle = pool;
    ctx.fillRect(x - radius, z - radius, radius * 2, radius * 2);
  }



  ctx.strokeStyle = '#151424';
  ctx.lineWidth = 1.55;
  ctx.strokeRect(-edge + .8, -edge + .8, 2 * edge - 1.6, 2 * edge - 1.6);
  ctx.strokeStyle = '#6f597d';
  ctx.lineWidth = .13;
  ctx.strokeRect(-edge + 1.48, -edge + 1.48, 2 * edge - 2.96, 2 * edge - 2.96);
  for (let i = 0; i < 4; i++) {
    ctx.save();
    ctx.rotate(i * Math.PI / 2);
    for (let x = -edge + 3; x < edge - 3; x += 4) {
      ctx.fillStyle = '#a17a58';
      ctx.fillRect(x, -edge + 1, .58, .17);
      ctx.fillStyle = '#3e344b';
      ctx.fillRect(x + .74, -edge + 1, 1.7, .17);
    }
    // Recessed perimeter channel. Raised walls and rails supply the depth.
    ctx.fillStyle = '#1b1523';
    ctx.fillRect(-edge, -edge - 2.3, edge * 2, 1.9);
    line([[-edge + .45, -edge - 1.87], [edge - .45, -edge - 1.87]], '#605169', .16);
    line([[-edge + .45, -edge - 1.58], [edge - .45, -edge - 1.58]], '#3f354a', .1);
    for (const x of [-18, -9, 0, 9, 18]) {
      ctx.fillStyle = '#3c3046';
      ctx.fillRect(x - 1.75, -edge - 1.5, 3.5, .8);
      for (let stripe = -1.5; stripe <= 1.25; stripe += .44) {
        line([[x + stripe, -edge - .79], [x + stripe + .26, -edge - 1.37]], '#be855a', .11);
      }
    }

    // Organic patches cling to the seams. Their highlights are baked into the deck.
    const [shadow, skin, vein] = [
      ['#242c29', '#3b493a', '#667858'],
      ['#183025', '#365643', '#72a069'],
      ['#39253b', '#5b3c58', '#a075a1'],
      ['#192b37', '#2e4250', '#58748a'],
    ][sector] ?? ['#242c29', '#3b493a', '#667858'];
    for (const [j, offset] of [-20, -8.6, 8.9, 19.4].entries()) {
      const x = offset + (i % 2 ? 1.2 : 0);
      const z = -edge + .56;
      const depth = (sector === 1 ? 2.55 : 1.8) + (j % 2) * .38;
      const shape: Point[] = [[x - 1.8, z], [x + 1.65, z], [x + 1.35, z + .64],
        [x + .75, z + .84], [x + .84, z + depth - .35], [x + .25, z + depth],
        [x - .22, z + depth - .48], [x - .85, z + depth - .1], [x - 1.16, z + .8]];
      line(shape, shadow, .24, true);
      ctx.fillStyle = skin;
      ctx.fill();
      line([[x - .7, z + .17], [x - .54, z + .62], [x + .18, z + 1.02], [x + .28, z + depth - .19]], vein, .09);
      line([[x - .53, z + .61], [x - .77, z + 1.14], [x - .86, z + depth - .25]], vein, .055);
      for (let pore = 0; pore < 6; pore++) {
        const px = x + (pore % 3 - 1) * .36, pz = z + .27 + Math.floor(pore / 3) * .42;
        ctx.fillStyle = shadow;
        ctx.fillRect(px, pz, .13, .075);
        ctx.fillStyle = vein;
        ctx.fillRect(px + .018, pz + .09, .07, .032);
      }
    }
    for (const x of [-edge + 6, edge - 6]) {
      ctx.fillStyle = '#191725';
      ctx.fillRect(x - 2, -edge + 1.75, 4, .8);
      ctx.fillStyle = '#62526f';
      for (let bar = -1.8; bar < 1.9; bar += .28) {
        ctx.fillRect(x + bar, -edge + 1.85, .09, .6);
      }
    }
    ctx.restore();
  }

  for (const { x, z, radius, kind } of arena.obstacles) {
    if (!kind) continue;
    const { base, rim, signal } = PLATFORMS[kind];
    const reach = radius + (kind === 'reactor' ? 2.45 : 1.05);
    const outline = (r: number): Point[] => {
      if (kind === 'reactor') {
        return Array.from({ length: 8 }, (_, i) => {
          const angle = (i + .5) * Math.PI / 4;
          return [Math.cos(angle) * r, Math.sin(angle) * r];
        });
      }
      const w = r * (kind === 'coolant' ? .86 : 1.1);
      const h = r * (kind === 'coolant' ? 1 : .76);
      return [[-w + .45, -h], [w - .45, -h], [w, -h + .45], [w, h - .45],
        [w - .45, h], [-w + .45, h], [-w, h - .45], [-w, -h + .45]];
    };
    ctx.save();
    ctx.translate(x, z);
    line(outline(reach), '#151424', .48, true);
    ctx.fillStyle = base;
    ctx.fill();
    line(outline(reach), rim, .14, true);
    line(outline(reach - .32), rim, .06, true);
    // Soft contact shadow sits under the fittings without a hard pedestal outline.
    const shadow = ctx.createRadialGradient(.34, .35, radius * .42, .34, .35, radius * 1.49);
    shadow.addColorStop(0, '#0f1017e8');
    shadow.addColorStop(.53, '#0f101779');
    shadow.addColorStop(1, '#0f101700');
    ctx.fillStyle = shadow;
    ctx.fillRect(-radius * 1.4, -radius * 1.4, radius * 3, radius * 3);
    for (const direction of [-1, 1]) {
      const side = direction * (reach * .63);
      line([[side, -.55], [side, .55]], '#0f0e17b0', .22);
      line([[side, -.48], [side, .48]], '#d6b5c350', .06);
      for (let mark = 0; mark < 4; mark++) {
        const sx = -.82 + mark * .4, sz = direction * (reach * .78 + .34);
        line([[sx, sz], [sx + .24, sz + .14]], '#1e1826', .19);
        line([[sx, sz], [sx + .24, sz + .14]], signal, .075);
      }
    }

    if (kind === 'reactor') {
      const reflectedLight = COLONY_REACTOR_COLORS[sector] ?? COLONY_REACTOR_COLORS[0];
      line(outline(radius * 1.08), `${reflectedLight}43`, .19, true);
      line(outline(reach - .58), '#ba7a47', .11, true);
      line(outline(reach - .78), '#231b27', .12, true);
      for (let side = 0; side < 4; side++) {
        ctx.save();
        ctx.rotate(side * Math.PI / 2);
        ctx.fillStyle = '#211e30';
        ctx.fillRect(-.76, reach * .92 - .55, 1.52, .4);
        ctx.fillStyle = signal;
        for (let step = 0; step < 5; step++) {
          const markX = -.67 + step * .29, markZ = reach * .92 - .52;
          line([[markX, markZ], [markX + .19, markZ + .3]], signal, .12);
        }
        ctx.restore();
      }
    } else if (kind === 'coolant') {
      for (const side of [-1, 1]) {
        const ventX = side * reach * .66;
        ctx.fillStyle = '#172735';
        ctx.fillRect(ventX - .26, -reach * .65, .52, reach * 1.3);
        for (let z = -reach * .56; z < reach * .6; z += .25) {
          line([[ventX - .16, z], [ventX + .16, z]], rim, .075);
        }
      }
    } else {
      for (const side of [-1, 1]) {
        for (let step = -1; step <= 1; step++) {
          const stripeX = step * .32;
          line([[stripeX - .17, side * (reach * .76 - .42)], [stripeX, side * (reach * .76 - .17)]], signal, .08);
        }
      }
    }
    ctx.restore();
  }
  // These marks stay on the deck. Keep them out of the center and below
  // the contrast of enemy attack tells and supply pickups.
  if (sector === 1) {
    for (const { x, z, kind } of arena.obstacles) {
      if (kind !== 'coolant') continue;
      const direction = Math.sign(x);
      for (let i = 0; i < 11; i++) {
        const angle = i * Math.PI * 2 / 11;
        const dx = Math.cos(angle), dz = Math.sin(angle);
        const trunk: Point[] = [[x + dx, z + dz], [x + dx * 3, z + dz * 3],
          [x + dx * 4 + dz * .65, z + dz * 4], [x + dx * 6 + direction * .45, z + dz * 5.5]];
        line(trunk, '#14291f', .48);
        line(trunk, '#608361a6', .13);
        line([trunk[2], [x + dx * 5 + dz * 1.2, z + dz * 5 - dx]], '#60836188', .1);
      }
    }
  } else if (sector === 2) {
    for (const { x, z, radius, kind } of arena.obstacles) {
      if (kind !== 'freight') continue;
      for (let i = 0; i < 15; i++) {
        const angle = i * 2.39996;
        const reach = radius + .55 + random() * 2.6;
        ctx.beginPath();
        ctx.ellipse(x + Math.cos(angle) * reach, z + Math.sin(angle) * reach,
          .38 + random() * .5, .25 + random() * .3, angle, 0, Math.PI * 2);
        ctx.fillStyle = '#522b53c2';
        ctx.fill();
        ctx.strokeStyle = '#a5649a80';
        ctx.lineWidth = .1;
        ctx.stroke();
      }
    }
  } else if (sector === 3) {
    ctx.fillStyle = '#080d1d50';
    ctx.fillRect(-edge, -edge, edge * 2, edge * 2);
    for (let side = 0; side < 4; side++) {
      ctx.save();
      ctx.rotate(side * Math.PI / 2);
      for (const x of [-17, -9, 0, 9, 17]) {
        const strip: Point[] = [[x - 1.1, -edge + 2.8], [x - .7, -edge + 2.4], [x + .7, -edge + 2.4], [x + 1.1, -edge + 2.8]];
        line(strip, '#467d9955', .65);
        line(strip, '#83b9d4bd', .15);
      }
      ctx.restore();
    }
    const reactor = arena.obstacles.find(o => o.kind === 'reactor');
    if (reactor) {
      const { x, z } = reactor;
      const fracture: Point[] = [[x + 1, z - 1], [x + 3, z - 2], [x + 4, z - 1.6], [x + 6, z - 3.4],
        [x + 8, z - 3], [x + 9, z - 4.2], [x + 10, z - 4]];
      line(fracture, '#111a2c', .65);
      line(fracture, '#80bbd99c', .16);
    }
  }

}
