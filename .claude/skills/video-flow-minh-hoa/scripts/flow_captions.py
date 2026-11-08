#!/usr/bin/env python3
"""Fix Whisper words and publish the project to Remotion. Run from the kit root.

Usage: flow_captions.py DỰ_ÁN SLUG

corrections.json (keys are indexes in words.json):
  {"fix": {"8": "bao"}, "merge": {"139": "199.000đ"}, "breaks": [27, 65]}
- fix: replace one word.
- merge: replace this word and the next one with a single word.
- breaks: force a new caption line at this word (use the scene starts).

Writes DỰ_ÁN/words-corrected.json, remotion-demo/src/flow/data/SLUG.words.json,
and copies voice.mp3 and img/raw-sNN.jpg to remotion-demo/public/flow/SLUG/sNN.jpg.
"""
import json
import shutil
import sys
from pathlib import Path

MAX_WORDS = 6
PUNCTUATION = '?.,:'


def corrected(raw, corrections):
    fix = {int(k): v for k, v in corrections.get('fix', {}).items()}
    merge = {int(k): v for k, v in corrections.get('merge', {}).items()}
    breaks = set(corrections.get('breaks', []))
    bad = [i for i in merge if i + 1 >= len(raw)] + [i for i in fix if i >= len(raw)]
    if bad:
        sys.exit(f'corrections.json: chỉ số vượt số từ ({len(raw)} từ): {bad}')
    words, skip = [], set()
    for i, word in enumerate(raw):
        if i in skip:
            continue
        item = dict(word)
        if i in merge:
            item.update(w=merge[i], e=raw[i + 1]['e'])
            skip.add(i + 1)
        elif i in fix:
            item['w'] = fix[i]
        item['new_line'] = i in breaks
        if item['w'].strip():
            words.append(item)
    return words


def to_remotion(words):
    out, count = [], 0
    for i, word in enumerate(words):
        count += 1
        item = dict(text=word['w'], startMs=round(word['s'] * 1000), endMs=round(word['e'] * 1000))
        next_breaks = i + 1 < len(words) and words[i + 1]['new_line']
        if word['w'][-1] in PUNCTUATION or count == MAX_WORDS or next_breaks or i == len(words) - 1:
            item['pageBreakAfter'] = True
            count = 0
        out.append(item)
    return out


def main(project, slug):
    p = Path(project)
    raw = json.loads((p / 'words.json').read_text(encoding='utf-8-sig'))
    corrections = json.loads((p / 'corrections.json').read_text(encoding='utf-8'))
    words = corrected(raw, corrections)
    (p / 'words-corrected.json').write_text(json.dumps(words, ensure_ascii=False, indent=2), encoding='utf-8')

    data = Path('remotion-demo/src/flow/data') / f'{slug}.words.json'
    data.parent.mkdir(parents=True, exist_ok=True)
    data.write_text(json.dumps(to_remotion(words), ensure_ascii=False, indent=0), encoding='utf-8')

    public = Path('remotion-demo/public/flow') / slug
    public.mkdir(parents=True, exist_ok=True)
    shutil.copy(p / 'voice.mp3', public / 'voice.mp3')
    images = sorted((p / 'img').glob('raw-s*.jpg'))
    for image in images:
        shutil.copy(image, public / (image.name.removeprefix('raw-')))
    print(f'{len(words)} từ -> {data}; {len(images)} ảnh -> {public}')
    if not images:
        print(f'Cảnh báo: chưa có ảnh {p}/img/raw-s*.jpg, chạy flow_collect.py trước khi dựng.', file=sys.stderr)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
