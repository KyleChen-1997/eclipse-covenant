import * as T from 'three';
// Local, proportion-based skinning for the generated A-pose. The long robe
// follows the pelvis; arms and head receive independent smooth skin weights.
export function rigCaelum(source){
 const scene=new T.Group();scene.name='Caelum';source.scene.updateMatrixWorld(true);
 const box=new T.Box3().setFromObject(source.scene),height=box.max.y-box.min.y,center=box.getCenter(new T.Vector3());
 const defs=[['hips',null,[0,.88,0]],['chest','hips',[0,1.4,0]],['head','chest',[0,1.73,0]],['armL','chest',[.255,1.57,.14]],['foreL','armL',[.385,1.34,.205]],['armR','chest',[-.255,1.57,.14]],['foreR','armR',[-.385,1.34,.205]],['legL','hips',[.16,.82,0]],['legR','hips',[-.16,.82,0]]];
 const bones=[],byName={};for(const [name,parent,p] of defs){const b=new T.Bone();b.name='Caelum_'+name;b.position.fromArray(p);if(parent){const origin=defs.find(d=>d[0]===parent)[2];b.position.sub(new T.Vector3(...origin));byName[parent].add(b)}else scene.add(b);bones.push(b);byName[name]=b}scene.updateMatrixWorld(true);const skeleton=new T.Skeleton(bones);
 const smooth=(a,b,x)=>T.MathUtils.smoothstep(x,a,b);
 source.scene.traverse(o=>{if(!o.isMesh)return;const geo=o.geometry.clone();geo.applyMatrix4(o.matrixWorld);geo.translate(-center.x,-box.min.y,-center.z);geo.scale(2/height,2/height,2/height);const p=geo.attributes.position,indices=new Uint16Array(p.count*4),weights=new Float32Array(p.count*4);
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),ax=Math.abs(x),w=new Map();const put=(n,v)=>w.set(n,(w.get(n)||0)+v);const head=smooth(1.64,1.79,y);// Follow the actual arm centreline in all three dimensions. In particular,
 // the hand must be fully bound, while the long cape behind it stays on the torso.
 const t=T.MathUtils.clamp((1.34-y)/.30,0,1),upper=T.MathUtils.clamp((1.57-y)/.23,0,1);
 const cx=y<1.34?.385+.105*t:.255+.13*upper,cz=y<1.34?.205+.055*t:.14+.065*upper;
 const radius=Math.hypot(ax-cx,(z-cz)*1.2);
 const arm=(1-smooth(.095,.155,radius))*smooth(.22,.30,ax)*smooth(.88,.97,y)*(1-smooth(1.52,1.65,y));
 const fore=1-smooth(1.29,1.39,y);const chest=smooth(.92,1.35,y);put(2,head);put(x>0?3:5,(1-head)*arm*(1-fore));put(x>0?4:6,(1-head)*arm*fore);put(1,(1-head)*(1-arm)*chest);put(0,(1-head)*(1-arm)*(1-chest));const list=[...w].filter(e=>e[1]>0).sort((a,b)=>b[1]-a[1]).slice(0,4),sum=list.reduce((s,e)=>s+e[1],0);list.forEach(([id,v],j)=>{indices[i*4+j]=id;weights[i*4+j]=v/sum})}
 geo.setAttribute('skinIndex',new T.Uint16BufferAttribute(indices,4));geo.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));const materials=(Array.isArray(o.material)?o.material:[o.material]).map(m=>{const c=m.clone();c.envMapIntensity=.9;return c});const mesh=new T.SkinnedMesh(geo,Array.isArray(o.material)?materials:materials[0]);mesh.name='Caelum_Armor';scene.add(mesh);mesh.bind(skeleton);mesh.frustumCulled=false;
 });
 const clips=[];function clip(name,duration,poses){const tracks=[];for(const [bone,rotations]of Object.entries(poses)){const values=[];for(const r of rotations)new T.Quaternion().setFromEuler(new T.Euler(...r)).toArray(values,values.length);tracks.push(new T.QuaternionKeyframeTrack('Caelum_'+bone+'.quaternion',[0,duration*.25,duration*.5,duration*.75,duration],values))}clips.push(new T.AnimationClip(name,duration,tracks))}
 const zero=[0,0,0];clip('idle',3.6,{chest:[zero,[.015,0,.012],zero,[-.012,0,-.012],zero],head:[zero,[0,.035,0],zero,[0,-.035,0],zero],armL:[zero,[0,0,.025],zero,[0,0,-.015],zero],armR:[zero,[0,0,-.025],zero,[0,0,.015],zero]});
 clip('sword_attack',.9,{chest:[zero,[0,-.18,.04],[.06,.22,-.03],[0,.1,0],zero],armL:[zero,[-.18,0,.12],[-.45,0,.28],[-.2,0,.12],zero],foreL:[zero,[-.35,0,0],[-.85,0,0],[-.3,0,0],zero],head:[zero,[0,.12,0],[0,-.1,0],zero,zero]});
 clip('receivehit',.36,{chest:[zero,[-.14,0,.04],[-.09,0,0],[-.04,0,0],zero],head:[zero,[-.1,0,0],[-.06,0,0],zero,zero]});
 clip('death',1,{hips:[zero,[.1,0,.18],[.2,0,.55],[.15,0,1.2],[0,0,1.5]],chest:[zero,[.1,0,0],[.15,0,0],[.2,0,0],[.2,0,0]]});
 return {scene,animations:clips};
}
