#!/usr/bin/env bash
set -euo pipefail
KIT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FONT_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/fonts/seed-video-kit"
FONTCONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/fontconfig/conf.d"
mkdir -p "$FONT_DIR" "$FONTCONFIG_DIR"
cp "$KIT"/fonts/Inter-*.ttf "$FONT_DIR/"
cp "$KIT/fonts/99-inter.conf" "$FONTCONFIG_DIR/99-inter.conf"
fc-cache -f "$FONT_DIR"
fc-match system-ui
fc-match sans-serif
