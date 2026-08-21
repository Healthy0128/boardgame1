(()=>{'use strict';
function applyShogiPieceAngles(){
  if(document.querySelector('#gameTitle')?.textContent?.trim()!=='将棋')return;
  const flipped=document.body.classList.contains('face-board-flipped');
  document.querySelectorAll('.shogi-board img.shogi-piece').forEach(img=>{
    const src=img.getAttribute('src')||'';
    const topPiece=src.includes('/white_');
    const angle=flipped?(topPiece?0:180):(topPiece?180:0);
    img.dataset.pieceAngle=String(angle);
    img.style.setProperty('transform',`rotate(${angle}deg)`,'important');
    img.style.setProperty('transform-origin','center','important');
  });
}
const screen=document.querySelector('#gameScreen');
if(screen)new MutationObserver(()=>requestAnimationFrame(applyShogiPieceAngles)).observe(screen,{subtree:true,childList:true,characterData:true});
document.addEventListener('click',e=>{if(e.target?.closest?.('#rotateBtn'))requestAnimationFrame(()=>requestAnimationFrame(applyShogiPieceAngles))},false);
window.addEventListener('resize',()=>requestAnimationFrame(applyShogiPieceAngles));
window.addEventListener('orientationchange',()=>requestAnimationFrame(applyShogiPieceAngles));
applyShogiPieceAngles();
})();