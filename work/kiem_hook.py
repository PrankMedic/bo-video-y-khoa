#!/usr/bin/env python3
"""Chấm bản đồ hook của video ngắn.

Cách chạy: cd work && python3 -I kiem_hook.py ../duong/dan/hooks.json
Thêm --json out.json để ghi kết quả; --so-sanh a.json b.json để so sánh.
JSON: {"durationMs": 52000, "hooks": [{"atMs": 0, "kind": "chu",
"label": "Câu hỏi", "loop": "mo:vi-du", "rehook": true}]}.
kind: am-thanh, chu, thoai, hinh; am-thanh cần sfx (tên tiếng).
loop tùy chọn: mo:<id> hoặc dong:<id>; rehook tùy chọn là boolean.
H3 tính cả từ tiếng cuối đến hết video, không tính đoạn trước tiếng đầu.
H4 xét chuỗi trong danh sách âm thanh, dùng độ lệch chuẩn tổng thể.
Neo theo lời thoại: thay atMs bằng "phrase" (cụm từ trong words.json, thêm
"nth" nếu cụm lặp lại, "offsetMs" để lệch mốc), thay durationMs bằng "tailMs"
(thời gian sau từ cuối), rồi chạy kèm --words words.json.
Ngưỡng là quy ước thực hành của bộ skill, không phải kết quả nghiên cứu
"""

import argparse
import json
import math
import statistics
import re
import sys
import unicodedata
from pathlib import Path


KINDS = {"am-thanh", "chu", "thoai", "hinh"}
DAT, CANH_BAO, TRUOT = "ĐẠT", "CẢNH BÁO", "TRƯỢT"


def so(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value)


def chuan(text):
    return re.sub(r"[^\w%]", "", unicodedata.normalize("NFC", text.lower()))


def neo(data, words_path):
    """Đổi phrase thành atMs và tailMs thành durationMs theo words.json."""
    with open(words_path, encoding="utf-8") as tep:
        words = json.load(tep)
    tokens = [chuan(w["text"]) for w in words]
    if "durationMs" not in data and so(data.get("tailMs")):
        data["durationMs"] = words[-1]["endMs"] + data["tailMs"]
    for hook in data.get("hooks", []):
        if "phrase" not in hook:
            continue
        target = [chuan(t) for t in hook["phrase"].split() if chuan(t)]
        hits = [i for i in range(len(tokens)) if tokens[i:i + len(target)] == target]
        nth = hook.get("nth", 0)
        if len(hits) <= nth:
            raise ValueError(f"Không thấy cụm \"{hook['phrase']}\" (lần {nth + 1}) trong lời thoại")
        hook["atMs"] = max(0, words[hits[nth]]["startMs"] + hook.get("offsetMs", 0))
    return data


def doc(path, words_path=None):
    with open(path, encoding="utf-8") as tep:
        data = json.load(tep)
    if words_path:
        data = neo(data, words_path)
    if not isinstance(data, dict) or not so(data.get("durationMs")) or data["durationMs"] <= 0:
        raise ValueError("durationMs phải là số hữu hạn lớn hơn 0")
    if not isinstance(data.get("hooks"), list):
        raise ValueError("hooks phải là danh sách")
    for i, hook in enumerate(data["hooks"], 1):
        if not isinstance(hook, dict):
            raise ValueError(f"Hook {i} phải là đối tượng")
        if not so(hook.get("atMs")) or not 0 <= hook["atMs"] <= data["durationMs"]:
            raise ValueError(f"Hook {i}: atMs phải nằm trong thời lượng")
        if not isinstance(hook.get("kind"), str) or hook["kind"] not in KINDS:
            raise ValueError(f"Hook {i}: kind không hợp lệ")
        if hook["kind"] == "am-thanh":
            if not isinstance(hook.get("sfx"), str) or not hook["sfx"].strip():
                raise ValueError(f"Hook {i}: thiếu tên sfx")
        elif "sfx" in hook:
            raise ValueError(f"Hook {i}: sfx chỉ dành cho am-thanh")
        if "label" in hook and not isinstance(hook["label"], str):
            raise ValueError(f"Hook {i}: label phải là chuỗi")
        if "rehook" in hook and not isinstance(hook["rehook"], bool):
            raise ValueError(f"Hook {i}: rehook phải là boolean")
        if "loop" in hook:
            loop = hook["loop"]
            if not isinstance(loop, str) or ":" not in loop or loop.split(":", 1)[0] not in {"mo", "dong"} or not loop.split(":", 1)[1].strip():
                raise ValueError(f"Hook {i}: loop phải có dạng mo:<id> hoặc dong:<id>")
    return data["durationMs"], sorted(data["hooks"], key=lambda h: h["atMs"])


def khoang(hooks, duration):
    if not hooks:
        return duration, 0, duration
    times = [h["atMs"] for h in hooks] + [duration]
    start, end = max(zip(times, times[1:]), key=lambda pair: pair[1] - pair[0])
    return end - start, start, end


def cham(path, words_path=None):
    duration, hooks = doc(path, words_path)
    rules = []

    def them(code, status, reason):
        rules.append({"ma": code, "ket_qua": status, "ly_do": reason})

    kinds = len({h["kind"] for h in hooks if h["atMs"] <= 3000})
    first = hooks[0]["atMs"] if hooks else None
    status = TRUOT if first is None or first > 1500 or kinds < 2 else DAT if kinds >= 3 else CANH_BAO
    them("H1", status, f"Hook đầu: {first if first is not None else 'không có'} ms; {kinds} kind trong 0–3000 ms.")
    gap, start, end = khoang(hooks, duration)
    them("H2", DAT if gap <= 5000 else CANH_BAO if gap <= 7000 else TRUOT,
         f"Khoảng lớn nhất {gap:g} ms, tại {start:g}–{end:g} ms (không tính trước hook đầu).")
    sounds = [h for h in hooks if h["kind"] == "am-thanh"]
    audio_gap, _, _ = khoang(sounds, duration)
    types = len({h["sfx"] for h in sounds})
    them("H3", TRUOT if not sounds or audio_gap > 10000 or types < 2 else CANH_BAO if types == 2 else DAT,
         f"{len(sounds)} tiếng; khoảng lớn nhất kể cả đuôi {audio_gap:g} ms; {types} loại sfx.")
    longest = run = 0
    previous = None
    for hook in sounds:
        run = run + 1 if hook["sfx"] == previous else 1
        longest = max(longest, run)
        previous = hook["sfx"]
    intervals = [b["atMs"] - a["atMs"] for a, b in zip(sounds, sounds[1:])]
    cv = None
    if len(intervals) >= 3:
        mean = statistics.mean(intervals)
        cv = statistics.pstdev(intervals) / mean if mean else 0.0
    regular = cv is not None and cv < 0.15
    rhythm = f"CV={cv:.3f}" if cv is not None else "chưa đủ 3 khoảng để tính CV"
    if regular:
        rhythm += ", nhịp đều như máy đếm"
    them("H4", TRUOT if longest >= 4 else CANH_BAO if longest == 3 or regular else DAT,
         f"Chuỗi sfx lặp dài nhất {longest}; {len(intervals)} khoảng; {rhythm}.")
    opens = [h for h in hooks if h.get("loop", "").startswith("mo:")]
    early_open = sum(h["atMs"] <= 3000 for h in opens)
    missing = early_close = 0
    for hook in opens:
        closes = [h["atMs"] for h in hooks if h.get("loop") == "dong:" + hook["loop"][3:] and h["atMs"] > hook["atMs"]]
        if not closes:
            missing += 1
        elif min(closes) < 0.3 * duration:
            early_close += 1
    them("H5", TRUOT if not early_open or missing else CANH_BAO if early_close else DAT,
         f"{early_open} vòng mở trước hoặc tại 3000 ms; {missing} thiếu đóng sau mở; {early_close} đóng trước {0.3 * duration:g} ms (30%).")
    rehooks = sum(h.get("rehook") is True and 0.5 * duration <= h["atMs"] <= 0.8 * duration for h in hooks)
    them("H6", DAT if rehooks else CANH_BAO,
         f"{rehooks} rehook trong {0.5 * duration:g}–{0.8 * duration:g} ms (50%–80%).")
    counts = {"dat": sum(r["ket_qua"] == DAT for r in rules),
              "canh_bao": sum(r["ket_qua"] == CANH_BAO for r in rules),
              "truot": sum(r["ket_qua"] == TRUOT for r in rules)}
    return {"luat": rules, "tong": counts, "so_do": {
        "so_hook": len(hooks), "hook_moi_10s": len(hooks) * 10000 / duration,
        "khoang_lon_nhat_ms": gap, "so_loai_sfx": types,
        "chuoi_sfx_lap_dai_nhat": longest}}


def tong(result):
    counts = result["tong"]
    return f"Điểm: {counts['dat']}/6 đạt, {counts['canh_bao']} cảnh báo, {counts['truot']} trượt"


def main():
    parser = argparse.ArgumentParser(description="Chấm bản đồ hook video.")
    parser.add_argument("file", nargs="?", help="File JSON cần chấm")
    parser.add_argument("--json", metavar="TEP", help="Ghi kết quả JSON")
    parser.add_argument("--so-sanh", nargs=2, metavar=("CU", "MOI"), help="So sánh hai file JSON")
    parser.add_argument("--words", nargs="+", metavar="WORDS", help="words.json để neo phrase (với --so-sanh: hai file, cũ rồi mới)")
    args = parser.parse_args()
    if bool(args.file) == bool(args.so_sanh):
        parser.error("Chọn một file hoặc --so-sanh CU MOI")
    try:
        if args.so_sanh:
            words = (args.words or [None, None]) * (2 if args.words and len(args.words) == 1 else 1)
            old, new = [cham(path, w) for path, w in zip(args.so_sanh, words)]
            print("Luật | Cũ | Mới")
            for a, b in zip(old["luat"], new["luat"]):
                print(f"{a['ma']} | {a['ket_qua']}: {a['ly_do']} | {b['ket_qua']}: {b['ly_do']}")
            print("Số đo | Cũ | Mới")
            for key, value in old["so_do"].items():
                print(f"{key} | {value:g} | {new['so_do'][key]:g}")
            print(f"{tong(old)} | {tong(new)}")
            output = {"cu": old, "moi": new}
            code = 0
        else:
            output = cham(args.file, args.words[0] if args.words else None)
            print("Luật | Kết quả | Lý do")
            for rule in output["luat"]:
                print(f"{rule['ma']} | {rule['ket_qua']} | {rule['ly_do']}")
            print(tong(output))
            code = int(output["tong"]["truot"] > 0)
        if args.json:
            target = Path(args.json)
            inputs = args.so_sanh or [args.file]
            if any(target.resolve() == Path(path).resolve() for path in inputs):
                raise ValueError("File kết quả không được trùng file đầu vào")
            target.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        return code
    except (OSError, ValueError, TypeError, RecursionError) as exc:
        print(f"Lỗi: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
