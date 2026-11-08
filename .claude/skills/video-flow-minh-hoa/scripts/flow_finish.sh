#!/bin/zsh
# Two-pass loudness normalization to -14 LUFS; the video stream is copied untouched.
# Usage: flow_finish.sh in.mp4 out.mp4
set -euo pipefail
export PATH=/opt/homebrew/opt/ffmpeg-full/bin:/opt/homebrew/bin:/usr/local/opt/ffmpeg-full/bin:/usr/local/bin:$PATH

in=$1
out=$2
target="I=-14:TP=-1.5:LRA=11"
stats=$(ffmpeg -hide_banner -nostats -i "$in" -af "loudnorm=$target:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { print -r -- "$stats" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i "$in" -c:v copy \
  -af "loudnorm=$target:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true" \
  -ar 48000 -c:a aac -b:a 192k "$out"
ffmpeg -hide_banner -nostats -i "$out" -af ebur128=peak=true:framelog=quiet -f null - 2>&1 | grep -E " I:|Peak:" | tail -2
