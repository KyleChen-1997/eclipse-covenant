import * as THREE from 'three';
const point=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const metal=(color,roughness=.4)=>new THREE.MeshStandardMaterial({color,metalness:.65,roughness});
const light=(color,intensity=1)=>new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:intensity,metalness:.35,roughness:.3});

// Everything here is scene-local, including generated canvas textures and ornament.
export class SanctumArt {
 constructor(stage){this.stage=stage;this.scene=stage.scene;this.textures=[];this.moving=[];this.build();}
 texture(canvas){const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;this.textures.push(t);return t;}
 glowTexture(){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'#ffffff');g.addColorStop(.12,'#ffffffd9');g.addColorStop(.35,'#ffffff45');g.addColorStop(1,'#ffffff00');x.fillStyle=g;x.fillRect(0,0,128,128);return this.texture(c);}
 marble(){const c=document.createElement('canvas');c.width=c.height=1024;const x=c.getContext('2d'),data=x.createImageData(1024,1024);for(let y=0;y<1024;y++)for(let px=0;px<1024;px++){const i=(y*1024+px)*4,n=Math.sin(px*.021+Math.sin(y*.033)*2+Math.sin((px+y)*.006)*5),vein=Math.pow(Math.abs(n),22)*17,grain=(Math.sin(px*113+y*79)*43758)%1*3;data.data[i]=47+vein+grain;data.data[i+1]=58+vein+grain;data.data[i+2]=73+vein+grain;data.data[i+3]=255;}x.putImageData(data,0,0);x.translate(512,512);for(let ring=0;ring<4;ring++){const r=160+ring*90;x.beginPath();x.arc(0,0,r,0,Math.PI*2);x.strokeStyle='#091321aa';x.lineWidth=3;x.stroke();for(let i=0;i<16+ring*4;i++){const a=i/(16+ring*4)*Math.PI*2+(ring%2)*.09;x.beginPath();x.moveTo(Math.sin(a)*r,Math.cos(a)*r);x.lineTo(Math.sin(a)*(r+90),Math.cos(a)*(r+90));x.stroke();}}x.strokeStyle='#b1a48266';x.lineWidth=1;for(const radius of [118,126,389,397,482]){x.beginPath();x.arc(0,0,radius,0,Math.PI*2);x.stroke();}for(let i=0;i<24;i++){x.save();x.rotate(i*Math.PI/12);x.translate(0,-435);x.strokeStyle='#c6b18370';x.beginPath();x.moveTo(0,-15);x.lineTo(9,0);x.lineTo(0,15);x.lineTo(-9,0);x.closePath();x.moveTo(0,-8);x.lineTo(0,8);x.stroke();x.restore();}return this.texture(c);}
 mesh(geometry,material,pos,parent=this.scene){return this.stage.mesh(geometry,material,pos,parent);}
 glow(pos,color,size=1,opacity=.4,parent=this.scene){const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:this.glowMap,color,transparent:true,opacity,depthWrite:false,blending:THREE.AdditiveBlending}));sprite.position.copy(pos);sprite.scale.set(size,size,1);parent.add(sprite);return sprite;}
 build(){
  const s=this.stage,scene=this.scene,theme=s.stage.theme;this.glowMap=this.glowTexture();
  scene.fog=new THREE.FogExp2(s.palette[0],.014);
  scene.add(new THREE.HemisphereLight('#b7d6f4','#111b2a',1.1));
  const key=new THREE.DirectionalLight('#f4e4c7',3.2);key.position.set(-5,11,7);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-11,right:11,top:10,bottom:-10,near:1,far:36});key.shadow.bias=-.00035;key.shadow.normalBias=.028;key.shadow.radius=3;scene.add(key);
  const rim=new THREE.DirectionalLight(s.palette[2],3.1);rim.position.set(3,8,-8);scene.add(rim);const fill=new THREE.DirectionalLight('#aac9f4',.75);fill.position.set(5,5,8);scene.add(fill);
  const stone=new THREE.MeshStandardMaterial({color:'#2a3546',metalness:.25,roughness:.66}),edge=metal('#121d2b',.45),gold=metal('#958360',.32),ink=metal('#3d485a',.55);
  this.mesh(new THREE.CylinderGeometry(7.5,7.7,.5,96),edge,point(0,-.35,0));
  this.mesh(new THREE.CylinderGeometry(7.25,7.4,.16,96),gold,point(0,-.025,0));
  const floor=this.mesh(new THREE.CircleGeometry(7.15,96),new THREE.MeshStandardMaterial({map:this.marble(),metalness:.34,roughness:.43}),point(0,.062,0));floor.rotation.x=-Math.PI/2;floor.castShadow=false;
  for(const r of [7.13,7.37]){const ring=this.mesh(new THREE.TorusGeometry(r,.016,6,128),light(s.palette[3],.65),point(0,.085,0));ring.rotation.x=-Math.PI/2;ring.castShadow=false;}
  const seal=new THREE.Group();seal.position.y=.071;scene.add(seal);for(let i=0;i<8;i++){const line=this.mesh(new THREE.BoxGeometry(.018,.005,3.55),gold,point(),seal);line.rotation.y=i*Math.PI/4;line.castShadow=false;}for(const r of [1.2,1.8,2]){const ring=this.mesh(new THREE.TorusGeometry(r,.014,4,96),gold,point(),seal);ring.rotation.x=-Math.PI/2;ring.castShadow=false;}
  // A pair of worn stairs and staggered broken columns establishes real depth.
  for(let i=0;i<4;i++)this.mesh(new THREE.BoxGeometry(5.2+i*.6,.16,1),stone,point(0,-.22-i*.15,7.3+i*.65));
  for(const side of [-1,1])for(let n=0;n<3;n++){
   const p=point(side*(7.8+n*.3),0,-3.3-n*3.8),height=4.3+n*.95;
   this.mesh(new THREE.BoxGeometry(1.15,.4,1.15),edge,p.clone());this.mesh(new THREE.BoxGeometry(.88,.15,.88),gold,p.clone().add(point(0,.25,0)));
   this.mesh(new THREE.CylinderGeometry(.28,.39,height,12),stone,p.clone().add(point(0,height/2+.3,0)));
   for(let j=0;j<8;j++){const a=j*Math.PI/4;this.mesh(new THREE.CylinderGeometry(.025,.035,height-.35,6),ink,p.clone().add(point(Math.sin(a)*.3,height/2+.3,Math.cos(a)*.3)));}
   for(const y of [.48,height+.12])this.mesh(new THREE.CylinderGeometry(.47,.47,.12,12),gold,p.clone().add(point(0,y,0)));
   const top=this.mesh(new THREE.BoxGeometry(.93,.26,.93),stone,p.clone().add(point(0,height+.32,0)));top.rotation.y=.15*side;
   const crystal=this.mesh(new THREE.OctahedronGeometry(.23),light(s.palette[2],1.8),p.clone().add(point(0,height+.92,0)));this.moving.push({object:crystal,base:crystal.position.y,kind:'crystal',phase:n});this.glow(crystal.position,s.palette[2],2,.35);
  }
  for(const side of [-1,1]){
   const arch=new THREE.Group();arch.position.set(side*7.9,0,-10);scene.add(arch);
   for(let n=0;n<15;n++){const angle=n/14*Math.PI,block=this.mesh(new THREE.BoxGeometry(.5,.65,.75),stone,point(Math.cos(angle)*2.8,5.4+Math.sin(angle)*3.2,0),arch);block.rotation.z=angle-Math.PI/2;}
  }
  // Keep the painted distant skyline behind world-space architecture at every camera angle.
  new THREE.TextureLoader().load('assets/visual/celestial-sanctum-v6.png',texture=>{
   if(s.disposed){texture.dispose();return;}texture.colorSpace=THREE.SRGBColorSpace;this.textures.push(texture);this.backdrop=texture;scene.background=texture;scene.backgroundIntensity=.72;this.resize(s.width,s.height);s.render();
  },undefined,()=>{});
  const positions=[];for(let i=0;i<90;i++)positions.push(Math.sin(i*71)*11,1+(i*.13)%7,Math.cos(i*43)*9-2);const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));this.motes=new THREE.Points(pg,new THREE.PointsMaterial({map:this.glowMap,size:.14,color:theme==='ember'?'#ffc684':'#c5deff',transparent:true,opacity:.65,depthWrite:false,blending:THREE.AdditiveBlending}));scene.add(this.motes);
  // Low transparent clouds and restrained shafts of light soften the horizon.
  for(let i=0;i<6;i++){const fog=this.glow(point((i-2.5)*5,.0,-5-i%2*4),'#7e9bb9',13,.12);fog.scale.y=1.5;this.moving.push({object:fog,base:fog.position.x,kind:'fog',phase:i});}
  for(const x of [-5.7,5.7]){const geo=new THREE.PlaneGeometry(1.7,11),mat=new THREE.MeshBasicMaterial({color:s.palette[2],map:this.glowMap,transparent:true,opacity:.1,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});const beam=this.mesh(geo,mat,point(x,5,-6));beam.rotation.z=x>0?-.22:.22;beam.castShadow=false;}
 }
 adorn(u,rank){
  const color=u.color,allied=u.side==='ally';
  if(allied){
   const geo=new THREE.PlaneGeometry(rank>=3?.85:.66,1.45,12,18),pos=geo.attributes.position;
   for(let i=0;i<pos.count;i++){const y=pos.getY(i),f=(.725-y)/1.45;pos.setX(i,pos.getX(i)*(.65+f*.8));pos.setZ(i,-.05-Math.sin(f*Math.PI)*.16);}geo.computeVertexNormals();
   const cape=new THREE.MeshStandardMaterial({color:new THREE.Color(color).multiplyScalar(rank>=4?.4:.25),roughness:.65,metalness:.12,side:THREE.DoubleSide});cape.onBeforeCompile=shader=>{shader.uniforms.capeTime={value:0};u.capeUniform=shader.uniforms.capeTime;shader.vertexShader='uniform float capeTime;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nfloat hem = clamp((0.725-position.y)/1.45,0.0,1.0); transformed.z += sin(position.x*7.0+capeTime*2.4+hem*3.0)*0.065*hem;');};
   u.cape=this.mesh(geo,cape,point(0,1.12,-.28),u.root);u.cape.rotation.x=.15;
   if(rank>=2){for(const sign of [-1,1]){const shoulder=this.mesh(new THREE.SphereGeometry(.18,16,12,0,Math.PI*2,0,Math.PI*.65),metal(rank>=4?'#d4bd85':'#849bb3',.3),point(sign*.36,1.95,0),u.root);shoulder.scale.set(1.35,.6,1.1);}}
   if(rank>=3){this.glow(point(0,1.45,-.15),color,1.15,.16,u.root);const tiara=this.mesh(new THREE.TorusGeometry(.25,.014,6,48,Math.PI*1.7),metal(rank>=4?'#ead59b':'#c9c4ee',.25),point(0,2.43,.04),u.root);tiara.rotation.x=Math.PI/2;}
  } else if(this.stage.stage.boss){
   for(const side of [-1,1]){const wing=new THREE.Shape();wing.moveTo(0,0);wing.bezierCurveTo(side*.8,.6,side*1.9,1,side*2.1,.4);wing.lineTo(side*1.65,.1);wing.lineTo(side*1.85,-.4);wing.lineTo(side*.9,-.15);wing.lineTo(side*1.05,-.7);wing.lineTo(0,-.25);const m=this.mesh(new THREE.ExtrudeGeometry(wing,{depth:.06,bevelEnabled:true,bevelThickness:.04,bevelSize:.03,bevelSegments:2,curveSegments:14}),metal('#3b3658',.38),point(side*.15,2.4,-.4),u.root);m.rotation.y=side*.12;}
   this.glow(point(0,2,0),'#ca8fb4',3,.2,u.root);
  }
 }
 resize(width,height){if(!this.backdrop||!width||!height)return;const t=this.backdrop,a=width/height,source=t.image.width/t.image.height;t.repeat.set(Math.min(1,a/source),Math.min(1,source/a));t.offset.set((1-t.repeat.x)*.5,(1-t.repeat.y)*.72);t.updateMatrix();}
 tick(t){if(this.stage.reduced)return;if(this.motes)this.motes.rotation.y=t*.012;for(const m of this.moving){if(m.kind==='crystal'){m.object.position.y=m.base+Math.sin(t*.7+m.phase)*.1;m.object.rotation.y=t*.4;}else m.object.position.x=m.base+Math.sin(t*.08+m.phase)*1.4;}}
 dispose(){for(const t of this.textures)t.dispose();this.textures=[];}
}
