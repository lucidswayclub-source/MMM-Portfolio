/** A real, locally rendered 3D camera mesh. Independent, seamless flight with visibility-aware rendering. */
export class TravellingCamera {
 constructor(enabled=()=>true,container=null){
  this.enabled=enabled;this.time=0;this.raf=0;this.lastTime=0;
  this.el=document.createElement('div');this.el.className=container?'launch-camera-model':'travelling-camera';this.el.setAttribute('aria-hidden','true');
  const canvas=document.createElement('canvas');this.el.append(canvas);(container||document.body).append(this.el);this.canvas=canvas;
  const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false});
  if(!gl){this.el.remove();return}this.gl=gl;
  const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s};
  try{
   const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,`
    attribute vec3 position;attribute vec3 normal;attribute vec3 color;attribute float piece;attribute vec3 pivot;attribute float material;attribute vec3 logoTarget;attribute vec3 logoColor;
    uniform vec2 angle;uniform float roll;uniform float aspect;uniform float explode;uniform mediump float assemble;uniform float zoom;uniform vec2 framing;varying vec3 N;varying vec3 C;varying vec3 P;varying vec3 V;varying float M;
    void main(){float a=angle.x,b=angle.y;mat3 ry=mat3(cos(a),0.,-sin(a),0.,1.,0.,sin(a),0.,cos(a));mat3 rx=mat3(1.,0.,0.,0.,cos(b),sin(b),0.,-sin(b),cos(b));
    mat3 rz=mat3(cos(roll),sin(roll),0.,-sin(roll),cos(roll),0.,0.,0.,1.);float turn=0.;mat3 partRotation=mat3(cos(turn),sin(turn),0.,-sin(turn),cos(turn),0.,0.,0.,1.);
    vec3 offset=vec3(0.);
    if(piece>=12.&&piece<=29.){offset=vec3(0.,0.,.25+(piece-12.)*.07);}
    else if(piece==2.){offset=vec3(-.6,0.,0.);}
    else if(piece>=3.&&piece<=6.){offset=vec3(0.,.55+(piece-3.)*.10,0.);}
    else if(piece>=7.&&piece<=9.){offset=vec3(0.,0.,-.6-(piece-7.)*.18);}
    else if(piece==10.||piece==11.){offset=vec3(sign(pivot.x)*.4,.15,0.);}
    else if(piece>31.&&piece<40.){offset=vec3(sign(pivot.x)*.16,sign(pivot.y)*.12,.25);}
    else if(piece>=42.){offset=vec3(0.,0.,.43);}
    vec3 separated=position+offset*explode;
    float group=mod(piece,3.);float step=mod(floor(piece/3.),5.);float targetY=step==0.||step==4.?-.45:step==2.?-.10:.45;
    vec3 target=logoTarget;
    vec3 p=rz*rx*ry*mix(separated,target,assemble);p.xy-=framing;p*=zoom;N=rz*rx*ry*partRotation*normal;C=mix(color,logoColor,assemble);P=position;V=vec3(0.,0.,5.5)-p;M=material;float z=5.5-p.z;
    gl_Position=vec4(p.x*2.8/aspect,p.y*2.8,(z-2.0)*1.4-2.8,z);}`));
   gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`
    precision mediump float;uniform mediump float assemble;varying vec3 N;varying vec3 C;varying vec3 P;varying vec3 V;varying float M;
    float noise(vec2 q){return fract(sin(dot(q,vec2(127.1,311.7)))*43758.5);}
    void main(){
     vec3 n=normalize(N),v=normalize(V),l=normalize(vec3(-.55,.8,1.1));
     float diffuse=max(dot(n,l),0.),fresnel=pow(1.-max(dot(n,v),0.),5.);
     bool glass=M>1.5;bool metal=M>.5&&M<1.5;
     float rough=glass?.13:metal?.27:.72;
     float spec=pow(max(dot(n,normalize(l+v)),0.),mix(95.,9.,rough));
     vec3 r=reflect(-v,n);
     // Studio softboxes reflected by the metal, rather than a flat painted highlight.
     float strip=pow(max(0.,1.-abs(r.x+.30)*2.5),10.)*smoothstep(-.4,.7,r.y);
     float edge=pow(max(dot(r,normalize(vec3(.8,.25,.55))),0.),13.);
     float brush=sin(P.y*850.+noise(P.xz*160.)*2.)*.012;
     float grain=noise(P.xy*320.)*.026;
     vec3 ambient=vec3(.14,.17,.21),reflection=vec3(.90,.95,1.)*strip+vec3(.35,.55,.78)*edge*.6;
     vec3 lit;
     if(glass){lit=C*.22+reflection*.7+vec3(.18,.32,.40)*fresnel+vec3(.75,.93,1.)*spec*.65;}
     else if(metal){lit=C*(ambient+diffuse*.32)+reflection*(.48+fresnel*.35)+vec3(.92,.96,1.)*spec*.65+brush;}
     else{lit=C*(.35+diffuse*.9)+reflection*.06+spec*.12+grain;}
     lit=lit/(vec3(1.)+lit*.35);lit=pow(max(lit,vec3(0.)),vec3(.82));
     gl_FragColor=vec4(mix(lit,C,smoothstep(.7,1.,assemble)),1.);
    }`));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Camera shader link failed');this.program=program;
  }catch(error){console.warn('MMM camera renderer:',error);this.el.remove();this.gl=null;return}
  const vertices=[];let piece=0,pivot=[0,0,0],material=0;
  const tri=(a,b,c,n,col)=>{for(const [i,p]of[a,b,c].entries())vertices.push(...p,...(Array.isArray(n[0])?n[i]:n),...col,piece,...pivot,material)};
  const box=(x,y,z,w,h,d,col,mat=1)=>{
   piece++;pivot=[x,y,z];material=mat;
   const half=[w/2,h/2,d/2],bevel=Math.min(.085,Math.min(w,h,d)*.18),inner=half.map(n=>n-bevel),steps=[-1,-.94,-.86,.86,.94,1];
   const vertex=(axis,sign,u,v)=>{
    const axes=[0,1,2].filter(n=>n!==axis),q=[0,0,0];q[axis]=sign*half[axis];q[axes[0]]=u*half[axes[0]];q[axes[1]]=v*half[axes[1]];
    const center=q.map((n,i)=>Math.max(-inner[i],Math.min(inner[i],n))),delta=q.map((n,i)=>n-center[i]),length=Math.hypot(...delta),normal=delta.map(n=>n/length);
    return {p:center.map((n,i)=>n+normal[i]*bevel+pivot[i]),n:normal};
   };
   for(let axis=0;axis<3;axis++)for(const sign of[-1,1])for(let u=0;u<steps.length-1;u++)for(let v=0;v<steps.length-1;v++){
    const a=vertex(axis,sign,steps[u],steps[v]),b=vertex(axis,sign,steps[u+1],steps[v]),c=vertex(axis,sign,steps[u+1],steps[v+1]),d=vertex(axis,sign,steps[u],steps[v+1]);
    tri(a.p,b.p,c.p,[a.n,b.n,c.n],col);tri(a.p,c.p,d.p,[a.n,c.n,d.n],col);
   }
  };
  const cylinder=(x,y,z,r,length,col,segments=96,mat=1,inner=0)=>{
   piece++;pivot=[x,y,z+length/2];material=mat;
   for(let i=0;i<segments;i++){const a=i/segments*Math.PI*2,b=(i+1)/segments*Math.PI*2;
    const p=[x+Math.cos(a)*r,y+Math.sin(a)*r,z],q=[x+Math.cos(b)*r,y+Math.sin(b)*r,z],u=[p[0],p[1],z+length],v=[q[0],q[1],z+length],n=[Math.cos((a+b)/2),Math.sin((a+b)/2),0];
    tri(p,q,v,n,col);tri(p,v,u,n,col);
    if(inner>0){
     const ip=[x+Math.cos(a)*inner,y+Math.sin(a)*inner,z],iq=[x+Math.cos(b)*inner,y+Math.sin(b)*inner,z],iu=[ip[0],ip[1],z+length],iv=[iq[0],iq[1],z+length];
     tri(u,v,iv,[0,0,1],col);tri(u,iv,iu,[0,0,1],col);tri(p,ip,iq,[0,0,-1],col);tri(p,iq,q,[0,0,-1],col);
     const inside=n.map(value=>-value);tri(ip,iu,iv,inside,col);tri(ip,iv,iq,inside,col);
    }else{tri([x,y,z+length],u,v,[0,0,1],col);tri([x,y,z],q,p,[0,0,-1],col);}
   }
  };
  const black=[.085,.09,.10],metal=[.42,.46,.49],silver=[.78,.81,.84],mint=[.27,.72,.52],blue=[.14,.30,.72];
  box(0,0,0,2.2,1.35,.72,metal);box(-.89,-.03,.10,.43,1.26,.93,[.075,.08,.09],0);
  box(.14,.76,-.04,.70,.35,.60,metal);box(.14,.82,.29,.36,.15,.03,black);
  box(.79,.73,0,.35,.15,.35,silver);box(-.78,.73,0,.30,.15,.35,metal);
  box(0,-.04,-.375,1.34,.91,.03,metal);box(0,-.04,-.398,1.18,.75,.02,[.045,.10,.15]);
  box(.76,.12,-.395,.20,.50,.03,black);box(-1.16,.43,0,.12,.19,.16,silver);box(1.16,.43,0,.12,.19,.16,silver);
  cylinder(.21,-.05,.36,.59,.14,metal,96,1,.45);cylinder(.21,-.05,.51,.56,.55,black,96,1,.46);
  for(let i=0;i<10;i++)cylinder(.21,-.05,.55+i*.046,.565,.014,i%3===0?metal:[.13,.15,.18],96,1,.49);
  cylinder(.21,-.05,1.07,.57,.035,silver,96,1,.49);cylinder(.21,-.05,1.11,.53,.035,black,96,1,.455);cylinder(.21,-.05,1.15,.45,.012,[.04,.11,.16],96,2);
  cylinder(.21,-.05,1.166,.35,.008,[.045,.11,.13],96,2);cylinder(.21,-.05,1.176,.23,.008,[.012,.025,.035],96,2);
  cylinder(.11,.08,1.19,.065,.004,[.48,.76,.77]);box(.80,.40,.37,.18,.045,.015,mint);box(-.49,.42,.37,.28,.035,.015,silver);
  for(const x of[-.74,.92])for(const y of[-.49,.47]){
   cylinder(x,y,.368,.028,.012,black,24);box(x,y,.383,.031,.007,.003,silver);
  }
  box(0,-.55,.37,1.3,.018,.012,black);box(.69,.75,.20,.17,.02,.01,black);
  for(let i=0;i<14;i++){const a=i*Math.PI*2/14;box(.21+Math.cos(a)*.568,-.05+Math.sin(a)*.568,.79,.016,.024,.16,silver);}
  // A compact hull for each rigid piece lets the lens camera frame the entire explosion.
  const hulls=new Map();for(let i=0;i<vertices.length;i+=14){const id=vertices[i+9];let hull=hulls.get(id);if(!hull){hull={id,pivot:vertices.slice(i+10,i+13),min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]};hulls.set(id,hull);}for(let a=0;a<3;a++){hull.min[a]=Math.min(hull.min[a],vertices[i+a]);hull.max[a]=Math.max(hull.max[a],vertices[i+a]);}}
  this.hulls=[...hulls.values()];
  this.sourceVertices=vertices;this.count=vertices.length/14;const buffer=gl.createBuffer();this.buffer=buffer;gl.bindBuffer(gl.ARRAY_BUFFER,buffer);const initial=[];for(let i=0;i<vertices.length;i+=14)initial.push(...vertices.slice(i,i+14),0,0,0,1,1,1);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(initial),gl.STATIC_DRAW);gl.useProgram(this.program);
  for(const[name,offset]of[['position',0],['normal',12],['color',24],['piece',36],['pivot',40],['material',52],['logoTarget',56],['logoColor',68]]){const loc=gl.getAttribLocation(this.program,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,name==='piece'||name==='material'?1:3,gl.FLOAT,false,80,offset)}
  this.framing=gl.getUniformLocation(this.program,'framing');
  this.explode=gl.getUniformLocation(this.program,'explode');this.assemble=gl.getUniformLocation(this.program,'assemble');this.zoom=gl.getUniformLocation(this.program,'zoom');gl.uniform1f(this.zoom,1);
  this.roll=gl.getUniformLocation(this.program,'roll');this.angle=gl.getUniformLocation(this.program,'angle');this.aspect=gl.getUniformLocation(this.program,'aspect');gl.enable(gl.DEPTH_TEST);
  this.introMode=!!container;
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.reset();this.gl=null});
  if(!this.introMode)document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(this.raf);this.raf=0;this.lastTime=0}else this.start()});
 }
 resize(){
  if(!this.gl)return;
  this.el.hidden=!this.enabled();
  if(this.el.hidden)return;
  const r=this.el.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1);
  this.canvas.width=Math.round(r.width*dpr);this.canvas.height=Math.round(r.height*dpr);
  this.gl.viewport(0,0,this.canvas.width,this.canvas.height);if(!this.introMode)this.start();
 }
 start(){
  if(this.raf||!this.gl||!this.enabled()||document.hidden)return;
  this.el.hidden=false;
  const tick=now=>{
   this.raf=0;if(!this.enabled()||document.hidden){this.lastTime=0;return}
   // Retain phase across pauses, and avoid jumps after a slow frame or tab switch.
   if(this.lastTime)this.time+=Math.min(50,now-this.lastTime)/1000;
   this.lastTime=now;this.update();this.raf=requestAnimationFrame(tick);
  };
  this.raf=requestAnimationFrame(tick);
 }
 update(){
  if(!this.gl)return;
  const small=innerWidth<=700,t=this.time*Math.PI*2/42;
  const w=this.el.offsetWidth,h=this.el.offsetHeight;
  // Continuous closed orbit; position and rotation match across the loop seam.
  const margin=small?12:24,cx=innerWidth/2,cy=innerHeight*.55;
  const rx=Math.max(0,(innerWidth-w)/2-margin),ry=Math.max(0,innerHeight*.27-h*.25);
  let x=cx+Math.cos(t)*rx,y=cy+Math.sin(t)*ry+Math.sin(t*2)*innerHeight*.025;
  if(small){x=innerWidth-w*.55-14+Math.cos(t)*8;y=innerHeight*.59+Math.sin(t)*innerHeight*.22;}
  const scale=1+Math.sin(t)*.09;
  this.el.style.left='0px';this.el.style.top='0px';this.el.style.opacity=small?'.86':'1';
  this.el.style.transform=`translate3d(${Math.max(margin,Math.min(innerWidth-w-margin,x-w/2))}px,${Math.max(80,Math.min(innerHeight-h-20,y-h/2))}px,0) scale(${scale})`;
  const gl=this.gl;gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(this.program);
  gl.uniform2f(this.angle,-.42+Math.sin(t)*.62,.16+Math.cos(t)*.18);
  gl.uniform1f(this.roll,Math.sin(t)*.12+Math.sin(t*2)*.035);
  gl.uniform1f(this.aspect,this.canvas.width/this.canvas.height);gl.drawArrays(gl.TRIANGLES,0,this.count);
 }

 setLogoTargets(image,width){
  if(!this.gl)return;
  this.logoImage=image;this.logoWidth=width;
  const canvas=document.createElement('canvas');canvas.width=180;canvas.height=Math.round(180*image.naturalHeight/image.naturalWidth);
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0,canvas.width,canvas.height);
  const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data,samples=[];
  const worldWidth=width*5.5/(this.canvas.height/(Math.min(2,devicePixelRatio||1))*1.4*1.06);
  for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){const i=(y*canvas.width+x)*4;if(pixels[i+3]>160&&Math.max(pixels[i],pixels[i+1],pixels[i+2])>90)samples.push({p:[((x+.5)/canvas.width-.5)*worldWidth,(.5-(y+.5)/canvas.height)*worldWidth*canvas.height/canvas.width,0],c:[pixels[i]/255,pixels[i+1]/255,pixels[i+2]/255]});}
  if(!samples.length)return;
  const packed=[],hulls=new Map(this.hulls.map(h=>{h.targetMin=[Infinity,Infinity,Infinity];h.targetMax=[-Infinity,-Infinity,-Infinity];return [h.id,h]}));
  for(let i=0;i<this.sourceVertices.length;i+=14){const sample=samples[(Math.floor(i/42)*97)%samples.length],v=this.sourceVertices.slice(i,i+14),h=hulls.get(v[9]),corner=[[-.75,-.55],[.75,-.55],[0,.95]][Math.floor(i/14)%3],target=[sample.p[0]+corner[0]*worldWidth/canvas.width,sample.p[1]+corner[1]*worldWidth/canvas.width,0];for(let a=0;a<3;a++){h.targetMin[a]=Math.min(h.targetMin[a],target[a]);h.targetMax[a]=Math.max(h.targetMax[a],target[a]);}packed.push(...v,...target,...sample.c);}
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.buffer);this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array(packed),this.gl.STATIC_DRAW);
 }
 introPose(seconds){
  const ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*x*(x*(x*6-15)+10)};
  const approach=ease(seconds/1.65),split=ease((seconds-.65)/2.15),join=ease((seconds-2.1)/2.6);
  const yaw=(1-approach)*-.65-(1-join)*split*.72,pitch=(1-approach)*.2+split*(1-join)*.12,roll=Math.sin(split*Math.PI)*.08*(1-join);
  const points=[];
  for(const hull of this.hulls){
   const id=hull.id,pivot=hull.pivot;let offset=[0,0,0];
   if(id>=12&&id<=29)offset=[0,0,.25+(id-12)*.07];else if(id===2)offset=[-.6,0,0];else if(id>=3&&id<=6)offset=[0,.55+(id-3)*.10,0];else if(id>=7&&id<=9)offset=[0,0,-.6-(id-7)*.18];else if(id===10||id===11)offset=[Math.sign(pivot[0])*.4,.15,0];else if(id>31&&id<40)offset=[Math.sign(pivot[0])*.16,Math.sign(pivot[1])*.12,.25];else if(id>=42)offset=[0,0,.43];
   const group=id%3,step=Math.floor(id/3)%5,target=[(group-1)*1.12-.38+step*.19,step===0||step===4?-.45:step===2?-.10:.45,0];
   for(let corner=0;corner<8;corner++){
    const v=[0,1,2].map(a=>corner&(1<<a)?hull.max[a]:hull.min[a]);
    const q=v.map((n,a)=>(n+offset[a]*split)*(1-join)+(hull.targetMin?(corner&(1<<a)?hull.targetMax[a]:hull.targetMin[a]):target[a])*join);
    const x=Math.cos(yaw)*q[0]+Math.sin(yaw)*q[2],z=-Math.sin(yaw)*q[0]+Math.cos(yaw)*q[2];
    const y=Math.cos(pitch)*q[1]-Math.sin(pitch)*z,z2=Math.sin(pitch)*q[1]+Math.cos(pitch)*z;
    points.push([Math.cos(roll)*x-Math.sin(roll)*y,Math.sin(roll)*x+Math.cos(roll)*y,z2]);
   }
  }
  const center=[0,1].map(a=>(Math.min(...points.map(p=>p[a]))+Math.max(...points.map(p=>p[a])))/2*(1-join));
  const aspect=this.canvas.width/this.canvas.height,safe=.80;
  const fits=zoom=>points.every(p=>{const z=5.5-p[2]*zoom;return z>2.5&&z<13&&Math.abs((p[0]-center[0])*zoom*2.8/aspect/z)<=safe&&Math.abs((p[1]-center[1])*zoom*2.8/z)<=safe;});
  let low=0,high=1+approach*.15-join*.09;
  if(!fits(high)){for(let n=0;n<14;n++){const mid=(low+high)/2;if(fits(mid))low=mid;else high=mid;}high=low;}
  return {split,join,yaw,pitch,roll,zoom:high,center,points,aspect};
 }
 drawIntro(seconds){
  if(!this.gl)return;
  const pose=this.introPose(seconds),gl=this.gl;
  gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(this.program);
  gl.uniform1f(this.explode,pose.split);gl.uniform1f(this.assemble,pose.join);gl.uniform1f(this.zoom,pose.zoom);gl.uniform2f(this.framing,...pose.center);
  gl.uniform2f(this.angle,pose.yaw,pose.pitch);gl.uniform1f(this.roll,pose.roll);gl.uniform1f(this.aspect,pose.aspect);
  gl.drawArrays(gl.TRIANGLES,0,this.count);
 }
 dispose(){this.reset();this.gl?.getExtension('WEBGL_lose_context')?.loseContext();this.el.remove();}
 reset(){cancelAnimationFrame(this.raf);this.raf=0;this.lastTime=0;this.el.hidden=true}
}
