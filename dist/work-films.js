const section=document.querySelector('.work-video-section');
if(section){
 const films=[...section.querySelectorAll('video')],button=section.querySelector('.work-films-toggle');
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 let userPaused=preference.matches,visible=false,blocked=false;
 function update(){
  const paused=userPaused||document.documentElement.classList.contains('motion-disabled');
  section.toggleAttribute('data-paused',paused);section.toggleAttribute('data-offscreen',!visible||document.hidden);
  button.setAttribute('aria-pressed',String(paused));
  button.textContent=paused||blocked?'Play films ▷':'Pause films Ⅱ';
  for(const film of films){
   if(!paused&&visible&&!document.hidden){
    if(!film.src){film.src=film.dataset.filmSrc;film.load()}
    film.muted=true;
    film.play().catch(()=>{blocked=true;button.textContent='Play films ▷'});
   }else film.pause();
  }
 }
 button.addEventListener('click',()=>{if(blocked){blocked=false;userPaused=false}else userPaused=!userPaused;update()});
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;update()},{threshold:.05}).observe(section);
 new MutationObserver(update).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
 document.addEventListener('visibilitychange',update);
 preference.addEventListener('change',()=>{userPaused=preference.matches;update()});
 update();
}
