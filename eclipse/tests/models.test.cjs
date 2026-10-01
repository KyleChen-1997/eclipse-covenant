const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
test('all eight offline rigs match their source hashes and include usable skeletons and animation',()=>{
 const dir=path.join(__dirname,'../assets/models'),manifest=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json')));assert.equal(manifest.length,8);
 for(const asset of manifest){const data=fs.readFileSync(path.join(dir,asset.path));assert.equal(crypto.createHash('sha256').update(data).digest('hex'),asset.sha256);assert.equal(data.toString('ascii',0,4),'glTF');assert.equal(data.readUInt32LE(8),data.length);const length=data.readUInt32LE(12),gltf=JSON.parse(data.toString('utf8',20,20+length));assert.ok(gltf.meshes.length,asset.path);assert.ok(gltf.skins.length,asset.path);assert.ok(gltf.animations.length,asset.path);for(const ref of [...(gltf.buffers||[]),...(gltf.images||[])])assert.ok(!ref.uri||ref.uri.startsWith('data:'),'model unexpectedly depends on an external URL');}
});
