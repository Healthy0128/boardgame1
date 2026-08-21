from pathlib import Path

p = Path('app.js')
s = p.read_text(encoding='utf-8')

old = "let current=null, rotated=false, sound=true, history=[];"
new = "let current=null, rotated=false, sound=true, history=[], reversiCells=null;"
assert old in s
s = s.replace(old, new, 1)

old = "function render(){if(!current)return;$('#gameKicker').textContent=current.type==='reversi'?'REVERSI':current.type==='chess'?'CHESS':'SHOGI';$('#gameTitle').textContent=current.type==='reversi'?'リバーシ':current.type==='chess'?'チェス':'将棋';boardEl.className='board '+current.type+'-board';boardEl.innerHTML='';topHand.innerHTML='';bottomHand.innerHTML='';if(current.type==='reversi')renderReversi();if(current.type==='chess')renderChess();if(current.type==='shogi')renderShogi();}"
new = "function render(){if(!current)return;$('#gameKicker').textContent=current.type==='reversi'?'REVERSI':current.type==='chess'?'CHESS':'SHOGI';$('#gameTitle').textContent=current.type==='reversi'?'リバーシ':current.type==='chess'?'チェス':'将棋';boardEl.className='board '+current.type+'-board';boardEl.innerHTML='';reversiCells=null;topHand.innerHTML='';bottomHand.innerHTML='';if(current.type==='reversi')renderReversi();if(current.type==='chess')renderChess();if(current.type==='shogi')renderShogi();}"
assert old in s
s = s.replace(old, new, 1)

old = "function rPlay(r,c){if(current.over)return;const f=rFlips(r,c,current.turn);if(!f.length)return;saveState();current.board[r][c]=current.turn;f.forEach(([rr,cc])=>current.board[rr][cc]=current.turn);current.last=[r,c];current.turn=current.turn==='b'?'w':'b';current.passes=0;feedback();if(!rMoves(current.turn).length){current.passes++;current.turn=current.turn==='b'?'w':'b';if(!rMoves(current.turn).length){current.over=true;rFinish()}else toast('置ける場所がないためパス')}saveState();render()}"
new = "function rPlay(r,c){if(current.over)return;const placed=current.turn,f=rFlips(r,c,placed);if(!f.length)return;saveState();current.board[r][c]=placed;f.forEach(([rr,cc])=>current.board[rr][cc]=placed);current.last=[r,c];current.turn=placed==='b'?'w':'b';current.passes=0;feedback();if(!rMoves(current.turn).length){current.passes++;current.turn=current.turn==='b'?'w':'b';if(!rMoves(current.turn).length){current.over=true;rFinish()}else toast('置ける場所がないためパス')}saveState();updateReversi([[r,c],...f],[r,c])}"
assert old in s
s = s.replace(old, new, 1)

old = "function renderReversi(){const moves=new Set(rMoves(current.turn).map(x=>x.join(',')));let cells=[];for(let r=0;r<8;r++)for(let c=0;c<8;c++)cells.push([r,c]);if(rotated)cells.reverse();cells.forEach(([r,c])=>{const e=document.createElement('div');e.className='cell';if(current.last?.[0]===r&&current.last?.[1]===c)e.classList.add('last-move');if(current.board[r][c])e.innerHTML=`<span class=\"stone ${current.board[r][c]}\"></span>`;else if(moves.has(`${r},${c}`))e.innerHTML='<span class=\"hint-dot\"></span>';e.onclick=()=>rPlay(r,c);boardEl.appendChild(e)});let b=0,w=0;current.board.flat().forEach(x=>x==='b'?b++:x==='w'?w++:0);$('#turnBadge').textContent=current.turn==='b'?'● 黒の番':'○ 白の番';statusEl.textContent='光っているマスに置けます';scoreEl.innerHTML=`<span>黒 <strong>${b}</strong></span><span>白 <strong>${w}</strong></span>`}"
new = "function renderReversi(){reversiCells=Array.from({length:8},()=>Array(8));let cells=[];for(let r=0;r<8;r++)for(let c=0;c<8;c++)cells.push([r,c]);if(rotated)cells.reverse();cells.forEach(([r,c])=>{const e=document.createElement('div');e.className='cell';e.onclick=()=>rPlay(r,c);reversiCells[r][c]=e;const p=current.board[r][c];if(p){const stone=document.createElement('span');stone.className='stone '+p;stone.style.animation='none';e.appendChild(stone)}boardEl.appendChild(e)});updateReversi([],null)}\nfunction updateReversi(changed=[],placed=null){if(!reversiCells)return renderReversi();const changedSet=new Set(changed.map(x=>x.join(','))),moves=new Set(rMoves(current.turn).map(x=>x.join(',')));for(let r=0;r<8;r++)for(let c=0;c<8;c++){const e=reversiCells[r][c],p=current.board[r][c],key=`${r},${c}`;e.classList.toggle('last-move',current.last?.[0]===r&&current.last?.[1]===c);let stone=e.querySelector('.stone');if(p){e.querySelector('.hint-dot')?.remove();if(!stone){stone=document.createElement('span');stone.className='stone '+p;e.appendChild(stone)}else if(!stone.classList.contains(p)){stone.classList.remove('b','w');stone.classList.add(p);if(changedSet.has(key))stone.animate([{transform:'rotateY(0deg)'},{transform:'rotateY(90deg)'},{transform:'rotateY(0deg)'}],{duration:240,easing:'ease-in-out'})}if(placed&&placed[0]===r&&placed[1]===c)stone.animate([{transform:'scale(.25)',opacity:.2},{transform:'scale(1)',opacity:1}],{duration:180,easing:'ease-out'})}else{stone?.remove();let hint=e.querySelector('.hint-dot');if(moves.has(key)){if(!hint){hint=document.createElement('span');hint.className='hint-dot';e.appendChild(hint)}}else hint?.remove()}}let b=0,w=0;current.board.flat().forEach(x=>x==='b'?b++:x==='w'?w++:0);$('#turnBadge').textContent=current.turn==='b'?'● 黒の番':'○ 白の番';statusEl.textContent='光っているマスに置けます';scoreEl.innerHTML=`<span>黒 <strong>${b}</strong></span><span>白 <strong>${w}</strong></span>`}"
assert old in s
s = s.replace(old, new, 1)

p.write_text(s, encoding='utf-8')
print('patched app.js')
