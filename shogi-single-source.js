(()=>{'use strict';
function apply(){
  if(document.querySelector('#gameTitle')?.textContent?.trim()!=='将棋')return;
  const flipped=document.body.classList.contains('face-board-flipped');
  document.querySelectorAll('.shogi-board img.shogi-piece').forEach(img=>{
    let owner=img.dataset.shogiOwner;
    const src=img.getAttribute('src')||'';
    if(!owner) owner=src.includes('/white_')?'w':'b';
    img.dataset.shogiOwner=owner;
    if(src.includes('/white_')) img.src=src.replace('/white_','/black_');
    const angle=flipped?(owner==='w'?0:180):(owner==='w'?180:0);
    img.dataset.pieceAngle=String(angle);
    img.style.setProperty('transform',`rotate(${angle}deg)`,'important');
    img.style.setProperty('transform-origin','center','important');
  });
}
const screen=document.querySelector('#gameScreen');
if(screen)new MutationObserver(()=>requestAnimationFrame(apply)).observe(screen,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});
document.addEventListener('click',e=>{if(e.target?.closest?.('#rotateBtn'))requestAnimationFrame(()=>requestAnimationFrame(apply))},false);
window.addEventListener('resize',()=>requestAnimationFrame(apply));
window.addEventListener('orientationchange',()=>requestAnimationFrame(apply));
apply();
})();