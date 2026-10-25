// Modello 3D dei polmoni: sano ↔ fumatore, con simulatore degli anni di fumo.
// Geometria procedurale (three.js) derivata dal modello "Polmoni e fumo di sigaretta".
const stage = document.querySelector('three-d-stage');
const { THREE } = await stage.ready;

function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const rand = rng(7);
const smooth = (a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)};
const clamp01 = x=>Math.min(1,Math.max(0,x));

function weldNormals(g){
  g.computeVertexNormals();
  const p=g.attributes.position,n=g.attributes.normal,map=new Map();
  for(let i=0;i<p.count;i++){
    const k=`${p.getX(i).toFixed(5)},${p.getY(i).toFixed(5)},${p.getZ(i).toFixed(5)}`;
    (map.get(k)||map.set(k,[]).get(k)).push(i);
  }
  const v=new THREE.Vector3();
  for(const ids of map.values()){
    if(ids.length<2)continue;
    v.set(0,0,0);ids.forEach(i=>v.add(new THREE.Vector3(n.getX(i),n.getY(i),n.getZ(i))));v.normalize();
    ids.forEach(i=>n.setXYZ(i,v.x,v.y,v.z));
  }
  n.needsUpdate=true;return g;
}

function merge(geoms){
  const parts=geoms.map(g=>g.index?g.toNonIndexed():g);
  let count=0;parts.forEach(g=>count+=g.attributes.position.count);
  const pos=new Float32Array(count*3),nor=new Float32Array(count*3);let o=0;
  for(const g of parts){pos.set(g.attributes.position.array,o);nor.set(g.attributes.normal.array,o);o+=g.attributes.position.array.length}
  const out=new THREE.BufferGeometry();
  out.setAttribute('position',new THREE.BufferAttribute(pos,3));
  out.setAttribute('normal',new THREE.BufferAttribute(nor,3));
  return out;
}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

// side: -1 = polmone destro (a sinistra di chi guarda), +1 = polmone sinistro
function lungGeom(side){
  const g=new THREE.SphereGeometry(1,128,96);
  g.rotateY(-Math.PI/2);
  const p=g.attributes.position;
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
    const t=(y+1)/2, w=1-0.62*Math.pow(t,2.4);
    const rh=Math.hypot(x,z), rn=rh>1e-6?Math.pow(rh,y<0?0.55:0.8):0, k=rh>1e-6?rn/rh:0;
    let X=x*k*0.07*w, Y=y*0.12, Z=z*k*0.088*w;
    if(x*side<0) X*=0.42+0.18*smooth(0,1,Math.abs(z));
    if(y<0){Y+=0.03*(1-rn*rn)*smooth(-0.3,-1,y)+0.014*z*(-y)}
    if(side>0 && x<0){
      const f=smooth(0.15,0.75,z)*smooth(-0.95,-0.6,y)*(1-smooth(-0.15,0.2,y));
      X+=0.016*f;
    }
    let s=1;
    const yf=0.1-0.6*z, d=Math.abs(y-yf);
    if(d<0.05) s-=0.09*Math.pow(1-d/0.05,2);
    if(side<0 && z>-0.15 && y>yf){const dh=Math.abs(y-0.22);if(dh<0.05)s-=0.08*Math.pow(1-dh/0.05,2)}
    s*=1+0.012*Math.sin(x*7.1+z*5.3)*Math.sin(y*9.7+x*3.1)+0.006*Math.sin(z*17+y*13);
    p.setXYZ(i,X*s+side*0.083,Y,Z*s);
  }
  return weldNormals(g);
}

const M={
  tessuto:new THREE.MeshStandardMaterial({name:'tessuto_polmonare',color:'#8f6e64',roughness:0.62,metalness:0}),
  catrame:new THREE.MeshStandardMaterial({name:'catrame',color:'#2a201b',roughness:0.95,metalness:0}),
  bolle:new THREE.MeshStandardMaterial({name:'bolle_enfisema',color:'#efd9c6',roughness:0.22,metalness:0,transparent:true,opacity:0.88}),
  tumore:new THREE.MeshStandardMaterial({name:'tumore',color:'#d8c29a',roughness:0.75,metalness:0}),
  cartilagine:new THREE.MeshStandardMaterial({name:'cartilagine',color:'#eadbc8',roughness:0.5,metalness:0}),
  bronchi:new THREE.MeshStandardMaterial({name:'bronchi',color:'#b8524a',roughness:0.55,metalness:0}),
};
const SANO={tessuto:new THREE.Color('#e08e86'),bronchi:new THREE.Color('#e2a493')};
const FUMO={tessuto:new THREE.Color('#8f6e64'),bronchi:new THREE.Color('#b8524a')};

const model=new THREE.Group();model.name='polmoni';
const parenchima=new THREE.Group();parenchima.name='parenchima';model.add(parenchima);
const lungs={};
for(const side of [-1,1]){
  const m=new THREE.Mesh(lungGeom(side),M.tessuto);
  m.name=side<0?'polmone_destro':'polmone_sinistro';
  lungs[side]=m;parenchima.add(m);
}

// trachea + anelli cartilaginei
const airway=new THREE.Group();airway.name='vie_aeree';model.add(airway);
const trachea=new THREE.Mesh(new THREE.CylinderGeometry(0.0095,0.0095,0.12,40,1,true),M.cartilagine);
trachea.name='trachea';trachea.position.y=0.115;airway.add(trachea);
const rings=[];
for(let y=0.066;y<0.172;y+=0.0085){const r=new THREE.TorusGeometry(0.0101,0.0022,10,40);r.rotateX(Math.PI/2);r.translate(0,y,0);rings.push(r)}
const ringMesh=new THREE.Mesh(merge(rings),M.cartilagine);ringMesh.name='anelli_cartilaginei';airway.add(ringMesh);
const capT=new THREE.Mesh(new THREE.TorusGeometry(0.0095,0.0012,8,40),M.cartilagine);capT.rotation.x=Math.PI/2;capT.position.y=0.175;capT.name='trachea_bordo';airway.add(capT);

// albero bronchiale
const tubeGeoms=[];
function tube(a,b,r0,bend){
  const mid=a.clone().lerp(b,0.5).add(bend);
  const c=new THREE.QuadraticBezierCurve3(a,mid,b);
  tubeGeoms.push(new THREE.TubeGeometry(c,10,r0,14,false));
  const s=new THREE.SphereGeometry(r0,14,10);s.translate(b.x,b.y,b.z);tubeGeoms.push(s);
}
function inside(q,side){
  const lx=q.x-side*0.083, y=q.y/0.12; if(Math.abs(y)>0.75)return false;
  const t=(y+1)/2, w=1-0.62*Math.pow(t,2.4), ax=0.07*w*(lx*side<0?0.45:1), az=0.088*w;
  return (lx/ax)**2+(q.z/az)**2<0.45;
}
function branch(start,dir,len,r,depth,side){
  let end=start.clone().addScaledVector(dir,len);
  if(!inside(end,side)){len*=0.55;end=start.clone().addScaledVector(dir,len);if(!inside(end,side))return}
  tube(start,end,r,new THREE.Vector3((rand()-.5)*.004,(rand()-.5)*.004,(rand()-.5)*.004));
  if(depth<=0)return;
  const perp=new THREE.Vector3().crossVectors(dir,new THREE.Vector3(rand()-.5,rand()-.5,rand()-.5)).normalize();
  for(const sgn of [-1,1]){
    const d=dir.clone().applyAxisAngle(perp,sgn*(0.45+rand()*0.2)).normalize();
    branch(end,d,len*0.72,r*0.7,depth-1,side);
  }
}
for(const side of [-1,1]){
  const carina=new THREE.Vector3(0,0.058,0), hilum=new THREE.Vector3(side*0.054,0.022,0.002);
  tube(carina,hilum,0.0068,new THREE.Vector3(side*0.004,0.006,0));
  const start=new THREE.Vector3(side*0.07,0.018,0.002);
  tube(hilum,start,0.006,new THREE.Vector3());
  const lobes=side<0
    ?[[0.3,0.95,0.05,0.042],[0.95,-0.1,0.35,0.034],[0.45,-0.88,-0.15,0.05]]
    :[[0.32,0.95,0.08,0.044],[0.5,-0.85,-0.2,0.052]];
  for(const [dx,dy,dz,l] of lobes) branch(start,new THREE.Vector3(side*dx,dy,dz).normalize(),l,0.0045,3,side);
}
const bronchi=new THREE.Mesh(merge(tubeGeoms),M.bronchi);bronchi.name='albero_bronchiale';airway.add(bronchi);

// campionamento della superficie
function sample(side,accept){
  const g=lungs[side].geometry,p=g.attributes.position,n=g.attributes.normal;
  for(let k=0;k<200;k++){
    const i=Math.floor(rand()*p.count);
    const pos=new THREE.Vector3(p.getX(i),p.getY(i),p.getZ(i)),nor=new THREE.Vector3(n.getX(i),n.getY(i),n.getZ(i));
    if(accept(pos,nor))return{pos,nor};
  }
  return null;
}
const Z=new THREE.Vector3(0,0,1);
function placed(geo,pos,nor,sx,sy,sz,lift){
  const g=geo.clone();g.scale(sx,sy,sz);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(Z,nor));
  g.translate(pos.x+nor.x*lift,pos.y+nor.y*lift,pos.z+nor.z*lift);return g;
}
const lateralish=(side)=>(p,n)=>n.x*side>-0.35;

// depositi di catrame — più densi nei lobi superiori
const spotBase=new THREE.SphereGeometry(1,12,8);const spots=[];
for(const side of [-1,1]) for(let k=0;k<230;k++){
  const s=sample(side,(p,n)=>lateralish(side)(p,n)&&rand()<0.25+0.75*smooth(-0.1,0.13,p.y));
  if(!s)continue;
  const r=0.0015+Math.pow(rand(),2.5)*0.0055;
  spots.push(placed(spotBase,s.pos,s.nor,r*(0.8+rand()*0.6),r*(0.8+rand()*0.6),r*0.28,0));
}
shuffle(spots);
const SPOT_V=spotBase.toNonIndexed().attributes.position.count;
const catrame=new THREE.Mesh(merge(spots),M.catrame);catrame.name='depositi_catrame';parenchima.add(catrame);

// bolle di enfisema — apici e margini inferiori
const bulBase=new THREE.SphereGeometry(1,20,14);const bul=[];
const centers=[];
for(const side of [-1,1]){
  for(let c=0;c<3;c++){const s=sample(side,(p,n)=>p.y>0.06&&n.x*side>-0.2);if(s)centers.push([side,s])}
  for(let c=0;c<2;c++){const s=sample(side,(p,n)=>p.y<-0.04&&p.y>-0.08&&n.x*side>0.3);if(s)centers.push([side,s])}
}
for(const [side,c] of centers){
  const n=5+Math.floor(rand()*5);
  for(let k=0;k<n;k++){
    const s=sample(side,(p)=>p.distanceTo(c.pos)<0.02);
    if(!s)continue;
    const r=0.003+rand()*0.007;
    bul.push(placed(bulBase,s.pos,s.nor,r,r,r*0.75,r*0.15));
  }
}
shuffle(bul);
const BUL_V=bulBase.toNonIndexed().attributes.position.count;
const bolle=new THREE.Mesh(merge(bul),M.bolle);bolle.name='bolle_enfisema';parenchima.add(bolle);

// massa tumorale — lobo superiore destro + noduli satelliti
const tum=[];
{
  const g=lungs[-1].geometry,p=g.attributes.position,n=g.attributes.normal;
  const target=new THREE.Vector3(-0.15,0.04,0.035);let best=0,bd=1e9;
  for(let i=0;i<p.count;i++){const d=target.distanceToSquared(new THREE.Vector3(p.getX(i),p.getY(i),p.getZ(i)));if(d<bd){bd=d;best=i}}
  const pos=new THREE.Vector3(p.getX(best),p.getY(best),p.getZ(best)),nor=new THREE.Vector3(n.getX(best),n.getY(best),n.getZ(best));
  const mass=new THREE.IcosahedronGeometry(0.02,5);const mp=mass.attributes.position;
  for(let i=0;i<mp.count;i++){
    const v=new THREE.Vector3(mp.getX(i),mp.getY(i),mp.getZ(i)),u=v.clone().normalize();
    const k=1+0.16*Math.sin(u.x*6+u.y*4)*Math.cos(u.z*5-u.y*3)+0.08*Math.sin(u.x*13+u.z*11)+0.05*Math.sin(u.y*19);
    v.multiplyScalar(k);mp.setXYZ(i,v.x,v.y,v.z);
  }
  mass.scale(1,1,0.8);
  mass.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(Z,nor));
  mass.translate(pos.x-nor.x*0.006,pos.y-nor.y*0.006,pos.z-nor.z*0.006);
  tum.push(weldNormals(mass));
  for(let k=0;k<4;k++){
    const s=sample(-1,(q)=>q.distanceTo(pos)<0.05&&q.distanceTo(pos)>0.028);
    if(s){const r=0.0035+rand()*0.004;tum.push(placed(new THREE.IcosahedronGeometry(1,3),s.pos,s.nor,r,r,r*0.7,r*0.2))}
  }
}
const tumore=new THREE.Mesh(merge(tum),M.tumore);tumore.name='tumore';parenchima.add(tumore);

stage.setObject(model);

// ───────────────────────── Interfaccia ─────────────────────────
const $=s=>document.querySelector(s);
const yearsIn=$('#anni'), yearsOut=$('#anni-val');
const on={catrame:true,enfisema:true,tumore:true};
let years=+yearsIn.value, xray=false, breathing=true;

// soglie illustrative (non deterministiche): il danno cresce con l'esposizione
const T={catrame:[0,25], enfisema:[8,30], tumore:20};

function stato(y){
  if(y===0) return {t:'Polmone sano', d:'Tessuto rosa, elastico e spugnoso: gli alveoli si gonfiano e si svuotano a ogni respiro, le ciglia dei bronchi tengono pulite le vie aeree.'};
  if(y<5) return {t:'Primi anni di fumo', d:'Le ciglia rallentano, compare la tosse del mattino. Il catrame inizia a depositarsi, soprattutto nei lobi superiori.'};
  if(y<12) return {t:'Danno in aumento', d:'I bronchi sono infiammati e producono più muco (bronchite cronica). Il tessuto si scurisce e iniziano a rompersi le pareti di alcuni alveoli.'};
  if(y<20) return {t:'Danno esteso', d:'L’enfisema riduce la superficie per lo scambio di ossigeno: il fiato si accorcia anche con sforzi leggeri (BPCO).'};
  return {t:'Danno grave', d:'Tessuto grigio-bruno e chiazzato, bolle di enfisema, alto rischio di tumore. Non tutti i fumatori si ammalano di cancro, ma 8–9 tumori del polmone su 10 sono legati al fumo.'};
}

function apply(){
  const f=clamp01(years/30);
  M.tessuto.color.copy(SANO.tessuto).lerp(FUMO.tessuto,f);
  M.bronchi.color.copy(SANO.bronchi).lerp(FUMO.bronchi,clamp01(years/15));
  const fc=clamp01((years-T.catrame[0])/(T.catrame[1]-T.catrame[0]));
  catrame.geometry.setDrawRange(0,Math.round(spots.length*fc)*SPOT_V);
  const fe=clamp01((years-T.enfisema[0])/(T.enfisema[1]-T.enfisema[0]));
  bolle.geometry.setDrawRange(0,Math.round(bul.length*fe)*BUL_V);
  catrame.visible=on.catrame&&fc>0;
  bolle.visible=on.enfisema&&fe>0;
  tumore.visible=on.tumore&&years>=T.tumore;
  // ispessimento bronchiale (bronchite cronica)
  M.tessuto.transparent=xray;M.tessuto.opacity=xray?0.28:1;M.tessuto.depthWrite=!xray;M.tessuto.needsUpdate=true;

  yearsOut.textContent=years===0?'mai fumato':years===1?'1 anno':`${years} anni`;
  yearsIn.style.setProperty('--p',`${years/40*100}%`);
  const s=stato(years);$('#stato-t').textContent=s.t;$('#stato-d').textContent=s.d;
  document.querySelectorAll('input[name=preset]').forEach(r=>r.checked=(+r.value===years));
  const avail={catrame:fc>0,enfisema:fe>0,tumore:years>=T.tumore};
  document.querySelectorAll('.layer').forEach(el=>{
    const k=el.dataset.layer;if(!(k in on))return;
    el.classList.toggle('disabled',!avail[k]);
    el.classList.toggle('off',avail[k]&&!on[k]);
    el.setAttribute('aria-checked',String(avail[k]&&on[k]));
    el.setAttribute('aria-disabled',String(!avail[k]));
    const lab=el.querySelector('.soglia');
    if(lab) lab.hidden=avail[k];
  });
  $('#bronchite').setAttribute('aria-checked',String(xray));
  stage.setAttribute('name',years===0?'polmoni_sani':'polmoni_fumatore');
  $('#xray').setAttribute('aria-pressed',String(xray));
}
yearsIn.addEventListener('input',()=>{years=+yearsIn.value;apply()});
document.querySelectorAll('input[name=preset]').forEach(r=>r.addEventListener('change',e=>{years=+e.target.value;yearsIn.value=years;apply()}));
document.querySelectorAll('.layer[data-layer]').forEach(b=>b.addEventListener('click',()=>{if(b.getAttribute('aria-disabled')==='true')return;const k=b.dataset.layer;on[k]=!on[k];apply()}));
$('#xray').addEventListener('click',()=>{xray=!xray;apply()});
$('#bronchite').addEventListener('click',()=>{xray=!xray;apply()});
document.querySelectorAll('.step[data-target="anni"]').forEach(b=>b.addEventListener('click',()=>{years=Math.min(40,Math.max(0,years+(+b.dataset.d)));yearsIn.value=years;apply()}));

// viste e zoom della camera
const cam=stage._camera, ctl=stage._controls;
function stopSpin(){stage.removeAttribute('autorotate');if(ctl)ctl.autoRotate=false;spin.setAttribute('aria-pressed','false')}
function view(dir){
  if(!cam||!ctl)return; stopSpin();
  const d=cam.position.distanceTo(ctl.target);
  const to=ctl.target.clone().add(new THREE.Vector3(...dir).normalize().multiplyScalar(d));
  const from=cam.position.clone(), t0=performance.now();
  (function anim(t){const k=Math.min(1,(t-t0)/600), e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
    cam.position.lerpVectors(from,to,e);
    cam.position.sub(ctl.target).setLength(d).add(ctl.target);
    if(k<1)requestAnimationFrame(anim)})(t0);
}
function zoom(f){ if(!cam||!ctl)return; const v=cam.position.clone().sub(ctl.target); const L=Math.min(Math.max(v.length()*f,0.12),1.2); cam.position.copy(ctl.target).add(v.setLength(L)); }
$('#view-front').addEventListener('click',()=>view([0,0.08,1]));
$('#view-side').addEventListener('click',()=>view([1,0.08,0]));
$('#zoom-in').addEventListener('click',()=>zoom(0.8));
$('#zoom-out').addEventListener('click',()=>zoom(1.25));
const spin=$('#spin');
spin.addEventListener('click',()=>{const a=stage.hasAttribute('autorotate');stage.toggleAttribute('autorotate',!a);
  // OrbitControls legge l'attributo solo all'avvio: aggiorniamo direttamente
  if(stage._controls) stage._controls.autoRotate=!a;
  spin.setAttribute('aria-pressed',String(!a))});
stage._controls?.addEventListener('start',()=>{stage.removeAttribute('autorotate');spin.setAttribute('aria-pressed','false')});
const breathBtn=$('#breath');
breathBtn.addEventListener('click',()=>{breathing=!breathing;breathBtn.setAttribute('aria-pressed',String(breathing));if(!breathing)parenchima.scale.set(1,1,1)});

// respiro: il polmone sano si espande di più e più lentamente
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(reduceMotion){breathing=false;breathBtn.setAttribute('aria-pressed','false')}
let ph=0,last=performance.now();
(function loop(now){
  const dt=(now-last)/1000;last=now;
  if(breathing){
    const f=clamp01(years/30);
    const rate=(12+6*f)/60;           // atti/min → Hz
    const amp=0.045*(1-0.65*f);       // escursione ridotta nel fumatore
    ph+=dt*rate*Math.PI*2;
    const s=(1-Math.cos(ph))/2;
    parenchima.scale.set(1+amp*s,1+amp*0.6*s,1+amp*s);
  }
  requestAnimationFrame(loop);
})(last);

apply();
document.documentElement.classList.add('model-ready');
