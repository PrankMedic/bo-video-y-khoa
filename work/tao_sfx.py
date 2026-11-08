"""Tổng hợp SFX riêng của kênh bằng thư viện chuẩn của Python, không dùng sample.

whoosh.wav: nhiễu qua bộ lọc quét, đỉnh ở WHOOSH_PEAK_S, đặt đỉnh trùng điểm chuyển cảnh.
digital.wav: hai tiếng ngắn đi lên, đặt lúc thông tin hiện ra.

Usage (from inside work/): python3 tao_sfx.py
"""
import math
import os
import random
import struct
import wave

OUT = "../remotion-demo/public/sfx"
RATE = 48000
WHOOSH_SECONDS = 0.7
WHOOSH_PEAK_S = 0.3  # giữ khớp với SFX_PEAK trong remotion-demo/src/formats/effects.tsx


def whoosh():
    rng = random.Random(11)
    n = round(WHOOSH_SECONDS * RATE)
    low = band = 0.0
    left, right = [], []
    for i in range(n):
        t = i / RATE
        rise = min(1, t / WHOOSH_PEAK_S)
        fall = max(0, (t - WHOOSH_PEAK_S) / (WHOOSH_SECONDS - WHOOSH_PEAK_S))
        envelope = (math.sin(rise * math.pi / 2) ** 3) * (math.cos(fall * math.pi / 2) ** 2)
        cutoff = 350 + 2600 * envelope
        f = 2 * math.sin(math.pi * cutoff / RATE)
        low += f * band
        high = rng.uniform(-1, 1) - low - 0.9 * band
        band += f * high
        pan = (t / WHOOSH_SECONDS - 0.5) * 0.5  # lướt nhẹ từ trái sang phải
        angle = (pan + 1) * math.pi / 4
        left.append(band * envelope * math.cos(angle))
        right.append(band * envelope * math.sin(angle))
    return left, right, 0.35


def digital():
    n = round(0.24 * RATE)
    mono = [0.0] * n
    for start, freq, decay in ((0.0, 1175, 70), (0.07, 1568, 42)):
        for i in range(round(start * RATE), n):
            t = i / RATE - start
            attack = min(1, t / 0.002)
            mono[i] += attack * math.exp(-t * decay) * (math.sin(2 * math.pi * freq * t) + 0.18 * math.sin(4 * math.pi * freq * t))
    return mono, mono, 0.2


def write(name, left, right, peak):
    top = max(max(map(abs, left)), max(map(abs, right)))
    fade = 240
    with wave.open(os.path.join(OUT, name), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(RATE)
        frames = bytearray()
        for i, (a, b) in enumerate(zip(left, right)):
            edge = min(1, (len(left) - 1 - i) / fade)
            frames += struct.pack("<hh", round(a / top * peak * edge * 32767), round(b / top * peak * edge * 32767))
        w.writeframes(bytes(frames))
    print(name, f"{len(left) / RATE:.2f}s, đỉnh {20 * math.log10(peak):.1f} dBFS")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    write("whoosh.wav", *whoosh())
    write("digital.wav", *digital())
