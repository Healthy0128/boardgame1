(()=>{'use strict';
const $=s=>document.querySelector(s);
const gameNames={
  'リバーシ':{top:'白',bottom:'黒'},
  'チェス':{top:'黒',bottom:'白'},
  '将棋':{top:'後手',bottom:'先手'},
  'マンカラ':{top:'PLAYER 2',bottom:'PLAYER 1'},
  '五目並べ':{top:'PLAYER 2',bottom:'PLAYER 1'},
  'コネクト4':{top:'PLAYER 2',bottom:'PLAYER 1'},
  'おはじき':{top:'PLAYER 2',bottom:'PLAYER 1'},
  'はさみ将棋':{top:'PLAYER 2',bottom:'PLAYER 1'},
  'チェッカー':{top:'PLAYER 2',bottom:'PLAYER 1'},
  'Dots & Boxes':{top:'PLAYER 2',bottom:'PLAYER 1'},
  '双六':{top:'PLAYER 2',bottom:'PLAYER 1'}
};
let scheduled=false,syncing=false,lastTitle='';
function activeGame(){return $('#gameScreen')?.classList.contains('active')&&$('#board')?.children.length>0}
function sideForTurn(title,turn){
  if(title==='リバーシ')return turn.includes('白')?'top':turn.includes('黒')?'bottom':'';
  if(title==='チェス')return turn.includes('黒')?'top':turn.includes('白')?'bottom':'';
  if(title==='将棋')return /後手|▽|△/.test(turn)?'top':/先手|▲/.test(turn)?'bottom':'';
  return /P2|PLAYER 2/.test(turn)?'top':/P1|PLAYER 1/.test(turn)?'bottom':'';
}
function setText(el,text){if(el&&el.textContent!==text)el.textContent=text}
function makeHud(side){
  const el=document.createElement('div');el.className='face-hud '+side;el.dataset.faceHud=side;el.dataset.faceUi='1';
  el.innerHTML='<div class="face-player"></div><div class="face-main"><div class="face-title"></div><div class="face-turn"></div><div class="face-meta"></div></div><div class="face-mini-actions"></div>';
  return el;
}
function ensureHud(){
  const shell=$('.game-shell'),topAnchor=$('#capturedTop'),bottomAnchor=$('#capturedBottom');if(!shell||!topAnchor||!bottomAnchor)return null;
  let top=shell.querySelector('[data-face-hud="top"]'),bottom=shell.querySelector('[data-face-hud="bottom"]');
  if(!top){top=makeHud('top');shell.insertBefore(top,topAnchor)}
  if(!bottom){bottom=makeHud('bottom');bottomAnchor.insertAdjacentElement('afterend',bottom)}
  return {top,bottom};
}
function actionButton(label,targetId,danger=false){
  const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.faceProxy=targetId;if(danger)b.classList.add('danger');
  b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();document.getElementById(targetId)?.click()});
  return b;
}
function ensureActions(hud,isTop){
  const box=hud.querySelector('.face-mini-actions');if(!box||box.dataset.ready==='1')return;
  box.dataset.ready='1';
  if(!isTop)return;
  box.append(actionButton('↶','undoBtn'));
  box.append(actionButton('↺','restartBtn',true));
}
function syncHud(){
  if(!activeGame()){
    document.body.classList.remove('face-to-face','mancala-active');
    document.querySelectorAll('[data-face-hud]').forEach(x=>x.remove());
    lastTitle='';
    return;
  }
  document.body.classList.add('face-to-face');
  const pair=ensureHud();if(!pair)return;
  const title=$('#gameTitle')?.textContent?.trim()||'BOARD TABLE',turn=$('#turnBadge')?.textContent?.trim()||'',status=$('#status')?.textContent?.trim()||'',score=$('#score')?.textContent?.replace(/\s+/g,' ').trim()||'';
  document.body.classList.toggle('mancala-active',title==='マンカラ');
  const names=gameNames[title]||{top:'PLAYER 2',bottom:'PLAYER 1'},active=sideForTurn(title,turn);
  [['top',pair.top],['bottom',pair.bottom]].forEach(([side,hud])=>{
    hud.classList.toggle('active',active===side);
    setText(hud.querySelector('.face-player'),names[side]);
    setText(hud.querySelector('.face-title'),title);
    setText(hud.querySelector('.face-turn'),turn||'対戦中');
    setText(hud.querySelector('.face-meta'),[status,score].filter(Boolean).join(' ｜ '));
    ensureActions(hud,side==='top');
  });
  lastTitle=title;
}
function syncMancala(){
  const b=$('.mancala-board');if(!b)return;
  b.querySelectorAll('.pit').forEach(p=>{p.classList.toggle('face-top-side',p.style.gridRow==='1');p.classList.toggle('face-bottom-side',p.style.gridRow==='2')});
  b.querySelector('.store.left')?.classList.add('face-top-side');
  b.querySelector('.store.right')?.classList.add('face-bottom-side');
}
function syncSugoroku(){
  document.querySelectorAll('.sugoroku-board .sq').forEach(sq=>{
    if(sq.dataset.faceLabels==='1')return;
    const original=[...sq.children].find(x=>x.tagName==='SPAN');if(!original)return;
    sq.dataset.faceLabels='1';original.classList.add('face-original-label');
    const top=document.createElement('span'),bottom=document.createElement('span');
    top.className='face-square-label top';bottom.className='face-square-label bottom';top.dataset.faceUi='1';bottom.dataset.faceUi='1';top.textContent=original.textContent;bottom.textContent=original.textContent;
    sq.append(top,bottom);
  });
}
function syncShogi(){
  const b=$('.shogi-board');if(!b)return;
  const cells=[...b.children];
  let whiteTop=0,blackTop=0,whiteBottom=0,blackBottom=0;
  cells.forEach((cell,i)=>{
    const img=cell.querySelector('.shogi-piece');if(!img)return;
    const isWhite=img.getAttribute('src')?.includes('/white_');
    const isBlack=img.getAttribute('src')?.includes('/black_');
    if(i<36){if(isWhite)whiteTop++;if(isBlack)blackTop++}
    if(i>=45){if(isWhite)whiteBottom++;if(isBlack)blackBottom++}
  });
  const normalScore=whiteTop+blackBottom,rotatedScore=blackTop+whiteBottom;
  const farIsWhite=normalScore>=rotatedScore;
  b.querySelectorAll('.shogi-piece').forEach(img=>{
    const isWhite=img.getAttribute('src')?.includes('/white_');
    const far=farIsWhite?isWhite:!isWhite;
    img.classList.toggle('face-far-piece',far);
    img.classList.toggle('face-near-piece',!far);
  });
}
function sync(){if(syncing)return;syncing=true;scheduled=false;try{syncHud();syncMancala();syncSugoroku();syncShogi()}finally{syncing=false}}
function schedule(){if(scheduled||syncing)return;scheduled=true;requestAnimationFrame(sync)}
function generatedMutation(m){
  const node=m.target?.nodeType===1?m.target:m.target?.parentElement;
  return !!node?.closest?.('[data-face-ui="1"],[data-face-hud]');
}
const screen=$('#gameScreen');
if(screen){
  new MutationObserver(ms=>{if(ms.some(m=>!generatedMutation(m)))schedule()}).observe(screen,{subtree:true,childList:true,characterData:true});
  new MutationObserver(schedule).observe(screen,{attributes:true,attributeFilter:['class']});
}
window.addEventListener('DOMContentLoaded',schedule);window.addEventListener('resize',schedule);window.addEventListener('orientationchange',schedule);
document.addEventListener('click',e=>{if(e.target?.closest?.('#undoBtn,#restartBtn,#rotateBtn,.cell,.pit,.store,.xcell,.edge,.dice-panel button,.ohajiki-canvas'))schedule()},false);
schedule();
})();