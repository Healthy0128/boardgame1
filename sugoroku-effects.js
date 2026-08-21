(()=>{'use strict';
let rolling=false,allowOriginal=false;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const nextFrame=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
const pipMap={1:[5],2:[1,9],3:[1,5,9],4:[1,3,7,9],5:[1,3,5,7,9],6:[1,3,4,6,7,9]};
function renderDie(el,n,placeholder=false){
  if(!el)return;
  const value=(n>=1&&n<=6)?n:1;
  el.dataset.rich='1';el.dataset.value=placeholder?'0':String(value);el.textContent='';
  for(let i=1;i<=9;i++){
    const p=document.createElement('i');p.className='pip';
    if((placeholder&&i===5)||(!placeholder&&pipMap[value].includes(i)))p.classList.add('on');
    if(placeholder)p.classList.add('placeholder');
    el.appendChild(p);
  }
}
function dieAlreadyCorrect(el,n,placeholder){
  if(!el)return false;
  const expected=placeholder?'0':String(n);
  const pips=el.querySelectorAll(':scope > .pip');
  if(el.dataset.value!==expected||pips.length!==9)return false;
  const on=[...pips].map((p,i)=>p.classList.contains('on')?i+1:0).filter(Boolean);
  const wanted=placeholder?[5]:pipMap[n];
  return on.length===wanted.length&&wanted.every(v=>on.includes(v));
}
function ensureDiceVisible(){
  const dice=document.querySelector('.dice-panel .dice');if(!dice||rolling)return;
  const fromData=parseInt(dice.dataset.value,10),fromText=parseInt(dice.textContent,10);
  const n=(fromData>=1&&fromData<=6)?fromData:((fromText>=1&&fromText<=6)?fromText:0);
  if(n){if(!dieAlreadyCorrect(dice,n,false))renderDie(dice,n,false)}
  else if(!dieAlreadyCorrect(dice,1,true))renderDie(dice,1,true);
}
function currentPlayer(){const t=document.querySelector('#turnBadge')?.textContent||'';return /P2|PLAYER 2/.test(t)?2:1}
function tokenIndex(player){const cells=[...document.querySelectorAll('.sugoroku-board .sq')];return cells.findIndex(c=>c.querySelector(`.token.p${player}`));}
function centerInBoard(board,cell){const br=board.getBoundingClientRect(),cr=cell.getBoundingClientRect();return{x:cr.left-br.left+cr.width/2,y:cr.top-br.top+cr.height/2}}
async function animateToken(player,start,rollTarget,final,template){
  const board=document.querySelector('.sugoroku-board');if(!board||start<0||final<0)return;
  const cells=[...board.querySelectorAll('.sq')];if(!cells[start]||!cells[final])return;
  let real=board.querySelector(`.token.p${player}`);if(!real)return;
  const ghost=(template||real).cloneNode(true);
  ghost.classList.remove('sugoroku-real-hidden');
  ghost.classList.add('sugoroku-ghost');
  real.classList.add('sugoroku-real-hidden');
  board.appendChild(ghost);
  const startPt=centerInBoard(board,cells[start]);
  ghost.style.left=`${startPt.x}px`;ghost.style.top=`${startPt.y}px`;
  await nextFrame();
  const path=[];let cur=start;
  const addToward=target=>{while(cur!==target){cur+=cur<target?1:-1;path.push(cur)}};
  addToward(rollTarget);addToward(final);
  for(const idx of path){
    const pt=centerInBoard(board,cells[idx]);
    ghost.style.left=`${pt.x}px`;ghost.style.top=`${pt.y}px`;
    ghost.classList.add('step-pop');setTimeout(()=>ghost.classList.remove('step-pop'),110);
    await wait(220);
  }
  ghost.remove();
  real=board.querySelector(`.token.p${player}`);
  if(real)real.classList.remove('sugoroku-real-hidden');
}
async function handle(btn,e){
  if(allowOriginal)return;
  if(rolling){e.preventDefault();e.stopImmediatePropagation();return}
  if(!document.querySelector('.sugoroku-board'))return;
  e.preventDefault();e.stopImmediatePropagation();rolling=true;btn.disabled=true;
  const player=currentPlayer(),start=tokenIndex(player),sourceToken=document.querySelector(`.sugoroku-board .token.p${player}`),tokenTemplate=sourceToken?.cloneNode(true)||null,dice=document.querySelector('.dice-panel .dice');
  if(dice)dice.classList.add('dice-rolling');
  const started=performance.now();
  while(performance.now()-started<2000){renderDie(dice,1+Math.floor(Math.random()*6),false);await wait(78)}
  const result=1+Math.floor(Math.random()*6);renderDie(dice,result,false);
  if(dice){dice.classList.remove('dice-rolling');dice.classList.add('dice-land');setTimeout(()=>dice.classList.remove('dice-land'),260)}
  const oldRandom=Math.random;Math.random=()=>Math.min(.999999,(result-.5)/6);allowOriginal=true;
  try{btn.click()}finally{allowOriginal=false;Math.random=oldRandom}
  await wait(60);
  const freshDice=document.querySelector('.dice-panel .dice');renderDie(freshDice,result,false);
  const final=tokenIndex(player),rollTarget=Math.min(29,start+result);
  await animateToken(player,start,rollTarget,final,tokenTemplate);
  rolling=false;const fresh=document.querySelector('.dice-panel button');if(fresh)fresh.disabled=false;ensureDiceVisible();
}
document.addEventListener('click',e=>{const btn=e.target?.closest?.('.dice-panel button');if(btn)handle(btn,e)},true);
const screen=document.querySelector('#gameScreen');
if(screen)new MutationObserver(()=>requestAnimationFrame(ensureDiceVisible)).observe(screen,{subtree:true,childList:true});
window.addEventListener('DOMContentLoaded',ensureDiceVisible);ensureDiceVisible();
})();