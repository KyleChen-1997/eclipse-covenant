(() => {
  'use strict';
  const videos=new Map(),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  function sync(video){const visible=videos.get(video),modal=document.querySelector('dialog[open]');if(!visible||document.hidden||reduced.matches||(modal&&!modal.contains(video))){video.pause();return;}if(!video.src){video.muted=true;video.src=video.dataset.videoSrc;}video.play().catch(()=>{});}
  const observer=new IntersectionObserver(entries=>{for(const entry of entries){videos.set(entry.target,entry.isIntersecting);sync(entry.target);}});
  function scan(){for(const [video]of videos)if(!video.isConnected){observer.unobserve(video);videos.delete(video);video.pause();video.removeAttribute('src');video.load();}for(const video of document.querySelectorAll('video[data-video-src]'))if(!videos.has(video)){videos.set(video,false);video.addEventListener('playing',()=>video.classList.add('is-playing'));video.addEventListener('error',()=>video.classList.remove('is-playing'));observer.observe(video);}for(const video of videos.keys())sync(video);}
  new MutationObserver(scan).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['open']});
  document.addEventListener('visibilitychange',scan);document.addEventListener('pointerdown',()=>{for(const video of videos.keys())sync(video);},{passive:true});reduced.addEventListener('change',()=>{for(const video of videos.keys()){video.classList.toggle('is-playing',!reduced.matches&&video.readyState>=2);sync(video);}});scan();
})();
