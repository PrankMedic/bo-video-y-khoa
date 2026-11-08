#!/bin/zsh
# Hand a brief to another agent with a time limit; both hung for hours when left unbounded.
# Usage: giao.sh codex|agy BRIEF.md [minutes] [tiep]   (run from the kit root; log goes next to the brief)
# "tiep" (agy only) continues the latest conversation for a follow-up brief on the same task.
set -uo pipefail

(( $# >= 2 )) || { print -u2 "Cách dùng: giao.sh codex|agy BRIEF.md [phút]"; exit 2 }

agent=$1
brief=$2
minutes=${3:-8}
log=${brief:r}.$agent.log
prompt="Doc va lam theo file $brief. Neu co AGENTS.md o thu muc goc thi tuan theo."

# Codex may ship inside the ChatGPT app and not be on PATH.
codex_bin=${CODEX_BIN:-$(command -v codex || print /Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex)}
agy_bin=${AGY_BIN:-$(command -v agy || print $HOME/.local/bin/agy)}

case $agent in
  codex)
    [[ -x $codex_bin ]] || { print -u2 "Không thấy Codex CLI. Cài: npm i -g @openai/codex rồi chạy codex login (hoặc đặt CODEX_BIN)."; exit 2 }
    cmd=("$codex_bin" exec --skip-git-repo-check --sandbox workspace-write "$prompt") ;;
  agy)
    # API key for this process only, read from .env without printing it.
    repo=${0:A:h}/../../../..
    key=${GEMINI_API_KEY:-$(sed -n 's/^GEMINI_API_KEY=//p' "$repo/.env" "$repo/../.env" 2>/dev/null | head -1 | tr -d "\"'")}
    [[ -n $key ]] || { print -u2 "Chưa có GEMINI_API_KEY trong .env."; exit 2 }
    export GEMINI_API_KEY=$key
    # Runs inside the brief's folder so its read-only commands cannot reach .env at the repo root.
    log=${brief:A:r}.agy.log
    cd "${brief:h}" || exit 2
    # modelProvider is set per session so agy can never fall back to the Google login.
    agy_settings='{"modelProvider":"gemini","permissions":{"allow":["command(ls)","command(pwd)","command(ls *)","command(cat *)","command(find *)","command(grep *)","command(head *)","command(sed -n *)","command(wc *)"]}}'
    [[ -x $agy_bin ]] || { print -u2 "Không thấy Antigravity CLI (agy). Cài theo hướng dẫn của Antigravity hoặc đặt AGY_BIN."; exit 2 }
    cmd=("$agy_bin" -p "Doc va lam theo file ${brief:t}." --mode plan --print-timeout "${minutes}m" --output-format json --settings "$agy_settings")
    [[ ${4:-} == tiep ]] && cmd+=(--continue)
    # agy is only meant to read; anything newer than this marker gets reported after the run.
    brief_dir=$PWD
    marker=$(mktemp)
    trap 'rm -f "$marker"' EXIT ;;
  *) print -u2 "Tác nhân không hợp lệ: $agent"; exit 2 ;;
esac

# agy sometimes asks for a command headless mode must deny and exits 0 with no answer, so it gets three tries.
for attempt in 1 2 3; do
  "${cmd[@]}" </dev/null >"$log" 2>&1 &
  pid=$!
  n=0
  while kill -0 $pid 2>/dev/null && (( n < minutes * 10 )); do
    /bin/sleep 6
    n=$((n + 1))
  done
  if kill -0 $pid 2>/dev/null; then
    kill $pid
    print -u2 "Quá $minutes phút, đã dừng. Log: $log"
    exit 124
  fi
  wait $pid
  code=$?
  # agy 1.5 đôi khi in rỗng ở chế độ text dù đã trả lời; chế độ json luôn có trường response.
  # Chỉ giữ câu trả lời trong log; không có thì ghi dấu "no output produced" để thử lại.
  if [[ $agent == agy ]]; then
    /usr/bin/python3 -I - "$log" <<'PY'
import json, sys
p = sys.argv[1]
raw = open(p, encoding="utf-8", errors="ignore").read()
i = raw.find("{")
try:
    d = json.JSONDecoder().raw_decode(raw[i:])[0] if i >= 0 else {}
except ValueError:
    d = {}
r = (d.get("response") or "").strip() if isinstance(d, dict) else ""
open(p, "w", encoding="utf-8").write(r + "\n" if r else raw + "\nno output produced\n")
PY
  fi
  grep -q 'no output produced' "$log" || break
  print -u2 "$agent không trả lời, lần $attempt."
done
if grep -q 'no output produced' "$log"; then
  print -u2 "$agent không trả lời sau 3 lần. Log: $log"
  exit 3
fi
if [[ $agent == agy ]]; then
  changed=$(
    find "$brief_dir" -type f -newer "$marker" ! -name '*.agy.log'
    git -C "$repo" ls-files -m -o --exclude-standard | while IFS= read -r f; do
      [[ "$repo/$f" -nt "$marker" ]] && print -r -- "$f"
    done
  )
  if [[ -n $changed ]]; then
    print -u2 "File đổi trong lúc agy chạy (do agy hoặc phiên khác), kiểm tra trước khi dùng kết quả:"
    print -u2 -r -- "$changed"
    print "$agent xong, mã $code, có file đổi. Log: $log"
    exit 4
  fi
fi
print "$agent xong, mã $code. Log: $log"
exit $code
