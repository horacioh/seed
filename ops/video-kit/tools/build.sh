#!/usr/bin/env bash
# Usage: ops/video-kit/tools/build.sh <tutorial-folder> [--lang en] [--format 16x9|9x16] [--preview] [--frame card|none|window]
# Renders 3840x2160@60 H.264 High + AAC 48 kHz (or 1080p with --preview; 2160x3840 with --format 9x16)
# into <folder>/out/, and writes <folder>/poster-<lang>[-9x16].png.
set -euo pipefail
KIT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO="$(cd "$KIT/../.." && pwd)"
FOLDER="${1:?tutorial folder required}"; shift
case "$FOLDER" in
  /*) ;;
  *)
    if [ -d "$FOLDER" ]; then
      FOLDER="$(cd "$FOLDER" && pwd)"
    elif [ -d "$REPO/$FOLDER" ]; then
      FOLDER="$REPO/$FOLDER"
    else
      echo "tutorial folder not found: $FOLDER" >&2
      exit 1
    fi
    ;;
esac
command -v ffmpeg >/dev/null || { echo "ffmpeg is required (brew install ffmpeg)"; exit 1; }
[ -d "$KIT/node_modules" ] || (cd "$KIT" && npm install)
exec node "$KIT/render/render.mjs" "$FOLDER" "$@"
