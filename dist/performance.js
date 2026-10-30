/** Local, conservative quality selection. No tracking, persistence or network calls. */
(()=>{
 const root=document.documentElement,nav=navigator;
 const memory=nav.deviceMemory||0,cores=nav.hardwareConcurrency||0;
 const compact=matchMedia('(pointer:coarse)').matches||matchMedia('(max-width:700px)').matches;
 const low=nav.connection?.saveData||(memory>0&&memory<=4)||(cores>0&&cores<=4);
 let level=low?0:compact||(memory>0&&memory<=8)||(cores>0&&cores<=8)?1:2;
 const subscribers=new Set();
 const publish=()=>{root.dataset.motionQuality=['light','balanced','full'][level];for(const listener of subscribers)listener(level)};
 window.MMMPerformance={get level(){return level},get pixelRatio(){return [1,1.25,1.5][level]},subscribe(fn){subscribers.add(fn);return()=>subscribers.delete(fn)}};
 publish();
 // Measure only while the visitor is moving the page, never during asset startup or a hidden tab.
 let raf=0,last=0,until=0,count=0,slow=0,elapsed=0,badWindows=0;
 const reset=()=>{last=0;count=0;slow=0;elapsed=0};
 const sample=now=>{
  raf=0;
  if(document.hidden||now>until||root.classList.contains('launch-active')||matchMedia('(prefers-reduced-motion: reduce)').matches){reset();return}
  if(last){const dt=now-last;if(dt<250){elapsed+=dt;count++;if(dt>29)slow++}}
  last=now;
  if(elapsed>=1600&&count>=25){
   const struggling=elapsed/count>25&&slow/count>.3;
   badWindows=struggling?badWindows+1:0;reset();
   if(badWindows>=2&&level>0){level--;badWindows=0;publish()}
  }
  if(level>0)raf=requestAnimationFrame(sample);
 };
 addEventListener('scroll',()=>{until=performance.now()+700;if(!raf&&level>0)raf=requestAnimationFrame(sample)},{passive:true});
 document.addEventListener('visibilitychange',()=>{root.classList.toggle('page-suspended',document.hidden);if(document.hidden){cancelAnimationFrame(raf);raf=0;reset()}});
})();
