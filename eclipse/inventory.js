(function(root){
  'use strict';
  const P=typeof module!=='undefined'&&module.exports?require('./progression.js'):root.EclipseProgression;
  const G=typeof module!=='undefined'&&module.exports?require('./gear-system.js'):root.EclipseGear;
  const ranks=['N','R','SR','SSR','UR','SP','SSP'],defs=new Map(P.EQUIPMENT.map(g=>[g.id,g]));
  // Version 1 ranges preserve a random seed and permanent IDs. Opening a piece
  // reconstructs its original affixes; it never rerolls them or expands the range.
  function mix(n){n=Math.imul(n^(n>>>16),0x21f0aaad);n=Math.imul(n^(n>>>15),0x735a2d97);return (n^(n>>>15))>>>0;}
  function piece(b,uid){const seed=mix(b.seed^mix(uid>>>0)^mix(Math.floor(uid/4294967296)));return {uid,template:b.template,affixes:G.roll(ranks.indexOf(defs.get(b.template).rarity),G.seeded(seed))};}
  const contains=(b,uid)=>uid>=b.start&&uid<b.start+b.count;
  function get(s,uid){if(!Number.isSafeInteger(uid)||uid<1)return null;const item=s.gear.find(g=>g.uid===uid);if(item)return item;const b=(s.gearBatches||[]).find(b=>contains(b,uid));return b?piece(b,uid):null;}
  function remove(s,uid){if(!Number.isSafeInteger(uid)||uid<1)return false;const i=s.gear.findIndex(g=>g.uid===uid);if(i>=0){s.gear.splice(i,1);return true;}const batches=s.gearBatches||[],j=batches.findIndex(b=>contains(b,uid));if(j<0)return false;const b=batches[j],parts=[];if(uid>b.start)parts.push({...b,count:uid-b.start});if(uid<b.start+b.count-1)parts.push({...b,start:uid+1,count:b.start+b.count-uid-1});batches.splice(j,1,...parts);return true;}
  function materialize(s,uid){const existing=s.gear.find(g=>g.uid===uid);if(existing)return existing;const item=get(s,uid);if(item){remove(s,uid);s.gear.push(item);}return item;}
  function matches(template,filter){const d=defs.get(template);return (!filter.template||filter.template===template)&&(!filter.rarity||filter.rarity==='ALL'||d.rarity===filter.rarity)&&(!filter.slot||filter.slot==='ALL'||d.slot===filter.slot);}
  function count(s,filter={}){return s.gear.reduce((n,g)=>n+Number(matches(g.template,filter)),0)+(s.gearBatches||[]).reduce((n,b)=>n+(matches(b.template,filter)?b.count:0),0);}
  function page(s,{offset=0,limit=48,...filter}={}){
    const segments=[...s.gear.filter(g=>matches(g.template,filter)).map(g=>({item:g,template:g.template,start:g.uid,count:1})),...(s.gearBatches||[]).filter(b=>matches(b.template,filter))];
    segments.sort((a,b)=>ranks.indexOf(defs.get(b.template).rarity)-ranks.indexOf(defs.get(a.template).rarity)||(b.item?.stars||0)-(a.item?.stars||0)||(b.start+b.count)-(a.start+a.count));
    const total=segments.reduce((n,b)=>n+b.count,0),items=[];let skip=Math.max(0,offset);
    for(const b of segments){if(skip>=b.count){skip-=b.count;continue;}for(let i=skip;i<b.count&&items.length<limit;i++)items.push(b.item||piece(b,b.start+b.count-1-i));skip=0;if(items.length>=limit)break;}
    return {items,total};
  }
  function materials(s,item,owner,limit=40){
    const explicit=s.gear.filter(g=>g.uid!==item.uid&&g.template===item.template&&!g.stars&&!g.enhance&&!owner(s,g.uid));
    const blocks=(s.gearBatches||[]).filter(b=>b.template===item.template);
    const total=explicit.length+blocks.reduce((n,b)=>n+b.count-Number(contains(b,item.uid)),0),ids=explicit.slice(0,limit).map(g=>g.uid);
    for(const b of blocks){for(let uid=b.start;uid<b.start+b.count&&ids.length<limit;uid++)if(uid!==item.uid)ids.push(uid);if(ids.length>=limit)break;}
    return {ids,total};
  }
  function restore(raw,gear){
    if(!Array.isArray(raw))return [];
    const out=[],uids=gear.map(g=>g.uid).sort((a,b)=>a-b);let end=0,index=0;
    for(const b of [...raw].filter(Boolean).sort((a,b)=>a.start-b.start)){
      if(b.version!==1||!defs.has(b.template)||!Number.isSafeInteger(b.start)||b.start<1||!Number.isSafeInteger(b.count)||b.count<1||!Number.isSafeInteger(b.start+b.count)||!Number.isInteger(b.seed)||b.seed<0||b.seed>4294967295||b.start<end)continue;
      while(index<uids.length&&uids[index]<b.start)index++;
      if(index<uids.length&&uids[index]<b.start+b.count)continue;
      out.push({version:1,start:b.start,count:b.count,template:b.template,seed:b.seed});end=b.start+b.count;
    }
    return out;
  }
  const api={get,remove,materialize,count,page,materials,restore,piece};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.EclipseInventory=api;
})(typeof globalThis!=='undefined'?globalThis:this);
