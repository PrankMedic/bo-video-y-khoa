#!/usr/bin/env python3
"""Cut voice.mp3 from the source clip using DỰ_ÁN/cuts.json. Run from the kit root.

cuts.json: {"source": "Output/clips/x.mp4", "keep": [[from, to], ...], "removed": [{"from", "to", "why"}]}
"""
import json
import subprocess
import sys
from pathlib import Path

FADE = 0.06


def main(project):
    p = Path(project)
    cuts = json.loads((p / 'cuts.json').read_text(encoding='utf-8'))
    keep = cuts['keep']
    parts = [
        f'[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d={FADE},afade=t=out:st={b - a - FADE:.3f}:d={FADE}[a{i}]'
        for i, (a, b) in enumerate(keep)
    ]
    labels = ''.join(f'[a{i}]' for i in range(len(keep)))
    graph = ';'.join(parts) + f';{labels}concat=n={len(keep)}:v=0:a=1[o]'
    out = p / 'voice.mp3'
    subprocess.check_call(['ffmpeg', '-v', 'error', '-y', '-i', cuts['source'], '-filter_complex', graph,
                           '-map', '[o]', '-ar', '44100', '-b:a', '192k', str(out)])
    print(f'{out}: {len(keep)} đoạn, {sum(b - a for a, b in keep):.2f}s')


if __name__ == '__main__':
    main(sys.argv[1])
