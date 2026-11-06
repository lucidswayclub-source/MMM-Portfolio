const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'../dist');
const profile=fs.readFileSync(path.join(root,'performance.js'),'utf8');
function qualityEnvironment({memory=16,cores=12,coarse=false,saveData=false}={}){
 let now=0,frame=0;const frames=new Map(),events={},docEvents={},classes=new Set();
 const document={hidden:false,documentElement:{dataset:{},classList:{contains:v=>classes.has(v),toggle(v,on){on?classes.add(v):classes.delete(v)}}},addEventListener(k,fn){docEvents[k]=fn}};
 const context={window:{},navigator:{deviceMemory:memory,hardwareConcurrency:cores,connection:{saveData}},document,matchMedia:q=>({matches:q.includes('prefers-reduced')?false:coarse}),performance:{now:()=>now},requestAnimationFrame(fn){frames.set(++frame,fn);return frame},cancelAnimationFrame(id){frames.delete(id)},addEventListener(k,fn){events[k]=fn}};
 vm.runInNewContext(profile,context);
 return{context,events,docEvents,classes,frames,step(dt){now+=dt;const callbacks=[...frames.values()];frames.clear();for(const f of callbacks)f(now)}};
}
test('device hints choose conservative initial quality and capped render resolution',()=>{
 for(const [input,level,ratio]of [[{},2,1.5],[{coarse:true},1,1.25],[{memory:4},0,1],[{cores:4},0,1],[{saveData:true},0,1],[{memory:0,cores:0},2,1.5]]){
  const e=qualityEnvironment(input);assert.equal(e.context.window.MMMPerformance.level,level);assert.equal(e.context.window.MMMPerformance.pixelRatio,ratio);
 }
});
test('sustained dropped frames downgrade quality; healthy frames do not',()=>{
 const slow=qualityEnvironment();let changes=0;slow.context.window.MMMPerformance.subscribe(()=>changes++);
 for(let i=0;i<260;i++){slow.events.scroll();slow.step(40)}
 assert.equal(slow.context.window.MMMPerformance.level,0);assert.equal(changes,2);
 const healthy=qualityEnvironment();for(let i=0;i<400;i++){healthy.events.scroll();healthy.step(16.67)}assert.equal(healthy.context.window.MMMPerformance.level,2);
});
test('hidden pages cancel sampling and expose a CSS animation pause',()=>{
 const e=qualityEnvironment();e.events.scroll();assert.equal(e.frames.size,1);e.context.document.hidden=true;e.docEvents.visibilitychange();assert.equal(e.frames.size,0);assert(e.classes.has('page-suspended'));
 e.context.document.hidden=false;e.docEvents.visibilitychange();assert(!e.classes.has('page-suspended'));
});
test('one element is measured once even when multiple scenes share it; idle effects are skipped',()=>{
 const source=fs.readFileSync(path.join(root,'motion.js'),'utf8');const start=source.indexOf('const scenes=new Set()'),end=source.indexOf("document.addEventListener('scroll'",start);let observer,reads=0,observations=0,updates=0;
 const element={classList:{toggle(){}},getBoundingClientRect(){reads++;return{top:0,bottom:500}}};
 const c={disabled:false,navigationRunning:false,frame:0,document:{hidden:false,documentElement:{classList:{contains:()=>false}}},IntersectionObserver:class{constructor(fn){observer=fn}observe(){observations++}},requestAnimationFrame:()=>1};
 vm.createContext(c);vm.runInContext(source.slice(start,end)+'this.register=add;this.renderFrame=render;',c);
 c.register({el:element,update(){updates++}});c.register({el:element,update(){updates++}});c.register({el:element,needsFrame:false,update(){throw Error('Idle scene ran')}});
 observer([{target:element,isIntersecting:true}]);c.renderFrame();assert.equal(reads,1);assert.equal(observations,1);assert.equal(updates,2);
});
test('all entry points load quality selection before intro; required assets exist',()=>{
 for(const file of ['index.html','contact/index.html','404.html']){
  const html=fs.readFileSync(path.join(root,file),'utf8');assert(html.indexOf('/performance.js')<html.indexOf('/launch-intro.js'));assert(html.includes('/performance.js'));assert(html.includes('/theme-flow.css?v=dji-flight-70'));
 }
 assert(fs.statSync(path.join(root,'assets/mmm-logo-web.png')).size<fs.statSync(path.join(root,'assets/mmm-logo-transparent.png')).size*.4);
});
test('Light intro avoids constructing WebGL and still reveals the page and restores focus',async()=>{
 const source=fs.readFileSync(path.join(root,'launch-intro.js'),'utf8').replace(/import\('\/intro-sound.js\?v=2'\)/g,'Promise.resolve({IntroSound})').replace(/import\('\/travelling-camera.js\?v=17'\)/g,'Promise.resolve({TravellingCamera})');
 const events={},frames=new Map(),timers=new Map();let id=0,intro,finished=false,construction=0,focus=0,position=420;
 const classes=()=>({values:new Set(),add(...v){v.forEach(x=>this.values.add(x))},remove(...v){v.forEach(x=>this.values.delete(x))},contains(x){return this.values.has(x)}});
 const elements=new Map();const element=key=>{
  if(elements.has(key))return elements.get(key);
  const e={classList:classes(),style:{setProperty(){}},clientWidth:440,inert:false,setAttribute(){},addEventListener(k,f){this[k]=f},append(){},prepend(){},animate(){},focus(){focus++},remove(){},querySelector:s=>element(key+s),querySelectorAll:s=>s==='img'?images:s==='.launch-parts>span'?parts:[]};elements.set(key,e);return e;
 };
 const images=Array.from({length:4},()=>({decode:async()=>{},naturalWidth:960,naturalHeight:341})),parts=Array.from({length:3},(_,i)=>element('part'+i));const pageRoots=[{inert:false}];
 const context={window:{MMMPerformance:{level:0,pixelRatio:1},addEventListener(){},removeEventListener(){}},location:{pathname:'/',hash:''},history:{scrollRestoration:'auto'},scrollTo(options){position=options.top},matchMedia:()=>({matches:false}),document:{hidden:false,readyState:'complete',activeElement:null,documentElement:{classList:classes()},body:{append(e){intro=e}},querySelector:s=>element(s),querySelectorAll:()=>pageRoots,createElement:()=>element('new'+id++),addEventListener(){},removeEventListener(){}},CSS:{supports:()=>true},performance:{now:()=>0},innerWidth:390,innerHeight:844,devicePixelRatio:1,requestAnimationFrame(f){frames.set(++id,f);return id},cancelAnimationFrame(i){frames.delete(i)},setTimeout(f,ms){timers.set(++id,{f,ms});return id},clearTimeout(i){timers.delete(i)},dispatchEvent(){finished=true},Event:class{},IntroSound:class{enable(){return Promise.resolve(false)}update(){}dispose(){}mute(){}},TravellingCamera:class{constructor(){construction++}},console};
 vm.runInNewContext(source,context);for(let i=0;i<12;i++)await Promise.resolve();
 assert.equal(construction,0);assert.equal(position,0);assert.equal(context.history.scrollRestoration,'manual');assert(intro.classList.contains('is-fallback'));assert(pageRoots[0].inert);
 for(let t=16;t<1800;t+=16){const callbacks=[...frames.values()];frames.clear();callbacks.forEach(f=>f(t))}
 assert(intro.classList.contains('is-exiting'));
 const cleanup=[...timers.values()].find(t=>t.ms===1200);assert(cleanup);cleanup.f();assert(!pageRoots[0].inert);assert(finished);assert(focus>0);assert(!context.document.documentElement.classList.contains('launch-active'));assert.equal(position,0);const finalFrames=[...frames.values()];frames.clear();finalFrames.forEach(f=>f(3200));assert.equal(context.history.scrollRestoration,'auto');
});
test('selection highlight stays aligned inside a horizontally scrolled phone tab bar',()=>{
 const source=fs.readFileSync(path.join(root,'motion.js'),'utf8');const start=source.indexOf(' const sync=()=>{',source.indexOf("$$('.preview-toggle,.growth-steps')")),end=source.indexOf(' new MutationObserver(sync)',start);
 let selectedLeft=200,scrollTarget=null;
 const indicator={style:{},getBoundingClientRect:()=>({left:0,top:0,width:0}),getAnimations:()=>[]};
 const selected={offsetWidth:80,get offsetLeft(){return selectedLeft},offsetHeight:44,getBoundingClientRect(){return{left:40+(selectedLeft-120+2)*2,top:34,width:160,height:88}}};
 const group={scrollLeft:120,scrollTop:0,scrollWidth:600,clientWidth:300,clientLeft:2,clientTop:2,offsetWidth:300,classList:{add(){}},getBoundingClientRect:()=>({left:40,top:10,width:600}),scrollTo(options){scrollTarget=options.left}};
 const c={indicator,group,started:false,disabled:false,$:()=>selected,mobile:()=>true};vm.createContext(c);vm.runInContext(source.slice(start,end)+'this.sync=sync;',c);
 c.sync();assert.equal(indicator.style.transform,'translate3d(200px,10px,0)');assert.equal(scrollTarget,null);
 c.started=false;selectedLeft=500;c.sync();assert.equal(indicator.style.transform,'translate3d(500px,10px,0)');assert(scrollTarget<=500&&scrollTarget+300>=580);
});
test('service dial sound unlocks on normal interaction without controls, throttles clicks and stops offscreen',async()=>{
 const source=fs.readFileSync(path.join(root,'service-sound.js'),'utf8').replace('export class ServiceDialSound','class ServiceDialSound').replace('export function getSiteSound','function getSiteSound')+'\nthis.DialSound=ServiceDialSound;';
 let contexts=0,played=0,visibility,intersection;const classes=new Set(),events={};
 const node=()=>({connect(){},disconnect(){},gain:{value:0,setValueAtTime(){},setTargetAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},frequency:{value:0,setValueAtTime(){},setTargetAtTime(){},exponentialRampToValueAtTime(){}},Q:{value:0}});
 class AudioContext{
  constructor(){contexts++;this.state='suspended';this.sampleRate=8000;this.currentTime=0;this.destination={}}
  createOscillator(){return{...node(),start(){played++},stop(){this.onended?.()}}}createGain(){return node()}createBuffer(){return{getChannelData:()=>new Float32Array(720)}}createBiquadFilter(){return node()}
  createBufferSource(){return{...node(),start(){played++},stop(){this.onended?.()}}}
  async resume(){this.state='running'}async suspend(){this.state='suspended'}
 }
 const c={setTimeout:()=>1,clearTimeout(){},window:{AudioContext,addEventListener(){}},document:{hidden:false,documentElement:{classList:{contains:v=>classes.has(v)}},createElement(){throw Error('Sound must not add a toggle')},addEventListener(k,f){events[k]=f;if(k==='visibilitychange')visibility=f}},IntersectionObserver:class{constructor(fn){intersection=fn}observe(){}}};
 vm.createContext(c);vm.runInContext(source,c);const dial=new c.DialSound({querySelector:()=>({append(){}})});
 dial.update(0);dial.update(.3);assert.equal(contexts,0);assert.equal(played,0);
 await events.pointerdown();assert.equal(contexts,1);assert.equal(played,0);assert(dial.enabled);assert.equal(dial.output.gain.value,.65);
 intersection([{isIntersecting:true}]);dial.context.currentTime=1;dial.update(.6,true);assert.equal(played,1);dial.context.currentTime=1.01;dial.update(.8);assert.equal(played,1);
 intersection([{isIntersecting:false}]);dial.context.currentTime=2;dial.update(1,true);assert.equal(played,1);
 intersection([{isIntersecting:true}]);classes.add('cinematic-navigation');dial.update(2,true);assert.equal(played,1);classes.clear();
 c.document.hidden=true;visibility();dial.context.currentTime=3;dial.update(3,true);assert.equal(played,1);assert(!dial.enabled);assert.equal(dial.nodes.size,0);
});
test('a new tap retries an audio resume left pending by the browser',async()=>{
 const source=fs.readFileSync(path.join(root,'service-sound.js'),'utf8').replace('export class ServiceDialSound','class ServiceDialSound').replace('export function getSiteSound','function getSiteSound')+'\nthis.DialSound=ServiceDialSound;';
 let resumeCalls=0,release;const events={};
 class AudioContext{
  constructor(){this.state='suspended';this.sampleRate=8000}
  createGain(){return{gain:{},connect(){}}}createBuffer(){return{getChannelData:()=>new Float32Array(2400)}}
  resume(){resumeCalls++;if(resumeCalls===1)return new Promise(resolve=>{release=resolve});this.state='running';release();return Promise.resolve()}
 }
 const c={window:{AudioContext,addEventListener(){}},document:{hidden:false,addEventListener(name,fn){events[name]=fn}}};vm.createContext(c);vm.runInContext(source,c);
 const dial=new c.DialSound();const pending=dial.unlock();assert.equal(resumeCalls,1);await events.touchend();await pending;assert.equal(resumeCalls,2);assert(dial.enabled);
});
test('phone wordmark shrinks only when its rendered text exceeds available width',()=>{
 const source=fs.readFileSync(path.join(root,'app.js'),'utf8');const code=source.slice(source.indexOf('function fitHeroWordmark(){'),source.indexOf("const heroIntro=document.querySelector('.hero-intro')"))+'this.fit=fitHeroWordmark;';
 let natural=420,width=300,phone=true;const style={fontSize:'',removeProperty(){this.fontSize=''}};
 const heading={style,querySelector:()=>({get scrollWidth(){return natural}})},hero={get clientWidth(){return width}};
 const c={document:{querySelector:s=>s==='.hero-wordmark'?heading:hero},matchMedia:()=>({matches:phone}),getComputedStyle:()=>({fontSize:'42px'})};vm.createContext(c);vm.runInContext(code,c);
 c.fit();assert.equal(style.fontSize,'28.8px');natural=220;c.fit();assert.equal(style.fontSize,'');phone=false;natural=800;c.fit();assert.equal(style.fontSize,'');
});
test('floating camera is mounted inside a clipping layer and disposed when motion is unavailable',()=>{
 const source=fs.readFileSync(path.join(root,'motion.js'),'utf8');const a=source.indexOf('const floatingCameraMedia='),b=source.indexOf('if(disabled)',a);let media,created=0,disposed=0,mounted=0,intro=true;
 const c={quality:()=>1,disabled:false,scenes:new Set(),active:new Set(),matchMedia:()=>media={matches:false,addEventListener(name,fn){this.change=fn}},document:{createElement:()=>({setAttribute(){},append(){mounted++},remove(){}}),body:{append(){},classList:{contains:()=>true}},documentElement:{classList:{contains:()=>intro}}},TravellingCamera:class{constructor(){created++;this.gl={};this.el={}}resize(){}dispose(){disposed++}}};vm.createContext(c);vm.runInContext(source.slice(a,b),c);
 assert.equal(created,0);media.matches=true;media.change();assert.equal(created,0);intro=false;media.change();assert.equal(created,1);assert.equal(mounted,1);assert.equal(c.scenes.size,1);media.matches=false;media.change();assert.equal(disposed,1);assert.equal(c.scenes.size,0);
});
test('camera scaled footprint stays inside desktop and phone viewports throughout a full orbit',()=>{
 const source=fs.readFileSync(path.join(root,'travelling-camera.js'),'utf8'),a=source.indexOf(' update(){'),b=source.indexOf(' setLogoTargets(',a);const c={innerWidth:1280,innerHeight:800,document:{documentElement:{clientWidth:1280}},matchMedia:()=>({matches:c.innerWidth<=1000})};vm.createContext(c);vm.runInContext('this.camera={'+source.slice(a,b)+'};',c);
 const gl=new Proxy({},{get:()=>()=>{}}),style={setProperty(){}};Object.assign(c.camera,{gl,width:132,height:119,el:{style},canvas:{width:198,height:178}});
 for(const [w,h]of [[320,568],[390,844],[430,932],[844,390],[1024,768],[1280,800],[1920,1080]]){c.innerWidth=w;c.innerHeight=h;c.document.documentElement.clientWidth=w;for(let i=0;i<=240;i++){c.camera.time=i*42/240;c.camera.update();const values=style.transform.match(/translate3d\(([^p]+)px,([^p]+)px,0\) scale\(([^)]+)\)/);assert(values);const x=+values[1],y=+values[2],scale=+values[3];assert(x>=0&&y>=0);const margin=w<=1000?11.9:23.9;assert(x+132*scale<=w-margin);assert(y+119*scale<=h-margin)}}
});
test('phone page horizontal correction preserves vertical position and allows pinch zoom',()=>{
 const source=fs.readFileSync(path.join(root,'app.js'),'utf8'),a=source.indexOf('function anchorPhoneViewport(){'),b=source.indexOf('let phoneAnchorFrame=',a);let phone=true,last=null;
 const c={matchMedia:()=>({matches:phone}),window:{scrollX:120,scrollY:460,visualViewport:{scale:1},scrollTo(options){last=options}}};vm.createContext(c);vm.runInContext(source.slice(a,b)+'this.anchor=anchorPhoneViewport;',c);
 c.anchor();assert.equal(last.left,0);assert.equal(last.top,460);last=null;c.window.visualViewport.scale=2;c.anchor();assert.equal(last,null);c.window.visualViewport.scale=1;phone=false;c.anchor();assert.equal(last,null);
});
test('film carousel loads nearby videos only and respects offscreen and manual pause',async()=>{
 const source=fs.readFileSync(path.join(root,'work-films.js'),'utf8'),observers=[];let clicks;
 const videos=Array.from({length:8},(_,i)=>({src:'',dataset:{filmSrc:`/film-${i}.mp4`,filmMobile:`/film-${i}-mobile.mp4`},paused:true,loads:0,plays:0,load(){this.loads++},play(){this.paused=false;this.plays++;return Promise.resolve()},pause(){this.paused=true}}));
 const button={setAttribute(){},addEventListener(k,fn){clicks=fn}},viewport={},track={style:{}},group={offsetWidth:1000},section={querySelectorAll:()=>videos,querySelector:s=>s==='.work-films-toggle'?button:s==='.work-films-track'?track:s==='.work-films-group'?group:viewport,toggleAttribute(){}};
 const animationFrames=new Map();let frameId=0,level=2,qualityChanged;
 const c={window:{MMMPerformance:{get level(){return level},subscribe(fn){qualityChanged=fn}}},requestAnimationFrame(fn){animationFrames.set(++frameId,fn);return frameId},cancelAnimationFrame(id){animationFrames.delete(id)},ResizeObserver:class{observe(){}},document:{hidden:false,querySelector:()=>section,documentElement:{classList:{contains:()=>false}},addEventListener(){}},matchMedia:()=>({matches:false,addEventListener(){}}),IntersectionObserver:class{constructor(fn){this.callback=fn;observers.push(this)}observe(){}},MutationObserver:class{observe(){}}};
 vm.runInNewContext(source,c);assert.equal(videos.reduce((n,v)=>n+v.loads,0),0);
 observers[0].callback([{isIntersecting:true}]);observers[1].callback([{target:videos[0],isIntersecting:true}]);await Promise.resolve();await Promise.resolve();
 assert.equal(videos[0].loads,1);assert.equal(videos[0].plays,1);assert.equal(videos[1].loads,0);
 for(let now=100;now<=1100;now+=50){const callbacks=[...animationFrames.values()];animationFrames.clear();callbacks.forEach(fn=>fn(now))}
 assert.equal(track.style.transform,'translate3d(-55px,0,0)');assert.equal(animationFrames.size,1);
 observers[0].callback([{isIntersecting:true}]);observers[1].callback([{target:videos[0],isIntersecting:true}]);assert.equal(videos[0].plays,1);assert(!videos[0].paused);
 observers[1].callback([{target:videos[1],isIntersecting:true},{target:videos[0],isIntersecting:false}]);assert(videos[0].paused);assert(!videos[1].paused);
 clicks();assert(videos[1].paused);assert.equal(animationFrames.size,0);observers[1].callback([{target:videos[1],isIntersecting:false},{target:videos[2],isIntersecting:true}]);assert.equal(videos[2].loads,0);
 level=0;qualityChanged();clicks();assert(!videos[2].paused);assert.equal(videos[2].src,'/film-2-mobile.mp4');observers[1].callback([{target:videos[3],isIntersecting:true,intersectionRatio:1},{target:videos[4],isIntersecting:true,intersectionRatio:.5}]);assert.equal(videos.filter(v=>!v.paused).length,1);assert(!videos[3].paused);observers[0].callback([{isIntersecting:false}]);assert(videos.every(v=>v.paused));assert.equal(animationFrames.size,0);
});
