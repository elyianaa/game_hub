// Tile Match game (self-contained, does not depend on the other JS files).
(()=>{
const $=id=>document.getElementById(id),E=['🍎','🍌','🍇','🍓','🍒','🥕','🌽','🍉','🍑','🥝','🍋','🍍'];
const rng=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const shuf=(a,r)=>{for(let i=a.length-1;i>0;i--){const j=r()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
let sv={lvl:1};try{sv=Object.assign(sv,JSON.parse(localStorage.getItem('tile1')||'{}'))}catch(e){}
const persist=()=>{try{localStorage.setItem('tile1',JSON.stringify(sv))}catch(e){}};
let C=6,lvl=sv.lvl,T=[],tray=[],hist=[],pw={},busy=false,over=false;
const blocked=t=>T.some(o=>o.s==='b'&&o.l>t.l&&Math.abs(o.x-t.x)<1&&Math.abs(o.y-t.y)<1);
const AN=[[1,21],[10,60],[20,90],[30,150],[40,210],[50,300]];
function size(n){if(n>50)return 450;let i=0;while(n>AN[i+1][0])i++;const[l0,t0]=AN[i],[l1,t1]=AN[i+1];return Math.round((t0+(t1-t0)*(n-l0)/(l1-l0))/3)*3}
function start(n){try{begin(n)}catch(err){$('t_board').textContent='Tile Match error: '+err.message;console.error(err)}}
function begin(n){lvl=n;over=false;busy=false;tray=[];hist=[];pw={u:2,s:1,o:1};$('t_ov').classList.add('hide');
 const r=rng(n*104729+7),total=size(n),tri=total/3,kinds=Math.min(12,3+Math.ceil(n*.9));C=total<=90?6:total<=150?7:total<=210?8:total<=300?9:10;const L=Math.max(2,Math.ceil(total/(.55*C*C)));
 const ks=[];for(let i=0;i<tri;i++)ks.push(i%kinds);const pool=shuf([...ks,...ks,...ks],r);
 T=[];let left=total;
 for(let l=0;l<L;l++){const o=l%2,cells=[],nc=o?C-1:C,nr=o?C:C+1;
  for(let c=0;c<nc;c++)for(let q=0;q<nr;q++)cells.push([c+o*.5,q+o*.5]);shuf(cells,r);
  const cnt=l===L-1?left:Math.min(left,Math.ceil(total/L));
  for(let k=0;k<cnt;k++)T.push({x:cells[k][0],y:cells[k][1],l,k:0,s:'b'});left-=cnt}
 T.forEach((t,i)=>t.k=pool[i]);const B=$('t_board');B.style.aspectRatio=C+'/'+(C+1);B.style.setProperty('--fs',(54/C).toFixed(2)+'cqw');render()}
function render(){
 $('t_board').innerHTML=T.filter(t=>t.s==='b').sort((a,b)=>a.l-b.l).map(t=>`<div class="t-tile${blocked(t)?' blk':''}" data-i="${T.indexOf(t)}" style="left:${t.x/C*100}%;top:${t.y/(C+1)*100}%;width:${100/C}%;height:${100/(C+1)}%;z-index:${t.l+1}"><div class="t-face">${E[t.k]}</div></div>`).join('');
 $('t_tray').innerHTML=Array.from({length:7},(_,i)=>{const t=tray[i];return `<div class="t-slot">${t?`<div class="t-face${t.pop?' pop':''}">${E[t.k]}</div>`:''}</div>`}).join('');
 $('t_lvl').textContent=lvl;$('t_left').textContent=(T.filter(t=>t.s==='b').length+tray.length)+' tiles left';
 $('t_undo').textContent='↩ Undo ('+pw.u+')';$('t_shuf').textContent='🔀 Shuffle ('+pw.s+')';$('t_out').textContent='📤 Move out ('+pw.o+')'}
function end(win){over=true;$('t_ovt').textContent=win?'🎉 Level '+lvl+' cleared!':'😵 Tray is full!';
 const b=$('t_ovb');b.textContent=win?'Next level ▶':'Try again';b.onclick=()=>start(win?lvl+1:lvl);$('t_ov').classList.remove('hide');
 if(win){sv.lvl=Math.max(sv.lvl,lvl+1);persist()}}
$('t_board').onclick=e=>{const el=e.target.closest('.t-tile');if(!el||over||busy)return;const t=T[+el.dataset.i];
 if(blocked(t)||tray.length>=7)return;
 t.s='t';hist.push(t);const p=tray.map(x=>x.k).lastIndexOf(t.k);p<0?tray.push(t):tray.splice(p+1,0,t);
 const m=tray.filter(x=>x.k===t.k).slice(0,3);
 if(m.length===3){busy=true;m.forEach(x=>x.pop=1);render();
  setTimeout(()=>{m.forEach(x=>x.s='x');tray=tray.filter(x=>x.s==='t');busy=false;render();
   if(!T.some(x=>x.s!=='x'))end(true)},260)}
 else{render();if(tray.length>=7)end(false)}};
$('t_undo').onclick=()=>{if(over||busy||!pw.u)return;while(hist.length&&hist[hist.length-1].s!=='t')hist.pop();
 const t=hist.pop();if(!t)return;tray.splice(tray.indexOf(t),1);t.s='b';pw.u--;render()};
$('t_shuf').onclick=()=>{if(over||busy||!pw.s)return;const b=T.filter(t=>t.s==='b'),k=shuf(b.map(t=>t.k),Math.random);b.forEach((t,i)=>t.k=k[i]);pw.s--;render()};
$('t_out').onclick=()=>{if(over||busy||!pw.o||!tray.length)return;tray.splice(0,3).forEach(t=>t.s='b');pw.o--;render()};
$('t_rst').onclick=()=>start(lvl);
window.tileStart=()=>{if(over)start(lvl)};
start(lvl);
})();
