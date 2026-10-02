(function(root){
 'use strict';
 const names=['初契','银线','流银','鎏金','曜紫','虹冕'];
 const level=value=>Number.isFinite(Number(value))?Math.max(0,Math.min(5,Math.floor(Number(value)))):0;
 function markup(value){
  const n=level(value);if(!n)return '';
  return `<span class="star-fx star-fx-${n}" data-star-fx="${n}" aria-hidden="true"><span class="star-fx-edge"></span>${n>=3?'<span class="star-fx-trim"></span>':''}${n>=2?'<span class="star-fx-glint"></span>':''}${n>=3?'<span class="star-fx-corners"><i></i><i></i><i></i><i></i></span>':''}</span>`;
 }
 const api={level,markup,names};if(typeof module!=='undefined'&&module.exports){module.exports=api;return;}root.EclipseStarFx=api;
 const visible=new Map(),reduce=matchMedia('(prefers-reduced-motion: reduce)');
 function sync(){const modal=document.querySelector('dialog[open]');for(const [el,inView]of visible)el.classList.toggle('star-fx-active',inView&&!document.hidden&&!reduce.matches&&(!modal||modal.contains(el)));}
 const observer=new IntersectionObserver(entries=>{for(const e of entries)visible.set(e.target,e.isIntersecting);sync();});
 function scan(){for(const el of visible.keys())if(!el.isConnected){observer.unobserve(el);visible.delete(el);}for(const el of document.querySelectorAll('[data-star-fx]'))if(!visible.has(el)){visible.set(el,false);observer.observe(el);}sync();}
 new MutationObserver(scan).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['open']});document.addEventListener('visibilitychange',sync);reduce.addEventListener('change',sync);scan();
})(typeof globalThis!=='undefined'?globalThis:this);
