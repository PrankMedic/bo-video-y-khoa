"""Chuẩn bị giọng từ video hoặc file ghi âm: tách âm thanh, gỡ băng từng từ, dò nói vấp.

Chạy từ work/: python3 chuan_bi_giong.py <nguồn> <thư mục dự án>
Kết quả trong thư mục dự án: goc.wav (48 kHz), words.json dạng [{"w","s","e"}], loi-noi.txt.
"""
import json
import subprocess
import sys
import tempfile
from pathlib import Path
sys.path.insert(0, __import__("os").path.dirname(__import__("os").path.abspath(__file__)))  # chạy được cả với python3 -I
from cong_cu import FFMPEG, WHISPER, MODEL



def main(source, project):
    p = Path(project)
    p.mkdir(parents=True, exist_ok=True)
    subprocess.run([FFMPEG, "-v", "error", "-y", "-i", source, "-vn", "-ar", "48000", "-ac", "1", str(p / "goc.wav")], check=True)
    with tempfile.TemporaryDirectory() as d:
        subprocess.run([FFMPEG, "-v", "error", "-y", "-i", str(p / "goc.wav"), "-ar", "16000", f"{d}/a.wav"], check=True)
        subprocess.run([WHISPER, "-m", MODEL, "-f", f"{d}/a.wav", "-l", "vi", "-ml", "1", "-sow", "-mc", "0", "-nf", "-oj", "-of", f"{d}/o", "-np"], check=True, capture_output=True)
        data = json.load(open(f"{d}/o.json"))
    words = [{"w": s["text"].strip(), "s": s["offsets"]["from"] / 1000, "e": s["offsets"]["to"] / 1000} for s in data["transcription"] if s["text"].strip()]
    json.dump(words, open(p / "words.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    tim = Path(__file__).resolve().parent / "tim_loi_noi.py"
    run = subprocess.run([sys.executable, "-I", str(tim), str(p / "goc.wav")], capture_output=True, text=True)
    if run.returncode:
        sys.exit(f"tim_loi_noi.py lỗi:\n{run.stderr[-800:]}")
    report = run.stdout
    (p / "loi-noi.txt").write_text(report, encoding="utf-8")
    print(p.name, len(words), "từ", words[-1]["e"] if words else 0, "giây")


if len(sys.argv) != 3:
    sys.exit(__doc__)
main(*sys.argv[1:])
