const test=require('node:test');
const assert=require('node:assert/strict');
const C=require('../core.js');
function cleared(){const s=C.freshState();s.clears=[0];return s;}
function rng(seed=87){return ()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);}

test('sweeps require a cleared stage, valid integer count and a valid current team without mutating rejected state',()=>{
  const cases=[[-1,10],[1,10],[12,10],[0.5,10],['0',10],[0,0],[0,-1],[0,1000001],[0,1.2],[0,'10'],[0,NaN],[0,Infinity],[0,null]];
  for(const [stage,count] of cases){const s=cleared(),before=C.clone(s);assert.ok(C.sweepPreview(s,stage,count).error);assert.ok(C.sweep(s,stage,count).error);assert.deepEqual(s,before);}
  const fresh=C.freshState();assert.ok(C.sweep(fresh,0,10).error);
  for(const team of [[],['fake'],['astra'],['milo','milo'],C.HEROES.slice(0,6).map(h=>h.id)]){const s=cleared();s.team=team;const before=C.clone(s);assert.ok(C.sweep(s,0,10).error);assert.deepEqual(s,before);}
});

test('sweep preview is free of effects and uses repeat rewards with a detached team snapshot',()=>{
  const s=cleared(),before=C.clone(s);
  assert.deepEqual(C.sweepPreview(s,0,10),{stage:0,mode:'story',count:10,team:s.team,tickets:30,dust:500,xpPerHero:900,gearCount:0});
  for(const count of [1,5,10,50,100]){const p=C.sweepPreview(s,0,count);assert.equal(p.tickets,3*count);assert.equal(p.dust,50*count);p.team.pop();}
  assert.deepEqual(s,before);
});

test('batch rewards and full resulting state equal consecutive repeat victories across all regions',()=>{
  for(const stage of [0,3,6,11,14,17])for(const count of [1,5,10,50,100]){
    const batch=cleared();batch.clears=Array.from({length:stage+1},(_,i)=>i);batch.team.forEach(id=>batch.stars[id]=3);
    const sequential=C.clone(batch),a=rng(),b=rng(),result=C.sweep(batch,stage,count,a),earned={};
    for(let i=0;i<count;i++){const battle=C.battle(sequential,stage);battle.phase='win';const r=C.claim(sequential,battle,b);r.experience.forEach(x=>earned[x.id]=(earned[x.id]||0)+x.earned);assert.equal(r.first,false);}
    assert.deepEqual(batch,sequential,`stage ${stage}, count ${count}`);
    assert.equal(result.tickets,count*3);assert.equal(result.dust,count*C.STAGES[stage].repeatDust);assert.equal(result.gear.length,0);
    assert.deepEqual(Object.fromEntries(result.experience.map(x=>[x.id,x.earned])),earned);
    assert.deepEqual(batch.clears,Array.from({length:stage+1},(_,i)=>i));assert.equal(result.first,false);
  }
});

test('sweeps award only the selected team, merge growth and respect both zero-star and ascended caps',()=>{
  const s=cleared();s.team=['milo','scarlet'];s.levels.milo=19;s.experience.milo=C.experienceNeeded(19)-10;
  s.stars.scarlet=1;s.levels.scarlet=29;s.experience.scarlet=C.experienceNeeded(29,30)-10;s.owned.scarlet=2;
  const r=C.sweep(s,0,100,()=>0);
  assert.deepEqual(r.experience.map(x=>[x.id,x.fromLevel,x.level,x.earned,x.xp]),[['milo',19,20,90,0],['scarlet',29,30,90,0]]);
  assert.equal(s.levels.lark,1);assert.equal(s.experience.lark,undefined);assert.equal(s.stars.scarlet,1);assert.equal(s.owned.scarlet,2);
  assert.ok(C.sweep(s,0,5).experience.every(x=>x.earned===0));
  assert.equal(C.ascend(s,'scarlet').cap,40);
  const after=C.sweep(s,0,1);assert.equal(after.experience.find(x=>x.id==='scarlet').earned,90);assert.equal(s.experience.scarlet,90);
});

test('each dungeon sweep round independently samples loot and affixes with distinct inventory ids',()=>{const s=cleared();s.clears=Array.from({length:48},(_,i)=>i);s.dungeonClears=[5];const r=C.sweep(s,5,100,()=>.999999,'dungeon');assert.ok(r.gear.every(g=>g.template==='seraph-armor-ur'));assert.equal(new Set(r.gear.map(g=>g.uid)).size,100);assert.ok(r.gear.every(g=>g.affixes.length===4));assert.equal(r.tickets,0);assert.equal(r.dust,100*C.DUNGEONS[5].repeatDust);const second=C.sweep(s,5,5,()=>0,'dungeon');assert.equal(second.gear[0].uid,101);assert.ok(second.gear.every(g=>C.equipment(g.template).rarity==='SSR'));assert.equal(s.gear.length,105);});

test('bulk rewards, level growth, equipped gear and large currency balances survive save roundtrip',()=>{
  const s=cleared();s.tickets=9999999;s.dust=9999999;s.stars.milo=1;
  const item=C.addGear(s,'weapon-ur');C.equip(s,'milo',item.uid);s.dungeonClears=[0];C.sweep(s,0,100,rng(),'dungeon');
  const restored=C.restoreState(JSON.parse(JSON.stringify(s)));
  assert.deepEqual(restored,s);assert.equal(restored.tickets,9999999);assert.equal(restored.dust,10011999);assert.equal(C.gearOwner(restored,item.uid),'milo');assert.equal(restored.gear.length,101);
});

test('capacity validation rejects a whole batch before granting partial rewards',()=>{
  for(const field of ['tickets','dust']){const s=cleared();s[field]=field==='nextGearId'?9999999:Number.MAX_SAFE_INTEGER-1;const before=C.clone(s);assert.ok(C.sweepPreview(s,0,5).error);assert.ok(C.sweep(s,0,5).error);assert.deepEqual(s,before);}
});

test('inventory capacity only limits dungeon sweeps and rejects the whole batch atomically',()=>{const s=cleared();s.dungeonClears=[0];s.nextGearId=Number.MAX_SAFE_INTEGER-2;const before=C.clone(s);assert.ok(C.sweepPreview(s,0,5,'dungeon').error);assert.ok(C.sweep(s,0,5,Math.random,'dungeon').error);assert.deepEqual(s,before);assert.ok(!C.sweepPreview(s,0,5).error);});
