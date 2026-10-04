(function(root){
'use strict';
const TACTICS={balanced:{name:'均衡协同',desc:'优先治疗与标记，兼顾输出。'},burst:{name:'破盾爆发',desc:'保留终极技能，在首领虚弱时集中释放。'},sustain:{name:'稳守续航',desc:'更早治疗，优先铺设护盾。'}};
const BLESSINGS=[
{id:'ember',name:'余烬共鸣',icon:'♨',desc:'引爆伤害翻倍；灼烧每次结算提高 40%。'},
{id:'frost',name:'碎镜回声',icon:'❄',desc:'碎冰额外伤害提高至 75%。'},
{id:'hunt',name:'追星猎印',icon:'⌖',desc:'攻击被标记目标时，额外造成 30% 伤害。'},
{id:'spring',name:'归途灯火',icon:'✧',desc:'每回合开始时，存活队员恢复 8% 最大生命。'},
{id:'bastion',name:'月棺余辉',icon:'◇',desc:'每场战斗开始时，全队获得 18% 最大生命护盾。'},
{id:'edge',name:'锋芒之誓',icon:'⚔',desc:'全队攻击及技能效果提高 15%。'},
{id:'pulse',name:'星脉涌流',icon:'✦',desc:'每回合额外获得 1 点行动点。'},
{id:'resolve',name:'不坠星火',icon:'☀',desc:'每名队员每场战斗可复苏一次，恢复 15% 生命。'}];
const clamp=(n,min,max)=>Math.max(min,Math.min(max,Number(n)||0));
const rng=seed=>()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296};
const ROUTES=[['battle','event'],['elite','camp'],['battle','event'],['camp','elite'],['battle','event'],['boss']];
const NODE={battle:{name:'裂隙遭遇',icon:'⚔',desc:'常规战斗 · 胜利后选择祝福'},elite:{name:'守门精英',icon:'♜',desc:'更强敌人 · 更高资源与祝福'},camp:{name:'无名营火',icon:'♨',desc:'恢复全队 35% 生命，复苏倒下队员'},event:{name:'盟约暗流',icon:'◈',desc:'阵营抉择 · 收益与代价共存'},boss:{name:'蚀心守望者',icon:'♛',desc:'护盾 → 虚弱 → 蓄力 · 最终挑战'}};
function install(Base){
 const C={...Base,TACTICS,BLESSINGS,ROUTES,NODE};
 const fresh=()=>({tactic:'balanced',renderer:'illustrated',cinematic:true,healAt:.68});
 function normalize(s,raw){s.battleSettings={...s.battleSettings,...fresh(),...raw?.battleSettings};if(!TACTICS[s.battleSettings.tactic])s.battleSettings.tactic='balanced';s.battleSettings.renderer=s.battleSettings.renderer==='legacy'?'legacy':'illustrated';s.battleSettings.healAt=clamp(s.battleSettings.healAt,.3,.85);s.battleSettings.cinematic=s.battleSettings.cinematic!==false;
 s.exploration={wins:Math.floor(clamp(raw?.exploration?.wins,0,100000)),serial:Math.floor(clamp(raw?.exploration?.serial,0,100000000)),trust:{},run:null};
 for(const f of ['dawn','moon','forge'])s.exploration.trust[f]=clamp(raw?.exploration?.trust?.[f],-10,10);
 const r=raw?.exploration?.run;if(r&&Array.isArray(r.party)&&r.party.length&&r.party.length<=5&&new Set(r.party).size===r.party.length&&r.party.every(id=>s.owned[id])&&['route','battle','blessing','event','complete','failed','retired'].includes(r.phase)&&Number.isInteger(r.step)&&r.step>=0&&r.step<=6&&(!['route','battle','blessing','event'].includes(r.phase)||r.step<6)){
 const run={id:Math.floor(clamp(r.id,1,100000000)),seed:Math.floor(clamp(r.seed,1,2147483647)),tier:Math.floor(clamp(r.tier,1,5)),step:r.step,phase:r.phase,party:[...r.party],hp:{},blessings:[...new Set((Array.isArray(r.blessings)?r.blessings:[]).filter(id=>BLESSINGS.some(x=>x.id===id)))].slice(0,8),bank:{tickets:Math.floor(clamp(r.bank?.tickets,0,1000)),dust:Math.floor(clamp(r.bank?.dust,0,100000))},path:(Array.isArray(r.path)?r.path:[]).filter(x=>NODE[x]).slice(0,6),node:NODE[r.node]?r.node:null,paid:!!r.paid};
 for(const id of run.party)run.hp[id]=clamp(r.hp?.[id]??1,0,1);if(run.phase==='battle'&&!['battle','elite','boss'].includes(run.node))run.phase='route';s.exploration.run=run;
 }return s;}
 C.freshState=()=>normalize(Base.freshState(),null);C.restoreState=raw=>normalize(Base.restoreState(raw),raw);
 function log(b,t){b.log.push(t);if(b.log.length>60)b.log.shift();}
 C.battle=(s,stage,mode='story')=>{const b=Base.battle(s,stage,mode);if(b.error)return b;prepare(b,s);return b;};
 function prepare(b,s){b.tactics={...fresh(),...s.battleSettings};b.blessings=[];b.report={damage:{},healing:{},combos:0,breaks:0,protection:0};const def=Base.battleStage(b);if(def.boss){const e=b.enemies.reduce((a,e)=>e.maxHp>a.maxHp?e:a);e.boss={phase:'ward',ward:Math.ceil(e.maxHp*.18),maxWard:Math.ceil(e.maxHp*.18),charge:2,until:0};}return b;}
 const has=(b,id)=>b.blessings?.includes(id);
 C.enemyIntent=(b,e)=>e.hp<=0?'已退场':e.frozen?'冻结 · 跳过行动':e.boss?.phase==='ward'?`蚀心屏障 ${e.boss.ward} · 先击破护盾`:e.boss?.phase==='exposed'?'虚弱 · 承伤 +40%':e.boss?.phase==='charge'?`蓄力 ${e.boss.charge} · 下次重击需护盾`:b.round%3===0?'横扫 · 全队伤害':'突袭 · 前排单体';
 C.autoChoice=b=>{
 const base=Base.autoChoice(b);if(!base)return null;
 const available=b.allies.filter(a=>a.hp>0&&!a.acted),enemies=b.enemies.filter(e=>e.hp>0),hurt=Math.min(...b.allies.filter(a=>a.hp>0).map(a=>a.hp/a.maxHp)),tactic=b.tactics?.tactic||'balanced';
 const target=[...enemies].sort((a,e)=>a.hp-e.hp)[0];
 const choices=available.map(a=>{const h=C.hero(a.id);let type=b.ap?'attack':'guard',score=20+a.atk/100,t=target;
 if(b.ap>=h.cost&&(!h.ultimate||!b.usedUltimates.includes(a.id))){let p=65;
 if(['heal','healAll','tide','renew'].includes(h.kind))p=hurt<(tactic==='sustain'?.85:b.tactics?.healAt??.68)?140:0;
 else if(['shieldOne','shieldAll'].includes(h.kind))p=b.allies.slice(0,2).some(x=>x.hp>0&&x.shield<x.maxHp*.1)?(tactic==='sustain'?130:85):0;
 else if(h.kind==='mark')p=target.marked?25:available.length>1?115:30;
 else if(h.kind==='freeze'){t=enemies.find(e=>e.boss?.phase==='charge'&&!e.frozen)||enemies.find(e=>!e.frozen)||target;p=t.frozen?30:90;}
 else if(h.kind==='burn')p=has(b,'ember')?105:80;
 else if(h.ultimate)p=tactic==='burst'&&enemies.some(e=>e.boss)&&!enemies.some(e=>e.boss?.phase==='exposed')?0:105;
 if(p>score){score=p;type='skill';}}
 return {actorId:a.id,type,targetId:t.id,score};});return choices.sort((a,b)=>b.score-a.score)[0];
 };
 function step(b,invoke){
 if(['win','lose'].includes(b.phase))return {done:true};
 b.report ||= {damage:{},healing:{},combos:0,breaks:0,protection:0};
 const previous=new Map(b.enemies.map(e=>[e.id,{hp:e.hp,frozen:e.frozen,burn:e.burn,marked:e.marked,atk:e.atk,phase:e.boss?.phase}]));
 const allyBefore=new Map(b.allies.map(a=>[a.id,a.hp]));
 for(const e of b.enemies)if(e.boss?.phase==='charge'&&e.boss.charge===1)e.atk=Math.round(e.atk*1.65);
 const result=invoke(),ev=result.event;for(const e of b.enemies)e.atk=previous.get(e.id).atk;if(!ev)return result;
 ev.combos=[];for(const e of b.enemies)if(previous.get(e.id).phase==='ward'&&e.boss?.phase==='exposed'){b.report.breaks++;ev.combos.push('破盾 · 虚弱窗口开启');}
 const actor=ev.actor?.side==='ally'?C.hero(ev.actor.id):null,processed=new Set();
 for(const hit of [...ev.impacts]){if(hit.type==='heal'&&actor)b.report.healing[actor.id]=(b.report.healing[actor.id]||0)+hit.value;
 if(hit.type!=='damage'||hit.side!=='enemy')continue;const e=b.enemies.find(e=>e.id===hit.id),pre=previous.get(hit.id);if(!e||!pre)continue;

 let bonus=0,label='';if(actor&&!processed.has(e.id)&&pre.hp>0){processed.add(e.id);if(pre.phase==='exposed')bonus+=Math.round(hit.value*.4);
 if(pre.frozen&&['pierce','double','burn','crimson'].includes(actor.kind)){bonus+=Math.round(hit.value*(has(b,'frost')?.75:.30));e.frozen=0;label='碎冰';}
 else if(pre.burn&&['burn','crimson'].includes(actor.kind)&&ev.kind==='skill'){bonus+=Math.round(hit.value*(has(b,'ember')?.7:.35));label='引爆';}
 else if(pre.marked){bonus+=has(b,'hunt')?Math.round(hit.value*.3):0;label='追击';}
 if(label){b.report.combos++;ev.combos.push(label);}}
 if(ev.kind==='burn'&&has(b,'ember'))bonus+=Math.round(hit.value*.4);
 const actual=Math.min(e.hp,bonus);e.hp-=actual;hit.value+=actual;if(actor)b.report.damage[actor.id]=(b.report.damage[actor.id]||0)+hit.value;else b.report.passive=(b.report.passive||0)+hit.value;
 }
 if(ev.actor?.side==='enemy'){
 const enemy=b.enemies.find(e=>e.id===ev.actor.id);
 if(enemy?.boss?.phase==='charge'&&!ev.impacts.some(i=>i.type==='freeze')){enemy.boss.charge--;if(enemy.boss.charge===0){enemy.boss.phase='ward';enemy.boss.ward=enemy.boss.maxWard;enemy.boss.charge=2;ev.label='蚀心重击 · 屏障重塑';}}
 // Living shield specialists in front share one back-line hit per event.
 const tank=b.allies.slice(0,2).find(a=>a.hp>0&&['shieldOne','shieldAll','storm'].includes(C.hero(a.id).kind));
 const hit=ev.impacts.find(i=>i.side==='ally'&&i.type==='damage'&&i.value>0&&b.allies.findIndex(a=>a.id===i.id)>=2);
 if(tank&&hit){const ally=b.allies.find(a=>a.id===hit.id),share=Math.min(tank.hp-1,Math.round(hit.value*.3));if(share>0){ally.hp+=share;hit.value-=share;tank.hp-=share;b.report.protection+=share;ev.impacts.push({side:'ally',id:tank.id,type:'damage',value:share});ev.combos.push('前卫援护');}}
 }
 if(ev.kind==='round'){
 if(has(b,'pulse'))b.ap++;
 for(const e of b.enemies)if(e.boss?.phase==='exposed'&&b.round>e.boss.until){e.boss.phase='charge';e.boss.charge=2;log(b,'首领开始蓄力：用控制延缓重击，准备护盾。');}
 if(has(b,'spring'))for(const a of b.allies)if(a.hp>0){const n=Math.min(a.maxHp-a.hp,Math.round(a.maxHp*.08));a.hp+=n;ev.impacts.push({side:'ally',id:a.id,type:'heal',value:n});}
 }
 if(has(b,'resolve'))for(const a of b.allies)if(a.hp<=0&&allyBefore.get(a.id)>0&&!a.revived){a.revived=true;a.hp=Math.ceil(a.maxHp*.15);ev.combos.push('不坠星火');ev.impacts.push({side:'ally',id:a.id,type:'heal',value:a.hp});}
 for(const txt of ev.combos)log(b,txt);
 if(b.enemies.every(e=>e.hp<=0))b.phase='win';else if(b.allies.every(a=>a.hp<=0))b.phase='lose';else if((b.phase==='win'||b.phase==='lose')&&b.round<=60){b.phase=ev.actor?.side==='enemy'||ev.kind==='burn'?'enemy':'player';b.log=b.log.filter(t=>!t.startsWith('旅团暂时撤退。'));}
 return result;
 }
 C.action=(b,...args)=>step(b,()=>Base.action(b,...args));
 C.autoStep=b=>step(b,()=>{if(b.phase==='enemy')return Base.enemyStep(b);const c=C.autoChoice(b);return c?Base.action(b,c.actorId,c.type,c.targetId):Base.enemyStep(b);});
 C.battleStage=b=>b.mode==='explore'?b.definition:Base.battleStage(b);
 C.recommendTeam=s=>{const ids=Base.recommendTeam(s),healers=ids.filter(id=>['heal','healAll','tide','renew'].includes(C.hero(id).kind));return [...ids.filter(id=>!healers.includes(id)),...healers];};
 C.startExplore=(s,tier=1)=>{if(s.exploration.run&&!['complete','failed','retired'].includes(s.exploration.run.phase))return {error:'当前探索尚未结束。'};if(!s.team.length)return {error:'请先编入至少一位契约者。'};tier=Math.floor(clamp(tier,1,Math.min(5,1+s.exploration.wins)));const id=++s.exploration.serial;s.exploration.run={id,seed:Math.floor(Math.random()*2147483646)+1,tier,step:0,phase:'route',party:[...s.team],hp:Object.fromEntries(s.team.map(id=>[id,1])),blessings:[],bank:{tickets:0,dust:0},path:[],node:null,paid:false};return {ok:true};};
 C.exploreOptions=s=>{const r=s.exploration.run;return r&&r.step<6?ROUTES[r.step]:[];};
 C.chooseNode=(s,node)=>{const r=s.exploration.run;if(!r||r.phase!=='route'||!C.exploreOptions(s).includes(node))return {error:'该路线当前不可选。'};r.node=node;r.path.push(node);if(node==='camp'){for(const id of r.party)r.hp[id]=Math.min(1,r.hp[id]+(s.exploration.trust.moon>=3?.45:.35));r.step++;r.phase='route';}else r.phase=node==='event'?'event':'battle';return {ok:true};};
 C.blessingOffers=s=>{const r=s.exploration.run;if(!r)return [];const random=rng(r.seed+r.step*101);return BLESSINGS.filter(x=>!r.blessings.includes(x.id)).map(x=>({x,n:random()})).sort((a,b)=>a.n-b.n).slice(0,3).map(e=>e.x);};
 C.chooseBlessing=(s,id)=>{const r=s.exploration.run;if(!r||r.phase!=='blessing'||!C.blessingOffers(s).some(x=>x.id===id))return {error:'请选择当前提供的祝福。'};r.blessings.push(id);r.step++;r.phase='route';return {ok:true};};
 C.exploreEvent=s=>{const r=s.exploration.run;if(!r)return null;return [
 {title:'一张通行证，两份名单',text:'曙曜军需官愿意提供补给，但要求交出暮月议庭护送的失名者名单。拒绝交易，旅团就要分出自己的口粮。',choices:[{name:'隐去名单，分享口粮',desc:'全队当前生命减少 8%；暮月信任 +2；获得归途灯火。',faction:'moon',trust:2,hp:-.08,blessing:'spring'},{name:'交出航路，换取补给',desc:'全队恢复 20% 生命；曙曜信任 +2，暮月信任 −1。',faction:'dawn',trust:2,hp:.2,rival:'moon'}]},
 {title:'熔炉不问买主',text:'星铸工盟出售足够击穿屏障的武器，也向追击你们的人供货。工匠需要这笔订单支付工人的薪水。',choices:[{name:'接受双向交易',desc:'获得锋芒之誓；星铸信任 +2；本次积存星尘减少 60。',faction:'forge',trust:2,dust:-60,blessing:'edge'},{name:'转赠补给给工人',desc:'星铸信任 +1；全队恢复 12% 生命。',faction:'forge',trust:1,hp:.12}]}
,
 {title:'被熄灭的航标',text:'暮月的引路人用暗号求援。点亮航标能接回滞留者，也会让曙曜巡逻队发现议庭藏匿的航路。',choices:[{name:'点灯，接受共同监管',desc:'曙曜信任 +1；全队恢复 15% 生命；获得星脉涌流。',faction:'dawn',trust:1,hp:.15,blessing:'pulse'},{name:'护送他们穿过暗流',desc:'暮月信任 +2；全队生命减少 10%；获得月棺余辉。',faction:'moon',trust:2,hp:-.1,blessing:'bastion'}]},
 {title:'屏障另一侧的灯',text:'无名议会留下了一份证明：蚀心守望者的屏障正在保护一队无证流民。摧毁屏障才能夺回航路，但旅团可以先为他们留下一盏灯。',choices:[{name:'为陌生人留下燃料',desc:'暮月信任 +1；积存星尘减少 40；获得不坠星火。',faction:'moon',trust:1,dust:-40,blessing:'resolve'},{name:'与守卫交换撤离时间',desc:'曙曜信任 +1；全队恢复 10%；获得碎镜回声。',faction:'dawn',trust:1,hp:.1,blessing:'frost'}]},
 {title:'工坊的最后一单',text:'一批本应交给曙曜军方的零件被工人留作避难船引擎。工盟希望旅团签字担保，军官则愿意用立即可用的火力换回订单。',choices:[{name:'替工人担保',desc:'星铸信任 +2，曙曜信任 −1；获得追星猎印。',faction:'forge',trust:2,rival:'dawn',blessing:'hunt'},{name:'履约，但要求支付撤离费用',desc:'曙曜信任 +2；获得余烬共鸣；全队生命减少 6%。',faction:'dawn',trust:2,hp:-.06,blessing:'ember'}]}
 ][(r.seed+Math.floor(r.step/2))%5];};
 C.chooseEvent=(s,index)=>{const r=s.exploration.run,choice=C.exploreEvent(s)?.choices[index];if(!r||r.phase!=='event'||!choice)return {error:'当前事件不可用。'};const trust=s.exploration.trust;trust[choice.faction]=clamp(trust[choice.faction]+choice.trust,-10,10);if(choice.rival)trust[choice.rival]=clamp(trust[choice.rival]-1,-10,10);for(const id of r.party)r.hp[id]=r.hp[id]>0?clamp(r.hp[id]+(choice.hp||0),.01,1):0;r.bank.dust=Math.max(0,r.bank.dust+(choice.dust||0));if(choice.blessing&&!r.blessings.includes(choice.blessing))r.blessings.push(choice.blessing);r.step++;r.phase='route';return {ok:true};};
 C.exploreBattle=s=>{const r=s.exploration.run;if(!r||r.phase!=='battle')return {error:'当前没有待完成的探索战斗。'};const b=C.battle({...s,team:r.party},0);if(b.error)return b;
 b.mode='explore';b.exploreToken=r.id+':'+r.step;b.blessings=[...r.blessings];b.definition={...Base.STAGES[0],name:NODE[r.node].name,subtitle:`星蚀探索 · 第 ${r.step+1}/6 站`,boss:r.node==='boss',theme:['moon','void','frost'][r.seed%3],region:0};
 const power=b.allies.reduce((sum,a)=>sum+a.atk,0),health=b.allies.reduce((sum,a)=>sum+a.maxHp,0),factor=(.8+r.step*.10)*(1+(r.tier-1)*.18),boss=r.node==='boss',elite=r.node==='elite',count=boss?1:3;
 b.enemies=Array.from({length:count},(_,i)=>{const hp=Math.round(power*factor*(boss?5:elite?2:1.4));return {id:i,name:boss?'蚀心守望者':elite?'契约猎卫':['裂隙守卫','失名术士','蚀影追猎'][i],hp,maxHp:hp,atk:Math.round(health*.055*factor*(boss?1.7:elite?1.3:1)),art:boss?2:i%2,burn:0,frozen:0,marked:false,...(boss?{boss:{phase:'ward',ward:Math.ceil(hp*.18),maxWard:Math.ceil(hp*.18),charge:2,until:0}}:{})};});
 for(const a of b.allies){a.hp=Math.round(a.maxHp*r.hp[a.id]);if(s.exploration.trust.forge>=3)a.atk=Math.round(a.atk*1.05);if(has(b,'edge')){a.atk=Math.round(a.atk*1.15);a.scale*=1.15;}if(has(b,'bastion')||s.exploration.trust.dawn>=3){a.shield=Math.round(a.maxHp*.18);a.shieldTurns=2;}}
 if(has(b,'pulse'))b.ap++;return b;};
 function payout(s,r,won){if(r.paid)return {tickets:0,dust:0};r.paid=true;const tickets=r.bank.tickets+(won?10*r.tier:0),dust=r.bank.dust+(won?300*r.tier:0);s.tickets+=tickets;s.dust+=dust;if(won)s.exploration.wins++;return {tickets,dust};}
 C.claim=(s,b,random)=>{if(b.mode!=='explore')return Base.claim(s,b,random);const r=s.exploration.run;if(!r||r.phase!=='battle'||b.exploreToken!==r.id+':'+r.step||b.rewardClaimed||!['win','lose'].includes(b.phase))return null;b.rewardClaimed=true;const won=b.phase==='win';for(const a of b.allies)r.hp[a.id]=a.hp/a.maxHp;const reward={stage:0,mode:'explore',first:false,tickets:0,dust:0,gear:[],experience:r.party.map(id=>C.gainExperience(s,id,(won?(r.node==='boss'?180:r.node==='elite'?70:40):15)*r.tier)).filter(Boolean),banked:true};
 if(won){r.bank.tickets+=r.node==='elite'?4:2;r.bank.dust+=(r.node==='elite'?150:80)*r.tier;if(r.node==='boss'){r.phase='complete';r.step=6;Object.assign(reward,payout(s,r,true));reward.banked=false;}else r.phase='blessing';}else{r.phase='failed';Object.assign(reward,payout(s,r,false));reward.banked=false;}return reward;};
 C.retireExplore=s=>{const r=s.exploration.run;if(!r||['complete','failed','retired'].includes(r.phase))return {error:'没有进行中的探索。'};r.phase='retired';return payout(s,r,false);};
 return C;
}
const api={install,TACTICS,BLESSINGS,ROUTES,NODE};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.EclipseJourney=api;
})(typeof globalThis!=='undefined'?globalThis:this);
