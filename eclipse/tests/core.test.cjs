const test=require('node:test');
const assert=require('node:assert/strict');
const C=require('../core.js');
const state=()=>C.freshState();
const allHeroes=()=>{const s=state();for(const h of C.HEROES){s.owned[h.id]=1;s.levels[h.id]=1;}s.team=['selene','scarlet','lark','milo','astra'];return s;};

test('new players can enter combat without summoning',()=>{
  const s=state(),b=C.battle(s,0);assert.equal(s.tickets,200);assert.equal(b.allies.length,3);assert.equal(b.ap,5);
  assert.ok(C.battle(s,1).error);assert.ok(C.battle({...s,team:[]},0).error);
});
test('rarity probabilities sum to 100% and boundary rolls are handled',()=>{
  assert.ok(Math.abs(C.RATES.reduce((a,b)=>a+b,0)-1)<1e-10);
  for(const [roll,id] of [[0,'milo'],[.48,'lark'],[.8,'scarlet'],[.96,'selene'],[.995,'astra']])assert.equal(C.draw(state(),1,(()=>{let i=0;return ()=>i++?0:roll;})()).cards[0].id,id);
});
test('10 / 80 / 200 hard guarantees survive all-common rolls',()=>{
  const s=state(),pulls=[];for(let i=0;i<20;i++)pulls.push(...C.draw(s,10,()=>0).cards);
  assert.equal(pulls[9].id,'scarlet');assert.equal(pulls[79].id,'selene');assert.equal(pulls[159].id,'selene');assert.equal(pulls[199].id,'astra');
  assert.equal(s.tickets,0);assert.equal(s.pulls,200);assert.deepEqual(s.pity,{sr:0,ssr:0,ur:0});
});
test('single pulls and ten-pulls share the same pity counters',()=>{
  const a=state(),b=state();for(let i=0;i<10;i++)C.draw(a,1,()=>0);C.draw(b,10,()=>0);
  assert.deepEqual(a,b);
});
test('natural UR resets every guarantee; failed draws do not mutate saves',()=>{
  const s=state();s.pity={sr:8,ssr:62,ur:199};C.draw(s,1,()=>.999);assert.deepEqual(s.pity,{sr:0,ssr:0,ur:0});
  s.tickets=5;const before=C.clone(s);assert.ok(C.draw(s,10).error);assert.deepEqual(s,before);assert.ok(C.draw(s,-1).error);
});
test('duplicates convert to dust while a first copy unlocks a hero',()=>{
  const s=state();let r=C.draw(s,1,()=>0).cards[0];assert.equal(r.isNew,false);assert.equal(s.dust,308);
  r=C.draw(s,1,(()=>{let i=0;return ()=>i++?0:.999;})()).cards[0];assert.equal(r.isNew,true);assert.equal(s.owned.astra,1);assert.equal(s.dust,308);
});
test('save restores owned cards, levels, team, resources and pity',()=>{
  const s=allHeroes();C.draw(s,10,()=>0);C.upgrade(s,'milo');s.clears=[0];assert.deepEqual(C.restoreState(JSON.parse(JSON.stringify(s))),s);
  const invalid=C.restoreState({...s,tickets:-4,team:['milo','milo','bad'],pity:{sr:99,ssr:-1,ur:300}});
  assert.equal(invalid.tickets,200);assert.deepEqual(invalid.team,['milo']);assert.deepEqual(invalid.pity,{sr:0,ssr:0,ur:0});
});
test('upgrading deducts the advertised cost and increases battle stats',()=>{
  const s=state(),before=C.stats(s,'milo');assert.equal(C.upgrade(s,'milo').level,2);assert.equal(s.dust,240);assert.ok(C.stats(s,'milo').hp>before.hp);
  s.dust=0;assert.ok(C.upgrade(s,'milo').error);assert.equal(s.levels.milo,2);assert.ok(C.upgrade(s,'astra').error);
});
test('teams reject duplicates, unowned characters and more than five slots',()=>{
  const s=state();assert.equal(C.setTeam(s,['astra']),false);assert.equal(C.setTeam(s,['milo','milo']),false);assert.equal(C.setTeam(s,['scarlet','milo']),true);
});
test('actor, AP and target validation never consume a turn on error',()=>{
  const b=C.battle(state(),0),before=C.clone(b);assert.ok(C.action(b,'lark','attack',99).error);assert.deepEqual(b,before);
  C.action(b,'lark','skill',0);assert.equal(b.ap,4);const after=C.clone(b);assert.ok(C.action(b,'lark','attack',0).error);assert.deepEqual(b,after);
});
test('unlike star marks react once and are consumed without the old universal mark bonus',()=>{
 const b=C.battle(state(),0);b.enemies.forEach(e=>e.hp=e.maxHp=2000);
 C.action(b,'lark','skill',0);assert.equal(b.enemies[0].marks[0].phase,'岚');
 const r=C.action(b,'scarlet','skill',0);assert.equal(b.report.combos,1);assert.ok(r.event.combos.includes('燎原'));assert.equal(b.enemies[0].marks.length,0);
});

test('healing targets the lowest percentage living ally and cannot exceed max',()=>{
 const b=C.battle(state(),0);b.allies[1].hp=30;b.allies[2].hp=0;const target=b.allies[1],caster=b.allies.find(a=>a.id==='milo');C.action(b,'milo','skill',0);assert.equal(target.hp,Math.min(target.maxHp,30+Math.round(caster.atk)));assert.equal(b.allies[2].hp,0);
});

test('unused AP caps at two extra next round; guard halves incoming damage',()=>{
  const s=state();s.team=['milo'];const a=C.battle(s,0),b=C.clone(a);C.action(a,'milo','guard',0);C.enemyTurn(a);C.enemyTurn(b);
  assert.equal(a.ap,7);assert.equal(b.ap,7);assert.ok(a.allies[0].hp>b.allies[0].hp);assert.equal(a.allies[0].acted,false);
});
test('owned shields expire after two rounds and never exceed 35 percent maximum health',()=>{
 const b=C.battle(allHeroes(),0);b.enemies.forEach(e=>e.atk=0);C.action(b,'selene','skill',0);const a=b.allies.find(a=>a.shield>0);assert.ok(a);assert.ok(a.shield<=a.maxHp*.35+.5);assert.equal(a.wards[0].source,'selene');C.enemyTurn(b);assert.ok(a.shield>0);C.enemyTurn(b);assert.equal(a.shield,0);
});

test('charged ultimate consumes personal energy and its domain lasts two rounds',()=>{
 const b=C.battle(allHeroes(),0);b.enemies.forEach(e=>e.hp=e.maxHp=3000);const a=b.allies.find(a=>a.id==='astra');assert.ok(C.action(b,'astra','ultimate',0).error);a.energy=3;assert.ok(C.action(b,'astra','ultimate',0).ok);assert.equal(a.energy,0);assert.equal(b.field,2);C.enemyTurn(b);assert.equal(b.field,1);C.enemyTurn(b);assert.equal(b.field,0);
});

test('battle loss awards consolation experience without currency',()=>{
  const s=state();s.team=['milo'];const b=C.battle(s,0);for(let i=0;i<20&&b.phase==='player';i++)C.enemyTurn(b);
  assert.equal(b.phase,'lose');const reward=C.claim(s,b);assert.equal(reward.tickets,0);assert.equal(reward.experience[0].earned,36);assert.equal(s.tickets,200);
});
test('initial three-character team can win chapter one with a simple strategy',()=>{
  const s=state(),b=C.battle(s,0);
  for(let round=0;round<30&&b.phase==='player';round++){
    for(const id of ['lark','scarlet','milo']){
      if(b.phase!=='player')break;const a=b.allies.find(x=>x.id===id),target=b.enemies.find(e=>e.hp>0);if(a.hp<=0)continue;
      const hurt=b.allies.some(x=>x.hp>0&&x.hp<x.maxHp-70);C.action(b,id,id==='milo'&&!hurt?'attack':'skill',target.id);
    }
    if(b.phase==='player')C.enemyTurn(b);
  }
  assert.equal(b.phase,'win');const reward=C.claim(s,b);assert.equal(reward.tickets,10);assert.equal(s.tickets,210);assert.ok(s.clears.includes(0));assert.equal(C.claim(s,b),null);assert.equal(s.tickets,210);assert.ok(!C.battle(s,1).error);
});
test('an upgraded collected team completes the first region and repeat rewards remain one-time',()=>{
 const s=allHeroes();s.team.forEach(id=>s.levels[id]=5);const finish=b=>{for(let i=0;i<2000&&!['win','lose'].includes(b.phase);i++)assert.ok(C.autoStep(b).ok);assert.equal(b.phase,'win');return b;};
 for(let stage=0;stage<3;stage++)assert.ok(C.claim(s,finish(C.battle(s,stage))).first);
 const b=finish(C.battle(s,0)),r=C.claim(s,b);assert.equal(r.tickets,3);assert.equal(r.first,false);assert.equal(C.claim(s,b),null);
});
