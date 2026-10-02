import * as THREE from 'three';
import {BattleScene} from './battle3d.js';
// Share the actual battle characters and clips; no second set of display models.
class TeamShowcase extends BattleScene {
 buildArena(){this.scene.background=new THREE.Color('#101a2a');this.scene.fog=null;this.scene.add(new THREE.HemisphereLight(0xe4efff,0x514334,2.4));for(const [x,y,z,c]of [[4,7,5,0xffe4bf],[-5,4,3,0xabcaff]]){const l=new THREE.DirectionalLight(c,3);l.position.set(x,y,z);this.scene.add(l)}const floor=this.mesh(new THREE.CylinderGeometry(8,8.3,.15,64),new THREE.MeshStandardMaterial({color:0x1d2d44,metalness:.25,roughness:.7}),new THREE.Vector3(0,-.1,0));floor.scale.z=.5;this.world={resize(){},tick(){},dispose(){},adorn(){}};}
 layout(){const us=[...this.units.values()];us.forEach((u,i)=>{u.home.set((i-(us.length-1)/2)*2.25,0,0);u.facing=0;u.root.position.copy(u.home);u.root.rotation.y=0;u.motion=null})}
 positionCamera(){const count=this.battle.allies.length,span=Math.max(3,count*2.4),distance=Math.max(4.6,span/(2*Math.tan(37*Math.PI/360)*Math.max(.4,this.camera.aspect))*1.15);this.camera.position.set(Math.sin(this.orbit-.48)*distance,3.3,Math.cos(this.orbit-.48)*distance);this.camera.lookAt(0,1.4,0)}
 update(b){super.update(b);for(const u of this.units.values())u.label.innerHTML=`<div class="world-name">${this.core.hero(u.data.id).name}</div>`}
}
export async function mountTeamShowcase(host,battle,core,status){
 const scene=new TeamShowcase(host,battle,core,{onProgress:(n,total)=>status.textContent=`正在准备角色 ${n}/${total}`,onError:()=>status.textContent='3D 展示暂不可用，可继续使用下方卡片编队。'});
 const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let start=null;
 const buttons=host.parentElement.querySelector('.team-model-actions'),positions=new Map();
 const states=[['攻击',['sword_attack','staff_attack','spell1','bow_shoot','attack','punch']],['受击',['recievehit','receivehit','hitreact','hit']],['倒地',['death','die']],['待机',['idle_weapon','idle']]];
 function perform(id){const u=scene.units.get('ally-'+id);if(!u||scene.disposed)return;const n=positions.get(id)||0,[label,names]=states[n];positions.set(id,(n+1)%states.length);scene.play(u,names,label==='待机',label==='倒地'?1.2:label==='受击'?.5:1.2);if(label==='倒地')u.returnAt=scene.time+2.3;status.textContent=`${core.hero(id).name} · ${label}（再次点击切换动作）`;}
 const click=e=>{const b=e.target.closest('[data-model-hero]');if(b)perform(b.dataset.modelHero)};buttons.addEventListener('click',click);
 const canvas=scene.renderer.domElement;canvas.setAttribute('aria-label','旅团人物模型，点击角色切换动作，也可使用下方角色按钮');canvas.addEventListener('pointerdown',e=>start=[e.clientX,e.clientY]);canvas.addEventListener('pointerup',e=>{if(!start||Math.hypot(e.clientX-start[0],e.clientY-start[1])>6){start=null;return}start=null;const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,scene.camera);const hit=ray.intersectObjects([...scene.units.values()].map(u=>u.avatar?.root||u.rig),true).find(h=>h.object.visible);if(hit)for(const u of scene.units.values()){let o=hit.object;while(o){if(o===u.root){perform(u.data.id);return}o=o.parent}}});
 const visibility=()=>scene.setPlayback({running:!document.hidden&&(host.closest('dialog')?.open??true)});document.addEventListener('visibilitychange',visibility);const observer=new MutationObserver(visibility);const dialog=document.querySelector('dialog');if(dialog)observer.observe(dialog,{attributes:true,attributeFilter:['open']});
 const dispose=scene.dispose.bind(scene);scene.dispose=()=>{buttons.removeEventListener('click',click);document.removeEventListener('visibilitychange',visibility);observer.disconnect();dispose()};
 // Dispose is exposed immediately so switching pages during loading is safe.
 scene.ready.then(()=>{if(scene.disposed)return;status.textContent='点击人物切换动作 · 拖动可调整视角';buttons.querySelectorAll('button').forEach(b=>b.disabled=false);visibility()}).catch(()=>{if(!scene.disposed){status.textContent='模型加载失败，请切换页面重试；下方卡片仍可正常使用。';scene.dispose()}});
 return scene;
}
