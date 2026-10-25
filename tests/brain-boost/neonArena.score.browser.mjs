import assert from 'node:assert/strict';
import { createServer } from 'vite';
const { chromium }=await import(process.env.NEON_PLAYWRIGHT_MODULE||'playwright');
const server=await createServer({server:{host:'127.0.0.1',port:5193,strictPort:true}});let browser;
try{
 await server.listen();browser=await chromium.launch({executablePath:process.env.NEON_BROWSER_EXECUTABLE,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const format of ['ogg','mp3','fallback']){
  const blocked=format==='fallback';
  const context=await browser.newContext({viewport:{width:1100,height:950},reducedMotion:'reduce'}),page=await context.newPage(),errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.url().includes('/audio/containment/'))requests.push(r.url())});
  await page.addInitScript(format=>{
   if(format==='mp3'){const can=HTMLMediaElement.prototype.canPlayType;HTMLMediaElement.prototype.canPlayType=function(type){return type.includes('ogg')?'':can.call(this,type)}}
   localStorage.setItem('digitalboost_app_screen','main');localStorage.setItem('digitalboost:brain-boost:audio-enabled:v1','true');
   window.qaLoops=new Set();window.qaStarts=[];window.qaDecoded=[];window.qaTimers=new Set();
   const start=AudioBufferSourceNode.prototype.start,decode=AudioContext.prototype.decodeAudioData,connect=AudioNode.prototype.connect,set=window.setInterval,clear=window.clearInterval;
   AudioBufferSourceNode.prototype.start=function(...args){if(this.loop){window.qaLoops.add(this);window.qaStarts.push(args);this.addEventListener('ended',()=>window.qaLoops.delete(this),{once:true})}return start.apply(this,args)};
   AudioContext.prototype.decodeAudioData=function(...args){return decode.apply(this,args).then(b=>{window.qaDecoded.push({duration:b.duration,bytes:b.length*b.numberOfChannels*4});return b})};
   AudioNode.prototype.connect=function(target,...args){if(target instanceof AudioDestinationNode){const a=this.context.createAnalyser();a.fftSize=2048;window.qaMeter=a;connect.call(this,a);return connect.call(a,target)}return connect.call(this,target,...args)};
   window.qaRms=()=>{if(!window.qaMeter)return 0;const data=new Float32Array(2048);window.qaMeter.getFloatTimeDomainData(data);return Math.sqrt(data.reduce((s,v)=>s+v*v,0)/data.length)};
   window.setInterval=(fn,...args)=>{const id=set(fn,...args);if(new Error().stack.includes('brainBoostAudio'))window.qaTimers.add(id);return id};window.clearInterval=id=>{window.qaTimers.delete(id);clear(id)};
  },format);
  if(blocked)await page.route('**/audio/containment/**',route=>route.abort());
  await page.goto('http://127.0.0.1:5193/',{waitUntil:'networkidle'});
  await page.getByRole('button',{name:'Nightmare Protocolo',exact:true}).click();await page.getByRole('button',{name:/Neon Arena: Virus Survivor/}).click();await page.waitForSelector('[data-neon-phase="READY"]');
  assert.equal(requests.length,0,'music resources stay lazy until play');
  await page.getByRole('button',{name:'Iniciar supervivencia →',exact:true}).click();
  await page.evaluate(async()=>{window.qaScore=await import('/src/brain-boost/neon-arena/ContainmentScore.ts')});
  await page.waitForFunction(blocked=>window.qaScore.getContainmentStatus()===(blocked?'fallback':'score'),blocked);
  await page.waitForFunction(()=>window.qaRms()>.0001);assert.equal(await page.evaluate(()=>window.qaTimers.size),1);
  if(!blocked){
   assert.equal(await page.evaluate(()=>window.qaLoops.size),4);assert.equal(await page.evaluate(()=>window.qaDecoded.length),4);
   assert.ok(requests.every(url=>url.endsWith(`.${format}`)));
   const starts=await page.evaluate(()=>window.qaStarts);assert.ok(starts.every(s=>s[0]===starts[0][0]&&s[1]===starts[0][1]));
   const decoded=await page.evaluate(()=>window.qaDecoded);assert.ok(decoded.every(b=>Math.abs(b.duration-15)<.08));console.log(`${format}: four synchronized stems, decoded PCM ${(decoded.reduce((s,b)=>s+b.bytes,0)/1048576).toFixed(2)} MiB, measured RMS ${await page.evaluate(()=>window.qaRms())} PASS`);
  }else assert.equal(await page.evaluate(()=>window.qaLoops.size),0);
  await page.getByRole('button',{name:'Pausa',exact:true}).click();await page.waitForFunction(()=>window.qaLoops.size===0&&window.qaTimers.size===0);await page.waitForTimeout(650);assert.ok(await page.evaluate(()=>window.qaRms())<.0001);
  await page.getByRole('slider',{name:'Volumen de música',exact:true}).focus();await page.keyboard.press('Home');for(let i=0;i<7;i++)await page.keyboard.press('ArrowRight');
  await page.getByRole('button',{name:'Reanudar partida',exact:true}).click();await page.waitForFunction(()=>window.qaTimers.size===1);
  if(!blocked){await page.waitForFunction(()=>window.qaLoops.size===4);assert.equal(await page.evaluate(()=>window.qaDecoded.length),4,'decoded cache is bounded and reused across pause');}
  await page.getByRole('button',{name:'Sonido ON',exact:true}).click();await page.waitForFunction(()=>window.qaLoops.size===0&&window.qaTimers.size===0);
  await page.getByRole('button',{name:'Salir',exact:true}).click();await page.waitForTimeout(400);assert.equal(await page.evaluate(()=>window.qaLoops.size),0);assert.deepEqual(errors,[]);
  assert.equal(await page.evaluate(()=>window.qaScore.getContainmentStatus()),'idle');
  if(format==='ogg'){
   await page.getByRole('button',{name:/Neon Arena: Virus Survivor/}).click();await page.waitForSelector('[data-neon-phase="READY"]');
   await page.getByRole('button',{name:'Sonido OFF',exact:true}).click();
   await page.getByRole('button',{name:'Iniciar supervivencia →',exact:true}).click();await page.waitForFunction(()=>window.qaScore.getContainmentStatus()==='score');
   assert.equal(await page.evaluate(()=>window.qaDecoded.length),8,'exit releases the old four-buffer cache');assert.equal(await page.evaluate(()=>window.qaLoops.size),4);
   await page.getByRole('button',{name:'Salir',exact:true}).click();await page.waitForFunction(()=>window.qaLoops.size===0&&window.qaTimers.size===0);
  }
  console.log(`${blocked?'asset failure -> audible synthesis fallback':'score'}: one scheduler, pause silence, resume, volume, mute, exit PASS`);await context.close();
 }
}finally{await browser?.close();await server.close();}
