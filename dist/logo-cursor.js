/** Exact transparent MMM logo; direct pointer tracking keeps the click hotspot precise. */
export function installLogoCursor(){
 const desktop=matchMedia('(hover:hover) and (pointer:fine)');
 const cursor=document.createElement('div');cursor.className='mmm-logo-cursor';cursor.setAttribute('aria-hidden','true');cursor.hidden=true;
 const image=document.createElement('img');image.src='/assets/mmm-logo-transparent.png';image.alt='';image.draggable=false;cursor.append(image);document.body.append(cursor);
 let ready=false,raf=0,x=0,y=0;
 const hide=()=>{cursor.hidden=true;document.documentElement.classList.remove('has-logo-cursor');cancelAnimationFrame(raf);raf=0;};
 const move=event=>{
  if(!ready||!desktop.matches||event.pointerType==='touch'||event.target.closest('input,textarea,select,[contenteditable="true"],dialog')){hide();return}
  x=event.clientX;y=event.clientY;cursor.hidden=false;document.documentElement.classList.add('has-logo-cursor');
  cursor.classList.toggle('is-link',!!event.target.closest('a,button,summary,[role="button"],[role="tab"]'));
  if(!raf)raf=requestAnimationFrame(()=>{raf=0;cursor.style.transform=`translate3d(${x-26}px,${y-12}px,0)`;});
 };
 image.addEventListener('load',()=>{ready=true});image.addEventListener('error',hide);
 document.addEventListener('pointermove',move,{passive:true});
 document.documentElement.addEventListener('pointerleave',hide);
 document.addEventListener('pointerdown',()=>cursor.classList.add('is-pressed'),{passive:true});
 document.addEventListener('pointerup',()=>cursor.classList.remove('is-pressed'),{passive:true});
 window.addEventListener('blur',hide);desktop.addEventListener('change',hide);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)hide()});
}
