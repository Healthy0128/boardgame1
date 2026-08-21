(()=>{'use strict';
let flipped=false,lastTitle='';
function title(){return document.querySelector('#gameTitle')?.textContent?.trim()||''}
function markPiece(img,far){img.classList.toggle('face-far-piece',far);img.classList.toggle('face-near-piece',!far)}
function sync(){
  const t=title();if(t!==lastTitle){flipped=false;lastTitle=t}
  document.body.classList.toggle('face-board-flipped',flipped);
  if(t==='チェス'){
    document.querySelectorAll('.chess-board .chess-piece').forEach(img=>{
      const src=img.getAttribute('src')||'';
      const far=flipped?src.includes('white_'):src.includes('black_');
      markPiece(img,far);
    });
  }
  if(t==='将棋'){
    document.querySelectorAll('.shogi-board .shogi-piece').forEach(img=>{
      const src=img.getAttribute('src')||'';
      const isGote=src.includes('/white_');
      const far=flipped?!isGote:isGote;
      markPiece(img,far);
    });
  }
}
const screen=document.querySelector('#gameScreen');
if(screen)new MutationObserver(()=>requestAnimationFrame(sync)).observe(screen,{subtree:true,childList:true,characterData:true});
document.addEventListener('click',e=>{if(e.target?.closest?.('#rotateBtn')){flipped=!flipped;requestAnimationFrame(sync)}},false);
window.addEventListener('orientationchange',()=>requestAnimationFrame(sync));
window.addEventListener('resize',()=>requestAnimationFrame(sync));
sync();
})();