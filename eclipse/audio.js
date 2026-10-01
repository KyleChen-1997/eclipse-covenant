(() => {
 'use strict';
 class Soundscape {
  constructor(){this.ctx=null;this.settings={volume:65,music:25,musicEnabled:true};this.muted=false;this.sources=new Set();this.musicSources=new Set();this.ambientTimer=null;this.inBattle=false;this.lobby=false;this.resumePromise=null;this.effectGeneration=0;this.onStatus=null;this.suspended=false;this.bar=0;this.theme='moon';this.boss=false;this.buffers=new Map();this.bankPromise=null;this.audioError='';}
  unlock(){
   if(this.ctx?.state==='closed'){this.ctx=null;this.resumePromise=null;}
   if(!this.ctx){
    const Constructor=window.AudioContext||window.webkitAudioContext;if(!Constructor)return Promise.resolve(false);
    this.ctx=new Constructor();const c=this.ctx;
    this.master=c.createGain();this.sfx=c.createGain();this.music=c.createGain();this.compressor=c.createDynamicsCompressor();
    this.compressor.threshold.value=-18;this.compressor.knee.value=16;this.compressor.ratio.value=4;this.compressor.attack.value=.003;this.compressor.release.value=.2;
    this.sfx.connect(this.master);this.music.connect(this.master);this.master.connect(this.compressor);if(c.createAnalyser){this.analyser=c.createAnalyser();this.analyser.fftSize=256;this.analyserData=new Float32Array(256);this.compressor.connect(this.analyser);this.analyser.connect(c.destination);}else this.compressor.connect(c.destination);
    c.onstatechange=()=>{this.refreshMusic();this.onStatus?.();};
    this.reverb=c.createConvolver();const length=Math.floor(c.sampleRate*1.4),impulse=c.createBuffer(2,length,c.sampleRate);
    for(let ch=0;ch<2;ch++){const data=impulse.getChannelData(ch);for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/length,3)*.22;}
    this.reverb.buffer=impulse;this.wet=c.createGain();this.wet.gain.value=.2;this.sfx.connect(this.reverb);this.reverb.connect(this.wet);this.wet.connect(this.master);
    this.noiseBuffer=c.createBuffer(1,c.sampleRate*2,c.sampleRate);const data=this.noiseBuffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
    this.configure(this.settings,this.muted);this.loadBank();
   }
   if(this.ctx.state==='running'){this.refreshMusic();return Promise.resolve(true);}
   if(this.ctx.state==='closed')return Promise.resolve(false);
   if(!this.resumePromise){
    try{this.resumePromise=Promise.resolve(this.ctx.resume()).then(()=>{const ready=this.ctx.state==='running';if(ready)this.audioError='';if(ready)this.refreshMusic();this.onStatus?.();return ready;},()=>{this.audioError='浏览器尚未允许播放，请点击开启声音';this.onStatus?.();return false;}).finally(()=>{this.resumePromise=null;});}catch{return Promise.resolve(false);}
   }
   return this.resumePromise;
  }
  loadBank(){
   if(this.bankPromise||typeof window.fetch!=='function'||!this.ctx.decodeAudioData)return;
   this.bankPromise=Promise.all(['blade','impact','arrow','flame','ice','thunder','heal','forge','portal','step','chime'].map(async name=>{
    try{const response=await window.fetch(`assets/audio/${name}.wav`);if(!response.ok)return;const buffer=await this.ctx.decodeAudioData(await response.arrayBuffer());this.buffers.set(name,buffer);}catch{/* Synthesized effects remain available if a sample cannot load. */}
   })).then(()=>this.onStatus?.());
  }
  sample(name,at=0,gain=.65,pan=0){
   const buffer=this.buffers.get(name);if(!buffer||this.muted||this.ctx?.state!=='running')return false;
   const c=this.ctx,source=c.createBufferSource(),amp=c.createGain(),stereo=c.createStereoPanner?c.createStereoPanner():c.createGain();source.buffer=buffer;amp.gain.value=gain;if(stereo.pan)stereo.pan.value=pan;
   source.connect(amp);amp.connect(stereo);stereo.connect(this.sfx);this.track(source);source.onended=()=>{this.sources.delete(source);source.disconnect();amp.disconnect();stereo.disconnect();};source.start(c.currentTime+at);return true;
  }
  signalLevel(){if(!this.analyser||this.ctx.state!=='running')return 0;this.analyser.getFloatTimeDomainData(this.analyserData);let peak=0;for(const x of this.analyserData)peak=Math.max(peak,Math.abs(x));return peak;}
  readyEffect(callback){const generation=this.effectGeneration,ready=this.unlock();if(this.muted)return;if(this.ctx?.state==='running'){callback();return;}ready.then(ok=>{if(ok&&!this.muted&&generation===this.effectGeneration)callback();});}
  configure(settings,muted){this.settings={...this.settings,...settings};this.muted=!!muted;if(this.ctx){const t=this.ctx.currentTime;this.master.gain.setTargetAtTime(this.muted?0:this.settings.volume/100*.68,t,.025);this.music.gain.setTargetAtTime(this.settings.musicEnabled?this.settings.music/100*.35:0,t,.05);}if(this.muted){this.stopEffects();this.stopMusic();}else this.refreshMusic();this.onStatus?.();}
  track(node,music=false){const set=music?this.musicSources:this.sources;set.add(node);node.onended=()=>{set.delete(node);node.disconnect();};return node;}
  tone(freq,duration,{at=0,gain=.1,type='sine',end=freq,pan=0,music=false,attack=.01}={}){
   if(!this.ctx||this.muted)return;const c=this.ctx,t=c.currentTime+at,osc=c.createOscillator(),amp=c.createGain(),panner=c.createStereoPanner?c.createStereoPanner():c.createGain();osc.type=type;osc.frequency.setValueAtTime(Math.max(20,freq),t);osc.frequency.exponentialRampToValueAtTime(Math.max(20,end),t+duration);amp.gain.setValueAtTime(0,t);amp.gain.linearRampToValueAtTime(gain,t+attack);amp.gain.exponentialRampToValueAtTime(.0001,t+duration);if(panner.pan)panner.pan.value=pan;osc.connect(amp);amp.connect(panner);panner.connect(music?this.music:this.sfx);this.track(osc,music);osc.start(t);osc.stop(t+duration+.02);osc.onended=()=>{(music?this.musicSources:this.sources).delete(osc);osc.disconnect();amp.disconnect();panner.disconnect();};
  }
  noise(duration,{at=0,gain=.15,filter='bandpass',freq=1300,end=freq,pan=0}={}){
   if(!this.ctx||this.muted)return;const c=this.ctx,t=c.currentTime+at,source=c.createBufferSource(),f=c.createBiquadFilter(),amp=c.createGain(),panner=c.createStereoPanner?c.createStereoPanner():c.createGain();source.buffer=this.noiseBuffer;f.type=filter;f.frequency.setValueAtTime(freq,t);f.frequency.exponentialRampToValueAtTime(Math.max(end,30),t+duration);f.Q.value=.7;amp.gain.setValueAtTime(0,t);amp.gain.linearRampToValueAtTime(gain,t+.008);amp.gain.exponentialRampToValueAtTime(.0001,t+duration);if(panner.pan)panner.pan.value=pan;source.connect(f);f.connect(amp);amp.connect(panner);panner.connect(this.sfx);this.track(source);source.start(t);source.stop(t+duration+.015);source.onended=()=>{this.sources.delete(source);source.disconnect();f.disconnect();amp.disconnect();panner.disconnect();};
  }
  bell(freq,at=0,gain=.08){this.tone(freq,.7,{at,gain});this.tone(freq*2.76,.25,{at,gain:gain*.22});}
  play(type='click',delay=0){this.readyEffect(()=>this.effect(type,delay));}
  effect(type,delay=0){
   if(this.muted)return;
   if(type==='step'){this.sample('step',0,.28);return;}
   if(type==='click'){this.tone(780,.09,{gain:.06,end:520});return;}
   if(type==='enhance'){this.sample('forge',0,.9);[330,660,990].forEach((f,i)=>this.bell(f,.16+i*.09,.06));return;}
   if(type==='page'){this.sample('chime',0,.4);this.tone(440,.25,{gain:.05,end:660});return;}
   if(type==='summon-charge'){this.sample('portal',0,.6);this.tone(65,1.4,{gain:.065,end:160,attack:.3});this.noise(1.2,{gain:.035,freq:150,end:1600});return;}
   if(type==='sp'||type==='sp-prism'){
    const prism=type==='sp-prism',notes=prism?[261.63,392,523.25,659.25,783.99,1046.5,1318.5]:[146.83,220,293.66,349.23,440,587.33];
    this.tone(prism?65.41:49,1.8,{gain:.12,end:prism?130.81:36.71,attack:.04});this.noise(1.2,{gain:.07,freq:150,end:5500});
    notes.forEach((f,i)=>{this.bell(f,.06+i*.11,.055);this.tone(f,2.4,{at:.35+i*.06,gain:.018,type:'triangle',attack:.2,pan:i%2?.45:-.45});});
    [1,1.25,1.5,2].forEach((ratio,i)=>this.bell((prism?1046.5:587.33)*ratio,1.1+i*.13,.026));return;
   }
   if(type==='summon'||type==='ur'){this.noise(.8,{gain:.06,freq:350,end:4500});[261.63,392,523.25,659.25,1046.5].forEach((f,i)=>this.bell(f,i*.12,type==='ur'?.09:.065));return;}
   if(type==='equip'||type==='unequip'){this.sample('forge',0,.5);this.noise(.075,{freq:2400,end:800,gain:.06});this.tone(type==='equip'?420:620,.18,{end:type==='equip'?840:310,gain:.045,type:'triangle'});this.bell(type==='equip'?1320:660,.1,.03);return;}
   if(type==='travel'){this.noise(.3,{freq:600,end:1800,gain:.035});this.tone(220,.45,{end:330,gain:.04,type:'triangle'});return;}
   if(type==='ascend'){this.noise(.9,{freq:180,end:4500,gain:.09});this.tone(65,1.2,{end:220,gain:.08});[261.63,392,523.25,659.25,783.99,1046.5,1568].forEach((f,i)=>this.bell(f,.12+i*.12,.065));[523.25,659.25,783.99].forEach(f=>this.tone(f,1.8,{at:.8,gain:.045,type:'triangle',attack:.08}));return;}
   if(type==='loot'||type==='loot-rare'){this.noise(.22,{at:delay,freq:1800,end:4200,gain:.035});const notes=type==='loot-rare'?[523.25,659.25,783.99,1046.5,1568]:[659.25,880,1046.5];notes.forEach((f,i)=>this.bell(f,delay+i*.085,.045));return;}
   if(type==='level'){[523.25,659.25,783.99,1046.5].forEach((f,i)=>this.bell(f,delay+.08*i,.05));return;}
   if(type==='win'){[261.63,329.63,392,523.25,659.25,783.99].forEach((f,i)=>this.tone(f,1.3,{at:i*.09,gain:.045,type:'triangle'}));this.bell(1046.5,.55,.08);return;}
   if(type==='lose'){[293.66,261.63,220].forEach((f,i)=>this.tone(f,.9,{at:i*.25,gain:.04,type:'triangle'}));return;}
   if(type==='start'){this.sample('portal',0,.65);this.tone(110,.7,{end:55,gain:.16});this.noise(.55,{freq:400,end:80,gain:.13,filter:'lowpass'});this.bell(440,.18,.04);}
  }
  combat(ev,speed=1,preview=false,immediate=false){
   if(!ev||this.muted||this.suspended&&!preview)return;this.readyEffect(()=>this.combatEffect(ev,speed,immediate));
  }
  combatEffect(ev,speed,immediate){
   const d=immediate?0:(ev.ultimate?.86:.32)/speed,pan=ev.actor?.side==='enemy'?.38:-.38;
   if(ev.kind==='round'){this.tone(260,.1,{gain:.035});return;}
   if(ev.kind==='guard'){this.tone(330,.25,{gain:.035,pan});this.bell(660,.08,.02);return;}
   if(ev.ultimate){this.sample('portal',0,.65,pan);this.sample('thunder',d,.85,-pan);this.noise(.6/speed,{gain:.13,freq:200,end:2800,pan});this.tone(90,.85/speed,{end:300,gain:.1,pan});[220,329.63,440,659.25].forEach((f,i)=>this.tone(f,.8,{at:d+i*.025,gain:.06,type:'triangle'}));this.tone(70,.55,{at:d,gain:.21,end:28});this.noise(.55,{at:d,gain:.22,freq:1800,end:120,filter:'lowpass'});return;}
   const fx=ev.fx;this.sample({fire:'flame',ice:'ice',time:'ice',lightning:'thunder',heal:'heal',tide:'heal',shield:'chime',arrow:'arrow',bolt:'arrow'}[fx]||'blade',d,.7,pan);
   const healing=ev.impacts.some(h=>h.type==='heal'&&h.value>0),damage=ev.impacts.some(h=>h.type==='damage'&&h.value>0);
   if(healing&&['heal','tide'].includes(fx)){[523.25,659.25,783.99].forEach((f,i)=>this.bell(f,d+i*.08/speed,.045));this.noise(.5,{gain:.022,freq:3400,pan});}
   else if(['shield','tide'].includes(fx)){this.tone(196,.45,{gain:.045,pan});[880,1320].forEach(f=>this.bell(f,d,.026));}
   else if(fx==='arrow'||fx==='bolt'){this.noise(.19/speed,{gain:.12,freq:2200,end:900,pan});this.tone(370,.09,{at:d,gain:.04,end:95,pan:-pan});this.noise(.11,{at:d,gain:.1,freq:700,pan:-pan});}
   else if(fx==='fire'){this.noise(.45/speed,{gain:.13,filter:'lowpass',freq:2800,end:230,pan});this.tone(90,.27,{at:d,gain:.1,end:30});for(let i=0;i<3;i++)this.noise(.045,{at:d+i*.07,gain:.075,freq:1400+i*600});}
   else if(fx==='ice'||fx==='time'){[1100,1570,2310].forEach((f,i)=>this.bell(f,d+i*.045,.032));this.noise(.16,{at:d,gain:.1,freq:3800,end:800});}
   else if(fx==='lightning'){this.noise(.17,{at:d,gain:.21,freq:4000,end:300});this.tone(60,.38,{at:d,gain:.12,end:25});this.noise(.42,{at:d+.06,gain:.06,freq:250,filter:'lowpass'});}
   else {this.noise(.18/speed,{gain:.095,freq:1700,end:650,pan});if(damage){this.sample('impact',d,.6,-pan);this.noise(.12,{at:d,gain:.14,freq:950,pan:-pan});this.tone(130,.12,{at:d,gain:.1,end:48,pan:-pan});[860,1420].forEach(f=>this.tone(f,.14,{at:d,gain:.016,type:'triangle'}));}}
   if(ev.impacts.some(h=>h.type==='absorb')){this.bell(740,d,.035);this.tone(185,.2,{at:d,gain:.03,end:92});}
   if(ev.impacts.some(h=>h.type==='freeze')){this.bell(1760,d,.025);this.noise(.08,{at:d,freq:4800,end:2200,gain:.035});}
   if(fx==='drain'){this.tone(240,.4,{at:d,end:480,gain:.035,type:'triangle',pan});}

  }
  settlement(won,reward){this.play(won?'win':'lose');if(reward?.experience?.some(x=>x.level>x.fromLevel))this.play('level',1.15);if(reward?.gear?.length){const rare=reward.gear.some(g=>/-ssr$|-ur$|-sp$|-ssp$/.test(g.template));this.play(rare?'loot-rare':'loot',1.7);}}
  setLobby(active){if(this.lobby===active)return;this.lobby=active;this.stopMusic();this.bar=0;this.refreshMusic();}
  setBattle(active,stage={}){if(active){this.stopMusic();this.bar=0;this.theme=stage.theme||'moon';this.boss=!!stage.boss;}this.inBattle=active;this.refreshMusic();}
  setSuspended(value){if(this.suspended===value)return;this.suspended=value;if(value){this.stopEffects();this.stopMusic();}else this.refreshMusic();}
  stopEffects(){this.effectGeneration++;for(const s of [...this.sources]){try{s.stop();}catch{}}this.sources.clear();}
  stopMusic(){clearTimeout(this.ambientTimer);this.ambientTimer=null;for(const s of [...this.musicSources]){try{s.stop();}catch{}}this.musicSources.clear();}
  refreshMusic(){
   if(!this.ctx||this.ctx.state!=='running'||(!this.inBattle&&!this.lobby)||this.suspended||this.muted||!this.settings.musicEnabled||!this.settings.volume||!this.settings.music){this.stopMusic();return;}if(this.ambientTimer!==null)return;
   const themes={lobby:{roots:[130.81,164.81,174.61,146.83],ratio:[1,1.2599,1.498],tone:'sine'},dawn:{roots:[164.81,174.61,196,130.81],ratio:[1,1.2599,1.498],tone:'triangle'},tempest:{roots:[146.83,110,130.81,164.81],ratio:[1,1.498,2],tone:'triangle'},moon:{roots:[146.83,130.81,164.81,110],ratio:[1,1.5,2],tone:'triangle'},ember:{roots:[110,130.81,98,116.54],ratio:[1,1.498,2.378],tone:'triangle'},frost:{roots:[174.61,146.83,130.81,164.81],ratio:[1,1.2599,2],tone:'sine'},void:{roots:[82.41,98,73.42,110],ratio:[1,1.498,2.378],tone:'sine'}};
   const key=this.lobby?'lobby':this.theme,theme=themes[key]||themes.moon,root=theme.roots[this.bar++%4],chord=theme.ratio.map(n=>root*n);
   chord.forEach((f,i)=>this.tone(f,3.9,{music:true,gain:.105,attack:.8,at:i*.13}));
   [0,1,2,1,2,0].forEach((n,i)=>this.tone(chord[n]*(key==='frost'?4:2),1.1,{music:true,gain:key==='frost'?.032:.04,attack:.02,at:i*.53,type:theme.tone,pan:(i%2?1:-1)*.3}));
   if(!this.lobby&&(this.boss||key==='ember'||key==='tempest'))for(let i=0;i<(this.boss?4:2);i++){this.tone(85,.32,{music:true,at:i*.8,end:32,gain:.16,type:'sine'});this.tone(180,.06,{music:true,at:i*.8,gain:.025,end:55});}
   if(key==='void')this.tone(root/2,3.6,{music:true,gain:.12,attack:.8});
   this.ambientTimer=setTimeout(()=>{this.ambientTimer=null;this.refreshMusic();},3200);
  }
  dispose(){this.inBattle=false;this.lobby=false;this.stopEffects();this.stopMusic();this.ctx?.close();}
 }
 window.EclipseSound=Soundscape;
})();
