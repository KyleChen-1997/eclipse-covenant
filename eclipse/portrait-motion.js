(function(root){
 'use strict';
 // Landmarks are authored in the original 1024 × 1536 illustration, not card space.
 const eye=(x,y,rx,ry,angle=0)=>[x/1024,y/1536,rx/1024,ry/1536,angle*Math.PI/180];
 const region=(x,y,rx,ry)=>[x/1024,y/1536,rx/1024,ry/1536];
 const strand=(ax,ay,bx,by,cx,cy,width)=>[ax/1024,ay/1536,bx/1024,by/1536,cx/1024,cy/1536,width/1024];
 const profiles={
  astra:{head:region(505,188,163,180),neck:[513,328],eyes:[eye(467,195,24,9,-12),eye(544,179,23,9,-9)],hair:[strand(409,236,389,411,310,623,67),strand(607,248,658,454,858,714,82)],cloth:[region(141,1080,140,360),region(881,1124,137,331)],color:'#ceb7ff',motes:'stars',orb:[584,666,69]},
  aurelia:{head:region(501,199,152,179),neck:[505,326],eyes:[eye(467,201,23,8,-2),eye(536,201,22,8,3)],hair:[strand(414,218,343,318,158,476,80),strand(599,243,668,351,773,437,83)],cloth:[region(84,1170,87,319),region(863,1130,156,320)],color:'#ffd88c',motes:'embers',orb:[859,515,68]},
  noctis:{head:region(500,162,158,169),neck:[480,298],eyes:[eye(493,142,21,7,11),eye(547,162,19,7,12)],hair:[strand(405,212,333,354,208,461,73),strand(574,206,611,371,655,472,62)],cloth:[region(110,1120,105,330),region(898,1142,126,350)],color:'#b9abff',motes:'stars',orb:[863,330,70]},
  selene:{head:region(525,152,161,161),neck:[516,295],eyes:[eye(501,146,23,8,10),eye(563,165,21,8,13)],hair:[strand(402,216,385,321,444,472,54),strand(357,284,205,403,71,483,75)],cloth:[region(92,1089,89,331),region(690,1263,65,251)],color:'#a7d8ff',motes:'butterflies'},
  vesper:{head:region(517,153,171,180),neck:[489,310],eyes:[eye(510,132,22,7,16),eye(572,158,17,6,12)],hair:[strand(405,206,365,285,317,341,48),strand(593,69,652,122,612,245,47)],cloth:[region(83,1150,81,337),region(878,838,89,261)],color:'#f284a1',motes:'petals'},
  orion:{head:region(510,194,159,166),neck:[484,339],eyes:[eye(493,174,20,7,5),eye(552,196,18,7,12)],hair:[strand(415,208,401,307,375,351,45),strand(576,143,609,229,578,298,48)],cloth:[region(944,915,77,330),region(89,1114,83,266)],color:'#b8bbff',motes:'stars'},
  eirene:{head:region(501,217,158,165),neck:[500,350],eyes:[eye(475,202,22,8,9),eye(541,222,20,8,12)],hair:[strand(412,274,343,420,304,629,77),strand(593,263,681,494,903,576,94)],cloth:[region(72,1106,68,333),region(874,1212,140,305)],color:'#d8ebae',motes:'butterflies',orb:[927,581,45]},
  caelum:{head:region(512,218,143,169),neck:[496,339],eyes:[eye(507,206,18,6,7),eye(551,228,15,6,19)],hair:[strand(426,249,321,343,138,409,75),strand(554,258,598,352,529,497,49)],cloth:[region(75,1065,69,312),region(857,1103,159,314)],color:'#a2d9ff',motes:'stars',orb:[904,507,70]},
  seraphine:{head:region(520,181,157,181),neck:[499,329],eyes:[eye(484,153,22,8,9),eye(550,175,18,7,15)],hair:[strand(415,252,319,416,229,667,95),strand(587,286,699,461,687,679,85)],cloth:[region(104,1091,99,339),region(823,1097,115,360)],color:'#ff7898',motes:'petals'},
  ragnar:{head:region(527,216,147,147),neck:[514,349],eyes:[eye(527,201,19,6,17),eye(575,218,12,5,15)],hair:[strand(423,193,420,278,448,311,38),strand(592,162,640,173,615,249,38)],cloth:[region(831,1147,137,341),region(237,886,68,221)],color:'#ff9677',motes:'embers'},
  elysium:{head:region(510,220,171,179),neck:[493,369],eyes:[eye(483,216,25,9,10),eye(561,240,21,9,13)],hair:[strand(400,297,276,422,101,498,98),strand(595,305,636,413,735,531,67)],cloth:[region(85,1125,81,338),region(866,1163,143,335)],color:'#d0eaff',motes:'prism',orb:[687,476,47]}
 };
 Object.entries(profiles).forEach(([id,p])=>{p.id=id;p.neck=p.neck.map((n,i)=>n/(i?1536:1024));p.seed=[...id].reduce((s,c)=>s*1.13+c.charCodeAt(0),0);if(p.orb)p.orb=[p.orb[0]/1024,p.orb[1]/1536,p.orb[2]/1024];});
 const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
 const ease=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10);};
 const hash=n=>{const x=Math.sin(n*12.9898+78.233)*43758.5453;return x-Math.floor(x);};
 function noise(t,seed){const n=Math.floor(t),u=ease(t-n);return ((1-u)*hash(n+seed)+u*hash(n+1+seed))*2-1;}
 function blinkPulse(t){return t<0||t>.29?0:t<.075?ease(t/.075):t<.11?1:1-ease((t-.11)/.18);}
 function blinkAt(time,seed){
  const block=Math.floor(time/8),local=time-block*8,offset=1.2+hash(block+seed)*4.8;
  return Math.max(blinkPulse(local-offset),hash(block*3+seed)>.8?blinkPulse(local-offset-.4):0);
 }
 function sample(profile,time,pointer=[0,0]){
  const s=profile.seed;
  return {angle:noise(time/3.6,s)*.029+Math.sin(time*.9+s)*.009+clamp(pointer[0],-1,1)*.018,
   lean:noise(time/4.8,s+12)*.007+Math.sin(time*.75+s)*.003,headY:noise(time/4.1,s+51)*.0028+clamp(pointer[1],-1,1)*.0013,
   wind:noise(time/2.6,s+80)*.018+Math.sin(time*1.4+s)*.007,
   trail:noise((time-.65)/2.6,s+80)*.018+Math.sin(time*1.17+s)*.006,
   gesture:Math.sin(time*.8+s)*.028+noise(time/3.3,s+3)*.012,blink:blinkAt(time,s),time};
 }
 const api={profiles,sample,blinkAt,blinkPulse,noise,ease};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.EclipsePortraitMotion=api;
})(typeof globalThis!=='undefined'?globalThis:this);
