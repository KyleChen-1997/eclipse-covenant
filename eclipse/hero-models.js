import * as THREE from 'three';
import {mergeGeometries} from './vendor/three/addons/utils/BufferGeometryUtils.js';
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const faceTexture=new THREE.TextureLoader().load('assets/characters/face-albedo-v8.png');faceTexture.colorSpace=THREE.SRGBColorSpace;
// Art direction follows each card's hair, silhouette, metalwork and signature prop.
export const HERO_LOOKS={
 astra:{hair:'#d2c7e4',cloth:'#242031',dark:'#16131e',metal:'#c8af79',gem:'#bc9cfa',robe:true,long:true,crown:'star',prop:'orb',wings:'dark'},
 aurelia:{hair:'#f0d79e',cloth:'#d0ba83',dark:'#423223',metal:'#deb866',gem:'#ffd68a',robe:true,long:true,crown:'sun',prop:'scepter',wings:'gold'},
 noctis:{hair:'#262333',cloth:'#241c38',dark:'#111722',metal:'#b5aec9',gem:'#b897ed',male:true,long:true,crown:'moon',prop:'clock',robe:true},
 caelum:{hair:'#18243b',cloth:'#243b62',dark:'#151e2e',metal:'#b9ccdf',gem:'#97d8ff',male:true,long:true,crown:'dragon',prop:'spear',coat:true},
 selene:{hair:'#c4d1e1',cloth:'#253851',dark:'#121f30',metal:'#bccbe0',gem:'#addbff',long:true,crown:'moon',prop:'shield',coat:true},
 vesper:{hair:'#402338',cloth:'#2b1627',dark:'#150f1b',metal:'#aa8290',gem:'#ed7399',male:true,crown:'rose',prop:'rapier',robe:true},
 orion:{hair:'#242236',cloth:'#1e223b',dark:'#111626',metal:'#9696b5',gem:'#aaabff',male:true,crown:'star',prop:'sword',coat:true},
 eirene:{hair:'#ded4ac',cloth:'#e7e3c8',dark:'#61725b',metal:'#cdbb83',gem:'#cbebb8',long:true,robe:true,crown:'sun',prop:'scepter'},
 seraphine:{hair:'#dac4cf',cloth:'#541a34',dark:'#240c20',metal:'#caa393',gem:'#f24975',long:true,robe:true,crown:'rose',prop:'scepter',wings:'red'},
 ragnar:{hair:'#362322',cloth:'#442120',dark:'#20141a',metal:'#b39173',gem:'#fb8865',male:true,crown:'sun',prop:'greatsword',coat:true},
 elysium:{hair:'#eee5dd',cloth:'#d9d1db',dark:'#68617e',metal:'#d4bc98',gem:'#b0eefa',long:true,robe:true,crown:'star',prop:'orb',wings:'prism'},
 milo:{hair:'#554535',cloth:'#4d6f62',dark:'#263b35',metal:'#9e9574',gem:'#cee5aa',male:true,robe:true,prop:'lantern'},
 lark:{hair:'#493d38',cloth:'#3b695d',dark:'#233c3c',metal:'#b5a784',gem:'#b9e4d5',prop:'bow'},
 scarlet:{hair:'#9e383e',cloth:'#6b2f3f',dark:'#291f30',metal:'#bb9c77',gem:'#ff9c7b',long:true,robe:true,prop:'scissors'},
 bran:{hair:'#49382e',cloth:'#565156',dark:'#2a2e32',metal:'#9d8970',gem:'#d8bd91',male:true,prop:'shield'},
 flora:{hair:'#947252',cloth:'#bdd1a1',dark:'#345744',metal:'#bdb889',gem:'#a7e6b8',long:true,robe:true,prop:'scepter'},
 nix:{hair:'#b5c4d6',cloth:'#3c5574',dark:'#23334b',metal:'#b4ccdb',gem:'#a5e6ef',male:true,prop:'bow'},
 finch:{hair:'#ad733f',cloth:'#947955',dark:'#413934',metal:'#c4ac79',gem:'#b8e2dd',prop:'lantern'},
 quill:{hair:'#796443',cloth:'#8e7e59',dark:'#484838',metal:'#bbaa7c',gem:'#dbe4b2',male:true,prop:'bow'},
 lyra:{hair:'#9ab9c5',cloth:'#81b8c4',dark:'#344c70',metal:'#c8d6d9',gem:'#a5eeee',long:true,robe:true,prop:'scepter'},
 tessa:{hair:'#343d3f',cloth:'#b4c6a7',dark:'#36554d',metal:'#a0b594',gem:'#a8eed2',long:true,robe:true,prop:'lantern'},
 rune:{hair:'#bbcdd6',cloth:'#607fa3',dark:'#293b60',metal:'#b5cbdb',gem:'#baebff',male:true,robe:true,prop:'scepter'},
 ignis:{hair:'#b95242',cloth:'#69392f',dark:'#352328',metal:'#c5956e',gem:'#ffa683',long:true,prop:'spear'}
};
const skinMat=new THREE.MeshPhysicalMaterial({color:'#d9aa95',roughness:.74,metalness:0,clearcoat:.1});
const eyeWhite=new THREE.MeshStandardMaterial({color:'#ddd7d2',roughness:.4});
const black=new THREE.MeshStandardMaterial({color:'#201823',roughness:.5});
function clothTexture(base,trim){const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');g.fillStyle=base;g.fillRect(0,0,512,512);g.strokeStyle=trim;g.lineWidth=1.4;g.globalAlpha=.35;for(let y=0;y<512;y+=64)for(let x=0;x<512;x+=64){g.beginPath();g.moveTo(x,y+32);g.bezierCurveTo(x+38,y+5,x+28,y+60,x+64,y+32);g.stroke();g.beginPath();g.arc(x+32,y+32,9,0,Math.PI*2);g.stroke();}g.globalAlpha=.8;g.lineWidth=2.6;for(let x=24;x<512;x+=64){g.beginPath();g.moveTo(x,0);g.bezierCurveTo(x+21,150,x-21,350,x,512);g.stroke();for(let y=24;y<512;y+=64){g.save();g.translate(x,y);g.rotate(Math.PI/4);g.strokeRect(-7,-7,14,14);g.restore();}}g.globalAlpha=.13;g.strokeStyle='#fff';g.lineWidth=.5;for(let y=0;y<512;y+=4){g.beginPath();g.moveTo(0,y);g.lineTo(512,y);g.stroke();}const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(2,2);return texture;}
function tube(points,radius,mat,parent){const curve=new THREE.CatmullRomCurve3(points.map(p=>V(...p))),mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,20,radius,7,false),mat);parent.add(mesh);mesh.castShadow=true;return mesh;}
export class HeroAvatar{
 constructor(unit,core){
  this.skinMat=skinMat.clone();this.eyeWhite=eyeWhite.clone();this.black=black.clone();this.u=unit;this.look=HERO_LOOKS[unit.data.id]||HERO_LOOKS.milo;const p=this.look;this.bones={};unit.rig.traverse(o=>{if(o.isBone)this.bones[o.name.replace(/[^a-z]/gi,'').toLowerCase()]=o;if(o.isMesh)o.visible=false;});
  this.root=new THREE.Group();this.root.name='TailoredAvatar-'+unit.data.id;unit.root.add(this.root);this.links=[];this.sways=[];this.rank=core.rankOf(core.hero(unit.data.id));
  this.texture=clothTexture(p.cloth,p.metal);this.silk=new THREE.MeshPhysicalMaterial({map:this.texture,roughness:.69,metalness:.08,sheen:1,sheenColor:new THREE.Color(p.cloth),side:THREE.DoubleSide});this.dark=new THREE.MeshStandardMaterial({color:p.dark,roughness:.65,metalness:.12});this.gold=new THREE.MeshStandardMaterial({color:p.metal,metalness:.75,roughness:.38});this.hair=new THREE.MeshPhysicalMaterial({color:p.hair,roughness:.48,metalness:.12,sheen:1});this.gem=new THREE.MeshPhysicalMaterial({color:p.gem,emissive:p.gem,emissiveIntensity:.32,metalness:.25,roughness:.13,clearcoat:1});
  const limb=(a,b,r1,r2,mat)=>{const mesh=this.mesh(new THREE.CylinderGeometry(r2,r1,1,14,4),mat);if(p.robe&&a.includes('leg'))mesh.visible=false;this.links.push({mesh,a,b});return mesh;};
  this.torso=this.sphere(this.silk,[p.male?.27:.235,.32,.13]);this.waist=this.sphere(this.dark,[p.male?.225:.18,.18,.135]);this.hips=this.sphere(this.silk,[p.male?.245:.255,.18,.16]);
  for(const side of ['l','r']){
   limb('upperarm'+side,'lowerarm'+side,.083,.065,this.silk);limb('lowerarm'+side,'fist'+side,.075,.05,this.dark);limb('upperleg'+side,'lowerleg'+side,.125,.088,this.dark);limb('lowerleg'+side,'foot'+side,.10,.065,this.dark);
   const shoulder=this.sphere(this.gold,[.115,.052,.135]);this.links.push({mesh:shoulder,joint:'upperarm'+side,offset:V(0,.005,0)});
   const hand=this.sphere(this.skinMat,[.052,.075,.048]);this.links.push({mesh:hand,joint:'fist'+side,offset:V(0,-.015,.012)});for(let i=0;i<4;i++){const finger=this.sphere(this.skinMat,[.011,.033,.012],hand,V((i-1.5)*.021,-.049,.027));finger.scale.divide(hand.scale);finger.position.divide(hand.scale);} 
   const knee=this.sphere(this.gold,[.078,.085,.055]);knee.visible=!p.robe;this.links.push({mesh:knee,joint:'lowerleg'+side,offset:V(0,0,.045)});
   const boot=this.sphere(this.dark,[.082,.068,.155]);this.links.push({mesh:boot,joint:'foot'+side,offset:V(0,.025,.065)});
  }
  this.belt=this.mesh(new THREE.TorusGeometry(p.male?.238:.202,.026,8,40),this.gold);this.belt.rotation.x=Math.PI/2;
  this.brooch=this.mesh(new THREE.OctahedronGeometry(.075,1),this.gem);
  this.collar=new THREE.Group();this.root.add(this.collar);const collar=this.mesh(new THREE.CylinderGeometry(.082,.14,.15,32,1,true),this.dark,this.collar);collar.position.y=-.02;for(const y of [-.09,.052]){const trim=this.mesh(new THREE.TorusGeometry(y<0?.14:.082,.006,6,32),this.gold,this.collar);trim.rotation.x=Math.PI/2;trim.position.y=y;}this.chestTrim=new THREE.Group();this.root.add(this.chestTrim);for(const sign of [-1,1]){tube([[0,-.13,.165],[sign*.11,-.04,.182],[sign*.2,.12,.12]],.012,this.gold,this.chestTrim);for(let i=0;i<3;i++){const chain=this.mesh(new THREE.TorusGeometry(.12+i*.018,.0035,5,36,Math.PI),this.gold,this.chestTrim);chain.position.set(sign*.11,-i*.028,.15);chain.rotation.z=Math.PI;}}
  this.head=new THREE.Group();this.root.add(this.head);this.makeHead();this.makeClothes();this.makeProp();for(const group of [this.head,this.skirt,this.chestTrim,this.collar,this.prop,this.shield,this.wings])if(group)this.mergeStatic(group);this.update(0);
  const headBone=this.bones.head;if(headBone){const rotation=headBone.getWorldQuaternion(new THREE.Quaternion());this.headOffset=rotation.invert().multiply(this.head.getWorldQuaternion(new THREE.Quaternion()));}const hand=this.bones.fistr;if(hand)this.propOffset=hand.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(this.prop.getWorldQuaternion(new THREE.Quaternion()));
 }
 mergeStatic(group){
  const batches=new Map();group.updateMatrixWorld(true);for(const child of [...group.children]){if(!child.isMesh||child.children.length||this.sways.some(s=>s.mesh===child))continue;child.updateMatrix();const geo=child.geometry.index?child.geometry.toNonIndexed():child.geometry.clone();geo.applyMatrix4(child.matrix);if(!batches.has(child.material))batches.set(child.material,[]);batches.get(child.material).push(geo);child.geometry.dispose();group.remove(child);}
  for(const [mat,geos] of batches){const merged=mergeGeometries(geos,false);if(merged)this.mesh(merged,mat,group);geos.forEach(g=>g.dispose());}
 }
 mesh(geo,mat,parent=this.root){const mesh=new THREE.Mesh(geo,mat);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 sphere(mat,scale,parent=this.root,pos=V()){const mesh=this.mesh(new THREE.SphereGeometry(1,24,18),mat,parent);mesh.scale.set(...scale);mesh.position.copy(pos);return mesh;}
 joint(id){const bone=this.bones[id];if(!bone)return V(0,1,0);return this.u.root.worldToLocal(bone.getWorldPosition(V()));}
 makeHead(){
  const p=this.look;this.sphere(this.skinMat,[p.male?.16:.148,.225,.127],this.head,V(0,0,-.02));this.sphere(this.skinMat,[.062,.077,.058],this.head,V(0,-.205,-.006));
  const vertices=[],uvs=[],indices=[],nx=48,ny=56,rx=p.male?.161:.151;
  const gauss=(x,y,a,b,sx,sy)=>Math.exp(-(((x-a)/sx)**2+((y-b)/sy)**2));
  for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){
   const u=i/nx,v=j/ny,y=(.5-v)*.465,round=Math.sqrt(Math.max(.005,1-(y/.24)**2)),angle=(u-.5)*Math.PI;
   const jaw=v>.65?1-(v-.65)*.20:1;
   let z=Math.cos(angle)*.145*round;
   z+=.026*gauss(u,v,.5,.60,.055,.04)+.019*gauss(u,v,.5,.47,.032,.14)+.005*gauss(u,v,.5,.76,.15,.04);
   z-=.007*(gauss(u,v,.30,.36,.095,.035)+gauss(u,v,.70,.36,.095,.035));
   vertices.push(Math.sin(angle)*rx*round*jaw,y,z);uvs.push((u+(p.male?1:0))*.5,1-v);
   if(j<ny&&i<nx){const n=j*(nx+1)+i;indices.push(n,n+nx+1,n+1,n+1,n+nx+1,n+nx+2);}
  }
  const faceGeo=new THREE.BufferGeometry();faceGeo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));faceGeo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));faceGeo.setIndex(indices);faceGeo.computeVertexNormals();
  this.faceMap=faceTexture.clone();const faceMat=new THREE.MeshPhysicalMaterial({map:this.faceMap,roughness:.76,metalness:0,clearcoat:.05});this.mesh(faceGeo,faceMat,this.head);
  for(const sign of [-1,1]){this.sphere(this.skinMat,[.021,.049,.024],this.head,V(sign*.15,.003,0));const earring=this.mesh(new THREE.TorusGeometry(.025,.004,6,18),this.gold,this.head);earring.position.set(sign*.16,-.067,.006);const drop=this.mesh(new THREE.OctahedronGeometry(.018),this.gem,this.head);drop.position.set(sign*.16,-.11,.006);}
  // Scalp plus individually curved, tapered locks; silhouettes differ from the job-class rigs.
  const cap=this.mesh(new THREE.SphereGeometry(1,28,20,0,Math.PI*2,0,Math.PI*.51),this.hair,this.head);const hairPos=cap.geometry.attributes.position;for(let i=0;i<hairPos.count;i++){const z=hairPos.getZ(i),y=hairPos.getY(i);if(z>0&&y<.47)hairPos.setY(i,.47);}cap.geometry.computeVertexNormals();cap.scale.set(.167,.245,.151);cap.position.y=.015;
  for(let i=0;i<19;i++){
   const a=Math.PI*.1+i/18*Math.PI*1.8,x=Math.cos(a)*.139,z=-Math.sin(a)*.139,front=z>.04,length=p.long?.61+(i%4)*.055:.14+(i%4)*.012;
   if(front&&Math.abs(x)<.115)continue;
   const lock=tube([[x*.7,.18,z*.7],[x*1.12,.01,z],[x*1.25+(i%2?.04:-.02),-.18,z-.025],[x*1.2,-length,z-.04]],p.long?.034:.03,this.hair,this.head);this.sways.push({mesh:lock,seed:i,amount:p.long?.045:.012});
  }
  for(const sign of [-1,1])tube([[sign*.025,.21,.04],[sign*.105,.15,.142],[sign*.153,.035,.11],[sign*.159,-.18,.08]],.024,this.hair,this.head);
  if(p.crown){
   const band=this.mesh(new THREE.TorusGeometry(.164,.007,8,48,Math.PI*1.6),this.gold,this.head);band.rotation.x=Math.PI/2;band.rotation.z=-Math.PI*.3;band.position.y=.15;
   for(let i=-3;i<=3;i++){const a=i*.34,x=Math.sin(a)*.161,z=Math.cos(a)*.145,height=(i===0?.17:.10)+Math.abs(i)*.008;const spike=this.mesh(new THREE.ConeGeometry(.025,height,4),this.gold,this.head);spike.position.set(x,.21+height*.2,z);spike.rotation.z=-i*.13;const stone=this.mesh(new THREE.OctahedronGeometry(i===0?.027:.016,0),this.gem,this.head);stone.position.set(x,.27+height*.5,z);}
  }
 }
 makeClothes(){
  const p=this.look;this.skirt=new THREE.Group();this.root.add(this.skirt);
  if(p.robe){
   const points=[];for(let i=0;i<=18;i++){const t=i/18;points.push(new THREE.Vector2(.235+.23*t+.06*Math.sin(t*Math.PI),-t*1.13));}const dress=this.mesh(new THREE.LatheGeometry(points,48),this.silk,this.skirt);dress.scale.z=.83;
   for(let i=0;i<12;i++){const a=i/12*Math.PI*2;const ribbon=tube([[Math.cos(a)*.252,0,Math.sin(a)*.198],[Math.cos(a)*.375,-.55,Math.sin(a)*.312],[Math.cos(a)*.465,-1.13,Math.sin(a)*.386]],.007,this.gold,this.skirt);ribbon.name='GoldEmbroidery';}
   const hem=this.mesh(new THREE.TorusGeometry(.465,.012,8,64),this.gold,this.skirt);hem.rotation.x=Math.PI/2;hem.scale.y=.83;hem.position.y=-1.13;
  }
  if(p.coat){for(const sign of [-1,1]){const geo=new THREE.PlaneGeometry(.25,.83,8,14),v=geo.attributes.position;for(let i=0;i<v.count;i++){const t=(.415-v.getY(i))/.83;v.setXYZ(i,v.getX(i)*(1+t*.7),v.getY(i),Math.sin(t*Math.PI)*.035);}geo.computeVertexNormals();const panel=this.mesh(geo,this.silk,this.skirt);panel.position.set(sign*.21,-.48,.15);panel.rotation.y=sign*.55;panel.rotation.z=sign*.12;tube([[sign*.08,-.08,.16],[sign*.14,-.5,.19],[sign*.19,-.9,.14]],.009,this.gold,this.skirt);}}
  this.cape=new THREE.Group();this.root.add(this.cape);const geometry=new THREE.PlaneGeometry(.78,1.35,18,24),pos=geometry.attributes.position;
  for(let i=0;i<pos.count;i++){const y=pos.getY(i),t=(.675-y)/1.35;pos.setXYZ(i,pos.getX(i)*(1+t*.45),y,-.1-Math.sin(t*Math.PI)*.08-Math.cos(pos.getX(i)*19)*.025*t);}geometry.computeVertexNormals();this.capeMesh=this.mesh(geometry,this.dark.clone(),this.cape);this.capeMesh.material.side=THREE.DoubleSide;this.capeMesh.position.set(0,-.57,-.16);
  if(p.wings){this.wings=new THREE.Group();this.root.add(this.wings);const shades=p.wings==='prism'?['#e3cee6','#cbe4ec','#e8dfba']:p.wings==='dark'?['#332a47','#66547a','#9c86bc']:p.wings==='red'?['#64243d','#9b4960','#ba8392']:['#cfad63','#e2c988','#eddeb6'];for(const sign of [-1,1])for(let i=0;i<9;i++){const mat=new THREE.MeshStandardMaterial({color:shades[i%3],metalness:.45,roughness:.48});const feather=this.sphere(mat,[.045,.39-i*.013,.018],this.wings,V(sign*(.24+i*.074),i*.082,-.13-i*.013));feather.rotation.z=sign*(-.55-i*.07);}}
 }
 makeProp(){
  this.prop=new THREE.Group();this.root.add(this.prop);const type=this.look.prop,metal=this.gold;
  if(['orb','clock','lantern'].includes(type)){
   const core=this.mesh(new THREE.SphereGeometry(type==='orb'?.12:.085,24,20),this.gem,this.prop);core.position.y=.13;
   for(const a of [0,1,2]){const ring=this.mesh(new THREE.TorusGeometry(.18+a*.017,.007,6,48),metal,this.prop);ring.position.y=.13;ring.rotation.set(a*.7,a*.9,.4);}
  }else if(type==='bow'){
   tube([[0,-.55,0],[.13,-.30,0],[.21,0,0],[.13,.3,0],[0,.55,0]],.025,metal,this.prop);tube([[0,-.55,0],[.035,0,0],[0,.55,0]],.003,this.eyeWhite,this.prop);
  }else{
   const staff=type==='scepter'||type==='spear',length=type==='greatsword'?1.28:staff?1.5:.9;
   const grip=this.mesh(new THREE.CylinderGeometry(.025,.026,staff?length:.25,12),this.dark,this.prop);grip.position.y=staff?.3:-.1;
   if(staff){const tip=this.mesh(new THREE.OctahedronGeometry(.12,1),this.gem,this.prop);tip.scale.y=1.7;tip.position.y=1.08;for(const y of [-.4,.42,.89]){const band=this.mesh(new THREE.TorusGeometry(.039,.008,6,24),metal,this.prop);band.rotation.x=Math.PI/2;band.position.y=y;}const crest=this.mesh(new THREE.TorusGeometry(.17,.013,7,40),metal,this.prop);crest.position.y=1.05;}
   else{const blade=new THREE.Shape();blade.moveTo(-.045,0);blade.lineTo(-.045,length*.8);blade.lineTo(0,length);blade.lineTo(.045,length*.8);blade.lineTo(.045,0);const sword=this.mesh(new THREE.ExtrudeGeometry(blade,{depth:.015,bevelEnabled:true,bevelSize:.006,bevelThickness:.006,bevelSegments:2,steps:1}),metal,this.prop);sword.position.y=.035;const cross=this.mesh(new THREE.BoxGeometry(.28,.035,.05),metal,this.prop);cross.position.y=.04;this.sphere(this.gem,[.027,.034,.027],this.prop,V(0,-.22,0));}
  }
  if(type==='shield'){
   this.shield=new THREE.Group();this.root.add(this.shield);const plate=this.mesh(new THREE.SphereGeometry(.32,32,24),this.gold,this.shield);plate.scale.set(1,1.5,.17);const inset=this.mesh(new THREE.SphereGeometry(.285,28,20),this.dark,this.shield);inset.scale.set(1,1.5,.18);inset.position.z=.03;const star=this.mesh(new THREE.OctahedronGeometry(.095),this.gem,this.shield);star.scale.y=1.5;star.position.z=.10;for(let i=0;i<8;i++){const a=i*Math.PI/4;this.sphere(this.gold,[.018,.018,.012],this.shield,V(Math.sin(a)*.29,Math.cos(a)*.43,.08));}
  }
 }
 update(time){
  const u=this.u;u.root.updateWorldMatrix(true,true);const hips=this.joint('hips'),torso=this.joint('torso'),neck=this.joint('neck'),head=this.joint('head');const left=this.joint('upperarml'),right=this.joint('upperarmr');
  const x=left.clone().sub(right).normalize(),y=neck.clone().sub(hips).normalize(),z=x.clone().cross(y).normalize();x.copy(y).cross(z).normalize();const orientation=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x,y,z));
  this.torso.position.copy(hips).lerp(neck,.57);this.torso.quaternion.copy(orientation);this.waist.position.copy(hips).lerp(neck,.18);this.waist.quaternion.copy(orientation);this.hips.position.copy(hips);this.hips.quaternion.copy(orientation);
  for(const l of this.links){if(l.joint){l.mesh.position.copy(this.joint(l.joint)).add(l.offset.clone().applyQuaternion(orientation));l.mesh.quaternion.copy(orientation);}else{const a=this.joint(l.a),b=this.joint(l.b),dir=b.clone().sub(a);l.mesh.position.copy(a).lerp(b,.5);l.mesh.scale.y=dir.length();l.mesh.quaternion.setFromUnitVectors(V(0,1,0),dir.normalize());}}
  this.belt.position.copy(hips).lerp(neck,.22);this.belt.quaternion.copy(orientation).multiply(new THREE.Quaternion().setFromAxisAngle(V(1,0,0),Math.PI/2));
  this.brooch.position.copy(this.torso.position).add(V(0,.13,.18).applyQuaternion(orientation));this.brooch.quaternion.copy(orientation);this.chestTrim.position.copy(this.torso.position);this.chestTrim.quaternion.copy(orientation);this.collar.position.copy(neck).add(V(0,-.025,0).applyQuaternion(orientation));this.collar.quaternion.copy(orientation);
  this.head.position.copy(head).add(V(0,.075,.007).applyQuaternion(orientation));this.head.quaternion.copy(orientation);if(this.headOffset){const world=this.bones.head.getWorldQuaternion(new THREE.Quaternion()).multiply(this.headOffset);this.head.quaternion.copy(u.root.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(world));}
  for(const sway of this.sways)sway.mesh.rotation.z=Math.sin(time*1.7+sway.seed*.45)*sway.amount;
  this.skirt.position.copy(hips);this.skirt.quaternion.copy(orientation);this.skirt.rotation.z+=Math.sin(time*1.3)*.025;
  this.cape.position.copy(neck).add(V(0,-.06,-.06).applyQuaternion(orientation));this.cape.quaternion.copy(orientation);this.cape.rotation.x+=Math.sin(time*1.4)*.055;this.cape.rotation.z+=Math.sin(time*.8)*.025;
  if(this.wings){this.wings.position.copy(torso).add(V(0,.15,-.16).applyQuaternion(orientation));this.wings.quaternion.copy(orientation);this.wings.scale.x=1+Math.sin(time*.9)*.04;}
  const orb=['orb','clock','lantern'].includes(this.look.prop);this.prop.position.copy(this.joint(orb?'fistl':'fistr'));this.prop.quaternion.copy(orientation);if(orb)this.prop.position.add(V(0,.10+Math.sin(time*1.3)*.025,.08).applyQuaternion(orientation));else if(this.propOffset){const world=this.bones.fistr.getWorldQuaternion(new THREE.Quaternion()).multiply(this.propOffset);this.prop.quaternion.copy(u.root.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(world));}else this.prop.rotateX(-.15);
  if(this.shield){this.shield.position.copy(this.joint('fistl')).add(V(0,.08,.12).applyQuaternion(orientation));this.shield.quaternion.copy(orientation);}
 }
 dispose(){this.texture.dispose();this.faceMap?.dispose();}
}
