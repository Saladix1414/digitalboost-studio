import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_ARENA, LEGACY_ARENA } from '../../src/brain-boost/neon-arena/ArenaDefinition.ts';
import { GameSimulation } from '../../src/brain-boost/neon-arena/GameSimulation.ts';
import { firstBlockTime, isBossWave, nextBossEncounter } from '../../src/brain-boost/neon-arena/SurvivalRules.ts';
import { playthrough } from './neonArena.playthrough.mjs';
test('default colony defines a shared immutable 50x50 arena while legacy stays 42x42',()=>{
 assert.equal(DEFAULT_ARENA.halfExtent*2,50);assert.equal(LEGACY_ARENA.halfExtent*2,42);
 assert.ok(Math.abs(DEFAULT_ARENA.wall-DEFAULT_ARENA.wallThickness/2-DEFAULT_ARENA.halfExtent)<1e-8);
 assert.ok(Object.isFrozen(DEFAULT_ARENA));assert.ok(Object.isFrozen(DEFAULT_ARENA.obstacles));assert.ok(Object.isFrozen(DEFAULT_ARENA.obstacles[0]));
});
test('colony player, swept bullets and LOS agree on the expanded edge',()=>{
 const s=new GameSimulation(42819,null,120,1,DEFAULT_ARENA);s.ready();s.start();s.player.x=23;s.player.z=0;s.setInput(1,0,false);s.step();assert.ok(s.player.x>23);
 const b={id:9000,x:22,z:0,vx:100,vz:0,life:2,damage:18,radius:.12,weapon:'machinegun' as const,hostile:false,hits:new Set<number>(),remaining:1};s.projectiles.push(b);s.step(.1);
 assert.ok(Math.abs(b.x-24.88)<1e-8);assert.ok(b.life<0);
 assert.equal(firstBlockTime(22,0,24,0,0,s.arena.halfExtent,s.arena.obstacles),Infinity);
 assert.ok(firstBlockTime(0,0,-12,-8.72,0,s.arena.halfExtent,s.arena.obstacles)<Infinity);
});
test('expanded spawn positions remain inside the map and away from both living marines',()=>{
 const s=new GameSimulation(42819,null,120,2,DEFAULT_ARENA);s.ready();s.start();
 for(let i=0;i<180;i++)s.step();
 assert.ok(s.enemies.length>0);for(const e of s.enemies){assert.ok(Math.abs(e.x)<=25&&Math.abs(e.z)<=25);if(e.state==='SPAWNING')for(const p of s.players)assert.ok(Math.hypot(e.x-p.x,e.z-p.z)>=6)}
});
test('colony boss cadence gives the new weapons breathing room after wave five',()=>{
 assert.deepEqual([5,12,20,29,39,50].map(w=>isBossWave(w,DEFAULT_ARENA)),[true,true,true,true,true,true]);
 assert.equal(isBossWave(10,DEFAULT_ARENA),false); assert.equal(isBossWave(15,DEFAULT_ARENA),false);
 assert.equal(nextBossEncounter(5,true,DEFAULT_ARENA).wave,12);
 assert.equal(nextBossEncounter(12,true,DEFAULT_ARENA).wave,20);
 assert.equal(nextBossEncounter(16,false,DEFAULT_ARENA).wave,20);
 assert.equal(nextBossEncounter(5,true,LEGACY_ARENA).wave,10);
});
test('actual default colony + assisted input-only pilots reach all three bosses without cheats',()=>{
 // Floating-point trajectories can diverge between ARM64 and x64. Use a fixed
 // portfolio of ordinary evasive input policies, not one lucky exact trajectory.
 // Every attempt starts the same real seed with normal health/ammo/spawns.
 let winner;
 const attempts=[];
 const policies=[
  { assistedRadius: 5, assistedEvasion: .5, assistedOrbit: 8 },
  { assistedRadius: 5, assistedEvasion: 1, assistedOrbit: 7 },
  { assistedRadius: 5, assistedEvasion: .75, assistedOrbit: 6 },
  { assistedRadius: 5.5, assistedEvasion: .25, assistedOrbit: 7 },
  { assistedRadius: 5.5, assistedEvasion: .5, assistedOrbit: 8 },
  { assistedRadius: 6, assistedEvasion: 3, assistedOrbit: 9 },
 ];
 for(const policy of policies) {
  const options={arena:DEFAULT_ARENA,assisted:true,targetWave:21,...policy};
  const result=playthrough(42819,options);attempts.push({policy,...result});
  if(result.wave===21&&result.bosses===3&&result.health>0&&result.time<780){winner={options,result};break;}
 }
 assert.ok(winner,`No input-only policy completed the colony: ${JSON.stringify(attempts)}`);
 const {options,result}=winner;
 assert.equal(result.wave,21);assert.equal(result.bosses,3);assert.ok(result.health>0);assert.ok(result.time<780);assert.equal(result.stalled,undefined);
 assert.deepEqual(result.unlocked,['machinegun','shotgun','flame','cascade','rail']);assert.deepEqual(playthrough(42819,options),result);assert.deepEqual(playthrough(42819,{...options,maxEnemies:240}),result);
});
test('assisted campaign portfolio tolerates last-bit distance rounding',()=>{
 const hypot=Math.hypot;
 try {
  // This perturbation reproduces a wave-10 defeat with the old close-pass pilot.
  Math.hypot=(...values:number[])=>hypot(...values)*(1+Number.EPSILON);
  const results=[];
  const policies=[
   { assistedRadius: 5, assistedEvasion: .5, assistedOrbit: 8 },
   { assistedRadius: 5, assistedEvasion: 1, assistedOrbit: 7 },
   { assistedRadius: 5, assistedEvasion: .75, assistedOrbit: 6 },
   { assistedRadius: 5.5, assistedEvasion: .25, assistedOrbit: 7 },
   { assistedRadius: 5.5, assistedEvasion: .5, assistedOrbit: 8 },
   { assistedRadius: 6, assistedEvasion: 3, assistedOrbit: 9 },
  ];
  for(const policy of policies) {
  const result=playthrough(42819,{arena:DEFAULT_ARENA,assisted:true,targetWave:21,...policy});results.push({policy,...result});
   if(result.wave===21&&result.bosses===3&&result.health>0&&result.time<780)return;
  }
  assert.fail(`Distance-rounding regression: ${JSON.stringify(results)}`);
 } finally { Math.hypot=hypot; }
});
