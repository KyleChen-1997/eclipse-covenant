(function(root){
  'use strict';
  // A single cancellable playback clock drives the fight and its animations.
  class BattlePlayer {
    constructor({battle,step,onStep=()=>{},onFinish=()=>{},onState=()=>{},clock=()=>performance.now(),setTimer=(fn,ms)=>setTimeout(fn,ms),clearTimer=id=>clearTimeout(id)}) {
      Object.assign(this,{battle,step,onStep,onFinish,onState,clock,setTimer,clearTimer});
      this.speed=1;this.paused=false;this.blocked=false;this.stopped=false;this.finished=false;this.timer=null;this.remaining=350;this.startedAt=0;this.iterations=0;
    }
    get running(){return !this.stopped&&!this.finished&&!this.paused&&!this.blocked;}
    freezeClock(){if(this.timer!==null){this.remaining=Math.max(0,this.remaining-(this.clock()-this.startedAt)*this.speed);this.clearTimer(this.timer);this.timer=null;}}
    schedule(){if(!this.running||this.timer!==null)return;this.startedAt=this.clock();this.timer=this.setTimer(()=>{this.timer=null;this.tick();},this.remaining/this.speed);}
    tick(){
      if(!this.running)return;
      if(['win','lose'].includes(this.battle.phase)){this.finish();return;}
      const result=this.step(this.battle);this.iterations++;
      if(result.error||this.iterations>2000){this.battle.phase='lose';this.finish();return;}
      this.onStep(result.event);
      this.remaining=result.event?.ultimate?2100:result.event?.kind==='round'?700:result.event?.label==='防御'?650:1150;
      this.schedule();
    }
    start(){this.schedule();this.onState(this);}
    setPaused(value){this.freezeClock();this.paused=!!value;this.schedule();this.onState(this);}
    setBlocked(value){this.freezeClock();this.blocked=!!value;this.schedule();this.onState(this);}
    setSpeed(value){if(![1,2,4].includes(value))return;this.freezeClock();this.speed=value;this.schedule();this.onState(this);}
    skip(){
      if(this.stopped||this.finished)return;this.freezeClock();
      for(let i=0;i<2000&&!['win','lose'].includes(this.battle.phase);i++){const r=this.step(this.battle);if(r.error){this.battle.phase='lose';break;}}
      if(!['win','lose'].includes(this.battle.phase))this.battle.phase='lose';
      this.onStep(null);this.finish();
    }
    finish(){if(this.finished||this.stopped)return;this.freezeClock();this.finished=true;this.onFinish(this.battle);this.onState(this);}
    stop(){this.freezeClock();this.stopped=true;this.onState(this);}
  }
  if(typeof module!=='undefined'&&module.exports)module.exports=BattlePlayer;else root.BattlePlayer=BattlePlayer;
})(typeof globalThis!=='undefined'?globalThis:this);
