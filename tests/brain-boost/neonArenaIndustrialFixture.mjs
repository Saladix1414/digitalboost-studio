export async function installIndustrialFixture() {
  const base = '/src/brain-boost/neon-arena/';
  const { GameSimulation, createEnemy } = await import(base + 'GameSimulation.ts');
  const { SurvivalWorld } = await import(base + 'SurvivalWorld.ts');
  const { NeonArenaEngine } = await import(base + 'NeonArenaEngine.ts');
  const step = GameSimulation.prototype.step;
  const draw = SurvivalWorld.prototype.draw;
  const start = NeonArenaEngine.prototype.start;
  SurvivalWorld.prototype.draw = function (s) {
    window.qaWorld = this;
    return draw.call(this, s);
  };
  NeonArenaEngine.prototype.start = function () {
    window.qaEngine = this;
    return start.call(this);
  };
  const deploy = GameSimulation.prototype.start;
  GameSimulation.prototype.start = function () {
    if (!deploy.call(this)) return false;
    const s = this;
    window.qaArena = s;
    const { player } = s;
    s.wave = 4; s.score = 955; s.spawned = s.waveSize; s.elapsed = 28;
    Object.assign(player, { x: -2.6, z: 0, heading: 0, health: 84, aimMode: 'modern' });
    if (s.players[1]) Object.assign(s.players[1], { x: 5.5, z: 5 });
    s.enemies = [
      ['skitter', -9, -5], ['skitter', -8, 4], ['carapace', 6.5, 0],
      ['skitter', -5, 9], ['carapace', 11, 6], ['spitter', 7.5, -6], ['spitter', 8, 7.5],
    ].map(([kind, x, z], index) => {
      const e = createEnemy(kind, 900000 + index, x, z, 4);
      e.speed = 0; e.attackClock = 100;
      if (index === 5) Object.assign(e, { warning: .03, aimX: -.8, aimZ: .6 });
      if (index === 6) Object.assign(e, { warning: .85, aimX: -.8, aimZ: -.6 });
      return e;
    });
    s.pickups = [['medkit', -1, 6], ['ammo', .8, -5], ['shield', 12, 1]]
      .map(([kind, x, z], index) => ({ id: 910000 + index, kind, x, z, life: 25 }));
    // Replay exact ticks through production damage, aiming and projectile integration.
    s.step = dt => { if (window.qaLive) step.call(s, dt); };
    window.qaAdvance = (ticks, moving = false) => {
      for (let i = 0; i < ticks; i++) {
        s.setInput(moving ? .65 : 0, moving ? -.75 : 0, true, 0);
        step.call(s);
      }
    };
    // Uses the authoritative damage path so the critical frame includes the
    // same impact event, invulnerability and HUD state as an ordinary hit.
    window.qaCritical = () => s.hurt(60, player);
    window.qaAdvance(9);
    return true;
  };
}
