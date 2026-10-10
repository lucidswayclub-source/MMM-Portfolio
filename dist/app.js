const config=window.MMM||{images:{},email:'',whatsapp:''};
const contactPage=location.pathname.replace(/\/$/,'')==='/contact';
function routeContactHash(){if(!contactPage&&location.hash==='#contact')location.replace('/contact/')}
routeContactHash();
addEventListener('hashchange',routeContactHash);
const sectionLinks={'/':'#top','/work':'#selected-work','/video-photo':'#production','/web-development':'#websites','/business-growth':'#growth','/about':'#studio','/contact':'/contact/'};
const main=document.querySelector('main');
document.body.classList.toggle('home-page',!contactPage);
document.body.classList.toggle('contact-page',contactPage);
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
document.title=contactPage?'Start a conversation — MegMultiMedia':'MegMultiMedia — Create. Build. Grow.';
const menu=document.querySelector('.menu'),navigation=document.querySelector('header nav');
const compactMenu=matchMedia('(max-width:1000px)');
// Restrained studio light moving behind the navigation controls.
const menuAtmosphere=document.createElement('div');
menuAtmosphere.className='menu-atmosphere';menuAtmosphere.setAttribute('aria-hidden','true');
menuAtmosphere.innerHTML='<span class="menu-light-sweep"></span><span class="menu-lens-glint"></span><span class="menu-film-grain"></span>';
document.querySelector('header').prepend(menuAtmosphere);
const hangingPhotographer=document.createElement('span');
hangingPhotographer.className='menu-hanging-photographer';hangingPhotographer.setAttribute('aria-hidden','true');
hangingPhotographer.innerHTML=`<svg viewBox="0 0 76 106" fill="none" focusable="false"><g class="hanging-figure" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M19 3V19Q19 24 27 32L33 40" stroke-width="5"/><path d="M15 3H24M16 3V7M20 3V7M24 3V6" stroke-width="2"/><circle cx="39" cy="30" r="7" fill="currentColor" stroke="none"/><path d="M34 41Q31 47 34 58L44 61Q48 48 44 42Z" fill="currentColor" stroke="none"/><path d="M44 44L54 49L61 40" stroke-width="5"/><g class="hanging-hand-camera"><rect x="55" y="30" width="16" height="12" rx="2.5" fill="currentColor" stroke="none"/><path d="M59 28H65V31" stroke-width="2"/><circle cx="64" cy="36" r="4" fill="#111518" stroke="none"/><circle cx="64" cy="36" r="2" stroke-width="1"/><path d="M56 40Q49 50 53 56" stroke-width="1" opacity=".5"/></g><path d="M36 59L31 75L19 81M43 60L48 78L43 96" stroke-width="6"/><path d="M19 81L14 83M43 96L48 98" stroke-width="4"/></g></svg>`;
document.querySelector('header').append(hangingPhotographer);

const menuSnow=document.createElement('span');menuSnow.className='menu-snow';
menuSnow.innerHTML=Array.from({length:48},(_,i)=>{
 const size=i%5===0?3:1.5+(i%3)*.4;
 return `<i style="--snow-x:${(i*47+13)%100}%;--snow-size:${size}px;--snow-time:${7+(i%7)*1.3}s;--snow-delay:${-((i*17)%100)/10}s;--snow-drift:${(i%2?1:-1)*(9+i%5*4)}px;--snow-opacity:${.25+(i%4)*.12}"></i>`;
}).join('');menuAtmosphere.append(menuSnow);

navigation.id='primary-navigation';menu.setAttribute('aria-controls',navigation.id);
menu.innerHTML='<span class="menu-caption">Menu</span><span class="menu-glyph" aria-hidden="true"><i></i><i></i></span>';
const navLinks=[...navigation.querySelectorAll('a')];
navLinks.forEach((a,i)=>{const label=a.textContent;a.innerHTML=`<span class="nav-index" aria-hidden="true">0${i+1}</span><span class="nav-label">${label}</span><span class="nav-arrow" aria-hidden="true">↗</span>`});
// One shared highlight glides between navigation items without moving the links.
const navIndicator=document.createElement('span');
navIndicator.className='nav-indicator';navIndicator.setAttribute('aria-hidden','true');
navigation.append(navIndicator);
let pointedNav=null,focusedNav=null,indicatorFrame=0;
function updateNavIndicator(){
 indicatorFrame=0;
 const target=focusedNav||pointedNav||navLinks.find(link=>link.getAttribute('aria-current')==='location');
 const visible=!compactMenu.matches&&!!target;
 navigation.classList.toggle('has-nav-indicator',visible);
 if(!visible)return;
 navIndicator.style.width=target.offsetWidth+'px';navIndicator.style.height=target.offsetHeight+'px';
 navIndicator.style.transform=`translate3d(${target.offsetLeft}px,${target.offsetTop}px,0)`;
}
function queueNavIndicator(){if(!indicatorFrame)indicatorFrame=requestAnimationFrame(updateNavIndicator)}
navLinks.forEach(link=>{
 link.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'){pointedNav=link;queueNavIndicator()}});
 link.addEventListener('focus',()=>{focusedNav=link;queueNavIndicator()});
 link.addEventListener('blur',()=>{focusedNav=null;queueNavIndicator()});
});
navigation.addEventListener('pointerleave',()=>{pointedNav=null;queueNavIndicator()});
new MutationObserver(queueNavIndicator).observe(navigation,{subtree:true,attributes:true,attributeFilter:['aria-current']});
new ResizeObserver(queueNavIndicator).observe(navigation);
addEventListener('resize',queueNavIndicator,{passive:true});
document.fonts?.ready.then(queueNavIndicator);queueNavIndicator();
function setMenu(open){
 menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close menu':'Open menu');
 navigation.classList.toggle('open',open);document.querySelector('header').classList.toggle('menu-open',open);
 navigation.inert=compactMenu.matches&&!open;
 if(compactMenu.matches)navigation.setAttribute('aria-hidden',String(!open));else navigation.removeAttribute('aria-hidden');
}
function closeMenu(){setMenu(false)}
menu.addEventListener('click',()=>setMenu(menu.getAttribute('aria-expanded')!=='true'));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus({preventScroll:true})}});
document.addEventListener('click',e=>{if(menu.getAttribute('aria-expanded')==='true'&&!e.target.closest('header'))closeMenu()});
navLinks.forEach(a=>a.addEventListener('click',()=>{closeMenu();navLinks.forEach(link=>link.removeAttribute('aria-current'));a.setAttribute('aria-current','location')}));
compactMenu.addEventListener('change',closeMenu);closeMenu();
const link=(href,label,kind='text-link')=>`<a class="${kind}" href="${sectionLinks[href]||href}">${label}<span aria-hidden="true">↗</span></a>`;
const tag=(n,text)=>`<div class="section-tag"><span><i></i>${text}</span></div>`;
const photo=(key,alt,extra='')=>`<img src="${config.images[key]}" alt="${alt}" loading="lazy" ${extra}>`;
const stockNote='<span class="stock-label">Illustrative photography</span>';
const graph=(kind='')=>`<svg class="journey-graph ${kind}" viewBox="0 0 500 180" fill="none" aria-hidden="true"><defs><linearGradient id="line-${kind}" x1="0" y1="180" x2="500" y2="0"><stop stop-color="#79e2ae"/><stop offset="1" stop-color="#87bfff"/></linearGradient></defs><path class="graph-grid" d="M0 40H500M0 90H500M0 140H500M50 0V180M150 0V180M250 0V180M350 0V180M450 0V180"/><path class="graph-area" d="M0 155C70 155 65 110 135 115S210 155 275 77S350 110 410 45S460 35 500 15V180H0Z"/><path class="graph-line" stroke="url(#line-${kind})" d="M0 155C70 155 65 110 135 115S210 155 275 77S350 110 410 45S460 35 500 15"/><circle cx="275" cy="77" r="5"/><circle cx="410" cy="45" r="5"/></svg>`;
const heroTile=(kind)=>kind==='product'||kind==='food'||kind==='production'?`<div class="wall-tile wall-photo"><img src="${config.images[kind]}" alt="" loading="eager" decoding="async"><span>${kind==='product'?'VISUAL DIRECTION':kind==='food'?'A DIFFERENT PERSPECTIVE':'BEHIND THE FRAME'}</span></div>`:kind==='website'?`<div class="wall-tile wall-website"><img src="/assets/lucidsway-desktop.png" alt="" loading="eager" decoding="async"></div>`:kind==='creative'?`<div class="wall-tile wall-type"><span>MMM / CREATIVE STUDIO</span><b>Creative<br><i>production.</i></b><small>CREATE / BUILD / GROW</small></div>`:`<div class="wall-tile wall-pattern"><span>VIDEO.<br>PHOTO.</span><div>${Array.from({length:9},()=>'<i></i>').join('')}</div><small>MEGMULTIMEDIA</small></div>`;
const imageWall=()=>`<div class="hero-image-wall" aria-hidden="true"><div class="hero-wall-stage">${[['product','creative','food','website'],['pattern','production','creative','food'],['website','food','pattern','product'],['production','creative','website','pattern'],['food','product','pattern','production']].map((items,i)=>`<div class="wall-column" style="--column:${i}"><div class="wall-track">${[0,1].map(()=>`<div class="wall-set">${items.map(heroTile).join('')}</div>`).join('')}</div></div>`).join('')}</div></div><div class="hero-wall-shade" aria-hidden="true"></div>`;

const hero=()=>`<section class="hero" id="top">${imageWall()}<div class="hero-intro"><h1 class="hero-wordmark" aria-label="MegMultiMedia"><span aria-hidden="true" data-wordmark="MegMultiMedia">MegMultiMedia</span></h1><h2 class="hero-tagline"><span>We create what</span> <i>moves you.</i></h2><p>Creative production, websites and digital marketing.</p><div class="hero-actions">${link('/work','Explore the work','button')}${link('/contact','Let’s make something','text-link')}</div></div><div class="hero-bottom"><a href="#selected-work">Scroll to discover <span aria-hidden="true">↓</span></a></div></section><div class="discipline-strip">${['Creative direction','Film & photography','Digital experiences','Brand growth'].map((x,i)=>`<span><small>0${i+1}</small>${x}</span>`).join('')}</div>`;
const cta=(heading='Discuss your<br><i>next project.</i>')=>`<section class="cta"><div class="cta-orbit" aria-hidden="true"></div><h2>${heading}</h2><div class="cta-bottom">${link('/contact','Start a conversation','button')}${config.whatsapp?link('https://wa.me/'+config.whatsapp.replace(/\D/g,''),'WhatsApp us','text-link'):''}</div></section>`;
const projectCard=(key,name,category,n)=>`<button class="project" data-project="${key}" aria-label="View ${name} illustrative photograph"><div class="project-image">${photo(key,name+' — illustrative stock photograph')}${stockNote}<span class="view-project" aria-hidden="true">↗</span><span class="project-no">${n}</span></div><div class="project-caption"><div><span>${category}</span><h3>${name}</h3></div><span aria-hidden="true">↗</span></div></button>`;
const work=(full=false)=>`<section class="section work-section" id="selected-work">${tag('01','SELECTED WORK')}<div class="section-heading"><h2>Selected<br><i>work.</i></h2></div><div class="project-grid">${projectCard('product','Objects of desire','PRODUCT / VISUAL DIRECTION','01')}${projectCard('food','A taste of the good life','FOOD & DRINK / PHOTOGRAPHY','02')}${full?projectCard('production','Behind every frame','PRODUCTION / ON SET','03'):''}</div><div class="work-bottom"><p class="editorial-note">Concept gallery · Stock imagery shown for creative direction, not client work.</p>${!full?link('/work','View the portfolio'):''}</div></section>`;
const serviceData=[['Creative','Give your brand a point of view.',['Scriptwriting','Creative Direction','Content Strategy'],'/contact','creative'],['Production','Beautiful stories, frame by frame.',['Videography','Photography','Video Production','Video Editing'],'/video-photo','production'],['Digital','Make every interaction count.',['Social Media Management','Website Development','SEO'],'/web-development','digital'],['Growth','Turn attention into opportunity.',['Influencer Marketing','Meta Ads','Google Ads','Performance Marketing','PR & Press Releases'],'/business-growth','growth']];
const services=()=>`<section class="section capabilities" id="services">${tag('02','WHAT WE CREATE')}<div class="service-list">${serviceData.map((s,i)=>`<details ${i===0?'open':''}><summary><span class="service-index">0${i+1}</span><h3>${s[0].toUpperCase()}</h3><span class="plus" aria-hidden="true">+</span></summary><div class="service-content"><ul>${s[2].map(x=>`<li>${x}</li>`).join('')}</ul></div></details>`).join('')}</div></section>`;
const growthServices=[['Influencer marketing','Bring your story to relevant audiences through creator partnerships.'],['Meta ads','Build campaigns around the people, messages and actions that matter.'],['Google ads','Meet people when they are actively looking for what you offer.'],['SEO','Make your digital presence easier to discover and explore.'],['Social media','Create a consistent voice through content and community.'],['PR & press releases','Shape your story for media, announcements and public visibility.']];
const dashboard=()=>`<div class="growth-console"><div class="console-top"><span><i class="status-dot"></i>MMM / GROWTH WORKSPACE</span><span class="dashboard-status">STRATEGY PREVIEW</span></div><div class="growth-steps" role="tablist" aria-label="Growth stages">${['Creativity','Attention','Audience','Performance','Growth'].map((x,i)=>`<button role="tab" id="stage-${i}" aria-selected="${i===0}" tabindex="${i===0?0:-1}" aria-controls="stage-panel" data-stage="${i}">${x}</button>`).join('')}</div><div id="stage-panel" role="tabpanel" aria-labelledby="stage-0" tabindex="0"><span class="stage-counter">01</span><span class="eyebrow">THE NEXT STEP</span><h3 id="stage-title">CREATIVITY</h3><p id="stage-copy"></p><div class="stage-deliverables"></div>${graph('workspace')}<div class="graph-labels" aria-hidden="true"><span>IDEA</span><span>DISTRIBUTION</span><span>IMPACT</span></div></div><div class="metrics-heading"><span>MEASURE WHAT MATTERS</span><span>→</span></div><div class="metrics">${['REACH','ENGAGEMENT','LEADS','CTR','CPL','CONVERSIONS','ROAS','RETENTION'].map(x=>`<span>${x}</span>`).join('')}</div><p class="console-note">Illustrative framework · No live campaign data</p></div>`;
const growth=(full=false)=>`<section class="section growth-section" id="growth">${tag('05','BUSINESS GROWTH')}<div class="growth-layout"><div><h2>Business<br><i>growth.</i></h2><p>Campaign strategy, advertising, SEO and social media management.</p>${!full?link('/business-growth','Explore business growth'):''}</div>${dashboard()}</div>${full?`<div class="growth-offerings">${growthServices.map((s,i)=>`<article><span>0${i+1}</span><h3>${s[0]}</h3><p>${s[1]}</p></article>`).join('')}</div>`:''}</section>`;
const bts=()=>`<section class="section bts" id="production">${tag('03','VIDEO & PHOTOGRAPHY')}<div class="bts-grid"><div class="bts-photo">${photo('production','Cinema camera on a production set — illustrative stock imagery')}${stockNote}<div class="bts-frame" aria-hidden="true"></div></div><div class="bts-copy"><h2>Video &<br><i>photography.</i></h2><div class="process">${['Idea','Shoot','Light','Direct','Edit','Deliver'].map((x,i)=>`<span><small>0${i+1}</small>${x}</span>`).join('')}</div></div></div></section>`;
const websiteProjects=[
 {name:'PVST',category:'Vocational skill training',url:'https://pvst.in/',desktop:'/assets/pvst-desktop.png',mobile:'/assets/pvst-mobile.jpg'},
 {name:'Raizon Space Interiors',category:'Interior design',url:'https://raizonspaceinteriors.com/',desktop:'/assets/raizon-desktop.png',mobile:'/assets/raizon-mobile.jpg'},
 {name:'Ever Green Artha',category:'Logistics',url:'https://evergreenartha.in/',desktop:'/assets/evergreen-desktop.png',mobile:'/assets/evergreen-mobile.jpg'},
 {name:'Dhruv Consultants',category:'Recruitment & consulting',url:'https://dhruvconsultants.in/',desktop:'/assets/dhruv-desktop.png',mobile:'/assets/dhruv-mobile.jpg'},
 {name:'The Lucid Sway',category:'Nightlife & experiences',url:'https://thelucidsway.com/',desktop:'/assets/lucidsway-desktop.png',mobile:'/assets/lucidsway-mobile.png'},
 {name:'Hasini Infra',category:'Infrastructure & development',url:'https://hasiniinfra.org/',desktop:'/assets/hasini-desktop.png',mobile:'/assets/hasini-mobile.jpg'}
];
const websiteCards=()=>websiteProjects.map((project,i)=>`<article class="website-showcase" data-website="${i}"><div class="website-toolbar"><h3>${project.name}<small>${project.category}</small></h3>${project.mobile?`<div class="preview-toggle" role="group" aria-label="${project.name} preview device"><button type="button" data-view="desktop" aria-pressed="true">Desktop</button><button type="button" data-view="mobile" aria-pressed="false">Mobile</button></div>`:`<span class="website-number">0${i+1} / WEB</span>`}</div><div class="website-device-stage"><a class="website-device" href="${project.url}" target="_blank" rel="noopener" aria-label="Visit ${project.name} live website"><div class="website-chrome" aria-hidden="true"><span><i></i><i></i><i></i></span><span>${new URL(project.url).hostname} ↗</span></div><img src="${project.desktop}" alt="${project.name} website homepage preview" loading="lazy" width="1280" height="720"></a></div><a class="website-live-link" href="${project.url}" target="_blank" rel="noopener"><span>${new URL(project.url).hostname}</span><span>Visit website ↗</span></a></article>`).join('');
const digital=()=>`<section class="section digital" id="websites">${tag('04','WEBSITES')}<div class="digital-portfolio-heading"><div><h2>Website<br><i>showcase.</i></h2></div></div><div class="website-reel-viewport"><div class="website-portfolio-grid">${websiteCards()}</div></div><div class="website-reel-controls"><span>SCROLL TO EXPLORE THE WEBSITES</span><div><span class="website-reel-count" aria-live="polite">01 / 06</span><button type="button" data-reel-step="-1" aria-label="Previous website">←</button><button type="button" data-reel-step="1" aria-label="Next website">→</button></div></div></section>`;
const about=()=>`<section class="section about-strip" id="studio">${tag('06','ABOUT THE STUDIO')}<div class="about-grid"><h2>About<br><i>MegMultiMedia.</i></h2><div><p class="large-copy">MegMultiMedia provides creative production, website development and digital marketing.</p></div></div></section>`;
const director=()=>`<div class="founder"><img class="founder-portrait" src="/assets/rithwik-studio-wide-v2.png" alt="Rithwik Pemmada, Managing Director of MegMultiMedia" loading="lazy" width="1672" height="941"><div class="founder-bio"><span class="eyebrow">THE PERSON BEHIND THE VISION</span><h2>Rithwik<br><i>Pemmada.</i></h2><p>Managing Director</p></div></div>`;
const cameraDiagram=(id,label,video=false)=>`<defs>
 <linearGradient id="${id}-body" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#b7d5e9"/><stop offset=".3" stop-color="#45667f"/><stop offset=".65" stop-color="#1c3449"/><stop offset="1" stop-color="#789db8"/></linearGradient>
 <radialGradient id="${id}-glass"><stop stop-color="#78c9ce"/><stop offset=".35" stop-color="#264c79"/><stop offset=".75" stop-color="#0c1b32"/><stop offset="1" stop-color="#688aa8"/></radialGradient>
 <pattern id="${id}-grip" width="3" height="3" patternUnits="userSpaceOnUse"><path d="M0 0l3 3" stroke="#a2bbca" stroke-opacity=".35" stroke-width=".7"/></pattern>
 </defs>
 <path d="M8 28l7-7h14l6-9h18l7 10h10l4 7v31l-5 5H12l-5-6z" fill="url(#${id}-body)" stroke="#aac8dc" stroke-width="1"/>
 <path d="M7 33h15v29H12l-5-4z" fill="#1b3042"/><path d="M7 33h15v29H12l-5-4z" fill="url(#${id}-grip)" stroke="#7895ac" stroke-width=".5"/>
 <path d="M35 20l4-6h10l6 6z" fill="#20394c"/><rect x="39" y="11" width="11" height="3" rx="1" fill="#c0d2df"/>
 <rect x="13" y="19" width="10" height="4" rx="2" fill="#68859c"/><path d="M15 19v4m3-4v4m3-4v4" stroke="#c4d5e1" stroke-width=".5"/>
 <rect x="59" y="19" width="9" height="5" rx="2" fill="#bdd2e1"/><circle cx="63" cy="21" r="1.2" fill="#152738" stroke="none"/>
 <path d="M10 29h58M13 60h9" stroke="#d9e8f2" stroke-opacity=".4" stroke-width=".6"/>
 <circle cx="44" cy="43" r="21" fill="#132235" stroke="#83a7c2" stroke-width="1.6"/>
 <circle cx="44" cy="43" r="18" fill="#304963" stroke="#c6d8e5" stroke-width=".7"/>
 <circle cx="44" cy="43" r="16" fill="#0d1f32" stroke="#6c92ae" stroke-width="2.5" stroke-dasharray="1 2"/>
 <circle cx="44" cy="43" r="13" fill="url(#${id}-glass)" stroke="#87bdc7" stroke-width=".7"/>
 <path d="M44 35l7 4v8l-7 4-7-4v-8z" fill="#0b142a" stroke="#567fa2" stroke-width=".8"/>
 <path d="M36 35a11 11 0 0 1 15-1" stroke="#d7fbf0" stroke-width="1.4" stroke-opacity=".75"/>
 <ellipse cx="39" cy="39" rx="3" ry="1.5" transform="rotate(-35 39 39)" fill="#aaf0cf" fill-opacity=".55" stroke="none"/>
 <circle cx="68" cy="34" r="1.8" fill="${video?'#f0948c':'#6fe09a'}" stroke="none"/>
 <path d="M68 45v7M70 48h-4" stroke="#91b9d8" stroke-width=".7"/>
 <text x="10" y="29" fill="#e0edf5" stroke="none" font-size="4" font-family="Arial,sans-serif" font-weight="700">${label}</text>
 ${video?'<path d="M72 37l6-3v18l-6-3" fill="#314e66" stroke="#91b9d8" stroke-width=".8"/>':''}`;
const gearDiagram=(id,kind)=>{
 const defs=`<defs><linearGradient id="${id}-metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d1e4f1"/><stop offset=".3" stop-color="#789bb7"/><stop offset=".55" stop-color="#223c55"/><stop offset="1" stop-color="#aac7dd"/></linearGradient><radialGradient id="${id}-glass"><stop stop-color="#9de6cf"/><stop offset=".35" stop-color="#315d82"/><stop offset="1" stop-color="#0f2036"/></radialGradient><radialGradient id="${id}-light"><stop stop-color="#ffffe9"/><stop offset=".65" stop-color="#f0f5c4"/><stop offset="1" stop-color="#8ea9a3"/></radialGradient></defs>`;
 const metal=`url(#${id}-metal)`,glass=`url(#${id}-glass)`;
 const shapes={
 lens:`<defs><linearGradient id="${id}-rim" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e0ebf0"/><stop offset=".2" stop-color="#7891a5"/><stop offset=".5" stop-color="#17232e"/><stop offset=".8" stop-color="#94aabe"/><stop offset="1" stop-color="#354a5d"/></linearGradient><radialGradient id="${id}-coating" cx=".32" cy=".24"><stop stop-color="#91c5d7"/><stop offset=".25" stop-color="#365980"/><stop offset=".58" stop-color="#172d48"/><stop offset="1" stop-color="#040a13"/></radialGradient></defs>
 <g class="lens-barrel"><circle cx="40" cy="42" r="31" fill="#0a1018" stroke="#405468" stroke-width="1"/>
 <circle cx="40" cy="40" r="31" fill="url(#${id}-rim)" stroke="#9eb4c5" stroke-width=".6"/>
 <circle cx="40" cy="40" r="28.5" fill="#151e29" stroke="#61788d" stroke-width="2" stroke-dasharray=".5 1.4"/>
 <circle cx="40" cy="40" r="26" fill="#0b121c" stroke="#b6c8d5" stroke-width=".55"/>
 <path d="M20 21A27 27 0 0 1 57 20M22 60A27 27 0 0 0 58 59" fill="none" stroke="#c8d9e5" stroke-opacity=".6" stroke-width=".7"/>
 <text x="40" y="18" text-anchor="middle" font-size="3.6" font-family="Arial,sans-serif" letter-spacing=".65" fill="#d2dce5" stroke="none">FE 24–70 mm</text>
 <text x="40" y="65" text-anchor="middle" font-size="3.6" font-family="Arial,sans-serif" letter-spacing=".65" fill="#c0cdd8" stroke="none">1:2.8 GM</text></g>
 <g class="lens-focus-ring"><circle cx="40" cy="40" r="22" fill="#182838" stroke="#687f96" stroke-width=".7"/>
 <circle cx="40" cy="40" r="20" fill="url(#${id}-coating)" stroke="#304f6c" stroke-width="1.2"/>
 <circle cx="40" cy="40" r="15.8" fill="none" stroke="#56949d" stroke-opacity=".45" stroke-width=".55"/>
 <circle cx="40" cy="40" r="11.5" fill="#07111e" stroke="#31465d" stroke-width=".7"/>
 <path d="M40 32l6 2 3 6-3 6-6 3-6-3-3-6 3-6Z" fill="#030812" stroke="#50677d" stroke-width=".6"/>
 <path d="M40 32l-2 8 8-6M49 40l-11 0 8 6M40 49l-2-9-4 6M31 40h7l-4-6" stroke="#354e65" stroke-width=".6"/>
 <path class="lens-optical-glint" d="M27 30A17 17 0 0 1 48 25" fill="none" stroke="#d4eff4" stroke-opacity=".8" stroke-width="1.2"/>
 <ellipse class="lens-optical-glint" cx="32" cy="32" rx="4.5" ry="2.6" transform="rotate(-35 32 32)" fill="#c5e4ec" fill-opacity=".32" stroke="none"/>
 <path d="M29 53A17 17 0 0 0 52 51" fill="none" stroke="#6e91c8" stroke-opacity=".65" stroke-width=".8"/></g>`,
 light:`<path d="M20 8h40l13 24-13 21H20L7 32z" fill="#263d50" stroke="#a9c6d6"/><path d="M24 13h32l11 19-11 16H24L13 32z" class="softbox-diffuser" fill="url(#${id}-light)" stroke="#d5e6d3"/><path d="M20 8l7 14M60 8L53 22M7 32h16M73 32H57M20 53l7-12M60 53l-7-12" stroke="#8a9e9e" stroke-width=".65"/><path d="M28 22h24v18H28z" fill="#ffffeb" stroke="#c8d7ad" stroke-width=".7"/><path d="M34 22v18M40 22v18M46 22v18M28 28h24M28 34h24" stroke="#b2c09c" stroke-width=".45"/><path d="M24 50v7h32v-7M40 57v12M40 65L24 76M40 65l16 11" stroke="${metal}" stroke-width="3"/><rect x="36" y="57" width="8" height="7" rx="2" fill="#42617a" stroke="#b8cfdf" stroke-width=".7"/>`,
 gimbal:`<path d="M14 16v27h31V27" stroke="${metal}" stroke-width="5"/><path d="M14 16h9M45 27h9" stroke="#91b9d8" stroke-width="2"/><g class="gimbal-camera"><rect x="27" y="8" width="39" height="24" rx="4" fill="${metal}" stroke="#b3cfdf"/><rect x="28" y="12" width="7" height="16" rx="2" fill="#23384c"/><circle cx="49" cy="20" r="9" fill="#1b3049" stroke="#a3c4dd"/><circle cx="49" cy="20" r="6" fill="${glass}" stroke="#79b3bc" stroke-width=".7"/><path d="M46 16l6-1" stroke="#c8f1e0"/></g><circle cx="14" cy="35" r="7" fill="${metal}" stroke="#b2ccdf"/><circle cx="14" cy="35" r="3" fill="#273e53"/><circle cx="45" cy="36" r="5" fill="${metal}"/><path d="M14 43v12h21v17" stroke="${metal}" stroke-width="5"/><rect x="29" y="54" width="12" height="22" rx="4" fill="#1c3348" stroke="#91b9d8"/><rect x="32" y="59" width="6" height="7" rx="1" fill="#7cbea9" stroke="none"/><circle cx="35" cy="70" r="2" fill="#adcde0" stroke="none"/>`,
 tripod:`<g class="tripod-column"><path d="M40 31v34" stroke="${metal}" stroke-width="4"/><path d="M40 47v6" stroke="#6fe09a" stroke-width="5"/></g>
 <g class="tripod-leg-left"><path d="M34 33L14 74" stroke="${metal}" stroke-width="4"/><path d="M34 36l-5 11" stroke="#b9d4e8" stroke-width="5"/><path d="M24 53l-3 6" stroke="#6fe09a" stroke-width="5"/><path d="M12 75h7" stroke="#a5bed2" stroke-width="3"/></g>
 <g class="tripod-leg-right"><path d="M46 33l20 41" stroke="${metal}" stroke-width="4"/><path d="M46 36l5 11" stroke="#b9d4e8" stroke-width="5"/><path d="M56 53l3 6" stroke="#6fe09a" stroke-width="5"/><path d="M62 75h7" stroke="#a5bed2" stroke-width="3"/></g>
 <g class="tripod-braces"><path d="M22 60h36M40 54L22 60M40 54l18 6" stroke="#6e94b0" stroke-width="1.2"/></g><path d="M37 73h6" stroke="#a5bed2" stroke-width="3"/>
 <g class="tripod-head"><rect x="25" y="8" width="30" height="7" rx="2" fill="${metal}" stroke="#abc9df"/><path d="M32 8V5h17v3" stroke="#c3d9e9"/><path d="M55 13l13 5 7 8" stroke="${metal}" stroke-width="3"/><rect x="32" y="17" width="16" height="14" rx="3" fill="${metal}" stroke="#c0d8e8"/><circle cx="40" cy="23" r="4" fill="#2d4860" stroke="#90b9d3"/></g>`
 };
 return defs+shapes[kind];
};
const toolkit=[
 ['SONY α7R V','CAPTURE','Photography','Camera for still photography.',cameraDiagram('tool-sony','SONY')],
 ['GM LENSES','PERSPECTIVE','Lens selection','Interchangeable lenses for framing and focus.',gearDiagram('tool-lens','lens')],
 ['LUMIX S1H','MOTION','Video production','Camera for video production.',cameraDiagram('tool-lumix','LUMIX',true)],
 ['GODOX LIGHTING','LIGHT','Lighting','Lighting for studio and location shoots.',gearDiagram('tool-light','light')],
 ['GIMBALS','FLOW','Camera movement','Stabilised handheld camera movement.',gearDiagram('tool-gimbal','gimbal')],
 ['TRIPODS','FOUNDATION','Camera support','Fixed camera support for stills and video.',gearDiagram('tool-tripod','tripod')]
];
const equipment=()=>`<section class="section equipment" id="toolkit">${tag('THE TOOLKIT','TOOLS FOR THE CRAFT')}<div class="toolkit-intro"><h2>Built for<br><i>the craft.</i></h2><div class="toolkit-intro-copy"><span class="toolkit-invitation"><span aria-hidden="true">↗</span> Explore the toolkit</span></div></div><div class="toolkit-buttons">${toolkit.map(([name,category,role,description,icon],i)=>`<div class="tool-button-wrap tool-effect-${i}"><span class="tool-hover-art" aria-hidden="true"><svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icon}</svg></span><button type="button" class="tool-button" aria-expanded="false" aria-controls="tool-note-${i}">${name}</button><span class="tool-note" id="tool-note-${i}" role="tooltip">${description}</span></div>`).join('')}</div></section>`;
const contact=()=>`<section class="section contact-layout" id="contact"><div><h2>Tell us what<br>you have in mind.</h2><div class="contact-note"><b>PROJECT BRIEF PREVIEW</b><p>Contact details are being added. Prepare and download your project brief here. Nothing is sent from this preview.</p></div></div><form id="enquiry"><div class="form-row"><label>Your name<input name="name" autocomplete="name" required placeholder="Full name"></label><label>Business name<input name="business" autocomplete="organization" placeholder="Your brand or business"></label></div><div class="form-row"><label>Email<input name="email" type="email" autocomplete="email" required placeholder="you@company.com"></label><label>Phone<input name="phone" type="tel" autocomplete="tel" placeholder="Include country code"></label></div><fieldset><legend>What can we help with?</legend><div class="service-choices">${['Creative','Video & Photography','Website Development','Social Media','Business Growth','Other'].map(x=>`<label><input type="checkbox" name="services" value="${x}"><span>${x}</span></label>`).join('')}</div></fieldset><label>Project details<textarea name="details" rows="4" required placeholder="Your idea, goals and timeline…"></textarea></label><button class="button" type="submit">Prepare project brief <span aria-hidden="true">↗</span></button><p class="form-privacy">Your details stay in this browser. They are not saved or submitted.</p><div id="form-result" aria-live="polite"></div></form></section>`;
main.innerHTML=contactPage?`<section class="page-heading contact-heading"><h1>Start a<br><i>project.</i></h1><a class="text-link" href="/#top">← Back to the studio</a></section>`+contact():hero()+work(true)+services()+bts()+equipment()+digital()+growth(true)+about()+director()+cta();
const stageTexts=[
['CREATIVITY','Shape the idea, message and visual direction that give your brand a recognisable voice.',['Creative direction','Content strategy'],['ENGAGEMENT']],
['ATTENTION','Put the story in front of the right people through content, distribution and paid campaigns.',['Social content','Paid distribution'],['REACH','CTR']],
['AUDIENCE','Build a relevant audience and understand which messages create meaningful interest.',['Audience insights','Community building'],['ENGAGEMENT','LEADS']],
['PERFORMANCE','Review campaign signals to improve the journey from first click to enquiry or purchase.',['Campaign analysis','Conversion optimisation'],['CPL','CONVERSIONS','ROAS']],
['GROWTH','Use what works to guide the next campaign and strengthen long-term customer relationships.',['Ongoing optimisation','Retention strategy'],['ROAS','RETENTION']]];
function setStage(button){const n=Number(button.dataset.stage);document.querySelectorAll('[data-stage]').forEach(b=>{b.setAttribute('aria-selected',b===button);b.tabIndex=b===button?0:-1});document.querySelector('#stage-panel').setAttribute('aria-labelledby',button.id);document.querySelector('#stage-title').textContent=stageTexts[n][0].toLowerCase();document.querySelector('#stage-copy').textContent=stageTexts[n][1];document.querySelector('.stage-counter').textContent=`0${n+1}`;document.querySelector('.growth-console').style.setProperty('--stage',n);const deliverables=document.querySelector('.stage-deliverables');deliverables.replaceChildren(...stageTexts[n][2].map(text=>{const span=document.createElement('span');span.textContent=text;return span}));document.querySelectorAll('.metrics>span').forEach(metric=>metric.classList.toggle('metric-relevant',stageTexts[n][3].includes(metric.firstChild.textContent)));}
document.querySelectorAll('[data-stage]').forEach(b=>{b.addEventListener('click',()=>setStage(b));b.addEventListener('keydown',e=>{const tabs=[...document.querySelectorAll('[data-stage]')];let i=tabs.indexOf(b);if(e.key==='ArrowRight')i=(i+1)%tabs.length;else if(e.key==='ArrowLeft')i=(i-1+tabs.length)%tabs.length;else if(e.key==='Home')i=0;else if(e.key==='End')i=tabs.length-1;else return;e.preventDefault();tabs[i].focus();setStage(tabs[i])})});
const dialog=document.createElement('dialog');dialog.className='lightbox';dialog.setAttribute('aria-label','Illustrative photography preview');dialog.innerHTML='<button class="close-dialog" aria-label="Close image">×</button><img alt=""><p></p>';document.body.append(dialog);let lastProject;
document.querySelectorAll('[data-project]').forEach(b=>b.addEventListener('click',()=>{lastProject=b;dialog.querySelector('img').src=config.images[b.dataset.project];dialog.querySelector('img').alt=b.querySelector('img').alt;dialog.querySelector('p').textContent=b.querySelector('h3').textContent+' — illustrative stock photography';dialog.showModal()}));
function closeDialog(){dialog.close();lastProject?.focus()}dialog.querySelector('button').addEventListener('click',closeDialog);dialog.addEventListener('click',e=>{if(e.target===dialog)closeDialog()});
let briefUrl;const form=document.querySelector('#enquiry');if(form)form.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(form);const brief=`MEGMULTIMEDIA — PROJECT ENQUIRY\n\nName: ${d.get('name')}\nBusiness: ${d.get('business')}\nEmail: ${d.get('email')}\nPhone: ${d.get('phone')}\nServices: ${d.getAll('services').join(', ')||'To discuss'}\n\nPROJECT DETAILS\n${d.get('details')}\n`;const result=document.querySelector('#form-result');result.replaceChildren();const p=document.createElement('p');p.textContent='Your brief is ready. Download it to keep a copy. Nothing has been sent.';const download=document.createElement('a');download.className='button';download.textContent='DOWNLOAD BRIEF ↓';download.download='MMM-project-enquiry.txt';if(briefUrl)URL.revokeObjectURL(briefUrl);briefUrl=URL.createObjectURL(new Blob([brief],{type:'text/plain'}));download.href=briefUrl;result.append(p,download);download.focus()});

// Decode both views in advance so the device transition never waits for an image.
websiteProjects.forEach(project=>[project.desktop,project.mobile].filter(Boolean).forEach(src=>{const image=new Image();image.src=src;image.decode?.().catch(()=>{})}));
document.querySelectorAll('.preview-toggle button').forEach(button=>button.addEventListener('click',async()=>{
 const showcase=button.closest('.website-showcase'),project=websiteProjects[Number(showcase.dataset.website)],phone=button.dataset.view==='mobile';
 const request=(showcase.previewRequest||0)+1;showcase.previewRequest=request;
 const demo=showcase.classList.contains('mmm-device-demo');
 if(!demo){const preload=new Image();preload.src=phone?project.mobile:project.desktop;try{await preload.decode()}catch{}if(showcase.previewRequest!==request)return}
 showcase.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 const device=showcase.querySelector('.website-device'),img=device.querySelector('img');
 const before=device.getBoundingClientRect();device.getAnimations().forEach(a=>a.cancel());img.getAnimations().forEach(a=>a.cancel());
 device.classList.toggle('is-mobile',phone);
 if(!demo){img.src=phone?project.mobile:project.desktop;img.alt=project.name+(phone?' mobile':' desktop')+' website preview';img.width=phone?390:1440;img.height=phone?844:1000}
 const after=device.getBoundingClientRect();
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&!document.documentElement.classList.contains('motion-disabled')){
 device.animate([{width:before.width+'px',height:before.height+'px'},{width:after.width+'px',height:after.height+'px'}],{duration:650,easing:'cubic-bezier(.22,1,.36,1)'});
 img.animate([{opacity:0,filter:'blur(3px)'},{opacity:1,filter:'blur(0)'}],{duration:550,easing:'ease-out'});
 }
}));

const initialStage=document.querySelector('[data-stage="0"]');if(initialStage)setStage(initialStage);

// Equipment toggles expose their description and replay the setup illustration.
const toolButtons=[...document.querySelectorAll('.tool-button')];
const closeTool=button=>{button.setAttribute('aria-expanded','false');button.parentElement.classList.remove('tool-active','tool-replaying')};
toolButtons.forEach(button=>{
 const wrap=button.parentElement;
 button.addEventListener('focus',()=>{if(button.matches(':focus-visible'))wrap.classList.add('tool-previewing')});
 button.addEventListener('blur',()=>wrap.classList.remove('tool-previewing'));
 button.addEventListener('click',()=>{
  const open=button.getAttribute('aria-expanded')!=='true';
  toolButtons.forEach(closeTool);
  if(!open){wrap.classList.remove('tool-previewing');return}
  button.setAttribute('aria-expanded','true');wrap.classList.add('tool-active');
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&!document.documentElement.classList.contains('motion-disabled')){
   wrap.classList.add('tool-replaying');getComputedStyle(wrap.querySelector('.tool-hover-art')).animationName;
   requestAnimationFrame(()=>wrap.classList.remove('tool-replaying'));
  }
 });
});
document.addEventListener('keydown',event=>{if(event.key==='Escape')document.querySelectorAll('.tool-button').forEach(button=>{button.setAttribute('aria-expanded','false');button.parentElement.classList.remove('tool-active','tool-previewing','tool-replaying')})});

// Navigation follows the current scene, without taking control of page scrolling.
let navFrame=0;
const syncNavigation=()=>{
 navFrame=0;if(document.documentElement.classList.contains('cinematic-navigation'))return;
 const sections=navLinks.map(link=>({link,target:document.getElementById(new URL(link.href,location.href).hash.slice(1))})).filter(item=>item.target);
 let current=null;
 for(const item of sections){const r=item.target.getBoundingClientRect();if(r.top<=innerHeight*.3&&r.bottom>innerHeight*.15)current=item.link}
 navLinks.forEach(link=>{const selected=link===current||contactPage&&new URL(link.href,location.href).pathname.replace(/\/$/,'')==='/contact';if(selected&&link.getAttribute('aria-current')!=='location')link.setAttribute('aria-current','location');else if(!selected&&link.hasAttribute('aria-current'))link.removeAttribute('aria-current')});
};
const queueNavigation=()=>{if(!navFrame)navFrame=requestAnimationFrame(syncNavigation)};
addEventListener('scroll',queueNavigation,{passive:true});addEventListener('resize',queueNavigation,{passive:true});queueNavigation();
