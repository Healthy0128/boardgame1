#!/usr/bin/env bash
set -euo pipefail

mkdir -p assets/audio/bgm assets/audio/chess assets/audio/reversi

# CC0 BGM from OpenGameArt. Downloaded once into the repo; runtime uses local files only.
curl -fsSL 'https://opengameart.org/sites/default/files/menu_1.mp3' -o assets/audio/bgm/shogi_dojo.mp3
curl -fsSL 'https://opengameart.org/sites/default/files/jazz_improv_looped_2.mp3' -o assets/audio/bgm/chess_jazz.mp3
curl -fsSL 'https://opengameart.org/sites/default/files/simple_loop.ogg' -o assets/audio/bgm/reversi_calm.ogg
curl -fsSL 'https://opengameart.org/sites/default/files/Krakatoa_0.ogg' -o assets/audio/bgm/mancala_percussion.ogg
curl -fsSL 'https://opengameart.org/sites/default/files/menumusicloop-tiggo.ogg' -o assets/audio/bgm/ohajiki_nostalgic.ogg
curl -fsSL 'https://opengameart.org/sites/default/files/funkymenuloop_0.mp3' -o assets/audio/bgm/playful_board.mp3
curl -fsSL 'https://opengameart.org/sites/default/files/overworld.mp3' -o assets/audio/bgm/gomoku_calm.mp3

BASE='https://raw.githubusercontent.com/lavenderdotpet/CC0-Public-Domain-Sounds/main/100-cc0-sfx-2'
for n in 01 02 03; do
  curl -fsSL "$BASE/sfx100v2_wood_${n}.ogg" -o "assets/audio/chess/chess_move_${n}.ogg"
  curl -fsSL "$BASE/sfx100v2_stones_${n}.ogg" -o "assets/audio/reversi/disc_${n}.ogg"
done

python3 - <<'PY'
from pathlib import Path
p=Path('app.js')
s=p.read_text()
anchor="const shogiSounds=['assets/audio/shogi/shogi_hit_01.ogg','assets/audio/shogi/shogi_hit_02.ogg','assets/audio/shogi/shogi_hit_03.ogg'];"
addition="""const shogiSounds=['assets/audio/shogi/shogi_hit_01.ogg','assets/audio/shogi/shogi_hit_02.ogg','assets/audio/shogi/shogi_hit_03.ogg'];
const chessSounds=['assets/audio/chess/chess_move_01.ogg','assets/audio/chess/chess_move_02.ogg','assets/audio/chess/chess_move_03.ogg'];
const reversiSounds=['assets/audio/reversi/disc_01.ogg','assets/audio/reversi/disc_02.ogg','assets/audio/reversi/disc_03.ogg'];
const bgmTracks={
  shogi:'assets/audio/bgm/shogi_dojo.mp3',
  chess:'assets/audio/bgm/chess_jazz.mp3',
  reversi:'assets/audio/bgm/reversi_calm.ogg',
  mancala:'assets/audio/bgm/mancala_percussion.ogg',
  ohajiki:'assets/audio/bgm/ohajiki_nostalgic.ogg',
  connect4:'assets/audio/bgm/playful_board.mp3',
  sugoroku:'assets/audio/bgm/playful_board.mp3',
  gomoku:'assets/audio/bgm/gomoku_calm.mp3'
};
let currentBgm=null,currentBgmGame=null;
function stopBgm(){if(currentBgm){try{currentBgm.pause();currentBgm.currentTime=0}catch{}}currentBgm=null;currentBgmGame=null}
function playBgm(game){if(!sound||!bgmTracks[game])return;if(currentBgm&&currentBgmGame===game){currentBgm.play().catch(()=>{});return}stopBgm();try{const a=new Audio(bgmTracks[game]);a.loop=true;a.volume=.18;currentBgm=a;currentBgmGame=game;a.play().catch(()=>{})}catch{}}
function gameFeedback(files,volume=.68){playBoardSample(files,volume);buzz()}"""
if anchor in s and 'const bgmTracks=' not in s:
    s=s.replace(anchor,addition,1)
old="function start(game){rotated=false; history=[]; if(game==='reversi')initReversi();if(game==='chess')initChess();if(game==='shogi')initShogi();saveState();showScreen(true);render();}"
new="function start(game){rotated=false; history=[]; if(game==='reversi')initReversi();if(game==='chess')initChess();if(game==='shogi')initShogi();saveState();showScreen(true);render();playBgm(game);}"
if old in s:s=s.replace(old,new,1)
s=s.replace('current.passes=0;feedback();if(!rMoves(current.turn).length)',"current.passes=0;gameFeedback(reversiSounds,.62);if(!rMoves(current.turn).length)",1)
start=s.find('function cTap(');end=s.find('function choosePromotion()',start)
if start!=-1 and end!=-1:
    section=s[start:end].replace('feedback();','gameFeedback(chessSounds,.58);')
    s=s[:start]+section+s[end:]
old="function goHome(){current=null;history=[];showScreen(false)}";new="function goHome(){stopBgm();current=null;history=[];showScreen(false)}"
if old in s:s=s.replace(old,new,1)
old="$('#soundBtn').onclick=()=>{sound=!sound;$('#soundBtn').textContent=sound?'♪':'×';toast(sound?'サウンド ON':'サウンド OFF')}"
new="$('#soundBtn').onclick=()=>{sound=!sound;$('#soundBtn').textContent=sound?'♪':'×';if(!sound){currentBgm?.pause()}else if(current){playBgm(current.type)}toast(sound?'サウンド ON':'サウンド OFF')}"
if old in s:s=s.replace(old,new,1)
p.write_text(s)

p=Path('sw.js');s=p.read_text();assets=['assets/audio/bgm/shogi_dojo.mp3','assets/audio/bgm/chess_jazz.mp3','assets/audio/bgm/reversi_calm.ogg','assets/audio/bgm/mancala_percussion.ogg','assets/audio/bgm/ohajiki_nostalgic.ogg','assets/audio/bgm/playful_board.mp3','assets/audio/bgm/gomoku_calm.mp3',*['assets/audio/chess/chess_move_%02d.ogg'%i for i in range(1,4)],*['assets/audio/reversi/disc_%02d.ogg'%i for i in range(1,4)]]
if 'shogi_dojo.mp3' not in s:
    old="'manifest.webmanifest'";s=s.replace(old,old+','+','.join(repr(x) for x in assets),1)
p.write_text(s)
PY

cat > assets/audio/MUSIC-LICENSES.md <<'EOF'
# Music and sound sources

All music below is bundled locally and released as CC0 / Public Domain on OpenGameArt.

- Shogi: “Menu Music” by wipics — https://opengameart.org/content/menu-music-2
- Chess: “jazz improvisation looped” by Alex McCulloch / Pro Sensory — https://opengameart.org/content/jazz-improvisation-looped
- Reversi: “Simple menu/background music loop” by polosik — https://opengameart.org/content/simple-menubackground-music-loop
- Mancala: “Krakatoa” by Kistol — https://opengameart.org/content/krakatoa
- Ohajiki: “Two Simple Game Music Loops” by qubodup — https://opengameart.org/content/two-simple-game-music-loops
- Connect 4 / Sugoroku: “Funky Menu Loop” by iamoneabe — https://opengameart.org/content/funky-menu-loop
- Gomoku: “Overworld (BGM)” by Another Page Studio / IntelligentGene — https://opengameart.org/content/overworld-bgm

Physical SFX use the CC0 `100 CC0 SFX #2` collection mirrored at `lavenderdotpet/CC0-Public-Domain-Sounds`.
Runtime never fetches source URLs; the game uses only committed files under `assets/audio/`.
EOF

# Trigger marker: per-game audio bundle v1
