(function(root){
'use strict';
const TACTICS={balanced:{name:'均衡协同',desc:'优先治疗与标记，兼顾输出。'},burst:{name:'破盾爆发',desc:'保留终极技能，在首领虚弱时集中释放。'},sustain:{name:'稳守续航',desc:'更早治疗，优先铺设护盾。'}};
const BLESSINGS=[
{id:'ember',name:'余烬共鸣',icon:'♨',desc:'灼伤每次结算提高 40%，包含蚀燃。'},
{id:'frost',name:'碎镜回声',icon:'❄',desc:'全队削韧提高 25%。'},
{id:'hunt',name:'追星猎印',icon:'⌖',desc:'攻击路标目标时，直接伤害提高 20%。'},
{id:'spring',name:'归途灯火',icon:'✧',desc:'每回合开始时，存活队员恢复 8% 最大生命。'},
{id:'bastion',name:'月棺余辉',icon:'◇',desc:'每场战斗开始时，全队获得 18% 最大生命护盾。'},
{id:'edge',name:'锋芒之誓',icon:'⚔',desc:'全队攻击及技能效果提高 15%。'},
{id:'pulse',name:'星脉涌流',icon:'✦',desc:'每回合额外获得 1 点行动点。'},
{id:'resolve',name:'不坠星火',icon:'☀',desc:'每名队员每场战斗可复苏一次，恢复 15% 生命。'}];
const clamp=(n,min,max)=>Math.max(min,Math.min(max,Number(n)||0));
const rng=seed=>()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296};
const ROUTES=[['battle','event'],['elite','camp'],['battle','event'],['camp','elite'],['battle','event'],['boss']];
const NODE={battle:{name:'裂隙遭遇',icon:'⚔',desc:'常规战斗 · 胜利后选择祝福'},elite:{name:'守门精英',icon:'♜',desc:'更强敌人 · 更高资源与祝福'},camp:{name:'无名营火',icon:'♨',desc:'恢复全队 35% 生命，复苏倒下队员'},event:{name:'盟约暗流',icon:'◈',desc:'阵营抉择 · 收益与代价共存'},boss:{name:'蚀心守望者',icon:'♛',desc:'削韧 → 断招 → 坚韧 · 最终挑战'}};
function install(Base){
 const C={...Base,TACTICS,BLESSINGS,ROUTES,NODE};
 const fresh=()=>({tactic:'balanced',renderer:'illustrated',cinematic:true,healAt:.68});
 function normalize(s,raw){s.battleSettings={...s.battleSettings,...fresh(),...s.battleSettings};if(!TACTICS[s.battleSettings.tactic])s.battleSettings.tactic='balanced';s.battleSettings.renderer='illustrated';s.battleSettings.healAt=clamp(s.battleSettings.healAt,.3,.85);s.battleSettings.cinematic=s.battleSettings.cinematic!==false;
 s.exploration={wins:Math.floor(clamp(raw?.exploration?.wins,0,100000)),serial:Math.floor(clamp(raw?.exploration?.serial,0,100000000)),trust:{},run:null};
 for(const f of ['dawn','moon','forge'])s.exploration.trust[f]=clamp(raw?.exploration?.trust?.[f],-10,10);
 const r=raw?.exploration?.run;if(r&&Array.isArray(r.party)&&r.party.length&&r.party.length<=5&&new Set(r.party).size===r.party.length&&r.party.every(id=>s.owned[id])&&['route','battle','blessing','event','complete','failed','retired'].includes(r.phase)&&Number.isInteger(r.step)&&r.step>=0&&r.step<=6&&(!['route','battle','blessing','event'].includes(r.phase)||r.step<6)){
 const run={id:Math.floor(clamp(r.id,1,100000000)),seed:Math.floor(clamp(r.seed,1,2147483647)),tier:Math.floor(clamp(r.tier,1,5)),step:r.step,phase:r.phase,party:[...r.party],hp:{},blessings:[...new Set((Array.isArray(r.blessings)?r.blessings:[]).filter(id=>BLESSINGS.some(x=>x.id===id)))].slice(0,8),bank:{tickets:Math.floor(clamp(r.bank?.tickets,0,1000)),dust:Math.floor(clamp(r.bank?.dust,0,100000))},path:(Array.isArray(r.path)?r.path:[]).filter(x=>NODE[x]).slice(0,6),node:NODE[r.node]?r.node:null,paid:!!r.paid,actionDebt:Math.floor(clamp(r.actionDebt,0,2))};
 for(const id of run.party)run.hp[id]=clamp(r.hp?.[id]??1,0,1);if(run.phase==='battle'&&!['battle','elite','boss'].includes(run.node))run.phase='route';s.exploration.run=run;
 }return s;}
 C.freshState=()=>normalize(Base.freshState(),null);C.restoreState=raw=>normalize(Base.restoreState(raw),raw);
 function log(b,t){b.log.push(t);if(b.log.length>60)b.log.shift();}
 C.battle=(s,stage,mode='story')=>{const b=Base.battle(s,stage,mode);if(b.error)return b;prepare(b,s);return b;};
 function prepare(b,s){b.blessings ||= [];return b;}
 const has=(b,id)=>b.blessings?.includes(id);
 C.enemyIntent=Base.enemyIntent;C.autoChoice=Base.autoChoice;C.action=Base.action;C.autoStep=Base.autoStep;
 C.battleStage=b=>b.mode==='explore'?b.definition:Base.battleStage(b);
 C.recommendTeam=Base.recommendTeam;
 C.startExplore=(s,tier=1)=>{if(s.exploration.run&&!['complete','failed','retired'].includes(s.exploration.run.phase))return {error:'当前探索尚未结束。'};if(!s.team.length)return {error:'请先编入至少一位契约者。'};tier=Math.floor(clamp(tier,1,Math.min(5,1+s.exploration.wins)));const id=++s.exploration.serial;s.exploration.run={id,seed:Math.floor(Math.random()*2147483646)+1,tier,step:0,phase:'route',party:[...s.team],hp:Object.fromEntries(s.team.map(id=>[id,1])),blessings:[],bank:{tickets:0,dust:0},path:[],node:null,paid:false,actionDebt:0};return {ok:true};};
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
 b.enemies=Array.from({length:count},(_,i)=>{const hp=Math.round(power*factor*(boss?5:elite?2:1.4));return {id:i,name:boss?'蚀心守望者':elite?'契约猎卫':['裂隙守卫','失名术士','蚀影追猎'][i],hp,maxHp:hp,atk:Math.round(health*.055*factor*(boss?1.25:elite?1.3:1)),art:boss?2:i%2,burn:0,frozen:0,marked:false,...(boss?{boss:{phase:'ward',ward:Math.ceil(hp*.18),maxWard:Math.ceil(hp*.18),charge:2,until:0}}:{})};});
 for(const a of b.allies){a.hp=Math.round(a.maxHp*r.hp[a.id]);if(s.exploration.trust.forge>=3)a.atk=Math.round(a.atk*1.05);if(has(b,'edge')){a.atk=Math.round(a.atk*1.15);a.scale*=1.15;}if(has(b,'bastion')||s.exploration.trust.dawn>=3){a.shield=Math.round(a.maxHp*.18);a.shieldTurns=2;}}
 Base.prepareBattle(b,s);b.ap=Math.max(0,b.ap-(r.actionDebt||0));if(has(b,'pulse')){b.ap++;b.extraAP=1;}return b;};
 function payout(s,r,won){if(r.paid)return {tickets:0,dust:0};r.paid=true;const tickets=r.bank.tickets+(won?10*r.tier:0),dust=r.bank.dust+(won?300*r.tier:0);s.tickets+=tickets;s.dust+=dust;if(won)s.exploration.wins++;return {tickets,dust};}
 C.claim=(s,b,random)=>{if(b.mode!=='explore')return Base.claim(s,b,random);const r=s.exploration.run;if(!r||r.phase!=='battle'||b.exploreToken!==r.id+':'+r.step||b.rewardClaimed||!['win','lose'].includes(b.phase))return null;b.rewardClaimed=true;r.actionDebt=Math.min(2,b.actionDebt||0);const won=b.phase==='win';for(const a of b.allies)r.hp[a.id]=a.hp/a.maxHp;const reward={stage:0,mode:'explore',first:false,tickets:0,dust:0,gear:[],experience:r.party.map(id=>C.gainExperience(s,id,(won?(r.node==='boss'?180:r.node==='elite'?70:40):15)*r.tier)).filter(Boolean),banked:true};
 if(won){r.bank.tickets+=r.node==='elite'?4:2;r.bank.dust+=(r.node==='elite'?150:80)*r.tier;if(r.node==='boss'){r.phase='complete';r.step=6;Object.assign(reward,payout(s,r,true));reward.banked=false;}else r.phase='blessing';}else{r.phase='failed';Object.assign(reward,payout(s,r,false));reward.banked=false;}return reward;};
 C.retireExplore=s=>{const r=s.exploration.run;if(!r||['complete','failed','retired'].includes(r.phase))return {error:'没有进行中的探索。'};r.phase='retired';return payout(s,r,false);};
 return C;
}
const api={install,TACTICS,BLESSINGS,ROUTES,NODE};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.EclipseJourney=api;
})(typeof globalThis!=='undefined'?globalThis:this);
