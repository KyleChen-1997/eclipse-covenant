import * as THREE from 'three';
import {mergeGeometries} from './vendor/three/addons/utils/BufferGeometryUtils.js';
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const faceTexture=new THREE.TextureLoader().load('assets/characters/face-albedo-v8.png');faceTexture.colorSpace=THREE.SRGBColorSpace;
// Art direction follows each card's hair, silhouette, metalwork and signature prop.
export const HERO_LOOKS={
valeria:{"hair": "#44212e", "cloth": "#eb5475", "dark": "#251b30", "metal": "#c6b28c", "gem": "#eb5475", "long": false, "male": false, "robe": true, "crown": "star", "prop": "scepter"},
severin:{"hair": "#dfd3b8", "cloth": "#f28c61", "dark": "#251b30", "metal": "#c6b28c", "gem": "#f28c61", "long": false, "male": true, "robe": true, "crown": "star", "prop": "orb"},
morwen:{"hair": "#20182c", "cloth": "#ed6d97", "dark": "#251b30", "metal": "#c6b28c", "gem": "#ed6d97", "long": true, "male": false, "robe": true, "crown": "star", "prop": "lantern"},
thalor:{"hair": "#235857", "cloth": "#ed5774", "dark": "#251b30", "metal": "#c6b28c", "gem": "#ed5774", "long": true, "male": true, "robe": true, "crown": "star", "prop": "spear"},
aevor:{"hair": "#dddce8", "cloth": "#fb7778", "dark": "#251b30", "metal": "#c6b28c", "gem": "#fb7778", "long": false, "male": true, "robe": true, "crown": "star", "prop": "greatsword"},
anamnesis:{"hair": "#eff0f5", "cloth": "#d9d1e4", "dark": "#251b30", "metal": "#c6b28c", "gem": "#d3efff", "long": true, "male": false, "robe": true, "crown": "star", "prop": "orb", "wings": "prism"},
causalia:{"hair": "#756090", "cloth": "#d9d1e4", "dark": "#251b30", "metal": "#c6b28c", "gem": "#edceff", "long": true, "male": false, "robe": true, "crown": "star", "prop": "scepter", "wings": "prism"},
nullion:{"hair": "#eee5dd", "cloth": "#d9d1e4", "dark": "#251b30", "metal": "#c6b28c", "gem": "#bceef2", "long": true, "male": true, "robe": true, "crown": "star", "prop": "orb", "wings": "prism"},
 astra:{hair:'#d2c7e4',cloth:'#242031',dark:'#16131e',metal:'#c8af79',gem:'#bc9cfa',robe:true,long:true,crown:'star',prop:'orb',wings:'dark'},
 aurelia:{hair:'#f0d79e',cloth:'#d0ba83',dark:'#423223',metal:'#deb866',gem:'#ffd68a',robe:true,long:true,crown:'sun',prop:'scepter',wings:'gold'},
 noctis:{hair:'#262333',cloth:'#241c38',dark:'#111722',metal:'#b5aec9',gem:'#b897ed',male:true,long:true,crown:'moon',prop:'clock',robe:true},
 caelum:{hair:'#18243b',cloth:'#243b62',dark:'#151e2e',metal:'#b9ccdf',gem:'#97d8ff',male:true,long:true,crown:'dragon',prop:'spear',coat:true},
 selene:{hair:'#c4d1e1',cloth:'#253851',dark:'#121f30',metal:'#bccbe0',gem:'#addbff',long:true,crown:'moon',prop:'shield',coat:true},
 vesper:{hair:'#402338',cloth:'#2b1627',dark:'#150f1b',metal:'#aa8290',gem:'#ed7399',male:true,crown:'rose',prop:'rapier',robe:true},
 orion:{hair:'#242236',cloth:'#1e223b',dark:'#111626',metal:'#9696b5',gem:'#aaabff',male:true,crown:'star',prop:'sword',coat:true},
 eirene:{hair:'#ded4ac',cloth:'#e7e3c8',dark:'#61725b',metal:'#cdbb83',gem:'#cbebb8',long:true,robe:true,crown:'sun',prop:'scepter'},
 seraphine:{hair:'#dac4cf',cloth:'#541a34',dark:'#240c20',metal:'#caa393',gem:'#f24975',long:true,robe:true,crown:'rose',prop:'scepter',wings:'red'},
 ragnar:{hair:'#362322',cloth:'#442120',dark:'#20141a',metal:'#b39173',gem:'#fb8865',male:true,crown:'sun',prop:'greatsword',coat:true},
 elysium:{hair:'#eee5dd',cloth:'#d9d1db',dark:'#68617e',metal:'#d4bc98',gem:'#b0eefa',long:true,robe:true,crown:'star',prop:'orb',wings:'prism'},
 milo:{hair:'#554535',cloth:'#4d6f62',dark:'#263b35',metal:'#9e9574',gem:'#cee5aa',male:true,robe:true,prop:'lantern'},
 lark:{hair:'#493d38',cloth:'#3b695d',dark:'#233c3c',metal:'#b5a784',gem:'#b9e4d5',prop:'bow'},
 scarlet:{hair:'#9e383e',cloth:'#6b2f3f',dark:'#291f30',metal:'#bb9c77',gem:'#ff9c7b',long:true,robe:true,prop:'scissors'},
 bran:{hair:'#49382e',cloth:'#565156',dark:'#2a2e32',metal:'#9d8970',gem:'#d8bd91',male:true,prop:'shield'},
 flora:{hair:'#947252',cloth:'#bdd1a1',dark:'#345744',metal:'#bdb889',gem:'#a7e6b8',long:true,robe:true,prop:'scepter'},
 nix:{hair:'#b5c4d6',cloth:'#3c5574',dark:'#23334b',metal:'#b4ccdb',gem:'#a5e6ef',male:true,prop:'bow'},
 finch:{hair:'#ad733f',cloth:'#947955',dark:'#413934',metal:'#c4ac79',gem:'#b8e2dd',prop:'lantern'},
 quill:{hair:'#796443',cloth:'#8e7e59',dark:'#484838',metal:'#bbaa7c',gem:'#dbe4b2',male:true,prop:'bow'},
 lyra:{hair:'#9ab9c5',cloth:'#81b8c4',dark:'#344c70',metal:'#c8d6d9',gem:'#a5eeee',long:true,robe:true,prop:'scepter'},
 tessa:{hair:'#343d3f',cloth:'#b4c6a7',dark:'#36554d',metal:'#a0b594',gem:'#a8eed2',long:true,robe:true,prop:'lantern'},
 rune:{hair:'#bbcdd6',cloth:'#607fa3',dark:'#293b60',metal:'#b5cbdb',gem:'#baebff',male:true,robe:true,prop:'scepter'},
 ignis:{hair:'#b95242',cloth:'#69392f',dark:'#352328',metal:'#c5956e',gem:'#ffa683',long:true,prop:'spear'},
 pero:{hair:'#6b5a44',cloth:'#7a6a52',dark:'#3a332a',metal:'#9d8a68',gem:'#d8c091',male:true,prop:'shield'},
 wren:{hair:'#7d6a4f',cloth:'#5d7a68',dark:'#2c3a33',metal:'#b3a37c',gem:'#9fd8c9',prop:'bow'},
 keres:{hair:'#a3543a',cloth:'#6e3a2c',dark:'#33202a',metal:'#c08a5e',gem:'#ffb27a',long:true,robe:true,prop:'scepter'},
 vireo:{hair:'#8fae8a',cloth:'#4e6b52',dark:'#26382c',metal:'#b8bd8d',gem:'#a8e6c0',male:true,long:true,robe:true,prop:'scepter'},
 sirius:{hair:'#e8d8a8',cloth:'#2c3550',dark:'#141c2e',metal:'#d8bd7e',gem:'#ffd98f',male:true,long:true,robe:true,crown:'star',prop:'scepter',wings:'gold'},
 moss:{hair:'#5d6b4a',cloth:'#4a5d3e',dark:'#26301f',metal:'#9aa07a',gem:'#9ed6a0',male:true,robe:true,prop:'lantern'},
 mistral:{hair:'#b8cfe0',cloth:'#4a6a80',dark:'#223442',metal:'#b0c8d8',gem:'#a9d9f2',long:true,robe:true,prop:'scepter'},
 cinder:{hair:'#4a3a35',cloth:'#5d3a30',dark:'#2a1d20',metal:'#b08a6a',gem:'#ff9d76',male:true,coat:true,prop:'greatsword'},
 nyx:{hair:'#6a4a5e',cloth:'#3a2438',dark:'#1c1220',metal:'#a88aa0',gem:'#e08bb0',long:true,robe:true,crown:'rose',prop:'scepter'},
 vega:{hair:'#d8c8e8',cloth:'#3a2c50',dark:'#1a1428',metal:'#c0a8d8',gem:'#cfa8ff',long:true,robe:true,crown:'star',prop:'orb',wings:'dark'},
 tam:{hair:'#8a6a3a',cloth:'#6a5a3a',dark:'#332c1e',metal:'#c4a86a',gem:'#e6c37f',male:true,prop:'greatsword'},
 sela:{hair:'#9a8ac0',cloth:'#4a4468',dark:'#242038',metal:'#b0a8d0',gem:'#d8c6ff',long:true,prop:'bow'},
 bront:{hair:'#5a5470',cloth:'#3a3654',dark:'#1c1a2c',metal:'#9a94c0',gem:'#b7a8ff',male:true,coat:true,prop:'greatsword'},
 fula:{hair:'#c8cfe8',cloth:'#343a5c',dark:'#181c30',metal:'#b8c0e0',gem:'#cdd6ff',long:true,coat:true,prop:'spear'},
 astreus:{hair:'#3a3450',cloth:'#2a2440',dark:'#141226',metal:'#b0a8cc',gem:'#c4b4ff',male:true,long:true,robe:true,crown:'moon',prop:'clock'},
 lumit:{hair:'#d8b888',cloth:'#7a6248',dark:'#3a3026',metal:'#c0a878',gem:'#f2d9a0',long:true,robe:true,prop:'lantern'},
 gale:{hair:'#7aa08a',cloth:'#4a6a58',dark:'#24342c',metal:'#a8c0a8',gem:'#bfe3d0',male:true,prop:'bow'},
 sable:{hair:'#3a2c44',cloth:'#2c2038',dark:'#161020',metal:'#9a86b0',gem:'#b48fd6',long:true,coat:true,prop:'rapier'},
 eos:{hair:'#f0d8b0',cloth:'#8a6a4a',dark:'#4a3826',metal:'#d8b888',gem:'#ffe2b0',long:true,robe:true,crown:'sun',prop:'scepter'},
 solara:{hair:'#f8e0a8',cloth:'#7a5a30',dark:'#3a2c18',metal:'#e8c878',gem:'#ffe08a',long:true,crown:'sun',prop:'spear',wings:'gold'},
 bram:{hair:'#6a5a48',cloth:'#5a5648',dark:'#2c2a24',metal:'#a89878',gem:'#cbb490',male:true,prop:'shield'},
 iris:{hair:'#9ac8c0',cloth:'#4a7a74',dark:'#24403c',metal:'#a8c8c0',gem:'#9fe8e0',long:true,robe:true,prop:'scepter'},
 ferro:{hair:'#7a8090',cloth:'#4a5060',dark:'#242832',metal:'#b0b8c8',gem:'#b9c4d6',male:true,coat:true,prop:'shield'},
 mira:{hair:'#c0b0e0',cloth:'#3c3860',dark:'#1c1a34',metal:'#b0a8d8',gem:'#a9b8ff',long:true,robe:true,crown:'star',prop:'orb'},
 suzu:{hair:'#c8a868',cloth:'#7a6844',dark:'#3a3222',metal:'#c8b078',gem:'#e8cf9a',prop:'orb'},
 dune:{hair:'#8a7050',cloth:'#6a5a40',dark:'#342c20',metal:'#b09868',gem:'#d8c090',male:true,prop:'bow'},
 coral:{hair:'#e0a8a0',cloth:'#4a7a6a',dark:'#24403a',metal:'#a8c8b8',gem:'#9fe0cf',long:true,robe:true,prop:'scepter'},
 petra:{hair:'#7a6252',cloth:'#6a5648',dark:'#342a24',metal:'#b09878',gem:'#d0b8a0',long:true,coat:true,prop:'shield'},
 maris:{hair:'#90b8d0',cloth:'#2c4a60',dark:'#142836',metal:'#a8c0d8',gem:'#8fd4f2',male:true,long:true,robe:true,crown:'moon',prop:'scepter'},
 fen:{hair:'#a06848',cloth:'#5a4434',dark:'#2c221c',metal:'#b08860',gem:'#ffb08a',prop:'lantern'},
 hana:{hair:'#b8d090',cloth:'#5a7048',dark:'#2c3824',metal:'#b0c090',gem:'#cfe8a8',long:true,robe:true,prop:'scepter'},
 boreal:{hair:'#c0e0ea',cloth:'#3a5a6a',dark:'#1c3038',metal:'#a8c8d8',gem:'#a8e4f0',male:true,coat:true,prop:'bow'},
 solis:{hair:'#e0a060',cloth:'#7a4a28',dark:'#3a2416',metal:'#d0a060',gem:'#ffc07a',male:true,robe:true,crown:'sun',prop:'scepter'},
 helia:{hair:'#f8e8c0',cloth:'#8a7048',dark:'#4a3c26',metal:'#e0c890',gem:'#ffe8b8',long:true,robe:true,crown:'sun',prop:'scepter'},
 kipp:{hair:'#907858',cloth:'#6a5840',dark:'#342c20',metal:'#b8a070',gem:'#e2c58e',male:true,prop:'orb'},
 vera:{hair:'#706858',cloth:'#585448',dark:'#2c2a24',metal:'#a8a090',gem:'#c8c0a8',long:true,prop:'shield'},
 lynx:{hair:'#a8b890',cloth:'#4a5838',dark:'#262c1c',metal:'#b0c098',gem:'#c9d8a8',male:true,coat:true,prop:'bow'},
 aeolus:{hair:'#b0d0e0',cloth:'#3a5868',dark:'#1c2c34',metal:'#a8c8d8',gem:'#b0d8e8',male:true,long:true,robe:true,prop:'scepter'},
 themis:{hair:'#d0a8b8',cloth:'#58384a',dark:'#2c1c26',metal:'#c0a0b0',gem:'#d8a8c0',long:true,robe:true,crown:'rose',prop:'rapier'},
 odo:{hair:'#607060',cloth:'#48584a',dark:'#242c26',metal:'#a0b0a0',gem:'#b8d8c0',male:true,robe:true,prop:'lantern'},
 cassia:{hair:'#8aa070',cloth:'#50684a',dark:'#283426',metal:'#a8b890',gem:'#b8e0b0',long:true,robe:true,prop:'scepter'},
 rhoda:{hair:'#c0a878',cloth:'#685838',dark:'#342c1c',metal:'#c0b080',gem:'#d0e0a0',long:true,prop:'bow'},
 cirus:{hair:'#8898c0',cloth:'#3c4868',dark:'#1e2434',metal:'#a8b8d8',gem:'#b8c8e8',male:true,coat:true,prop:'spear'},
 vesna:{hair:'#c8e0b0',cloth:'#587048',dark:'#2c3824',metal:'#b8c898',gem:'#cfe8c0',long:true,robe:true,crown:'star',prop:'scepter'},
 tarn:{hair:'#7898b0',cloth:'#34505e',dark:'#1a2830',metal:'#a0b8c8',gem:'#9fd0e8',male:true,robe:true,prop:'scepter'},
 ario:{hair:'#8a7858',cloth:'#5c5240',dark:'#2e2920',metal:'#b0a078',gem:'#d0bc98',male:true,prop:'shield'},
 libre:{hair:'#b0a080',cloth:'#585040',dark:'#2c2820',metal:'#c0b090',gem:'#e0d0a8',long:true,robe:true,prop:'scepter'},
 skor:{hair:'#904838',cloth:'#582820',dark:'#2c1410',metal:'#c07858',gem:'#ff9a80',male:true,coat:true,prop:'spear'},
 piscia:{hair:'#90d0d0',cloth:'#386868',dark:'#1c3434',metal:'#a0c8c8',gem:'#a0e8e8',long:true,robe:true,crown:'moon',prop:'scepter'},
 capri:{hair:'#786850',cloth:'#54483a',dark:'#2a241e',metal:'#a89878',gem:'#d8c8a0',male:true,prop:'greatsword'},
 vele:{hair:'#586858',cloth:'#405048',dark:'#202824',metal:'#98a898',gem:'#b0c8b8',male:true,robe:true,prop:'lantern'},
 corvus:{hair:'#383c48',cloth:'#282c38',dark:'#14161e',metal:'#8890a8',gem:'#a8b0c8',male:true,coat:true,prop:'bow'},
 moro:{hair:'#584068',cloth:'#342444',dark:'#1a1224',metal:'#9880b0',gem:'#b890c8',male:true,coat:true,prop:'rapier'},
 selkis:{hair:'#687898',cloth:'#303c58',dark:'#181e2c',metal:'#98a8c8',gem:'#98a8d0',long:true,coat:true,crown:'moon',prop:'shield'},
 wisp:{hair:'#b088d0',cloth:'#483858',dark:'#241c2c',metal:'#a890c0',gem:'#d8a0f0',prop:'lantern'},
 flint:{hair:'#685040',cloth:'#4c3c30',dark:'#261e18',metal:'#a88868',gem:'#ffb890',male:true,prop:'lantern'},
 aura:{hair:'#e8d0a8',cloth:'#786848',dark:'#3c3424',metal:'#d0c098',gem:'#f0e0b8',long:true,robe:true,prop:'scepter'},
 luce:{hair:'#c0e0f0',cloth:'#406878',dark:'#20343c',metal:'#a8c8d8',gem:'#c8e8f8',male:true,robe:true,prop:'scepter'},
 aurora:{hair:'#b8e0f0',cloth:'#385868',dark:'#1c2c34',metal:'#a8c8d8',gem:'#b8e0f8',long:true,robe:true,crown:'star',prop:'orb'},
 lumen:{hair:'#d8c090',cloth:'#685838',dark:'#342c1c',metal:'#c8b078',gem:'#f8e8c0',male:true,robe:true,prop:'lantern'},
 garde:{hair:'#686058',cloth:'#504c46',dark:'#282624',metal:'#a09888',gem:'#c0b8a8',male:true,prop:'shield'},
 velli:{hair:'#98a0a8',cloth:'#485058',dark:'#24282c',metal:'#b0b8c0',gem:'#c8d0d8',long:true,prop:'shield'},
 egide:{hair:'#8090b0',cloth:'#38445c',dark:'#1c222e',metal:'#a8b8d0',gem:'#b0c0e0',male:true,robe:true,crown:'star',prop:'shield'},
 vallum:{hair:'#585c70',cloth:'#34384c',dark:'#1a1c26',metal:'#a0a8c0',gem:'#c0c8e0',male:true,coat:true,prop:'greatsword'},
 rikka:{hair:'#a0a878',cloth:'#505838',dark:'#282c1c',metal:'#b8c090',gem:'#d0d8b0',long:true,prop:'bow'},
 brook:{hair:'#78a8a0',cloth:'#406058',dark:'#20302c',metal:'#98b8b0',gem:'#a8d8d0',male:true,robe:true,prop:'lantern'},
 falla:{hair:'#88c8c0',cloth:'#386860',dark:'#1c3430',metal:'#98c0b8',gem:'#98e0d8',long:true,robe:true,prop:'scepter'},
 undine:{hair:'#80c0d8',cloth:'#306070',dark:'#183038',metal:'#98c0d0',gem:'#90d8e8',long:true,prop:'spear'},
 deluge:{hair:'#78a8d0',cloth:'#2c4c68',dark:'#162634',metal:'#98b8d0',gem:'#88c8f0',male:true,long:true,robe:true,crown:'moon',prop:'scepter'},
 vapor:{hair:'#98b8c8',cloth:'#405868',dark:'#202c34',metal:'#a0b8c8',gem:'#b0d0e0',male:true,coat:true,prop:'rapier'},
 yume:{hair:'#a898c8',cloth:'#484060',dark:'#242030',metal:'#a898c0',gem:'#c8b8e0',long:true,robe:true,prop:'lantern'},
 lull:{hair:'#8890c0',cloth:'#383c58',dark:'#1c1e2c',metal:'#9898c0',gem:'#b8c0e8',male:true,robe:true,prop:'scepter'},
 oneira:{hair:'#b098d8',cloth:'#443860',dark:'#221c30',metal:'#b0a0d0',gem:'#c0a8e8',long:true,robe:true,crown:'moon',prop:'orb'},
 somnus:{hair:'#7880b0',cloth:'#303450',dark:'#181a28',metal:'#9898c0',gem:'#a8b0e8',male:true,long:true,robe:true,crown:'moon',prop:'clock'},
 somnia:{hair:'#b8a8e0',cloth:'#484068',dark:'#242034',metal:'#b0a8d8',gem:'#c8b8f0',long:true,robe:true,prop:'scepter'},
 castor:{hair:'#d8c090',cloth:'#685838',dark:'#342c1c',metal:'#d0b878',gem:'#e8d0a0',male:true,coat:true,prop:'greatsword'},
 pollux:{hair:'#b8a0d8',cloth:'#483858',dark:'#241c2c',metal:'#b8a0d0',gem:'#d8c0f0',male:true,coat:true,prop:'spear'}
};
const skinMat=new THREE.MeshPhysicalMaterial({color:'#d9aa95',roughness:.74,metalness:0,clearcoat:.1});
const eyeWhite=new THREE.MeshStandardMaterial({color:'#ddd7d2',roughness:.4});
const black=new THREE.MeshStandardMaterial({color:'#201823',roughness:.5});
function clothTexture(base,trim){const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');g.fillStyle=base;g.fillRect(0,0,512,512);g.strokeStyle=trim;g.lineWidth=1.4;g.globalAlpha=.35;for(let y=0;y<512;y+=64)for(let x=0;x<512;x+=64){g.beginPath();g.moveTo(x,y+32);g.bezierCurveTo(x+38,y+5,x+28,y+60,x+64,y+32);g.stroke();g.beginPath();g.arc(x+32,y+32,9,0,Math.PI*2);g.stroke();}g.globalAlpha=.8;g.lineWidth=2.6;for(let x=24;x<512;x+=64){g.beginPath();g.moveTo(x,0);g.bezierCurveTo(x+21,150,x-21,350,x,512);g.stroke();for(let y=24;y<512;y+=64){g.save();g.translate(x,y);g.rotate(Math.PI/4);g.strokeRect(-7,-7,14,14);g.restore();}}g.globalAlpha=.13;g.strokeStyle='#fff';g.lineWidth=.5;for(let y=0;y<512;y+=4){g.beginPath();g.moveTo(0,y);g.lineTo(512,y);g.stroke();}const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(2,2);return texture;}
function tube(points,radius,mat,parent){const curve=new THREE.CatmullRomCurve3(points.map(p=>V(...p))),mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,20,radius,7,false),mat);parent.add(mesh);mesh.castShadow=true;return mesh;}
export class HeroAvatar{
 constructor(unit,core){
  this.skinMat=skinMat.clone();this.eyeWhite=eyeWhite.clone();this.black=black.clone();this.u=unit;this.look=HERO_LOOKS[unit.data.id]||HERO_LOOKS.milo;const p=this.look;this.bones={};unit.rig.traverse(o=>{if(o.isBone)this.bones[o.name.replace(/[^a-z]/gi,'').toLowerCase()]=o;if(o.isMesh)o.visible=false;});
  this.root=new THREE.Group();this.root.name='TailoredAvatar-'+unit.data.id;unit.root.add(this.root);this.links=[];this.sways=[];this.rank=core.rankOf(core.hero(unit.data.id));
  this.texture=clothTexture(p.cloth,p.metal);this.silk=new THREE.MeshPhysicalMaterial({map:this.texture,roughness:.69,metalness:.08,sheen:1,sheenColor:new THREE.Color(p.cloth),side:THREE.DoubleSide});this.dark=new THREE.MeshStandardMaterial({color:p.dark,roughness:.65,metalness:.12});this.gold=new THREE.MeshStandardMaterial({color:p.metal,metalness:.75,roughness:.38});this.hair=new THREE.MeshPhysicalMaterial({color:p.hair,roughness:.48,metalness:.12,sheen:1});this.gem=new THREE.MeshPhysicalMaterial({color:p.gem,emissive:p.gem,emissiveIntensity:.32,metalness:.25,roughness:.13,clearcoat:1});
  const limb=(a,b,r1,r2,mat)=>{const mesh=this.mesh(new THREE.CylinderGeometry(r2,r1,1,14,4),mat);if(p.robe&&a.includes('leg'))mesh.visible=false;this.links.push({mesh,a,b});return mesh;};
  this.torso=this.sphere(this.silk,[p.male?.27:.235,.32,.13]);this.waist=this.sphere(this.dark,[p.male?.225:.18,.18,.135]);this.hips=this.sphere(this.silk,[p.male?.245:.255,.18,.16]);
  for(const side of ['l','r']){
   limb('upperarm'+side,'lowerarm'+side,.083,.065,this.silk);limb('lowerarm'+side,'fist'+side,.075,.05,this.dark);limb('upperleg'+side,'lowerleg'+side,.125,.088,this.dark);limb('lowerleg'+side,'foot'+side,.10,.065,this.dark);
   const shoulder=this.sphere(this.gold,[.115,.052,.135]);this.links.push({mesh:shoulder,joint:'upperarm'+side,offset:V(0,.005,0)});
   const hand=this.sphere(this.skinMat,[.052,.075,.048]);this.links.push({mesh:hand,joint:'fist'+side,offset:V(0,-.015,.012)});for(let i=0;i<4;i++){const finger=this.sphere(this.skinMat,[.011,.033,.012],hand,V((i-1.5)*.021,-.049,.027));finger.scale.divide(hand.scale);finger.position.divide(hand.scale);} 
   const knee=this.sphere(this.gold,[.078,.085,.055]);knee.visible=!p.robe;this.links.push({mesh:knee,joint:'lowerleg'+side,offset:V(0,0,.045)});
   const boot=this.sphere(this.dark,[.082,.068,.155]);this.links.push({mesh:boot,joint:'foot'+side,offset:V(0,.025,.065)});
  }
  this.belt=this.mesh(new THREE.TorusGeometry(p.male?.238:.202,.026,8,40),this.gold);this.belt.rotation.x=Math.PI/2;
  this.brooch=this.mesh(new THREE.OctahedronGeometry(.075,1),this.gem);
  this.collar=new THREE.Group();this.root.add(this.collar);const collar=this.mesh(new THREE.CylinderGeometry(.082,.14,.15,32,1,true),this.dark,this.collar);collar.position.y=-.02;for(const y of [-.09,.052]){const trim=this.mesh(new THREE.TorusGeometry(y<0?.14:.082,.006,6,32),this.gold,this.collar);trim.rotation.x=Math.PI/2;trim.position.y=y;}this.chestTrim=new THREE.Group();this.root.add(this.chestTrim);for(const sign of [-1,1]){tube([[0,-.13,.165],[sign*.11,-.04,.182],[sign*.2,.12,.12]],.012,this.gold,this.chestTrim);for(let i=0;i<3;i++){const chain=this.mesh(new THREE.TorusGeometry(.12+i*.018,.0035,5,36,Math.PI),this.gold,this.chestTrim);chain.position.set(sign*.11,-i*.028,.15);chain.rotation.z=Math.PI;}}
  this.head=new THREE.Group();this.root.add(this.head);this.makeHead();this.makeClothes();this.makeProp();for(const group of [this.head,this.skirt,this.chestTrim,this.collar,this.prop,this.shield,this.wings])if(group)this.mergeStatic(group);this.update(0);
  const headBone=this.bones.head;if(headBone){const rotation=headBone.getWorldQuaternion(new THREE.Quaternion());this.headOffset=rotation.invert().multiply(this.head.getWorldQuaternion(new THREE.Quaternion()));}const hand=this.bones.fistr;if(hand)this.propOffset=hand.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(this.prop.getWorldQuaternion(new THREE.Quaternion()));
 }
 mergeStatic(group){
  const batches=new Map();group.updateMatrixWorld(true);for(const child of [...group.children]){if(!child.isMesh||child.children.length||this.sways.some(s=>s.mesh===child))continue;child.updateMatrix();const geo=child.geometry.index?child.geometry.toNonIndexed():child.geometry.clone();geo.applyMatrix4(child.matrix);if(!batches.has(child.material))batches.set(child.material,[]);batches.get(child.material).push(geo);child.geometry.dispose();group.remove(child);}
  for(const [mat,geos] of batches){const merged=mergeGeometries(geos,false);if(merged)this.mesh(merged,mat,group);geos.forEach(g=>g.dispose());}
 }
 mesh(geo,mat,parent=this.root){const mesh=new THREE.Mesh(geo,mat);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 sphere(mat,scale,parent=this.root,pos=V()){const mesh=this.mesh(new THREE.SphereGeometry(1,24,18),mat,parent);mesh.scale.set(...scale);mesh.position.copy(pos);return mesh;}
 joint(id){const bone=this.bones[id];if(!bone)return V(0,1,0);return this.u.root.worldToLocal(bone.getWorldPosition(V()));}
 makeHead(){
  const p=this.look;this.sphere(this.skinMat,[p.male?.16:.148,.225,.127],this.head,V(0,0,-.02));this.sphere(this.skinMat,[.062,.077,.058],this.head,V(0,-.205,-.006));
  const vertices=[],uvs=[],indices=[],nx=48,ny=56,rx=p.male?.161:.151;
  const gauss=(x,y,a,b,sx,sy)=>Math.exp(-(((x-a)/sx)**2+((y-b)/sy)**2));
  for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){
   const u=i/nx,v=j/ny,y=(.5-v)*.465,round=Math.sqrt(Math.max(.005,1-(y/.24)**2)),angle=(u-.5)*Math.PI;
   const jaw=v>.65?1-(v-.65)*.20:1;
   let z=Math.cos(angle)*.145*round;
   z+=.026*gauss(u,v,.5,.60,.055,.04)+.019*gauss(u,v,.5,.47,.032,.14)+.005*gauss(u,v,.5,.76,.15,.04);
   z-=.007*(gauss(u,v,.30,.36,.095,.035)+gauss(u,v,.70,.36,.095,.035));
   vertices.push(Math.sin(angle)*rx*round*jaw,y,z);uvs.push((u+(p.male?1:0))*.5,1-v);
   if(j<ny&&i<nx){const n=j*(nx+1)+i;indices.push(n,n+nx+1,n+1,n+1,n+nx+1,n+nx+2);}
  }
  const faceGeo=new THREE.BufferGeometry();faceGeo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));faceGeo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));faceGeo.setIndex(indices);faceGeo.computeVertexNormals();
  this.faceMap=faceTexture.clone();const faceMat=new THREE.MeshPhysicalMaterial({map:this.faceMap,roughness:.76,metalness:0,clearcoat:.05});this.mesh(faceGeo,faceMat,this.head);
  for(const sign of [-1,1]){this.sphere(this.skinMat,[.021,.049,.024],this.head,V(sign*.15,.003,0));const earring=this.mesh(new THREE.TorusGeometry(.025,.004,6,18),this.gold,this.head);earring.position.set(sign*.16,-.067,.006);const drop=this.mesh(new THREE.OctahedronGeometry(.018),this.gem,this.head);drop.position.set(sign*.16,-.11,.006);}
  // Scalp plus individually curved, tapered locks; silhouettes differ from the job-class rigs.
  const cap=this.mesh(new THREE.SphereGeometry(1,28,20,0,Math.PI*2,0,Math.PI*.51),this.hair,this.head);const hairPos=cap.geometry.attributes.position;for(let i=0;i<hairPos.count;i++){const z=hairPos.getZ(i),y=hairPos.getY(i);if(z>0&&y<.47)hairPos.setY(i,.47);}cap.geometry.computeVertexNormals();cap.scale.set(.167,.245,.151);cap.position.y=.015;
  for(let i=0;i<19;i++){
   const a=Math.PI*.1+i/18*Math.PI*1.8,x=Math.cos(a)*.139,z=-Math.sin(a)*.139,front=z>.04,length=p.long?.61+(i%4)*.055:.14+(i%4)*.012;
   if(front&&Math.abs(x)<.115)continue;
   const lock=tube([[x*.7,.18,z*.7],[x*1.12,.01,z],[x*1.25+(i%2?.04:-.02),-.18,z-.025],[x*1.2,-length,z-.04]],p.long?.034:.03,this.hair,this.head);this.sways.push({mesh:lock,seed:i,amount:p.long?.045:.012});
  }
  for(const sign of [-1,1])tube([[sign*.025,.21,.04],[sign*.105,.15,.142],[sign*.153,.035,.11],[sign*.159,-.18,.08]],.024,this.hair,this.head);
  if(p.crown){
   const band=this.mesh(new THREE.TorusGeometry(.164,.007,8,48,Math.PI*1.6),this.gold,this.head);band.rotation.x=Math.PI/2;band.rotation.z=-Math.PI*.3;band.position.y=.15;
   for(let i=-3;i<=3;i++){const a=i*.34,x=Math.sin(a)*.161,z=Math.cos(a)*.145,height=(i===0?.17:.10)+Math.abs(i)*.008;const spike=this.mesh(new THREE.ConeGeometry(.025,height,4),this.gold,this.head);spike.position.set(x,.21+height*.2,z);spike.rotation.z=-i*.13;const stone=this.mesh(new THREE.OctahedronGeometry(i===0?.027:.016,0),this.gem,this.head);stone.position.set(x,.27+height*.5,z);}
  }
 }
 makeClothes(){
  const p=this.look;this.skirt=new THREE.Group();this.root.add(this.skirt);
  if(p.robe){
   const points=[];for(let i=0;i<=18;i++){const t=i/18;points.push(new THREE.Vector2(.235+.23*t+.06*Math.sin(t*Math.PI),-t*1.13));}const dress=this.mesh(new THREE.LatheGeometry(points,48),this.silk,this.skirt);dress.scale.z=.83;
   for(let i=0;i<12;i++){const a=i/12*Math.PI*2;const ribbon=tube([[Math.cos(a)*.252,0,Math.sin(a)*.198],[Math.cos(a)*.375,-.55,Math.sin(a)*.312],[Math.cos(a)*.465,-1.13,Math.sin(a)*.386]],.007,this.gold,this.skirt);ribbon.name='GoldEmbroidery';}
   const hem=this.mesh(new THREE.TorusGeometry(.465,.012,8,64),this.gold,this.skirt);hem.rotation.x=Math.PI/2;hem.scale.y=.83;hem.position.y=-1.13;
  }
  if(p.coat){for(const sign of [-1,1]){const geo=new THREE.PlaneGeometry(.25,.83,8,14),v=geo.attributes.position;for(let i=0;i<v.count;i++){const t=(.415-v.getY(i))/.83;v.setXYZ(i,v.getX(i)*(1+t*.7),v.getY(i),Math.sin(t*Math.PI)*.035);}geo.computeVertexNormals();const panel=this.mesh(geo,this.silk,this.skirt);panel.position.set(sign*.21,-.48,.15);panel.rotation.y=sign*.55;panel.rotation.z=sign*.12;tube([[sign*.08,-.08,.16],[sign*.14,-.5,.19],[sign*.19,-.9,.14]],.009,this.gold,this.skirt);}}
  this.cape=new THREE.Group();this.root.add(this.cape);const geometry=new THREE.PlaneGeometry(.78,1.35,18,24),pos=geometry.attributes.position;
  for(let i=0;i<pos.count;i++){const y=pos.getY(i),t=(.675-y)/1.35;pos.setXYZ(i,pos.getX(i)*(1+t*.45),y,-.1-Math.sin(t*Math.PI)*.08-Math.cos(pos.getX(i)*19)*.025*t);}geometry.computeVertexNormals();this.capeMesh=this.mesh(geometry,this.dark.clone(),this.cape);this.capeMesh.material.side=THREE.DoubleSide;this.capeMesh.position.set(0,-.57,-.16);
  if(p.wings){this.wings=new THREE.Group();this.root.add(this.wings);const shades=p.wings==='prism'?['#e3cee6','#cbe4ec','#e8dfba']:p.wings==='dark'?['#332a47','#66547a','#9c86bc']:p.wings==='red'?['#64243d','#9b4960','#ba8392']:['#cfad63','#e2c988','#eddeb6'];for(const sign of [-1,1])for(let i=0;i<9;i++){const mat=new THREE.MeshStandardMaterial({color:shades[i%3],metalness:.45,roughness:.48});const feather=this.sphere(mat,[.045,.39-i*.013,.018],this.wings,V(sign*(.24+i*.074),i*.082,-.13-i*.013));feather.rotation.z=sign*(-.55-i*.07);}}
 }
 makeProp(){
  this.prop=new THREE.Group();this.root.add(this.prop);const type=this.look.prop,metal=this.gold;
  if(['orb','clock','lantern'].includes(type)){
   const core=this.mesh(new THREE.SphereGeometry(type==='orb'?.12:.085,24,20),this.gem,this.prop);core.position.y=.13;
   for(const a of [0,1,2]){const ring=this.mesh(new THREE.TorusGeometry(.18+a*.017,.007,6,48),metal,this.prop);ring.position.y=.13;ring.rotation.set(a*.7,a*.9,.4);}
  }else if(type==='bow'){
   tube([[0,-.55,0],[.13,-.30,0],[.21,0,0],[.13,.3,0],[0,.55,0]],.025,metal,this.prop);tube([[0,-.55,0],[.035,0,0],[0,.55,0]],.003,this.eyeWhite,this.prop);
  }else{
   const staff=type==='scepter'||type==='spear',length=type==='greatsword'?1.28:staff?1.5:.9;
   const grip=this.mesh(new THREE.CylinderGeometry(.025,.026,staff?length:.25,12),this.dark,this.prop);grip.position.y=staff?.3:-.1;
   if(staff){const tip=this.mesh(new THREE.OctahedronGeometry(.12,1),this.gem,this.prop);tip.scale.y=1.7;tip.position.y=1.08;for(const y of [-.4,.42,.89]){const band=this.mesh(new THREE.TorusGeometry(.039,.008,6,24),metal,this.prop);band.rotation.x=Math.PI/2;band.position.y=y;}const crest=this.mesh(new THREE.TorusGeometry(.17,.013,7,40),metal,this.prop);crest.position.y=1.05;}
   else{const blade=new THREE.Shape();blade.moveTo(-.045,0);blade.lineTo(-.045,length*.8);blade.lineTo(0,length);blade.lineTo(.045,length*.8);blade.lineTo(.045,0);const sword=this.mesh(new THREE.ExtrudeGeometry(blade,{depth:.015,bevelEnabled:true,bevelSize:.006,bevelThickness:.006,bevelSegments:2,steps:1}),metal,this.prop);sword.position.y=.035;const cross=this.mesh(new THREE.BoxGeometry(.28,.035,.05),metal,this.prop);cross.position.y=.04;this.sphere(this.gem,[.027,.034,.027],this.prop,V(0,-.22,0));}
  }
  if(type==='shield'){
   this.shield=new THREE.Group();this.root.add(this.shield);const plate=this.mesh(new THREE.SphereGeometry(.32,32,24),this.gold,this.shield);plate.scale.set(1,1.5,.17);const inset=this.mesh(new THREE.SphereGeometry(.285,28,20),this.dark,this.shield);inset.scale.set(1,1.5,.18);inset.position.z=.03;const star=this.mesh(new THREE.OctahedronGeometry(.095),this.gem,this.shield);star.scale.y=1.5;star.position.z=.10;for(let i=0;i<8;i++){const a=i*Math.PI/4;this.sphere(this.gold,[.018,.018,.012],this.shield,V(Math.sin(a)*.29,Math.cos(a)*.43,.08));}
  }
 }
 update(time){
  const u=this.u;u.root.updateWorldMatrix(true,true);const hips=this.joint('hips'),torso=this.joint('torso'),neck=this.joint('neck'),head=this.joint('head');const left=this.joint('upperarml'),right=this.joint('upperarmr');
  const x=left.clone().sub(right).normalize(),y=neck.clone().sub(hips).normalize(),z=x.clone().cross(y).normalize();x.copy(y).cross(z).normalize();const orientation=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x,y,z));
  this.torso.position.copy(hips).lerp(neck,.57);this.torso.quaternion.copy(orientation);this.waist.position.copy(hips).lerp(neck,.18);this.waist.quaternion.copy(orientation);this.hips.position.copy(hips);this.hips.quaternion.copy(orientation);
  for(const l of this.links){if(l.joint){l.mesh.position.copy(this.joint(l.joint)).add(l.offset.clone().applyQuaternion(orientation));l.mesh.quaternion.copy(orientation);}else{const a=this.joint(l.a),b=this.joint(l.b),dir=b.clone().sub(a);l.mesh.position.copy(a).lerp(b,.5);l.mesh.scale.y=dir.length();l.mesh.quaternion.setFromUnitVectors(V(0,1,0),dir.normalize());}}
  this.belt.position.copy(hips).lerp(neck,.22);this.belt.quaternion.copy(orientation).multiply(new THREE.Quaternion().setFromAxisAngle(V(1,0,0),Math.PI/2));
  this.brooch.position.copy(this.torso.position).add(V(0,.13,.18).applyQuaternion(orientation));this.brooch.quaternion.copy(orientation);this.chestTrim.position.copy(this.torso.position);this.chestTrim.quaternion.copy(orientation);this.collar.position.copy(neck).add(V(0,-.025,0).applyQuaternion(orientation));this.collar.quaternion.copy(orientation);
  this.head.position.copy(head).add(V(0,.075,.007).applyQuaternion(orientation));this.head.quaternion.copy(orientation);if(this.headOffset){const world=this.bones.head.getWorldQuaternion(new THREE.Quaternion()).multiply(this.headOffset);this.head.quaternion.copy(u.root.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(world));}
  for(const sway of this.sways)sway.mesh.rotation.z=Math.sin(time*1.7+sway.seed*.45)*sway.amount;
  this.skirt.position.copy(hips);this.skirt.quaternion.copy(orientation);this.skirt.rotation.z+=Math.sin(time*1.3)*.025;
  this.cape.position.copy(neck).add(V(0,-.06,-.06).applyQuaternion(orientation));this.cape.quaternion.copy(orientation);this.cape.rotation.x+=Math.sin(time*1.4)*.055;this.cape.rotation.z+=Math.sin(time*.8)*.025;
  if(this.wings){this.wings.position.copy(torso).add(V(0,.15,-.16).applyQuaternion(orientation));this.wings.quaternion.copy(orientation);this.wings.scale.x=1+Math.sin(time*.9)*.04;}
  const orb=['orb','clock','lantern'].includes(this.look.prop);this.prop.position.copy(this.joint(orb?'fistl':'fistr'));this.prop.quaternion.copy(orientation);if(orb)this.prop.position.add(V(0,.10+Math.sin(time*1.3)*.025,.08).applyQuaternion(orientation));else if(this.propOffset){const world=this.bones.fistr.getWorldQuaternion(new THREE.Quaternion()).multiply(this.propOffset);this.prop.quaternion.copy(u.root.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(world));}else this.prop.rotateX(-.15);
  if(this.shield){this.shield.position.copy(this.joint('fistl')).add(V(0,.08,.12).applyQuaternion(orientation));this.shield.quaternion.copy(orientation);}
 }
 dispose(){this.texture.dispose();this.faceMap?.dispose();}
}
