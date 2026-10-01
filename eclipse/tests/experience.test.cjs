const test=require('node:test');
const assert=require('node:assert/strict');
const C=require('../core.js');
const Player=require('../battle-player.js');
function win(s,stage=0){const b=C.battle(s,stage);new Player({battle:b,step:C.autoStep}).skip();assert.equal(b.phase,'win');return b;}
test('old saves keep levels and add empty experience with sensible audio defaults',()=>{
 const old=C.freshState();delete old.experience;delete old.audio;old.levels.milo=8;
 const s=C.restoreState(old);assert.equal(s.levels.milo,8);assert.deepEqual(s.experience,{});assert.equal(s.audio.volume,65);
});
test('a victory upgrades all deployed members and carries experience to the next level',()=>{
 const s=C.freshState(),b=win(s),r=C.claim(s,b);
 assert.equal(r.experience.length,3);for(const x of r.experience){assert.equal(x.earned,90);assert.equal(x.level,2);assert.equal(x.xp,10);assert.equal(s.levels[x.id],2);}
 assert.equal(C.stats(s,'milo').hp,297);assert.deepEqual(C.restoreState(JSON.parse(JSON.stringify(s))),s);
 const before=C.clone(s);assert.equal(C.claim(s,b),null);assert.deepEqual(s,before);
});
test('battle roster receives XP including defeated members, regardless of later party edits',()=>{
 const s=C.freshState();C.claimExpansion(s);const b=win(s);b.allies[0].hp=0;s.team=['bran','flora'];
 const r=C.claim(s,b);assert.equal(r.experience.find(x=>x.id==='milo').earned,90);assert.equal(s.levels.bran,1);assert.equal(s.levels.flora,1);
});
test('loss gives 40 percent XP once; retreat or unfinished combat gives none',()=>{
 const s=C.freshState(),b=C.battle(s,0),before=C.clone(s);assert.equal(C.claim(s,b),null);assert.deepEqual(s,before);
 b.phase='lose';const r=C.claim(s,b);assert.equal(r.experience[0].earned,36);assert.equal(r.tickets,0);assert.equal(r.dust,0);assert.deepEqual(s.clears,[]);assert.equal(C.claim(s,b),null);
});
test('multi-level gains, level cap, invalid XP and star-dust upgrades remain consistent',()=>{
 const s=C.freshState();let r=C.gainExperience(s,'milo',420);assert.equal(r.level,4);assert.equal(r.xp,60);
 C.upgrade(s,'milo');assert.equal(s.levels.milo,5);assert.equal(s.experience.milo,60);
 r=C.gainExperience(s,'milo',100000);assert.equal(r.level,20);assert.equal(r.xp,0);assert.equal(C.gainExperience(s,'milo',90).earned,0);
 const before=C.clone(s);for(const amount of [-1,NaN,Infinity,2.5])assert.equal(C.gainExperience(s,'milo',amount),null);assert.equal(C.gainExperience(s,'noctis',90),null);assert.deepEqual(s,before);
});
test('save validation rejects corrupt XP and clamps volume independently',()=>{
 const s=C.restoreState({...C.freshState(),experience:{milo:999,lark:-9,scarlet:'20',not_a_hero:4},audio:{volume:200,music:0,musicEnabled:false}});
 assert.equal(s.experience.milo,79);assert.equal(s.experience.lark,undefined);assert.equal(s.experience.scarlet,undefined);assert.equal(s.audio.volume,65);assert.equal(s.audio.music,0);assert.equal(s.audio.musicEnabled,false);
});
