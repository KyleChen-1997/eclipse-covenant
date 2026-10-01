// Loaded only by the isolated fault-injection test iframe. Storage is entirely
// in memory in this document; the parent's real LocalStorage remains untouched.
(()=>{
  const state=EclipseCore.freshState();state.tickets=12000;state.clears=[0];state.dungeonClears=[0];
  let saved=JSON.stringify(state),writes=0;window.fixtureFailure='';
  Storage.prototype.getItem=function(){return saved;};
  Storage.prototype.setItem=function(key,value){
    if(window.fixtureFailure==='save'){
      const s=JSON.parse(saved);parent.postMessage({fixtureReport:`保存失败已拦截 · 已存星契 ${s.tickets} · 累计召唤 ${s.pulls} · 成功写入 ${writes} 次`},'*');
      throw new DOMException('Test quota exceeded','QuotaExceededError');
    }
    saved=value;writes++;const s=JSON.parse(saved);
    parent.postMessage({fixtureReport:`保存成功 · 星契 ${s.tickets} · 累计召唤 ${s.pulls} · 装备 ${EclipseCore.Inventory.count(s)} · 写入 ${writes} 次`},'*');
  };
  const RealWorker=window.Worker;
  window.Worker=class extends RealWorker{
    constructor(...args){if(window.fixtureFailure==='worker')throw new Error('测试 Worker 启动失败，资源未变化。');super(...args);}
  };
})();
