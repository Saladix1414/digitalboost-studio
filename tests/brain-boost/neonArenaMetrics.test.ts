import assert from 'node:assert/strict';
import test from 'node:test';
import { RenderMetrics } from '../../src/brain-boost/neon-arena/RenderMetrics.ts';
test('CPU/frame diagnostic windows are bounded, reject invalid deltas and reset between active sessions',()=>{
 const m=new RenderMetrics();m.observe(NaN,1,1);m.observe(0,1,1);m.observe(1,1,1);assert.equal(m.read().fps,0);
 for(let i=0;i<200;i++)m.observe(1/60,2,3);assert.ok(Math.abs(m.read().fps-60)<1e-9);assert.equal(m.read().updateMs,2);assert.equal(m.read().renderMs,3);
 for(let i=0;i<180;i++)m.observe(1/30,4,6);assert.ok(Math.abs(m.read().fps-30)<1e-9);assert.ok(Math.abs(m.read().frameP95-1000/30)<1e-9);m.reset();assert.equal(m.read().fps,0);
});
