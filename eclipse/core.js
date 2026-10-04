(function (root) {
  'use strict';
  const HEROES = [
    { id: 'milo', rarity: 'N', index: 0, name: '米洛', title: '提灯人', english: 'MILO', role: '治愈 · 支援', hp: 280, atk: 44, cost: 1, skill: '归途微光', detail: '为生命比例最低的存活队友恢复 110 点生命。', quote: '只要灯还亮着，就有人能回家。', story: '他走过沉没的街区，提灯里守着故乡最后一簇火种。每一位迷失的人，都是他不肯熄灯的理由。' },
    { id: 'lark', rarity: 'R', index: 1, name: '岚雀', title: '风邮使', english: 'LARK', role: '标记 · 协击', hp: 300, atk: 55, cost: 1, skill: '风信标记', detail: '造成 40 点伤害并标记目标，使下一次攻击伤害提高 25%。', quote: '没有送不到的信，只有不肯出发的人。', story: '她与机械信鸟穿梭在浮空岛之间。信袋中有一封寄给未来的信，至今没有收件人的名字。' },
    { id: 'scarlet', rarity: 'SR', index: 2, name: '绯织', title: '赤焰裁缝', english: 'SCARLET', role: '灼烧 · 输出', hp: 320, atk: 72, cost: 2, skill: '焚线裁决', detail: '造成 110 点伤害，附加两次 35 点灼烧。', quote: '命运的线，剪断就好了。', story: '裁缝的剪刀曾只修补衣裳。如今她用燃烧的丝线，为破碎的世界缝出新的命运。' },
    { id: 'selene', rarity: 'SSR', index: 3, name: '塞勒涅', title: '月棺骑士', english: 'SELENE', role: '护盾 · 反击', hp: 410, atk: 68, cost: 2, skill: '月棺结界', detail: '为全体存活队友赋予 80 点护盾；持续两个敌方回合。护盾被击破时反击 50 点，每回合最多一次。', quote: '我守护的，是尚未熄灭的明天。', story: '月光教堂最后的骑士，以巨盾封存旧日的誓言。灵蝶停靠之处，便是她守护的疆界。' },
    { id: 'astra', rarity: 'UR', index: 4, name: '阿斯忒拉', title: '终焉星神', english: 'ASTRA', role: '领域 · 爆发', hp: 350, atk: 90, cost: 4, skill: '终焉展开', detail: '对全体敌人造成 150 点伤害，开启两回合星蚀领域：每位队友每回合首次攻击附加 25 点伤害。每场限一次。', quote: '群星熄灭之后，我仍记得你的名字。', story: '在永恒日蚀的中心，祂托起一颗沉睡的太阳。世界称祂为终焉，你却看见了开始。' }
  ];
  const extras = typeof module !== 'undefined' && module.exports ? require('./roster.js') : root.EclipseRoster;
  const originalKinds = [['heal',110,'heal','#9bddae'],['mark',40,'arrow','#98ded2'],['burn',110,'fire','#ff987d'],['shieldAll',80,'shield','#a5cfff'],['astral',150,'astral','#d4acff']];
  HEROES.forEach((h,i)=>Object.assign(h,{kind:originalKinds[i][0],power:originalKinds[i][1],fx:originalKinds[i][2],color:originalKinds[i][3],sheet:'original',ultimate:i===4}));
  HEROES.push(...extras);
  const portraitVideos=typeof module!=='undefined'&&module.exports?require('./portrait-videos.js'):root.EclipsePortraitVideos;
  HEROES.forEach(h=>{if(portraitVideos?.[h.id]&&['UR','SP','SSP'].includes(h.rarity))h.video=portraitVideos[h.id];});
  const portraitV6 = new Set(['astra','aurelia','noctis','selene','vesper','orion']);
  HEROES.forEach(h => { if (portraitV6.has(h.id)) h.art = h.id + '-v6'; });
  const GEAR_RANKS = ['N', 'R', 'SR', 'SSR', 'UR', 'SP', 'SSP'];
  const RANKS = [...GEAR_RANKS];
  const RATES = [0.47926, 0.32, 0.16, 0.035, 0.005, 0.0007, 0.00004];
  // One integer ticket per 1/100,000 keeps both SP and SSP odds exact.
  const SUMMON_WEIGHTS = [47926,32000,16000,3500,500,10,10,10,10,10,10,10,1,1,1,1];
  const SP_IDS = HEROES.filter(h=>h.rarity==='SP').map(h=>h.id);
  const SSP_IDS = HEROES.filter(h=>h.rarity==='SSP').map(h=>h.id);
  const SECRET_IDS = [...SP_IDS, ...SSP_IDS];
  const rankOf = h => RANKS.indexOf(h.rarity);
  const sealed = (s,h) => rankOf(h)>=5&&!s.owned[h.id];
  function rollSummon(randomValue) {
    const ticket=Math.floor(Math.max(0,Math.min(0.999999999,Number(randomValue)||0))*100000);
    let ceiling=0;
    for(let i=0;i<SUMMON_WEIGHTS.length;i++){
      ceiling+=SUMMON_WEIGHTS[i];
      if(ticket<ceiling){const id=SECRET_IDS[i-5]||null;return {rank:id?rankOf(HEROES.find(h=>h.id===id)):i,id};}
    }
  }
  const P=typeof module!=='undefined'&&module.exports?require('./progression.js'):root.EclipseProgression;
  const {STAGES,REGIONS,EQUIPMENT,SLOT_NAMES,DROP_RATES,DUNGEONS}=P;
  const Story=typeof module!=='undefined'&&module.exports?require('./story.js'):root.EclipseStory;
  if(Story){STAGES.forEach((s,i)=>{s.desc=Story.scenes[i].before;s.subtitle=Story.scenes[i].title;});REGIONS.forEach((r,i)=>r.desc=Story.chapters[i][2]);STAGES[47].enemies[STAGES[47].enemies.length-1].name='旧契执行体';}
  const G=typeof module!=='undefined'&&module.exports?require('./gear-system.js'):root.EclipseGear;
  const Inventory=typeof module!=='undefined'&&module.exports?require('./inventory.js'):root.EclipseInventory;
  const MAX_SUMMON_COUNT=10000;
  const battleStage=b=>b.mode==='dungeon'?DUNGEONS[b.stage]:STAGES[b.stage];
  const equipment=id=>EQUIPMENT.find(g=>g.id===id);
  const MAX_STARS=5, levelCap=(s,id)=>20+(s.stars?.[id]||0)*10;
  const hero = id => HEROES.find(h => h.id === id);
  const clone = x => JSON.parse(JSON.stringify(x));
  function freshState() {
    return { version: 1, tickets: 200, dust: 300, owned: { milo: 1, lark: 1, scarlet: 1 }, levels: {milo:1,lark:1,scarlet:1}, team: ['milo','scarlet','lark'], pity: { sr:0, ssr:0, ur:0 }, pulls:0, clears:[], dungeonClears:[], history:[], gifts:[], stars:{}, gear:[], gearBatches:[], loadouts:{}, nextGearId:1, experience:{}, muted:false, battleSettings:{autoSkip:false}, storyChoices:{}, audio:{volume:65,music:25,musicEnabled:true} };
  }
  function restoreState(raw) {
    const s = freshState();
    if (!raw || raw.version !== 1) return s;
    const num = (n, fallback, max=Number.MAX_SAFE_INTEGER) => Number.isSafeInteger(n) && n>=0 && n<=max ? n : fallback;
    s.tickets = num(raw.tickets,200,Number.MAX_SAFE_INTEGER); s.dust = num(raw.dust,300,Number.MAX_SAFE_INTEGER); s.pulls=num(raw.pulls,0);
    s.owned={}; s.levels={}; s.stars={};
    HEROES.forEach(h => { const count=num(raw.owned?.[h.id],0); if(count) {s.owned[h.id]=count; const stars=num(raw.stars?.[h.id],0,MAX_STARS); if(stars)s.stars[h.id]=stars; s.levels[h.id]=Math.max(1,num(raw.levels?.[h.id],1,levelCap(s,h.id)));} });
    if (!Object.keys(s.owned).length) return freshState();
    s.team=Array.isArray(raw.team)?[...new Set(raw.team)].filter(id=>hero(id)&&s.owned[id]).slice(0,5):Object.keys(s.owned).slice(0,5);
    ['sr','ssr','ur'].forEach((key,i)=>s.pity[key]=num(raw.pity?.[key],0,[9,79,199][i]));
    s.clears=Array.isArray(raw.clears)?[...new Set(raw.clears)].filter(n=>Number.isInteger(n)&&n>=0&&n<STAGES.length):[];
    s.dungeonClears=Array.isArray(raw.dungeonClears)?[...new Set(raw.dungeonClears)].filter(n=>Number.isInteger(n)&&DUNGEONS[n]):[];
    s.history=Array.isArray(raw.history)?raw.history.filter(x=>hero(x.id)&&Number.isSafeInteger(x.pull)).slice(0,30):[];
    s.gifts=Array.isArray(raw.gifts)?raw.gifts.filter(x=>['new-stars-v2','armory-v3','dawn-v5'].includes(x)):[];
    s.experience={};
    HEROES.forEach(h=>{if(!s.owned[h.id])return;const xp=num(raw.experience?.[h.id],0);if(xp&&s.levels[h.id]<levelCap(s,h.id))s.experience[h.id]=Math.min(xp,experienceNeeded(s.levels[h.id],levelCap(s,h.id))-1);});
    const ids=new Set();s.gear=[];s.loadouts={};
    for(const g of Array.isArray(raw.gear)?raw.gear:[]){if(!g||!equipment(g.template)||!Number.isSafeInteger(g.uid)||g.uid<1||g.uid>=Number.MAX_SAFE_INTEGER||ids.has(g.uid))continue;ids.add(g.uid);const item={uid:g.uid,template:g.template},stars=num(g.stars,0,5);if(stars)item.stars=stars;const enhance=num(g.enhance,0,G.MAX_ENHANCE);if(enhance)item.enhance=enhance;item.affixes=G.restore(g.affixes,GEAR_RANKS.indexOf(equipment(g.template).rarity),g.uid);s.gear.push(item);}
    s.gearBatches=Inventory.restore(raw.gearBatches,s.gear);
    s.nextGearId=s.gear.reduce((max,g)=>Math.max(max,g.uid+1),Math.max(num(raw.nextGearId,1),1));
    for(const b of s.gearBatches)s.nextGearId=Math.max(s.nextGearId,b.start+b.count);
    const assigned=new Set();for(const h of HEROES){if(!s.owned[h.id])continue;for(const slot of Object.keys(SLOT_NAMES)){const uid=raw.loadouts?.[h.id]?.[slot],g=Inventory.get(s,uid);if(g&&equipment(g.template).slot===slot&&!assigned.has(uid)){Inventory.materialize(s,uid);(s.loadouts[h.id] ||= {})[slot]=uid;assigned.add(uid);}}}
    s.audio={volume:num(raw.audio?.volume,65,100),music:num(raw.audio?.music,25,100),musicEnabled:raw.audio?.musicEnabled!==false};
    s.muted=raw.muted===true;
    s.battleSettings={autoSkip:raw.battleSettings?.autoSkip===true};s.storyChoices=Story?.restored(raw.storyChoices)||{};
    return s;
  }
  function drawPreview(s,count){
    if(!Number.isSafeInteger(count)||count<1||count>MAX_SUMMON_COUNT)return {error:'请输入 1～10,000 之间的整数召唤次数。'};
    if(s.tickets<count)return {error:`星契不足，需要 ${count.toLocaleString()} 枚，当前持有 ${s.tickets.toLocaleString()} 枚。`};
    if(!Number.isSafeInteger(s.pulls+count)||!Number.isSafeInteger(s.dust+count*600)||Object.values(s.owned).some(n=>!Number.isSafeInteger(n+count)))return {error:'资源数量已达到安全存档上限。'};
    return {count,cost:count,remaining:s.tickets-count};
  }
  function draw(s, count, random=Math.random) {
    const preview=drawPreview(s,count);if(preview.error)return preview;
    const cards=[]; s.tickets-=count;
    for(let n=0;n<count;n++) {
      const roll=rollSummon(random());let rank=roll.rank;
      let guarantee='';
      if(s.pity.ur>=199&&rank<4) {rank=4;guarantee='UR 保底';}
      else if(s.pity.ssr>=79&&rank<3){rank=3;guarantee='SSR 保底';}
      else if(s.pity.sr>=9&&rank<2){rank=2;guarantee='SR 保底';}
      s.pity.sr=rank>=2?0:s.pity.sr+1;
      s.pity.ssr=rank>=3?0:s.pity.ssr+1;
      s.pity.ur=rank>=4?0:s.pity.ur+1;
      const pool=HEROES.filter(h=>h.rarity===RANKS[rank]);
      const pick=Math.min(pool.length-1,Math.floor(Math.max(0,random())*pool.length));
      const h=roll.id?hero(roll.id):pool[pick], isNew=!s.owned[h.id], dust=isNew?0:[8,15,30,80,200,600,600][rank];
      s.owned[h.id]=(s.owned[h.id]||0)+1; s.levels[h.id] ||= 1; s.dust+=dust; s.pulls++;
      const result={id:h.id,isNew,dust,guarantee,pull:s.pulls}; cards.push(result);
      s.history.unshift({id:h.id,pull:s.pulls,guarantee});s.history=s.history.slice(0,30);
    }
    return {cards};
  }
  function upgrade(s,id) {
    if(!s.owned[id])return {error:'尚未缔结该角色。'};
    const level=s.levels[id]||1, cost=40+level*20;
    if(level>=levelCap(s,id))return {error:levelCap(s,id)===70?'已达到最高等级。':'已达到当前星级上限，请消耗同名卡升星。'};
    if(s.dust<cost)return {error:'星尘不足，招募重复角色或完成远征可获得星尘。'};
    s.dust-=cost;s.levels[id]=level+1;if(level+1===levelCap(s,id))delete s.experience?.[id];return {level:level+1};
  }
  function experienceNeeded(level,cap=20){return level>=cap?0:80+40*(level-1);}
  function experienceProgress(s,id){const level=s.levels[id]||1,cap=levelCap(s,id);return {level,cap,xp:level>=cap?0:s.experience?.[id]||0,needed:experienceNeeded(level,cap)};}
  function gainExperience(s,id,amount){
    if(!hero(id)||!s.owned[id]||!Number.isSafeInteger(amount)||amount<0)return null;
    s.experience ||= {};const before=experienceProgress(s,id),cap=before.cap;let level=before.level,xp=before.xp+amount;
    while(level<cap&&xp>=experienceNeeded(level,cap)){xp-=experienceNeeded(level,cap);level++;}
    if(level===cap)xp=0;
    s.levels[id]=level;if(xp)s.experience[id]=xp;else delete s.experience[id];
    return {id,earned:before.level===cap?0:amount,fromLevel:before.level,level,fromXp:before.xp,xp,needed:experienceNeeded(level,cap)};
  }
  function ascension(s,id){const stars=s.stars?.[id]||0,cap=levelCap(s,id),copies=Math.max(0,(s.owned[id]||0)-1);return {stars,cap,copies,ready:!!s.owned[id]&&stars<MAX_STARS&&(s.levels[id]||1)>=cap&&copies>=1};}
  function ascend(s,id){
    if(!hero(id)||!s.owned[id])return {error:'尚未缔结该角色。'};
    const a=ascension(s,id);if(a.stars>=MAX_STARS)return {error:'已达到最高 5 星。'};
    if((s.levels[id]||1)<a.cap)return {error:`达到 ${a.cap} 级后才可升星。`};
    if(!a.copies)return {error:'需要一张额外的同名角色卡。'};
    s.stars ||= {};s.owned[id]--;s.stars[id]=a.stars+1;return {stars:a.stars+1,cap:levelCap(s,id)};
  }
  function addGear(s,template,random=Math.random){const def=equipment(template);if(!def)return null;s.gear ||= [];s.nextGearId ||= 1;const item={uid:s.nextGearId++,template,affixes:G.roll(GEAR_RANKS.indexOf(def.rarity),random)};s.gear.push(item);return item;}
  function gearOwner(s,uid){return Object.keys(s.loadouts||{}).find(id=>Object.values(s.loadouts[id]).includes(uid))||null;}
  function equip(s,id,uid){
    const item=Inventory.get(s,uid);if(!hero(id)||!s.owned[id]||!item)return {error:'角色或装备不存在。'};
    const owner=gearOwner(s,uid);if(owner&&owner!==id)return {error:`请先从${hero(owner).name}身上卸下这件装备。`};
    Inventory.materialize(s,uid);const slot=equipment(item.template).slot;s.loadouts ||= {};s.loadouts[id] ||= {};s.loadouts[id][slot]=uid;return {ok:true};
  }
  function unequip(s,id,slot){if(!SLOT_NAMES[slot]||!s.loadouts?.[id]?.[slot])return false;delete s.loadouts[id][slot];if(!Object.keys(s.loadouts[id]).length)delete s.loadouts[id];return true;}
  function gearStats(item){
    const def=equipment(item?.template);if(!def)return null;const stars=item.stars||0,enhance=item.enhance||0,scale=(1+stars*.25)*(1+enhance*.06);
    const affixes=item.affixes||G.restore(null,GEAR_RANKS.indexOf(def.rarity),item.uid||1);
    return {...def,uid:item.uid,stars,enhance,affixes,substats:G.bonuses(affixes),hp:Math.round(def.hp*scale),atk:Math.round(def.atk*scale),power:Math.round(def.power*scale*10000)/10000};
  }
  function gearEnhancement(s,uid){const item=Inventory.get(s,uid);if(!item)return null;const level=item.enhance||0,rank=GEAR_RANKS.indexOf(equipment(item.template).rarity),cost=(rank+1)*(80+level*45);return {level,cost,max:G.MAX_ENHANCE,before:gearStats(item),after:gearStats({...item,enhance:Math.min(G.MAX_ENHANCE,level+1)}),ready:level<G.MAX_ENHANCE&&s.dust>=cost};}
  function enhanceGear(s,uid,expectedLevel,random=Math.random){
    const p=gearEnhancement(s,uid);if(!p)return {error:'装备不存在。'};
    if(expectedLevel!==p.level)return {error:'强化等级已变化，请重新查看。'};
    if(p.level>=p.max)return {error:'已达到 +15 强化上限。'};
    if(s.dust<p.cost)return {error:'星尘不足。'};
    const item=Inventory.materialize(s,uid);item.affixes ||= G.restore(null,GEAR_RANKS.indexOf(p.before.rarity),uid);const change=G.improve(item,GEAR_RANKS.indexOf(p.before.rarity),random);
    item.enhance=p.level+1;s.dust-=p.cost;return {level:item.enhance,cost:p.cost,change,stats:gearStats(item)};
  }
  function equipped(s,id){return Object.values(s.loadouts?.[id]||{}).map(uid=>Inventory.get(s,uid)).filter(Boolean).map(gearStats);}
  function gearAscension(s,uid){
    const item=Inventory.get(s,uid);if(!item)return null;
    const stars=item.stars||0,cost=[30,60,120,240,480,1440,4320][GEAR_RANKS.indexOf(equipment(item.template).rarity)]*(stars+1);
    const candidates=Inventory.materials(s,item,gearOwner),materials=candidates.ids;
    return {stars,cost,materials,materialCount:candidates.total,before:gearStats(item),after:gearStats({...item,stars:Math.min(5,stars+1)}),ready:stars<5&&materials.length>0&&s.dust>=cost};
  }
  function ascendGear(s,uid,materialUid,expectedStars,random=Math.random){
    const a=gearAscension(s,uid);if(!a)return {error:'装备不存在。'};
    if(expectedStars!==undefined&&expectedStars!==a.stars)return {error:'装备星级已变化，请重新查看升星方案。'};
    if(a.stars>=5)return {error:'装备已达到最高 5 星。'};
    const material=Inventory.get(s,materialUid);
    if(!material||uid===materialUid||material.template!==a.before.id||material.stars||material.enhance||gearOwner(s,materialUid))return {error:'需要一件同名、0 星、未强化且未穿戴的装备作为材料。'};
    if(s.dust<a.cost)return {error:`星尘不足，升星需要 ${a.cost} 星尘。`};
    const item=Inventory.materialize(s,uid);s.dust-=a.cost;item.stars=a.stars+1;item.affixes ||= G.restore(null,GEAR_RANKS.indexOf(a.before.rarity),uid);const change=G.improve(item,GEAR_RANKS.indexOf(a.before.rarity),random);Inventory.remove(s,materialUid);
    return {uid,stars:item.stars,cost:a.cost,consumed:materialUid,change,stats:gearStats(item)};
  }
  function claimArmory(s){s.gifts ||= [];if(s.gifts.includes('armory-v3'))return null;s.gifts.push('armory-v3');s.dust+=600;return {dust:600};}
  function setTeam(s,ids) {
    if(!Array.isArray(ids)||ids.length>5||new Set(ids).size!==ids.length||ids.some(id=>!hero(id)||!s.owned[id]))return false;
    s.team=[...ids];return true;
  }
  function stats(s,id) {
    const h=hero(id),level=s.levels[id]||1,stars=s.stars?.[id]||0,baseScale=(1+(level-1)*.06)*(1+stars*.15);
    const bonus=equipped(s,id).reduce((a,g)=>{a.hp+=g.hp;a.atk+=g.atk;a.power+=g.power;for(const [key,value] of Object.entries(g.substats))a[key]=(a[key]||0)+value;return a;},{hp:0,atk:0,power:0,hpPercent:0,atkPercent:0,mitigation:0});
    return {hp:Math.round((h.hp*baseScale+bonus.hp)*(1+bonus.hpPercent)),atk:Math.round((h.atk*baseScale+bonus.atk)*(1+bonus.atkPercent)),scale:baseScale*(1+bonus.power),mitigation:Math.min(.35,bonus.mitigation),baseScale,bonus,level,stars};
  }
  function finalReadiness(s){
    const rows=(s.team||[]).map(id=>{const h=hero(id),items=equipped(s,id);return {id,rarity:!!h&&rankOf(h)>=4,level:(s.levels[id]||1)>=60,equipment:Object.keys(SLOT_NAMES).every(slot=>items.some(g=>g.slot===slot&&GEAR_RANKS.indexOf(g.rarity)>=3))};});
    return {ready:rows.length===5&&new Set(s.team).size===5&&rows.every(r=>s.owned[r.id]&&r.rarity&&r.level&&r.equipment),rows};
  }
  function availableHeroes(s,sort='rarity'){
    const byRarity=(a,b)=>rankOf(b)-rankOf(a),byLevel=(a,b)=>(s.levels[b.id]||1)-(s.levels[a.id]||1);
    return HEROES.filter(h=>s.owned[h.id]).sort((a,b)=>sort==='level'?(byLevel(a,b)||byRarity(a,b)):(byRarity(a,b)||byLevel(a,b)));
  }
  function dungeonReadiness(s,stage){
    const d=DUNGEONS[stage];if(!d)return {ready:false,unlocked:false,checks:[],error:'未知秘境。'};
    const checks=[{label:d.unlock<0?'初始秘境已解锁':`通关主线第 ${d.unlock+1} 关`,met:d.unlock<0||s.clears.includes(d.unlock)}];
    if(d.requiresDungeon!==undefined)checks.push({label:`通关${DUNGEONS[d.requiresDungeon].name}`,met:s.dungeonClears.includes(d.requiresDungeon)});
    const unlocked=checks.every(c=>c.met);
    if(d.gate){
      const g=d.gate,team=s.team||[],complete=team.length===5&&new Set(team).size===5&&team.every(id=>s.owned[id]&&hero(id));
      checks.push({label:'五名不同的契约者满编',met:complete});
      checks.push({label:`全员 ${RANKS[g.heroRank]} 以上 · LV.${g.level} 以上`,met:complete&&team.every(id=>rankOf(hero(id))>=g.heroRank&&(s.levels[id]||1)>=g.level)});
      checks.push({label:`每人三个部位均为 ${GEAR_RANKS[g.gearRank]} 以上 · ${g.stars} 星以上 · 强化 +${g.enhance} 以上`,met:complete&&team.every(id=>{const items=equipped(s,id);return Object.keys(SLOT_NAMES).every(slot=>items.some(item=>item.slot===slot&&GEAR_RANKS.indexOf(item.rarity)>=g.gearRank&&item.stars>=g.stars&&item.enhance>=g.enhance));})});
    }
    const unmet=checks.filter(c=>!c.met);return {unlocked,ready:!unmet.length,checks,error:unmet.length?'尚未满足秘境条件：'+unmet.map(c=>c.label).join('；')+'。':null};
  }
  function battle(s,stage,mode='story') {
    const def=mode==='dungeon'?DUNGEONS[stage]:STAGES[stage];
    if(!['story','dungeon'].includes(mode)||!Number.isInteger(stage)||!def||!Array.isArray(s.team)||!s.team.length||s.team.length>5||new Set(s.team).size!==s.team.length||s.team.some(id=>!hero(id)||!s.owned[id]))return {error:'请先选择至少一名已拥有的角色。'};
    if(mode==='story'&&stage>0&&!s.clears.includes(stage-1))return {error:'请先通关上一关卡。'};
    if(mode==='dungeon'){const access=dungeonReadiness(s,stage);if(!access.ready)return {error:access.error};}
    if(def.final&&!finalReadiness(s).ready)return {error:'终关要求五名至少 60 级的 UR 或以上角色，每人三个部位全部装备 SSR 或以上。'};
    const allies=s.team.map(id=>{const a=stats(s,id);return {id,hp:a.hp,maxHp:a.hp,atk:a.atk,scale:a.scale,level:a.level,stars:a.stars,mitigation:a.mitigation,shield:0,shieldTurns:0,acted:false,guard:false,fieldHit:false};});
    return {stage,mode,round:1,ap:5,allies,enemies:def.enemies.map((e,i)=>({...e,id:i,art:def.boss?2:i%3,maxHp:e.hp,burn:0,marked:false,frozen:0})),phase:'player',field:0,astralUsed:false,usedUltimates:[],enemyCursor:-1,countered:false,rewardClaimed:false,log:['自动战斗开始。旅团将自主选择目标、治疗并释放技能。']};
  }
  const log=(b,t)=>{b.log.push(t);if(b.log.length>60)b.log.shift();};
  function outcome(b) {
    if(b.enemies.every(x=>x.hp<=0)){b.phase='win';log(b,'远征胜利，星光重新照亮了道路。');return true;}
    if(b.allies.every(x=>x.hp<=0)){b.phase='lose';log(b,'旅团暂时撤退。升级角色或调整阵容后再来挑战。');return true;}
    return false;
  }
  function eventFor(actor,kind,label,fx='slash',color='#e6c898') {return {actor,kind,label,fx,color,impacts:[]};}
  function impact(ev,side,id,value,type='damage') {ev?.impacts.push({side,id,value,type});}
  function absorbWard(b,enemy,amount,ev){
    const ward=enemy.boss;if(ward?.phase!=='ward')return amount;
    const absorbed=Math.min(ward.ward,amount);ward.ward-=absorbed;
    if(absorbed)impact(ev,'enemy',enemy.id,absorbed,'absorb');
    if(ward.ward===0){ward.phase='exposed';ward.until=b.round+1;}
    return amount-absorbed;
  }
  function damage(b,enemy,amount,actor,ev) {
    if(!enemy||enemy.hp<=0)return 0;
    if(actor&&b.field>0&&!actor.fieldHit){amount+=25*actor.scale;actor.fieldHit=true;}
    if(enemy.marked){amount*=1.25;enemy.marked=false;}
    amount=absorbWard(b,enemy,Math.round(amount),ev);const actual=Math.min(enemy.hp,amount);enemy.hp=Math.max(0,enemy.hp-amount);
    impact(ev,'enemy',enemy.id,actual);log(b,`${actor?hero(actor.id).name:'反击'} → ${enemy.name}：${amount} 伤害`);return actual;
  }
  function heal(b,a,power,ev){const value=Math.min(a.maxHp-a.hp,Math.round(power));a.hp+=value;impact(ev,'ally',a.id,value,'heal');log(b,`${hero(a.id).name}恢复 ${value} 生命。`);}
  function shield(a,power,ev){const amount=Math.round(power);a.shield=Math.max(a.shield,amount);a.shieldTurns=2;impact(ev,'ally',a.id,amount,'shield');}
  function action(b,actorId,type,targetId=0) {
    if(b.phase!=='player')return {error:'当前无法行动。'};
    const a=b.allies.find(x=>x.id===actorId),h=hero(actorId);
    if(!a||a.hp<=0||a.acted)return {error:'角色当前无法行动。'};
    if(!['attack','skill','guard'].includes(type))return {error:'未知行动。'};
    const cost=type==='guard'?0:type==='attack'?1:h.cost;
    if(b.ap<cost)return {error:'行动点不足。'};
    if(type==='skill'&&h.ultimate&&b.usedUltimates.includes(a.id))return {error:'此终极技能每场战斗只能使用一次。'};
    const target=b.enemies.find(e=>e.id===targetId);
    const single=['mark','burn','freeze','drain','double','pierce'];
    if((type==='attack'||type==='skill'&&single.includes(h.kind))&&(!target||target.hp<=0))return {error:'目标已经退场。'};
    const ev=eventFor({side:'ally',id:a.id},type,type==='attack'?'普通攻击':type==='guard'?'防御':h.skill,type==='attack'?(h.fx==='arrow'?'arrow':'slash'):type==='guard'?'shield':h.fx,h.color);
    ev.ultimate=type==='skill'&&!!h.ultimate;ev.rarity=h.rarity;
    a.acted=true;b.ap-=cost;
    const living=b.allies.filter(x=>x.hp>0),hurt=[...living].sort((x,y)=>x.hp/x.maxHp-y.hp/y.maxHp)[0],power=h.power*a.scale;
    if(type==='guard'){a.guard=true;impact(ev,'ally',a.id,0,'guard');log(b,`${h.name}进入防御。`);}
    else if(type==='attack')damage(b,target,a.atk,a,ev);
    else {
      if(h.ultimate)b.usedUltimates.push(h.id);
      log(b,`${h.name}释放「${h.skill}」。`);
      switch(h.kind){
        case 'heal':heal(b,hurt,power,ev);break;
        case 'healAll':living.forEach(x=>heal(b,x,power,ev));break;
        case 'renew':living.forEach(x=>{heal(b,x,power,ev);shield(x,40*a.scale,ev);});break;
        case 'nova':b.enemies.forEach(x=>damage(b,x,power,a,ev));living.forEach(x=>heal(b,x,60*a.scale,ev));break;
        case 'crimson':b.enemies.forEach(x=>{damage(b,x,power,a,ev);if(x.hp>0){x.burn=2;x.burnPower=Math.round(55*a.scale);}});break;
        case 'ruin':b.enemies.forEach(x=>damage(b,x,power,a,ev));living.forEach(x=>shield(x,120*a.scale,ev));break;
        case 'genesis':b.enemies.forEach(x=>damage(b,x,power,a,ev));living.forEach(x=>{heal(b,x,120*a.scale,ev);shield(x,100*a.scale,ev);});break;
        case 'tide':heal(b,hurt,power,ev);living.forEach(x=>shield(x,35*a.scale,ev));break;
        case 'mark':damage(b,target,power,a,ev);if(target.hp>0){target.marked=true;impact(ev,'enemy',target.id,0,'mark');}break;
        case 'burn':damage(b,target,power,a,ev);if(target.hp>0){target.burn=2;target.burnPower=Math.round(35*a.scale);}break;
        case 'freeze':damage(b,target,power,a,ev);if(target.hp>0){target.frozen=1;impact(ev,'enemy',target.id,0,'freeze');}break;
        case 'drain':{const dealt=damage(b,target,power,a,ev);heal(b,a,dealt*.5,ev);break;}
        case 'double':damage(b,target,power,a,ev);damage(b,target,power,a,ev);break;
        case 'pierce':damage(b,target,power,a,ev);damage(b,b.enemies.find(x=>x.hp>0&&x.id!==target.id),50*a.scale,a,ev);break;
        case 'shieldOne':shield(hurt,power,ev);break;
        case 'shieldAll':living.forEach(x=>shield(x,power,ev));break;
        case 'storm':b.enemies.forEach(x=>damage(b,x,power,a,ev));shield(a,90*a.scale,ev);break;
        case 'solar':b.enemies.forEach(x=>damage(b,x,power,a,ev));living.forEach(x=>shield(x,65*a.scale,ev));break;
        case 'time':b.enemies.forEach(x=>{damage(b,x,power,a,ev);if(x.hp>0){x.frozen=1;impact(ev,'enemy',x.id,0,'freeze');}});break;
        case 'astral':b.astralUsed=true;b.field=2;b.enemies.forEach(x=>damage(b,x,power,a,ev));break;
      }
    }
    outcome(b);return {ok:true,event:ev};
  }
  function finishRound(b) {
    b.allies.forEach(a=>{a.acted=false;a.guard=false;a.fieldHit=false;if(a.shieldTurns>0&&--a.shieldTurns===0)a.shield=0;});
    if(b.field>0)b.field--;b.ap=5+Math.min(b.ap,2);b.round++;b.phase='player';b.enemyCursor=-1;
    if(b.round>60){b.phase='lose';log(b,'日蚀加深，旅团撤回营地。尝试增加输出角色。');}
    else log(b,`第 ${b.round} 回合：行动点 ${b.ap}。`);
    return {ok:true,event:eventFor(null,'round',b.phase==='lose'?'战线结束':`第 ${b.round} 回合`,'round')};
  }
  function enemyStep(b) {
    if(b.phase==='player'){b.phase='enemy';b.enemyCursor=-1;b.countered=false;}
    if(b.phase!=='enemy')return {error:'敌方无法行动。'};
    if(b.enemyCursor===-1){
      b.enemyCursor=0;const ev=eventFor(null,'burn','余烬灼烧','fire','#ff987d');
      for(const e of b.enemies)if(e.hp>0&&e.burn>0){const value=Math.min(e.hp,absorbWard(b,e,e.burnPower,ev));e.hp-=value;e.burn--;impact(ev,'enemy',e.id,value);log(b,`${e.name}受到 ${value} 点灼烧。`);}
      if(outcome(b)||ev.impacts.length)return {ok:true,event:ev};
    }
    while(b.enemyCursor<b.enemies.length){
      const e=b.enemies[b.enemyCursor++];if(e.hp<=0)continue;
      const ev=eventFor({side:'enemy',id:e.id},'enemy',e.frozen?'冻结 · 无法行动':b.round%3===0?'暗潮横扫':'暗影突袭','enemy','#f69eac');
      if(e.frozen){e.frozen--;impact(ev,'enemy',e.id,0,'freeze');log(b,`${e.name}被冰冻，本次攻击取消。`);return {ok:true,event:ev};}
      const alive=b.allies.filter(x=>x.hp>0),front=alive.slice(0,2),targets=b.round%3===0?alive:[front[(b.round+e.id)%front.length]];
      for(const a of targets){
        if(!a||a.hp<=0)continue;
        let hit=Math.round(e.atk*(b.round%3===0?.85:1)*(a.guard?.5:1)*(1-(a.mitigation||0)));
        const absorbed=Math.min(a.shield,hit);a.shield-=absorbed;hit-=absorbed;const value=Math.min(a.hp,hit);a.hp-=value;impact(ev,'ally',a.id,value);
        if(absorbed)impact(ev,'ally',a.id,absorbed,'absorb');
        log(b,`${e.name} → ${hero(a.id).name}：${hit} 伤害${absorbed?'，护盾吸收 '+absorbed:''}`);
        const knight=b.allies.find(x=>x.id==='selene'&&x.hp>0);
        if(absorbed>0&&a.shield===0&&knight&&!b.countered){damage(b,e,50*knight.scale,null,ev);b.countered=true;}
      }
      outcome(b);return {ok:true,event:ev};
    }
    return finishRound(b);
  }
  function enemyTurn(b){
    if(b.phase!=='player')return {error:'当前无法结束回合。'};
    let result;do{result=enemyStep(b);}while(b.phase==='enemy');return result;
  }
  function autoChoice(b){
    const available=b.allies.filter(a=>a.hp>0&&!a.acted),enemies=b.enemies.filter(e=>e.hp>0);
    if(!available.length||!enemies.length)return null;
    const low=[...enemies].sort((a,b)=>a.hp-b.hp)[0],strong=[...enemies].sort((a,b)=>b.atk-a.atk)[0];
    const living=b.allies.filter(x=>x.hp>0),hurt=Math.max(...living.map(a=>1-a.hp/a.maxHp));
    const candidates=available.map(a=>{
      const h=hero(a.id);let type=b.ap?'attack':'guard',score=type==='attack'?20+a.atk/100:0,target=low;
      if(b.ap>=h.cost&&(!h.ultimate||!b.usedUltimates.includes(h.id))){
        let priority=0;
        if(['heal','healAll','tide','renew'].includes(h.kind))priority=hurt>.32?130+hurt*30:hurt>.16?55:0;
        else if(h.kind==='mark')priority=!low.marked&&low.hp>80&&available.length>1?110:30;
        else if(h.ultimate)priority=100+(enemies.length>1?5:0);
        else if(h.kind==='freeze'){target=enemies.find(x=>!x.frozen)||strong;priority=target.frozen?45:80;}
        else if(h.kind==='shieldAll'||h.kind==='shieldOne')priority=living.slice(0,2).some(x=>x.shield<25)?70:0;
        else if(h.kind==='drain')priority=a.hp<a.maxHp*.7?95:65;
        else if(h.kind==='burn')priority=low.burn?55:75;
        else if(h.kind==='storm')priority=enemies.length>1?85:55;
        else priority=65;
        if(priority>score){type='skill';score=priority;}
      }
      return {actorId:a.id,type,targetId:target.id,score};
    });
    return candidates.sort((a,b)=>b.score-a.score)[0];
  }
  function autoStep(b){
    if(['win','lose'].includes(b.phase))return {done:true};
    if(b.phase==='enemy')return enemyStep(b);
    const choice=autoChoice(b);return choice?action(b,choice.actorId,choice.type,choice.targetId):enemyStep(b);
  }
  function recommendTeam(s){
    const available=HEROES.filter(h=>s.owned[h.id]),score=h=>rankOf(h)*12+stats(s,h.id).level*3+(s.stars?.[h.id]||0)*15;
    available.sort((a,b)=>score(b)-score(a));
    const tank=available.find(h=>['shieldAll','shieldOne','storm'].includes(h.kind));
    const healer=available.find(h=>['heal','healAll','tide','renew'].includes(h.kind));
    const chosen=[tank,healer].filter(Boolean);
    for(const h of available)if(chosen.length<5&&!chosen.includes(h))chosen.push(h);
    chosen.sort((a,b)=>(b===tank?100:0)+(b.role.includes('输出')?5:0)-((a===tank?100:0)+(a.role.includes('输出')?5:0)));
    return chosen.map(h=>h.id);
  }
  function claimExpansion(s){
    s.gifts ||= [];if(s.gifts.includes('new-stars-v2'))return null;
    s.gifts.push('new-stars-v2');s.tickets+=50;
    for(const id of ['bran','flora']){s.owned[id]=(s.owned[id]||0)+1;s.levels[id] ||=1;}
    return {tickets:50,heroes:['bran','flora']};
  }
  function claimDawn(s){
    s.gifts ||= [];if(s.gifts.includes('dawn-v5'))return null;s.gifts.push('dawn-v5');s.tickets+=50;
    for(const id of ['tessa','rune']){s.owned[id]=(s.owned[id]||0)+1;s.levels[id] ||=1;}
    s.dust+=900;return {tickets:50,heroes:['tessa','rune'],dust:900};
  }
  function grantStageRewards(s,stage,roster,won,first,random,mode='story') {
    const def=battleStage({stage,mode}),dungeon=mode==='dungeon';
    const experience=[...new Set(roster)].map(id=>gainExperience(s,id,Math.round(def.xp*(won?1:.4)))).filter(Boolean);
    const reward={stage,mode,tickets:won?(dungeon?0:first?def.reward:3):0,dust:won?(first?def.dust:def.repeatDust):0,first,experience,gear:[]};
    if(won&&dungeon){let roll=G.random01(random),rank=GEAR_RANKS.length-1;for(let i=0;i<GEAR_RANKS.length;i++){roll-=def.rates[i];if(roll<0){rank=i;break;}}const pool=EQUIPMENT.filter(g=>g.rarity===GEAR_RANKS[rank]),template=pool[Math.floor(G.random01(random)*pool.length)].id;reward.gear.push(addGear(s,template,random));}
    s.tickets+=reward.tickets;s.dust+=reward.dust;if(first)(dungeon?s.dungeonClears:s.clears).push(stage);return reward;
  }
  function claim(s,b,random=Math.random) {
    if(!['win','lose'].includes(b.phase)||b.rewardClaimed)return null;
    b.rewardClaimed=true;const won=b.phase==='win',mode=b.mode||'story',clears=mode==='dungeon'?s.dungeonClears:s.clears,first=won&&!clears.includes(b.stage);
    return grantStageRewards(s,b.stage,b.allies.map(a=>a.id),won,first,random,mode);
  }
  const MAX_SWEEP_ROUNDS=1000000;
  function sweepPreview(s,stage,count,mode='story') {
    const def=battleStage({stage,mode}),clears=mode==='dungeon'?s.dungeonClears:s.clears;
    if(!['story','dungeon'].includes(mode)||!Number.isInteger(stage)||!def||!clears.includes(stage))return {error:'首次通关后才能扫荡该关卡。'};
    if(!Number.isSafeInteger(count)||count<1||count>MAX_SWEEP_ROUNDS)return {error:`请输入 1～${MAX_SWEEP_ROUNDS.toLocaleString()} 之间的整数轮数。`};
    if(!Array.isArray(s.team)||!s.team.length||s.team.length>5||new Set(s.team).size!==s.team.length||s.team.some(id=>!hero(id)||!s.owned[id]))return {error:'请先编入 1～5 名已拥有的不同角色。'};
    if(mode==='dungeon'&&def.gate){const access=dungeonReadiness(s,stage);if(!access.ready)return {error:access.error};}
    if(def.final&&!finalReadiness(s).ready)return {error:'终关扫荡仍需五名 60 级 UR 以上角色，且全员三个部位均为 SSR 以上装备。'};
    const tickets=mode==='dungeon'?0:3*count,dust=def.repeatDust*count,gearCount=mode==='dungeon'?count:0;
    if(!Number.isSafeInteger(s.tickets+tickets)||!Number.isSafeInteger(s.dust+dust)||gearCount&&!Number.isSafeInteger(s.nextGearId+gearCount))return {error:'资源或装备库存已达存档容量上限。'};
    return {stage,mode,count,team:[...s.team],tickets,dust,xpPerHero:def.xp*count,gearCount};
  }
  function sweep(s,stage,count,random=Math.random,mode='story',onProgress=()=>{}) {
    const preview=sweepPreview(s,stage,count,mode);if(preview.error)return preview;
    const def=battleStage({stage,mode}),result={stage,mode,count,tickets:preview.tickets,dust:preview.dust,first:false,experience:[],gear:[]};
    // Match consecutive victories, including the last whole round of XP before
    // a star cap is reached, without simulating a million redundant level checks.
    result.experience=preview.team.map(id=>{
      const before=experienceProgress(s,id);let needed=-before.xp;
      for(let level=before.level;level<before.cap;level++)needed+=experienceNeeded(level,before.cap);
      return gainExperience(s,id,Math.min(count,Math.ceil(Math.max(0,needed)/def.xp))*def.xp);
    });
    if(mode==='dungeon'&&count<=100){
      for(let i=0;i<count;i++){
        let roll=G.random01(random),rank=GEAR_RANKS.length-1;for(let r=0;r<GEAR_RANKS.length;r++){roll-=def.rates[r];if(roll<0){rank=r;break;}}
        const pool=EQUIPMENT.filter(g=>g.rarity===GEAR_RANKS[rank]);result.gear.push(addGear(s,pool[Math.floor(G.random01(random)*pool.length)].id,random));
      }
    }else if(mode==='dungeon'){
      // Sample every drop, then store template ranges rather than a million JS
      // objects. Per-piece affix randomness is permanently fixed by seed and UID.
      const pools=GEAR_RANKS.map(rank=>EQUIPMENT.filter(g=>g.rarity===rank)),counts=new Map();
      for(let i=0;i<count;i++){
        let roll=G.random01(random),rank=GEAR_RANKS.length-1;for(let r=0;r<GEAR_RANKS.length;r++){roll-=def.rates[r];if(roll<0){rank=r;break;}}
        const pool=pools[rank],id=pool[Math.floor(G.random01(random)*pool.length)].id;counts.set(id,(counts.get(id)||0)+1);
        if(i%25000===0)onProgress(i,count);
      }
      result.gearCount=count;result.gearGroups=[];s.gearBatches ||= [];
      for(const [template,quantity] of counts){
        const block={version:1,start:s.nextGearId,count:quantity,template,seed:Math.floor(G.random01(random)*4294967296)};
        s.gearBatches.push(block);s.nextGearId+=quantity;
        const item=Inventory.get(s,block.start);result.gear.push(item);result.gearGroups.push({item,count:quantity});
      }
    }
    s.tickets+=result.tickets;s.dust+=result.dust;onProgress(count,count);return result;
  }
  function nextExpedition(s,b){if(b.phase!=='win')return null;const stage=b.stage+1,def=(b.mode==='dungeon'?DUNGEONS:STAGES)[stage];if(!def)return null;const check=battle(s,stage,b.mode);return {stage,mode:b.mode,name:def.name,ready:!check.error,error:check.error};}
  const api={Story,nextExpedition,availableHeroes,dungeonReadiness,Inventory,MAX_SUMMON_COUNT,drawPreview,Gear:G,DUNGEONS,battleStage,finalReadiness,gearEnhancement,enhanceGear,GEAR_RANKS,SUMMON_WEIGHTS,SP_IDS,SSP_IDS,SECRET_IDS,rollSummon,rankOf,sealed,gearStats,gearAscension,ascendGear,claimDawn,REGIONS,EQUIPMENT,SLOT_NAMES,DROP_RATES,MAX_STARS,MAX_SWEEP_ROUNDS,sweepPreview,sweep,equipment,levelCap,ascension,ascend,addGear,gearOwner,equip,unequip,equipped,claimArmory,HEROES,RANKS,RATES,STAGES,hero,freshState,restoreState,draw,upgrade,setTeam,stats,battle,action,enemyTurn,enemyStep,autoChoice,autoStep,recommendTeam,claimExpansion,claim,experienceNeeded,experienceProgress,gainExperience,clone};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.EclipseCore=api;
})(typeof globalThis!=='undefined'?globalThis:this);
