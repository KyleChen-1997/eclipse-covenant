const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),draft=require(path.join(root,'eclipse/qa/skills-v15/catalog.json'));
const heroes=Object.fromEntries(draft.heroes.map(h=>[h.id,{phase:h.phase,role:h.role,cost:Number(h.active[0]),passive:h.passive,active:h.active.slice(2),ultimate:h.ultimate,limit:h.limit,partners:h.partners}]));
const data={heroes,phases:draft.system.phases,reactions:draft.system.reactions,glossary:draft.system.glossary};
fs.writeFileSync(path.join(root,'eclipse/covenant-data.js'),`(function(r){const data=${JSON.stringify(data)};if(typeof module!=='undefined'&&module.exports)module.exports=data;else r.EclipseCovenantData=data;})(typeof globalThis!=='undefined'?globalThis:this);\n`);
