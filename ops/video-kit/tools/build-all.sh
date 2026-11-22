#!/usr/bin/env bash
# Usage: ops/video-kit/tools/build-all.sh <tutorial-folder> [--preview] [--langs "en es"] [--formats "16x9 9x16"] [--no-capture]
# Captures every language x format (run.mjs, one at a time), then renders each one
# with build.sh. Languages default to every captions.<lang>.json in the folder; formats default to 16x9 and 9x16.
# --no-capture re-renders from the existing shots (e.g. after a kit change).
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KIT="$(dirname "$HERE")"
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
[ -d "$FOLDER" ] || { echo "no such tutorial folder: $FOLDER"; exit 1; }
NAME="$(basename "$FOLDER")"

PREVIEW=() LANGS="" FORMATS="16x9 9x16" CAPTURE=1
while [ $# -gt 0 ]; do
  case "$1" in
    --preview) PREVIEW=(--preview) ;;
    --langs) LANGS="${2:?--langs needs a value}"; shift ;;
    --formats) FORMATS="${2:?--formats needs a value}"; shift ;;
    --no-capture) CAPTURE=0 ;;
    *) echo "unknown option: $1"; exit 1 ;;
  esac
  shift
done
if [ -z "$LANGS" ]; then
  for f in "$FOLDER"/captions.*.json; do [ -e "$f" ] && { l="${f##*/captions.}"; LANGS="$LANGS ${l%.json}"; }; done
fi
[ -n "${LANGS// }" ] || { echo "no captions.<lang>.json in $FOLDER"; exit 1; }
for fmt in $FORMATS; do case "$fmt" in 16x9|9x16) ;; *) echo "unknown format: $fmt (use 16x9 or 9x16)"; exit 1 ;; esac; done

cd "$REPO"
if [ "$CAPTURE" = 1 ]; then
  for lang in $LANGS; do for fmt in $FORMATS; do
    echo "== capture $NAME $lang $fmt"
    if [ "$fmt" = 9x16 ]; then node "$KIT/capture/run.mjs" "$FOLDER" --lang "$lang" --format 9x16
    else node "$KIT/capture/run.mjs" "$FOLDER" --lang "$lang"; fi
  done; done
fi
for lang in $LANGS; do for fmt in $FORMATS; do
  echo "== render $NAME $lang $fmt"
  bash "$HERE/build.sh" "$FOLDER" --lang "$lang" --format "$fmt" ${PREVIEW[@]+"${PREVIEW[@]}"}
done; done

echo "== outputs"
for f in "$FOLDER"/out/*.mp4; do
  [ -e "$f" ] || continue
  d="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f" 2>/dev/null || true)"
  printf '%s  %ss\n' "${f#"$REPO"/}" "${d%.*}"
done
