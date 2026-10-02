(function(root){
 'use strict';
 const styleOf=h=>h.rarity==='SSP'?'prism':h.rarity==='SP'?'crimson':'mythic';
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 // Playback only: rewards are committed by the caller before constructing a sequence.
 class Sequence {
  constructor(heroes,{onShow=()=>{},onReveal=()=>{},onDone=()=>{},schedule=(fn,ms)=>setTimeout(fn,ms),cancel=id=>clearTimeout(id),reducedMotion=false}={}){
   this.heroes=heroes.filter(h=>['UR','SP','SSP'].includes(h.rarity));this.onShow=onShow;this.onReveal=onReveal;this.onDone=onDone;this.schedule=schedule;this.cancel=cancel;this.reducedMotion=reducedMotion;this.index=-1;this.timers=[];this.active=false;this.started=false;
  }
  start(){if(this.started)return;this.started=true;this.active=true;this.advance();}
  clear(){this.timers.forEach(t=>this.cancel(t));this.timers=[];}
  advance(){if(!this.active)return;this.clear();this.index++;if(this.index>=this.heroes.length){this.finish();return;}
   const h=this.heroes[this.index],kind=styleOf(h),charge=this.reducedMotion?0:kind==='prism'?1700:kind==='crimson'?1400:1100;
   this.onShow(h,this.index,this.heroes.length);
   this.timers.push(this.schedule(()=>{if(this.active)this.onReveal(h);},charge));
   this.timers.push(this.schedule(()=>this.advance(),charge+(this.reducedMotion?2200:3800)));
  }
  finish(){if(!this.active)return;this.active=false;this.clear();this.onDone();}
  dispose(){this.active=false;this.clear();}
 }
 function markup(h,index,total){
  const kind=styleOf(h),prism=kind==='prism',sp=h.rarity==='SP',name=prism?'万象初光':sp?'绯红降临':'神话降临';
  return `<section class="summon-theater ${kind}" data-phase="charge" aria-label="${name}召唤演出">
   <div class="cinema-toolbar"><span>${prism?'IRIDESCENT ORIGIN · SSP':sp?'BEYOND MYTH · SP':'MYTHIC CONTRACT · UR'}<small>${index+1} / ${total}</small></span><button class="cinema-skip" data-action="skip-summon">跳过演出 →</button></div>
   <div class="cinema-nebula" aria-hidden="true"></div><div class="cinema-halo" aria-hidden="true"></div><div class="cinema-ring ring-one" aria-hidden="true"></div><div class="cinema-ring ring-two" aria-hidden="true"></div>
   <div class="cinema-particles" aria-hidden="true">${Array.from({length:22},(_,i)=>`<i style="--n:${i};--x:${(i*37+13)%100}%;--y:${(i*23+7)%100}%"></i>`).join('')}</div>
   <div class="cinema-seal" aria-hidden="true"><span>✧</span><small>${prism?'光谱正在重构':sp?'绯红封印正在解除':'星门正在开启'}</small></div>
   <div class="cinema-portrait"><span class="portrait" role="img" aria-label="${escape(h.title+'·'+h.name)}" ${h.video?'':`data-living="${h.rarity}"`} data-live-hero="${h.id}" data-live-art="assets/heroes/${escape(h.art)}.png" style="background-image:url(assets/heroes/${escape(h.art)}.png)">${h.video?`<video class="portrait-video" muted loop playsinline preload="none" data-video-src="${escape(h.video)}" aria-hidden="true"></video>`:''}</span><div class="cinema-art-shade"></div></div>
   <div class="cinema-copy"><p class="cinema-edition">${prism?'IRIDESCENT · ORIGIN':sp?'CRIMSON · SOVEREIGN':'CELESTIAL · MYTHIC'}</p><div class="cinema-rarity">${h.rarity}<span>${prism?'炫光 · 唯一初光':sp?'绯红 · 超越神话':'神话 · 群星回应'}</span></div><p class="cinema-title">${escape(h.title)}</p><h2>${escape(h.name)}</h2><p class="cinema-english">${escape(h.english)}</p><blockquote>“${escape(h.quote)}”</blockquote><div class="cinema-skill"><small>契约之力 · ${h.cost} AP</small><strong>✧ ${escape(h.skill)}</strong><span>${escape(h.role)}</span></div></div>
   <div class="cinema-footer"><span>${prism?'十万分之一的光，此刻与你相遇。':sp?'万分之一的命运，为你解开封印。':'群星之中，你们终于相遇。'}</span><button class="btn" data-action="next-summon" disabled>${index+1===total?'查看全部结果':'下一份契约'} →</button></div><div class="cinema-progress" aria-hidden="true"></div>
  </section>`;
 }
 const api={Sequence,markup,styleOf};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.EclipseSummon=api;
})(typeof globalThis!=='undefined'?globalThis:this);
