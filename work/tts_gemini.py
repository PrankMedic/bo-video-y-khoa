"""Đọc một file text thành giọng nói bằng Gemini TTS, rồi lấy mốc từng từ bằng Whisper, giữ nguyên chữ của file text.

Chạy từ work/: python3 tts_gemini.py <file.txt> <thư mục ra> [giọng] [model]
Kết quả: voice.wav, words.json dạng [{"text", "startMs", "endMs"}]. Khoá lấy từ ../.env, không in ra.
"""
import base64
import difflib
import json
import os
import re
import subprocess
import sys
import unicodedata
import urllib.request
import wave
from pathlib import Path
sys.path.insert(0, __import__("os").path.dirname(__import__("os").path.abspath(__file__)))  # chạy được cả với python3 -I
from cong_cu import FFMPEG, WHISPER, MODEL



def api_key():
    if os.environ.get("GEMINI_API_KEY"):
        return os.environ["GEMINI_API_KEY"]
    env = Path(__file__).resolve().parent.parent / ".env"
    if env.exists():
        for line in env.read_text(encoding="utf-8").splitlines():
            if line.startswith("GEMINI_API_KEY=") and line.split("=", 1)[1].strip("\"' "):
                return line.split("=", 1)[1].strip("\"' ")
    sys.exit("Chưa có GEMINI_API_KEY trong .env")


def norm(text):
    return re.sub(r"[^\w]", "", unicodedata.normalize("NFC", text.lower()))


def speak(text, out, voice, model):
    body = {
        # Chỉ gửi kịch bản: câu chỉ dẫn gửi kèm từng bị model đọc thành tiếng
        "contents": [{"parts": [{"text": text}]}],
        "generationConfig": {"responseModalities": ["AUDIO"], "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}}},
    }
    request = urllib.request.Request(
        f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
        data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "x-goog-api-key": api_key()},
    )
    data = json.load(urllib.request.urlopen(request, timeout=180))
    pcm = base64.b64decode(data["candidates"][0]["content"]["parts"][0]["inlineData"]["data"])
    with wave.open(str(out), "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(24000)
        f.writeframes(pcm)


def align(text, wav, out_dir):
    tmp = out_dir / "_16k.wav"
    subprocess.run([FFMPEG, "-v", "error", "-y", "-i", str(wav), "-ar", "16000", "-ac", "1", str(tmp)], check=True)
    subprocess.run([WHISPER, "-m", MODEL, "-f", str(tmp), "-l", "vi", "-ml", "1", "-sow", "-mc", "0", "-nf", "-oj", "-of", str(out_dir / "_o"), "-np"], check=True, capture_output=True)
    heard = [s for s in json.load(open(out_dir / "_o.json"))["transcription"] if norm(s["text"])]
    words = text.split()
    res = [None] * len(words)
    for m in difflib.SequenceMatcher(None, [norm(w) for w in words], [norm(s["text"]) for s in heard], autojunk=False).get_matching_blocks():
        for k in range(m.size):
            res[m.a + k] = (heard[m.b + k]["offsets"]["from"], heard[m.b + k]["offsets"]["to"])
    matched = sum(r is not None for r in res)
    end = heard[-1]["offsets"]["to"]
    i = 0
    while i < len(res):
        if res[i] is None:
            j = i
            while j < len(res) and res[j] is None:
                j += 1
            a = res[i - 1][1] if i else 0
            b = res[j][0] if j < len(res) else end
            for k in range(i, j):
                res[k] = (a + (b - a) * (k - i) // (j - i), a + (b - a) * (k - i + 1) // (j - i))
            i = j
        else:
            i += 1
    for f in (tmp, out_dir / "_o.json"):
        f.unlink()
    print(f"{matched}/{len(words)} từ khớp Whisper")
    return [{"text": w, "startMs": s, "endMs": e} for w, (s, e) in zip(words, res)]


def main(src, out, voice="Kore", model="gemini-3.8-flash-tts"):
    out_dir = Path(out)
    out_dir.mkdir(parents=True, exist_ok=True)
    text = " ".join(Path(src).read_text(encoding="utf-8").split())
    wav = out_dir / "voice.wav"
    if not wav.exists():
        speak(text, wav, voice, model)
    words = align(text, wav, out_dir)
    json.dump(words, open(out_dir / "words.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    print(f"{wav} · {words[-1]['endMs'] / 1000:.1f} giây")
    if words[0]["startMs"] > 1500:
        sys.exit(f"Từ đầu tiên ở {words[0]['startMs'] / 1000:.1f} giây: model có thể đã đọc thêm chữ ngoài kịch bản, nghe lại trước khi dùng.")


main(*sys.argv[1:])
