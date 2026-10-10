import {installLogoCursor} from './logo-cursor.js?v=1';
import {TravellingCamera} from './travelling-camera.js?v=14';
/** Native motion layer for the pulled MMM site. One scroll coordinator, no scroll hijack. */
const $=(s,root=document)=>root.querySelector(s),$$=(s,root=document)=>[...root.querySelectorAll(s)];
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const mobile=()=>matchMedia('(max-width:700px)').matches;
let disabled=reduced.matches,frame=0,navigationRunning=false;
const scenes=new Set(),active=new Set();
const observer=new IntersectionObserver(entries=>{for(const e of entries){e.target.classList.toggle('in-view',e.isIntersecting);for(const scene of scenes)if(scene.el===e.target){if(e.isIntersecting)active.add(scene);else{active.delete(scene);scene.resetBlur?.()}}}schedule()},{rootMargin:'10% 0px'});
function add(scene){scenes.add(scene);observer.observe(scene.el);scene.resize?.();return scene}
function schedule(){if(!disabled&&!navigationRunning&&!frame&&!document.hidden)frame=requestAnimationFrame(render)}
function render(){frame=0;if(navigationRunning)return;const measured=[...active].map(s=>[s,s.el.getBoundingClientRect()]);for(const [scene,r]of measured)scene.update(r);if([...active].some(scene=>scene.settling))schedule()}
document.addEventListener('scroll',event=>{if(event.target instanceof Element&&event.target.classList.contains('growth-loop-viewport'))return;schedule()},{passive:true,capture:true});
addEventListener('resize',()=>{scenes.forEach(s=>s.resize?.());schedule()},{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;scenes.forEach(scene=>scene.resetBlur?.())}else schedule()});
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
 resize(){
  const wheel=$('.category-wheel',this.el);wheel.style.removeProperty('--orbit-font-size');
  if(!this.buttons.length||!wheel.clientWidth)return;
  const style=getComputedStyle(this.buttons[0]);const size=parseFloat(style.fontSize);
  const longest=Math.max(...this.buttons.map(button=>button.scrollWidth));
  const left=parseFloat(style.left)||44;
  const available=Math.max(1,wheel.clientWidth-left-24);
  wheel.style.setProperty('--orbit-font-size',`${Math.min(size,size*available/Math.max(1,longest))}px`);
 }
 choose(i){this.paint(i,0);if(!disabled){const distance=Math.max(1,this.el.offsetHeight-this.el.querySelector(".category-pin").offsetHeight);scrollTo({top:scrollY+this.el.getBoundingClientRect().top-(parseFloat(getComputedStyle(this.el.querySelector(".category-pin")).top)||0)+distance*i/3,behavior:'instant'})}}
 paint(position,velocity){const chosen=Math.round(position);const wheel=$('.category-wheel',this.el);const radius=mobile()?Math.max(190,Math.min(310,wheel.clientHeight*.78)):Math.min(420,wheel.clientWidth*.72);const step=mobile()?.40:.34;this.orbitItems.forEach(button=>{const i=Number(button.dataset.orbitIndex),d=i-position,angle=d*step;const active=i===chosen;button.style.visibility=Math.abs(d)>3.2?'hidden':'visible';button.style.setProperty('--category-y',`${Math.sin(angle)*radius}px`);button.style.setProperty('--category-x',`${(1-Math.cos(angle))*radius}px`);button.style.setProperty('--category-angle',`${angle*180/Math.PI}deg`);button.style.setProperty('--category-blur',`${active?0:Math.min(4.5,Math.abs(d)*1.65+velocity*.65)}px`);button.style.setProperty('--category-opacity',String(active?1:Math.max(.08,.58-Math.abs(d)*.12)));if(!button.classList.contains('category-orbit-echo')){button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1}});

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
// Native vertical scroll reveals the website cards from right to left.
class WebsiteReel {
 constructor(el){this.el=el;this.cards=$$('.website-showcase',el);this.track=$('.website-portfolio-grid',el);this.viewport=$('.website-reel-viewport',el);this.count=$('.website-reel-count',el);this.buttons=$$('[data-reel-step]',el);this.index=0;this.position=0;this.lastTime=0;this.settling=false;el.classList.add('website-reel');this.pin=document.createElement('div');this.pin.className='website-reel-pin';while(el.firstChild)this.pin.append(el.firstChild);el.append(this.pin);this.buttons.forEach(b=>b.addEventListener('click',()=>this.choose(this.index+Number(b.dataset.reelStep))));this.track.addEventListener('focusin',e=>{const card=e.target.closest('.website-showcase');if(card&&this.cards.indexOf(card)!==this.index)this.choose(this.cards.indexOf(card))});this.viewport.addEventListener('scroll',()=>{if(mobile()||disabled)this.paint(this.nearest(this.viewport.scrollLeft))},{passive:true});this.paint(0);add(this)}
 resize(){
  this.distance=Math.max(0,this.track.scrollWidth-this.viewport.clientWidth);
  this.stops=this.cards.map(card=>Math.min(this.distance,card.offsetLeft-this.cards[0].offsetLeft));
  this.travel=this.distance*.55;this.position=clamp(this.position,0,this.distance);this.lastTime=0;
  this.el.style.setProperty('--reel-travel',this.travel+'px');
 }
 nearest(position){return this.stops.reduce((best,stop,i)=>Math.abs(stop-position)<Math.abs(this.stops[best]-position)?i:best,0)}
 paint(i){this.index=clamp(i,0,this.cards.length-1);this.count.textContent=`0${this.index+1} / 0${this.cards.length}`;this.buttons[0].disabled=this.index===0;this.buttons[1].disabled=this.index===this.cards.length-1}
 choose(i){
  i=clamp(i,0,this.cards.length-1);
  if(mobile()||disabled){
   this.viewport.scrollTo({left:this.stops[i],behavior:disabled?'instant':'smooth'});
  }else{
   const range=Math.max(0,this.el.offsetHeight-this.pin.offsetHeight);
   scrollTo({top:scrollY+this.el.getBoundingClientRect().top+range*this.stops[i]/Math.max(1,this.distance),behavior:'smooth'});
  }
  this.paint(i);
 }
 update(r){
  if(mobile()){this.settling=false;this.lastTime=0;return}
  const target=(clamp(-r.top/Math.max(1,this.el.offsetHeight-this.pin.offsetHeight)))*this.distance;
  const now=performance.now(),dt=this.lastTime?clamp(now-this.lastTime,8,64):16;
  this.lastTime=now;
  // A short settling tail softens wheel steps without taking over native scroll.
  this.position+=(target-this.position)*(1-Math.exp(-dt/95));
  this.settling=Math.abs(target-this.position)>.15;
  if(!this.settling)this.position=target;
  this.track.style.transform=`translate3d(${-this.position}px,0,0)`;
  this.paint(this.nearest(this.position));
 }
 reset(){this.position=0;this.lastTime=0;this.settling=false;this.track.style.transform='none';this.paint(0)}
}
$$('.digital').forEach(el=>new WebsiteReel(el));
const hero=$('.hero');if(hero)add({el:hero,update(r){hero.style.setProperty('--wall-scroll',clamp(-r.top/r.height))},reset(){hero.style.setProperty('--wall-scroll',0)}});
$$('.website-device-stage').forEach(el=>add({el,update(r){el.style.setProperty('--device-arrival',clamp((innerHeight-r.top)/(innerHeight*.7)))},reset(){el.style.setProperty('--device-arrival',1)}}));
$$('.bts').forEach(el=>add({el,update(r){const steps=$$('.process span',el);const progress=clamp((innerHeight*.65-r.top)/(r.height*.85));steps.forEach((s,i)=>s.classList.toggle('current',i===Math.min(steps.length-1,Math.floor(progress*steps.length))))},reset(){$$('.process span',el).forEach(s=>s.classList.remove('current'))}}));
// Depth responds to the pointer through independent variables, leaving scroll transforms intact.
if(matchMedia('(hover:hover) and (pointer:fine)').matches){$$('[data-depth],.capability-card').forEach(el=>{let pending=0,px=50,py=50;el.addEventListener('pointermove',e=>{if(disabled)return;const r=el.getBoundingClientRect();px=(e.clientX-r.left)/r.width*100;py=(e.clientY-r.top)/r.height*100;if(!pending)pending=requestAnimationFrame(()=>{pending=0;el.style.setProperty('--pointer-x',px+'%');el.style.setProperty('--pointer-y',py+'%');el.style.setProperty('--depth-x',((50-py)*.05)+'deg');el.style.setProperty('--depth-y',((px-50)*.07)+'deg')})});el.addEventListener('pointerleave',()=>{cancelAnimationFrame(pending);pending=0;el.style.setProperty('--depth-x','0deg');el.style.setProperty('--depth-y','0deg')})})}
// Expanding capability content stays in document flow, including without JavaScript.
$$('.capability-card').forEach(card=>card.addEventListener('toggle',()=>{if(card.open&&!disabled){const content=$('.capability-content',card);content.animate([{opacity:0,transform:'translateY(-8px)'},{opacity:1,transform:'none'}],{duration:350,easing:'ease-out'})}}));
$$('[data-stage]').forEach(button=>button.addEventListener('click',()=>{if(disabled)return;const panel=$('#stage-panel');panel.animate([{opacity:.5,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:400,easing:'cubic-bezier(.22,1,.36,1)'})}));
class DirectorPortrait {
 constructor(el){this.el=el;this.progress=0;this.lastTime=0;el.classList.add('director-sequence','director-zoom');this.photo=$('.founder-portrait',el);this.bio=$('.founder-bio',el);this.pin=document.createElement('div');this.pin.className='director-pin';this.card=document.createElement('div');this.card.className='director-card';this.aperture=document.createElement('div');this.aperture.className='director-aperture';this.aperture.append(this.photo);const focus=document.createElement('div');focus.className='cinema-focus';focus.setAttribute('aria-hidden','true');focus.innerHTML='<span></span><span></span><span></span><span></span>';this.aperture.append(focus);this.word=document.createElement('div');this.word.className='director-focus-word';this.word.setAttribute('aria-hidden','true');this.word.innerHTML='<div>Meet the mind<br><i>behind the work.</i></div><div class="director-disciplines"><span>CREATIVE</span><span>DIGITAL</span><span>GROWTH</span></div>';this.caption=document.createElement('div');this.caption.className='director-opening-caption';this.caption.innerHTML='<span>RITHWIK PEMMADA</span><small>Managing Director</small>';this.aperture.append(this.caption);const label=document.createElement('div');label.className='director-frame-label';label.innerHTML='';this.card.append(this.word,this.aperture,this.bio,label);this.pin.append(this.card);el.append(this.pin);add(this)}
 update(r){
  const target=clamp(-r.top/Math.max(1,r.height-this.pin.offsetHeight));
  const now=performance.now(),dt=this.lastTime?clamp(now-this.lastTime,8,64):16;this.lastTime=now;
  this.progress+=(target-this.progress)*(1-Math.exp(-dt/85));this.settling=Math.abs(target-this.progress)>.0005;
  if(!this.settling)this.progress=target;
  const open=clamp((this.progress-.08)/.75),t=open*open*(3-2*open);
  this.card.style.setProperty('--portrait-open',t);this.card.style.setProperty('--cinema-open',t);
  this.aperture.style.clipPath='none';this.aperture.style.transform=`perspective(1800px) rotateY(${(1-t)*(mobile()?-4:-9)}deg)`;
  this.photo.style.transform='none';
  const opening=1-clamp(t*2.1);this.word.style.opacity=opening;this.word.style.transform=`translateY(${-t*35}px)`;
  this.caption.style.opacity=opening;
  const reveal=clamp((t-.65)/.35);this.bio.style.opacity=reveal;this.bio.style.transform=`translateY(${(1-reveal)*30}px)`;
 }
 reset(){this.progress=1;this.lastTime=0;this.settling=false;this.card.style.setProperty('--portrait-open',1);this.card.style.setProperty('--cinema-open',1);this.aperture.style.clipPath='none';this.aperture.style.transform='none';this.photo.style.transform='none';this.word.style.opacity=0;this.caption.style.opacity=0;this.bio.style.opacity=1;this.bio.style.transform='none'}
}
$$('.founder').forEach(el=>new DirectorPortrait(el));
const toggle=document.createElement('button');toggle.className='motion-toggle';toggle.type='button';
function updateToggle(){toggle.textContent=disabled?'Enable motion':'Pause motion';toggle.setAttribute('aria-pressed',String(disabled))}
toggle.addEventListener('click',()=>{setDisabled(!disabled);updateToggle()});$('footer').append(toggle);updateToggle();setDisabled(disabled);schedule();

// Larger editorial motion, using the same coordinator and existing pause control.
class EditorialImage {
 constructor(el){this.el=el;this.photo=$('img',el);el.classList.add('editorial-image');add(this)}
 update(r){const p=clamp((innerHeight-r.top)/Math.max(1,innerHeight+r.height));this.el.style.setProperty('--image-drift',`${(p-.5)*(mobile()?24:48)}px`)}
 reset(){this.el.style.setProperty('--image-drift','0px')}
}
$$('.bts-photo,.project-image').forEach(el=>new EditorialImage(el));
// Typeset arrivals: masked poster titles followed by connected script reveals.
const titleSelectors='main h2,main .page-heading h1,.director-focus-word>div:first-child';
let inkId=0;
// Typography is a scroll scene: the same position always gives the same frame.
class ScrollTypography {
 constructor(heading){
  this.el=heading;heading.classList.add('scrub-title');
  this.slots=$$('.slot-strip',heading);
  this.ink=$$('.ink-line',heading).map(line=>{
   const path=document.getElementById(line.dataset.inkPath),length=path.getTotalLength();
   path.style.strokeDasharray=String(length);
   return {line,path,length};
  });
  this.progress=0;this.lastTime=0;this.settling=false;
  add(this);
 }
 resize(){
  for(const{line}of this.ink){
   line.style.removeProperty('font-size');
   const script=line.parentElement,style=getComputedStyle(script);
   const available=Math.max(0,this.el.clientWidth-(parseFloat(style.paddingLeft)||0)-(parseFloat(style.paddingRight)||0)-4);
   if(!available)continue;
   const size=parseFloat(getComputedStyle(line).fontSize),natural=line.scrollWidth;
   if(natural>available)line.style.fontSize=`${size*available/natural}px`;
  }
  this.lastTime=0;this.progress=this.target(this.el.getBoundingClientRect());this.paint(disabled?1:this.progress);
 }
 target(r){return clamp((innerHeight*.94-r.top)/(innerHeight*.42))}
 paint(progress,velocity=0){
  this.slots.forEach((strip,i)=>{
   const wave=i/Math.max(1,this.slots.length-1);
   const delay=wave*(mobile()?.12:.20)+((i*7)%5)*.015;
   const end=.70+wave*.18,p=clamp((progress-delay)/(end-delay));
   const spin=.5-Math.cos(Math.PI*p)/2,rows=Number(strip.dataset.rows);
   const travel=strip.dataset.direction==='down'?1-spin:spin;
   strip.style.transform=`translate3d(0,${-travel*(rows-1)/rows*100}%,0)`;
   // Visible letter rows accelerate through the drum, then brake into the final glyph.
   strip.style.filter=`blur(${Math.sin(Math.PI*p)*clamp(velocity*650,0,mobile()?1.4:3.2)}px)`;
  });
  this.ink.forEach(({line,path,length},i)=>{
   const p=clamp((progress-.34-Math.min(i*.05,.10))/.62);
   // The writing mask is scrubbed, so upward scroll erases along the same path.
   path.style.strokeDashoffset=String(length*(1-p));
   line.style.mask=p>=.999?'none':`url(#${line.dataset.inkMask})`;
   line.style.webkitMask=line.style.mask;
   line.style.opacity=p<=0?'0':'1';
  });
 }
 update(r){
  const target=this.target(r),now=performance.now(),dt=this.lastTime?clamp(now-this.lastTime,8,64):16;
  this.lastTime=now;const previous=this.progress;this.progress+=(target-this.progress)*(1-Math.exp(-dt/65));
  this.settling=Math.abs(target-this.progress)>.0005;
  if(!this.settling)this.progress=target;
  this.paint(this.progress,Math.abs(this.progress-previous)/dt);
 }
 reset(){this.progress=1;this.lastTime=0;this.settling=false;this.paint(1)}
}
const inkDefs=document.createElementNS('http://www.w3.org/2000/svg','svg');
inkDefs.setAttribute('width','0');inkDefs.setAttribute('height','0');inkDefs.setAttribute('aria-hidden','true');
inkDefs.style.position='absolute';inkDefs.style.pointerEvents='none';document.body.append(inkDefs);
function prepareTitle(heading){
 if(heading.dataset.typeset)return;heading.dataset.typeset='true';
 $$('i',heading).forEach(script=>{
  // Keep the complete string together so Lobster's ligatures and joins survive.
  const line=document.createElement('span');line.className='ink-line';line.textContent=script.textContent;
  const maskId=`ink-mask-${++inkId}`,pathId=`ink-path-${inkId}`;
  const mask=document.createElementNS(inkDefs.namespaceURI,'mask');
  mask.id=maskId;mask.setAttribute('maskUnits','objectBoundingBox');mask.setAttribute('maskContentUnits','objectBoundingBox');
  mask.setAttribute('x','-.1');mask.setAttribute('y','-.2');mask.setAttribute('width','1.2');mask.setAttribute('height','1.4');
  const path=document.createElementNS(inkDefs.namespaceURI,'path');path.id=pathId;
  path.setAttribute('d','M -.15 .55 C .04 .2 .12 .76 .26 .48 S .44 .26 .57 .5 S .81 .3 1.15 .48');
  path.setAttribute('fill','none');path.setAttribute('stroke','white');path.setAttribute('stroke-width','1.2');path.setAttribute('stroke-linecap','round');
  mask.append(path);inkDefs.append(mask);line.dataset.inkMask=maskId;line.dataset.inkPath=pathId;
  const style=getComputedStyle(script);
  if(style.backgroundImage!=='none'){
   line.style.backgroundImage=style.backgroundImage;line.style.backgroundClip='text';line.style.webkitBackgroundClip='text';
   line.style.webkitTextFillColor='transparent';script.style.backgroundImage='none';
  }
  script.replaceChildren(line);
 });
 const walker=document.createTreeWalker(heading,NodeFilter.SHOW_TEXT);const nodes=[];
 while(walker.nextNode())if(!walker.currentNode.parentElement.closest('i,.director-disciplines'))nodes.push(walker.currentNode);
 nodes.forEach(node=>{
  const fragment=document.createDocumentFragment();
  node.textContent.split(/(\s+)/).forEach(text=>{
   if(!text)return;if(/^\s+$/.test(text)){fragment.append(document.createTextNode(text));return}
   const word=document.createElement('span');word.className='slot-word';
   Array.from(text).forEach((character,index)=>{
    const cell=document.createElement('span');cell.className='slot-character';
    const original=document.createElement('span');original.className='slot-static';original.textContent=character;
    if(!/[\p{L}\p{N}]/u.test(character)){original.style.opacity='1';cell.append(original);word.append(cell);return}
    const strip=document.createElement('span');strip.className='slot-strip';strip.setAttribute('aria-hidden','true');
    const alphabet=/[a-z]/i.test(character)?'ABCDEFGHIJKLMNOPQRSTUVWXYZ':'0123456789';
    const seed=character.codePointAt(0)+index*11;
    const rolls=[character,...Array.from({length:(mobile()?3:4)+seed%3},(_,n)=>alphabet[(seed+n*7)%alphabet.length]),character];
    strip.dataset.direction=index%2?'down':'up';
    strip.dataset.rows=String(rolls.length);
    rolls.forEach(glyph=>{const row=document.createElement('span');row.className='slot-glyph';row.textContent=glyph;strip.append(row)});
    cell.append(original,strip);word.append(cell);
   });
   fragment.append(word);
  });node.replaceWith(fragment);
 });
 new ScrollTypography(heading);
}
$$(titleSelectors).forEach(prepareTitle);
// Shared selection pills move between existing buttons; their semantics remain unchanged.
$$('.preview-toggle,.growth-steps').forEach(group=>{
 const indicator=document.createElement('span');indicator.className='selection-glider';indicator.setAttribute('aria-hidden','true');group.prepend(indicator);
 let started=false;
 const sync=()=>{
  const selected=$('button[aria-pressed="true"],button[aria-selected="true"]',group);
  if(!selected)return;
  const groupRect=group.getBoundingClientRect(),rect=selected.getBoundingClientRect();
  const scale=groupRect.width/Math.max(1,group.offsetWidth);
  const x=(rect.left-groupRect.left)/scale-group.clientLeft,y=(rect.top-groupRect.top)/scale-group.clientTop;
  const previous=indicator.getBoundingClientRect();
  indicator.style.width=selected.offsetWidth+'px';indicator.style.height=selected.offsetHeight+'px';
  indicator.style.transform=`translate3d(${x}px,${y}px,0)`;
  if(started&&!disabled&&previous.width){
   indicator.getAnimations().forEach(a=>a.cancel());
   indicator.animate([
    {transform:`translate3d(${(previous.left-groupRect.left)/scale-group.clientLeft}px,${(previous.top-groupRect.top)/scale-group.clientTop}px,0)`,width:previous.width/scale+'px',filter:'blur(0px)'},
    {filter:mobile()?'blur(.7px)':'blur(1.4px)',offset:.3},
    {transform:`translate3d(${x}px,${y}px,0)`,width:selected.offsetWidth+'px',filter:'blur(0px)'}
   ],{duration:520,easing:'cubic-bezier(.22,1,.36,1)'});
  }
  started=true;group.classList.add('glider-ready');
 };
 new MutationObserver(sync).observe(group,{subtree:true,attributes:true,attributeFilter:['aria-pressed','aria-selected']});
 new ResizeObserver(()=>{started=false;sync()}).observe(group);document.fonts.ready.then(sync);sync();
});
$$('.button,.preview-toggle button,.growth-steps button,.tool-button,.website-reel-controls button').forEach(button=>{
 button.addEventListener('pointerdown',()=>{
  if(disabled)return;
  button.animate([{scale:'1'},{scale:'.94',offset:.35},{scale:'1'}],{duration:360,easing:'cubic-bezier(.22,1,.36,1)'});
 });
});
// Supporting entrances also follow scroll position, rather than playing on a timer.
class ScrollArrival {
 constructor(el){
  this.el=el;this.progress=0;this.lastTime=0;const siblings=[...el.parentElement.children];this.delay=Math.min(siblings.indexOf(el)*.02,.12);
  this.animation=el.animate([
   {opacity:0,filter:mobile()?'blur(0px)':'blur(1.5px)',clipPath:'inset(0 0 10% 0 round 12px)'},
   {opacity:1,filter:'blur(0px)',clipPath:'inset(0 0 0 0 round 0px)',offset:.97},
   {opacity:1,filter:'blur(0px)',clipPath:'none'}
  ],{duration:1000,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'});
  this.animation.pause();add(this);
 }
 update(r){const target=clamp(((innerHeight*.96-r.top)/(innerHeight*.36)-this.delay)/(1-this.delay));const now=performance.now(),dt=this.lastTime?clamp(now-this.lastTime,8,64):16;this.lastTime=now;this.progress+=(target-this.progress)*(1-Math.exp(-dt/80));this.settling=Math.abs(target-this.progress)>.001;if(!this.settling)this.progress=target;this.animation.currentTime=this.progress*1000}
 reset(){this.progress=1;this.lastTime=0;this.settling=false;this.animation.pause();this.animation.currentTime=1000}
}
$$('.hero-intro>p,.hero-actions>*,.growth-offerings article,.process span,.about-grid .large-copy,.contact-layout form,.website-toolbar').forEach(el=>new ScrollArrival(el));
const readingLine=document.createElement('div');readingLine.className='reading-line';readingLine.setAttribute('aria-hidden','true');document.body.append(readingLine);
add({el:document.body,update(){readingLine.style.transform=`scaleX(${clamp(scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight))})`},reset(){readingLine.style.transform='scaleX(0)'}});
if(disabled)scenes.forEach(scene=>scene.reset?.());
schedule();

// Refit the longest service title when the actual display font is available.
document.fonts.ready.then(()=>{scenes.forEach(scene=>scene.resize?.());schedule()});

/* Cinematic scroll treatment: position-driven, reversible, with a short inertial settle. */
document.documentElement.classList.add('film-scroll-ready');
class ScrollFilm {
 constructor(el){
  this.el=el;this.value=0;this.lastTime=performance.now();this.lastScroll=scrollY;this.speed=0;
  this.headings=$$('h2',el).filter(h=>!h.classList.contains('scrub-title')&&!h.closest('.growth-console,.website-showcase,.founder'));
  this.headings.forEach(h=>h.classList.add('film-heading'));
  this.photo=$('.bts-photo',el);this.console=$('.growth-console',el);
  this.cards=$$('.project,.website-showcase',el).map(card=>({el:card,turn:0,z:0,y:0}));
  this.cards.forEach(card=>card.el.classList.add('film-plane'));add(this);
 }
 update(r){
  const now=performance.now(),dt=Math.min(64,Math.max(8,now-this.lastTime)),ease=1-Math.exp(-dt/105);this.lastTime=now;
  const rawSpeed=clamp((scrollY-this.lastScroll)/dt,-2,2);this.lastScroll=scrollY;this.speed+=(rawSpeed-this.speed)*ease;
  const enter=clamp((innerHeight*.88-r.top)/(innerHeight*.64)),exit=clamp((r.bottom-innerHeight*.04)/(innerHeight*.4));
  const target=Math.min(enter,exit);this.value+=(target-this.value)*ease;const direction=enter<exit?1:-1;
  const travel=(1-this.value)*direction;
  for(const heading of this.headings){
   heading.style.setProperty('--film-y',`${travel*(mobile()?24:48)}px`);
   heading.style.setProperty('--film-z',`${-(1-this.value)*(mobile()?45:130)}px`);
   heading.style.setProperty('--film-turn',`${travel*(mobile()?3:7)}deg`);
   heading.style.setProperty('--film-opacity',String(.12+this.value*.88));
  }
  if(this.photo){this.photo.classList.add('film-shot');this.photo.style.setProperty('--shot-turn',`${travel*(mobile()?3:10)}deg`);this.photo.style.setProperty('--shot-y',`${travel*35}px`)}
  if(this.console){this.console.classList.add('film-console');this.console.style.setProperty('--shot-turn',`${travel*-9}deg`);this.console.style.setProperty('--shot-y',`${travel*25}px`)}
  this.settling=Math.abs(target-this.value)>.001||Math.abs(this.speed)>.004;
  const tracks=new Map();
  for(const card of this.cards){
   const track=card.el.parentElement;
   if(!tracks.has(track))tracks.set(track,track.getBoundingClientRect());
   const x=tracks.get(track).left+card.el.offsetLeft+card.el.offsetWidth/2;
   const position=clamp((x-innerWidth/2)/innerWidth,-1,1),turn=-position*(mobile()?4:17)+this.speed*1.2;
   const z=-Math.abs(position)*(mobile()?20:110),y=Math.abs(position)*(mobile()?6:24);
   card.turn+=(turn-card.turn)*ease;card.z+=(z-card.z)*ease;card.y+=(y-card.y)*ease;
   card.el.style.setProperty('--plane-turn',`${card.turn}deg`);card.el.style.setProperty('--plane-z',`${card.z}px`);card.el.style.setProperty('--plane-y',`${card.y}px`);
   if(Math.abs(turn-card.turn)>.02||Math.abs(z-card.z)>.1||Math.abs(y-card.y)>.1)this.settling=true;
  }
 }
 reset(){
  this.value=1;this.speed=0;this.settling=false;
  for(const heading of this.headings){heading.style.setProperty('--film-y','0px');heading.style.setProperty('--film-z','0px');heading.style.setProperty('--film-turn','0deg');heading.style.setProperty('--film-opacity','1')}
  for(const el of [this.photo,this.console].filter(Boolean)){el.style.setProperty('--shot-turn','0deg');el.style.setProperty('--shot-y','0px')}
  for(const card of this.cards){card.el.style.setProperty('--plane-turn','0deg');card.el.style.setProperty('--plane-z','0px');card.el.style.setProperty('--plane-y','0px')}
 }
}
$$('.work-section,.growth-section,.bts,.equipment,.digital,.about-strip,.cta,.contact-layout').forEach(el=>new ScrollFilm(el));

if(disabled)scenes.forEach(scene=>scene.reset?.());schedule();

/* Reference-led sequences: a camera panel opens into a shot, then a lens portal closes the story. */
const smoothstep=p=>p*p*(3-2*p);
class ProductionCinema {
 constructor(el){
  this.el=el;this.photo=$('.bts-photo',el);if(!this.photo)return;
  this.pin=document.createElement('div');this.pin.className='production-pin';
  while(el.firstChild)this.pin.append(el.firstChild);el.append(this.pin);el.classList.add('production-cinema');
  const focus=document.createElement('div');focus.className='cinema-focus';focus.setAttribute('aria-hidden','true');focus.innerHTML='<span></span><span></span><span></span><span></span>';this.photo.append(focus);
  this.progress=0;this.lastTime=0;add(this);
 }
 update(r){
  if(mobile()){this.reset();return}
  const target=clamp(-r.top/Math.max(1,r.height-innerHeight)),now=performance.now();
  const dt=this.lastTime?clamp(now-this.lastTime,8,64):16;this.lastTime=now;
  this.progress+=(target-this.progress)*(1-Math.exp(-dt/85));this.settling=Math.abs(target-this.progress)>.0005;
  if(!this.settling)this.progress=target;
  this.el.style.setProperty('--cinema-open',smoothstep(clamp((this.progress-.06)/.8)));
  this.el.style.setProperty('--cinema-copy',1-smoothstep(clamp((this.progress-.65)/.3)));
 }
 reset(){this.progress=0;this.lastTime=0;this.settling=false;this.el.style.setProperty('--cinema-open','0');this.el.style.setProperty('--cinema-copy','1')}
}
$$('.bts').forEach(el=>new ProductionCinema(el));
class MotionRibbon {
 constructor(el){
  this.el=el;el.classList.add('ribbon-scene');
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.classList.add('motion-ribbon');svg.setAttribute('viewBox','0 0 1440 900');svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('aria-hidden','true');
  const id='ribbon-tone-'+Math.random().toString(36).slice(2);
  svg.innerHTML=`<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#4264f5"/><stop offset=".7" stop-color="#527ed7"/><stop offset="1" stop-color="#6fe09a"/></linearGradient></defs><path class="ribbon-body" d="M -160 160 C 360 -100 1050 70 1010 340 S 140 440 270 700 S 1130 920 1570 630" fill="none" stroke="url(#${id})" stroke-width="18"/><path class="ribbon-edge" d="M -160 160 C 360 -100 1050 70 1010 340 S 140 440 270 700 S 1130 920 1570 630" fill="none" stroke="#c8ffe9" stroke-width="2"/>`;
  this.paths=[...svg.querySelectorAll('path')].map(path=>{const length=path.getTotalLength();path.style.strokeDasharray=String(length);return{path,length}});
  const parent=$('.production-pin',el)||el;parent.prepend(svg);add(this);
 }
 update(r){const p=clamp((innerHeight*.95-r.top)/Math.max(1,r.height+innerHeight*.15));for(const{path,length}of this.paths)path.style.strokeDashoffset=String(length*(1-p));this.el.style.setProperty('--ribbon-shift',`${(p-.5)*80}px`);this.el.style.setProperty('--ribbon-turn',`${(p-.5)*5}deg`);this.el.style.setProperty('--ribbon-scale',String(1+Math.sin(p*Math.PI)*.06))}
 reset(){for(const{path}of this.paths)path.style.strokeDashoffset='0';this.el.style.setProperty('--ribbon-shift','0px');this.el.style.setProperty('--ribbon-turn','0deg');this.el.style.setProperty('--ribbon-scale','1')}
}
$$('.bts,.about-strip').forEach(el=>new MotionRibbon(el));
class LensPortal {
 constructor(el){
  this.el=el;this.pin=document.createElement('div');this.pin.className='portal-pin';
  while(el.firstChild)this.pin.append(el.firstChild);el.append(this.pin);el.classList.add('lens-portal');
  const world=document.createElement('div');world.className='portal-world';world.setAttribute('aria-hidden','true');
  const lens=document.createElement('div');lens.className='portal-lens';world.append(lens);
  const corona=document.createElement('div');corona.className='portal-corona';corona.innerHTML='<span></span><span></span><span></span>';world.append(corona);
  const light=document.createElement('div');light.className='portal-atmosphere';light.innerHTML='<span></span><span></span>';world.append(light);
  this.frames=Array.from({length:9},(_,i)=>{const frame=document.createElement('span');frame.className='portal-depth-frame';frame.style.setProperty('--frame-index',i);world.append(frame);return frame});
  this.stars=Array.from({length:28},(_,i)=>{const star=document.createElement('span');star.className='portal-star';star.style.left=(8+(i*37)%84)+'%';star.style.top=(7+(i*53)%86)+'%';world.append(star);return star});
  const iris=document.createElement('div');iris.className='portal-iris';for(let i=0;i<12;i++){const blade=document.createElement('span');blade.style.setProperty('--blade',i);iris.append(blade)}world.append(iris);
  world.style.zIndex='-1';
  for(const content of this.pin.children){if(content.matches('h2,.cta-bottom')){content.style.position='relative';content.style.zIndex='10'}}
  this.pin.prepend(world);this.progress=0;this.lastTime=0;add(this);
 }
 paint(p){
  const zoom=smoothstep(clamp((p-.08)/.84));this.el.style.setProperty('--portal-zoom',zoom);
  this.el.style.setProperty('--portal-turn',`${zoom*240}deg`);this.el.style.setProperty('--portal-counterturn',`${-zoom*180}deg`);
  this.el.style.setProperty('--portal-light',String(.25+Math.sin(zoom*Math.PI)*.45));
  this.frames.forEach((frame,i)=>{
   const depth=i/9,travel=zoom*1.5-depth,scale=Math.exp(travel*2.1);
   frame.style.filter=`blur(${Math.max(0,travel-.55)*2}px)`;
   frame.style.transform=`translate(-50%,-50%) scale(${scale}) rotate(${(1-zoom)*(i%2?2:-2)}deg)`;
   frame.style.opacity=String(clamp((travel+.7)*1.5)*clamp((1.25-travel)*1.5)*.28);
  });
  this.stars.forEach((star,i)=>{const distance=zoom*(50+i%5*22);const angle=i*2.39996;star.style.transform=`translate(${Math.cos(angle)*distance}px,${Math.sin(angle)*distance}px) scale(${.6+zoom*(i%3+1)})`;star.style.opacity=String((.12+zoom*.45)*(i%3?.55:1))});
 }
 update(r){
  const target=(mobile()?clamp((innerHeight-r.top)/(r.height+innerHeight)):clamp(-r.top/Math.max(1,r.height-innerHeight)));
  const now=performance.now(),dt=this.lastTime?clamp(now-this.lastTime,8,64):16;this.lastTime=now;
  this.progress+=(target-this.progress)*(1-Math.exp(-dt/90));this.settling=Math.abs(target-this.progress)>.0005;
  if(!this.settling)this.progress=target;this.paint(this.progress);
 }
 reset(){this.progress=0;this.lastTime=0;this.settling=false;this.paint(0)}
}
$$('.cta').forEach(el=>new LensPortal(el));
if(document.body.classList.contains('home-page')){const camera=new TravellingCamera(()=>!disabled&&!document.documentElement.classList.contains('launch-active'));if(camera.gl){scenes.add(camera);camera.resize();}}
if(disabled)scenes.forEach(scene=>scene.reset?.());schedule();

// A shared, damped hover response adds life without replacing scroll transforms.
class HoverPresence {
 constructor(el,kind){
  this.el=el;this.kind=kind;this.x=0;this.y=0;this.time=0;this.point=null;this.settling=false;
  el.classList.add('hover-alive');el.dataset.hoverKind=kind;
  el.addEventListener('pointermove',event=>{if(disabled||event.pointerType!=='mouse')return;this.point={x:event.clientX,y:event.clientY};el.classList.add('is-hovered');schedule()},{passive:true});
  el.addEventListener('pointerleave',()=>{this.point=null;el.classList.remove('is-hovered');schedule()});
  el.addEventListener('pointercancel',()=>{this.point=null;el.classList.remove('is-hovered');schedule()});
  add(this);
 }
 update(r){
  const now=performance.now(),dt=this.time?clamp(now-this.time,8,64):16;this.time=now;
  const tx=this.point?clamp((this.point.x-r.left)/Math.max(1,r.width),0,1)*2-1:0;
  const ty=this.point?clamp((this.point.y-r.top)/Math.max(1,r.height),0,1)*2-1:0;
  const ease=1-Math.exp(-dt/85);this.x+=(tx-this.x)*ease;this.y+=(ty-this.y)*ease;
  this.settling=Math.abs(tx-this.x)+Math.abs(ty-this.y)>.005;
  if(!this.settling){this.x=tx;this.y=ty}
  const control=this.kind==='control',frame=this.kind==='frame';
  this.el.style.setProperty('--hover-x',`${frame?0:this.x*(control?2.5:1.5)}px`);
  this.el.style.setProperty('--hover-y',`${frame?0:this.y*(control?1.5:1)}px`);
  this.el.style.setProperty('--hover-roll',`${frame||control?0:this.x*.65}deg`);
  this.el.style.setProperty('--card-light-x',`${(this.x+1)*50}%`);
  this.el.style.setProperty('--card-light-y',`${(this.y+1)*50}%`);
 }
 reset(){this.point=null;this.time=0;this.x=0;this.y=0;this.settling=false;this.el.classList.remove('is-hovered');for(const name of ['--hover-x','--hover-y','--hover-roll'])this.el.style.removeProperty(name)}
}
if(matchMedia('(hover:hover) and (pointer:fine)').matches){
 const surfaces=$$('.website-showcase,.project,.growth-offerings article,.growth-console,.capability-card');
 surfaces.forEach(el=>new HoverPresence(el,'surface'));
 $$('.bts-photo,.director-aperture').forEach(el=>new HoverPresence(el,'frame'));
 $$('main button:not(.project),main .button,main .text-link,main summary,main .service-choices label,header .button,header nav a,header .menu').forEach(el=>new HoverPresence(el,'control'));
 $$('main img').filter(el=>!el.closest('.hero-image-wall,.website-showcase,.project,.bts-photo,.director-aperture,.tool-hover-art')).forEach(el=>new HoverPresence(el,'image'));
}

installLogoCursor();

// One restrained light cue joins sections without adding another moving background.
$$('.work-section,.digital,.growth-section,.equipment,.about-strip').forEach(el=>{
 const seam=document.createElement('div');seam.className='section-light-seam';seam.setAttribute('aria-hidden','true');el.append(seam);el.classList.add('has-light-seam');
 add({el,update(r){const p=clamp((innerHeight*.95-r.top)/(innerHeight*.65));seam.style.setProperty('--seam-progress',p);},reset(){seam.style.setProperty('--seam-progress',1);}});
});
// The same light follows the pointer across controls, with keyboard focus receiving equal emphasis.
$$('.button,.preview-toggle button,.growth-steps button,.tool-button,.website-reel-controls button').forEach(control=>{
 control.classList.add('polished-control');const sheen=document.createElement('span');sheen.className='control-sheen';sheen.setAttribute('aria-hidden','true');control.append(sheen);
 control.addEventListener('pointermove',event=>{if(disabled||event.pointerType==='touch')return;const r=control.getBoundingClientRect();control.style.setProperty('--control-light-x',`${clamp((event.clientX-r.left)/Math.max(1,r.width))*100}%`);},{passive:true});
 control.addEventListener('pointerleave',()=>control.style.removeProperty('--control-light-x'));
});
// Local anisotropic lens blur follows each layer's actual screen-space movement.
// Separate filters avoid blurring controls or creating a filtered full-page layer.
const blurSvg=document.createElementNS('http://www.w3.org/2000/svg','svg');
blurSvg.setAttribute('width','0');blurSvg.setAttribute('height','0');blurSvg.setAttribute('aria-hidden','true');
blurSvg.style.cssText='position:absolute;pointer-events:none';
const blurDefs=document.createElementNS(blurSvg.namespaceURI,'defs');blurSvg.append(blurDefs);document.body.append(blurSvg);
let blurId=0;
class MotionBlur {
 constructor(el){
  this.el=el;this.blur=0;this.previous=null;this.lastTime=0;this.settling=false;this.axisX=0;this.axisY=1;
  const filter=document.createElementNS(blurSvg.namespaceURI,'filter');filter.id=`movement-blur-${++blurId}`;
  for(const [name,value]of Object.entries({x:'-20%',y:'-30%',width:'140%',height:'160%', 'color-interpolation-filters':'sRGB'}))filter.setAttribute(name,value);
  this.gaussian=document.createElementNS(blurSvg.namespaceURI,'feGaussianBlur');this.gaussian.setAttribute('stdDeviation','0 0');
  filter.append(this.gaussian);blurDefs.append(filter);this.filter=filter;
  const baseFilter=getComputedStyle(el).filter;el.style.setProperty('--base-motion-filter',baseFilter==='none'?'blur(0px)':baseFilter);
  el.classList.add('velocity-blur');add(this);
 }
 update(r){
  const now=performance.now(),elapsed=now-this.lastTime,dt=clamp(elapsed,8,64);
  // Ignore first entry and stale measurements after a hidden tab or off-screen interval.
  const previous=elapsed<=120?this.previous:null;
  const dx=previous?r.left-previous.left:0,dy=previous?r.top-previous.top:0;
  const resize=previous?Math.hypot(r.width-previous.width,r.height-previous.height)*.5:0;
  const distance=Math.hypot(dx,dy),speed=Math.hypot(distance,resize)/dt;
  this.previous={left:r.left,top:r.top,width:r.width,height:r.height};this.lastTime=now;
  const text=this.el.matches('.ink-line,.slot-word,.hero-wordmark>span');
  const maximum=text?(mobile()?1:2.2):(mobile()?2.8:6);
  const target=clamp((speed-.04)*(text?1.15:3.4),0,maximum);
  const ease=1-Math.exp(-dt/(target>this.blur?28:140));
  this.blur+=(target-this.blur)*ease;
  if(distance>.1){this.axisX+=(Math.abs(dx)/distance-this.axisX)*ease;this.axisY+=(Math.abs(dy)/distance-this.axisY)*ease}
  this.settling=Math.abs(target-this.blur)>.015;
  if(!this.settling)this.blur=target;
  this.gaussian.setAttribute('stdDeviation',`${(this.blur*(.15+.85*this.axisX)).toFixed(3)} ${(this.blur*(.15+.85*this.axisY)).toFixed(3)}`);
  // Removing the filter at rest restores native image rendering and crisp glyphs.
  this.el.style.setProperty('--movement-filter',this.blur>.015?`blur(${(this.blur*.25).toFixed(3)}px) url(#${this.filter.id})`:'blur(0px)');
 }
 resetBlur(){this.blur=0;this.previous=null;this.lastTime=0;this.settling=false;this.gaussian.setAttribute('stdDeviation','0 0');this.el.style.setProperty('--movement-filter','blur(0px)')}
 reset(){this.resetBlur()}
}
const blurTargets=mobile()
 ?'.hero-wordmark>span,.project-image img,.website-device-stage,.founder-portrait,.scrub-title .ink-line'
 :'.hero-wordmark>span,.project-image img,.website-device-stage,.bts-photo>img,.founder-portrait,.scrub-title .slot-word,.scrub-title .ink-line';
$$(blurTargets).forEach(el=>new MotionBlur(el));
if(disabled)scenes.forEach(scene=>scene.reset?.());schedule();

// Mobile growth cards form a native swipe strip with a pixel-matched loop seam.
class GrowthLoop {
 constructor(track){
  this.track=track;this.cards=[...track.children];this.raf=0;this.lastTime=0;this.position=0;this.period=0;this.visible=false;this.holding=false;this.pauseUntil=0;
  this.el=document.createElement('div');this.el.className='growth-loop-viewport';this.el.setAttribute('aria-label','Business growth services');
  track.before(this.el);this.el.append(track);
  this.copies=this.cards.map(card=>{const copy=card.cloneNode(true);copy.classList.add('growth-loop-copy');copy.setAttribute('aria-hidden','true');copy.inert=true;copy.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));track.append(copy);return copy});
  // Only a deliberate sideways swipe pauses autoplay; vertical page scrolling does not.
  this.el.addEventListener('pointerdown',event=>{this.gesture={id:event.pointerId,x:event.clientX,y:event.clientY,vertical:false}},{passive:true});
  this.el.addEventListener('pointermove',event=>{
   const gesture=this.gesture;if(!gesture||gesture.id!==event.pointerId||gesture.vertical)return;
   const dx=Math.abs(event.clientX-gesture.x),dy=Math.abs(event.clientY-gesture.y);
   if(!this.holding&&dy>8&&dy>dx){gesture.vertical=true;return}
   if(dx>8&&dx>dy*1.2){this.holding=true;this.pauseUntil=Infinity;this.track.style.transform='none'}
  },{passive:true});
  const release=event=>{
   if(this.gesture&&event.pointerId!==this.gesture.id)return;
   this.gesture=null;if(!this.holding)return;
   this.holding=false;this.pauseUntil=performance.now()+1200;this.position=this.el.scrollLeft;
  };
  addEventListener('pointerup',release,{passive:true});addEventListener('pointercancel',release,{passive:true});
  this.el.addEventListener('wheel',event=>{if(Math.abs(event.deltaX)>Math.abs(event.deltaY)&&Math.abs(event.deltaX)>1)this.pauseUntil=performance.now()+1200},{passive:true});
  this.el.addEventListener('focusin',()=>{this.focused=this.el.matches(':focus-visible')});this.el.addEventListener('focusout',()=>{this.focused=false;this.pauseUntil=performance.now()+1000});
  this.el.addEventListener('scroll',()=>{if(this.holding||performance.now()<this.pauseUntil||this.focused)this.position=this.el.scrollLeft},{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)this.stop();else this.start()});
  this.tick=this.tick.bind(this);add(this);
  new ResizeObserver(()=>this.resize()).observe(this.el);
 }
 resize(){
  this.el.style.setProperty('--growth-gutter',`${parseFloat(getComputedStyle(this.el.parentElement).paddingLeft)||0}px`);
  this.period=this.copies[0].offsetLeft-this.cards[0].offsetLeft;
  if(!mobile()){this.stop();this.el.scrollLeft=0;this.position=0;this.track.style.transform='none';this.el.removeAttribute('tabindex')}
  else{this.el.tabIndex=0;this.start()}
 }
 update(r){this.visible=r.bottom>0&&r.top<innerHeight;if(this.visible)this.start();else this.stop()}
 start(){if(!this.raf&&mobile()&&!disabled&&this.visible&&!document.hidden&&this.period>0){this.lastTime=0;this.raf=requestAnimationFrame(this.tick)}}
 stop(){cancelAnimationFrame(this.raf);this.raf=0;this.lastTime=0}
 tick(now){
  this.raf=0;if(!mobile()||disabled||!this.visible||document.hidden)return;
  const dt=this.lastTime?Math.min(50,now-this.lastTime):0;this.lastTime=now;
  if(!this.holding&&!this.focused&&now>=this.pauseUntil){
   this.position=(this.position+dt*.026)%this.period;
   this.el.scrollLeft=this.position;
   // Native scroll offsets can round to whole pixels. Preserve subpixel travel.
   this.track.style.transform=`translate3d(${this.el.scrollLeft-this.position}px,0,0)`;
  }else this.track.style.transform='none';
  this.raf=requestAnimationFrame(this.tick);
 }
 resetBlur(){this.visible=false;this.stop()}
 reset(){this.stop();this.holding=false;this.gesture=null;this.pauseUntil=0;this.track.style.transform='none'}
}
$$('.growth-offerings').forEach(track=>new GrowthLoop(track));
if(disabled)scenes.forEach(scene=>scene.reset?.());schedule();

addEventListener('mmm:launch-finished',()=>{scenes.forEach(scene=>scene.resize?.());schedule();});

// Menu jumps use a short camera rush, then an exact stop with no blur tail.
const navigationStretchFilter=document.createElementNS(blurSvg.namespaceURI,'filter');
navigationStretchFilter.id='navigation-stretch-blur';
for(const [name,value]of Object.entries({x:'-10%',y:'-100%',width:'120%',height:'300%','color-interpolation-filters':'sRGB'}))navigationStretchFilter.setAttribute(name,value);
const navigationStretch=document.createElementNS(blurSvg.namespaceURI,'feGaussianBlur');
navigationStretch.setAttribute('stdDeviation','0 0');navigationStretchFilter.append(navigationStretch);blurDefs.append(navigationStretchFilter);
let navigationFrame=0;
function stopNavigation(){
 cancelAnimationFrame(navigationFrame);navigationFrame=0;navigationRunning=false;
 document.documentElement.classList.remove('cinematic-navigation');
 navigationStretch.setAttribute('stdDeviation','0 0');
 scenes.forEach(scene=>{if(scene instanceof MotionBlur)scene.resetBlur()});schedule();
}
function navigateSection(target,hash){
 stopNavigation();
 const padding=parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)||0;
 const margin=parseFloat(getComputedStyle(target).scrollMarginTop)||0;
 const destination=clamp(scrollY+target.getBoundingClientRect().top-padding-margin,0,Math.max(0,document.documentElement.scrollHeight-innerHeight));
 const origin=scrollY,distance=destination-origin;
 history.pushState(null,'',hash);
 if(disabled||Math.abs(distance)<24){scrollTo({top:destination,behavior:'instant'});return}
 const duration=clamp(260+Math.sqrt(Math.abs(distance))*2,340,500);
 let start=0;navigationRunning=true;cancelAnimationFrame(frame);frame=0;document.documentElement.classList.add('cinematic-navigation');
 const step=now=>{
  if(disabled||document.hidden){stopNavigation();return}
  if(!start)start=now;const p=clamp((now-start)/duration);
  // A single constant-speed pass avoids lingering over intermediate sticky scenes.
  const travel=p;
  navigationStretch.setAttribute('stdDeviation',`.35 ${((mobile()?13:24)*Math.min(1,p/.07)).toFixed(2)}`);
  scrollTo({top:origin+distance*travel,behavior:'instant'});schedule();
  if(p<1)navigationFrame=requestAnimationFrame(step);
  else{scrollTo({top:destination,behavior:'instant'});stopNavigation();target.setAttribute('tabindex',target.getAttribute('tabindex')||'-1');target.focus({preventScroll:true})}
 };
 navigationFrame=requestAnimationFrame(step);
}
$$('header nav a').forEach(link=>link.addEventListener('click',event=>{
 if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 const url=new URL(link.href,location.href);
 if(url.origin!==location.origin||url.pathname!==location.pathname||!url.hash)return;
 const target=document.getElementById(decodeURIComponent(url.hash.slice(1)));if(!target)return;
 event.preventDefault();navigateSection(target,url.hash);
}));
for(const type of ['wheel','touchstart','pointerdown'])addEventListener(type,()=>{if(navigationRunning)stopNavigation()},{passive:true});
addEventListener('keydown',event=>{if(navigationRunning&&['Escape','ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key))stopNavigation()});
addEventListener('popstate',()=>{if(navigationRunning)stopNavigation()});
