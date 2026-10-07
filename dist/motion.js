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
// Restore the original pulled site's camera-dial service animation.
const groups=serviceData.map(s=>[s[0].toUpperCase(),s[2]]);
class ServiceCategoryScroller {
 constructor(section){
  this.el=document.createElement('div');this.el.className='category-scene';this.active=-1;
  this.el.innerHTML=`<div class="category-pin"><div class="category-layout"><div class="category-wheel" role="tablist" aria-label="Service categories" aria-orientation="vertical"><span class="category-pointer" aria-hidden="true">→</span>${groups.map((g,i)=>`<button class="category-option" role="tab" id="category-${i}" aria-controls="category-services" aria-selected="${i===0}" tabindex="${i===0?0:-1}" data-category="${i}">${g[0]}</button>`).join('')}</div><div class="category-detail"><span class="category-detail-label">SERVICES</span><div id="category-services" role="tabpanel" aria-labelledby="category-0" tabindex="0"><ul></ul></div></div></div><div class="category-progress" aria-hidden="true"><span>01 / 04</span><div><i></i></div></div></div>`;
  section.classList.add('has-category-scroller');section.insertBefore(this.el,$('.service-list',section));const label=$('.section-tag',section);if(label)$('.category-pin',this.el).prepend(label);
  this.buttons=$$('.category-option',this.el);this.buttons.forEach((button,i)=>{button.addEventListener('click',()=>this.choose(i));button.addEventListener('keydown',e=>{let n=i;if(e.key==='ArrowDown'||e.key==='ArrowRight')n=(i+1)%4;else if(e.key==='ArrowUp'||e.key==='ArrowLeft')n=(i+3)%4;else if(e.key==='Home')n=0;else if(e.key==='End')n=3;else return;e.preventDefault();this.choose(n);this.buttons[n].focus({preventScroll:true})})});const wheel=$('.category-wheel',this.el);[-4,-3,-2,-1,4,5,6,7].forEach(n=>{const echo=document.createElement('span');echo.className='category-option category-orbit-echo';echo.textContent=groups[(n+8)%4][0];echo.dataset.orbitIndex=n;echo.setAttribute('aria-hidden','true');wheel.append(echo)});this.buttons.forEach((b,i)=>b.dataset.orbitIndex=i);this.orbitItems=$$('.category-option',this.el);this.paint(0,0);add(this);
 }
 choose(i){this.paint(i,0);if(!disabled){const distance=Math.max(1,this.el.offsetHeight-this.el.querySelector(".category-pin").offsetHeight);scrollTo({top:scrollY+this.el.getBoundingClientRect().top-(parseFloat(getComputedStyle(this.el.querySelector(".category-pin")).top)||0)+distance*i/3,behavior:'instant'})}}
 paint(position,velocity){const chosen=Math.round(position);const wheel=$('.category-wheel',this.el);const radius=mobile()?190:Math.min(420,wheel.clientWidth*.72);const step=mobile()?.40:.34;this.orbitItems.forEach(button=>{const i=Number(button.dataset.orbitIndex),d=i-position,angle=d*step;const active=i===chosen;button.style.visibility=Math.abs(d)>3.2?'hidden':'visible';button.style.setProperty('--category-y',`${Math.sin(angle)*radius}px`);button.style.setProperty('--category-x',`${(1-Math.cos(angle))*radius}px`);button.style.setProperty('--category-angle',`${angle*180/Math.PI}deg`);button.style.setProperty('--category-blur',`${active?0:Math.min(4.5,Math.abs(d)*1.65+velocity*.65)}px`);button.style.setProperty('--category-opacity',String(active?1:Math.max(.08,.58-Math.abs(d)*.12)));if(!button.classList.contains('category-orbit-echo')){button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1}});

  if(chosen!==this.active){this.active=chosen;const panel=$('#category-services',this.el);panel.setAttribute('aria-labelledby',`category-${chosen}`);const list=$('ul',panel);list.replaceChildren(...groups[chosen][1].map((text,i)=>{const li=document.createElement('li');li.textContent=text;if(!disabled)li.animate([{opacity:0,transform:'translateY(12px)',filter:'blur(3px)'},{opacity:1,transform:'translateY(0)',filter:'blur(0)'}],{duration:420,delay:i*55,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});return li}));$('.category-progress>span',this.el).textContent=`0${chosen+1} / 04`}
  $('.category-progress i',this.el).style.transform=`scaleX(${(position+1)/4})`;
 }
 update(r){const now=performance.now();const velocity=clamp(Math.abs(scrollY-(this.lastY??scrollY))/Math.max(16,now-(this.lastTime??now))/3);this.lastY=scrollY;this.lastTime=now;const pin=this.el.querySelector(".category-pin");const top=parseFloat(getComputedStyle(pin).top)||0;const progress=clamp((top-r.top)/Math.max(1,r.height-pin.offsetHeight));const raw=progress*3,base=Math.floor(raw),f=clamp((raw-base-.18)/.64),smooth=f*f*(3-2*f);this.paint(Math.min(3,base+smooth),velocity)}
 reset(){this.paint(Math.max(0,this.active),0)}
}

$$('.capabilities').forEach(el=>new ServiceCategoryScroller(el));
// Reveals are viewport driven and settle once. The final layout never depends on animation.
document.documentElement.classList.add('motion-ready');
const revealObserver=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){e.target.classList.add('is-revealed');revealObserver.unobserve(e.target)}},{threshold:.08});
$$('.section-heading,.growth-layout>div:first-child,.bts-copy,.digital-layout>div:first-child,.digital-portfolio-heading>div,.about-grid>*,.cta>h2,.page-heading,.growth-offerings article,.capability-card').forEach((el,i)=>{el.classList.add('reveal-item');el.style.setProperty('--reveal-delay',`${el.classList.contains('capability-card')?i%2*90:0}ms`);revealObserver.observe(el)});
$$('.capability-card,.journey-graph').forEach(el=>observer.observe(el));
class Exhibition {
 constructor(el){this.el=el;this.track=$('.project-grid',el);this.cards=$$('.project',el);el.classList.add('motion-exhibition');this.pin=document.createElement('div');this.pin.className='exhibition-pin';while(el.firstChild)this.pin.append(el.firstChild);el.append(this.pin);this.track.addEventListener('focusin',e=>{if(mobile()||disabled)return;const card=e.target.closest('.project');if(!card)return;const x=card.offsetLeft;const distance=Math.min(this.distance,x);scrollTo({top:scrollY+this.el.getBoundingClientRect().top+distance,behavior:'instant'})});add(this)}
 resize(){this.distance=Math.max(0,this.track.scrollWidth-this.pin.clientWidth+innerWidth*.06);this.el.style.setProperty('--exhibition-distance',`${this.distance}px`)}
 update(r){if(mobile())return;const progress=clamp(-r.top/Math.max(1,r.height-this.pin.offsetHeight));this.track.style.transform=`translate3d(${-progress*this.distance}px,0,0)`;this.cards.forEach(card=>{const focal=clamp(1-Math.abs(card.offsetLeft-progress*this.distance)/(innerWidth*.8));$('.project-image',card).style.setProperty('--media-scale',1+.04*(1-focal))})}
 reset(){this.track.style.transform='none';this.cards.forEach(c=>$('.project-image',c).style.setProperty('--media-scale',1))}
}
$$('.work-section').forEach(el=>new Exhibition(el));
const hero=$('.hero');if(hero)add({el:hero,update(r){hero.style.setProperty('--wall-scroll',clamp(-r.top/r.height))},reset(){hero.style.setProperty('--wall-scroll',0)}});
$$('.website-device-stage').forEach(el=>add({el,update(r){el.style.setProperty('--device-arrival',clamp((innerHeight-r.top)/(innerHeight*.7)))},reset(){el.style.setProperty('--device-arrival',1)}}));
$$('.bts').forEach(el=>add({el,update(r){const steps=$$('.process span',el);const progress=clamp((innerHeight*.65-r.top)/(r.height*.85));steps.forEach((s,i)=>s.classList.toggle('current',i===Math.min(steps.length-1,Math.floor(progress*steps.length))))},reset(){$$('.process span',el).forEach(s=>s.classList.remove('current'))}}));
// Depth responds to the pointer through independent variables, leaving scroll transforms intact.
if(matchMedia('(hover:hover) and (pointer:fine)').matches){$$('[data-depth],.capability-card').forEach(el=>{let pending=0,px=50,py=50;el.addEventListener('pointermove',e=>{if(disabled)return;const r=el.getBoundingClientRect();px=(e.clientX-r.left)/r.width*100;py=(e.clientY-r.top)/r.height*100;if(!pending)pending=requestAnimationFrame(()=>{pending=0;el.style.setProperty('--pointer-x',px+'%');el.style.setProperty('--pointer-y',py+'%');el.style.setProperty('--depth-x',((50-py)*.05)+'deg');el.style.setProperty('--depth-y',((px-50)*.07)+'deg')})});el.addEventListener('pointerleave',()=>{cancelAnimationFrame(pending);pending=0;el.style.setProperty('--depth-x','0deg');el.style.setProperty('--depth-y','0deg')})})}
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
