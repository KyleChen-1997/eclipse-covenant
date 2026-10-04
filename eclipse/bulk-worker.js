'use strict';
importScripts('roster.js?v=15','progression.js?v=15','gear-system.js?v=15','inventory.js?v=15','story.js?v=15','portrait-videos.js?v=15','covenant-data.js?v=15','covenant-skills.js?v=15','covenant-engine.js?v=15','core.js?v=15');
self.onmessage=({data})=>{
  try{
    const {state,type,args}=data;
    const result=type==='sweep'?EclipseCore.sweep(state,args.stage,args.count,Math.random,args.mode,(done,total)=>self.postMessage({progress:done/total})):EclipseCore.draw(state,args.count);
    self.postMessage({state,result});
  }catch(error){self.postMessage({error:error.message||'结算失败，请重试。'});}
};
