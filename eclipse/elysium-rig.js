import * as T from 'three';
// Local, proportion-based skinning for the generated A-pose. The long robe
// follows the pelvis; arms and head receive independent smooth skin weights.
export function rigElysium(source){
 const scene=new T.Group();scene.name='Elysium';source.scene.updateMatrixWorld(true);
 const box=new T.Box3().setFromObject(source.scene),height=box.max.y-box.min.y,center=box.getCenter(new T.Vector3());
 const defs=[['hips',null,[0,.88,.44]],['chest','hips',[0,1.42,.49]],['head','chest',[0,1.73,.5]],['armL','chest',[.20,1.56,.50]],['foreL','armL',[.32,1.32,.53]],['armR','chest',[-.20,1.56,.50]],['foreR','armR',[-.32,1.32,.53]],['legL','hips',[.16,.82,0]],['legR','hips',[-.16,.82,0]]];
 const bones=[],byName={};for(const [name,parent,p] of defs){const b=new T.Bone();b.name='Elysium_'+name;b.position.fromArray(p);if(parent){const origin=defs.find(d=>d[0]===parent)[2];b.position.sub(new T.Vector3(...origin));byName[parent].add(b)}else scene.add(b);bones.push(b);byName[name]=b}scene.updateMatrixWorld(true);const skeleton=new T.Skeleton(bones);
 const smooth=(a,b,x)=>T.MathUtils.smoothstep(x,a,b);
 source.scene.traverse(o=>{if(!o.isMesh)return;const geo=o.geometry.clone();geo.applyMatrix4(o.matrixWorld);geo.translate(-center.x,-box.min.y,-center.z);geo.scale(2/height,2/height,2/height);const p=geo.attributes.position,indices=new Uint16Array(p.count*4),weights=new Float32Array(p.count*4);
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),ax=Math.abs(x),w=new Map();const put=(n,v)=>w.set(n,(w.get(n)||0)+v);const head=smooth(1.64,1.79,y);// Follow the actual arm centreline in all three dimensions. In particular,
 // the hand must be fully bound, while the long cape behind it stays on the torso.
 const t=T.MathUtils.clamp((1.32-y)/.28,0,1),upper=T.MathUtils.clamp((1.56-y)/.24,0,1);
 const cx=y<1.32?.32+.145*t:.20+.12*upper,cz=y<1.32?.53+.04*t:.50+.03*upper;
 const radius=Math.hypot(ax-cx,(z-cz)*1.2);
 const arm=(1-smooth(.085,.13,radius))*smooth(.15,.23,ax)*smooth(.88,.97,y)*(1-smooth(1.54,1.64,y));
 const fore=1-smooth(1.27,1.37,y);const chest=smooth(.92,1.35,y);put(2,head);put(x>0?3:5,(1-head)*arm*(1-fore));put(x>0?4:6,(1-head)*arm*fore);put(1,(1-head)*(1-arm)*chest);put(0,(1-head)*(1-arm)*(1-chest));const list=[...w].filter(e=>e[1]>0).sort((a,b)=>b[1]-a[1]).slice(0,4),sum=list.reduce((s,e)=>s+e[1],0);list.forEach(([id,v],j)=>{indices[i*4+j]=id;weights[i*4+j]=v/sum})}
 geo.setAttribute('skinIndex',new T.Uint16BufferAttribute(indices,4));geo.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));const materials=(Array.isArray(o.material)?o.material:[o.material]).map(m=>{const c=m.clone();c.envMapIntensity=.9;return c});const mesh=new T.SkinnedMesh(geo,Array.isArray(o.material)?materials:materials[0]);mesh.name='Elysium_Armor';scene.add(mesh);mesh.bind(skeleton);mesh.frustumCulled=false;
 });
 attachRegalia(byName);
 const clips=[];function clip(name,duration,poses){const tracks=[];for(const [bone,rotations]of Object.entries(poses)){const values=[];for(const r of rotations)new T.Quaternion().setFromEuler(new T.Euler(...r)).toArray(values,values.length);tracks.push(new T.QuaternionKeyframeTrack('Elysium_'+bone+'.quaternion',[0,duration*.25,duration*.5,duration*.75,duration],values))}clips.push(new T.AnimationClip(name,duration,tracks))}
 const zero=[0,0,0];
 clip('idle',4,{chest:[zero,[.012,0,.008],zero,[-.01,0,-.008],zero],head:[zero,[0,.025,0],zero,[0,-.025,0],zero],armL:[zero,[0,0,.015],zero,[0,0,-.01],zero],armR:[zero,[0,0,-.015],zero,[0,0,.01],zero],wingL:[zero,[0,.09,.025],zero,[0,-.07,-.02],zero],wingR:[zero,[0,-.09,-.025],zero,[0,.07,.02],zero]});
 clip('spell1',1.8,{chest:[zero,[-.025,0,0],[-.055,0,0],[.02,0,0],zero],head:[zero,[.04,0,0],[-.025,0,0],zero,zero],armL:[zero,[-.24,0,.10],[-.50,0,.22],[-.24,0,.10],zero],armR:[zero,[-.24,0,-.10],[-.50,0,-.22],[-.24,0,-.10],zero],foreL:[zero,[-.35,0,0],[-.70,0,0],[-.35,0,0],zero],foreR:[zero,[-.35,0,0],[-.70,0,0],[-.35,0,0],zero],wingL:[zero,[0,-.10,.06],[0,-.23,.12],[0,-.10,.06],zero],wingR:[zero,[0,.10,-.06],[0,.23,-.12],[0,.10,-.06],zero]});
 clip('receivehit',.5,{chest:[zero,[-.10,0,.035],[-.07,0,.02],[-.02,0,0],zero],head:[zero,[-.07,0,0],[-.04,0,0],zero,zero],wingL:[zero,[0,.2,0],[0,.1,0],zero,zero],wingR:[zero,[0,-.2,0],[0,-.1,0],zero,zero]});
 clip('death',1.2,{hips:[zero,[.08,0,.12],[.16,0,.40],[.12,0,.95],[0,0,1.5]],chest:[zero,[.10,0,0],[.15,0,0],[.2,0,0],[.2,0,0]],wingL:[zero,[0,.3,-.1],[0,.6,-.2],[0,.8,-.3],[0,.9,-.3]],wingR:[zero,[0,-.3,.1],[0,-.6,.2],[0,-.8,.3],[0,-.9,.3]]});
 const lightTrack=(duration,scales)=>new T.VectorKeyframeTrack('Elysium_light.scale',[0,duration*.25,duration*.5,duration*.75,duration],scales.flatMap(s=>[s,s,s]));
 clips.find(c=>c.name==='idle').tracks.push(lightTrack(4,[.18,.25,.18,.25,.18]));
 clips.find(c=>c.name==='spell1').tracks.push(lightTrack(1.8,[.18,.65,1,.65,.18]));
 clips.find(c=>c.name==='death').tracks.push(lightTrack(1.2,[.18,.12,.05,0,0]));
 return {scene,animations:clips};
}
function attachRegalia(bones){
 const light=new T.Group();light.name='Elysium_light';light.position.set(0,-.05,.43);light.scale.setScalar(.18);bones.chest.add(light);
 const crystal=new T.Mesh(new T.OctahedronGeometry(.075),new T.MeshPhysicalMaterial({color:'#89cfe8',emissive:'#85c9ef',emissiveIntensity:.18,metalness:.65,roughness:.12,iridescence:1,clearcoat:1}));crystal.scale.y=1.35;light.add(crystal);
 for(const a of [-.6,.6]){const ring=new T.Mesh(new T.TorusGeometry(.18,.005,5,48),new T.MeshBasicMaterial({color:'#dfc9ff',transparent:true,opacity:.75}));ring.rotation.x=a;ring.rotation.y=a;light.add(ring)}
 const colors=['#bdeaff','#e4cdff','#c4fff1','#ffdfef'];
 // Each crystal feather is a closed faceted mesh, articulated as a separate wing.
 for(const side of [-1,1]){
  const wing=new T.Group();wing.name='Elysium_wing'+(side===1?'L':'R');wing.position.set(side*.16,.10,-.20);bones.chest.add(wing);
  for(let i=0;i<8;i++){
   const angle=.38+i*.175,length=.70+Math.sin(i/7*Math.PI)*.24,width=.045+(i/7)*.012;
   const geo=new T.BufferGeometry(),vertices=[0,0,0,-width,length*.50,0,0,length,.0,width,length*.50,0,0,length*.48,.025,0,length*.48,-.018];
   geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setIndex([0,1,4,1,2,4,2,3,4,3,0,4,0,5,1,1,5,2,2,5,3,3,5,0]);geo.computeVertexNormals();
   const mat=new T.MeshPhysicalMaterial({color:colors[i%4],metalness:.35,roughness:.16,iridescence:1,iridescenceIOR:1.45,clearcoat:1,emissive:colors[i%4],emissiveIntensity:.12,side:T.DoubleSide});
   const feather=new T.Mesh(geo,mat);feather.position.set(side*i*.019,-i*.012,-i*.007);feather.rotation.z=-side*angle;wing.add(feather);
   const outline=new T.LineSegments(new T.EdgesGeometry(geo,20),new T.LineBasicMaterial({color:'#e8d2a3',transparent:true,opacity:.58}));feather.add(outline);
  }
 }
 const halo=new T.Group();halo.position.set(0,.18,-.20);bones.head.add(halo);
 for(const radius of [.245,.285]){const ring=new T.Mesh(new T.TorusGeometry(radius,.004,5,72),new T.MeshStandardMaterial({color:'#f6d996',metalness:.8,roughness:.25,emissive:'#ffd9a0',emissiveIntensity:.25}));halo.add(ring)}
 for(let i=0;i<12;i++){const a=i*Math.PI/6,gem=new T.Mesh(new T.OctahedronGeometry(i%3===0?.024:.012),new T.MeshStandardMaterial({color:colors[i%4],metalness:.3,roughness:.12,emissive:colors[i%4],emissiveIntensity:.35}));gem.position.set(Math.sin(a)*.285,Math.cos(a)*.285,0);halo.add(gem)}
}
