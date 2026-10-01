"""Original deterministic procedural Foley; no external recordings. Python standard library."""
import math,random,wave,struct,json
from pathlib import Path
R=22050
spec={'blade':(.42,1700,90),'impact':(.3,900,55),'arrow':(.38,3100,400),'flame':(.85,1000,70),'ice':(.65,4700,1450),'thunder':(.9,3500,45),'heal':(1.15,2400,660),'forge':(.8,1900,320),'portal':(1.4,1200,90),'step':(.16,600,100),'chime':(.7,3000,880)}
for name,(duration,hi,lo) in spec.items():
 rand=random.Random(name);values=[];smooth=0;phase=0
 for i in range(round(duration*R)):
  t=i/R;u=t/duration;noise=rand.uniform(-1,1);smooth+=.14*(noise-smooth);phase+=2*math.pi*(hi*(lo/hi)**u)/R
  attack=min(1,t/.008);env=attack*(1-u)**2
  if name in ['heal','chime','ice']:
   frequencies=[lo,lo*1.5,lo*2,lo*2.76];sample=sum(math.sin(t*f*math.tau)*math.exp(-t*(2+j)) for j,f in enumerate(frequencies))*.15+noise*.025
  elif name=='portal':sample=math.sin(phase)*.25+smooth*.8+math.sin(t*90*math.tau)*.2;env=math.sin(math.pi*u)**.7
  elif name in ['flame','thunder']:sample=smooth*2+noise*.09+math.sin(phase)*.18
  elif name=='forge':sample=sum(math.sin(t*f*math.tau)*math.exp(-t*(6+j*2)) for j,f in enumerate([320,843,1372,2347]))*.19+noise*.2*math.exp(-t*25)
  else:sample=noise*.35+smooth*.8+math.sin(phase)*.15
  values.append(max(-.85,min(.85,sample*env)))
 with wave.open(str(Path(__file__).parent/(name+'.wav')),'wb') as f:f.setnchannels(1);f.setsampwidth(2);f.setframerate(R);f.writeframes(b''.join(struct.pack('<h',int(v*32767)) for v in values))
(Path(__file__).parent/'README.md').write_text('原创程序化音效素材，由 generate.py 使用确定性噪声、金属泛音、频率滑变与包络合成。无第三方录音。11 件 PCM WAV / 22050 Hz / mono / 16 bit。用于刀剑、命中、箭矢、火焰、冰霜、雷电、治疗、锻造、传送、脚步与界面铃音。\n')
