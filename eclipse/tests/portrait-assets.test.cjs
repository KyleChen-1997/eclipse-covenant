const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const C=require('../core.js'),manifest=require('../assets/portraits/manifest-v11.json');
test('all 77 expanded heroes have distinct full-size illustrations and complete art provenance',()=>{
 assert.equal(manifest.assets.length,77);assert.equal(manifest.status,'complete');
 const seen=new Set();
 for(const asset of manifest.assets){
  const h=C.hero(asset.id);assert.equal(h.art,asset.id+'-v11');assert.equal(h.name,asset.name);assert.ok(asset.prompt.includes(h.name));
  const bytes=fs.readFileSync(path.join(__dirname,'..','assets','heroes',h.art+'.png'));
  assert.equal(bytes.toString('hex',0,8),'89504e470d0a1a0a');assert.equal(bytes.readUInt32BE(16),1024);assert.equal(bytes.readUInt32BE(20),1536);
  const hash=crypto.createHash('sha256').update(bytes).digest('hex');assert.ok(!seen.has(hash),h.id+' must have unique art');seen.add(hash);
  assert.equal(asset.sha256,hash);
 }
});
test('every character resolves to a shipped portrait or existing sprite sheet',()=>{
 for(const h of C.HEROES){const file=h.art?'heroes/'+h.art+'.png':h.sheet==='original'?'card-concepts.png':'heroes-'+h.sheet+'.png';assert.ok(fs.existsSync(path.join(__dirname,'../assets',file)),h.id);}
});
