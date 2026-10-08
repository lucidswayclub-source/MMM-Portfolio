/** Small procedural sound design, unlocked explicitly by the visitor. No audio downloads. */
export class IntroSound {
 constructor(){this.context=null;this.enabled=false;this.nodes=new Set();this.previous=0;this.cues=[{at:.1,type:'lens'},{at:.9,type:'click'},{at:1.35,type:'click'},{at:1.8,type:'click'},{at:2.35,type:'gather'},{at:4.25,type:'resolve'}];}
 async enable(time,autoplay=false){
  const Context=window.AudioContext||window.webkitAudioContext;if(!Context)return false;
  if(!this.context){this.context=new Context();this.master=this.context.createGain();this.master.gain.value=0;const compressor=this.context.createDynamicsCompressor();compressor.threshold.value=-12;compressor.ratio.value=3;this.master.connect(compressor);compressor.connect(this.context.destination);}
  if(autoplay&&this.context.state!=='running')return false;
  await this.context.resume();if(this.context.state!=='running')return false;
  this.enabled=true;this.previous=time;const now=this.context.currentTime;this.master.gain.cancelScheduledValues(now);this.master.gain.setTargetAtTime(.65,now,.035);
  this.tone(520,.18,.15,'sine',700);if(time<2.1){this.noise(time<.8?'lens':'gather');this.tone(130,.7,.12,'triangle',220);}return true;
 }
 track(node){this.nodes.add(node);node.onended=()=>{this.nodes.delete(node);node.disconnect()};return node;}
 tone(frequency,duration,volume,type='sine',endFrequency=frequency){
  const ctx=this.context,now=ctx.currentTime,osc=this.track(ctx.createOscillator()),gain=ctx.createGain();osc.type=type;osc.frequency.setValueAtTime(frequency,now);osc.frequency.exponentialRampToValueAtTime(endFrequency,now+duration);
  gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(volume,now+.012);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);osc.connect(gain);gain.connect(this.master);osc.start(now);osc.stop(now+duration+.03);osc.onended=()=>{this.nodes.delete(osc);osc.disconnect();gain.disconnect()};
 }
 noise(type){
  const ctx=this.context,duration=type==='lens'?1.15:type==='gather'?1.4:.08,now=ctx.currentTime,buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*duration),ctx.sampleRate),data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.7;
  const source=this.track(ctx.createBufferSource()),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=buffer;filter.type='bandpass';filter.Q.value=type==='click'?2:1.1;filter.frequency.setValueAtTime(type==='lens'?420:type==='gather'?250:1500,now);filter.frequency.exponentialRampToValueAtTime(type==='lens'?1150:type==='gather'?1800:850,now+duration);
  gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(type==='click'?.6:.5,now+Math.min(.18,duration*.2));gain.gain.exponentialRampToValueAtTime(.0001,now+duration);source.connect(filter);filter.connect(gain);gain.connect(this.master);source.start(now);source.stop(now+duration+.03);
  source.onended=()=>{this.nodes.delete(source);source.disconnect();filter.disconnect();gain.disconnect()};
 }
 update(time){
  if(!this.enabled||this.context?.state!=='running')return;
  for(const cue of this.cues)if(cue.at>this.previous&&cue.at<=time){
   if(cue.type==='resolve'){this.tone(440,.70,.22);this.tone(660,.95,.16);this.tone(880,.45,.07);}
   else{this.noise(cue.type);if(cue.type==='click')this.tone(2200,.07,.07,'sine',1100);}
  }
  this.previous=time;
 }
 mute(){this.enabled=false;if(!this.context)return;const now=this.context.currentTime;this.master.gain.cancelScheduledValues(now);this.master.gain.setTargetAtTime(0,now,.02);for(const node of this.nodes){try{node.stop(now+.08)}catch{}}}
 dispose(){this.mute();const ctx=this.context;if(ctx)setTimeout(()=>ctx.close().catch(()=>{}),160);}
}
