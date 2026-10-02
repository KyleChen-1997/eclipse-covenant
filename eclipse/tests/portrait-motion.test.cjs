const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../core.js'),M=require('../portrait-motion.js');

test('every SSR, UR, SP and SSP portrait has calibrated eyes inside its head region',()=>{
 const heroes=C.HEROES.filter(h=>h.art&&['SSR','UR','SP','SSP'].includes(h.rarity));
 assert.equal(heroes.length,11);
 for(const h of heroes){
  const p=M.profiles[h.id];assert.ok(p,h.id);
  assert.equal(p.eyes.length,2);assert.equal(p.hair.length,2);
  for(const eye of p.eyes){assert.ok(eye.every(Number.isFinite));assert.ok(eye[2]>0&&eye[3]>0);assert.ok(Math.hypot((eye[0]-p.head[0])/p.head[2],(eye[1]-p.head[1])/p.head[3])<.8,h.id);}
 }
});
test('blinks close quickly, reopen gently and never jump at a timing boundary',()=>{
 assert.equal(M.blinkPulse(-.01),0);assert.equal(M.blinkPulse(.075),1);assert.equal(M.blinkPulse(.1),1);assert.equal(M.blinkPulse(.3),0);
 for(const p of Object.values(M.profiles)){
  let last=0,closed=0,starts=0;
  for(let t=0;t<80;t+=.005){const value=M.blinkAt(t,p.seed);assert.ok(value>=0&&value<=1);assert.ok(Math.abs(value-last)<.14);if(value>0&&last===0)starts++;if(value>.5)closed+=.005;last=value;}
  assert.ok(starts>=10&&starts<=20);assert.ok(closed>1&&closed<5);
 }
});
test('idle motion remains bounded and smooth over a long session',()=>{
 for(const p of Object.values(M.profiles)){
  let last=M.sample(p,0);
  for(let t=.02;t<240;t+=.02){const pose=M.sample(p,t);assert.ok(Math.abs(pose.angle)<=.039);assert.ok(Math.abs(pose.lean)<=.0101);assert.ok(Math.abs(pose.wind)<=.0251);for(const key of ['angle','lean','headY','wind','trail','gesture'])assert.ok(Math.abs(pose[key]-last[key])<.003);last=pose;}
 }
});
test('pointer motion is clamped and character timings are independent',()=>{
 const sequences=[];
 for(const p of Object.values(M.profiles)){
  assert.deepEqual(M.sample(p,3,[100,-100]),M.sample(p,3,[1,-1]));
  const pose=M.sample(p,4,[1,-1]);assert.ok(Math.abs(pose.angle)<=.057);assert.ok(Math.abs(pose.headY)<=.0042);
  sequences.push(Array.from({length:100},(_,i)=>M.sample(p,i*.2).blink.toFixed(3)).join(','));
  assert.ok(Array.from({length:30},(_,i)=>M.sample(p,i)).some(s=>Math.abs(s.wind-s.trail)>.001));
 }
 assert.equal(new Set(sequences).size,sequences.length);
});
