#!/usr/bin/env bash
set -euo pipefail
mkdir -p assets/board

# CC0 wood texture: Fupi / OpenGameArt Wooden Planks
curl -fsSL 'https://opengameart.org/sites/default/files/brownwoodenplanks_0.png' -o assets/board/wood.png

# CC0 rendered Go stones: zpmorgan / gostones-render (same source linked by OpenGameArt)
curl -fsSL 'https://raw.githubusercontent.com/zpmorgan/gostones-render/master/b.png' -o assets/board/go_black.png
curl -fsSL 'https://raw.githubusercontent.com/zpmorgan/gostones-render/master/w1.png' -o assets/board/go_white.png

cat > assets/board/README.md <<'EOF'
# Rich board visuals

Bundled locally; no runtime external asset requests.

- `wood.png`: Fupi, “Wooden Planks”, OpenGameArt — CC0.
  Source page: https://opengameart.org/content/wooden-planks-0
- `go_black.png`, `go_white.png`: zpmorgan, “Go stones” / gostones-render — CC0.
  Source page: https://opengameart.org/content/go-stones
  Source repository: https://github.com/zpmorgan/gostones-render

These assets are used as material/stone layers while the game UI remains responsive HTML/CSS.
EOF
