/** Native motion layer for the pulled MMM site. One scroll coordinator, no scroll hijack. */
const $=(s,root=document)=>root.querySelector(s),$$=(s,root=document)=>[...root.querySelectorAll(s)];
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const mobile=()=>matchMedia('(max-width:700px)').matches;
let disabled=reduced.matches,frame=0;
const scenes=new Set(),active=new Set();
const observer=new IntersectionObserver(entries=>{for(const e of entries){e.target.classList.toggle('in-view',e.isIntersecting);for(const scene of scenes)if(scene.el===e.target){if(e.isIntersecting)active.add(scene);else active.delete(scene)}}schedule()},{rootMargin:'10% 0px'});
function add(scene){scenes.add(scene);observer.observe(scene.el);scene.resize?.();return scene}
function schedule(){if(!disabled&&!frame&&!document.hidden)frame=requestAnimationFrame(render)}
function render(){frame=0;const measured=[...active].map(s=>[s,s.el.getBoundingClientRect()]);for(const [scene,r]of measured)scene.update(r)}
addEventListener('scroll',schedule,{passive:true});
addEventListener('resize',()=>{scenes.forEach(s=>s.resize?.());schedule()},{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0}else schedule()});
function setDisabled(value){disabled=value;document.documentElement.classList.toggle('motion-disabled',value);if(value){cancelAnimationFrame(frame);frame=0;scenes.forEach(s=>s.reset?.());document.getAnimations().forEach(a=>{try{a.finish()}catch{a.cancel()}})}else{scenes.forEach(s=>s.resize?.());schedule()}}
reduced.addEventListener('change',()=>{setDisabled(reduced.matches);updateToggle()});
// Reveals are viewport driven and settle once. The final layout never depends on animation.
document.documentElement.classList.add('motion-ready');
const revealObserver=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){e.target.classList.add('is-revealed');revealObserver.unobserve(e.target)}},{threshold:.08});
$$('.section-heading,.growth-layout>div:first-child,.bts-copy,.digital-layout>div:first-child,.about-grid>*,.cta>h2,.page-heading,.growth-offerings article,.capability-card').forEach((el,i)=>{el.classList.add('reveal-item');el.style.setProperty('--reveal-delay',`${el.classList.contains('capability-card')?i%2*90:0}ms`);revealObserver.observe(el)});
$$('.capability-card,.journey-graph').forEach(el=>observer.observe(el));
class Exhibition {
 constructor(el){this.el=el;this.track=$('.project-grid',el);this.cards=$$('.project',el);el.classList.add('motion-exhibition');this.pin=document.createElement('div');this.pin.className='exhibition-pin';while(el.firstChild)this.pin.append(el.firstChild);el.append(this.pin);this.track.addEventListener('focusin',e=>{if(mobile()||disabled)return;const card=e.target.closest('.project');if(!card)return;const x=card.offsetLeft;const distance=Math.min(this.distance,x);scrollTo({top:scrollY+this.el.getBoundingClientRect().top+distance,behavior:'instant'})});add(this)}
 resize(){this.distance=Math.max(0,this.track.scrollWidth-this.pin.clientWidth+innerWidth*.06);this.el.style.setProperty('--exhibition-distance',`${this.distance}px`)}
 update(r){if(mobile())return;const progress=clamp(-r.top/Math.max(1,r.height-this.pin.offsetHeight));this.track.style.transform=`translate3d(${-progress*this.distance}px,0,0)`;this.cards.forEach(card=>{const focal=clamp(1-Math.abs(card.offsetLeft-progress*this.distance)/(innerWidth*.8));$('.project-image',card).style.setProperty('--media-scale',1+.04*(1-focal))})}
 reset(){this.track.style.transform='none';this.cards.forEach(c=>$('.project-image',c).style.setProperty('--media-scale',1))}
}
$$('.work-section').forEach(el=>new Exhibition(el));
const hero=$('.hero');if(hero)add({el:hero,update(r){$('.studio-canvas',hero).style.setProperty('--scene-scroll',clamp(-r.top/r.height))},reset(){$('.studio-canvas',hero).style.setProperty('--scene-scroll',0)}});
$$('.website-device-stage').forEach(el=>add({el,update(r){el.style.setProperty('--device-arrival',clamp((innerHeight-r.top)/(innerHeight*.7)))},reset(){el.style.setProperty('--device-arrival',1)}}));
$$('.bts').forEach(el=>add({el,update(r){const steps=$$('.process span',el);const progress=clamp((innerHeight*.65-r.top)/(r.height*.85));steps.forEach((s,i)=>s.classList.toggle('current',i===Math.min(steps.length-1,Math.floor(progress*steps.length))))},reset(){$$('.process span',el).forEach(s=>s.classList.remove('current'))}}));
// Depth responds to the pointer through independent variables, leaving scroll transforms intact.
if(matchMedia('(hover:hover) and (pointer:fine)').matches){$$('[data-depth],.capability-card').forEach(el=>{let pending=0,px=50,py=50;el.addEventListener('pointermove',e=>{if(disabled)return;const r=el.getBoundingClientRect();px=(e.clientX-r.left)/r.width*100;py=(e.clientY-r.top)/r.height*100;if(!pending)pending=requestAnimationFrame(()=>{pending=0;el.style.setProperty('--pointer-x',px+'%');el.style.setProperty('--pointer-y',py+'%');el.style.setProperty('--depth-x',((50-py)*.05)+'deg');el.style.setProperty('--depth-y',((px-50)*.07)+'deg')})});el.addEventListener('pointerleave',()=>{cancelAnimationFrame(pending);pending=0;el.style.setProperty('--depth-x','0deg');el.style.setProperty('--depth-y','0deg')})})}
// A real interactive canvas, with keyboard navigation and one visible panel at a time.
const canvasTabs=$$('[data-canvas]');
function selectCanvas(button){canvasTabs.forEach(b=>{const selected=b===button;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;const panel=document.getElementById(b.getAttribute('aria-controls'));panel.getAnimations().forEach(a=>a.cancel());panel.hidden=!selected;if(selected&&!disabled)panel.animate([{opacity:0,transform:'translateY(12px) scale(.98)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:600,easing:'cubic-bezier(.22,1,.36,1)'})})}
canvasTabs.forEach((b,i)=>{b.addEventListener('click',()=>selectCanvas(b));b.addEventListener('keydown',e=>{let n=i;if(e.key==='ArrowRight')n=(i+1)%canvasTabs.length;else if(e.key==='ArrowLeft')n=(i+canvasTabs.length-1)%canvasTabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=canvasTabs.length-1;else return;e.preventDefault();selectCanvas(canvasTabs[n]);canvasTabs[n].focus()})});
// Expanding capability content stays in document flow, including without JavaScript.
$$('.capability-card').forEach(card=>card.addEventListener('toggle',()=>{if(card.open&&!disabled){const content=$('.capability-content',card);content.animate([{opacity:0,transform:'translateY(-8px)'},{opacity:1,transform:'none'}],{duration:350,easing:'ease-out'})}}));
$$('[data-stage]').forEach(button=>button.addEventListener('click',()=>{if(disabled)return;const panel=$('#stage-panel');panel.animate([{opacity:.5,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:400,easing:'cubic-bezier(.22,1,.36,1)'})}));
class DirectorPortrait {
 constructor(el){this.el=el;el.classList.add('director-sequence');this.photo=$('.founder-portrait',el);this.bio=$('.founder-bio',el);this.pin=document.createElement('div');this.pin.className='director-pin';this.card=document.createElement('div');this.card.className='director-card';this.aperture=document.createElement('div');this.aperture.className='director-aperture';this.aperture.append(this.photo);this.word=document.createElement('div');this.word.className='director-focus-word';this.word.setAttribute('aria-hidden','true');this.word.innerHTML='Meet the mind<br><i>behind the work.</i>';const label=document.createElement('div');label.className='director-frame-label';label.innerHTML='<span>MMM / THE STUDIO</span><span>THE PERSON BEHIND THE VISION</span>';this.card.append(this.word,this.aperture,this.bio,label);this.pin.append(this.card);el.append(this.pin);add(this)}
 update(r){if(mobile()){this.reset();return}const p=clamp(-r.top/Math.max(1,r.height-this.pin.offsetHeight)),open=clamp((p-.1)/.55),t=open*open*(3-2*open);this.aperture.style.clipPath=`inset(${(1-t)*18}% ${(1-t)*38}% round 10px)`;this.aperture.style.transform=`translateX(${(1-t)*this.card.clientWidth*.28}px)`;this.photo.style.transform=`scale(${1.1-.1*t})`;this.word.style.opacity=1-clamp(t*1.8);this.word.style.transform=`translateY(${-t*35}px)`;const reveal=clamp((p-.45)/.4);this.bio.style.opacity=reveal;this.bio.style.transform=`translateY(${(1-reveal)*25}px)`}
 reset(){this.aperture.style.clipPath='none';this.aperture.style.transform='none';this.photo.style.transform='none';this.word.style.opacity=0;this.bio.style.opacity=1;this.bio.style.transform='none'}
}
$$('.founder').forEach(el=>new DirectorPortrait(el));
const toggle=document.createElement('button');toggle.className='motion-toggle';toggle.type='button';
function updateToggle(){toggle.textContent=disabled?'Enable motion':'Pause motion';toggle.setAttribute('aria-pressed',String(disabled))}
toggle.addEventListener('click',()=>{setDisabled(!disabled);updateToggle()});$('footer').append(toggle);updateToggle();setDisabled(disabled);schedule();
