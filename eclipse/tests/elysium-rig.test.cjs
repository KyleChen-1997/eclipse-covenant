const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const data=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
test('Elysium has separate articulated wings and complete, returning cast animation',async()=>{
 const root=path.join(__dirname,'..'),url=data(fs.readFileSync(path.join(root,'vendor/three/three.module.js'),'utf8')),T=await import(url);
 const {rigElysium}=await import(data(fs.readFileSync(path.join(root,'elysium-rig.js'),'utf8').replace("'three'",JSON.stringify(url))));
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute([-.7,0,-.4,.7,2,.4,.49,1.03,.27,-.49,1.03,.27],3));
 const source=new T.Group();source.add(new T.Mesh(geometry,new T.MeshStandardMaterial()));const rig=rigElysium({scene:source});
 const wingL=rig.scene.getObjectByName('Elysium_wingL'),wingR=rig.scene.getObjectByName('Elysium_wingR');assert.ok(wingL&&wingR);assert.equal(wingL.children.length,8);assert.equal(wingR.children.length,8);
 assert.deepEqual(rig.animations.map(c=>c.name),['idle','spell1','receivehit','death']);
 const cast=rig.animations.find(c=>c.name==='spell1');for(const track of cast.tracks)assert.deepEqual([...track.values.slice(0,track.getValueSize())],[...track.values.slice(-track.getValueSize())],track.name+' must return to rest');
 const mixer=new T.AnimationMixer(rig.scene);mixer.clipAction(cast).play();mixer.update(.9);
 for(const part of ['armL','armR','foreL','foreR'])assert.ok(rig.scene.getObjectByName('Elysium_'+part).quaternion.angleTo(new T.Quaternion())>.1,part+' must move during casting');
 assert.ok(wingL.quaternion.angleTo(new T.Quaternion())>.1);assert.ok(wingR.quaternion.angleTo(new T.Quaternion())>.1);
});
