// Game Hub: switches between Home, Sudoku and Tile Match, and shows progress stats.
(()=>{
const $=id=>document.getElementById(id),V=['home','sudoku','tile'];
function stats(){let s={},t={};try{s=JSON.parse(localStorage.getItem('sdk100')||'{}')}catch(e){}try{t=JSON.parse(localStorage.getItem('tile1')||'{}')}catch(e){}
 const n=Object.keys(s).length,l=t.lvl||1;$('hs1').textContent=n;$('hs2').textContent=l;$('hp1').textContent=n+' / 100 solved';$('hp2').textContent='Level '+l}
function go(v){V.forEach(k=>$(k).classList.toggle('hide',k!==v));window.scrollTo(0,0);if(v==='home')stats()}
document.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b)go(b.dataset.go)});
stats();
})();
