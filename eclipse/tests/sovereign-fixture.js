(()=>{
 const C=EclipseCore,tier=parent.fixtureTier,stage=tier==='ssp'?7:6,gate=C.DUNGEONS[stage].gate,s=C.freshState();
 s.clears=Array.from({length:48},(_,i)=>i);s.dungeonClears=Array.from({length:stage},(_,i)=>i);s.dust=10000000;s.team=['astra','aurelia','noctis','caelum','elysium'];
 for(const id of s.team){s.owned[id]=4;s.levels[id]=gate.level;s.stars[id]=gate.level===70?5:4;for(const slot of Object.keys(C.SLOT_NAMES)){const g=C.addGear(s,slot+'-'+C.GEAR_RANKS[gate.gearRank].toLowerCase(),C.Gear.seeded(s.nextGearId));g.stars=gate.stars;for(let level=0;level<gate.enhance;level++)C.enhanceGear(s,g.uid,level,C.Gear.seeded(g.uid*37+level));C.equip(s,id,g.uid);}}
 let saved=JSON.stringify(s);Storage.prototype.getItem=function(){return saved;};Storage.prototype.setItem=function(k,value){saved=value;const v=JSON.parse(saved);parent.postMessage({fixtureReport:`${tier.toUpperCase()} 隔离存档 · 装备 ${C.Inventory.count(v)} · SP ${C.Inventory.count(v,{rarity:'SP'})} · SSP ${C.Inventory.count(v,{rarity:'SSP'})} · 已通秘境 ${v.dungeonClears.length}`},'*');};
 const claim=C.claim;C.claim=(state,b)=>claim(state,b,()=>.9999999);
})();
