(()=>{'use strict';
const positions=[[18,24],[42,18],[68,28],[28,52],[55,50],[78,58],[18,72],[44,76],[68,78],[34,34],[58,34],[82,38]];
let sowing=false;
function makePebble(i,n){const s=document.createElement('i');s.className='mancala-pebble p'+((i+n)%4+1);const [x,y]=positions[i%positions.length];s.style.left=x+'%';s.style.top=y+'%';s.style.setProperty('--r',`${-24+(i*37)%48}deg`);return s}
function decorateMancala(root=document){root.querySelectorAll('.pit,.store').forEach(el=>{if(el.dataset.rich==='1')return;const n=parseInt(el.textContent,10);if(Number.isNaN(n))return;el.dataset.rich='1';el.setAttribute('aria-label',`${n}個の石`);el.textContent='';const pebbles=document.createElement('span');pebbles.className='mancala-pebbles';for(let i=0;i<Math.min(n,12);i++)pebbles.appendChild(makePebble(i,n));el.appendChild(pebbles);const count=document.createElement('span');count.className='pit-count';count.textContent=n;el.appendChild(count)})}
function decorateDice(root=document){root.querySelectorAll('.dice').forEach(el=>{if(el.dataset.rich==='1')return;const n=parseInt(el.textContent,10);if(!(n>=1&&n<=6))return;el.dataset.rich='1';el.dataset.value=n;el.textContent='';const pipMap={1:[5],2:[1,9],3:[1,5,9],4:[1,3,7,9],5:[1,3,5,7,9],6:[1,3,4,6,7,9]};for(let i=1;i<=9;i++){const p=document.createElement('i');p.className='pip';if(pipMap[n].includes(i))p.classList.add('on');el.appendChild(p)}})}
function syncModeClass(){const active=!!document.querySelector('.mancala-board')&&document.querySelector('#gameScreen')?.classList.contains('active');document.body.classList.toggle('mancala-active',active)}
function decorate(){decorateMancala();decorateDice();syncModeClass()}
function logicalPosFor(el,children){const i=children.indexOf(el);if(i>=7&&i<=12)return i-7;if(i>=1&&i<=6)return 12-i;return i===13?6:i===0?13:null}
function elementForPos(pos,children){if(pos>=0&&pos<=5)return children[7+pos];if(pos===6)return children[13];if(pos>=7&&pos<=12)return children[12-(pos-1)];if(pos===13)return children[0];return null}
function visualCount(el){return parseInt(el?.querySelector('.pit-count')?.textContent||'0',10)||0}
function setVisualCount(el,n){if(!el)return;const count=el.querySelector('.pit-count');const pebbles=el.querySelector('.mancala-pebbles');if(count)count.textContent=n;if(pebbles){pebbles.innerHTML='';for(let i=0;i<Math.min(n,12);i++)pebbles.appendChild(makePebble(i,n))}}
function animateDrop(target,n){if(!target)return;setVisualCount(target,n);const pebbles=target.querySelector('.mancala-pebbles');const last=pebbles?.lastElementChild;if(last){last.classList.add('mancala-drop');setTimeout(()=>last.classList.remove('mancala-drop'),220)}}
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
async function interceptMancalaClick(ev){const pit=ev.target.closest('.mancala-board .pit');if(!pit||sowing||pit.disabled)return;const board=pit.closest('.mancala-board');const children=[...board.children];const start=logicalPosFor(pit,children);const stones=visualCount(pit);if(start==null||stones<=0)return;
  ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation();
  sowing=true;document.body.classList.add('mancala-sowing');
  const original=pit.onclick;setVisualCount(pit,0);
  const p1=children.slice(7,13).some(x=>x.classList.contains('active'));
  const ownStore=p1?6:13,oppStore=p1?13:6;
  let pos=start;
  for(let k=0;k<stones;k++){
    do{pos=(pos+1)%14}while(pos===oppStore);
    const target=elementForPos(pos,children);animateDrop(target,visualCount(target)+1);
    try{const a=new Audio(`assets/audio/mancala/stone_0${1+(k%3)}.ogg`);a.volume=.38;a.playbackRate=.98+Math.random()*.05;a.play().catch(()=>{})}catch{}
    await sleep(105);
  }
  await sleep(90);
  sowing=false;document.body.classList.remove('mancala-sowing');
  if(typeof original==='function')original.call(pit,new MouseEvent('click',{bubbles:false,cancelable:true}));
}
document.addEventListener('click',interceptMancalaClick,true);
const obs=new MutationObserver(()=>requestAnimationFrame(decorate));obs.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
window.addEventListener('DOMContentLoaded',decorate);
})();