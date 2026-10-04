// Rebuild the review-only catalog from the authored text and existing character identities.
const fs=require('node:fs'),path=require('node:path');
const C=require('../../core.js'),S=require('../../story.js'),system=require('./system-draft.cjs');
const rows=fs.readFileSync(path.join(__dirname,'roster-draft.txt'),'utf8').trim().split('\n').map(line=>{
 const fields=line.split('|');if(fields.length!==8)throw Error('Invalid draft row');
 const [id,phase,role,passive,active,ultimate,limit,partners]=fields,h=C.hero(id),f=S.factions.find(f=>f.members.includes(id));
 if(!h||!system.phases.some(p=>p.id===phase)||!partners.split(',').every(p=>C.hero(p)))throw Error('Unknown character or phase: '+id);
 return {id,name:h.name,title:h.title,rarity:h.rarity,story:h.story,quote:h.quote,art:h.art||null,sheet:h.sheet,index:h.index,phase,role,passive,active,ultimate,limit,partners:partners.split(','),faction:f?.name||'现有剧情未明确归属'};
});
if(rows.length!==C.HEROES.length||new Set(rows.map(h=>h.id)).size!==rows.length)throw Error('Incomplete or duplicate character coverage');
const pairKeys=system.reactions.map(r=>r.pair.slice().sort().join(''));
if(pairKeys.length!==15||new Set(pairKeys).size!==15||system.reactions.some(r=>r.pair.length!==2||r.pair[0]===r.pair[1]))throw Error('Invalid reaction matrix');
for(const t of system.teams)if(t.ids.length!==5||new Set(t.ids).size!==5||!t.ids.every(id=>C.hero(id)))throw Error('Invalid team');
const data={system,heroes:rows};fs.writeFileSync(path.join(__dirname,'catalog.json'),JSON.stringify(data,null,2)+'\n');fs.writeFileSync(path.join(__dirname,'catalog.js'),'window.SkillDraft = '+JSON.stringify(data)+';\n');
console.log(`${rows.length} unique character drafts; ${pairKeys.length} reactions; ${system.teams.length} complete teams. Design data only, no battle simulation.`);
