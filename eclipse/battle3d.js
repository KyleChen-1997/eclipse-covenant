import * as THREE from 'three';
import {GLTFLoader} from './vendor/three/addons/loaders/GLTFLoader.js';
import {clone as cloneRig} from './vendor/three/addons/utils/SkeletonUtils.js';
import {SanctumArt} from './battle-art.js';
import {HeroAvatar} from './hero-models.js';
import {RoomEnvironment} from './vendor/three/addons/environments/RoomEnvironment.js';

const profiles={
 seraphine:['wizard','#ff4569','orb'],ragnar:['warrior','#ff604d','sword'],elysium:['cleric','#b8f8ff','staff'],
 milo:['wizard','#8ebfb0','lantern'],lark:['ranger','#78d9c4','feather'],scarlet:['monk','#ed6f65','flame'],
 selene:['warrior','#adceff','moon'],astra:['cleric','#d7b1ff','stars'],bran:['warrior','#b9976b','shield'],
 flora:['cleric','#8bd5a3','flower'],nix:['ranger','#81c4ef','frost'],vesper:['warrior','#cc718d','rose'],
 aurelia:['cleric','#ffda8b','sun'],finch:['monk','#dfbd75','gear'],quill:['ranger','#c7c891','feather'],
 lyra:['cleric','#7ddfda','tide'],orion:['warrior','#aea9ff','storm'],noctis:['wizard','#bf9dff','clock'],
 tessa:['cleric','#91d6bb','flower'],rune:['wizard','#93cafa','frost'],ignis:['warrior','#ff9269','flame'],eirene:['cleric','#d0eec1','sun'],caelum:['warrior','#9fcaff','stars']
};
const cache=new Map();
function model(name){if(!cache.has(name)){const p=new GLTFLoader().loadAsync(`assets/models/${name}.glb`).catch(e=>{cache.delete(name);throw e;});cache.set(name,p);}return cache.get(name);}
const v=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const ease=t=>t*t*(3-2*t);
function material(color,metal=.3,rough=.65){return new THREE.MeshStandardMaterial({color,metalness:metal,roughness:rough});}
function emissive(color,power=2){return new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:power,roughness:.3,metalness:.25});}

export class BattleScene {
 constructor(host,battle,core,{onProgress=()=>{},onError=()=>{},onImpact=()=>{}}={}){
  this.host=host;this.battle=battle;this.core=core;this.onProgress=onProgress;this.onError=onError;this.onImpact=onImpact;this.units=new Map();this.fx=[];this.running=false;this.speed=1;this.time=0;this.disposed=false;this.activeEvent=null;this.orbit=.48;this.cinematic=true;this.cameraShake=0;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  this.stage=core.battleStage(battle);this.palette={crimson:['#240c20','#3c172a','#ff5279','#bb826a'],prism:['#152134','#34405a','#c6f6ff','#ddc7ec'],moon:['#101527','#1c2638','#a498ff','#6c8cba'],ember:['#25151c','#39272b','#ff9873','#d38a54'],frost:['#10232c','#203843','#8fe6ee','#85bacf'],void:['#181128','#2c2341','#c194ff','#ac86dc'],dawn:['#242035','#444052','#ffe1a2','#ddc993'],tempest:['#101d33','#263755','#88bfff','#809cf2']}[this.stage.theme]||['#101527','#1c2638','#a498ff','#6c8cba'];
  this.scene=new THREE.Scene();this.scene.background=new THREE.Color(this.palette[0]);this.scene.fog=new THREE.Fog(this.palette[0],20,44);
  this.camera=new THREE.PerspectiveCamera(37,1,.1,120);
  this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.08;
  this.renderer.domElement.setAttribute('aria-label','三维战场：带骨骼动作的角色与怪物');this.renderer.domElement.setAttribute('role','img');this.host.append(this.renderer.domElement);
  this.labels=document.createElement('div');this.labels.className='world-labels';this.host.append(this.labels);
  this.announcement=document.createElement('div');this.announcement.className='world-announcement';this.announcement.setAttribute('aria-hidden','true');this.host.append(this.announcement);this.flashOverlay=document.createElement('div');this.flashOverlay.className='impact-flash';this.host.append(this.flashOverlay);
  const pmrem=new THREE.PMREMGenerator(this.renderer),room=new RoomEnvironment();this.environment=pmrem.fromScene(room,.04);this.scene.environment=this.environment.texture;room.dispose();pmrem.dispose();
  this.buildArena();this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(host);this.resize();
  this.onLost=e=>{e.preventDefault();this.running=false;this.onError(new Error('三维画面中断，请重新加载战场。'));};this.renderer.domElement.addEventListener('webglcontextlost',this.onLost);
  this.bindCamera();this.lastFrame=performance.now();this.frame=this.frame.bind(this);this.frameId=requestAnimationFrame(this.frame);
  this.ready=this.loadUnits();
 }
 mesh(geo,mat,position,parent=this.scene){const m=new THREE.Mesh(geo,mat);m.position.copy(position);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 buildArena(){this.world=new SanctumArt(this);}
 async loadUnits(){
  const descriptors=[...this.battle.allies.map(a=>({side:'ally',data:a,profile:profiles[a.id]})),...this.battle.enemies.map((a,i)=>({side:'enemy',data:a,profile:[a.model||'orc','#cd829e','enemy']}))];
  const names=[...new Set(descriptors.map(d=>d.profile[0]))];let loaded=0;
  await Promise.all(names.map(async n=>{await model(n);this.onProgress(++loaded,names.length);}));
  if(this.disposed)return;
  for(const d of descriptors)this.addUnit(d,await model(d.profile[0]));
  this.laidOut=false;this.resize();this.update(this.battle);this.render();
 }
 addUnit({side,data,profile},gltf){
  const root=new THREE.Group(),visual=new THREE.Group(),rig=cloneRig(gltf.scene);visual.add(rig);root.add(visual);this.scene.add(root);
  const height=side==='enemy'?(this.stage.boss?3.7:2.55):2.65;
  rig.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;
   const convert=original=>{const isMetal=/sword|staff|weapon|armor/i.test(o.name+' '+original.name),m=new THREE.MeshStandardMaterial({map:original.map||null,color:original.color?.clone()||new THREE.Color('white'),transparent:original.transparent,opacity:original.opacity,alphaTest:original.alphaTest||0,side:original.side,metalness:isMetal?.68:profile[0]==='warrior'?.38:.08,roughness:isMetal?.3:.65,envMapIntensity:.75});m.name=original.name+'-lit';if(side==='ally')m.color.lerp(new THREE.Color(profile[1]),.1);else m.color.lerp(new THREE.Color(this.palette[1]),.46);return m;};o.material=Array.isArray(o.material)?o.material.map(convert):convert(o.material);
  });
  const mixer=new THREE.AnimationMixer(rig),clips=new Map(gltf.animations.map(a=>[a.name.toLowerCase(),a]));
  const key=side+'-'+data.id,color=profile[1],unit={key,side,data,root,rig,mixer,clips,height,color,profile,headBone:null,home:v(),facing:0,action:null,returnAt:0,dead:false,deathAt:Infinity,flash:0};
  this.units.set(key,unit);
  const label=document.createElement('article');label.className='world-unit '+(side==='enemy'?'hostile':'friendly');label.dataset.unit=key;this.labels.append(label);unit.label=label;
  this.play(unit,['idle_weapon','idle'],true);mixer.update(Math.abs(Math.sin(this.units.size))*1.5);if(side==='ally'){rig.traverse(o=>{if(o.isBone&&o.name.toLowerCase().startsWith('head'))unit.headBone=o;});unit.headBone?.scale.setScalar(.8);}
  rig.updateWorldMatrix(true,true);rig.traverse(o=>{if(o.isSkinnedMesh)o.skeleton.update();});
  const posed=new THREE.Box3().setFromObject(rig,true),size=posed.getSize(v()),center=posed.getCenter(v()),scale=height/size.y;
  visual.scale.set(scale*(side==='ally'?.9:1),scale,scale*(side==='ally'?.92:1));visual.position.set(-center.x*scale,-posed.min.y*scale+.12,-center.z*scale);this.cosmetics(unit);if(side==='ally')unit.avatar=new HeroAvatar(unit,this.core);else this.world.adorn(unit,2);
 }
 cosmetics(u){
  const h=u.side==='ally'?this.core.hero(u.data.id):null,rank=h?this.core.RANKS.indexOf(h.rarity):2,color=u.color;
  const disc=this.mesh(new THREE.RingGeometry(.43,.49,48),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.6,side:THREE.DoubleSide}),v(0,.11,0),u.root);disc.rotation.x=-Math.PI/2;u.disc=disc;
  // Accessories sit in model space; the underlying figure remains a skinned mesh.
  if(rank>=3){const orbit=new THREE.Group();orbit.position.y=u.height*.7;u.root.add(orbit);for(let i=0;i<(rank>=4?5:3);i++){const a=i/(rank>=4?5:3)*Math.PI*2;const gem=this.mesh(new THREE.OctahedronGeometry(.065),emissive(color,2),v(Math.sin(a)*.8,.12*Math.sin(a*2),Math.cos(a)*.8),orbit);gem.rotation.z=a;}u.orbit=orbit;}
  if(h&&['frost','flame','flower','tide','gear'].includes(u.profile[2])){
   for(let j=0;j<3;j++){const a=j*2.1;this.mesh(new THREE.OctahedronGeometry(.055),emissive(color,1),v(Math.sin(a)*.38,1.1+j*.2,Math.cos(a)*.35),u.root);}
  }
  u.shield=this.mesh(new THREE.SphereGeometry(.86,24,16),new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{tint:{value:new THREE.Color('#a1d0ff')}},vertexShader:'varying vec3 n; varying vec3 p; void main(){ n=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); p=mv.xyz; gl_Position=projectionMatrix*mv; }',fragmentShader:'uniform vec3 tint; varying vec3 n; varying vec3 p; void main(){ float rim=pow(1.0-abs(dot(normalize(n),normalize(-p))),2.5); gl_FragColor=vec4(tint,rim*0.4); }'}),v(0,u.height*.5,0),u.root);u.shield.scale.y=1.6;u.shield.visible=false;
 }
 play(u,names,loop=false,duration){
  const clip=names.map(n=>u.clips.get(n)).find(Boolean)||[...u.clips.values()].find(c=>names.some(n=>c.name.toLowerCase().includes(n)));
  if(!clip)return;
  const action=u.mixer.clipAction(clip);if(u.action===action&&loop)return;
  action.reset();action.enabled=true;action.setEffectiveWeight(1);action.setLoop(loop?THREE.LoopRepeat:THREE.LoopOnce,loop?Infinity:1);action.clampWhenFinished=!loop;action.setEffectiveTimeScale(duration?clip.duration/duration:1);
  if(u.action&&u.action!==action)u.action.fadeOut(.1);action.fadeIn(.1).play();u.action=action;
  u.returnAt=loop||u.dead?Infinity:this.time+(duration||clip.duration);
 }
 layout(){
  const narrow=this.width/this.height<1.35,allies=[...this.units.values()].filter(u=>u.side==='ally'),foes=[...this.units.values()].filter(u=>u.side==='enemy');this.narrow=narrow;
  allies.forEach((u,i)=>{
   if(narrow){const front=i<2;u.home.set(front?(i-.5)*2.6:(i-3)*2.6,.1,front?1:3.4);if(allies.length<=3)u.home.set((i-(allies.length-1)/2)*2.7,.1,2.6);u.facing=Math.PI;}
   else {u.home.set(i<2?-1.85:-5.0+(i-2)*.55,.1,i<2?(i-.5)*3.2:(i-3)*3.5);u.facing=Math.PI/2;}
   u.motion=null;u.root.position.copy(u.home);u.root.rotation.y=u.facing;
  });
  foes.forEach((u,i)=>{u.home.set(narrow?(i-(foes.length-1)/2)*2.7:3.3,.1,narrow?-3.3:(i-(foes.length-1)/2)*2.8);u.facing=narrow?0:-Math.PI/2;u.root.position.copy(u.home);u.root.rotation.y=u.facing;});
 }
 resize(){
  if(this.disposed)return;const r=this.host.getBoundingClientRect();if(r.width<10||r.height<10)return;const changed=this.width!==r.width||this.height!==r.height;this.width=r.width;this.height=r.height;this.renderer.setSize(this.width,this.height,false);
  this.world.resize(this.width,this.height);this.camera.aspect=this.width/this.height;this.camera.updateProjectionMatrix();if(changed||!this.laidOut){this.layout();this.laidOut=true;}this.positionCamera();this.render();
 }
 positionCamera(){
  const angle=this.orbit,r=this.narrow?22:16.8;let focus=v(0,this.narrow?1.15:1.25,0),zoom=1,shake=0;
  if(this.cinematic&&!this.reduced&&this.activeEvent){const e=this.activeEvent,t=this.time-e.start,actor=e.ev.actor?this.units.get(e.ev.actor.side+'-'+e.ev.actor.id):null,f=Math.sin(Math.PI*Math.min(1,t/(e.ev.ultimate?1.95:1.1)));if(actor){focus.x=actor.home.x*f*(e.ev.ultimate?.12:.025);focus.z=actor.home.z*f*.025;}zoom=1+f*(e.ev.ultimate?.075:.015);if(e.hit)shake=Math.max(0,1-(t-(e.ev.ultimate?.86:.32))/.2)*(e.ev.ultimate?.055:.025);}
  this.camera.position.set(Math.sin(angle)*r+Math.sin(this.time*82)*shake,this.narrow?12.6:6.8,Math.cos(angle)*r);this.camera.lookAt(focus);if(this.camera.zoom!==zoom){this.camera.zoom=zoom;this.camera.updateProjectionMatrix();}
 }
 setCinematic(enabled){this.cinematic=!!enabled;this.positionCamera();this.render();}
 bindCamera(){
  const canvas=this.renderer.domElement;let drag=null;
  canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,orbit:this.orbit};canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!drag)return;this.orbit=THREE.MathUtils.clamp(drag.orbit+(e.clientX-drag.x)*.004,-.7,.7);this.positionCamera();this.render();});
  canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',()=>drag=null);
 }
 resetCamera(){this.orbit=.48;this.positionCamera();this.render();}
 update(b){
  this.battle=b;
  for(const u of this.units.values()){
   const a=(u.side==='ally'?b.allies:b.enemies).find(a=>a.id===u.data.id);u.data=a;const h=u.side==='ally'?this.core.hero(a.id):null,name=h?.name||a.name;
   u.label.setAttribute('aria-label',`${name}，生命${a.hp}/${a.maxHp}${a.shield?'，护盾'+a.shield:''}`);
   u.label.innerHTML=`<div class="world-name"><span style="color:${u.color}">${h?.rarity||'敌'}</span> ${name}</div><div class="world-hp"><i style="width:${100*a.hp/a.maxHp}%"></i></div><small>${a.hp} / ${a.maxHp}${a.shield?' · 盾 '+a.shield:''}${a.frozen?' · 冻结':''}</small>`;
   u.label.classList.toggle('defeated',a.hp<=0);u.shield.visible=a.shield>0;
  }
 }
 playEvent(ev){
  if(!ev||this.disposed)return;this.clearEvent();this.activeEvent={ev,start:this.time,hit:false};
  const source=ev.actor?this.units.get(ev.actor.side+'-'+ev.actor.id):null;
  const hits=ev.impacts.filter(h=>h.type==='damage'&&h.value>0),target=hits.length?this.units.get(hits[0].side+'-'+hits[0].id):null;
  if(source){
   const ranged=['wizard','cleric','ranger'].includes(source.profile[0]);
   const motions=ev.kind==='guard'?['idle_weapon','idle']:source.profile[0]==='ranger'?['bow_shoot','bow_draw']:ranged?['spell1','staff_attack','spell2']:['sword_attack','attack','punch','weapon'];
   this.play(source,motions,false,ev.ultimate?1.6:.9);
   if(target&&!ranged&&!this.reduced){const to=target.home.clone().lerp(source.home,.27);source.motion={start:this.time,duration:.98,from:source.home.clone(),to};source.root.rotation.y=Math.atan2(target.home.x-source.home.x,target.home.z-source.home.z);}
   source.disc.material.opacity=1;
  }
  if(ev.ultimate){const hero=this.core.hero(ev.actor.id);this.announcement.style.setProperty('--cast-color',ev.color);this.announcement.innerHTML=`<div class="cutin-art" style="background-image:url(assets/heroes/${hero.art||hero.id+'-v6'}.png)"></div><div class="cutin-copy"><small>${hero.title} · ${hero.rarity==='SSP'?'IRIDESCENT SSP':hero.rarity==='SP'?'CRIMSON SP':'MYTHIC'}</small><strong>${ev.label}</strong><span>${hero.quote}</span></div>`;this.announcement.classList.add('show');}
  for(const h of ev.impacts){const u=this.units.get(h.side+'-'+h.id);if(u&&u.data.hp<=0&&!u.dead)u.deathAt=this.time+(ev.ultimate?.88:.34);}
 }
 impactEvent(ev){
  this.onImpact(ev);if(ev.impacts.some(h=>h.type==='damage'&&h.value>0)&&!this.reduced){this.flashOverlay.style.setProperty('--impact-color',ev.color);this.flashOverlay.classList.remove('pulse');void this.flashOverlay.offsetWidth;this.flashOverlay.classList.add('pulse');}
  this.elementalImpact(ev);
  const source=ev.actor?this.units.get(ev.actor.side+'-'+ev.actor.id):null;
  for(const hit of ev.impacts){
   const u=this.units.get(hit.side+'-'+hit.id);if(!u)continue;
   const pos=u.root.position.clone().add(v(0,u.height*.6,0));
   if(hit.type==='damage'&&hit.value>0){
    if(!u.dead)this.play(u,['recievehit','receivehit','hitreact','hit'],false,.36);
    this.burst(pos,ev.color,ev.ultimate?24:12,hit.type);this.float(u,'−'+hit.value,'damage');u.flash=this.time+.25;
   } else if(['heal','shield','guard','freeze','mark','absorb'].includes(hit.type)){
    if(hit.type==='heal'&&!hit.value)continue;
    const text={heal:'+'+hit.value,shield:'护盾 +'+hit.value,guard:'防御',freeze:'冻结',mark:'标记',absorb:'抵挡 '+hit.value}[hit.type];this.float(u,text,hit.type);this.ring(u.root.position,hit.type==='heal'?'#97eabc':ev.color,hit.type==='shield'?1.1:.7);
   }
  }
  if(ev.ultimate){this.ring(v(0,.12,0),ev.color,4.6);this.ring(v(0,.16,0),ev.color,2.4);}
 }
 elementalImpact(ev){
  const hits=ev.impacts.filter(h=>h.type==='damage'&&h.value>0),source=ev.actor?this.units.get(ev.actor.side+'-'+ev.actor.id):null;
  const color=ev.color||'#e4d2a7';
  for(const hit of hits){const u=this.units.get(hit.side+'-'+hit.id);if(!u)continue;const p=u.root.position.clone().add(v(0,1.15,0));
   if(['lightning','astral','solar','time'].includes(ev.fx)||ev.ultimate){
    const points=[];for(let i=0;i<7;i++)points.push(p.clone().add(v(Math.sin(i*4)*.18,4-i*.62,Math.cos(i*2)*.12)));const tube=this.mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),20,.026,5,false),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.95}),v());tube.castShadow=false;this.fx.push({mesh:tube,start:this.time,duration:.5,type:'beam'});
    const beam=this.mesh(new THREE.CylinderGeometry(.06,.5,5,20,1,true),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.28,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}),p.clone().add(v(0,1.5,0)));beam.castShadow=false;this.fx.push({mesh:beam,start:this.time,duration:.65,type:'beam'});this.ring(u.home,color,1.15);
   }else if(ev.fx==='ice'){
    for(let i=0;i<5;i++){const a=i/5*Math.PI*2,m=this.mesh(new THREE.ConeGeometry(.12,.8+(i%2)*.3,5),new THREE.MeshStandardMaterial({color:'#b9e9ff',emissive:'#538ebf',emissiveIntensity:.5,metalness:.2,roughness:.2,transparent:true,opacity:.8}),u.home.clone().add(v(Math.sin(a)*.55,.45,Math.cos(a)*.55)));this.fx.push({mesh:m,start:this.time,duration:.7,origin:m.position.clone(),velocity:v(0,.15,0),type:'ice'});}
   }else{
    const slash=this.mesh(new THREE.TorusGeometry(.7,.048,5,40,Math.PI*1.3),new THREE.MeshBasicMaterial({color:ev.fx==='fire'?'#ffb275':color,transparent:true,opacity:1,depthWrite:false,blending:THREE.AdditiveBlending}),p);slash.rotation.set(.4,.7,source?.side==='ally'?-.8:.8);slash.castShadow=false;this.fx.push({mesh:slash,start:this.time,duration:.43,type:'slash'});
   }
  }
  if(ev.ultimate){const circle=this.mesh(new THREE.RingGeometry(3.5,3.62,96),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.6,side:THREE.DoubleSide,depthWrite:false}),v(0,.18,0));circle.rotation.x=-Math.PI/2;this.fx.push({mesh:circle,start:this.time,duration:1.2,type:'ring'});}
 }
 burst(pos,color,count,type){
  for(let i=0;i<count;i++){const m=this.mesh(new THREE.OctahedronGeometry(.035+(i%3)*.015),new THREE.MeshBasicMaterial({color,transparent:true}),pos.clone());m.castShadow=false;this.fx.push({mesh:m,start:this.time,duration:.65,velocity:v(Math.sin(i*2.4)*2,(i%5)*.4+.5,Math.cos(i*3.4)*2),origin:pos.clone(),type});}
 }
 ring(pos,color,radius){const m=this.mesh(new THREE.TorusGeometry(radius,.035,6,64),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.85,depthWrite:false}),pos.clone().add(v(0,.12,0)));m.rotation.x=-Math.PI/2;m.castShadow=false;this.fx.push({mesh:m,start:this.time,duration:1,origin:m.position.clone(),type:'ring'});}
 float(u,text,type){const el=document.createElement('div');el.className='world-float '+type;el.textContent=text;this.labels.append(el);this.fx.push({el,unit:u,start:this.time,duration:1,type:'number'});}
 projectile(ev,t){
  const source=ev.actor?this.units.get(ev.actor.side+'-'+ev.actor.id):null;if(!source)return;
  if(!this.activeEvent.projectiles){this.activeEvent.projectiles=[];for(const hit of ev.impacts.filter(x=>x.type==='damage'&&x.value>0)){const u=this.units.get(hit.side+'-'+hit.id);if(!u)continue;const m=this.mesh(new THREE.SphereGeometry(ev.ultimate?.14:.07,10,8),emissive(ev.color,4),v());m.castShadow=false;const tail=this.mesh(new THREE.ConeGeometry(.055,.6,6),new THREE.MeshBasicMaterial({color:ev.color,transparent:true,opacity:.65}),v(0,-.25,0),m);tail.rotation.z=Math.PI;this.activeEvent.projectiles.push({mesh:m,target:u});}}
  const from=source.home.clone().add(v(0,1.3,0));for(const p of this.activeEvent.projectiles){const to=p.target.home.clone().add(v(0,1.3,0));p.mesh.position.lerpVectors(from,to,t);p.mesh.position.y+=Math.sin(t*Math.PI)*.5;p.mesh.quaternion.setFromUnitVectors(v(0,1,0),to.clone().sub(from).normalize());}
 }
 removeMesh(m){m.removeFromParent();m.geometry?.dispose();m.material?.dispose();m.children.forEach(c=>{c.geometry?.dispose();c.material?.dispose();});}
 setPlayback({running,speed=1}){this.running=running;this.speed=speed;this.lastFrame=performance.now();}
 finish(won){
  this.clearEvent();for(const u of this.units.values()){if(u.data.hp<=0){this.die(u);continue;}this.play(u,won&&u.side==='ally'?['victory','idle_weapon','idle']:['idle_weapon','idle'],true);}
 }
 die(u){if(u.dead)return;u.dead=true;u.root.children.forEach(child=>{if(child!==u.rig.parent&&child!==u.avatar?.root)child.visible=false;});u.motion=null;u.root.position.copy(u.home);this.play(u,['death','die'],false,1);u.returnAt=Infinity;u.disc.material.opacity=.12;if(![...u.clips.keys()].some(k=>k.includes('death')))u.rig.rotation.z=Math.PI/2;}
 clearEvent(){if(this.activeEvent?.projectiles)this.activeEvent.projectiles.forEach(p=>this.removeMesh(p.mesh));this.activeEvent=null;this.announcement.classList.remove('show');this.announcement.replaceChildren();}
 frame(now){
  if(this.disposed)return;const dt=Math.min((now-this.lastFrame)/1000,.07)*(this.running?this.speed:0);this.lastFrame=now;this.time+=dt;
  if(dt){
   for(const u of this.units.values()){
    if(u.deathAt<=this.time)this.die(u);u.mixer.update(dt);u.headBone?.scale.setScalar(.8);if(u.capeUniform)u.capeUniform.value=this.time;
    if(this.time>=u.returnAt&&!u.dead)this.play(u,['idle_weapon','idle'],true);
    if(u.motion){const t=(this.time-u.motion.start)/u.motion.duration;if(t>=1){u.root.position.copy(u.home);u.root.rotation.y=u.facing;u.motion=null;}else {const f=t<.4?ease(t/.4):t>.65?1-ease((t-.65)/.35):1;u.root.position.lerpVectors(u.motion.from,u.motion.to,f);}}
    if(u.orbit&&!this.reduced)u.orbit.rotation.y=this.time*.7;if(u.halo&&!this.reduced)u.halo.rotation.z=Math.sin(this.time*.3)*.1;
    if(u.shield.visible)u.shield.rotation.y=this.time*.2;u.avatar?.update(this.time);
   }
   this.world.tick(this.time);
   if(this.activeEvent){const {ev,start}=this.activeEvent,t=this.time-start,impactAt=ev.ultimate?.86:.32;
    if(t<impactAt&&!this.reduced){const source=ev.actor?this.units.get(ev.actor.side+'-'+ev.actor.id):null;if(source&&(ev.ultimate||['wizard','cleric','ranger'].includes(source.profile[0])))this.projectile(ev,Math.min(1,t/impactAt));}
    if(t>=impactAt&&!this.activeEvent.hit){this.activeEvent.hit=true;this.impactEvent(ev);this.activeEvent.projectiles?.forEach(p=>this.removeMesh(p.mesh));this.activeEvent.projectiles=[];}
    if(t>(ev.ultimate?1.95:1.1))this.clearEvent();
   }
  }
  for(let i=this.fx.length-1;i>=0;i--){const f=this.fx[i],t=(this.time-f.start)/f.duration;if(t>=1){if(f.mesh)this.removeMesh(f.mesh);f.el?.remove();this.fx.splice(i,1);continue;}
   if(f.type==='ring'){f.mesh.scale.setScalar(.4+t*1.2);f.mesh.material.opacity=(1-t)*.8;}
   else if(f.type==='beam'){f.mesh.material.opacity=(1-t)*.65;f.mesh.scale.x=f.mesh.scale.z=1+t*.35;}
   else if(f.type==='slash'){f.mesh.material.opacity=1-t;f.mesh.scale.setScalar(.65+t*.8);f.mesh.rotation.z+=dt*2;}
   else if(f.mesh){f.mesh.position.copy(f.origin).addScaledVector(f.velocity,t);f.mesh.position.y-=t*t*.6;f.mesh.material.opacity=1-t;}
   else {const p=this.project(f.unit.root.position.clone().add(v(0,f.unit.height+.35+t*.6,0)));f.el.style.transform=`translate(-50%,-50%) translate(${p.x}px,${p.y}px)`;f.el.style.opacity=String(1-Math.max(0,t-.55)*2);}
  }
  if(dt){this.positionCamera();this.render();}this.frameId=requestAnimationFrame(this.frame);
 }
 project(pos){const p=pos.project(this.camera);return {x:(p.x*.5+.5)*this.width,y:(-.5*p.y+.5)*this.height};}
 render(){if(this.disposed||!this.width)return;this.renderer.render(this.scene,this.camera);for(const u of this.units.values()){const p=this.project(u.root.position.clone().add(v(0,u.height+.38,0)));u.label.style.transform=`translate(-50%,-100%) translate(${p.x}px,${p.y}px)`;}}
 dispose(){
  if(this.disposed)return;this.disposed=true;cancelAnimationFrame(this.frameId);this.resizeObserver.disconnect();this.renderer.domElement.removeEventListener('webglcontextlost',this.onLost);this.units.forEach(u=>{u.avatar?.dispose();u.mixer.stopAllAction();u.mixer.uncacheRoot(u.rig);});
  // Loaded GLTF geometry/textures belong to the cache and can be reused by the next fight.
  const cachedGeo=new Set(),cachedTex=new Set();this.units.forEach(u=>u.rig.traverse(o=>{if(o.isMesh){cachedGeo.add(o.geometry);for(const val of Object.values(o.material))if(val?.isTexture)cachedTex.add(val);}}));
  const geos=new Set(),mats=new Set();this.scene.traverse(o=>{if(o.isLight)o.shadow?.dispose();if(o.geometry&&!cachedGeo.has(o.geometry))geos.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>mats.add(m));});geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());this.world.dispose();this.environment.dispose();this.renderer.dispose();this.renderer.forceContextLoss();this.host.replaceChildren();
 }
}
