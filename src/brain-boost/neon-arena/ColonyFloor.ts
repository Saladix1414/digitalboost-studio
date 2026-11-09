import type { ArenaDefinition } from './ArenaDefinition';

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
  deck.addColorStop(0, '#28343f');
  deck.addColorStop(.55, '#292439');
  deck.addColorStop(1, '#382a40');
  ctx.fillStyle = deck;
  ctx.fillRect(-arena.floorSize / 2, -arena.floorSize / 2, arena.floorSize, arena.floorSize);

  // Long staggered plates keep the open lanes quieter than the machinery.
  let seed = 713;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let row = 0; row < 15; row++) {
    const z = -28 + row * 4;
    for (let col = 0; col < 9; col++) {
      const x = -33 + col * 7 + (row % 2) * 3.5;
      ctx.fillStyle = random() > .4 ? '#a4b3d10b' : '#09081522';
      ctx.fillRect(x + .07, z + .08, 6.86, 3.84);
      line([[x, z + 3.9], [x, z], [x + 7, z]], '#131421b5', .09);
      line([[x + .13, z + 3.75], [x + .13, z + .14], [x + 6.7, z + .14]], '#ced3e017', .055);
      ctx.fillStyle = '#b9acc04d';
      for (const dx of [.29, 6.65]) ctx.fillRect(x + dx, z + .34, .1, .1);
    }
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
    line(points, color, .17);
  };
  conduit([[-edge, -8], [-11, -8], [-4, -15], [-4, -edge]], '#538d97');
  conduit([[10, -edge], [10, -10], [17, -3], [edge, -3]], '#ad7551');
  conduit([[-edge, 10], [-12, 10], [-7, 15], [5, 15], [12, 9], [edge, 9]], '#826d9d');

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
    const reach = radius + (kind === 'reactor' ? 2.2 : 1.15);
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

    if (kind === 'reactor') {
      for (let side = 0; side < 4; side++) {
        ctx.save();
        ctx.rotate(side * Math.PI / 2);
        ctx.fillStyle = '#211e30';
        ctx.fillRect(-.76, reach * .92 - .55, 1.52, .4);
        ctx.fillStyle = signal;
        for (let step = 0; step < 5; step++) ctx.fillRect(-.63 + step * .25, reach * .92 - .42, .15, .1);
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
        [x + 7, z - 3], [x + 9, z - 4.2], [x + 10, z - 4]];
      line(fracture, '#111a2c', .65);
      line(fracture, '#80bbd99c', .16);
    }
  }

}
