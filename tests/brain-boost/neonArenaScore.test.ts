import assert from 'node:assert/strict';
import test from 'node:test';
import { ContainmentTransport, SCORE, scoreGains } from '../../src/brain-boost/neon-arena/ContainmentScore.ts';
test('score arrangement has finite headroom, meaningful moods and four distinct horde phrases',()=>{
 assert.equal(SCORE.loopSeconds,60/SCORE.bpm*4*SCORE.bars);
 for(const mood of ['start','horde','danger','boss','victory','defeat'] as const)for(let bar=0;bar<64;bar++)for(const gain of scoreGains(mood,bar))assert.ok(Number.isFinite(gain)&&gain>=0&&gain<=.6);
 assert.equal(new Set([0,8,16,24].map(bar=>JSON.stringify(scoreGains('horde',bar)))).size,4);
 assert.ok(scoreGains('boss',0)[2]>scoreGains('start',0)[2]);assert.ok(scoreGains('danger',0)[3]>scoreGains('start',0)[3]);
 assert.equal(scoreGains('defeat',0)[2],0);assert.ok(scoreGains('defeat',0)[3]>0);
});
test('one transport starts four synchronized loops, retains resume phase, and stops sources once',()=>{
 const starts:number[][]=[],stops:number[][]=[],gains:number[][]=[];
 const context={currentTime:100,createBufferSource:()=>({connect(){},disconnect(){},start(...args:number[]){starts.push(args)},stop(...args:number[]){stops.push(args)}}),createGain:()=>({connect(){},disconnect(){},gain:{value:0,cancelScheduledValues(){},setTargetAtTime(...args:number[]){gains.push(args)}}})};
 const transport=new ContainmentTransport(context as unknown as AudioContext,{} as AudioNode,[{},{},{},{}] as AudioBuffer[],100,5);
 assert.deepEqual(starts,[[100,5],[100,5],[100,5],[100,5]]);
 transport.tick(100,'horde');transport.tick(100.1,'boss');assert.equal(gains.length,4,'mood waits for the next musical boundary');
 transport.tick(100.7,'boss');assert.equal(gains.length,8);assert.ok(Math.abs(gains[4][1]-100.625)<1e-8);
 transport.stop();transport.stop();assert.equal(stops.length,4);
});
