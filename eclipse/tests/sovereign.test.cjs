const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const C=require('../core.js'),G=C.Gear,I=C.Inventory;
function ready(stage=6,ids=['astra','aurelia','noctis','caelum','elysium']){
 const s=C.freshState(),gate=C.DUNGEONS[stage].gate;s.clears=Array.from({length:48},(_,i)=>i);s.dungeonClears=[0,1,2,3,4,5,6,7];s.team=ids;s.dust=10000000;
 for(const id of ids){s.owned[id]=1;s.levels[id]=gate.level;s.stars[id]=gate.level===70?5:4;for(const slot of Object.keys(C.SLOT_NAMES)){const g=C.addGear(s,slot+'-'+C.GEAR_RANKS[gate.gearRank].toLowerCase(),G.seeded(s.nextGearId));g.stars=gate.stars;for(let l=0;l<gate.enhance;l++)C.enhanceGear(s,g.uid,l,G.seeded(g.uid*37+l));C.equip(s,id,g.uid);}}
 return s;
}
function finish(b){assert.ok(!b.error,b.error);let n=0;while(!['win','lose'].includes(b.phase)&&n++<2000)C.autoStep(b);assert.ok(n<2000);return b;}
function combos(list,k){const out=[];const pick=(start,cur)=>{if(cur.length===k){out.push([...cur]);return;}for(let i=start;i<=list.length-k+cur.length;i++){cur.push(list[i]);pick(i+1,cur);cur.pop();}};pick(0,[]);return out;}
test('formation defaults to rarity descending, with level tie-breaks; level mode prioritizes level',()=>{
 const s=C.freshState();for(const id of ['elysium','seraphine','astra','aurelia','selene']){s.owned[id]=1;s.levels[id]=1;}s.levels.milo=20;s.levels.scarlet=19;s.levels.aurelia=15;
 const before=C.clone(s),byRank=C.availableHeroes(s),byLevel=C.availableHeroes(s,'level');
 assert.deepEqual(byRank.slice(0,5).map(h=>h.id),['elysium','seraphine','aurelia','astra','selene']);
 assert.deepEqual(byLevel.slice(0,4).map(h=>h.id),['milo','scarlet','aurelia','elysium']);
 assert.equal(new Set(byRank.map(h=>h.id)).size,Object.keys(s.owned).length);assert.deepEqual(s,before);
 assert.deepEqual(C.availableHeroes(s,'unknown'),byRank);assert.ok(C.setTeam(s,byLevel.slice(0,5).map(h=>h.id)));assert.equal(s.team[0],'milo');
});
test('six illustrated sovereign items cover every slot, keep tier stats increasing and have verified assets',()=>{
 assert.deepEqual(C.GEAR_RANKS,['N','R','SR','SSR','UR','SP','SSP']);assert.equal(C.EQUIPMENT.length,31);
 const manifest=require('../assets/equipment/manifest.json');
 for(const slot of Object.keys(C.SLOT_NAMES))for(const rank of ['SP','SSP']){
  const d=C.equipment(slot+'-'+rank.toLowerCase()),previous=C.equipment(slot+'-'+(rank==='SP'?'ur':'sp'));
  assert.ok(d);assert.ok(d.hp+d.atk>d.power);assert.ok(d.hp+d.atk>previous.hp+previous.atk);assert.ok(d.power>previous.power);
  const asset=manifest.assets.find(a=>a.id===d.id),bytes=fs.readFileSync(path.join(__dirname,'../assets/equipment',asset.file));assert.ok(bytes.length>10000);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),asset.sha256);
 }
});
test('all new gate conditions are enforced atomically for battle and previously cleared sweeps',()=>{
 for(const stage of [6,7]){
  const base=ready(stage),g=C.DUNGEONS[stage].gate;assert.ok(C.dungeonReadiness(base,stage).ready);
  const mutations=[s=>s.clears=s.clears.filter(n=>n!==C.DUNGEONS[stage].unlock),s=>s.dungeonClears=s.dungeonClears.filter(n=>n!==C.DUNGEONS[stage].requiresDungeon),s=>s.team.pop(),s=>s.team[4]=s.team[0],s=>s.levels.astra=g.level-1,s=>{s.team[0]='selene';s.owned.selene=1;s.levels.selene=70;s.loadouts.selene=s.loadouts.astra;},s=>delete s.loadouts.astra.armor,s=>I.get(s,s.loadouts.astra.weapon).template='weapon-ssr',s=>I.get(s,s.loadouts.astra.armor).stars=g.stars-1,s=>I.get(s,s.loadouts.astra.relic).enhance=g.enhance-1];
  for(const mutate of mutations){const s=C.clone(base);mutate(s);const before=C.clone(s);assert.equal(C.dungeonReadiness(s,stage).ready,false);assert.ok(C.battle(s,stage,'dungeon').error);assert.ok(C.sweepPreview(s,stage,1,'dungeon').error);assert.ok(C.sweep(s,stage,1000000,Math.random,'dungeon').error);assert.deepEqual(s,before);}
 }
});
test('older dungeons never drop SP or SSP and keep exactly their existing rates',()=>{
 const rates=[[.65,.30,.05,0,0],[.1,.5,.35,.05,0],[0,.15,.55,.28,.02],[0,0,.30,.58,.12],[0,0,0,.7,.3],[0,0,0,.4,.6]];
 for(let i=0;i<6;i++){assert.deepEqual(C.DUNGEONS[i].rates,[...rates[i],0,0]);assert.deepEqual(C.DROP_RATES[i],C.DUNGEONS[i].rates);const s=C.freshState();s.dungeonClears=[i];const r=C.sweep(s,i,1000,G.seeded(i+9),'dungeon');assert.ok(r.gearGroups.every(g=>C.GEAR_RANKS.indexOf(C.equipment(g.item.template).rarity)<5));}
});
test('SP 1% and SSP 0.1% intervals work at boundaries and reach all three equipment designs',()=>{
 for(const [stage,rank,cutoff] of [[6,'SP',.99],[7,'SSP',.999]]){
  const s=ready(stage),pool=C.EQUIPMENT.filter(g=>g.rarity===rank);assert.equal(pool.length,3);
  for(const [roll,expected] of [[0,stage===6?'UR':'SP'],[cutoff-1e-8,stage===6?'UR':'SP'],[cutoff,rank],[.99999999,rank]]){let n=0;const r=C.sweep(s,stage,1,()=>n++===0?roll:.2,'dungeon');assert.equal(C.equipment(r.gear[0].template).rarity,expected);}
  for(let i=0;i<3;i++){let n=0;const r=C.sweep(s,stage,1,()=>n++===0?.999999:n===2?(i+.5)/3:.4,'dungeon');assert.equal(r.gear[0].template,pool[i].id);}
 }
});
test('both high-tier bosses are winnable at their entry requirements across all 462 UR+ formations',()=>{
 const ids=C.HEROES.filter(h=>C.rankOf(h)>=4).map(h=>h.id);
 for(const stage of [6,7])for(const five of combos(ids,5)){const s=ready(stage,five);assert.equal(finish(C.battle(s,stage,'dungeon')).phase,'win',`${stage}: ${s.team}`);}
});
test('SP and SSP enhancements, same-template ascension costs, ownership and affixes survive reload',()=>{
 for(const rank of ['SP','SSP']){let s=C.freshState();s.dust=10000000;const g=C.addGear(s,'weapon-'+rank.toLowerCase(),G.seeded(91));C.equip(s,'milo',g.uid);const original=C.stats(s,'milo');
  for(let star=0;star<5;star++){const m=C.addGear(s,g.template),before=s.dust;assert.equal(C.ascendGear(s,g.uid,m.uid,star,G.seeded(star+75)).stars,star+1);assert.equal(before-s.dust,(rank==='SP'?1440:4320)*(star+1));}
  for(let level=0;level<15;level++)assert.equal(C.enhanceGear(s,g.uid,level,G.seeded(level+84)).level,level+1);
  assert.ok(C.stats(s,'milo').atk>original.atk);assert.ok(Number.isFinite(s.dust));assert.deepEqual(C.restoreState(C.clone(s)),s);assert.equal(C.gearOwner(s,g.uid),'milo');assert.equal(I.get(s,g.uid).affixes.length,4);
 }
});
test('million SSP dungeon drops retain seven-tier probabilities, inventory sorting and compact saves',()=>{
 const s=ready(7),r=C.sweep(s,7,1000000,G.seeded(834),'dungeon');assert.equal(r.gearCount,1000000);assert.equal(r.gearGroups.reduce((n,g)=>n+g.count,0),1000000);
 const highest=I.count(s,{rarity:'SSP'});assert.ok(highest>850&&highest<1150,highest);assert.ok(r.gearGroups.every(g=>['SP','SSP'].includes(C.equipment(g.item.template).rarity)));
 assert.equal(C.equipment(I.page(s,{limit:1}).items[0].template).rarity,'SSP');assert.ok(JSON.stringify(s).length<20000);assert.deepEqual(C.restoreState(C.clone(s)),s);
});
