"""Tìm chỗ nói vấp, lặp câu, ngập ngừng trực tiếp từ âm thanh, không dựa vào phụ đề đã làm gọn.

Chạy từ work/: python3 tim_loi_noi.py <file audio hoặc video>
Whisper chạy trên từng đoạn ngắn có chồng lấn để không gộp mất câu lặp. In các cụm 3–5 từ bị lặp trong vòng
8 giây và các khoảng im trên 0,7 giây. Luôn chạy trước khi chọn điểm cắt.
"""
import json
import re
import subprocess
import sys
import tempfile
import unicodedata
from pathlib import Path
sys.path.insert(0, __import__("os").path.dirname(__import__("os").path.abspath(__file__)))  # chạy được cả với python3 -I
from cong_cu import FFMPEG, FFPROBE, WHISPER, MODEL

CHUNK, STEP = 9.0, 3.0


def norm(text):
    return re.sub(r"[^\w]", "", unicodedata.normalize("NFC", text.lower()))


def words_in(source, start):
    with tempfile.TemporaryDirectory() as d:
        subprocess.run([FFMPEG, "-v", "error", "-y", "-ss", str(start), "-t", str(CHUNK), "-i", source, "-ar", "16000", "-ac", "1", f"{d}/a.wav"], check=True)
        subprocess.run([WHISPER, "-m", MODEL, "-f", f"{d}/a.wav", "-l", "vi", "-ml", "1", "-sow", "-mc", "0", "-nf", "-oj", "-of", f"{d}/o", "-np"], check=True, capture_output=True)
        data = json.load(open(f"{d}/o.json"))
    return [(start + seg["offsets"]["from"] / 1000, seg["text"].strip()) for seg in data["transcription"] if norm(seg["text"])]


def repeats(words):
    keys = [norm(w) for _, w in words]
    keys_all = keys
    for i in range(len(keys_all) - 1):
        if keys_all[i] == keys_all[i + 1] and len(keys_all[i]) > 3:
            yield words[i][0], words[i + 1][0], words[i][1]
    for size in range(5, 2, -1):
        for i in range(len(keys) - size):
            for j in range(i + size, min(i + 3 * size + 4, len(keys) - size + 1)):
                if keys[i:i + size] == keys[j:j + size] and words[j][0] - words[i][0] < 8:
                    yield words[i][0], words[j][0], " ".join(w for _, w in words[i:i + size])


def main(source):
    length = float(subprocess.check_output([FFPROBE, "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", source]))
    found = []
    start = 0.0
    # Mỗi đoạn xét riêng: gộp các đoạn lại sẽ làm mất câu lặp vì mốc thời gian chồng lên nhau
    while start < length:
        for first, again, text in repeats(words_in(source, start)):
            if not any(abs(first - a) < 1 and abs(again - b) < 1 for a, b, _ in found):
                found.append((first, again, text))
        start += STEP
    for first, again, text in sorted(found):
        print(f"LẶP {first:6.2f}s → {again:6.2f}s: {text}")
    log = subprocess.run([FFMPEG, "-hide_banner", "-i", source, "-af", "silencedetect=n=-32dB:d=0.7", "-f", "null", "-"], capture_output=True, text=True).stderr
    for a, b in re.findall(r"silence_start: ([\d.]+).*?silence_end: ([\d.]+)", log, re.S):
        print(f"IM  {float(a):6.2f}s → {float(b):6.2f}s")
    print("Không thấy gì vẫn phải nghe lại chỗ nối." if not found else f"{len(found)} chỗ lặp.")


main(sys.argv[1])
