#!/bin/bash
# Tạo tài nguyên mẫu để mở thử Remotion ngay sau khi cài, đồng thời chạy thử cả dây chuyền giọng:
# giọng đọc mẫu -> gỡ băng từng từ (whisper) -> dữ liệu phụ đề Remotion, kèm ảnh minh hoạ giả,
# video người nói giả, nhạc nền, SFX và icon. Chạy lại bao nhiêu lần cũng được.
#   bash work/tao_mau.sh
set -euo pipefail
GOC=$(cd "$(dirname "$0")/.." && pwd)
cd "$GOC/work"
FF=$(python3 -I -c 'import sys; sys.path.insert(0, "."); from cong_cu import FFMPEG; print(FFMPEG)')
D="$GOC/Output/mau"
P="$GOC/remotion-demo/public"
mkdir -p "$D/img" "$P"

TEXT="Xin chào, đây là video mẫu của bộ công cụ. Mỗi ý trên màn hình đều bám theo lời nói. Khi có số liệu, video hiện thêm dòng nguồn để người xem tự kiểm tra. Hãy thay giọng mẫu bằng giọng của bạn, rồi bắt đầu video đầu tiên."

# 1. Giọng mẫu: giọng tiếng Việt "Linh" có sẵn trên macOS
if say -v '?' 2>/dev/null | grep -q '^Linh '; then
  say -v Linh -o "$D/giong.aiff" "$TEXT"
else
  echo "Máy chưa có giọng tiếng Việt Linh: Cài đặt hệ thống > Trợ năng > Nội dung được đọc > Giọng hệ thống > Quản lý giọng > Tiếng Việt."
  echo "Tạm dùng giọng mặc định, phụ đề mẫu sẽ không khớp tiếng Việt."
  say -o "$D/giong.aiff" "$TEXT"
fi
"$FF" -v error -y -i "$D/giong.aiff" -ar 44100 -b:a 192k "$D/voice.mp3"

# 2. Gỡ băng từng từ, sửa chữ nghe sai, rồi xuất phụ đề sang Remotion
python3 -I chuan_bi_giong.py "$D/voice.mp3" "$D"
# Whisper hay nghe "giọng" thành "dòng": sửa trong corrections.json, đúng như cách làm với video thật.
python3 -I - "$D" <<'PY'
import json, sys
from pathlib import Path
d = Path(sys.argv[1]); w = json.loads((d / "words.json").read_text(encoding="utf-8"))
fix = {str(i): "giọng" for i, x in enumerate(w[:-1]) if x["w"].lower() == "dòng" and w[i + 1]["w"].lower().strip(",.") in ("mẫu", "của")}
(d / "corrections.json").write_text(json.dumps({"fix": fix, "merge": {}, "breaks": []}, ensure_ascii=False), encoding="utf-8")
print("corrections.json:", fix or "không cần sửa")
PY

# 3. Ba ảnh minh hoạ giả, thay cho ảnh Google Flow
mau=("0xF3E9DC:0xC9D8C5" "0xE8EEF7:0xF6DCCB" "0xF7F1E3:0xD7C9E8")
for i in 1 2 3; do
  IFS=: read -r c0 c1 <<<"${mau[$((i-1))]}"
  "$FF" -v error -y -f lavfi -i "gradients=s=1080x1920:c0=$c0:c1=$c1:seed=$i:d=1" -frames:v 1 -q:v 3 "$D/img/raw-s0$i.jpg"
done
(cd "$GOC" && python3 -I .claude/skills/video-flow-minh-hoa/scripts/flow_captions.py Output/mau mau)

# 4. Video "người nói" giả cho các mẫu dùng clip: nền be, một ô tròn ở vị trí khuôn mặt, tiếng là giọng mẫu
"$FF" -v error -y -f lavfi -i "color=c=0xD8CFC4:s=1080x1920:r=30" -i "$D/voice.mp3" \
  -vf "drawbox=x=380:y=600:w=320:h=320:color=0x9C8574:t=fill,drawbox=x=300:y=980:w=480:h=700:color=0x6F7F8C:t=fill" \
  -shortest -c:v libx264 -pix_fmt yuv420p -c:a aac "$P/mau-nguoi-noi.mp4"

# 5. Nhạc nền tạm, SFX, icon SVG
python3 -I make_bg_music.py
python3 -I tao_sfx.py
(cd "$GOC/remotion-demo" && node scripts/export-icons.mts)
echo "Đã tạo tài nguyên mẫu. Mở thử: cd remotion-demo && npx remotion studio --port 3123"
