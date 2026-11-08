"""Cắt video theo các đoạn giữ trong cuts.json, giữ cả hình và tiếng, fade âm ngắn ở mỗi chỗ nối.

Chạy: python3 -I work/cat_clip.py <thư mục dự án>
cuts.json: {"source": "Raw/x/clip.mov", "keep": [[0.0, 12.4], [13.1, 40.0]], "removed": [{"from": 12.4, "to": 13.1, "why": "nói vấp"}]}
Đường dẫn source tính từ thư mục đang đứng. Kết quả: <dự án>/clip.mp4 (1080x1920 nếu nguồn dọc) và <dự án>/voice.mp3.
Sau đó gỡ băng lại clip.mp4 bằng chuan_bi_giong.py, không dùng mốc của file gốc.
"""
import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))  # chạy được cả với python3 -I
from cong_cu import FFMPEG, FFPROBE

FADE = 0.04


def duration(path):
    out = subprocess.run([FFPROBE, "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                         capture_output=True, text=True, check=True).stdout
    return float(out.strip())


def main(project):
    p = Path(project)
    cuts = json.loads((p / "cuts.json").read_text(encoding="utf-8"))
    src, keep = cuts["source"], cuts.get("keep") or []
    if not Path(src).is_file():
        sys.exit(f"cuts.json: không thấy file nguồn {src} (đường dẫn tính từ thư mục đang đứng)")
    total = duration(src)
    if not keep:
        sys.exit("cuts.json: danh sách keep trống")
    last = 0.0
    for a, b in keep:
        if not (0 <= a < b <= total + 0.05) or a < last:
            sys.exit(f"cuts.json: đoạn [{a}, {b}] sai (phải tăng dần, trong 0–{total:.2f}s)")
        if b - a < 3 * FADE:
            sys.exit(f"cuts.json: đoạn [{a}, {b}] quá ngắn")
        last = b
    parts = []
    for i, (a, b) in enumerate(keep):
        parts.append(f"[0:v]trim={a}:{b},setpts=PTS-STARTPTS[v{i}]")
        parts.append(f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d={FADE},"
                     f"afade=t=out:st={b - a - FADE:.3f}:d={FADE}[a{i}]")
    labels = "".join(f"[v{i}][a{i}]" for i in range(len(keep)))
    graph = ";".join(parts) + f";{labels}concat=n={len(keep)}:v=1:a=1[v][a]"
    out = p / "clip.mp4"
    subprocess.run([FFMPEG, "-v", "error", "-y", "-i", src, "-filter_complex", graph, "-map", "[v]", "-map", "[a]",
                    "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", "-r", "30", "-c:a", "aac", "-b:a", "192k",
                    str(out)], check=True)
    subprocess.run([FFMPEG, "-v", "error", "-y", "-i", str(out), "-vn", "-b:a", "192k", str(p / "voice.mp3")], check=True)
    print(f"{out}: {len(keep)} đoạn, {sum(b - a for a, b in keep):.2f}s")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
