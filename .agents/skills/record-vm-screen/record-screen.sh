#!/usr/bin/env bash
#
# record-screen.sh — record the machine's screen to an mp4 with ffmpeg (X11).
#
# Generic screen recorder for any GUI/app you're developing that renders on the
# X display. Decoupled start/stop so you can: start -> run/drive the app -> stop.
#
# Usage:
#   record-screen.sh start [output.mp4]   # begin recording (returns immediately)
#   record-screen.sh stop                 # finish recording; writes a valid mp4
#   record-screen.sh status               # is a recording in progress?
#
# Env overrides:
#   DISPLAY  X display to capture (default :0)
#   FPS      frames per second     (default 25)
#   WINDOW   if "1", capture only the active window instead of the whole screen
#   OUTDIR   default output dir when no path is given (default: $PWD)
#
# Notes:
# - `stop` sends SIGINT and WAITS for ffmpeg to flush the mp4 trailer. Never
#   `kill -9` the recorder — that leaves a headerless, unplayable file.
# - Requires: ffmpeg (with x11grab), xdpyinfo. Window mode also needs xdotool.
set -euo pipefail

DISPLAY_ID="${DISPLAY:-:0}"
FPS="${FPS:-25}"
STATE_DIR="${TMPDIR:-/tmp}/vm-screen-rec"
PIDFILE="$STATE_DIR/pid"
OUTFILE="$STATE_DIR/output"

usage() { sed -n '2,25p' "$0"; exit "${1:-0}"; }

cmd_start() {
  mkdir -p "$STATE_DIR"
  if [[ -f "$PIDFILE" ]] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
    echo "Already recording (pid $(cat "$PIDFILE")) -> $(cat "$OUTFILE")" >&2
    exit 1
  fi

  local out="${1:-${OUTDIR:-$PWD}/screen-$(date +%Y%m%d-%H%M%S).mp4}"

  local size input
  if [[ "${WINDOW:-0}" == "1" ]]; then
    eval "$(DISPLAY="$DISPLAY_ID" xdotool getactivewindow getwindowgeometry --shell)"
    size="${WIDTH}x${HEIGHT}"
    input="${DISPLAY_ID}+${X},${Y}"
  else
    local xinfo; xinfo="$(DISPLAY="$DISPLAY_ID" xdpyinfo)"
    size="$(awk '/dimensions:/{print $2; exit}' <<<"$xinfo")"
    input="${DISPLAY_ID}"
  fi
  # libx264 needs even dimensions.
  local w="${size%x*}" h="${size#*x}"
  size="$(( w - w % 2 ))x$(( h - h % 2 ))"

  # nohup + setsid so the recorder outlives this invocation and its own group,
  # letting `stop` deliver SIGINT precisely to ffmpeg.
  setsid nohup ffmpeg -y -hide_banner -loglevel warning \
    -f x11grab -framerate "$FPS" -video_size "$size" -i "$input" \
    -codec:v libx264 -preset veryfast -pix_fmt yuv420p "$out" \
    >"$STATE_DIR/ffmpeg.log" 2>&1 &

  local pid=$!
  echo "$pid" >"$PIDFILE"
  echo "$out"  >"$OUTFILE"
  echo "Recording $input ($size @ ${FPS}fps), pid $pid -> $out"
  echo "Stop with: $0 stop"
}

cmd_stop() {
  if [[ ! -f "$PIDFILE" ]]; then echo "No recording in progress." >&2; exit 1; fi
  local pid out; pid="$(cat "$PIDFILE")"; out="$(cat "$OUTFILE")"

  if kill -0 "$pid" 2>/dev/null; then
    kill -INT "$pid"                    # ask ffmpeg to stop and write the trailer
    for _ in $(seq 1 30); do            # wait up to ~15s for a clean exit
      kill -0 "$pid" 2>/dev/null || break
      sleep 0.5
    done
    if kill -0 "$pid" 2>/dev/null; then
      echo "ffmpeg did not exit after SIGINT; log:" >&2
      tail -n 20 "$STATE_DIR/ffmpeg.log" >&2 || true
      exit 1
    fi
  fi
  rm -f "$PIDFILE" "$OUTFILE"
  echo "Saved recording: $out"
}

cmd_status() {
  if [[ -f "$PIDFILE" ]] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
    echo "recording (pid $(cat "$PIDFILE")) -> $(cat "$OUTFILE")"
  else
    echo "idle"
  fi
}

case "${1:-}" in
  start)  shift; cmd_start "$@";;
  stop)   cmd_stop;;
  status) cmd_status;;
  -h|--help|"") usage 0;;
  *) echo "unknown command: $1" >&2; usage 1;;
esac
