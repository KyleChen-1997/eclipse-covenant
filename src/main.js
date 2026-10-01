import * as THREE from 'https://esm.sh/three@0.160.0';

const scene=new THREE.Scene(); scene.background=new THREE.Color(0x08151a); scene.fog=new THREE.Fog(0x08151a,32,110);
const camera=new THREE.PerspectiveCamera(72,innerWidth/innerHeight,.1,180); camera.position.set(0,2.4,20);
const renderer=new THREE.WebGLRenderer({antialias:true}); renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(innerWidth,innerHeight); renderer.shadowMap.enabled=true; document.body.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xbce8e5,0x122128,2.2)); const sun=new THREE.DirectionalLight(0xeaffff,2.5); sun.position.set(-14,26,20); sun.castShadow=true; scene.add(sun);
const mat=(c,r=.7,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m}); const deck=mat(0x27373a), steel=mat(0x34494b), red=mat(0x8f3a3a), blue=mat(0x276d78), yellow=mat(0xd2a846), dark=mat(0x101a1c), glass=mat(0x4cb9c1,.2,.4);
function box(n,p,s,ma,rot=0){const o=new THREE.Mesh(new THREE.BoxGeometry(...s),ma);o.name=n;o.position.set(...p);o.rotation.y=rot;o.castShadow=true;o.receiveShadow=true;scene.add(o);return o}
// ship hull + deck
box('deck',[0,-.25,0],[28,.5,66],deck); box('railL',[-14,1,0],[.35,2,66],steel); box('railR',[14,1,0],[.35,2,66],steel); box('bow',[0,1,-33],[28,2,1],steel); box('stern',[0,1,33],[28,2,1],steel);
// lane strips and hazard markings
for(let z=-30;z<31;z+=6){box('stripe',[-6,.03,z],[.12,.03,3.1],yellow);box('stripe',[6,.03,z],[.12,.03,3.1],yellow)}
// container stacks: symmetric central obstacles + side lanes
function container(x,y,z,w=5,d=6,ma=blue,rot=0){let c=box('container',[x,y,z],[w,2.6,d],ma,rot); for(let i=-1;i<=1;i++)box('rib',[x+i*w/3,y,z-d/2-.03],[.08,2.2,.08],steel,rot); box('door',[x,y,z+d/2+.04],[w*.75,2.25,.06],dark,rot); return c}
container(-8,1.3,15,7,6,red);container(8,1.3,15,7,6,red); container(-7,1.3,-15,7,6,blue);container(7,1.3,-15,7,6,blue);
container(-1.8,1.3,4,3.5,7,steel,.15);container(1.8,1.3,-4,3.5,7,steel,-.15);container(-8,4,0,7,5,steel); container(8,4,0,7,5,steel);
// overhead crane
box('gantry',[-12,7,0],[1,10,2],steel);box('gantry',[12,7,0],[1,10,2],steel);box('beam',[0,12,0],[26,1,2],steel);box('cab',[0,10,0],[5,2,2],yellow);
// ocean/sky hints
box('ocean',[0,-2,0],[100,.4,130],mat(0x092d35,.35,.2));
let started=false, yaw=0, pitch=0; const controls={moveForward(d){camera.translateZ(-d)},moveRight(d){camera.translateX(d)},lock(){document.body.requestPointerLock?.()}}; document.addEventListener('mousemove',e=>{if(document.pointerLockElement===document.body){yaw-=e.movementX*.0022;pitch-=e.movementY*.0022;pitch=Math.max(-1.3,Math.min(1.3,pitch));camera.rotation.set(pitch,yaw,0,'YXZ')}}); document.getElementById('start').onclick=()=>{document.getElementById('help').style.display='none';controls.lock();started=true};
const keys={}; addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='KeyR')reload()});addEventListener('keyup',e=>keys[e.code]=false); addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
let ammo=30,kills=0,shooting=false,reloading=false; const gunGroup=new THREE.Group(); camera.add(gunGroup); scene.add(camera);
const gun=box('rifle',[0,0,0],[.22,.22,1.6],dark); gun.parent=gunGroup; gun.position.set(.42,-.36,-.85); gun.rotation.x=-.03; const barrel=box('barrel',[0,0,0],[.12,.12,.65],steel);barrel.parent=gunGroup;barrel.position.set(.42,-.34,-1.9); const sight=box('sight',[0,0,0],[.08,.13,.22],red);sight.parent=gunGroup;sight.position.set(.42,-.21,-1.05);
const enemies=[];
function makeEnemy(z,x){
  const g=new THREE.Group(); g.position.set(x,0,z); g.userData={hp:100,alive:true,respawn:0};
  const skin=mat(0xa96852), uniform=mat(0x3b4645), vest=mat(0x1e292a), gear=mat(0x151b1c), visor=mat(0x4b8c8e,.25,.45), sole=mat(0x090d0e);
  const part=(geo,p,m,rot=[0,0,0])=>{const o=new THREE.Mesh(geo,m);o.position.set(...p);o.rotation.set(...rot);o.castShadow=true;o.userData.enemyRoot=g;g.add(o);return o};
  // legs, knee pads and boots
  part(new THREE.BoxGeometry(.34,1.15,.38),[-.25,.7,0],uniform); part(new THREE.BoxGeometry(.34,1.15,.38),[.25,.7,0],uniform);
  part(new THREE.BoxGeometry(.4,.2,.44),[-.25,.42,-.03],gear); part(new THREE.BoxGeometry(.4,.2,.44),[.25,.42,-.03],gear);
  part(new THREE.BoxGeometry(.42,.22,.65),[-.25,.12,-.12],sole); part(new THREE.BoxGeometry(.42,.22,.65),[.25,.12,-.12],sole);
  // pelvis and armored torso silhouette
  part(new THREE.BoxGeometry(.92,.35,.5),[0,1.27,0],vest); part(new THREE.CylinderGeometry(.55,.66,.95,6),[0,1.86,0],vest,[0,0,Math.PI/2]);
  part(new THREE.BoxGeometry(1.02,.72,.16),[0,1.88,-.29],gear); for(let i=-1;i<=1;i++)part(new THREE.BoxGeometry(.22,.24,.08),[i*.25,1.9,-.4],red);
  // shoulder pads, articulated arms and gloves
  for(const s of [-1,1]){part(new THREE.SphereGeometry(.22,8,6),[s*.62,2.18,0],uniform);part(new THREE.BoxGeometry(.28,.63,.3),[s*.7,1.82,-.02],uniform,[0,0,s*.12]);part(new THREE.BoxGeometry(.24,.5,.25),[s*.72,1.32,-.16],uniform,[s*.12,0,s*.05]);part(new THREE.BoxGeometry(.26,.18,.28),[s*.72,1.03,-.2],gear)}
  // neck, head, tactical helmet, ears and visor
  part(new THREE.CylinderGeometry(.18,.2,.22,8),[0,2.5,0],skin); part(new THREE.SphereGeometry(.34,12,8),[0,2.82,0],skin);
  part(new THREE.SphereGeometry(.38,12,6,0,Math.PI*2,0,Math.PI*.55),[0,2.91,0],gear); part(new THREE.BoxGeometry(.58,.12,.4),[0,2.73,-.18],visor); part(new THREE.BoxGeometry(.78,.1,.42),[0,2.67,0],gear);
  part(new THREE.BoxGeometry(.1,.24,.16),[-.38,2.8,0],gear);part(new THREE.BoxGeometry(.1,.24,.16),[.38,2.8,0],gear);
  // backpack, radio and compact rifle held across the chest
  part(new THREE.BoxGeometry(.62,.9,.22),[0,1.85,.34],gear);part(new THREE.BoxGeometry(.14,.3,.12),[.42,2.34,.08],red);
  const rifle=part(new THREE.BoxGeometry(.12,.12,1.25),[.18,1.72,-.48],gear,[0.12,.1,-.42]);part(new THREE.BoxGeometry(.16,.34,.14),[.02,1.55,-.47],gear,[0,0,-.42]);part(new THREE.CylinderGeometry(.07,.07,.3,8),[.4,1.78,-.97],sole,[Math.PI/2,0,0]);
  scene.add(g); enemies.push(g);
}
makeEnemy(-18,-5);makeEnemy(-23,5);makeEnemy(-28,0);
function muzzle(){const f=document.getElementById('flash');f.style.opacity=.45;setTimeout(()=>f.style.opacity=0,35);gunGroup.position.z=.08;setTimeout(()=>gunGroup.position.z=0,55)}
function fire(){if(!started||reloading||ammo<=0)return; ammo--;document.getElementById('ammo').innerHTML=String(ammo).padStart(2,'0')+'<span>/ 120</span>';muzzle();const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2(0,0),camera);const hit=ray.intersectObjects(enemies,true)[0];if(hit){const e=hit.object.userData.enemyRoot;if(e?.userData?.alive){e.userData.hp-=34;if(e.userData.hp<=0){e.userData.alive=false;e.visible=false;kills++;document.getElementById('kills').textContent=String(kills).padStart(2,'0');const feed=document.getElementById('feed');feed.innerHTML='<div><span>YOU</span>  eliminated  RED // '+(kills)+'</div>'+feed.innerHTML; e.userData.respawn=performance.now()+2600}}}}
function reload(){if(reloading||ammo===30)return;reloading=true;setTimeout(()=>{ammo=30;reloading=false;document.getElementById('ammo').innerHTML='30<span>/ 120</span>'},850)} addEventListener('mousedown',e=>{if(e.button===0){shooting=true;fire()}});addEventListener('mouseup',e=>{if(e.button===0)shooting=false});
const clock=new THREE.Clock(); function loop(){requestAnimationFrame(loop);const dt=Math.min(clock.getDelta(),.05);if(started){const speed=keys.ShiftLeft?10:6; if(keys.KeyW)controls.moveForward(speed*dt);if(keys.KeyS)controls.moveForward(-speed*dt);if(keys.KeyA)controls.moveRight(-speed*dt);if(keys.KeyD)controls.moveRight(speed*dt);camera.position.y=2.4;if(shooting)fire();enemies.forEach((e,i)=>{if(!e.userData.alive&&performance.now()>e.userData.respawn){e.userData.alive=true;e.userData.hp=100;e.visible=true;e.position.set([ -5,5,0][i],0,-18-i*5)} if(e.userData.alive){e.lookAt(camera.position.x,1.5,camera.position.z)}})}renderer.render(scene,camera)} loop();
