#!/usr/bin/env bash
set -euo pipefail

mkdir -p assets/audio/shogi assets/audio/mancala assets/audio/ohajiki
BASE='https://raw.githubusercontent.com/lavenderdotpet/CC0-Public-Domain-Sounds/main/100-cc0-sfx-2'

curl -fsSL "$BASE/sfx100v2_wood_hit_01.ogg" -o assets/audio/shogi/shogi_hit_01.ogg
curl -fsSL "$BASE/sfx100v2_wood_hit_02.ogg" -o assets/audio/shogi/shogi_hit_02.ogg
curl -fsSL "$BASE/sfx100v2_wood_hit_03.ogg" -o assets/audio/shogi/shogi_hit_03.ogg

curl -fsSL "$BASE/sfx100v2_stones_01.ogg" -o assets/audio/mancala/stone_01.ogg
curl -fsSL "$BASE/sfx100v2_stones_02.ogg" -o assets/audio/mancala/stone_02.ogg
curl -fsSL "$BASE/sfx100v2_stones_03.ogg" -o assets/audio/mancala/stone_03.ogg

for n in 01 02 03 04 05 06; do
  curl -fsSL "$BASE/sfx100v2_glass_${n}.ogg" -o "assets/audio/ohajiki/glass_${n}.ogg"
done

python3 - <<'PY'
from pathlib import Path
p=Path('app.js')
s=p.read_text()
needle="const buzz=()=>navigator.vibrate?.(12); const feedback=()=>{audio();buzz()};"
replacement="""const buzz=()=>navigator.vibrate?.(12); const feedback=()=>{audio();buzz()};
const shogiSounds=['assets/audio/shogi/shogi_hit_01.ogg','assets/audio/shogi/shogi_hit_02.ogg','assets/audio/shogi/shogi_hit_03.ogg'];
function playBoardSample(files,volume=.72){if(!sound)return;try{const a=new Audio(files[Math.floor(Math.random()*files.length)]);a.volume=volume;a.playbackRate=.97+Math.random()*.06;a.play().catch(()=>{})}catch{}}
function shogiFeedback(){playBoardSample(shogiSounds,.76);buzz()}"""
if needle in s and 'const shogiSounds=' not in s:
    s=s.replace(needle,replacement,1)
start=s.find('function sTap(')
end=s.find('function renderShogi()',start)
if start!=-1 and end!=-1:
    section=s[start:end].replace('feedback();','shogiFeedback();')
    s=s[:start]+section+s[end:]
p.write_text(s)

p=Path('sw.js')
s=p.read_text()
assets=[
'assets/audio/shogi/shogi_hit_01.ogg','assets/audio/shogi/shogi_hit_02.ogg','assets/audio/shogi/shogi_hit_03.ogg',
'assets/audio/mancala/stone_01.ogg','assets/audio/mancala/stone_02.ogg','assets/audio/mancala/stone_03.ogg',
*['assets/audio/ohajiki/glass_%02d.ogg'%i for i in range(1,7)]
]
if 'shogi_hit_01.ogg' not in s:
    old="'manifest.webmanifest'"
    new=old+','+','.join(repr(x) for x in assets)
    s=s.replace(old,new,1)
p.write_text(s)
PY

cat > assets/audio/README.md <<'EOF'
# Board sound assets

These files are bundled locally; the game does not fetch them from the source at runtime.

Source: rubberduck / 100 CC0 SFX #2
License: CC0 / Public Domain dedication
Mirror used for reproducible download: lavenderdotpet/CC0-Public-Domain-Sounds

- shogi/: wood-hit samples used for wooden piece placement
- mancala/: stone samples reserved for stone-by-stone sowing
- ohajiki/: glass samples reserved for collision-speed-based marble impacts

The shogi implementation randomizes among three samples and applies a very small playback-rate variation to reduce repetition.
EOF
