const test=require('node:test'),assert=require('node:assert/strict'),C=require('../core.js');
test('dawn gift supports old saves and grants forging funds only once',()=>{
 const s=C.freshState();assert.ok(C.claimDawn(s));assert.equal(s.tickets,250);assert.equal(s.owned.tessa,1);assert.equal(s.owned.rune,1);assert.equal(s.gear.length,0);assert.equal(s.dust,1200);const before=C.clone(s);assert.equal(C.claimDawn(s),null);assert.deepEqual(s,before);assert.deepEqual(C.restoreState(s),s);assert.equal(C.claimDawn(C.restoreState(s)),null);
});
test('gear ascends through five stars, preserves ownership and reloads without losing progression',()=>{
 let s=C.freshState();s.dust=100000;const item=C.addGear(s,'dragon-spear-ur');C.equip(s,'scarlet',item.uid);const snapshot=C.battle(s,0),oldAttack=snapshot.allies.find(h=>h.id==='scarlet').atk;
 for(let star=0;star<5;star++){const mat=C.addGear(s,item.template),beforeDust=s.dust,nextId=s.nextGearId;const r=C.ascendGear(s,item.uid,mat.uid,star);assert.equal(r.stars,star+1);assert.equal(beforeDust-s.dust,480*(star+1));assert.equal(s.gear.length,1);assert.equal(s.nextGearId,nextId);assert.equal(C.gearOwner(s,item.uid),'scarlet');assert.equal(C.gearStats(s.gear[0]).atk,Math.round(132*(1+.25*(star+1))));assert.ok(C.stats(s,'scarlet').bonus.atk>=C.gearStats(s.gear[0]).atk);assert.equal(C.gearStats(s.gear[0]).power,Math.round(.1*(1+.25*(star+1))*10000)/10000);s=C.restoreState(C.clone(s));assert.equal(s.gear[0].stars,star+1);}
 const before=C.clone(s);assert.ok(C.ascendGear(s,item.uid,999,5).error);assert.deepEqual(s,before);assert.equal(snapshot.allies.find(h=>h.id==='scarlet').atk,oldAttack);assert.equal(C.battle(s,0).allies.find(h=>h.id==='scarlet').atk,C.stats(s,'scarlet').atk);
});
test('gear material validation protects target, worn items and previously upgraded items atomically',()=>{
 const s=C.freshState(),target=C.addGear(s,'weapon-n'),wrong=C.addGear(s,'armor-n'),worn=C.addGear(s,'weapon-n'),upgraded=C.addGear(s,'weapon-n'),good=C.addGear(s,'weapon-n');C.equip(s,'milo',worn.uid);upgraded.stars=1;
 for(const uid of [target.uid,wrong.uid,worn.uid,upgraded.uid,0,999,undefined]){const before=C.clone(s);assert.ok(C.ascendGear(s,target.uid,uid,0).error);assert.deepEqual(s,before);}
 s.dust=29;let before=C.clone(s);assert.ok(C.ascendGear(s,target.uid,good.uid,0).error);assert.deepEqual(s,before);s.dust=100;assert.ok(!C.ascendGear(s,target.uid,good.uid,0).error);const another=C.addGear(s,'weapon-n');before=C.clone(s);assert.ok(C.ascendGear(s,target.uid,another.uid,0).error);assert.deepEqual(s,before);assert.ok(C.ascendGear(s,999,another.uid).error);
});
test('legacy gear defaults to zero and invalid star values cannot increase restored power',()=>{
 const s=C.freshState();for(const stars of [undefined,-1,6,1.5,'3',NaN,Infinity,3]){const g=C.addGear(s,'weapon-sr');g.stars=stars;}const restored=C.restoreState(C.clone(s));assert.deepEqual(restored.gear.map(g=>g.stars||0),[0,0,0,0,0,0,0,3]);assert.deepEqual(C.restoreState(restored),restored);
});
test('all 25 legacy equipment templates remain reachable through unchanged uniform rarity-pool sampling',()=>{
 assert.equal(C.EQUIPMENT.filter(g=>C.GEAR_RANKS.indexOf(g.rarity)<5).length,25);assert.equal(new Set(C.EQUIPMENT.map(g=>g.id)).size,C.EQUIPMENT.length);
 for(let rank=0;rank<5;rank++){const pool=C.EQUIPMENT.filter(g=>g.rarity===C.RANKS[rank]);assert.equal(pool.length,5);const region=rank<3?0:5,rates=C.DROP_RATES[region],rarityRoll=rates.slice(0,rank).reduce((a,b)=>a+b,0)+rates[rank]/2;for(let i=0;i<5;i++){const s=C.freshState();s.clears=Array.from({length:48},(_,n)=>n);s.dungeonClears=[region];let calls=0;const r=C.sweep(s,region,1,()=>calls++===0?rarityRoll:calls===2?(i+.5)/pool.length:.5,'dungeon');assert.equal(r.gear[0].template,pool[i].id);assert.equal(r.gear[0].affixes.length,3);}}
});
test('Eirene actively treats one living patient while Caelum grants a preventive ward',()=>{
 for(const id of ['eirene','caelum']){const s=C.freshState();s.owned[id]=1;s.levels[id]=1;s.team=[id,'milo','lark'];const b=C.battle(s,0);b.allies[1].hp=20;b.allies[2].hp=0;const r=C.action(b,id,'skill',0);assert.ok(r.ok);assert.equal(b.allies[2].hp,0);if(id==='eirene')assert.ok(b.allies[1].hp>20);else assert.ok(b.allies[1].statuses.some(x=>x.key==='reduce'&&x.value===.3));}
});

test('new chapters remain winnable at recommended level and gear stars using accessible N/R/SR heroes',()=>{
 for(let stage=12;stage<18;stage++){const st=C.STAGES[stage],s=C.freshState();s.team=['bran','scarlet','flora','quill','nix'];s.clears=Array.from({length:stage},(_,i)=>i);for(const id of s.team){s.owned[id]=1;s.levels[id]=st.level;s.stars[id]=5;for(const slot of ['weapon','armor','relic']){const g=C.addGear(s,slot+'-ur');g.stars=[1,2,2,3,4,5][stage-12];C.equip(s,id,g.uid);}}const b=C.battle(s,stage);let steps=0;while(!['win','lose'].includes(b.phase)&&steps++<2000)C.autoStep(b);assert.ok(steps<2000);assert.equal(b.phase,'win',st.name);const r=C.claim(s,b);assert.deepEqual(r.gear,[]);const repeated=C.sweep(s,stage,10,()=>.99);assert.equal(repeated.count,10);assert.equal(repeated.gear.length,0);assert.equal(repeated.dust,10*st.repeatDust);}
});
