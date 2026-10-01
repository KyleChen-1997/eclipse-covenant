const test=require('node:test');
const assert=require('node:assert/strict');
const C=require('../core.js'),I=C.Inventory;
function ready(){const s=C.freshState();s.clears=[0];s.dungeonClears=[0,5];s.tickets=20000;return s;}
const rng=seed=>C.Gear.seeded(seed);

test('custom draw bounds, balance and safe integer checks reject without changes',()=>{
  for(const count of [0,-1,10001,1.2,'10',NaN,Infinity,null]){const s=ready(),before=C.clone(s);assert.ok(C.draw(s,count).error);assert.deepEqual(s,before);}
  for(const field of ['tickets','dust','pulls','owned']){const s=ready();if(field==='tickets')s.tickets=9999;else if(field==='owned')s.owned.milo=Number.MAX_SAFE_INTEGER;else s[field]=Number.MAX_SAFE_INTEGER;const before=C.clone(s);assert.ok(C.draw(s,10000).error);assert.deepEqual(s,before);}
  for(const count of [1,7,10,99,10000])assert.equal(C.draw(ready(),count,rng(81)).cards.length,count);
});

test('10,000 summons exactly match 10,000 single pulls, including every pity, copy, dust and history entry',()=>{
  const batch=ready(),single=C.clone(batch),a=rng(6210),b=rng(6210);
  const cards=C.draw(batch,10000,a).cards,serial=[];
  for(let i=0;i<10000;i++)serial.push(...C.draw(single,1,b).cards);
  assert.deepEqual(cards,serial);assert.deepEqual(batch,single);assert.equal(batch.history.length,30);
  assert.equal(batch.tickets,10000);assert.equal(Object.values(batch.owned).reduce((a,b)=>a+b,0),10003);
  assert.deepEqual(C.restoreState(C.clone(batch)),batch);
});

test('large lifetime counts above the former ten-million cap survive restore',()=>{
  const s=ready();s.owned.milo=12000000;s.pulls=20000000;s.nextGearId=21000000;
  C.draw(s,10000,rng(143));C.sweep(s,0,101,rng(645),'dungeon');assert.deepEqual(C.restoreState(C.clone(s)),s);
});

test('million story sweeps grant exact resources, respect XP caps and do not repeat first clears',()=>{
  const s=ready(),initial=C.clone(s),r=C.sweep(s,0,1000000);
  assert.equal(r.tickets,3000000);assert.equal(r.dust,50000000);assert.equal(s.tickets,3020000);assert.equal(s.dust,50000300);
  assert.deepEqual(s.clears,[0]);assert.equal(I.count(s),0);
  for(const id of s.team){let earned=0;for(let i=0;i<1000000&&initial.levels[id]<20;i++)earned+=C.gainExperience(initial,id,C.STAGES[0].xp).earned;assert.equal(r.experience.find(x=>x.id===id).earned,earned);assert.equal(s.levels[id],20);}
  const before=C.clone(s);assert.ok(C.sweep(s,0,1000001).error);assert.deepEqual(s,before);
});

test('million dungeon sweeps preserve all unique items in a small save with independent stable affixes',()=>{
  const s=ready(),r=C.sweep(s,5,1000000,rng(710),'dungeon');
  assert.equal(I.count(s),1000000);assert.equal(s.nextGearId,1000001);assert.equal(r.gearCount,1000000);
  assert.equal(r.gearGroups.reduce((a,g)=>a+g.count,0),1000000);assert.ok(r.gear.length<=25);assert.equal(s.tickets,20000);
  const ur=I.count(s,{rarity:'UR'});assert.ok(ur>595000&&ur<605000,`UR count ${ur}`);
  assert.equal(I.count(s,{rarity:'SSR'})+ur,1000000);
  const data=JSON.stringify(s);assert.ok(data.length<12000,`save bytes: ${data.length}`);
  const restored=C.restoreState(JSON.parse(data));assert.deepEqual(restored,s);
  const ids=[1,2,3,31,3456,197721,700009,999999,1000000],variants=new Set();
  for(const uid of ids){const a=I.get(s,uid),b=I.get(restored,uid);assert.equal(a.uid,uid);assert.deepEqual(a,b);assert.ok(a.affixes.length>=2&&a.affixes.length<=4);variants.add(JSON.stringify(a.affixes));}
  assert.equal(variants.size,ids.length);assert.equal(s.gear.length,0);
  const last=I.page(restored,{offset:999984,limit:48});assert.equal(last.items.length,16);assert.equal(last.total,1000000);
});

test('equipment can be worn, enhanced, awakened and consumed from compact inventory without rerolls or resurrection',()=>{
  const s=ready();C.sweep(s,0,1000,rng(623),'dungeon');const g=I.page(s,{limit:1}).items[0],original=C.clone(g),beforeCount=I.count(s);
  assert.ok(C.equip(s,'milo',g.uid).ok);assert.deepEqual(I.get(s,g.uid),original);assert.equal(I.count(s),beforeCount);
  const a=C.gearAscension(s,g.uid);assert.ok(a.materialCount>0);assert.ok(a.materials.length<=40);
  const material=a.materials[0],other=I.get(s,g.uid===1?2:1),untouched=C.clone(other);
  assert.equal(C.ascendGear(s,g.uid,material,0,rng(825)).stars,1);assert.equal(I.get(s,material),null);assert.equal(I.count(s),beforeCount-1);
  assert.equal(C.enhanceGear(s,g.uid,0,rng(963)).level,1);
  const saved=C.restoreState(C.clone(s));assert.equal(C.gearOwner(saved,g.uid),'milo');assert.equal(I.get(saved,material),null);assert.deepEqual(I.get(saved,g.uid),I.get(s,g.uid));
  if(other.uid!==material)assert.deepEqual(I.get(saved,other.uid),untouched);
  const before=C.clone(saved);assert.ok(C.ascendGear(saved,g.uid,material,1).error);assert.deepEqual(saved,before);
});

test('range splits, filtering and pagination include each piece exactly once alongside legacy gear',()=>{
  const s=ready();C.addGear(s,'weapon-ur',rng(85));C.sweep(s,0,150,rng(654),'dungeon');
  const block=s.gearBatches.find(b=>b.count>6),mid=block.start+Math.floor(block.count/2),snapshot=I.get(s,mid);
  I.materialize(s,mid);assert.deepEqual(I.get(s,mid),snapshot);I.remove(s,block.start);I.remove(s,block.start+block.count-1);
  const n=I.count(s),all=[];for(let offset=0;offset<n;offset+=13)all.push(...I.page(s,{offset,limit:13}).items);
  assert.equal(n,149);assert.equal(new Set(all.map(g=>g.uid)).size,n);
  for(const rank of C.GEAR_RANKS){const expected=all.filter(g=>C.equipment(g.template).rarity===rank);assert.equal(I.count(s,{rarity:rank}),expected.length);assert.deepEqual(I.page(s,{rarity:rank,limit:500}).items,expected);}
  assert.deepEqual(C.restoreState(C.clone(s)),s);
});

test('several million-piece sweeps keep inventory IDs unique and save bounded by batches',()=>{
  const s=ready();for(let i=0;i<3;i++)C.sweep(s,0,1000000,rng(7+i),'dungeon');
  assert.equal(I.count(s),3000000);assert.equal(s.nextGearId,3000001);assert.ok(JSON.stringify(s).length<16000);
  const b=s.gearBatches;for(let i=1;i<b.length;i++)assert.equal(b[i-1].start+b[i-1].count,b[i].start);
  assert.deepEqual(C.restoreState(C.clone(s)),s);
});

test('invalid, overlapping and unsupported compact save ranges cannot duplicate explicit gear',()=>{
  const s=ready(),g=C.addGear(s,'weapon-ur');s.gearBatches=[{version:1,start:g.uid,count:3,template:g.template,seed:1},{version:1,start:20,count:30,template:g.template,seed:2},{version:1,start:25,count:30,template:g.template,seed:3},{version:2,start:70,count:30,template:g.template,seed:3},{version:1,start:100,count:Infinity,template:g.template,seed:4}];
  const restored=C.restoreState(s);assert.equal(I.count(restored),31);assert.equal(restored.gearBatches.length,1);assert.equal(restored.nextGearId,50);
});

test('compact inventory rejects non-integer and invalid IDs without changing ranges',()=>{const s=ready();C.sweep(s,0,101,rng(321),'dungeon');const before=C.clone(s);for(const uid of [1.5,'1',NaN,Infinity,-1,0]){assert.equal(I.get(s,uid),null);assert.equal(I.remove(s,uid),false);assert.ok(C.equip(s,'milo',uid).error);}assert.deepEqual(s,before);});
