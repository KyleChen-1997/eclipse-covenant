(function(root){
 'use strict';
 const AFFIXES=[
  {id:'hp',name:'生命',min:20,max:50},
  {id:'atk',name:'攻击',min:3,max:8},
  {id:'hpPercent',name:'生命提升',min:.01,max:.025,percent:true},
  {id:'atkPercent',name:'攻击提升',min:.01,max:.025,percent:true},
  {id:'power',name:'技能增幅',min:.008,max:.018,percent:true},
  {id:'mitigation',name:'伤害减免',min:.004,max:.012,percent:true}
 ];
 const random01=r=>Math.max(0,Math.min(.999999999,Number(r())||0));
 const round=n=>Math.round(n*10000)/10000;
 function value(def,rank,random){const scale=def.percent?1+rank*.35:rank+1;return def.percent?round((def.min+(def.max-def.min)*random01(random))*scale):Math.round((def.min+(def.max-def.min)*random01(random))*scale);}
 function roll(rank,random=Math.random){
  const pool=[...AFFIXES],count=2+Math.floor(random01(random)*3),out=[];
  for(let i=0;i<count;i++){const def=pool.splice(Math.floor(random01(random)*pool.length),1)[0];out.push({id:def.id,value:value(def,rank,random),rolls:0});}
  return out;
 }
 function seeded(seed){let state=seed>>>0;return ()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};}
 function restore(raw,rank,uid){
  const seen=new Set(),list=[];
  for(const a of Array.isArray(raw)?raw:[]){const d=AFFIXES.find(d=>d.id===a.id);if(!d||seen.has(a.id)||!Number.isFinite(a.value)||a.value<=0)continue;seen.add(a.id);list.push({id:a.id,value:round(Math.min(a.value,d.max*(d.percent?1+rank*.35:rank+1)*21)),rolls:Math.max(0,Math.min(20,Number.isInteger(a.rolls)?a.rolls:0))});if(list.length===4)break;}
  return list.length>=2?list:roll(rank,seeded(uid*31+rank*997));
 }
 function improve(item,rank,random=Math.random){
  const pool=AFFIXES.filter(d=>!item.affixes.some(a=>a.id===d.id));
  if(item.affixes.length<4&&random01(random)<.35){const def=pool[Math.floor(random01(random)*pool.length)],a={id:def.id,value:value(def,rank,random),rolls:0};item.affixes.push(a);return {id:a.id,added:true,delta:a.value};}
  const a=item.affixes[Math.floor(random01(random)*item.affixes.length)],delta=value(AFFIXES.find(d=>d.id===a.id),rank,random);a.value=round(a.value+delta);a.rolls++;return {id:a.id,added:false,delta};
 }
 function bonuses(affixes){return affixes.reduce((b,a)=>(b[a.id]=(b[a.id]||0)+a.value,b),{});}
 function format(a){const d=AFFIXES.find(d=>d.id===a.id);return `${d.name} +${d.percent?Number((a.value*100).toFixed(2))+'%':Math.round(a.value)}`;}
 const api={AFFIXES,MAX_ENHANCE:15,roll,restore,improve,bonuses,format,seeded,random01};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.EclipseGear=api;
})(typeof globalThis!=='undefined'?globalThis:this);
