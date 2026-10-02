const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const C=require('../core.js'),{Sequence,styleOf,markup}=require('../summon-cinematic.js');
const rollFor=Object.fromEntries(C.SECRET_IDS.map((id,i)=>[id,(C.SUMMON_WEIGHTS.slice(0,i+5).reduce((a,b)=>a+b,0)+.5)/100000]));
function drawHero(s,id){let call=0;return C.draw(s,1,()=>call++%2===0?rollFor[id]:0).cards[0];}
function timers(){let now=0,next=0;const jobs=new Map();return {schedule(fn,ms){jobs.set(++next,{at:now+ms,fn});return next;},cancel(id){jobs.delete(id);},advance(ms){const end=now+ms;while(true){const job=[...jobs].sort((a,b)=>a[1].at-b[1].at)[0];if(!job||job[1].at>end)break;now=job[1].at;jobs.delete(job[0]);job[1].fn();}now=end;},size:()=>jobs.size};}
test('all 100000 natural lottery slots have the exact advertised weights, including separate SP and SSP identities',()=>{
 const counts=Object.fromEntries([...C.RANKS.slice(0,5),...C.SECRET_IDS].map(id=>[id,0]));
 for(let i=0;i<100000;i++){const r=C.rollSummon((i+.5)/100000);counts[r.id||C.RANKS[r.rank]]++;if(r.id)assert.equal(C.hero(r.id).rarity,C.RANKS[r.rank]);}
 assert.deepEqual(counts,{N:47926,R:32000,SR:16000,SSR:3500,UR:500,...Object.fromEntries(C.SP_IDS.map(id=>[id,10])),...Object.fromEntries(C.SSP_IDS.map(id=>[id,1]))});
 assert.equal(C.SUMMON_WEIGHTS.reduce((a,b)=>a+b,0),100000);
});
test('SP boundaries do not round a tenth-of-a-basis-point chance away',()=>{
 let start=0;for(let i=0;i<C.SUMMON_WEIGHTS.length;i++){const id=C.SECRET_IDS[i-5]||null,rank=id?C.rankOf(C.hero(id)):i;for(const ticket of [start+.1,start+C.SUMMON_WEIGHTS[i]-.1])assert.deepEqual(C.rollSummon(ticket/100000),{rank,id});start+=C.SUMMON_WEIGHTS[i];}assert.equal(C.rollSummon(1).id,'nullion');
});
test('natural SP survives every pity threshold, resets all counters and reveals only the obtained hero',()=>{
 for(const id of C.SECRET_IDS){const s=C.freshState();s.pity={sr:9,ssr:79,ur:199};assert.ok(C.SECRET_IDS.every(x=>C.sealed(s,C.hero(x))));const r=drawHero(s,id);assert.equal(r.id,id);assert.equal(r.guarantee,'');assert.equal(s.tickets,199);assert.deepEqual(s.pity,{sr:0,ssr:0,ur:0});assert.equal(C.sealed(s,C.hero(id)),false);assert.ok(C.SECRET_IDS.filter(x=>x!==id).every(x=>C.sealed(s,C.hero(x))));}
});
test('single pulls and ten pulls consume identical random streams and yield identical committed state',()=>{
 const values=[.2,0,.999995,0,.8,.7,.999795,0,.4,.6,.999895,0,.999,0,.9,.6,.99,.1,.1,0];
 const a=C.freshState(),b=C.clone(a);a.pity=b.pity={sr:8,ssr:78,ur:198};b.pity={...a.pity};let i=0,j=0;
 const multi=C.draw(a,10,()=>values[i++]).cards,singles=Array.from({length:10},()=>C.draw(b,1,()=>values[j++]).cards[0]);
 assert.deepEqual(multi,singles);assert.deepEqual(a,b);assert.equal(i,20);assert.equal(j,20);
});
test('SP duplicate dust, discovery, leveling, ascension and equipped items persist through old save format',()=>{
 for(const id of C.SECRET_IDS){const s=C.freshState();drawHero(s,id);assert.equal(drawHero(s,id).dust,600);s.levels[id]=20;C.setTeam(s,[id]);const g=C.addGear(s,'weapon-n');assert.ok(!C.equip(s,id,g.uid).error);assert.equal(C.ascend(s,id).stars,1);assert.equal(s.owned[id],1);const restored=C.restoreState(JSON.parse(JSON.stringify(s)));assert.deepEqual(restored,s);assert.equal(C.sealed(restored,C.hero(id)),false);assert.equal(C.levelCap(restored,id),30);}
});
test('each SP ultimate has its distinct battle effect and is limited to one cast',()=>{
 for(const id of C.SECRET_IDS){const s=C.freshState();s.owned[id]=1;s.levels[id]=1;s.team=[id,'milo'];const b=C.battle(s,0);b.enemies.forEach(e=>e.hp=e.maxHp=2000);b.allies.forEach(a=>a.hp-=150);const r=C.action(b,id,'skill',0);assert.ok(r.ok);assert.equal(r.event.rarity,C.hero(id).rarity);assert.equal(r.event.ultimate,true);assert.ok(b.enemies.every(e=>e.hp===2000-C.hero(id).power));if(id==='seraphine')assert.ok(b.enemies.every(e=>e.burn===2&&e.burnPower===55));if(id==='ragnar')assert.ok(b.allies.every(a=>a.shield===120));if(id==='elysium')assert.ok(b.allies.every(a=>a.shield===100&&a.hp===a.maxHp-30));b.allies[0].acted=false;b.ap=7;assert.ok(C.action(b,id,'skill',0).error);}
});
test('every SP has its own illustration, known 3D rig and a style above UR',()=>{
 const manifest={assets:[...require('../assets/visual/manifest-sp-v7.json').assets,...require('../assets/portraits/manifest-v12.json').assets.map(a=>({...a,path:a.path.replace(/^eclipse\//,'')}))]},crypto=require('node:crypto');const code=fs.readFileSync(path.join(__dirname,'../battle3d.js'),'utf8');
 for(const h of C.HEROES.filter(x=>C.rankOf(x)>=5)){const asset=manifest.assets.find(a=>a.path===`assets/heroes/${h.art}.png`);assert.ok(asset);const bytes=fs.readFileSync(path.join(__dirname,'../',asset.path));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),asset.sha256);assert.ok(C.rankOf(h)>C.rankOf(C.hero('astra')));const rig=code.match(new RegExp(h.id+":\\['([^']+)'"))?.[1];assert.ok(rig);assert.ok(fs.existsSync(path.join(__dirname,'../assets/models',rig+'.glb')));}
 assert.equal(styleOf(C.hero('astra')),'mythic');assert.equal(styleOf(C.hero('seraphine')),'crimson');assert.equal(styleOf(C.hero('elysium')),'prism');
});
test('cinematic queue plays UR and all SP in original pull order and completes once',()=>{
 const t=timers(),seen=[],reveals=[];let done=0;const ids=['milo','astra','seraphine','lark','ragnar','elysium'];const q=new Sequence(ids.map(C.hero),{...t,onShow:h=>seen.push(h.id),onReveal:h=>reveals.push(h.id),onDone:()=>done++});q.start();q.start();t.advance(30000);assert.deepEqual(seen,['astra','seraphine','ragnar','elysium']);assert.deepEqual(reveals,seen);assert.equal(done,1);assert.equal(t.size(),0);q.finish();q.advance();assert.equal(done,1);
});
test('skip and close cancel every stale callback without repeating saved rewards',()=>{
 for(const method of ['finish','dispose']){const s=C.freshState(),cards=C.SECRET_IDS.map(id=>drawHero(s,id)),saved=C.clone(s),t=timers();let done=0,reveals=0;const q=new Sequence(cards.map(r=>C.hero(r.id)),{...t,onReveal:()=>reveals++,onDone:()=>done++});q.start();q[method]();q[method]();t.advance(30000);assert.equal(reveals,0);assert.equal(done,method==='finish'?1:0);assert.equal(t.size(),0);assert.deepEqual(s,saved);}
});
test('next cancels the current reveal; reduced motion reveals immediately and completes',()=>{
 const t=timers(),revealed=[];let done=0;const q=new Sequence(['seraphine','ragnar','elysium'].map(C.hero),{...t,reducedMotion:true,onReveal:h=>revealed.push(h.id),onDone:()=>done++});q.start();q.advance();t.advance(0);assert.deepEqual(revealed,['ragnar']);t.advance(10000);assert.deepEqual(revealed,['ragnar','elysium']);assert.equal(done,1);assert.equal(t.size(),0);
});
test('default browser timers are called with the browser receiver, and skipping clears both',()=>{
 const vm=require('node:vm');let next=0;const jobs=new Map();const context=vm.createContext({});
 vm.runInContext('globalThis.timerRealm = this',context);
 context.setTimeout=function(fn){'use strict';assert.ok(this==null||this===context||this===context.timerRealm);jobs.set(++next,fn);return next;};
 context.clearTimeout=function(id){'use strict';assert.ok(this==null||this===context||this===context.timerRealm);jobs.delete(id);};
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../summon-cinematic.js'),'utf8'),context);let done=0;const q=new context.EclipseSummon.Sequence([C.hero('astra')],{onDone:()=>done++});q.start();assert.equal(jobs.size,2);q.finish();assert.equal(jobs.size,0);assert.equal(done,1);
});

test('SSP is a separate highest rarity with its own exact rate and prismatic reveal',()=>{
 assert.deepEqual(C.RANKS,['N','R','SR','SSR','UR','SP','SSP']);
 assert.equal(C.SP_IDS.length,7);assert.equal(C.SSP_IDS.length,4);
 assert.equal(C.RATES[C.RANKS.indexOf('SP')],.0007);assert.equal(C.RATES[C.RANKS.indexOf('SSP')],.00004);
 const h=C.hero('elysium');assert.equal(h.rarity,'SSP');assert.ok(C.rankOf(h)>C.rankOf(C.hero('ragnar')));
 const html=markup(h,0,1);assert.match(html,/IRIDESCENT ORIGIN · SSP/);assert.match(html,/cinema-rarity">SSP</);assert.match(html,/data-living="SSP"/);assert.equal(styleOf(h),'prism');
});
test('an existing prismatic character keeps inventory, growth, gear and history after the SSP correction',()=>{
 const old=C.freshState();old.owned.elysium=3;old.levels.elysium=37;old.stars.elysium=2;old.experience.elysium=345;old.team=['elysium'];old.history=[{id:'elysium',pull:17,guarantee:''}];old.pulls=17;
 const item=C.addGear(old,'weapon-ur');C.equip(old,'elysium',item.uid);
 const restored=C.restoreState(C.clone(old));assert.deepEqual(restored,old);assert.equal(C.sealed(restored,C.hero('elysium')),false);assert.equal(drawHero(restored,'elysium').dust,600);assert.equal(restored.owned.elysium,4);assert.ok(Number.isFinite(restored.dust));
});
