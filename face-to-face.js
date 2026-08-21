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
let scheduled=false;
function activeGame(){return $('#gameScreen')?.classList.contains('active')&&$('#board')?.children.length>0}
function sideForTurn(title,turn){
  if(title==='リバーシ')return turn.includes('白')?'top':turn.includes('黒')?'bottom':'';
  if(title==='チェス')return turn.includes('黒')?'top':turn.includes('白')?'bottom':'';
  if(title==='将棋')return /後手|△/.test(turn)?'top':/先手|▲/.test(turn)?'bottom':'';
  return /P2|PLAYER 2/.test(turn)?'top':/P1|PLAYER 1/.test(turn)?'bottom':'';
}
function makeHud(side){
  const el=document.createElement('div');el.className='face-hud '+side;el.dataset.faceHud=side;
  el.innerHTML=`<div class="face-player"></div><div class="face-main"><div class="face-title"></div><div class="face-turn"></div><div class="face-meta"></div></div><div class="face-mini-actions"></div>`;
  return el;
}
function ensureHud(){
  const shell=$('.game-shell'),topAnchor=$('#capturedTop'),bottomAnchor=$('#capturedBottom');if(!shell||!topAnchor||!bottomAnchor)return;
  let top=shell.querySelector('[data-face-hud="top"]'),bottom=shell.querySelector('[data-face-hud="bottom"]');
  if(!top){top=makeHud('top');shell.insertBefore(top,topAnchor)}
  if(!bottom){bottom=makeHud('bottom');bottomAnchor.insertAdjacentElement('afterend',bottom)}
  return {top,bottom};
}
function proxyButton(label,target,danger=false){const b=document.createElement('button');b.textContent=label;if(danger)b.classList.add('danger');b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();target?.click()});return b}
function fillActions(hud,isTop){
  const box=hud.querySelector('.face-mini-actions');box.innerHTML='';
  if(!isTop)return;
  const undo=$('#undoBtn'),rotate=$('#rotateBtn'),restart=$('#restartBtn');
  if(undo)box.append(proxyButton('↶',undo));
  if(rotate)box.append(proxyButton('⟳',rotate));
  const primary=$('.dice-panel button');if(primary){const b=proxyButton('🎲',primary);b.className='face-primary';box.append(b)}
  if(restart)box.append(proxyButton('↺',restart,true));
}
function syncHud(){
  if(!activeGame()){document.body.classList.remove('face-to-face');document.querySelectorAll('[data-face-hud]').forEach(x=>x.remove());return}
  document.body.classList.add('face-to-face');
  const pair=ensureHud();if(!pair)return;
  const title=$('#gameTitle')?.textContent?.trim()||'BOARD TABLE',turn=$('#turnBadge')?.textContent?.trim()||'',status=$('#status')?.textContent?.trim()||'',score=$('#score')?.textContent?.replace(/\s+/g,' ').trim()||'';
  const names=gameNames[title]||{top:'PLAYER 2',bottom:'PLAYER 1'},active=sideForTurn(title,turn);
  [['top',pair.top],['bottom',pair.bottom]].forEach(([side,hud])=>{
    hud.classList.toggle('active',active===side);
    hud.querySelector('.face-player').textContent=names[side];
    hud.querySelector('.face-title').textContent=title;
    hud.querySelector('.face-turn').textContent=turn||'対戦中';
    hud.querySelector('.face-meta').textContent=[status,score].filter(Boolean).join(' ｜ ');
    fillActions(hud,side==='top');
  });
}
function syncMancala(){
  const board=$('.mancala-board');if(!board)return;
  board.querySelectorAll('.pit').forEach(p=>{p.classList.toggle('face-top-side',p.style.gridRow==='1');p.classList.toggle('face-bottom-side',p.style.gridRow==='2')});
  board.querySelector('.store.left')?.classList.add('face-top-side');
  board.querySelector('.store.right')?.classList.add('face-bottom-side');
}
function syncSugoroku(){
  document.querySelectorAll('.sugoroku-board .sq').forEach(sq=>{
    if(sq.dataset.faceLabels==='1')return;
    const original=[...sq.children].find(x=>x.tagName==='SPAN');if(!original)return;
    sq.dataset.faceLabels='1';original.classList.add('face-original-label');
    const top=document.createElement('span'),bottom=document.createElement('span');
    top.className='face-square-label top';bottom.className='face-square-label bottom';top.textContent=original.textContent;bottom.textContent=original.textContent;
    sq.append(top,bottom);
  });
}
function sync(){scheduled=false;syncHud();syncMancala();syncSugoroku()}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(sync)}
new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','style']});
window.addEventListener('DOMContentLoaded',schedule);window.addEventListener('resize',schedule);window.addEventListener('orientationchange',schedule);
})();