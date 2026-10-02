const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const data=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
test('Caelum fingertips follow the forearm rigidly and rear cape stays off the arm',async()=>{
 const root=path.join(__dirname,'..'),url=data(fs.readFileSync(path.join(root,'vendor/three/three.module.js'),'utf8')),T=await import(url);
 const {rigCaelum}=await import(data(fs.readFileSync(path.join(root,'caelum-rig.js'),'utf8').replace("'three'",JSON.stringify(url))));
 // Include the bounds plus anatomical fingertip and rear-cape probes in normalized space.
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute([-.7,0,-.4,.7,2,.4,.49,.985,.27,.49,1.06,.27,.40,1.1,-.1],3));
 const source=new T.Group();source.add(new T.Mesh(geometry,new T.MeshStandardMaterial()));
 const rig=rigCaelum({scene:source}),mesh=rig.scene.children.find(o=>o.isSkinnedMesh),index=mesh.geometry.attributes.skinIndex,weight=mesh.geometry.attributes.skinWeight;
 const influence=(i,bone)=>{let sum=0;for(let j=0;j<4;j++)if(index.array[i*4+j]===bone)sum+=weight.array[i*4+j];return sum};
 assert.ok(influence(2,4)>.999,'lowest fingertips must not remain partially attached to torso');assert.ok(influence(3,4)>.999);assert.equal(influence(4,3)+influence(4,4),0,'cape must not lift with hand');
 const mixer=new T.AnimationMixer(rig.scene),action=mixer.clipAction(rig.animations.find(c=>c.name==='sword_attack'));action.play();mixer.update(.45);rig.scene.updateMatrixWorld(true);
 const p=new T.Vector3().fromBufferAttribute(mesh.geometry.attributes.position,2),q=new T.Vector3().fromBufferAttribute(mesh.geometry.attributes.position,3),before=p.distanceTo(q);mesh.applyBoneTransform(2,p);mesh.applyBoneTransform(3,q);assert.ok(Math.abs(p.distanceTo(q)-before)<1e-5,'hand must not stretch during the lift');
 mixer.update(.45);rig.scene.updateMatrixWorld(true);const end=new T.Vector3().fromBufferAttribute(mesh.geometry.attributes.position,2);mesh.applyBoneTransform(2,end);assert.ok(end.distanceTo(new T.Vector3(.49,.985,.27))<1e-5,'attack returns to original pose');
});
