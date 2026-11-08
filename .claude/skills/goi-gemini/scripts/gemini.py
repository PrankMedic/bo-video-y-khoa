#!/usr/bin/env python3
"""Gọi Gemini API bằng khoá API (GEMINI_API_KEY) cho skill goi-gemini.

  gemini.py [-f FILE ...] [-m MODEL] [-o OUT] "<prompt>"
  gemini.py [-f FILE ...] [-m MODEL] [-o OUT] - < prompt.txt
  gemini.py --models

Khoá đọc từ biến môi trường, hoặc file .env gần nhất phía trên. Không in khoá ra màn hình.
Câu trả lời in ra stdout; số token và lỗi in ra stderr.
"""
import argparse, json, os, socket, sys, urllib.error, urllib.request

HERE = os.path.dirname(os.path.realpath(__file__))  # realpath: skill có thể là symlink
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", "..", ".."))
API = "https://generativelanguage.googleapis.com/v1beta/"
MODEL = "gemini-3.6-flash"
TIMEOUT = 120


def load_key():
    if os.environ.get("GEMINI_API_KEY"):
        return os.environ["GEMINI_API_KEY"]
    d = ROOT
    while True:
        p = os.path.join(d, ".env")
        if os.path.exists(p):
            with open(p, encoding="utf-8") as f:
                for line in f:
                    k, sep, v = line.strip().partition("=")
                    if sep and k.strip() == "GEMINI_API_KEY":
                        return v.strip().strip('"').strip("'")
        parent = os.path.dirname(d)
        if parent == d:
            return ""
        d = parent


def call(path, key, body=None):
    # Khoá đi trong header để không lọt vào URL và log.
    req = urllib.request.Request(API + path, headers={"x-goog-api-key": key, "Content-Type": "application/json"})
    if body is not None:
        req.data = json.dumps(body).encode("utf-8")
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            return json.load(r)
    except socket.timeout:
        sys.exit("Gemini API không trả lời sau %s giây. Thử model khác bằng -m." % TIMEOUT)
    except urllib.error.HTTPError as e:
        try:
            msg = json.load(e).get("error", {}).get("message", "")
        except ValueError:
            msg = ""
        sys.exit("Gemini API lỗi %s: %s" % (e.code, msg))
    except urllib.error.URLError as e:
        sys.exit("Không kết nối được Gemini API: %s" % e.reason)


def main():
    ap = argparse.ArgumentParser(description="Gọi Gemini API bằng khoá API.")
    ap.add_argument("prompt", nargs="?", help='nội dung hỏi, hoặc "-" để đọc từ stdin')
    ap.add_argument("-f", "--file", action="append", default=[], help="file văn bản đính kèm, dùng được nhiều lần")
    ap.add_argument("-m", "--model", default=MODEL)
    ap.add_argument("-o", "--out", help="ghi câu trả lời ra file")
    ap.add_argument("--models", action="store_true", help="liệt kê model khoá này dùng được")
    args = ap.parse_args()

    key = load_key()
    if not key:
        sys.exit("Chưa có GEMINI_API_KEY trong .env.")

    if args.models:
        for m in call("models?pageSize=200", key).get("models", []):
            if "generateContent" in m.get("supportedGenerationMethods", []):
                print(m["name"].split("/", 1)[-1])
        return

    if not args.prompt:
        ap.error("thiếu prompt")
    prompt = sys.stdin.read() if args.prompt == "-" else args.prompt
    for path in args.file:
        with open(path, encoding="utf-8") as f:
            prompt += "\n\n<file path=%s>\n%s\n</file>" % (json.dumps(path), f.read())

    res = call("models/%s:generateContent" % args.model, key, {"contents": [{"role": "user", "parts": [{"text": prompt}]}]})
    cands = res.get("candidates") or []
    if not cands:
        sys.exit("Gemini không trả lời: %s" % json.dumps(res.get("promptFeedback", {}), ensure_ascii=False))
    parts = cands[0].get("content", {}).get("parts", [])
    text = "".join(p.get("text", "") for p in parts if not p.get("thought"))

    u = res.get("usageMetadata", {})
    print("model=%s vào=%s ra=%s tổng=%s kết_thúc=%s" % (args.model, u.get("promptTokenCount"), u.get("candidatesTokenCount"),
                                                       u.get("totalTokenCount"), cands[0].get("finishReason")), file=sys.stderr)
    if cands[0].get("finishReason") != "STOP":
        print("Cảnh báo: câu trả lời có thể bị cắt hoặc bị chặn.", file=sys.stderr)
    if args.out:
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(text)
    else:
        print(text)


if __name__ == "__main__":
    main()
