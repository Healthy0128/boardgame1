(()=>{'use strict';
const positions=[[18,24],[42,18],[68,28],[28,52],[55,50],[78,58],[18,72],[44,76],[68,78],[34,34],[58,34],[82,38]];
function decorateMancala(root=document){root.querySelectorAll('.pit,.store').forEach(el=>{if(el.dataset.rich==='1')return;const n=parseInt(el.textContent,10);if(Number.isNaN(n))return;el.dataset.rich='1';el.setAttribute('aria-label',`${n}個の石`);el.textContent='';const pebbles=document.createElement('span');pebbles.className='mancala-pebbles';for(let i=0;i<Math.min(n,12);i++){const s=document.createElement('i');s.className='mancala-pebble p'+((i+n)%4+1);const [x,y]=positions[i%positions.length];s.style.left=x+'%';s.style.top=y+'%';s.style.setProperty('--r',`${-24+(i*37)%48}deg`);pebbles.appendChild(s)}el.appendChild(pebbles);const count=document.createElement('span');count.className='pit-count';count.textContent=n;el.appendChild(count)})}
function decorateDice(root=document){root.querySelectorAll('.dice').forEach(el=>{if(el.dataset.rich==='1')return;const n=parseInt(el.textContent,10);if(!(n>=1&&n<=6))return;el.dataset.rich='1';el.dataset.value=n;el.textContent='';const pipMap={1:[5],2:[1,9],3:[1,5,9],4:[1,3,7,9],5:[1,3,5,7,9],6:[1,3,4,6,7,9]};for(let i=1;i<=9;i++){const p=document.createElement('i');p.className='pip';if(pipMap[n].includes(i))p.classList.add('on');el.appendChild(p)}})}
function decorate(){decorateMancala();decorateDice()}
const obs=new MutationObserver(()=>requestAnimationFrame(decorate));obs.observe(document.documentElement,{subtree:true,childList:true});
window.addEventListener('DOMContentLoaded',decorate);
})();
