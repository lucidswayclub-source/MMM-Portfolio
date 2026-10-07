/** MMM motion system. Native scroll, shared frame scheduling, no animation dependencies. */
const $=(s,root=document)=>root.querySelector(s), $$=(s,root=document)=>[...root.querySelectorAll(s)];
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const ease=t=>1-Math.pow(1-clamp(t),3);
const reducedQuery=matchMedia('(prefers-reduced-motion: reduce)');
const mobile=()=>matchMedia('(max-width: 700px)').matches;
const categoryDescriptions=['Ideas with a clear point of view. Stories shaped around your brand.','Photography and films made with intention, from the first frame to the final cut.','Thoughtful websites and content that connect your brand with its audience.','Creative thinking, purposeful distribution and a measurable way forward.'];
const groups=[['CREATIVE',['Scriptwriting','Creative Direction','Content Strategy']],['PRODUCTION',['Videography','Photography','Video Production','Video Editing']],['DIGITAL',['Social Media Management','Website Development','SEO']],['GROWTH',['Influencer Marketing','Meta Ads','Google Ads','Performance Marketing','PR & Press Releases']]];

class MotionDirector {
 constructor(){this.scenes=new Set();this.active=new Set();this.running=false;this.frame=0;this.y=scrollY;this.last=performance.now();this.velocity=0;this.disabled=reducedQuery.matches;this.observer=new IntersectionObserver(entries=>{for(const e of entries){const scenes=[...this.scenes].filter(s=>s.el===e.target);for(const scene of scenes){if(e.isIntersecting)this.active.add(scene);else{this.active.delete(scene);scene.idle?.()}}e.target.classList.toggle('in-view',e.isIntersecting)}this.schedule()},{rootMargin:'15% 0px'});this.schedule=this.schedule.bind(this);addEventListener('scroll',this.schedule,{passive:true});addEventListener('resize',()=>{this.scenes.forEach(s=>s.resize?.());this.schedule()},{passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(this.frame);this.frame=0}else this.schedule()});reducedQuery.addEventListener('change',()=>this.setDisabled(reducedQuery.matches));}
 add(scene){this.scenes.add(scene);this.observer.observe(scene.el);scene.resize?.();return scene}
 schedule(){if(!this.frame&&!this.disabled&&!document.hidden)this.frame=requestAnimationFrame(t=>this.render(t))}
 render(t){this.frame=0;const elapsed=Math.max(16,t-this.last),speed=Math.abs(scrollY-this.y)/elapsed;this.velocity=Math.min(1,speed/3);this.y=scrollY;this.last=t;const measurements=[...this.active].map(s=>[s,s.el.getBoundingClientRect()]);for(const [s,r]of measurements){const enter=clamp((innerHeight-r.top)/(innerHeight+Math.min(r.height,innerHeight)));const progress=clamp(-r.top/Math.max(1,r.height-innerHeight));s.update({r,enter,progress,velocity:this.velocity,time:t})}if(speed>.015)this.frame=requestAnimationFrame(t=>this.render(t));}
 setDisabled(value){this.disabled=value;document.documentElement.classList.toggle('motion-disabled',value);if(value){cancelAnimationFrame(this.frame);this.frame=0;this.scenes.forEach(s=>s.reset?.());document.getAnimations().forEach(a=>{try{a.finish()}catch{a.cancel()}});$('.logo-intro')?.remove();document.body.classList.remove('intro-playing')}else{this.scenes.forEach(s=>s.resize?.());this.schedule()}}
}
const director=new MotionDirector();

export class SectionReveal {
 constructor(el,{axis='y',distance=45}={}){this.el=el;this.axis=axis;this.distance=distance;el.classList.add('motion-section');director.add(this)}
 update({r}){const p=ease((innerHeight-r.top)/(innerHeight*.7));this.el.style.setProperty('--section-shift',`${(1-p)*this.distance}px`);this.el.style.setProperty('--section-alpha',String(.4+.6*p))}
 reset(){this.el.style.setProperty('--section-shift','0px');this.el.style.setProperty('--section-alpha','1')}
}
export class TextReveal {
 constructor(el,{stagger=65}={}){this.el=el;el.classList.add('text-reveal');const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);let index=0;for(const node of nodes){const frag=document.createDocumentFragment();for(const word of node.textContent.split(/(\s+)/)){if(!word.trim()){frag.append(document.createTextNode(word));continue}const mask=document.createElement('span');mask.className='word-mask';const inner=document.createElement('span');inner.textContent=word;inner.style.setProperty('--delay',`${index++*stagger}ms`);mask.append(inner);frag.append(mask)}node.replaceWith(frag)}const observer=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){el.classList.add('text-ready');observer.disconnect()}},{threshold:.15});observer.observe(el)}
}
export class ImageReveal {
 constructor(el,{direction='horizontal'}={}){this.el=el;this.direction=direction;el.classList.add('image-reveal');director.add(this)}
 update({r}){const p=ease((innerHeight-r.top)/(innerHeight*.78));const inset=(1-p)*35;this.el.style.clipPath=this.direction==='horizontal'?`inset(0 ${inset}% 0 ${inset}% round ${18*(1-p)}px)`:`inset(${inset}% 0 ${inset}% 0)`;}
 reset(){this.el.style.clipPath='none'}
}
export class VideoReveal extends ImageReveal {
 constructor(el,options){super(el,options);this.video=el.matches('video')?el:$('video',el);if(this.video){this.video.preload='none';this.video.playsInline=true}}
 idle(){this.video?.pause()}
}
export class ProjectReveal {
 constructor(el,{direction=1}={}){this.el=el;this.direction=direction;this.media=$('.project-image',el);this.caption=$('.project-caption',el);el.classList.add('project-reveal');director.add(this)}
 paint(p,exit=0){const factor=mobile()?.5:1;this.media.style.clipPath=`inset(${(1-p)*12}% ${(1-p)*18}% round ${12*(1-p)}px)`;this.media.style.transform=`perspective(1100px) translateX(${(1-p)*this.direction*35*factor}px) scale(${.82+.18*p}) rotateY(${(1-p)*this.direction*5*factor}deg)`;this.caption.style.opacity=String(clamp((p-.35)/.65));this.caption.style.transform=`translateY(${(1-p)*20}px)`;}
 update({r}){if(this.el.closest('.motion-exhibition'))return;const p=ease((innerHeight-r.top)/(innerHeight*.82));this.paint(p)}
 reset(){this.media.style.cssText='';this.caption.style.cssText=''}
}
export class HorizontalGallery {
 constructor(el){this.el=el;this.track=$('.project-grid',el);if(!this.track)return;el.classList.add('motion-exhibition');this.pin=document.createElement('div');this.pin.className='exhibition-pin';while(el.firstChild)this.pin.append(el.firstChild);el.append(this.pin);this.projects=$$('.project',this.track).map((p,i)=>new ProjectReveal(p,{direction:i%2?-1:1}));this.track.addEventListener('focusin',e=>{if(mobile()||director.disabled)return;const index=this.projects.findIndex(p=>p.el.contains(e.target));if(index<0)return;const fraction=index/Math.max(1,this.projects.length-1);window.scrollTo({top:scrollY+this.el.getBoundingClientRect().top+fraction*this.distance,behavior:'instant'})});director.add(this)}
 resize(){this.distance=Math.max(0,this.track.scrollWidth-this.pin.clientWidth);this.el.style.setProperty('--exhibition-distance',`${this.distance}px`)}
 update({r,progress}){if(mobile())return;this.track.style.transform=`translate3d(${-progress*this.distance}px,0,0)`;const widths=this.projects.map(x=>x.el.offsetWidth);this.projects.forEach((s,i)=>{const center=s.el.offsetLeft+widths[i]/2-progress*this.distance;const focal=clamp(1-Math.abs(center-this.pin.clientWidth*.48)/(this.pin.clientWidth*.9));s.paint(.25+.75*ease(focal))});this.pin.style.setProperty('--exhibition-progress',progress);}
 reset(){this.track.style.transform='none';this.projects.forEach(p=>p.reset())}
}
export class ThreeDUI {
 constructor(el,onSelect){this.el=el;el.className='three-d-ui';el.innerHTML=groups.map((g,i)=>`<button class="service-layer" style="--layer:${i}" data-layer="${i}" aria-pressed="${i===0}"><span>0${i+1}</span><strong>${g[0]}</strong><span aria-hidden="true">↗</span></button>`).join('');$$('button',el).forEach(b=>b.addEventListener('click',()=>onSelect(Number(b.dataset.layer))))}
 activate(group,p){this.el.style.setProperty('--panel-rotation',`${mobile()?0:(p-.5)*9}deg`);$$('button',this.el).forEach((b,i)=>b.setAttribute('aria-pressed',i===group))}
}
export class BlurTextScroller {
 constructor(section){this.el=document.createElement('div');this.el.className='service-sequence';const items=groups.flatMap((g,group)=>g[1].map(text=>({text,group})));this.items=items;this.el.innerHTML=`<div class="service-pin"><div class="service-focus" aria-hidden="true"><div class="service-group">CREATIVE</div><div class="service-words">${items.map((x,i)=>`<div class="service-word" data-word="${i}">${x.text}</div>`).join('')}</div><div class="service-position"><span>01</span><div><i></i></div><span>${String(items.length).padStart(2,'0')}</span></div></div><div class="service-panel"></div></div>`;section.insertBefore(this.el,$('.service-list',section));const label=$('.section-tag',section);if(label)$('.category-pin',this.el).prepend(label);this.words=$$('.service-word',this.el);this.ui=new ThreeDUI($('.service-panel',this.el),group=>{const n=items.findIndex(x=>x.group===group);if(director.disabled){this.focus(n,0);return}const target=scrollY+this.el.getBoundingClientRect().top+(n/(items.length-1))*Math.max(1,this.el.offsetHeight-innerHeight);scrollTo({top:target,behavior:'smooth'})});director.add(this)}
 focus(position,velocity){const nearest=Math.round(position);this.words.forEach((word,i)=>{const delta=i-position,active=Math.abs(delta)<.5;word.style.transform=`translate3d(${delta*(mobile()?8:24)}px,${delta*(mobile()?92:112)}px,0) scale(${1-Math.min(.15,Math.abs(delta)*.06)})`;word.style.opacity=String(clamp(1-Math.abs(delta)*.6));word.style.filter=`blur(${active?0:Math.min(5,Math.abs(delta)*2.5+velocity*1.2)}px)`});$('.service-group',this.el).textContent=groups[this.items[nearest].group][0];$('.service-position>span',this.el).textContent=String(nearest+1).padStart(2,'0');$('.service-position i',this.el).style.transform=`scaleX(${(position+1)/this.items.length})`;this.ui.activate(this.items[nearest].group,position/(this.items.length-1));}
 update({progress,velocity}){this.focus(progress*(this.items.length-1),velocity)}
 reset(){this.focus(0,0)}
}
export class Browser3D {
 constructor(el){this.el=el;this.browser=$('.browser-object',el);director.add(this)}
 update({r}){const p=clamp((innerHeight-r.top)/(innerHeight+Math.min(r.height,innerHeight)*.2));const arrival=ease(p*1.8),phone=clamp((p-.6)/.4);this.browser.style.transform=`perspective(1200px) translateY(${(1-arrival)*65}px) rotateY(${(1-arrival)*(mobile()?4:-14)}deg) rotateX(${(1-arrival)*7}deg) scale(${.78+.22*arrival})`;this.browser.style.width=`${100-phone*38}%`;this.browser.style.borderRadius=`${12+phone*20}px`;this.browser.classList.toggle('is-phone',phone>.55);}
 reset(){this.browser.style.cssText=''}
}
export class LogoReveal {
 constructor(){this.logo=$('.hero-logo');if(!this.logo)return;this.el=$('.hero');director.add(this);this.start()}
 async start(){
  if(director.disabled){document.body.classList.add('hero-entered');return}
  // Each homepage document load, including refresh, gets an opening sequence.
  // A persisted back/forward page does not reload this module.
  const navigation=performance.getEntriesByType('navigation')[0];
  if(navigation?.type==='reload'&&!location.hash){history.scrollRestoration='manual';window.scrollTo({top:0,behavior:'instant'})}
  if(location.hash||scrollY>50){document.documentElement.classList.remove('intro-pending');document.body.classList.add('hero-entered');return}
  document.body.classList.add('intro-playing');
  $$('header,main,footer').forEach(el=>el.inert=true);
  const overlay=document.createElement('div');overlay.className='logo-intro';
  overlay.innerHTML='<div class="intro-seed"></div><div class="intro-flight"><img src="/assets/mmm-logo.jpg" alt=""></div><button class="intro-skip">Skip intro</button>';
  overlay.setAttribute('aria-label','MegMultiMedia logo introduction');document.body.append(overlay);document.documentElement.classList.remove('intro-pending');
  const mark=$('.intro-flight',overlay),image=$('img',mark),seed=$('.intro-seed',overlay);this.overlay=overlay;
  let done=false;const animations=[];
  const finish=()=>{if(done)return;done=true;animations.forEach(a=>a.cancel());overlay.remove();$$('header,main,footer').forEach(el=>el.inert=false);document.body.classList.remove('intro-playing','intro-pending');document.body.classList.add('hero-entered');history.scrollRestoration='auto';director.schedule()};
  $('.intro-skip',overlay).addEventListener('click',finish);
  const cancel=()=>{if(scrollY>20)finish()};addEventListener('scroll',cancel,{passive:true});
  const onResize=()=>finish();addEventListener('resize',onResize,{once:true});
  const play=(el,frames,options)=>{const animation=el.animate(frames,{fill:'forwards',...options});animations.push(animation);return animation.finished};
  const timeout=setTimeout(finish,3000);
  try{
   await image.decode().catch(()=>{});if(done)return;
   // Measure the untransformed image. The flight ends on exactly the hero's plane.
   this.logo.style.transform='none';const target=this.logo.getBoundingClientRect();
   const end='perspective(1100px) translate3d(0px,0px,0px) scale(1) rotate(-9deg) rotateY(-15deg)';this.logo.style.transform=end;
   Object.assign(mark.style,{left:`${target.left}px`,top:`${target.top}px`,width:`${target.width}px`,height:`${target.height}px`});
   const scale=Math.min(mobile()?.84:.62,480/target.width);
   const dx=innerWidth/2-(target.left+target.width/2),dy=innerHeight/2-(target.top+target.height/2);
   const start=`perspective(1100px) translate3d(${dx}px,${dy}px,0px) scale(${scale}) rotate(0deg) rotateY(0deg)`;
   mark.style.transform=start;
   // Match the seed to the original mint container so the logo never pops between sizes.
   seed.style.width=`${target.width*scale*.854}px`;seed.style.height=`${target.height*scale*.365}px`;
   seed.style.top=`${innerHeight/2-target.height*scale*.011}px`;
   await play(seed,[{transform:'translate(-50%,-50%) scale(.09,.16)',opacity:0},{transform:'translate(-50%,-50%) scale(.16,1)',opacity:1,offset:.35},{transform:'translate(-50%,-50%) scale(1)',opacity:1}],{duration:450,easing:'cubic-bezier(.25,.1,.25,1)'});
   if(done)return;
   mark.style.visibility='visible';
   await Promise.all([play(image,[{opacity:0,clipPath:'inset(30% 48% 33% 48%)'},{opacity:1,clipPath:'inset(29% 5% 31% 5%)'}],{duration:450,easing:'cubic-bezier(.22,1,.36,1)'}),play(seed,[{opacity:1},{opacity:0}],{duration:400,easing:'ease-in-out'})]);
   if(done)return;
   // The backdrop retracts as the same logo travels into place; no logo crossfade.
   overlay.classList.add('intro-opening');document.body.classList.add('hero-entered');
   await play(mark,[{transform:start,offset:0},{transform:start,offset:.1},{transform:end,offset:1}],{duration:900,easing:'cubic-bezier(.65,0,.25,1)'});
   finish();
  }catch{finish()}finally{clearTimeout(timeout);removeEventListener('scroll',cancel);removeEventListener('resize',onResize)}
 }

 update({r}){if(document.body.classList.contains('intro-playing'))return;const p=clamp(-r.top/(r.height*.85));this.el.style.setProperty('--hero-scroll',p);this.logo.style.transform=`perspective(1100px) translate3d(${p*(mobile()?15:70)}px,${p*-35}px,0) scale(${1-p*.22}) rotate(${-9+p*6}deg) rotateY(${-15+p*10}deg)`;}
 reset(){this.overlay?.remove();$$('header,main,footer').forEach(el=>el.inert=false);this.logo.style.transform='';document.body.classList.remove('intro-playing');document.body.classList.add('hero-entered')}
}
export class PageTransition {constructor(){/* Browser-native transitions preserve history, links, and download behavior. */document.documentElement.classList.add('page-motion')}}
class GrowthSequence {
 constructor(el){this.el=el;this.console=$('.growth-console',el);this.title=$('#stage-title',el);this.tabs=$$('[data-stage]',el);this.words=['CREATIVITY','ATTENTION','AUDIENCE','PERFORMANCE','GROWTH'];this.visual=document.createElement('div');this.visual.className='growth-word-stage';this.visual.setAttribute('aria-hidden','true');this.visual.innerHTML=this.words.map(w=>`<span>${w}</span>`).join('');el.insertBefore(this.visual,$('.growth-layout',el));this.wordEls=$$('span',this.visual);this.manual=false;this.tabs.forEach(b=>b.addEventListener('click',()=>{this.manual=true;this.paint(Number(b.dataset.stage),0)}));director.add(this)}
 paint(n,f){this.wordEls.forEach((e,i)=>{e.style.transform=`translateX(${(i-n)*32}%) scale(${i===n?1:.88})`;e.style.opacity=i===n?'1':'0';e.style.filter=`blur(${i===n?0:5}px)`})}
 update({r}){const p=clamp((innerHeight*.7-r.top)/(innerHeight*.95));const n=Math.min(4,Math.floor(p*5));if(!this.manual)this.paint(n,p);this.console.style.transform=`perspective(1200px) rotateX(${(1-ease(p))*4}deg) translateY(${(1-ease(p))*30}px)`;}
 reset(){this.paint(0,0);this.console.style.transform='none'}
}
class ProductionSequence {
 constructor(el){this.el=el;this.steps=$$('.process span',el);this.image=$('.bts-photo',el);director.add(this)}
 update({r}){const p=clamp((innerHeight-r.top)/(innerHeight+r.height*.3));const index=Math.min(this.steps.length-1,Math.floor(p*this.steps.length));this.steps.forEach((s,i)=>s.classList.toggle('current',i===index));this.image.style.clipPath=`inset(0 ${Math.max(0,25*(1-p*2))}% 0 0)`;$('img',this.image).style.transform=`scale(${1.08-p*.08}) translateY(${(1-p)*10}px)`;}
 reset(){this.image.style.clipPath='none';$('img',this.image).style.transform='none'}
}
class Finale {
 constructor(el){this.el=el;const logo=document.createElement('div');logo.className='finale-logo';logo.innerHTML='<img src="/assets/mmm-logo.jpg" alt="MMM">';el.insertBefore(logo,$('.cta-bottom',el));director.add(this)}
 update({r}){const p=ease((innerHeight-r.top)/(innerHeight*.8));this.el.style.setProperty('--finale-fill',`${(1-p)*100}%`);this.el.style.setProperty('--finale-logo-x',`${(1-p)*70}px`);this.el.style.setProperty('--finale-logo-alpha',p);this.el.classList.toggle('finale-ready',p>.6)}
 reset(){this.el.style.setProperty('--finale-fill','0%');this.el.style.setProperty('--finale-logo-x','0px');this.el.style.setProperty('--finale-logo-alpha','1');this.el.classList.add('finale-ready')}
}

export class ServiceCategoryScroller {
 constructor(section){
  this.el=document.createElement('div');this.el.className='category-scene';this.active=-1;
  this.el.innerHTML=`<div class="category-pin"><div class="category-layout"><div class="category-wheel" role="tablist" aria-label="Service categories" aria-orientation="vertical"><span class="category-pointer" aria-hidden="true">→</span>${groups.map((g,i)=>`<button class="category-option" role="tab" id="category-${i}" aria-controls="category-services" aria-selected="${i===0}" tabindex="${i===0?0:-1}" data-category="${i}">${g[0]}</button>`).join('')}</div><div class="category-detail"><span class="category-detail-label">SERVICES</span><div id="category-services" role="tabpanel" aria-labelledby="category-0" tabindex="0"><p class="category-description"></p><ul></ul></div></div></div><div class="category-progress" aria-hidden="true"><span>01 / 04</span><div><i></i></div></div></div>`;
  section.classList.add('has-category-scroller');section.insertBefore(this.el,$('.service-list',section));const label=$('.section-tag',section);if(label)$('.category-pin',this.el).prepend(label);
  this.buttons=$$('.category-option',this.el);this.buttons.forEach((button,i)=>{button.addEventListener('click',()=>this.choose(i));button.addEventListener('keydown',e=>{let n=i;if(e.key==='ArrowDown'||e.key==='ArrowRight')n=(i+1)%4;else if(e.key==='ArrowUp'||e.key==='ArrowLeft')n=(i+3)%4;else if(e.key==='Home')n=0;else if(e.key==='End')n=3;else return;e.preventDefault();this.choose(n);this.buttons[n].focus({preventScroll:true})})});const wheel=$('.category-wheel',this.el);[-4,-3,-2,-1,4,5,6,7].forEach(n=>{const echo=document.createElement('span');echo.className='category-option category-orbit-echo';echo.textContent=groups[(n+8)%4][0];echo.dataset.orbitIndex=n;echo.setAttribute('aria-hidden','true');wheel.append(echo)});this.buttons.forEach((b,i)=>b.dataset.orbitIndex=i);this.orbitItems=$$('.category-option',this.el);this.paint(0,0);director.add(this);
 }
 choose(i){this.paint(i,0);if(!director.disabled){const distance=Math.max(1,this.el.offsetHeight-this.el.querySelector(".category-pin").offsetHeight);scrollTo({top:scrollY+this.el.getBoundingClientRect().top-(parseFloat(getComputedStyle(this.el.querySelector(".category-pin")).top)||0)+distance*i/3,behavior:'instant'})}}
 paint(position,velocity){const chosen=Math.round(position);const wheel=$('.category-wheel',this.el);const radius=mobile()?190:Math.min(420,wheel.clientWidth*.72);const step=mobile()?.40:.34;this.orbitItems.forEach(button=>{const i=Number(button.dataset.orbitIndex),d=i-position,angle=d*step;const active=i===chosen;button.style.visibility=Math.abs(d)>3.2?'hidden':'visible';button.style.setProperty('--category-y',`${Math.sin(angle)*radius}px`);button.style.setProperty('--category-x',`${(1-Math.cos(angle))*radius}px`);button.style.setProperty('--category-angle',`${angle*180/Math.PI}deg`);button.style.setProperty('--category-blur',`${active?0:Math.min(2.4,Math.abs(d)*1.1+velocity*.35)}px`);button.style.setProperty('--category-opacity',String(active?1:Math.max(.18,.62-Math.abs(d)*.12)));if(!button.classList.contains('category-orbit-echo')){button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1}});

  if(chosen!==this.active){this.active=chosen;const panel=$('#category-services',this.el);panel.setAttribute('aria-labelledby',`category-${chosen}`);$('.category-description',panel).textContent=categoryDescriptions[chosen];const list=$('ul',panel);list.replaceChildren(...groups[chosen][1].map((text,i)=>{const li=document.createElement('li');li.textContent=text;if(!director.disabled)li.animate([{opacity:0,transform:'translateY(12px)',filter:'blur(3px)'},{opacity:1,transform:'translateY(0)',filter:'blur(0)'}],{duration:420,delay:i*55,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});return li}));$('.category-progress>span',this.el).textContent=`0${chosen+1} / 04`}
  $('.category-progress i',this.el).style.transform=`scaleX(${(position+1)/4})`;
 }
 update({r,velocity}){const pin=this.el.querySelector(".category-pin");const top=parseFloat(getComputedStyle(pin).top)||0;const progress=clamp((top-r.top)/Math.max(1,r.height-pin.offsetHeight));const raw=progress*3,base=Math.floor(raw),f=clamp((raw-base-.18)/.64),smooth=f*f*(3-2*f);this.paint(Math.min(3,base+smooth),velocity)}
 reset(){this.paint(Math.max(0,this.active),0)}
}

new PageTransition();
$$('.section-heading h2,.bts-copy h2,.digital h2,.about-grid h2,.founder h2,.cta h2,.page-heading h1,.growth-manifesto h2').forEach(el=>new TextReveal(el));
$$('.work-section').forEach(el=>new HorizontalGallery(el));
$$('.project:not(.work-section .project)').forEach((el,i)=>new ProjectReveal(el,{direction:i%2?-1:1}));
$$('.capabilities').forEach(el=>new ServiceCategoryScroller(el));
$$('.growth-section').forEach(el=>new GrowthSequence(el));
$$('.bts').forEach(el=>new ProductionSequence(el));
$$('.browser-stage').forEach(el=>new Browser3D(el));
$$('.about-grid,.growth-offerings article').forEach(el=>new SectionReveal(el));
$$('.about-strip').forEach(el=>{const blocks=document.createElement('div');blocks.className='about-blocks';blocks.innerHTML=groups.map((g,i)=>`<span style="--block:${i}">${g[0]}</span>`).join('');el.append(blocks);new SectionReveal(blocks)});

$$('video').forEach(el=>new VideoReveal(el));
$$('.cta').forEach(el=>new Finale(el));
new LogoReveal();
setTimeout(()=>document.body.classList.add("hero-settled"),3200);
// Pause decorative loops offscreen. One observer covers every repeating element.
const loops=new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle('loop-visible',e.isIntersecting)),{threshold:0});$$('.signal,.ticker').forEach(el=>loops.observe(el));
const toggle=document.createElement('button');toggle.className='motion-toggle';toggle.type='button';toggle.textContent=director.disabled?'Enable motion':'Pause motion';toggle.setAttribute('aria-pressed',String(director.disabled));toggle.addEventListener('click',()=>{director.setDisabled(!director.disabled);toggle.textContent=director.disabled?'Enable motion':'Pause motion';toggle.setAttribute('aria-pressed',String(director.disabled))});$('footer').append(toggle);
if(director.disabled)director.setDisabled(true);director.schedule();

// Pointer depth is confined to media containers so it cannot fight scroll transforms.
if(matchMedia('(pointer:fine)').matches){$$('.logo-world,.project,.browser-stage').forEach(el=>{let pending=0,x=0,y=0;el.addEventListener('pointermove',event=>{if(director.disabled||document.body.classList.contains('intro-playing'))return;const r=el.getBoundingClientRect();x=(event.clientX-r.left)/r.width-.5;y=(event.clientY-r.top)/r.height-.5;if(!pending)pending=requestAnimationFrame(()=>{pending=0;el.style.transform=`perspective(1200px) rotateX(${-y*4}deg) rotateY(${x*5}deg)`})});el.addEventListener('pointerleave',()=>{cancelAnimationFrame(pending);pending=0;el.style.transform=''})})}

// A native pixel-camera cursor stays perfectly attached to the pointer, without a render loop.
// Text fields keep the normal text cursor; coarse pointers retain platform behavior.
const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
function installCameraCursor(){document.documentElement.classList.toggle('camera-cursor',finePointer.matches)}
installCameraCursor();finePointer.addEventListener('change',installCameraCursor);
const shutter=document.createElement('span');shutter.className='cursor-shutter';shutter.setAttribute('aria-hidden','true');document.body.append(shutter);
document.addEventListener('pointerdown',event=>{if(!finePointer.matches||event.pointerType==='touch'||event.target.closest('input,textarea,select,[contenteditable="true"]'))return;shutter.style.left=`${event.clientX}px`;shutter.style.top=`${event.clientY}px`;shutter.classList.remove('snap');if(!director.disabled){void shutter.offsetWidth;shutter.classList.add('snap')}});
shutter.addEventListener('animationend',()=>shutter.classList.remove('snap'));

class DirectorPortraitSequence {
 constructor(el){
  this.el=el;el.classList.add('director-sequence');
  this.photo=el.querySelector('.founder-portrait');this.bio=el.querySelector('.founder-bio');
  const pin=document.createElement('div');pin.className='director-pin';
  this.card=document.createElement('div');this.card.className='director-card director-shutter';
  this.frame=document.createElement('div');this.frame.className='director-aperture';this.frame.append(this.photo);
  this.label=document.createElement('div');this.label.className='director-frame-label';this.label.setAttribute('aria-hidden','true');this.label.innerHTML='<span>MMM / PORTRAIT 01</span><span>THE PERSON BEHIND THE VISION</span>';
  this.word=document.createElement('span');this.word.className='director-focus-word';this.word.innerHTML='<span class="director-focus-rest">BEH</span><span class="director-letter-i" aria-hidden="true">I</span><span class="director-focus-rest">ND THE WORK.</span>';this.word.setAttribute('aria-hidden','true');
  this.card.append(this.word,this.frame,this.bio,this.label);pin.append(this.card);el.append(pin);director.add(this);if(director.disabled)this.reset();
 }
 update({r}){
  if(mobile()){this.reset();return}
  const p=clamp(-r.top/Math.max(1,r.height-this.el.querySelector('.director-pin').offsetHeight));
  this.word.style.opacity='1';
  const open=clamp((p-.07)/.66),t=open*open*(3-2*open),reveal=clamp((p-.65)/.27);
  // Measure the stationary letter box; only its siblings move, keeping registration exact.
  const letter=this.word.querySelector('.director-letter-i').getBoundingClientRect(),card=this.card.getBoundingClientRect();
  const width=this.frame.offsetWidth,height=this.frame.offsetHeight;
  const strip=letter.width,capHeight=letter.height;
  const insetX=(1-strip/width)*50*(1-t),insetY=(1-capHeight/height)*50*(1-t);
  const fromX=letter.left+strip/2-card.left-(this.frame.offsetLeft+width/2),fromY=letter.top+capHeight/2-card.top-(this.frame.offsetTop+height/2);
  this.frame.style.clipPath=`inset(${insetY}% ${insetX}% round ${t*2}px)`;
  this.frame.style.transform=`translate(${fromX*(1-t)}px,${fromY*(1-t)}px)`;
  this.photo.style.transform=`scale(${1.12-.12*t})`;this.word.querySelector('.director-letter-i').style.opacity=String(1-clamp(t*4));
  this.word.querySelectorAll('.director-focus-rest').forEach(rest=>{rest.style.transform=`translateY(${-t*190}px)`;rest.style.opacity=String(1-clamp(t*1.5));rest.style.filter=`blur(${t*3}px)`});
  this.bio.style.opacity=String(reveal);this.bio.style.transform=`translateY(${(1-reveal)*30}px)`;
  this.bio.style.clipPath=`inset(0 0 ${(1-reveal)*100}% 0)`;
  this.card.style.setProperty('--focus',String(t));
 }
 reset(){this.frame.style.clipPath='none';this.frame.style.transform='none';this.photo.style.transform='none';this.word.style.opacity='0';this.bio.style.opacity='1';this.bio.style.transform='none';this.bio.style.clipPath='none';this.card.style.setProperty('--focus','1')}
}
document.querySelectorAll('.founder').forEach(el=>new DirectorPortraitSequence(el));
