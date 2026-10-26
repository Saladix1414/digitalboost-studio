"""Containment Breach — original deterministic score, 128 BPM / D minor.
No third-party samples. Python/numpy source is the composition master.
Renders four eight-bar synchronized stems with circular delays and soft saturation.
"""
import argparse, json, subprocess, wave
from pathlib import Path
import numpy as np
SR=32000; BPM=128; BEAT=60/BPM; LENGTH=32*BEAT; N=round(SR*LENGTH)
rng=np.random.default_rng(42819)
chords=[(38,50,53,57),(38,50,53,57),(34,46,50,53),(34,46,50,53),(36,48,52,55),(36,48,52,55),(33,45,49,52),(33,45,49,52)]
def hz(note):return 440*2**((note-69)/12)
def add(track, sound, at, level=1):
 pos=round(at*SR); idx=(np.arange(len(sound))+pos)%N; np.add.at(track,idx,sound*level)
def tone(note,duration,kind='pad'):
 t=np.arange(round(duration*SR))/SR; f=hz(note)
 if kind=='pad':
  wave=np.sin(2*np.pi*f*t+.3*np.sin(2*np.pi*.23*t))+.32*np.sin(2*np.pi*(f*1.0015)*t)+.16*np.sin(2*np.pi*f*2*t)
  env=np.minimum(t/.45,1)*np.minimum((duration-t)/.8,1);return wave*env
 if kind=='bass':
  wave=np.sin(2*np.pi*f*t)+.5*np.sin(2*np.pi*2*f*t)+.22*np.sin(2*np.pi*3*f*t)+.12*np.sin(2*np.pi*4*f*t)
  return np.tanh(wave*1.3)*np.minimum(t/.005,1)*np.exp(-t*4)*np.minimum((duration-t)/.06,1)
 wave=np.sin(2*np.pi*f*t)+.23*np.sin(2*np.pi*2.002*f*t)+.12*np.sin(2*np.pi*3*f*t)
 return wave*np.minimum(t/.008,1)*np.exp(-t*5)*np.minimum((duration-t)/.08,1)
def noise(duration,cutoff,high=False):
 size=round(duration*SR);v=rng.normal(0,1,size);freq=np.fft.rfftfreq(size,1/SR);f=np.fft.rfft(v)
 curve=1/(1+(freq/max(1,cutoff))**4);f*=1-curve if high else curve;return np.fft.irfft(f,n=size)
def drum(kind):
 duration=.65 if kind=='kick' else .3 if kind=='snare' else .07 if kind=='hat' else 1.1;t=np.arange(round(duration*SR))/SR
 if kind=='kick':return np.sin(2*np.pi*(48*t+50*.025*(1-np.exp(-t/.025))))*np.exp(-t*9)+noise(duration,2800)*np.exp(-t*90)*.15
 if kind=='snare':return noise(duration,4300)*np.exp(-t*18)*.65+np.sin(2*np.pi*174*t)*np.exp(-t*20)*.28
 if kind=='hat':return noise(duration,4800,True)*np.exp(-t*75)*.3
 return sum(np.sin(2*np.pi*f*t) for f in [231,347,593,811])*np.exp(-t*6)*.05+noise(duration,2400)*np.exp(-t*7)*.15
tracks={name:np.zeros(N) for name in ['atmosphere','bass','percussion','tension']}
for bar,chord in enumerate(chords):
 at=bar*4*BEAT
 for note in chord[1:]:add(tracks['atmosphere'],tone(note,4*BEAT+1.1),at,.12)
 for beat in [0,.75,1.5,2,2.75,3.5]:add(tracks['bass'],tone(chord[0]-12,.37,'bass'),at+beat*BEAT,.36 if beat in [0,2] else .24)
 for beat in ([0,1.5,2,3.5] if bar%2==0 else [0,2,2.75]):add(tracks['percussion'],drum('kick'),at+beat*BEAT,.78)
 for beat in [1,3]:add(tracks['percussion'],drum('snare'),at+beat*BEAT,.7)
 for i in range(8):add(tracks['percussion'],drum('hat'),at+i*.5*BEAT,.58 if i%2 else .36)
 if bar in [1,3,7]:add(tracks['percussion'],drum('metal'),at+3.5*BEAT,1.0)
 motif=[chord[1]+12,chord[2]+12,chord[3]+12,chord[2]+12,chord[1]+14,chord[1]+13]
 for i,note in enumerate(motif):add(tracks['tension'],tone(note,.65,'lead'),at+(i*.5+.25)*BEAT,.15 if i in [0,4] else .10)
 if bar in [3,7]:add(tracks['tension'],tone(chord[3]+24,.9,'lead'),at+3.25*BEAT,.11)
# Circular, tempo-locked delays: no gaps/tails at the loop boundary.
for name in ['atmosphere','tension']:
 x=tracks[name]; wet=x.copy()
 for i in range(1,5):wet+=np.roll(x,round(BEAT*.75*i*SR))*(.32**i)
 tracks[name]=wet
parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path,required=True);parser.add_argument('--masters',type=Path,required=True);args=parser.parse_args();args.output.mkdir(parents=True,exist_ok=True);args.masters.mkdir(parents=True,exist_ok=True)
manifest={'title':'Containment Breach','composer':'Original composition created for DigitalBoost Studio','provenance':'Generated from the committed deterministic numpy composition; no external samples','bpm':BPM,'meter':'4/4','key':'D minor, A major dominant','bars':8,'loopSeconds':LENGTH,'sampleRate':SR,'usage':'Project-original audio; no third-party sample licenses required','stems':[]}
for name,x in tracks.items():
 x=np.tanh(x*1.1); x*=.62/max(.62,np.max(np.abs(x)))
 fade=round(.003*SR);x[:fade]*=np.linspace(0,1,fade);x[-fade:]*=np.linspace(1,0,fade)
 pcm=np.column_stack((x,np.roll(x,round(.009*SR))*.97)) if name=='atmosphere' else x
 master=args.masters/(name+'.wav')
 with wave.open(str(master),'wb') as out:out.setnchannels(2 if name=='atmosphere' else 1);out.setsampwidth(2);out.setframerate(SR);out.writeframes((np.clip(pcm,-1,1)*32767).astype('<i2').tobytes())
 for ext,codec in [('ogg',['-c:a','libvorbis','-q:a','5']),('mp3',['-c:a','libmp3lame','-b:a','128k'])]:
  subprocess.run(['ffmpeg','-v','error','-y','-i',str(master),*codec,str(args.output/(name+'.'+ext))],check=True)
 manifest['stems'].append({'name':name,'channels':2 if name=='atmosphere' else 1,'peak':float(np.max(np.abs(pcm))),'rms':float(np.sqrt(np.mean(pcm**2))),'formats':['ogg','mp3']})
(args.output/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps(manifest,indent=2))

# Reproducible one-minute listening preview; runtime stems remain independently adaptive.
mix=np.zeros((N*4,2),dtype=np.float64)
for index,name in enumerate(tracks):
 with wave.open(str(args.masters/(name+'.wav')),'rb') as source:
  channels=source.getnchannels();samples=np.frombuffer(source.readframes(N),dtype='<i2').astype(np.float64)/32768
  samples=samples.reshape(-1,channels);samples=np.repeat(samples,2,axis=1) if channels==1 else samples
 signal=np.tile(samples,(4,1));envelope=np.zeros(N*4)
 previous=0
 for bar in range(32):
  mood='start' if bar<4 else 'horde' if bar<16 else 'danger' if bar<20 else 'boss' if bar<30 else 'victory'
  phrase=bar//8%4
  levels=[.4,.08,.12,0] if mood=='start' else [.36,.12,.06,.08] if mood=='victory' else [.22,.4,.58,.23 if phrase==2 else .36] if mood=='boss' else [.26,.3,.4,.27] if mood=='danger' else [.27,.24 if phrase==2 else .34,.26 if phrase==2 else .44,0 if phrase==0 else .22 if phrase==3 else .14]
  start=round(bar*4*BEAT*SR);end=round((bar+1)*4*BEAT*SR);target=levels[index];envelope[start:end]=target;ramp=min(round(.2*SR),end-start);envelope[start:start+ramp]=np.linspace(previous,target,ramp);previous=target
 mix+=signal*envelope[:,None]
mix*=np.minimum(np.arange(N*4)/(.1*SR),1)[:,None]*np.minimum((N*4-np.arange(N*4))/(1.5*SR),1)[:,None]
preview=args.masters/'preview.wav'
with wave.open(str(preview),'wb') as out:out.setnchannels(2);out.setsampwidth(2);out.setframerate(SR);out.writeframes((np.clip(mix,-1,1)*32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg','-v','error','-y','-i',str(preview),'-af','loudnorm=I=-18:TP=-2:LRA=9','-c:a','libmp3lame','-b:a','128k',str(args.output/'preview.mp3')],check=True)
