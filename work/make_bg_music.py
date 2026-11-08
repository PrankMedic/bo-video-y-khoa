"""Synthesize a calm, royalty-free background loop with ffmpeg (no samples needed).

Am - F - C - G pad with a soft kick on every beat, 100 BPM, 9.6 s per loop.
Placeholder until a licensed track is chosen; swap the file in remotion-demo/public/music/.

Usage (from inside work/): python3 make_bg_music.py
"""
import os
import subprocess
import sys
sys.path.insert(0, __import__("os").path.dirname(__import__("os").path.abspath(__file__)))  # chạy được cả với python3 -I
from cong_cu import FFMPEG_FULL

FFMPEG = FFMPEG_FULL
OUT = "../remotion-demo/public/music/bg-pad.wav"
BAR = 2.4  # seconds per chord (4 beats at 100 BPM)
BEAT = BAR / 4

CHORDS = [
    (110.00, 220.00, 261.63, 329.63),  # Am
    (87.31, 174.61, 220.00, 261.63),   # F
    (130.81, 261.63, 329.63, 392.00),  # C
    (98.00, 196.00, 246.94, 293.66),   # G
]


def pad_expr(freqs):
    env = f"min(1,t/0.5)*min(1,({BAR}-t)/0.5)"
    voices = []
    for i, f in enumerate(freqs):
        amp = 0.10 if i == 0 else 0.055
        # Two slightly detuned sines per note for a softer, chorused pad
        voices.append(f"{amp}*(sin(2*PI*{f}*t)+sin(2*PI*{f * 1.004:.3f}*t))")
    return f"({'+'.join(voices)})*{env}"


def main():
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    loop = BAR * len(CHORDS)
    inputs, labels = [], []
    for i, chord in enumerate(CHORDS):
        inputs += ["-f", "lavfi", "-i", f"aevalsrc='{pad_expr(chord)}':s=44100:d={BAR}"]
        labels.append(f"[{i}]")
    kick = (f"0.35*sin(2*PI*(45+90*exp(-mod(t,{BEAT})*28))*mod(t,{BEAT}))"
            f"*exp(-mod(t,{BEAT})*10)")
    inputs += ["-f", "lavfi", "-i", f"aevalsrc='{kick}':s=44100:d={loop}"]
    n = len(CHORDS)
    graph = (
        f"{''.join(labels)}concat=n={n}:v=0:a=1,lowpass=f=1800,"
        f"aecho=0.8:0.6:120|240:0.25|0.15[pad];"
        f"[{n}]lowpass=f=200[kick];"
        f"[pad][kick]amix=inputs=2:weights=1 0.6:normalize=0,"
        f"loudnorm=I=-20:TP=-3,aformat=channel_layouts=stereo"
    )
    subprocess.run(
        [FFMPEG, "-v", "error", "-y", *inputs, "-filter_complex", graph,
         "-t", f"{loop}", "-ar", "44100", OUT],
        check=True,
    )
    print(f"{OUT}: {loop:.1f}s loop")


if __name__ == "__main__":
    main()
