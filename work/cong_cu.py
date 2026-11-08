"""Tìm ffmpeg, ffprobe, whisper-cli và model Whisper trên mọi máy Mac, không ghi cứng đường dẫn.

Thứ tự tìm: biến môi trường (FFMPEG, FFPROBE, WHISPER_CLI, WHISPER_MODEL), rồi PATH,
rồi thư mục Homebrew trên Mac chip Apple (/opt/homebrew) và Mac Intel (/usr/local).
Kiểm tra nhanh: python3 cong_cu.py
"""
import os
import shutil
import sys
from pathlib import Path

BREW = [Path("/opt/homebrew"), Path("/usr/local")]
MODEL_DIRS = [Path.home() / "whisper-models", Path.home() / ".cache/whisper-cpp"]
# Model tốt nhất trước. Máy yếu hoặc ít ổ đĩa có thể chỉ có bản small.
MODEL_NAMES = ["ggml-large-v3-turbo-q5_0.bin", "ggml-large-v3-turbo.bin", "ggml-medium.bin", "ggml-small.bin", "ggml-base.bin"]


def _tim(env, ten, phu=()):
    if os.environ.get(env):
        return os.environ[env]
    for brew in BREW:
        for p in phu:
            if (brew / p).exists():
                return str(brew / p)
    found = shutil.which(ten)
    if found:
        return found
    for brew in BREW:
        if (brew / "bin" / ten).exists():
            return str(brew / "bin" / ten)
    return ten  # để lỗi "không tìm thấy" hiện ra lúc chạy, kèm hướng dẫn của cong_cu.py


# ffmpeg-full có thêm bộ lọc (drawtext, rubberband...). Không có thì dùng ffmpeg thường.
FFMPEG_FULL = _tim("FFMPEG", "ffmpeg", ["opt/ffmpeg-full/bin/ffmpeg"])
FFMPEG = os.environ.get("FFMPEG") or _tim("FFMPEG", "ffmpeg")
FFPROBE = _tim("FFPROBE", "ffprobe", ["opt/ffmpeg-full/bin/ffprobe"])
WHISPER = _tim("WHISPER_CLI", "whisper-cli")


def _model():
    if os.environ.get("WHISPER_MODEL"):
        return os.path.expanduser(os.environ["WHISPER_MODEL"])
    for name in MODEL_NAMES:
        for d in MODEL_DIRS:
            if (d / name).exists():
                return str(d / name)
    return str(MODEL_DIRS[0] / MODEL_NAMES[0])


MODEL = _model()


def kiem_tra():
    loi = []
    for ten, duong in [("ffmpeg", FFMPEG), ("ffprobe", FFPROBE), ("whisper-cli", WHISPER)]:
        ok = Path(duong).exists() or shutil.which(duong)
        print(f"{'OK ' if ok else 'THIẾU'} {ten}: {duong}")
        if not ok:
            loi.append(ten)
    ok = Path(MODEL).exists()
    print(f"{'OK ' if ok else 'THIẾU'} model Whisper: {MODEL}")
    if not ok:
        loi.append("model")
    if loi:
        print("\nCài thiếu: brew install ffmpeg whisper-cpp, rồi tải model theo HUONG-DAN-CAI-DAT.md."
              "\nModel để chỗ khác thì đặt biến WHISPER_MODEL=/đường/dẫn/model.bin")
    return not loi


if __name__ == "__main__":
    sys.exit(0 if kiem_tra() else 1)
