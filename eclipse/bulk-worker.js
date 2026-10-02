'use strict';
importScripts('roster.js','progression.js','gear-system.js','inventory.js','story.js','core.js');
self.onmessage=({data})=>{
  try{
    const {state,type,args}=data;
    const result=type==='sweep'?EclipseCore.sweep(state,args.stage,args.count,Math.random,args.mode,(done,total)=>self.postMessage({progress:done/total})):EclipseCore.draw(state,args.count);
    self.postMessage({state,result});
  }catch(error){self.postMessage({error:error.message||'结算失败，请重试。'});}
};
