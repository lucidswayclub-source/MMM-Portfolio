// Reversible hero experiment. Each image is sampled once; existing CSS moves the tiles.
const asciiHero=document.querySelector('.hero');
if(asciiHero){
 asciiHero.classList.add('ascii-hero');
 const heading=asciiHero.querySelector('.hero-wordmark');
 const source=document.createElement('canvas');source.width=1400;source.height=190;
 const ink=source.getContext('2d',{willReadFrequently:true});
 ink.font='italic 900 150px Arial';ink.textAlign='center';ink.textBaseline='middle';
 ink.fillStyle='#fff';ink.fillText('MegMultiMedia',700,95,1320);
 const pixels=ink.getImageData(0,0,1400,190).data;
 const title=document.createElement('canvas');title.width=1400;title.height=190;
 title.className='ascii-wordmark';title.setAttribute('aria-hidden','true');
 const pen=title.getContext('2d');
 const colour=pen.createLinearGradient(0,0,1400,100);
 colour.addColorStop(0,'#9ad9ed');colour.addColorStop(.4,'#e2f8e9');colour.addColorStop(.75,'#a2eec2');colour.addColorStop(1,'#9dd8ec');pen.fillStyle=colour;
 for(let y=3;y<190;y+=6)for(let x=3;x<1400;x+=6){const alpha=pixels[(y*1400+x)*4+3]/255;if(alpha>.25){pen.globalAlpha=alpha;pen.fillRect(x-2,y-2,4,4)}}
 pen.globalAlpha=1;heading.append(title);heading.classList.add('ascii-ready');
 const characters=' .·:+=*#@';
 const renders=new Map();
 async function convert(image){
  try{await image.decode()}catch{return}
  const tile=image.parentElement,ratio=tile.clientWidth/tile.clientHeight;
  const key=image.src+'|'+ratio.toFixed(2);
  let rendered=renders.get(key);
  if(!rendered){
   const columns=80,rows=Math.max(24,Math.round(columns*7/(ratio*10)));
   const sampler=document.createElement('canvas');sampler.width=columns;sampler.height=rows;
   const sample=sampler.getContext('2d',{willReadFrequently:true});
   const cropRatio=ratio,originalRatio=image.naturalWidth/image.naturalHeight;
   const sw=originalRatio>cropRatio?image.naturalHeight*cropRatio:image.naturalWidth;
   const sh=originalRatio>cropRatio?image.naturalHeight:image.naturalWidth/cropRatio;
   sample.drawImage(image,(image.naturalWidth-sw)/2,(image.naturalHeight-sh)/2,sw,sh,0,0,columns,rows);
   const data=sample.getImageData(0,0,columns,rows).data;
   rendered=document.createElement('canvas');rendered.width=columns*7;rendered.height=rows*10;
   const drawing=rendered.getContext('2d');drawing.fillStyle='#09130f';drawing.fillRect(0,0,rendered.width,rendered.height);drawing.font='10px monospace';drawing.textBaseline='top';
   for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){
    const offset=(y*columns+x)*4,light=(data[offset]*.2126+data[offset+1]*.7152+data[offset+2]*.0722)/255;
    drawing.fillStyle=`rgba(169,226,193,${.22+light*.78})`;
    drawing.fillText(characters[Math.min(characters.length-1,Math.floor(light*characters.length))],x*7,y*10);
   }
   renders.set(key,rendered);
  }
  const canvas=rendered.cloneNode();canvas.getContext('2d').drawImage(rendered,0,0);canvas.className='ascii-image';canvas.setAttribute('aria-hidden','true');tile.append(canvas);tile.classList.add('ascii-ready');
 }
 asciiHero.querySelectorAll('.wall-tile img').forEach(convert);
}
