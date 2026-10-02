(function(root){
 'use strict';
 // Landmarks are authored in the original 1024 × 1536 illustration, not card space.
 const eye=(x,y,rx,ry,angle=0)=>[x/1024,y/1536,rx/1024,ry/1536,angle*Math.PI/180];
 const region=(x,y,rx,ry)=>[x/1024,y/1536,rx/1024,ry/1536];
 const strand=(ax,ay,bx,by,cx,cy,width)=>[ax/1024,ay/1536,bx/1024,by/1536,cx/1024,cy/1536,width/1024];
 const profiles={
valeria:{head:region(503,167,145,165),neck:[503,299],eyes:[eye(468,164,20,7),eye(538,171,19,7)],hair:[strand(408,227,353,397,243,617,70),strand(598,227,673,397,783,597,70)],cloth:[region(140,1130,120,310),region(860,1110,120,320)],color:'#eb5475',motes:'stars'},
severin:{head:region(524,170,145,165),neck:[524,302],eyes:[eye(500,164,20,7),eye(548,177,19,7)],hair:[strand(429,230,374,400,264,620,70),strand(619,230,694,400,804,600,70)],cloth:[region(140,1130,120,310),region(860,1110,120,320)],color:'#f28c61',motes:'stars'},
morwen:{head:region(481,183,145,165),neck:[481,315],eyes:[eye(450,176,20,7),eye(513,190,19,7)],hair:[strand(386,243,331,413,221,633,70),strand(576,243,651,413,761,613,70)],cloth:[region(140,1130,120,310),region(860,1110,120,320)],color:'#ed6d97',motes:'stars'},
thalor:{head:region(530,222,145,165),neck:[530,354],eyes:[eye(506,215,20,7),eye(554,230,19,7)],hair:[strand(435,282,380,452,270,672,70),strand(625,282,700,452,810,652,70)],cloth:[region(140,1130,120,310),region(860,1110,120,320)],color:'#ed5774',motes:'stars'},
aevor:{head:region(495,157,145,165),neck:[495,289],eyes:[eye(468,162,20,7),eye(523,153,19,7)],hair:[strand(400,217,345,387,235,607,70),strand(590,217,665,387,775,587,70)],cloth:[region(140,1130,120,310),region(860,1110,120,320)],color:'#fb7778',motes:'stars'},
anamnesis:{head:region(471,220,145,165),neck:[471,352],eyes:[eye(442,215,20,7),eye(501,226,19,7)],hair:[strand(376,280,321,450,211,670,70),strand(566,280,641,450,751,650,70)],cloth:[region(140,1130,120,310),region(860,1110,120,320)],color:'#d3efff',motes:'stars'},
causalia:{head:region(521,187,145,165),neck:[521,319],eyes:[eye(492,180,20,7),eye(550,194,19,7)],hair:[strand(426,247,371,417,261,637,70),strand(616,247,691,417,801,617,70)],cloth:[region(140,1130,120,310),region(860,1110,120,320)],color:'#edceff',motes:'stars'},
nullion:{head:region(519,185,145,165),neck:[519,317],eyes:[eye(490,177,20,7),eye(549,194,19,7)],hair:[strand(424,245,369,415,259,635,70),strand(614,245,689,415,799,615,70)],cloth:[region(140,1130,120,310),region(860,1110,120,320)],color:'#bceef2',motes:'stars'},
  sirius:{head:region(493,210,150,168),neck:[489,342],eyes:[eye(466,202,21,7,17),eye(520,218,19,7,17)],hair:[strand(393,265,308,405,143,640,76),strand(588,250,668,400,813,610,80)],cloth:[region(104,1100,100,345),region(880,1140,138,340)],color:'#ffd98f',motes:'embers'},
  vega:{head:region(500,211,150,168),neck:[496,343],eyes:[eye(469,202,21,7,16),eye(530,219,19,7,16)],hair:[strand(400,266,315,406,150,641,76),strand(595,251,675,401,820,611,80)],cloth:[region(104,1100,100,345),region(880,1140,138,340)],color:'#cfa8ff',motes:'stars'},
  astreus:{head:region(522,201,150,168),neck:[518,333],eyes:[eye(490,190,21,7,19),eye(553,212,19,7,19)],hair:[strand(422,256,337,396,172,631,76),strand(617,241,697,391,842,601,80)],cloth:[region(104,1100,100,345),region(880,1140,138,340)],color:'#c4b4ff',motes:'stars'},
  solara:{head:region(517,223,150,168),neck:[513,355],eyes:[eye(486,216,21,7,12),eye(548,229,19,7,12)],hair:[strand(417,278,332,418,167,653,76),strand(612,263,692,413,837,623,80)],cloth:[region(104,1100,100,345),region(880,1140,138,340)],color:'#ffe08a',motes:'embers'},
  vireo:{head:region(517,209,150,168),neck:[513,341],eyes:[eye(486,201,21,7,14),eye(548,216,19,7,14)],hair:[strand(417,264,332,404,167,639,76),strand(612,249,692,399,837,609,80)],cloth:[region(104,1100,100,345),region(880,1140,138,340)],color:'#a8e6c0',motes:'butterflies'},
  nyx:{head:region(515,227,150,168),neck:[511,359],eyes:[eye(480,229,21,7,-4),eye(550,224,19,7,-4)],hair:[strand(415,282,330,422,165,657,76),strand(610,267,690,417,835,627,80)],cloth:[region(104,1100,100,345),region(880,1140,138,340)],color:'#e08bb0',motes:'stars'},
  fula:{head:region(496,209,150,168),neck:[492,341],eyes:[eye(464,202,21,7,12),eye(528,216,19,7,12)],hair:[strand(396,264,311,404,146,639,76),strand(591,249,671,399,816,609,80)],cloth:[region(104,1100,100,345),region(880,1140,138,340)],color:'#cdd6ff',motes:'stars'},
  eos:{head:region(483,225,150,168),neck:[479,357],eyes:[eye(447,219,21,7,9),eye(519,231,19,7,9)],hair:[strand(383,280,298,420,133,655,76),strand(578,265,658,415,803,625,80)],cloth:[region(104,1100,100,345),region(880,1140,138,340)],color:'#ffe2b0',motes:'butterflies'},
  mira:{head:region(510,256,150,168),neck:[506,388],eyes:[eye(472,244,21,7,17),eye(547,267,19,7,17)],hair:[strand(410,311,325,451,160,686,76),strand(605,296,685,446,830,656,80)],cloth:[region(104,1100,100,345),region(880,1140,138,340)],color:'#a9b8ff',motes:'stars'},
  maris:{head:region(505,205,150,168),neck:[501,337],eyes:[eye(474,210,21,7,-10),eye(535,199,19,7,-10)],hair:[strand(405,260,320,400,155,635,76),strand(600,245,680,395,825,605,80)],cloth:[region(104,1100,100,345),region(880,1140,138,340)],color:'#8fd4f2',motes:'stars'},
  helia:{head:region(504,235,150,168),neck:[500,367],eyes:[eye(469,227,21,7,13),eye(538,243,19,7,13)],hair:[strand(404,290,319,430,154,665,76),strand(599,275,679,425,824,635,80)],cloth:[region(104,1100,100,345),region(880,1140,138,340)],color:'#ffe8b8',motes:'butterflies'},
  themis:{head:region(506,221,150,168),neck:[502,353],eyes:[eye(477,211,21,7,18),eye(535,230,19,7,18)],hair:[strand(406,276,321,416,156,651,76),strand(601,261,681,411,826,621,80)],cloth:[region(104,1100,100,345),region(880,1140,138,340)],color:'#d8a8c0',motes:'stars'},
  vesna:{head:region(498,234,150,168),neck:[494,366],eyes:[eye(463,240,21,7,-10),eye(532,228,19,7,-10)],hair:[strand(398,289,313,429,148,664,76),strand(593,274,673,424,818,634,80)],cloth:[region(104,1100,100,345),region(880,1140,138,340)],color:'#cfe8c0',motes:'butterflies'},
  piscia:{head:region(512,246,150,168),neck:[508,378],eyes:[eye(475,237,21,7,13),eye(548,254,19,7,13)],hair:[strand(412,301,327,441,162,676,76),strand(607,286,687,436,832,646,80)],cloth:[region(104,1100,100,345),region(880,1140,138,340)],color:'#a0e8e8',motes:'stars'},
  selkis:{head:region(476,240,150,168),neck:[472,372],eyes:[eye(443,233,21,7,11),eye(509,246,19,7,11)],hair:[strand(376,295,291,435,126,670,76),strand(571,280,651,430,796,640,80)],cloth:[region(104,1100,100,345),region(880,1140,138,340)],color:'#98a8d0',motes:'butterflies'},
  aurora:{head:region(508,217,150,168),neck:[504,349],eyes:[eye(477,209,21,7,14),eye(539,225,19,7,14)],hair:[strand(408,272,323,412,158,647,76),strand(603,257,683,407,828,617,80)],cloth:[region(104,1100,100,345),region(880,1140,138,340)],color:'#b8e0f8',motes:'stars'},
  vallum:{head:region(526,207,150,168),neck:[522,339],eyes:[eye(503,196,21,7,25),eye(548,217,19,7,25)],hair:[strand(426,262,341,402,356,437,45),strand(621,247,701,397,671,432,44)],cloth:[region(104,1100,100,345),region(880,1140,138,340)],color:'#c0c8e0',motes:'stars'},
  deluge:{head:region(537,216,150,168),neck:[533,348],eyes:[eye(513,208,21,7,19),eye(560,224,19,7,19)],hair:[strand(437,271,352,411,187,646,76),strand(632,256,712,406,857,616,80)],cloth:[region(104,1100,100,345),region(880,1140,138,340)],color:'#88c8f0',motes:'stars'},
  somnus:{head:region(527,191,150,168),neck:[523,323],eyes:[eye(500,180,21,7,21),eye(554,201,19,7,21)],hair:[strand(427,246,342,386,177,621,76),strand(622,231,702,381,847,591,80)],cloth:[region(104,1100,100,345),region(880,1140,138,340)],color:'#a8b0e8',motes:'stars'},
  castor:{head:region(514,208,150,168),neck:[510,340],eyes:[eye(489,198,21,7,22),eye(539,218,19,7,22)],hair:[strand(414,263,329,403,344,438,45),strand(609,248,689,398,659,433,44)],cloth:[region(104,1100,100,345),region(880,1140,138,340)],color:'#e8d0a0',motes:'stars'},
  pollux:{head:region(510,220,150,168),neck:[506,352],eyes:[eye(482,212,21,7,16),eye(537,228,19,7,16)],hair:[strand(410,275,325,415,340,450,45),strand(605,260,685,410,655,445,44)],cloth:[region(104,1100,100,345),region(880,1140,138,340)],color:'#d8c0f0',motes:'stars'},
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
