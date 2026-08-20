#!/usr/bin/env bash
set -euo pipefail
mkdir -p assets/chess assets/shogi
base="https://sashite.dev/assets/chess/sides"
curl -fsSL "$base/first/representations/western/king.svg" -o assets/chess/white_king.svg
curl -fsSL "$base/first/representations/western/queen.svg" -o assets/chess/white_queen.svg
curl -fsSL "$base/first/representations/western/rook.svg" -o assets/chess/white_rook.svg
curl -fsSL "$base/first/representations/western/bishop.svg" -o assets/chess/white_bishop.svg
curl -fsSL "$base/first/representations/western/knight.svg" -o assets/chess/white_knight.svg
curl -fsSL "$base/first/representations/western/pawn.svg" -o assets/chess/white_pawn.svg
curl -fsSL "$base/second/representations/western/king.svg" -o assets/chess/black_king.svg
curl -fsSL "$base/second/representations/western/queen.svg" -o assets/chess/black_queen.svg
curl -fsSL "$base/second/representations/western/rook.svg" -o assets/chess/black_rook.svg
curl -fsSL "$base/second/representations/western/bishop.svg" -o assets/chess/black_bishop.svg
curl -fsSL "$base/second/representations/western/knight.svg" -o assets/chess/black_knight.svg
curl -fsSL "$base/second/representations/western/pawn.svg" -o assets/chess/black_pawn.svg
sbase="https://raw.githubusercontent.com/sunfish-shogi/shogi-images/main/docs"
curl -fsSL "$sbase/board/light_458x500.png" -o assets/shogi/board.png
for side in black white; do
  for name in king rook bishop gold silver knight lance pawn dragon horse prom_silver prom_knight prom_lance prom_pawn; do
    curl -fsSL "$sbase/hitomoji_wood/${side}_${name}.png" -o "assets/shogi/${side}_${name}.png"
  done
done
