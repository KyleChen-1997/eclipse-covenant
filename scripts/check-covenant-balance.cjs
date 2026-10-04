'use strict';
// Reproducible equipment rolls, eight enemy behaviours, identical investment for each party.
const C=require('../eclipse/core.js');
const parties={
 '提灯接力':['bran','lark','scarlet','flora','milo'],
 '破盾工队':['bront','tam','keres','finch','flora'],
 '暮色织线':['selene','vega','scarlet','nyx','milo'],
 '六翼血契':['ragnar','seraphine','caelum','elysium','milo']
};
const profiles=['assault','shield','burn','buff','healer','summon','seal','charge'];
function prepared(ids,seed){const s=C.freshState();s.clears=Array.from({length:48},(_,i)=>i);s.team=ids;s.dust=1e7;const random=C.Gear.seeded(seed);for(const id of ids){s.owned[id]=1;s.levels[id]=40;s.stars[id]=2;for(const slot of ['weapon','armor','relic']){const g=C.addGear(s,slot+'-ssr',random);for(let n=0;n<5;n++)C.enhanceGear(s,g.uid,n,random);C.equip(s,id,g.uid);}}return s;}
function benchmark(seeds=50){const rows=[];for(const [name,ids] of Object.entries(parties))for(const profile of profiles){const row={name,profile,runs:seeds,wins:0,rounds:0,resonances:0,poise:0,protection:0,healing:0,finite:true};for(let seed=1;seed<=seeds;seed++){const b=C.battle(prepared(ids,seed),20);for(const e of b.enemies){e.profile=profile;e.shield=profile==='shield'?Math.round(e.maxHp*.14):0;e.statuses=[];}let n=0;while(!['win','lose'].includes(b.phase)&&n++<2000){const r=C.autoStep(b);if(r.error)throw Error(r.error);if(b.allies.some(a=>!Number.isFinite(a.hp)||a.hp<0||a.energy<0||a.energy>3||a.shield<0||a.shield>a.maxHp*.35+1)||b.ap<0||b.ap>7)row.finite=false;}if(n>=2000)row.finite=false;row.wins+=b.phase==='win'?1:0;row.rounds+=b.round;row.resonances+=b.report.combos;row.poise+=Object.values(b.report.poise).reduce((n,v)=>n+v,0);row.protection+=b.report.protection;row.healing+=Object.values(b.report.healing).reduce((n,v)=>n+v,0);}row.averageRounds=+(row.rounds/seeds).toFixed(2);rows.push(row);}return {version:15,scenario:'Chapter 7 boss statistics; eight isolated behaviour profiles; level 40, two-star heroes, SSR +5 gear; fixed equipment seeds 1–'+seeds,total:rows.length*seeds,rows};}
module.exports={benchmark,prepared,parties};
if(require.main===module){const report=benchmark();if(process.argv.includes('--write'))require('node:fs').writeFileSync(require('node:path').join(__dirname,'../eclipse/qa/skills-v15/balance-results.json'),JSON.stringify(report,null,2)+'\n');console.table(report.rows.map(r=>({队伍:r.name,敌人:r.profile,胜场:r.wins+'/'+r.runs,平均回合:r.averageRounds,共鸣:r.resonances,保护:r.protection})));if(report.rows.some(r=>!r.finite))process.exitCode=1;}
