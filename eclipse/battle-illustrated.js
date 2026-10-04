import * as T from 'three';
import {BattleScene as World} from './battle3d.js';
const textures=new Map(),v=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
const starters=['milo','lark','scarlet','selene','astra'];
const atlases=[
 ['extra',1672,941,['seraphine','ragnar','caelum','sirius']],
 ['mythic',1983,793,['aurelia','noctis','vega','astreus','solara']],
 ['crimson',1983,793,['valeria','severin','morwen','thalor','aevor']],
 ['prismatic',1536,1024,['anamnesis','causalia','nullion']]
];
function art(h){
 if(h.id==='elysium')return {url:'assets/combat/elysium.png',tile:[0,0,1,1],aspect:1024/1536,cutout:true};
 if(starters.includes(h.id))return {url:'assets/combat/party.png',tile:[starters.indexOf(h.id)/5,0,.2,1],aspect:370/850,cutout:true};
 for(const [file,w,height,ids] of atlases)if(ids.includes(h.id))return {url:`assets/combat/${file}.png`,tile:[ids.indexOf(h.id)/ids.length,0,1/ids.length,1],aspect:w/ids.length/height,cutout:true};
 if(h.art)return {url:`assets/heroes/${h.art}.png`,tile:[0,0,1,1],aspect:2/3,cutout:false};
 const cols=h.sheet==='binary'?2:5;return {url:`assets/heroes-${h.sheet||'dawn'}.png`,tile:[(h.index||0)/cols,0,1/cols,1],aspect:2/3,cutout:false};
}
async function texture(url){if(!textures.has(url))textures.set(url,new T.TextureLoader().loadAsync(url).then(t=>{t.colorSpace=T.SRGBColorSpace;return t}).catch(e=>{textures.delete(url);throw e}));return textures.get(url)}
export class BattleScene extends World{
 buildArena(){this.illustrated=true;super.buildArena();}
 async loadUnits(){
  this.renderer.domElement.setAttribute('aria-label','立绘剧场：动态人物、技能特效与战场');this.host.classList.add('illustrated-viewport');
  this.cinematic=this.battle.tactics?.cinematic!==false;
  const descriptors=[...this.battle.allies.map(data=>({side:'ally',data,a:art(this.core.hero(data.id))})),...this.battle.enemies.map(data=>({side:'enemy',data,a:{url:'assets/combat/enemies.png',tile:[(data.art%3)/3,0,1/3,1],aspect:.5,cutout:true}}))];
  let loaded=0;await Promise.all(descriptors.map(async d=>{d.map=await texture(d.a.url);this.onProgress(++loaded,descriptors.length)}));if(this.disposed)return;
  for(const d of descriptors)this.addIllustration(d);this.laidOut=false;this.resize();this.update(this.battle);this.render();
 }
 addIllustration({side,data,a,map}){
  const h=side==='ally'?this.core.hero(data.id):null,height=side==='enemy'&&data.boss?4.7:3.25,width=height*a.aspect,root=new T.Group(),rig=new T.Group();root.add(rig);this.scene.add(root);
  const uniforms={map:{value:map},tile:{value:new T.Vector4(...a.tile)},time:{value:0},pose:{value:0},fade:{value:1},cutout:{value:a.cutout?1:0},wings:{value:data.id==='elysium'?1:0},flash:{value:0}};
  const material=new T.ShaderMaterial({uniforms,transparent:true,depthWrite:false,side:T.DoubleSide,vertexShader:`varying vec2 tex;uniform float time;uniform float pose;uniform float wings;void main(){tex=uv;vec3 p=position;float hem=pow(1.-uv.y,2.);p.x+=sin(time*1.7+uv.y*7.)*.035*hem;float edge=smoothstep(.19,.40,abs(uv.x-.5));p.x+=sign(uv.x-.5)*sin(time*1.25)*.035*edge*wings*smoothstep(.4,.75,uv.y);p.y+=pose*edge*smoothstep(.35,.55,uv.y)*(1.-smoothstep(.8,.95,uv.y))*.13;p.y+=sin(time*1.5)*.012*smoothstep(.3,.8,uv.y);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,fragmentShader:`varying vec2 tex;uniform sampler2D map;uniform vec4 tile;uniform float cutout;uniform float fade;uniform float flash;void main(){vec4 c=texture2D(map,tile.xy+tex*tile.zw);if(cutout<.5){float rim=1.-smoothstep(.28,.51,abs(tex.x-.5));c.a*=rim*smoothstep(.01,.16,tex.y)*(1.-smoothstep(.91,1.,tex.y));}if(tile.z<1.)c.a*=smoothstep(0.,.055,tex.x)*(1.-smoothstep(.945,1.,tex.x));c.a*=fade;if(c.a<.025)discard;c.rgb=mix(c.rgb,vec3(1.,.75,.7),flash);gl_FragColor=c;#include <tonemapping_fragment>\n#include <colorspace_fragment>}`.replace('c;#include','c;\n#include')});
  const mesh=new T.Mesh(new T.PlaneGeometry(width,height,28,40),material);mesh.position.y=height/2;rig.add(mesh);const key=side+'-'+data.id,u={key,side,data,root,rig,mesh,height,color:h?.color||'#d293af',profile:['cleric',h?.color||'#ca7798'],home:v(),facing:0,clips:new Map(),returnAt:Infinity,deathAt:Infinity,dead:false,flash:0,uniforms,pose:null};
  u.mixer={update:dt=>this.animateUnit(u,dt),stopAllAction(){},uncacheRoot(){}};this.units.set(key,u);
  const shadow=this.mesh(new T.CircleGeometry(width*.30,32),new T.MeshBasicMaterial({color:'#060b18',transparent:true,opacity:.48,depthWrite:false}),v(0,.09,0),root);shadow.rotation.x=-Math.PI/2;shadow.scale.y=.4;
  this.cosmetics(u);const label=document.createElement('article');label.className='world-unit '+(side==='enemy'?'hostile':'friendly');this.labels.append(label);u.label=label;
 }
 layout(){const allies=[...this.units.values()].filter(u=>u.side==='ally'),enemies=[...this.units.values()].filter(u=>u.side==='enemy');this.narrow=this.width<600||this.width/this.height<1.15;
 allies.forEach((u,i)=>{u.home.set(i<2?-1.3:-4.7+(i-3)*.40,.1,i<2?(i-.5)*5.2:(i-3)*4.1);if(this.narrow)u.home.set(i<2?(i-.5)*3.2:(i-3)*3,.1,i<2?.4:4.4);u.root.position.copy(u.home);u.motion=null;});
 enemies.forEach((u,i)=>{u.home.set(3.6+(i-(enemies.length-1)/2)*.6,.1,(i-(enemies.length-1)/2)*4.3);if(this.narrow)u.home.set((i-(enemies.length-1)/2)*3.1,.1,-4.0);u.root.position.copy(u.home);});}
 positionCamera(){const radius=this.narrow?23:14.5;this.camera.position.set((this.orbit-.48)*2.5,this.narrow?14:7.8,radius);this.camera.lookAt(0,this.narrow?1.6:2.0,0);const ev=this.activeEvent,zoom=this.cinematic&&!this.reduced&&ev?.ev.ultimate?1+Math.sin(Math.PI*Math.min(1,(this.time-ev.start)/1.95))*.045:1;if(this.camera.zoom!==zoom){this.camera.zoom=zoom;this.camera.updateProjectionMatrix();}}
 play(u,names,loop=false,duration=.9){if(!u.uniforms)return;u.pose={kind:names.some(n=>/hit/.test(n))?'hit':names.some(n=>/death|die/.test(n))?'death':loop?'idle':'cast',start:this.time,duration};u.returnAt=loop?Infinity:this.time+duration;}
 animateUnit(u){u.uniforms.time.value=this.reduced?0:this.time;let p=0;if(u.pose){const t=Math.min(1,(this.time-u.pose.start)/u.pose.duration);p=Math.sin(t*Math.PI);if(!this.reduced){u.rig.position.x=u.pose.kind==='hit'?Math.sin(t*13)*.11*(1-t):u.pose.kind==='cast'?(u.side==='ally'?1:-1)*p*.22:0;u.rig.rotation.z=u.pose.kind==='hit'?p*.04:0;}if(t===1&&!u.dead)u.pose=null;}
 u.uniforms.pose.value=this.reduced?0:p;u.uniforms.flash.value=u.flash>0&&u.flash>this.time?.35:0;
 if(u.dead){u.uniforms.fade.value=Math.max(.12,1-(this.time-u.fallenAt)*1.3);u.label.style.opacity='.35';}else u.uniforms.fade.value=1;
 }
 die(u){if(u.dead)return;u.dead=true;u.fallenAt=this.time;u.returnAt=Infinity;u.disc.material.opacity=.1;u.shield.visible=false;}
 playEvent(ev){super.playEvent(ev);if(!ev)return;const actor=ev.actor?.side==='ally'?this.core.hero(ev.actor.id):null;
 if(ev.ultimate&&actor&&this.cinematic&&!this.reduced){const panel=document.createElement('div');panel.className='illustrated-cutin';const image=document.createElement(actor.video?'video':'img');image.src=actor.video||`assets/heroes/${actor.art}.png`;if(actor.video){image.muted=true;image.playsInline=true;image.play().catch(()=>{})}panel.append(image);const caption=document.createElement('div'),small=document.createElement('small'),strong=document.createElement('strong');small.textContent=actor.title+' · '+actor.name;strong.textContent=actor.skill;caption.append(small,strong);panel.append(caption);this.host.append(panel);this.cutin=panel;this.setPlayback({running:this.running,speed:this.speed});}
 }
 clearEvent(){this.cutin?.querySelector('video')?.pause();this.cutin?.remove();this.cutin=null;super.clearEvent();}
 update(b){super.update(b);for(const u of this.units.values()){if(u.data.hp>0&&u.dead){u.dead=false;u.fallenAt=null;u.label.style.opacity='1';}if(u.side==='enemy'){const status=document.createElement('span');status.className='illustrated-intent';status.textContent=this.core.enemyIntent?.(b,u.data)||'';u.label.append(status);}}}
 render(){for(const u of this.units.values()){this.animateUnit(u);u.mesh?.quaternion.copy(this.camera.quaternion);}super.render();for(const u of this.units.values())if(u.side==='ally'){const p=this.project(u.root.position.clone().add(v(this.narrow?0:-.78,this.narrow?-.1:.2,0)));u.label.style.transform=`translate(${this.narrow?'-50%,0':'-100%,-50%'}) translate(${p.x}px,${p.y}px)`;}}
 setPlayback(state){super.setPlayback(state);if(this.cutin){this.cutin.style.animationPlayState=state.running?'running':'paused';this.cutin.style.animationDuration=(1.9/state.speed)+'s';const video=this.cutin.querySelector('video');if(video){video.playbackRate=state.speed;if(state.running)video.play().catch(()=>{});else video.pause();}}}
 dispose(){if(this.disposed)return;this.clearEvent();for(const u of this.units.values())u.mesh?.geometry.dispose();super.dispose();}
}
