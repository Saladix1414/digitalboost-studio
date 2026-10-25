import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_ARENA, LEGACY_ARENA } from '../../src/brain-boost/neon-arena/ArenaDefinition.ts';
import { GameSimulation } from '../../src/brain-boost/neon-arena/GameSimulation.ts';
import { firstBlockTime } from '../../src/brain-boost/neon-arena/SurvivalRules.ts';
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
test('actual default colony + assisted input-only pilot reaches all three bosses without cheats',()=>{
 const options={arena:DEFAULT_ARENA,assisted:true};const result=playthrough(42819,options);
 assert.equal(result.wave,16);assert.equal(result.bosses,3);assert.ok(result.health>0);assert.ok(result.time<600);assert.equal(result.stalled,undefined);
 assert.deepEqual(result.unlocked,['machinegun','shotgun','flame','cascade','rail']);assert.deepEqual(playthrough(42819,options),result);assert.deepEqual(playthrough(42819,{...options,maxEnemies:240}),result);
});
