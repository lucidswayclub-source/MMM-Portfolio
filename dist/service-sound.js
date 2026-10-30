/** Automatic mechanical dial cues, unlocked by the first normal user interaction. */
export class ServiceDialSound {
 constructor(scene=null){
  this.scene=scene;this.enabled=false;this.context=null;this.lastCue=-Infinity;this.step=null;this.nodes=new Set();this.unlockTask=null;
  if(!(window.AudioContext||window.webkitAudioContext))return;
  const unlock=()=>this.unlock();
  document.addEventListener('pointerdown',unlock,{passive:true});
  document.addEventListener('touchend',unlock,{passive:true});
  document.addEventListener('click',unlock,{passive:true});
  document.addEventListener('keydown',unlock);
  window.addEventListener('mmm:launch-finished',()=>{if(window.navigator?.userActivation?.hasBeenActive)this.unlock()});
  if(scene){this.observer=new IntersectionObserver(entries=>{this.visible=entries.some(entry=>entry.isIntersecting);if(!this.visible)this.stop('dial')},{threshold:.05});this.observer.observe(scene);}
  document.addEventListener('visibilitychange',()=>{if(document.hidden){this.enabled=false;this.stop();this.context?.suspend().catch(()=>{})}else if(this.context)this.unlock()});
 }
 unlock(){
  if(document.hidden)return Promise.resolve(false);
  if(this.enabled&&this.context?.state==='running')return Promise.resolve(true);
  if(this.unlockTask){
   // A resume requested outside an accepted gesture may remain pending on Safari.
   // Retry inside the new gesture instead of waiting forever on that request.
   this.context?.resume().catch(()=>{});return this.unlockTask;
  }
  this.unlockTask=(async()=>{
   try{
    const Context=window.AudioContext||window.webkitAudioContext;
    if(!Context)return false;
    if(!this.context){this.context=new Context();this.output=this.context.createGain();this.output.gain.value=.65;this.output.connect(this.context.destination);
     this.noise=this.context.createBuffer(1,Math.ceil(this.context.sampleRate*.3),this.context.sampleRate);
     const data=this.noise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.7;
    }
    await this.context.resume();this.enabled=this.context.state==='running';return this.enabled;
   }catch{this.enabled=false;return false}finally{this.unlockTask=null}
  })();
  return this.unlockTask;
 }
 update(position,settled=false){
  const step=Math.round(position*6),changed=this.step!==null&&step!==this.step;this.step=step;
  if(changed||settled)this.cue(settled);
 }
 ready(){return this.enabled&&this.context?.state==='running'&&!document.hidden&&this.nodes.size<8&&!document.documentElement.classList.contains('launch-active')&&!document.documentElement.classList.contains('cinematic-navigation')}
 cue(settled=false){
  const ctx=this.context;
  if(!this.ready()||!this.visible)return;
  const now=ctx.currentTime;if(now-this.lastCue<(settled?.14:.095))return;this.lastCue=now;
  const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=this.noise;source.cueKind='dial';filter.type='bandpass';filter.frequency.value=settled?1450:2100;filter.Q.value=1.1;
  const duration=settled?.075:.035;gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(settled?.85:.4,now+.003);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
  source.connect(filter);filter.connect(gain);gain.connect(this.output);this.nodes.add(source);
  source.onended=()=>{this.nodes.delete(source);source.disconnect();filter.disconnect();gain.disconnect()};source.start(now);source.stop(now+duration);
 }
 stop(kind=null){for(const node of [...this.nodes]){if(kind&&node.cueKind!==kind)continue;try{node.stop()}catch{}this.nodes.delete(node)}}
}

let siteSound=null;
export function getSiteSound(scene=null){if(!siteSound)siteSound=new ServiceDialSound(scene);return siteSound}
