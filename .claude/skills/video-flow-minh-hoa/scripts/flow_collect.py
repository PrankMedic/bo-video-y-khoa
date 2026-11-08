#!/usr/bin/env python3
"""Move Flow downloads into DỰ_ÁN/img/raw-sNN.jpg.

Usage: flow_collect.py DỰ_ÁN --since "2026-11-01 19:30" --count 10 [--order newest-first] [--downloads DIR]

Flow lists the newest image first, so downloading left to right gives S10, S09, ... S01:
that is --order newest-first (the default). Use --order oldest-first after downloading S01 first.
Re-downloads named "... (1).jpg" are ignored and left in place. Check the printed mapping
and the review sheet: the mapping relies on download order only.
"""
import argparse
import re
import shutil
from datetime import datetime
from pathlib import Path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('project')
    ap.add_argument('--since', required=True)
    ap.add_argument('--count', type=int, required=True)
    ap.add_argument('--order', choices=['newest-first', 'oldest-first'], default='newest-first')
    ap.add_argument('--downloads', default=str(Path.home() / 'Downloads'))
    args = ap.parse_args()

    since = datetime.strptime(args.since, '%Y-%m-%d %H:%M').timestamp()
    files = [f for f in Path(args.downloads).glob('*_2K*.jpg')
             if f.stat().st_mtime >= since and not re.search(r' \(\d+\)\.jpg$', f.name)]
    files.sort(key=lambda f: f.stat().st_mtime)
    if len(files) != args.count:
        raise SystemExit(f'Thấy {len(files)} ảnh, cần {args.count}. Chưa chuyển file nào: {[f.name for f in files]}')

    img = Path(args.project) / 'img'
    img.mkdir(parents=True, exist_ok=True)
    numbers = range(args.count, 0, -1) if args.order == 'newest-first' else range(1, args.count + 1)
    for n, f in zip(numbers, files):
        target = img / f'raw-s{n:02}.jpg'
        if target.exists():
            raise SystemExit(f'{target} đã tồn tại, dừng để không ghi đè.')
        shutil.move(f, target)
        print(f'{f.name} -> {target.name}')


if __name__ == '__main__':
    main()
