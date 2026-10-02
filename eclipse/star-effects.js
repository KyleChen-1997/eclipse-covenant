(function(root){
 'use strict';
 const names=['初契','初醒','流辉','星环','圣翼','神冠'];
 const level=value=>Number.isFinite(Number(value))?Math.max(0,Math.min(5,Math.floor(Number(value)))):0;
 function markup(value){
  const n=level(value);if(!n)return '';
  const sparks=n>=2?Array.from({length:n*2},(_,i)=>`<i style="--x:${i%2?91-(i*7)%12:6+(i*7)%12}%;--y:${20+(i*19)%70}%;--delay:${-i*.7}s"></i>`).join(''):'';
  return `<span class="star-fx star-fx-${n}" data-star-fx="${n}" aria-hidden="true"><span class="star-fx-edge"></span>${n>=2?`<span class="star-fx-sparks">${sparks}</span>`:''}${n>=3?'<span class="star-fx-orbit"></span>':''}${n>=4?'<svg class="star-fx-wings" viewBox="0 0 240 110" fill="none"><path d="M112 83C75 86 35 65 9 12L31 29 22 5 55 33 46 11 79 45 76 23 112 71M128 83C165 86 205 65 231 12L209 29 218 5 185 33 194 11 161 45 164 23 128 71"/><path d="M15 25Q52 82 105 79M225 25Q188 82 135 79M30 16Q67 67 105 72M210 16Q173 67 135 72"/></svg>':''}${n===5?'<span class="star-fx-aurora"></span><span class="star-fx-crown">♛</span><span class="star-fx-runes">✧ · ✦ · ✧</span>':''}<span class="star-fx-label">${'✦'.repeat(n)}<small>${names[n]}</small></span></span>`;
 }
 const api={level,markup,names};if(typeof module!=='undefined'&&module.exports){module.exports=api;return;}root.EclipseStarFx=api;
 const visible=new Map(),reduce=matchMedia('(prefers-reduced-motion: reduce)');
 function sync(){const modal=document.querySelector('dialog[open]');for(const [el,inView]of visible)el.classList.toggle('star-fx-active',inView&&!document.hidden&&!reduce.matches&&(!modal||modal.contains(el)));}
 const observer=new IntersectionObserver(entries=>{for(const e of entries)visible.set(e.target,e.isIntersecting);sync();});
 function scan(){for(const el of visible.keys())if(!el.isConnected){observer.unobserve(el);visible.delete(el);}for(const el of document.querySelectorAll('[data-star-fx]'))if(!visible.has(el)){visible.set(el,false);observer.observe(el);}sync();}
 new MutationObserver(scan).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['open']});document.addEventListener('visibilitychange',sync);reduce.addEventListener('change',sync);scan();
})(typeof globalThis!=='undefined'?globalThis:this);
