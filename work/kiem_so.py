"""Chặn con số không có trong bài gốc trước khi dựng Bản tin.

Chạy từ work/: python3 kiem_so.py <thư mục tập> [file dữ liệu thêm ...]
Mọi số trong kich-ban.txt và các file thêm phải có trong fulltext.txt, hoặc khai trong so-tinh.json
dưới dạng {"số": "công thức từ số trong bài"} và được tính lại khớp sai số làm tròn. Sai thì thoát 1.
"""
import json
import re
import sys
from pathlib import Path

NUMBER = re.compile(r"(?<![\w.,])\d+(?:[.,]\d+)?(?![\w])")
# Số thứ tự trong tên định danh và mã màu không phải số liệu
IGNORE_LINE = re.compile(r"^\s*(import|//|\"?(id|audio|format|fromMs|toMs|frames|episode)\"?:)")


def numbers(text):
    return {m.group().replace(",", ".") for m in NUMBER.finditer(text)}


def main(folder, *extra):
    d = Path(folder)
    full = numbers((d / "fulltext.txt").read_text(encoding="utf-8").replace("‐", "-"))
    derived = {}
    if (d / "so-tinh.json").exists():
        derived = json.loads((d / "so-tinh.json").read_text(encoding="utf-8"))
    bad = 0
    for key, formula in derived.items():
        used = numbers(formula)
        missing = [n for n in used if n not in full and n != "100"]
        value = eval(formula, {"__builtins__": {}})  # công thức do Claude viết, không nhận từ nguồn ngoài
        if missing or abs(value - float(key.replace(",", "."))) >= 1:
            print(f"SAI CÔNG THỨC {key} = {formula} ra {value:.2f}; thiếu trong bài: {missing}")
            bad += 1
    sources = [d / "kich-ban.txt"] + [Path(x) for x in extra]
    for src in sources:
        for no, line in enumerate(src.read_text(encoding="utf-8").splitlines(), 1):
            if IGNORE_LINE.match(line):
                continue
            for n in sorted(numbers(line)):
                key = n.replace(".", ",")
                if n not in full and n not in derived and key not in derived:
                    print(f"KHÔNG THẤY {n} ở {src.name}:{no}: {line.strip()[:90]}")
                    bad += 1
    print(f"{d.name}: {'ĐẠT' if not bad else f'{bad} lỗi'}")
    sys.exit(1 if bad else 0)


main(*sys.argv[1:])
