(function(root){
 'use strict';
 const REGIONS=[
  {name:'月蚀旧城',english:'THE LOST CITY',theme:'moon',color:'#a9bbef',glyph:'☽',desc:'循着提灯的微光，找回失落的星核。'},
  {name:'赤烬边境',english:'THE EMBER MARCH',theme:'ember',color:'#edac83',glyph:'♜',desc:'越过燃烧的锻炉，迎战余烬中的巨兽。'},
  {name:'霜镜王庭',english:'THE FROZEN COURT',theme:'frost',color:'#95dee5',glyph:'❄',desc:'踏上冰封的阶梯，唤醒沉眠的王庭。'},
  {name:'虚空星海',english:'THE ASTRAL ABYSS',theme:'void',color:'#ccb2fa',glyph:'✧',desc:'抵达群星尽头，直面吞噬光明的终焉。'},
  {name:'曙光圣域',english:'SANCTUARY OF DAWN',theme:'dawn',color:'#e8d1a0',glyph:'☀',desc:'唤醒沉眠的金色圣域，以星铸之力重燃晨曦。'},
  {name:'风暴天穹',english:'THE STORM CROWN',theme:'tempest',color:'#9cbbff',glyph:'ϟ',desc:'飞越浮空群岛，在天穹之巅迎接六翼星龙。'}
 ];
 const ranks=['N','R','SR','SSR','UR'],slots=['weapon','armor','relic'];
 const SLOT_NAMES={weapon:'武器',armor:'护甲',relic:'圣物'};
 const names=[['旅人短剑','巡星轻甲','微光吊坠'],['风语长刃','银月护甲','晨露晶石'],['赤烬裁决','霜镜战衣','潮汐之心'],['月陨圣剑','星穹壁垒','时隙沙漏'],['终焉·破晓','神谕·永恒','创世·星核']];
 const lore=['旅团最初的行装，陪你走过第一段星途。','旧城匠人留下的星纹，仍流淌着微弱的光。','元素凝成锋芒，回应契约者的意志。','失落王庭的秘藏，铭刻着群星的誓言。','由一颗新生恒星铸成，静候命定的持有者。'];
 const EQUIPMENT=ranks.flatMap((rarity,r)=>slots.map((slot,i)=>({id:`${slot}-${rarity.toLowerCase()}`,name:names[r][i],rarity,slot,lore:lore[r],hp:slot==='armor'?[70,150,300,560,950][r]:slot==='relic'?[25,60,120,220,380][r]:0,atk:slot==='weapon'?[10,22,46,85,150][r]:slot==='relic'?[3,7,15,28,50][r]:0,power:slot==='relic'?[.04,.08,.14,.22,.35][r]:0})));
 const newEquipment=[
  ['scout-bow-n','斥候木弓','N','weapon',0,8,.02,'系着星纹护符的短弓，陪伴哨兵守望漫漫长夜。'],
  ['pilgrim-coat-n','行旅皮甲','N','armor',55,3,0,'青布衬里与铜扣相接，轻便而可靠的远行伙伴。'],
  ['tide-spear-r','澜汐长枪','R','weapon',35,19,0,'枪尖封存一道潮汐，海风吹过时会发出清鸣。'],
  ['wind-compass-r','风旅罗盘','R','relic',45,10,.09,'指针永远朝向下一阵自由的风。'],
  ['thunder-bow-sr','惊雷弦月','SR','weapon',0,40,.05,'雷电化作弓弦，箭矢划破夜幕时如弦月升起。'],
  ['ember-mail-sr','焰羽鳞甲','SR','armor',265,12,0,'凤凰翎羽覆在黑金甲片之上，余烬始终不熄。'],
  ['dawn-staff-ssr','黎明圣杖','SSR','weapon',60,64,.10,'金色百合绽放于杖端，引导治愈万物的晨光。'],
  ['tempest-heart-ssr','风暴之心','SSR','relic',170,36,.24,'三重星环锁住风暴中心最宁静的一瞬。'],
  ['dragon-spear-ur','苍穹·龙誓','UR','weapon',150,132,.10,'星龙的誓言凝成六翼长枪，锋刃映照整片苍穹。'],
  ['seraph-armor-ur','六翼·天启','UR','armor',840,35,.05,'天君留下的白金战甲，以蓝宝石之心照亮归途。']
 ];
 EQUIPMENT.push(...newEquipment.map(([id,name,rarity,slot,hp,atk,power,lore])=>({id,name,rarity,slot,hp,atk,power,lore})));
 const sovereignEquipment=[
  ['weapon-sp','赤冕·断罪','SP','weapon',180,225,.16,'绯月王座的断罪之刃。黑金荆棘托起赤晶王冠，剑脊流动着不熄的血月之光。'],
  ['armor-sp','绯誓·王铠','SP','armor',1450,48,.12,'以绯红誓言封铸的王铠，层叠玫瑰与荆棘守护胸前永燃的赤晶。'],
  ['relic-sp','血月·圣契','SP','relic',580,78,.50,'月蚀之中悬浮的赤晶圣契。双重血月星环，回响着古王的誓言。'],
  ['weapon-ssp','初光·裁星','SSP','weapon',320,340,.25,'凝聚第一缕初光的棱晶神刃。星轨悬浮于锋刃两侧，裁开万象的边界。'],
  ['armor-ssp','万象·天衣','SSP','armor',2200,72,.20,'白金与虹晶织成的六翼天衣，承载世界诞生前的星图。'],
  ['relic-ssp','永恒·零界','SSP','relic',880,120,.72,'零界之中的微缩宇宙。万千星轨围绕初生棱星，流转永不重复的虹光。']
 ];
 EQUIPMENT.push(...sovereignEquipment.map(([id,name,rarity,slot,hp,atk,power,lore])=>({id,name,rarity,slot,hp,atk,power,lore})));
 const spec=[
 ['失落城门',1,[180,145,210],[25,22,28],['迷途影卫','星蚀游魂','空壳守卫'],90,10,160,'weapon-r'],
 ['月光回廊',3,[330,290,410],[38,34,42],['沉默骑士','祷告残影','月棺守门者'],150,15,220,'armor-r'],
 ['终焉之门',5,[1350],[62],['星蚀化身'],220,20,300,'relic-sr'],
 ['余烬哨所',8,[600,510,700],[65,60,70],['赤烬先锋','熔火游魂','焚风卫士'],360,20,420,'weapon-sr'],
 ['熔心锻炉',14,[820,730,1000],[80,76,90],['锻炉卫士','赤焰使徒','熔岩执刑者'],520,25,580,'armor-sr'],
 ['焚天巨兽',20,[3600],[130],['焚天·炎骸领主'],750,30,800,'relic-ssr'],
 ['霜镜渡口',24,[1600,1400,1850],[145,130,155],['寒潮守卫','碎镜幽灵','霜刃骑士'],1050,30,1050,'weapon-ssr'],
 ['冰封圣堂',30,[2100,1850,2400],[165,150,180],['冰棺近卫','凛冬术士','王庭禁卫'],1450,35,1350,'armor-ssr'],
 ['永冬王座',35,[7600],[235],['永冬·白夜君王'],1950,40,1700,'relic-ur'],
 ['陨星长阶',42,[3500,3000,3800],[245,225,260],['陨星骑士','裂隙猎手','无光守卫'],2600,40,2100,'weapon-ur'],
 ['无光星环',50,[4600,4000,5200],[290,275,310],['湮灭使徒','星环织梦者','虚空行刑官'],3400,45,2600,'armor-ur'],
 ['群星终焉',60,[15000],[420],['终焉·噬星之主'],4400,60,3500,'relic-ur'],
 ['晨曦阶庭',62,[5200,4700,5800],[315,300,340],['晨辉守门者','祈愿残影','鎏金剑卫'],5000,65,3900,'dawn-staff-ssr'],
 ['万象圣殿',64,[6500,5900,7100],[370,340,390],['曜石禁卫','天光咏者','圣殿裁决官'],5700,70,4400,'seraph-armor-ur'],
 ['晨星审判',66,[21000],[530],['失序·晨星圣像'],6500,80,5000,'dragon-spear-ur'],
 ['浮空航道',68,[7600,6700,8200],[405,380,435],['疾风先锋','雷鸣游魂','天穹巡猎者'],7400,85,5600,'tempest-heart-ssr'],
 ['雷霆王座',70,[9200,7900,10500],[450,415,490],['雷光近卫','风暴织法者','天穹执刑官'],8500,90,6400,'dragon-spear-ur'],
 ['六翼天穹',70,[32000],[650],['天劫·六翼星龙'],10000,120,8000,'seraph-armor-ur']
 ];
 const newRegions=[
  ['镜海回廊','THE MIRROR SEA','frost','#8bdfec','◈',['潮痕岸线','镜中倒影','深海镜皇']],
  ['苍木灵庭','THE VERDANT COURT','dawn','#acdba9','❋',['萤火林径','苍木神殿','古树之心']],
  ['赤月荒原','THE BLOOD MOON','ember','#ed8eab','◐',['赤月渡口','血荆高塔','荒原裁决']],
  ['时砂帝国','THE SANDS OF TIME','moon','#e6c992','⌛',['流沙天阶','永昼钟楼','时砂帝王']],
  ['星骸遗都','THE FALLEN STARS','void','#b7abf3','✧',['坠星废墟','星骸工坊','不灭星骸']],
  ['幽夜王城','THE NIGHT CITADEL','void','#bc94df','♜',['长夜城垣','寂静回廊','永夜议会']],
  ['天火圣山','THE CELESTIAL PYRE','ember','#ffb379','♨',['熔金栈道','天火熔池','焚世圣龙']],
  ['虹晶天境','THE PRISM GARDENS','frost','#b5f1f3','◇',['折光迷径','七曜花园','虹晶女王']],
  ['万象神域','THE ORIGIN SANCTUM','dawn','#f5deb4','☀',['神谕阶庭','万象祭坛','初光守望']],
  ['终焉王座','THE FINAL THRONE','void','#d9bcff','♛',['星门尽头','诸神长阶','永恒日蚀']]
 ];
 newRegions.forEach(([name,english,theme,color,glyph,names],r)=>{
  REGIONS.push({name,english,theme,color,glyph,desc:['循着远古星图，追索失落的契约。','穿越守门者的防线，迎接区域首领。','将旅团的星光，带往更遥远的世界。'][r%3]});
  names.forEach((name,j)=>{const n=r*3+j,level=Math.min(70,47+Math.floor(n*.79)),boss=j===2,hp=Math.round(3100+n*210),atk=Math.round(205+n*9);spec.push([name,level,boss?[hp*3.5]:[hp,hp*.85,hp*1.1],boss?[atk*1.9]:[atk,atk*.88,atk*1.07],boss?[name+' · 星蚀主宰']:['星蚀近卫','裂隙咏者','王庭执刑官'],3300+n*280,55+n*3,2200+n*220]);});
 });
 // Original stage indexes stay stable for existing save files.
 const earlyLevels=[1,3,5,8,14,20,24,27,30,32,34,36,38,40,42,44,45,46];
 const STAGES=spec.map(([name,level,hps,atks,enemies,xp,reward,dust],i)=>{
  if(i<18){level=earlyLevels[i];if(i>=8){const scale=(level/spec[i][1])**1.8;hps=hps.map(h=>h*scale);atks=atks.map(a=>a*Math.sqrt(scale));}}
  const region=Math.floor(i/3),boss=i%3===2;
  return {name,level,xp,reward,dust,region,theme:REGIONS[region].theme,boss,subtitle:`STAGE ${String(i+1).padStart(2,'0')}`,desc:boss?`击败${REGIONS[region].name}的星蚀主宰，点亮通向下一段星途的道路。`:`穿越${REGIONS[region].name}的防线，收集成长经验与星契，为旅团的下一场决战做好准备。`,enemies:enemies.map((name,j)=>({name,hp:Math.round(hps[j]),atk:Math.round(atks[j]),model:boss?(region%2?'demon':'blue-demon'):['orc','demon','blue-demon'][(j+region)%3]})),repeatDust:Math.round(50+i*32+i*i*1.5)};
 });
 Object.assign(STAGES[47],{name:'永恒日蚀 · 终焉王座',level:60,final:true,xp:18000,reward:300,dust:24000,repeatDust:4200,desc:'终局试炼：五名至少 60 级的 UR、SP 或 SSP 契约者，全员武器、护甲、圣物均为 SSR 以上。建议强化 +10 并搭配护盾、治疗或时停。',enemies:[{name:'终焉王座 · 永恒日蚀',hp:42000,atk:1700,model:'demon'},{name:'日蚀之翼',hp:3500,atk:180,model:'blue-demon'},{name:'星界守墓者',hp:3500,atk:180,model:'orc'}]});
 const DROP_RATES=[[.65,.30,.05,0,0],[.1,.5,.35,.05,0],[0,.15,.55,.28,.02],[0,0,.30,.58,.12],[0,0,0,.7,.3],[0,0,0,.4,.6]];
 const DUNGEONS=[
  ['初火锻炉',1,-1,400,32,'moon','N / R，少量 SR'],
  ['银月工坊',15,5,3000,125,'moon','R / SR，少量 SSR'],
  ['元素熔炉',30,11,6500,235,'ember','SR / SSR，少量 UR'],
  ['星穹铸庭',45,17,13500,360,'frost','SR / SSR / UR'],
  ['神谕宝库',55,29,23000,540,'dawn','必得 SSR 以上'],
  ['创世秘藏',60,41,33000,680,'void','必得 SSR 以上，60% UR']
 ].map(([name,level,unlock,hp,atk,theme,loot],i)=>({name,level,unlock,theme,loot,region:Math.min(i,5),kind:'dungeon',boss:true,subtitle:`FORGE ${i+1}`,xp:[90,500,1300,2400,3600,5000][i],reward:0,dust:120+i*160,repeatDust:120+i*160,rates:DROP_RATES[i],enemies:[{name:name+' · 铸星守卫',hp,atk,model:i%2?'demon':'blue-demon'}]}));
 // Higher tiers have their own endgame gates; ordinary forges retain their odds.
 DUNGEONS.forEach(d=>{d.rates.push(0,0);});
 const endgame=[
  {name:'绯月王庭',level:60,unlock:44,requiresDungeon:5,theme:'crimson',region:8,loot:'99% UR · 1% SP（同档三件等概率）',xp:7500,dust:1600,repeatDust:1600,rates:[0,0,0,0,.99,.01,0],gate:{level:60,heroRank:4,gearRank:4,stars:2,enhance:10},enemies:[{name:'绯月女皇 · 王庭幻影',hp:68000,atk:2100,model:'demon'}]},
  {name:'零界星殿',level:70,unlock:47,requiresDungeon:6,theme:'prism',region:13,loot:'99.9% SP · 0.1% SSP（同档三件等概率）',xp:10000,dust:2400,repeatDust:2400,rates:[0,0,0,0,0,.999,.001],gate:{level:70,heroRank:4,gearRank:5,stars:2,enhance:15},enemies:[{name:'万象初光 · 零界守望',hp:135000,atk:3200,model:'blue-demon'}]}
 ];
 endgame.forEach((d,i)=>{DUNGEONS.push({...d,kind:'dungeon',boss:true,subtitle:`SOVEREIGN FORGE ${i+7}`,reward:0});DROP_RATES.push(d.rates);});
 const api={REGIONS,SLOT_NAMES,EQUIPMENT,STAGES,DROP_RATES,DUNGEONS};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.EclipseProgression=api;
})(typeof globalThis!=='undefined'?globalThis:this);
