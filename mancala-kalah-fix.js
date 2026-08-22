(()=>{'use strict';
const CARD='[data-extra-game="mancala"]';
const $=s=>document.querySelector(s);
const DROP_MS=70;
const stoneSfx=['assets/audio/mancala/stone_01.ogg','assets/audio/mancala/stone_02.ogg','assets/audio/mancala/stone_03.ogg'];
const bgmSrc='assets/audio/bgm/mancala_percussion.ogg';
let active=false,state=null,history=[],busy=false,soundOn=true,bgm=null;
const clone=x=>JSON.parse(JSON.stringify(x));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function sfx(v=.42,rate=1){if(!soundOn)return;try{const a=new Audio(stoneSfx[Math.floor(Math.random()*stoneSfx.length)]);a.volume=v;a.playbackRate=rate*(.98+Math.random()*.04);a.play().catch(()=>{})}catch{}}
function playBgm(){stopBgm();if(!soundOn)return;try{bgm=new Audio(bgmSrc);bgm.loop=true;bgm.volume=.18;bgm.play().catch(()=>{})}catch{}}
function stopBgm(){if(!bgm)return;try{bgm.pause();bgm.currentTime=0}catch{}bgm=null}
function init(){state={pits:Array(12).fill(4),stores:[0,0],turn:0,over:false};history=[clone(state)];busy=false}
function ownPit(i,p){return p===0?i>=0&&i<6:i>=6&&i<12}
function pitToRing(i){return i<6?i:i+1}
function ringToPit(r){return r>=0&&r<=5?r:r>=7&&r<=12?r-1:null}
function ownStore(p){return p===0?6:13}
function oppStore(p){return p===0?13:6}
function sideEmpty(p){return p===0?state.pits.slice(0,6).every(n=>n===0):state.pits.slice(6,12).every(n=>n===0)}
function commit(){history.push(clone(state));if(history.length>80)history.shift()}
function updateHud(){if(!active||!state)return;$('#gameKicker').textContent='MANCALA';$('#gameTitle').textContent='マンカラ';$('#turnBadge').textContent=state.over?'終了':`P${state.turn+1} の番`;$('#status').textContent=state.over?'ゲーム終了':busy?'石を配っています…':'自分側の穴を選んで石を配ります';$('#score').innerHTML=`<span>P1 <strong>${state.stores[0]}</strong></span><span>P2 <strong>${state.stores[1]}</strong></span>`;$('#capturedTop').innerHTML='';$('#capturedBottom').innerHTML=''}
function render(){if(!active||!state)return;updateHud();const board=$('#board');board.innerHTML='';board.className='board extra-board';const d=document.createElement('div');d.className='mancala-board';const left=document.createElement('button');left.className='store left';left.disabled=true;left.textContent=state.stores[1];d.append(left);for(let c=0;c<6;c++){const i=11-c,b=document.createElement('button');b.className='pit'+(!busy&&!state.over&&state.turn===1&&state.pits[i]?' active':'');b.textContent=state.pits[i];b.disabled=busy||state.over||state.turn!==1||!state.pits[i];b.onclick=()=>play(i);b.style.gridColumn=String(c+2);b.style.gridRow='1';d.append(b)}for(let c=0;c<6;c++){const i=c,b=document.createElement('button');b.className='pit'+(!busy&&!state.over&&state.turn===0&&state.pits[i]?' active':'');b.textContent=state.pits[i];b.disabled=busy||state.over||state.turn!==0||!state.pits[i];b.onclick=()=>play(i);b.style.gridColumn=String(c+2);b.style.gridRow='2';d.append(b)}const right=document.createElement('button');right.className='store right';right.disabled=true;right.textContent=state.stores[0];d.append(right);board.append(d)}
async function play(i){if(!active||busy||state.over||!ownPit(i,state.turn)||!state.pits[i])return;busy=true;const p=state.turn;let seeds=state.pits[i];state.pits[i]=0;let ring=pitToRing(i),lastRing=ring;render();while(seeds>0){ring=(ring+1)%14;if(ring===oppStore(p))continue;const pit=ringToPit(ring);if(ring===ownStore(p)){state.stores[p]++}else if(pit!==null){state.pits[pit]++}lastRing=ring;seeds--;sfx(.42,1+(state.pits.length-seeds)*.001);render();await sleep(DROP_MS)}
const lastPit=ringToPit(lastRing);if(lastPit!==null&&ownPit(lastPit,p)&&state.pits[lastPit]===1){const opposite=11-lastPit;if(state.pits[opposite]>0){state.stores[p]+=1+state.pits[opposite];state.pits[lastPit]=0;state.pits[opposite]=0;render();await sleep(120)}}
if(sideEmpty(0)||sideEmpty(1)){state.stores[0]+=state.pits.slice(0,6).reduce((a,b)=>a+b,0);state.stores[1]+=state.pits.slice(6,12).reduce((a,b)=>a+b,0);state.pits.fill(0);state.over=true;busy=false;commit();render();setTimeout(()=>finish(),120);return}
if(lastRing!==ownStore(p))state.turn=1-p;busy=false;commit();render()}
function finish(){if(!active||!state?.over)return;const a=state.stores[0],b=state.stores[1],msg=a===b?`引き分けです（${a} - ${b}）`:`PLAYER ${a>b?1:2} の勝ちです（${a} - ${b}）`;if(confirm(`ゲーム終了\n${msg}\n\nもう一度プレイしますか？`)){init();render()}}
function show(){active=true;$('#home').classList.remove('active');$('#gameScreen').classList.add('active');$('#homeBtn').classList.remove('hidden');render();playBgm()}
function home(){active=false;busy=false;stopBgm();state=null;history=[];$('#board').innerHTML='';$('#gameScreen').classList.remove('active');$('#home').classList.add('active');$('#homeBtn').classList.add('hidden')}
function undo(){if(!active||busy||history.length<2)return;history.pop();state=clone(history[history.length-1]);render()}
document.addEventListener('click',e=>{const card=e.target.closest?.(CARD);if(card){e.preventDefault();e.stopImmediatePropagation();init();show();return}if(!active)return;const id=e.target?.id;if(id==='homeBtn'){e.preventDefault();e.stopImmediatePropagation();home()}else if(id==='undoBtn'){e.preventDefault();e.stopImmediatePropagation();undo()}else if(id==='rotateBtn'){e.preventDefault();e.stopImmediatePropagation()}else if(id==='restartBtn'){e.preventDefault();e.stopImmediatePropagation();if(!busy&&confirm('最初から始めますか？')){init();render()}}else if(id==='soundBtn'){e.preventDefault();e.stopImmediatePropagation();soundOn=!soundOn;if(soundOn)playBgm();else stopBgm();$('#soundBtn').textContent=soundOn?'♪':'×'}},true);
})();
