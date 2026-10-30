const section=document.querySelector('.work-video-section');
if(section){
 const films=[...section.querySelectorAll('video')],button=section.querySelector('.work-films-toggle'),viewport=section.querySelector('.work-films-viewport'),track=section.querySelector('.work-films-track'),group=section.querySelector('.work-films-group');
 const compact=matchMedia('(max-width:700px)'),quality=()=>window.MMMPerformance?.level??2;
 const preference=matchMedia('(prefers-reduced-motion: reduce)'),nearby=new Set(),exposure=new Map(),starting=new Set();
 let userPaused=preference.matches,visible=false,blocked=false,motionPaused=document.documentElement.classList.contains('motion-disabled');
 let frame=0,lastTime=0,position=0,period=0;
 const canDrift=()=>!userPaused&&!motionPaused&&!preference.matches&&visible&&!document.hidden&&period>0;
 function stopDrift(){cancelAnimationFrame(frame);frame=0;lastTime=0}
 function tick(now){
  frame=0;if(!canDrift()){lastTime=0;return}
  if(lastTime){const dt=Math.min(80,now-lastTime),speed=compact.matches?46:55;position=(position+dt*speed/1000)%period;}
  lastTime=now;track.style.transform=`translate3d(${-position}px,0,0)`;
  frame=requestAnimationFrame(tick);
 }
 function syncDrift(){if(canDrift()){if(!frame)frame=requestAnimationFrame(tick)}else stopDrift()}
 function measure(){const next=group.offsetWidth;if(next>0){position=period?position/period*next:0;period=next;}syncDrift()}
 new ResizeObserver(measure).observe(group);measure();
 function update(){
  syncDrift();
  const paused=userPaused||motionPaused;
  section.toggleAttribute('data-paused',paused);section.toggleAttribute('data-offscreen',!visible||document.hidden);
  button.setAttribute('aria-pressed',String(paused));button.textContent=paused||blocked?'Play films ▷':'Pause films Ⅱ';
  const budget=[1,2,4][quality()],playing=new Set([...nearby].sort((a,b)=>(exposure.get(b)||0)-(exposure.get(a)||0)).slice(0,budget));
  for(const film of films){
   if(!paused&&visible&&!document.hidden&&playing.has(film)){
    if(!film.src){film.src=(compact.matches||quality()<2)&&film.dataset.filmMobile?film.dataset.filmMobile:film.dataset.filmSrc;film.load()}
    film.muted=true;
    if(film.paused&&!starting.has(film)){
     starting.add(film);
     film.play().catch(error=>{if(error.name!=='AbortError'&&visible&&!document.hidden&&nearby.has(film)){blocked=true;button.textContent='Play films ▷'}}).finally(()=>starting.delete(film));
    }
   }else if(!film.paused||starting.has(film))film.pause();
  }
 }
 button.addEventListener('click',()=>{if(blocked){blocked=false;userPaused=false}else userPaused=!userPaused;update()});
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;update()},{threshold:0}).observe(section);
 // Decode only films in or immediately approaching the viewport, not all eight copies.
 const filmObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){nearby.add(entry.target);exposure.set(entry.target,entry.intersectionRatio||0)}else{nearby.delete(entry.target);exposure.delete(entry.target)}}update()},{root:viewport,rootMargin:'0px',threshold:[0,.25,.75]});
 films.forEach(film=>filmObserver.observe(film));
 new MutationObserver(()=>{const next=document.documentElement.classList.contains('motion-disabled');if(next!==motionPaused){motionPaused=next;update()}}).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
 window.MMMPerformance?.subscribe(update);
 document.addEventListener('visibilitychange',update);
 preference.addEventListener('change',()=>{userPaused=preference.matches;update()});
 update();
}
