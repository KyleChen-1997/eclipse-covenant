const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const C=require('../core.js');
const BattlePlayer=require('../battle-player.js');
function prepared(ids,level=1){const s=C.freshState();ids.forEach(id=>{s.owned[id]=1;s.levels[id]=level;});s.team=ids;s.clears=[0,1];return s;}
function simulate(s,stage=0){const b=C.battle(s,stage);let steps=0;while(!['win','lose'].includes(b.phase)&&steps++<2000){const r=C.autoStep(b);assert.ok(!r.error);b.allies.forEach(a=>{assert.ok(a.hp>=0&&a.hp<=a.maxHp);assert.ok(a.shield>=0);});assert.ok(b.ap>=0&&b.ap<=7);}assert.ok(steps<2000);return b;}
function clockHarness(){let now=0,id=0;const timers=new Map();return {clock:()=>now,setTimer:(fn,delay)=>{timers.set(++id,{at:now+delay,fn});return id;},clearTimer:i=>timers.delete(i),advance(ms){const end=now+ms;for(let n=0;n<10000;n++){const next=[...timers].sort((a,b)=>a[1].at-b[1].at)[0];if(!next||next[1].at>end)break;now=next[1].at;timers.delete(next[0]);next[1].fn();}now=end;},pending:()=>timers.size};}

test('100 distinct heroes with the expanded rarity spread; every hero has illustration and skill',()=>{
  assert.equal(C.HEROES.length,100);assert.equal(new Set(C.HEROES.map(h=>h.id)).size,100);
  assert.deepEqual(C.RANKS.map(r=>C.HEROES.filter(h=>h.rarity===r).length),[23,23,22,21,8,2,1]);
  C.HEROES.forEach(h=>assert.ok((h.sheet||h.art)&&h.kind&&h.skill&&h.power>0&&h.name&&h.title&&h.story&&h.quote));
});
test('each rarity selects every hero of that rarity using an independent uniform choice',()=>{
  for(const [i,r] of C.RANKS.slice(0,5).entries()){const pool=C.HEROES.filter(h=>h.rarity===r);for(let n=0;n<pool.length;n++){
    const first=C.RATES.slice(0,i).reduce((a,b)=>a+b,0)+C.RATES[i]/2;let call=0;
    const s=C.freshState(),card=C.draw(s,1,()=>call++===0?first:(n+.1)/pool.length).cards[0];
    assert.equal(card.id,pool[n].id);
  }}
});
test('every hero has a 3D battle profile and model look configuration',()=>{
  const b3=fs.readFileSync(path.join(__dirname,'../battle3d.js'),'utf8'),hm=fs.readFileSync(path.join(__dirname,'../hero-models.js'),'utf8');
  const prof=b3.slice(b3.indexOf('const profiles={'),b3.indexOf('};',b3.indexOf('const profiles={')));
  const looks=hm.slice(hm.indexOf('HERO_LOOKS'),hm.indexOf('};',hm.indexOf('HERO_LOOKS')));
  for(const h of C.HEROES){assert.ok(new RegExp(`\\b${h.id}:\\[`).test(prof),h.id);assert.ok(new RegExp(`\\b${h.id}:\\{`).test(looks),h.id);}
});
test('old saves preserve progress and the new expansion gift is claimable only once',()=>{
  const old={...C.freshState(),tickets:7,dust:1234,pulls:57,clears:[0],pity:{sr:7,ssr:57,ur:57},levels:{milo:8,lark:3,scarlet:4}};delete old.gifts;
  const s=C.restoreState(old);assert.equal(s.tickets,7);assert.equal(s.levels.milo,8);assert.deepEqual(s.pity,old.pity);assert.deepEqual(s.team,old.team);
  assert.ok(C.claimExpansion(s));assert.equal(s.tickets,57);assert.equal(s.owned.bran,1);assert.equal(s.owned.flora,1);
  assert.equal(C.claimExpansion(s),null);assert.equal(s.tickets,57);assert.equal(C.claimExpansion(C.restoreState(s)),null);
});
test('all new skills resolve valid combat events',()=>{
  for(const h of C.HEROES){const s=prepared([h.id,'milo'].filter((v,i,a)=>a.indexOf(v)===i)),b=C.battle(s,0);b.allies.forEach(a=>a.hp-=100);b.enemies.forEach(e=>e.hp=e.maxHp=2000);const r=C.action(b,h.id,'skill',0);assert.ok(r.ok,h.id);assert.ok(r.event.impacts.length,h.id);assert.equal(r.event.label,h.skill);}
});
test('freeze skips an enemy action and expires without dealing phantom damage',()=>{
  const b=C.battle(prepared(['nix']),0);C.action(b,'nix','skill',0);const before=b.allies[0].hp;
  C.enemyStep(b);assert.equal(b.allies[0].hp,before);assert.equal(b.enemies[0].frozen,0);
  C.enemyStep(b);assert.ok(b.allies[0].hp<before);
});
test('life drain heals from actual inflicted damage, not overkill',()=>{
  const b=C.battle(prepared(['vesper']),0);b.allies[0].hp=100;b.enemies[0].hp=20;C.action(b,'vesper','skill',0);assert.equal(b.allies[0].hp,110);
});
test('new UR abilities are once per hero per battle, not mutually exclusive',()=>{
  const b=C.battle(prepared(['aurelia','noctis']),0);b.enemies.forEach(e=>e.hp=e.maxHp=3000);C.action(b,'aurelia','skill',0);C.enemyTurn(b);assert.ok(C.action(b,'aurelia','skill').error);assert.ok(C.action(b,'noctis','skill').ok);assert.ok(b.enemies.every(e=>e.frozen===1));
});
test('auto AI heals urgent allies and never spends more AP than it owns',()=>{
  const b=C.battle(prepared(['milo','scarlet','lark']),0);b.allies[1].hp=50;const choice=C.autoChoice(b);assert.equal(choice.actorId,'milo');assert.equal(choice.type,'skill');
  b.ap=0;assert.equal(C.autoChoice(b).type,'guard');
});
test('default team automatically wins first chapter without user actions',()=>{
  assert.equal(simulate(C.freshState()).phase,'win');
});
test('every rarity has viable automatic teams and mixed upgraded teams finish all stages',()=>{
  const chunks=ids=>{const n=Math.max(1,Math.ceil(ids.length/5)),size=Math.ceil(ids.length/n),out=[];for(let i=0;i<ids.length;i+=size)out.push(ids.slice(i,i+size));return out;};
  for(const rarity of C.RANKS)for(const team of chunks(C.HEROES.filter(h=>h.rarity===rarity).map(h=>h.id))){const b=simulate(prepared(team,3));assert.equal(b.phase,'win',rarity+' '+team.join(','));}
  for(let stage=0;stage<3;stage++){const b=simulate(prepared(['orion','vesper','flora','nix','noctis'],5),stage);assert.equal(b.phase,'win','stage '+stage);}
});
test('automatic battle always terminates including low damage solo healers',()=>{
  for(const h of C.HEROES)assert.ok(['win','lose'].includes(simulate(prepared([h.id]),2).phase));
});
test('recommendation includes available tank/healer and respects ownership',()=>{
  const s=prepared(C.HEROES.map(h=>h.id)),team=C.recommendTeam(s);assert.equal(team.length,5);assert.equal(new Set(team).size,5);assert.ok(team.some(id=>['heal','healAll','tide','renew'].includes(C.hero(id).kind)));assert.ok(['shieldAll','shieldOne','storm'].includes(C.hero(team[0]).kind));
});
test('pause freezes battle time, changing speed adjusts one clock, stop cancels callbacks',()=>{
  const clock=clockHarness(),b=C.battle(C.freshState(),0);let steps=0;const p=new BattlePlayer({battle:b,step:C.autoStep,onStep:()=>steps++,...clock});p.start();clock.advance(349);assert.equal(steps,0);p.setPaused(true);clock.advance(5000);assert.equal(steps,0);p.setPaused(false);clock.advance(1);assert.equal(steps,1);
  p.setSpeed(4);clock.advance(200);assert.equal(steps,1);clock.advance(100);assert.ok(steps>1);p.stop();const before=steps;clock.advance(100000);assert.equal(steps,before);assert.equal(clock.pending(),0);
});
test('leaving the battle page pauses it without overriding manual pause',()=>{
  const clock=clockHarness(),b=C.battle(C.freshState(),0);let steps=0;const p=new BattlePlayer({battle:b,step:C.autoStep,onStep:()=>steps++,...clock});p.start();p.setBlocked(true);clock.advance(5000);assert.equal(steps,0);p.setPaused(true);p.setBlocked(false);clock.advance(5000);assert.equal(steps,0);p.setPaused(false);clock.advance(400);assert.equal(steps,1);p.stop();
});
test('skip and normal playback reach identical outcome and only issue reward once',()=>{
  const initial=C.freshState(),a=C.battle(initial,0),b=C.clone(a),c1=clockHarness(),c2=clockHarness();let finish1=0,finish2=0;
  const p1=new BattlePlayer({battle:a,step:C.autoStep,onFinish:()=>finish1++,...c1}),p2=new BattlePlayer({battle:b,step:C.autoStep,onFinish:()=>finish2++,...c2});
  p1.start();c1.advance(200000);p2.start();c2.advance(1500);p2.setPaused(true);p2.skip();p2.skip();c2.advance(200000);
  assert.equal(finish1,1);assert.equal(finish2,1);assert.deepEqual(b,a);assert.equal(C.claim(initial,b).tickets,10);assert.equal(C.claim(initial,b),null);
});
