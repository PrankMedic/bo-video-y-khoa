#!/bin/bash
# Cài và kiểm tra "Bộ video y khoa có nguồn" trên macOS. Chạy lại bao nhiêu lần cũng được.
#   bash cai-dat.sh             kiểm tra, hỏi trước khi cài phần thiếu, rồi tạo video mẫu
#   bash cai-dat.sh --kiem-tra  chỉ kiểm tra, không cài gì
#   bash cai-dat.sh --lien-ket  nối skill ra ~/.claude/skills để dùng ở mọi thư mục
#   bash cai-dat.sh --tu-dong   không hỏi: tự cài phần thiếu bằng Homebrew, tự tải model (dùng khi Claude Code cài hộ)
#   bash cai-dat.sh --model small|large   chọn model Whisper (mặc định theo RAM: từ 16 GB dùng large, ít hơn dùng small)
set -uo pipefail
GOC=$(cd "$(dirname "$0")" && pwd)
cd "$GOC"
CHI_KIEM=0; LIEN_KET=0; TU_DONG=0; MODEL=""
while [ $# -gt 0 ]; do
  case $1 in
    --kiem-tra) CHI_KIEM=1 ;;
    --lien-ket) LIEN_KET=1 ;;
    --tu-dong) TU_DONG=1 ;;
    --model) MODEL=${2:-}; shift ;;
    *) echo "Tham số không hợp lệ: $1"; exit 2 ;;
  esac
  shift
done

# Homebrew: chip Apple ở /opt/homebrew, Intel ở /usr/local
for p in /opt/homebrew/bin /usr/local/bin; do
  case ":$PATH:" in *":$p:"*) ;; *) [ -d "$p" ] && PATH="$p:$PATH" ;; esac
done
export PATH

if [ -t 1 ]; then XANH='\033[32m'; DO='\033[31m'; HET='\033[0m'; else XANH=''; DO=''; HET=''; fi
ok() { printf "  ${XANH}OK${HET}   %s\n" "$1"; }
thieu() { printf "  ${DO}THIẾU${HET} %s\n" "$1"; THIEU=$((THIEU + 1)); }
# Không có bàn phím (Claude Code chạy hộ) mà thiếu --tu-dong thì coi như trả lời "không".
hoi() {
  [ "$CHI_KIEM" = 1 ] && return 1
  [ "$TU_DONG" = 1 ] && { echo "  → $1 có (--tu-dong)"; return 0; }
  [ -t 0 ] || return 1
  read -r -p "  → $1 [c/k] " tl; [ "$tl" = "c" ] || [ "$tl" = "C" ]
}
THIEU=0

echo "1. Công cụ dòng lệnh"
if xcode-select -p >/dev/null 2>&1; then ok "Command Line Tools của Apple"; else
  thieu "CẦN_CLT: Command Line Tools của Apple (có git, python3). Đã mở hộp thoại cài: bấm Cài đặt, chờ xong rồi chạy lại."
  xcode-select --install >/dev/null 2>&1 || true
  exit 3
fi
if command -v brew >/dev/null; then ok "Homebrew"; else
  thieu "CẦN_HOMEBREW: tải file Homebrew-....pkg ở https://github.com/Homebrew/brew/releases/latest, bấm đúp để cài (cần mật khẩu máy), rồi chạy lại."
  [ "$TU_DONG" = 1 ] && open "https://github.com/Homebrew/brew/releases/latest" 2>/dev/null
  exit 3
fi
command -v python3 >/dev/null && ok "Python $(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')" || thieu "python3"

can_brew=()
if command -v node >/dev/null; then
  v=$(node -p 'process.versions.node')
  if node -e 'const [a,b]=process.versions.node.split(".").map(Number); process.exit(a>22||(a===22&&b>=18)?0:1)'; then ok "Node $v"; else thieu "Node $v cũ, cần 22.18+"; can_brew+=(node); fi
else thieu "Node"; can_brew+=(node); fi
command -v ffmpeg >/dev/null && ok "ffmpeg" || { thieu "ffmpeg"; can_brew+=(ffmpeg); }
command -v whisper-cli >/dev/null && ok "whisper-cli" || { thieu "whisper-cli"; can_brew+=(whisper-cpp); }
if [ ${#can_brew[@]} -gt 0 ] && command -v brew >/dev/null && hoi "Cài bằng Homebrew: ${can_brew[*]}?"; then
  for g in "${can_brew[@]}"; do
    if brew list "$g" >/dev/null 2>&1; then brew upgrade "$g"; else brew install "$g"; fi
  done
  # Đếm lại sau khi cài
  THIEU=0
  command -v brew >/dev/null || THIEU=$((THIEU + 1))
  command -v python3 >/dev/null || THIEU=$((THIEU + 1))
  for c in node ffmpeg whisper-cli; do command -v $c >/dev/null || { thieu "$c vẫn chưa có sau khi cài"; }; done
fi

echo "2. Model Whisper (~/whisper-models)"
if ls ~/whisper-models/ggml-*.bin >/dev/null 2>&1; then
  ok "$(ls ~/whisper-models/ggml-*.bin | head -1)"
else
  thieu "chưa có model"
  ram=$(( $(sysctl -n hw.memsize 2>/dev/null || echo 0) / 1073741824 ))
  [ -z "$MODEL" ] && { [ "$ram" -ge 16 ] && MODEL=large || MODEL=small; }
  ten=ggml-large-v3-turbo-q5_0.bin
  [ "$MODEL" = "small" ] && ten=ggml-small.bin
  echo "  RAM ${ram} GB, chọn model $MODEL"
  if hoi "Tải $ten (khoảng 0,5 GB)?"; then
    mkdir -p ~/whisper-models
    curl -L --fail -o ~/whisper-models/$ten.tmp "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/$ten" \
      && mv ~/whisper-models/$ten.tmp ~/whisper-models/$ten && ok "đã tải $ten"
  fi
fi
python3 -I work/cong_cu.py >/dev/null 2>&1 && ok "work/cong_cu.py tìm đủ công cụ" || thieu "work/cong_cu.py: chạy python3 work/cong_cu.py để xem thiếu gì"

echo "3. Giọng tiếng Việt Linh của macOS (cho video mẫu)"
say -v '?' 2>/dev/null | grep -q '^Linh ' && ok "Linh" || echo "  CHƯA CÓ Linh: Cài đặt hệ thống > Trợ năng > Nội dung được đọc > Giọng hệ thống > Quản lý giọng > Tiếng Việt (không bắt buộc)"

echo "4. Khoá API"
[ -f .env ] || { cp .env.example .env; echo "  Đã tạo .env từ .env.example"; }
grep -q '^PUBMED_API_KEY=.\+' .env && ok "PUBMED_API_KEY" || echo "  CHƯA ĐIỀN PUBMED_API_KEY trong .env (nên có, miễn phí)"
grep -q '^GEMINI_API_KEY=.\+' .env && ok "GEMINI_API_KEY" || echo "  Chưa điền GEMINI_API_KEY (tuỳ chọn)"
command -v codex >/dev/null && ok "Codex CLI" || echo "  Chưa có Codex CLI (tuỳ chọn): npm i -g @openai/codex && codex login"
command -v agy >/dev/null && ok "Antigravity CLI" || echo "  Chưa có Antigravity CLI (tuỳ chọn)"

echo "5. Thư viện Remotion"
if [ -d remotion-demo/node_modules/remotion ]; then ok "node_modules"; elif [ "$CHI_KIEM" = 0 ] && command -v npm >/dev/null; then
  (cd remotion-demo && npm ci --no-audit --no-fund) && ok "đã cài node_modules" || thieu "npm ci lỗi"
else thieu "chưa cài: cd remotion-demo && npm ci"; fi

# Model vừa tải thì cong_cu.py lúc nãy chưa thấy: kiểm tra lại trước khi kết luận
if [ "$THIEU" -gt 0 ] && python3 -I work/cong_cu.py >/dev/null 2>&1 && [ -d remotion-demo/node_modules/remotion ]; then THIEU=0; fi
if [ "$THIEU" -gt 0 ]; then
  echo; echo "Còn $THIEU mục thiếu. Xem HUONG-DAN-CAI-DAT.md, cài xong chạy lại bash cai-dat.sh."
  exit 1
fi

if [ "$CHI_KIEM" = 0 ]; then
  echo "6. Tạo video mẫu và chạy thử cả dây chuyền"
  mkdir -p Output/mau
  if bash work/tao_mau.sh > Output/mau/tao_mau.log 2>&1; then ok "tài nguyên mẫu (log: Output/mau/tao_mau.log)"
  else echo "  tao_mau.sh lỗi, 15 dòng cuối log:"; grep -v AVFFrameReceiver Output/mau/tao_mau.log | tail -15; exit 1; fi
  (cd remotion-demo && npx tsc --noEmit) && ok "TypeScript sạch lỗi" || { thieu "TypeScript"; exit 1; }
  (cd remotion-demo && npx remotion still MauFlow ../Output/mau/khung-thu.jpg --frame=120 --scale=0.5 --port 3411 >/dev/null 2>&1) \
    && ok "render thử một khung: Output/mau/khung-thu.jpg" || { thieu "render thử lỗi: cd remotion-demo && npx remotion still MauFlow /tmp/x.jpg --port 3411"; exit 1; }
fi

if [ "$LIEN_KET" = 1 ]; then
  echo "7. Nối skill ra ~/.claude/skills"
  mkdir -p ~/.claude/skills
  for d in .claude/skills/*/; do
    s=$(basename "$d")
    if [ -e ~/.claude/skills/$s ] && [ ! -L ~/.claude/skills/$s ]; then echo "  Bỏ qua $s: đã có thư mục thật cùng tên"; continue; fi
    ln -sfn "$GOC/.claude/skills/$s" ~/.claude/skills/$s && ok "$s"
  done
  echo "  Skill vẫn chạy script trong $GOC, đừng di chuyển thư mục này."
fi

echo; echo "XONG. Thư mục bộ công cụ: $GOC"
echo "Bước tiếp: mở thư mục này trong Claude Code và nói \"bắt đầu\" (skill bat-dau điền hồ sơ kênh, cho xem video mẫu)."
