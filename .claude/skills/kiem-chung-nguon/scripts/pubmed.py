#!/usr/bin/env python3
"""Tra PubMed qua NCBI E-utilities cho kho bằng chứng, in kết quả gọn để Claude tốn ít token.

Cách xây truy vấn (TYPE_ALIASES, bộ lọc năm, hasabstract, English, chế độ KEYWORD/SR/MESH/ADVANCED/SIMILAR)
lấy theo script Apps Script "PubMed AI Automation v5", để kết quả khớp với Google Sheet.

  pubmed.py search "<truy vấn>" [--type "systematic review;rct"] [--from 2015] [--to 2026]
                                [--max 20] [--mode keyword|sr|mesh|advanced|similar] [--sort relevance|pub_date]
  pubmed.py fetch PMID [PMID ...] [--abstract] [--json]
  pubmed.py sheet <từ khoá> [<từ khoá> ...]
  pubmed.py seed "<tên tab>" "<truy vấn>" [--type ...] [--from ...] [--max 30] [--no-sheet]
      Gọi workflow n8n "pubmed-seed" (N8N_SEED_URL, N8N_SEED_TOKEN trong .env).

Khoá đọc từ file .env gần nhất phía trên (PUBMED_API_KEY, NCBI_EMAIL). Không in khoá ra màn hình.
"""
import argparse, csv, glob, json, os, re, sys, time, urllib.error, urllib.parse, urllib.request
import xml.etree.ElementTree as ET

HERE = os.path.dirname(os.path.realpath(__file__))  # realpath: skill có thể là symlink
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", "..", ".."))
KHO = os.path.join(ROOT, "tai-lieu", "kho-bang-chung")
CACHE = os.path.join(KHO, ".cache")
SHEET_DIR = os.path.join(KHO, "nguon-khac", "sheet")
EUTILS = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"
TOOL = "bo_video_y_khoa"

TYPE_ALIASES = {
    "clinical trial": "Clinical Trial[pt]",
    "rct": "Randomized Controlled Trial[pt]",
    "randomized controlled trial": "Randomized Controlled Trial[pt]",
    "phase 2": "Clinical Trial, Phase II[pt]",
    "phase ii": "Clinical Trial, Phase II[pt]",
    "phase 3": "Clinical Trial, Phase III[pt]",
    "phase iii": "Clinical Trial, Phase III[pt]",
    "meta-analysis": "Meta-Analysis[pt]",
    "meta analysis": "Meta-Analysis[pt]",
    "systematic review": "Systematic Review[pt]",
    "sr": "Systematic Review[pt]",
    "review": "Review[pt]",
    "observational": "Observational Study[pt]",
    "real world": "Observational Study[pt]",
    "guideline": "Guideline[pt] OR Practice Guideline[pt]",
    "consensus": "Consensus Development Conference[pt] OR Consensus Statement[pt]",
    "all": "",
    "tất cả": "",
}

# Gợi ý xung đột lợi ích: affiliation có tên công ty hoặc bộ phận R&D.
COI_RE = re.compile(
    r"\b(Inc\.?|Ltd\.?|LLC|GmbH|S\.?A\.?S?|S\.p\.A|Corp\.?|Company|Pharma\w*|Laborato\w+|R&D|"
    r"Research and Development|Galderma|L'Or[eé]al|Bioderma|Pierre Fabre|Procter|Unilever|Beiersdorf|"
    r"Johnson|Pfizer|GSK|GlaxoSmithKline|Novartis|Sanofi|AbbVie|Allergan|Kenvue|Shiseido|Kao|Kanebo|Amorepacific)\b",  # quet-bo-qua: danh sách hãng để dò xung đột lợi ích
    re.I,
)


def load_env():
    d = ROOT
    while True:
        p = os.path.join(d, ".env")
        if os.path.isfile(p):
            env = {}
            for line in open(p, encoding="utf-8"):
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    env[k.strip()] = v.strip().strip('"').strip("'")
            return env
        parent = os.path.dirname(d)
        if parent == d:
            return {}
        d = parent


ENV = load_env()
ENV.update({k: v for k, v in os.environ.items() if k in ("PUBMED_API_KEY", "NCBI_EMAIL", "N8N_SEED_URL", "N8N_SEED_TOKEN")})
_last = [0.0]


def eutils(endpoint, params):
    p = dict(params, tool=TOOL)
    if ENV.get("PUBMED_API_KEY"):
        p["api_key"] = ENV["PUBMED_API_KEY"]
    if ENV.get("NCBI_EMAIL"):
        p["email"] = ENV["NCBI_EMAIL"]
    gap = 0.11 if ENV.get("PUBMED_API_KEY") else 0.35   # có key: 10 req/s, không key: 3 req/s
    data = urllib.parse.urlencode(p).encode()
    for attempt in range(1, 4):
        wait = _last[0] + gap - time.time()
        if wait > 0:
            time.sleep(wait)
        _last[0] = time.time()
        try:
            with urllib.request.urlopen(urllib.request.Request(EUTILS + endpoint, data=data), timeout=60) as r:
                return r.read().decode("utf-8")
        except urllib.error.HTTPError as e:
            if e.code == 429 or e.code >= 500:
                time.sleep(1.5 * attempt * attempt)
                continue
            sys.exit(f"PubMed {endpoint} lỗi {e.code}: {e.read()[:200]!r}")
        except urllib.error.URLError as e:
            time.sleep(1.5 * attempt * attempt)
            if attempt == 3:
                sys.exit(f"Không kết nối được PubMed: {e}")
    sys.exit(f"PubMed {endpoint} đang quá tải, thử lại sau.")


def smart_keyword(k):
    if re.search(r"\b(AND|OR|NOT)\b|[\"\[\]()]", k):
        return k
    return re.sub(r"\s*\+\s*", " AND ", k)


def build_filters(a):
    f = []
    if a.year_from or a.year_to:
        f.append(f"{a.year_from or '1900'}:{a.year_to or '3000'}[dp]")
    types = []
    for t in filter(None, (x.strip() for x in re.split(r"[;,]", a.type or ""))):
        alias = TYPE_ALIASES.get(t.lower())
        types.append(alias if alias is not None else f'"{t}"[pt]')
    types = [t for t in types if t]
    if types:
        f.append("(" + " OR ".join(types) + ")")
    f.append('"hasabstract"[Filter]')
    if not re.search(r"\[(lang|la)\]", a.extra or "", re.I):
        f.append("English[lang]")
    if a.extra:
        f.append(f"({a.extra})")
    return f


def build_core(a):
    k = a.query
    if a.mode == "advanced":
        return k
    if a.mode == "mesh":
        return " AND ".join(f'"{t.strip()}"[MeSH Terms]' for t in k.split(";") if t.strip())
    if a.mode == "sr":
        return f"({smart_keyword(k)}) AND systematic[sb]"
    return smart_keyword(k)


def in_kho():
    return {os.path.basename(f)[:-3] for f in glob.glob(os.path.join(KHO, "bai", "*.md"))}


def summaries(ids):
    out = {}
    for i in range(0, len(ids), 200):
        j = json.loads(eutils("esummary.fcgi", {"db": "pubmed", "id": ",".join(ids[i:i + 200]), "retmode": "json"}))
        for uid in j.get("result", {}).get("uids", []):
            out[uid] = j["result"][uid]
    return out


SHORT_PT = {
    "Randomized Controlled Trial": "RCT", "Systematic Review": "SR", "Meta-Analysis": "MA",
    "Practice Guideline": "Guideline", "Guideline": "Guideline", "Consensus Statement": "Consensus",
    "Review": "Review", "Clinical Trial": "CT", "Observational Study": "Obs",
    "Comparative Study": "Comp", "Multicenter Study": "Multi",
}


def cmd_search(a):
    filters = build_filters(a)
    if a.mode == "similar":
        seeds = re.findall(r"\d{6,9}", a.query)
        if not seeds:
            sys.exit("Chế độ similar cần PMID bài gốc.")
        j = json.loads(eutils("elink.fcgi", {"dbfrom": "pubmed", "db": "pubmed", "linkname": "pubmed_pubmed",
                                              "cmd": "neighbor_score", "retmode": "json", "id": ",".join(seeds)}))
        linked = []
        for ls in j.get("linksets", []):
            for db in ls.get("linksetdbs", []):
                if db.get("linkname") == "pubmed_pubmed":
                    for l in db.get("links", []):
                        uid = str(l["id"] if isinstance(l, dict) else l)
                        if uid not in seeds and uid not in linked:
                            linked.append(uid)
        linked = linked[:300]
        if not linked:
            sys.exit("Không có bài tương tự.")
        term = "(" + " OR ".join(f"{u}[uid]" for u in linked) + ") AND " + " AND ".join(filters)
    else:
        term = f"({build_core(a)}) AND " + " AND ".join(filters)
    retmax = len(linked) if a.mode == "similar" else a.max
    j = json.loads(eutils("esearch.fcgi", {"db": "pubmed", "term": term, "retmax": str(retmax),
                                            "retmode": "json", "sort": a.sort}))["esearchresult"]
    if j.get("ERROR"):
        sys.exit("PubMed: " + j["ERROR"])
    ids = j.get("idlist", [])
    if a.mode == "similar":   # giữ thứ tự theo điểm tương đồng như Apps Script v5
        ok = set(ids)
        ids = [u for u in linked if u in ok][:a.max]
    nf = (j.get("errorlist") or {}).get("phrasesnotfound") or []
    print(f"# Tổng trên PubMed: {j.get('count')} · lấy {len(ids)} · truy vấn: {j.get('querytranslation', term)}")
    if nf:
        print(f"# CẢNH BÁO: PubMed không nhận diện được cụm: {', '.join(nf)}")
    if not ids:
        return
    have = in_kho()
    s = summaries(ids)
    print("# ★ = đã có trong kho · PMC = có toàn văn miễn phí")
    print("PMID | Năm | Loại | Tạp chí | Tiêu đề")
    for uid in ids:
        r = s.get(uid, {})
        pts = [SHORT_PT[p] for p in r.get("pubtype", []) if p in SHORT_PT]
        pmc = any(x.get("idtype") == "pmc" for x in r.get("articleids", []))
        mark = "★" if uid in have else " "
        title = r.get("title", "")
        if len(title) > 140:
            title = title[:137] + "..."
        yr = (r.get("pubdate") or "")[:4]
        print(f"{mark}{uid} | {yr} | {','.join(dict.fromkeys(pts)) or '-'}{' PMC' if pmc else ''} | {r.get('source', '')} | {title}")


def text(el):
    return "".join(el.itertext()).strip() if el is not None else ""


def parse_article(el):
    mc = el.find("MedlineCitation")
    art = mc.find("Article")
    j = art.find("Journal")
    ji = j.find("JournalIssue") if j is not None else None
    pd = ji.find("PubDate") if ji is not None else None
    year = text(pd.find("Year")) if pd is not None and pd.find("Year") is not None else (text(pd.find("MedlineDate"))[:4] if pd is not None else "")
    ids = {a.get("IdType"): text(a) for a in el.findall("PubmedData/ArticleIdList/ArticleId")}
    authors = []
    for au in art.findall("AuthorList/Author"):
        last, ini, coll = text(au.find("LastName")), text(au.find("Initials")), text(au.find("CollectiveName"))
        affs = [text(x) for x in au.findall("AffiliationInfo/Affiliation")]
        authors.append({"name": f"{last} {ini}".strip() or coll, "affs": affs})
    abst = []
    for p in art.findall("Abstract/AbstractText"):
        lab = p.get("Label")
        abst.append((lab + ": " if lab else "") + text(p))
    coi = sorted({a["name"] for a in authors for af in a["affs"] if COI_RE.search(af)})
    return {
        "pmid": text(mc.find("PMID")),
        "title": text(art.find("ArticleTitle")),
        "journal": text(j.find("ISOAbbreviation")) if j is not None else "",
        "year": year,
        "volume": text(ji.find("Volume")) if ji is not None else "",
        "issue": text(ji.find("Issue")) if ji is not None else "",
        "pages": text(art.find("Pagination/MedlinePgn")),
        "authors": authors,
        "pubtypes": [text(x) for x in art.findall("PublicationTypeList/PublicationType")],
        "doi": ids.get("doi", ""),
        "pmc": ids.get("pmc", ""),
        "abstract": "\n".join(abst),
        "coi_hint": coi,
        "fetched": time.strftime("%Y-%m-%d"),
    }


def citation(r):
    names = [a["name"] for a in r["authors"]]
    au = ", ".join(names[:3]) + (", và cs." if len(names) > 3 else ".") if names else ""
    vol = r["volume"] + (f"({r['issue']})" if r["issue"] else "")
    loc = f"{r['year']};{vol}:{r['pages']}" if vol else r["year"]
    return f"{au} {r['title'].rstrip('.')}. {r['journal']}. {loc}.".replace("..", ".")


def cmd_fetch(a):
    os.makedirs(CACHE, exist_ok=True)
    ids = [x for x in a.pmids if x.isdigit()]
    todo = [i for i in ids if a.refresh or not os.path.isfile(os.path.join(CACHE, f"{i}.json"))]
    for i in range(0, len(todo), 200):
        root = ET.fromstring(eutils("efetch.fcgi", {"db": "pubmed", "id": ",".join(todo[i:i + 200]), "retmode": "xml"}))
        for el in root.findall("PubmedArticle"):
            r = parse_article(el)
            json.dump(r, open(os.path.join(CACHE, f"{r['pmid']}.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    have = in_kho()
    for pid in ids:
        p = os.path.join(CACHE, f"{pid}.json")
        if not os.path.isfile(p):
            print(f"## {pid}: KHÔNG tìm thấy trên PubMed\n")
            continue
        r = json.load(open(p, encoding="utf-8"))
        if a.json:
            print(json.dumps(r, ensure_ascii=False, indent=1))
            continue
        link = f"https://doi.org/{r['doi']}" if r["doi"] else f"https://pubmed.ncbi.nlm.nih.gov/{pid}/"
        print(f"## {pid}{' ★ đã có trong kho' if pid in have else ''}")
        print(citation(r))
        print(f"PMID: {pid}" + (f" · {r['pmc']}" if r["pmc"] else "") + f" · {link}")
        print("Loại bài: " + "; ".join(r["pubtypes"]))
        print("Gợi ý xung đột lợi ích (affiliation công ty): " + (", ".join(r["coi_hint"]) or "không thấy"))
        print(f"Tra ngày: {r['fetched']} · Abstract: {len(r['abstract'])} ký tự" + ("" if r["abstract"] else " (KHÔNG có abstract)"))
        if a.abstract:
            print(r["abstract"])
        print()


def cmd_sheet(a):
    files = sorted(glob.glob(os.path.join(SHEET_DIR, "*.csv")))
    if not files:
        sys.exit(f"Chưa có CSV xuất từ Google Sheet trong {SHEET_DIR}")
    terms = [t.lower() for t in a.terms]
    have = in_kho()
    print("# Dữ liệu là tóm tắt AI từ Google Sheet, CHƯA kiểm chứng. Phải fetch lại PMID trước khi trích.")
    print("PMID | Tab | Thiết kế | Cỡ mẫu | Kết luận (AI)")
    seen = set()
    for f in files:
        tab = os.path.basename(f)[:-4]
        lines = (l.replace("\0", "") for l in open(f, encoding="utf-8-sig", errors="replace"))
        for row in csv.DictReader(lines):
            blob = " ".join(row.values()).lower()
            pid = (row.get("PMID") or "").strip()
            if not pid or (pid, tab) in seen or not all(t in blob for t in terms):
                continue
            seen.add((pid, tab))
            concl = (row.get("Kết luận (AI)") or row.get("Kết quả (AI)") or "").replace("\n", " ")
            mark = "★" if pid in have else " "
            print(f"{mark}{pid} | {tab} | {(row.get('Thiết kế nghiên cứu') or '-')[:50]} | "
                  f"{(row.get('Cỡ mẫu') or '-')[:30]} | {concl[:160]}")


def cmd_seed(a):
    url, token = ENV.get("N8N_SEED_URL"), ENV.get("N8N_SEED_TOKEN")
    if not url or not token:
        sys.exit("Chưa cấu hình N8N_SEED_URL / N8N_SEED_TOKEN trong .env. Dùng lệnh search thay thế.")
    body = {"topic": a.topic, "query": a.query, "max": a.max, "add_to_sheet": not a.no_sheet}
    if a.type:
        body["types"] = a.type
    if a.year_from:
        body["year_from"] = a.year_from
    if a.year_to:
        body["year_to"] = a.year_to
    req = urllib.request.Request(url, data=json.dumps(body).encode(), method="POST",
                                 headers={"Content-Type": "application/json", "X-Kit-Token": token})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            j = json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        sys.exit(f"n8n trả lỗi {e.code}: {e.read()[:300]!r}")
    except urllib.error.URLError as e:
        sys.exit(f"Không gọi được n8n ({e.reason}). Máy chạy n8n có đang bật và cùng mạng không? Dùng lệnh search thay thế.")
    if isinstance(j, list):
        j = j[0] if j else {}
    print(f"# Chủ đề: {j.get('topic')} · tổng trên PubMed: {j.get('total')} · trả về {j.get('returned')}")
    print(f"# Truy vấn: {j.get('query_translation')}")
    if j.get("warnings"):
        print(f"# CẢNH BÁO: PubMed không nhận diện được cụm: {', '.join(j['warnings'])}")
    print("# Đã thêm dòng Active vào Config của Sheet Da Liễu (Apps Script tóm tắt AI và đưa sang NotebookLM ở lượt chạy sau)"
          if j.get("added_to_sheet_config") else "# Không thêm vào Sheet")
    have = in_kho()
    print("PMID | Năm | Loại | Tạp chí | Tiêu đề")
    for r in j.get("articles", []):
        t = r.get("title", "")
        t = t[:137] + "..." if len(t) > 140 else t
        mark = "★" if r.get("pmid") in have else " "
        print(f"{mark}{r.get('pmid')} | {r.get('year')} | {r.get('types') or '-'}{' PMC' if r.get('pmc') else ''} | "
              f"{r.get('journal')} | {t}")


def cmd_fulltext(a):
    """Tải toàn văn PMC ra file text, giữ tiêu đề mục và bảng, in giấy phép. Bài không có trên PMC thì báo và thoát 3."""
    root = ET.fromstring(eutils("efetch.fcgi", {"db": "pubmed", "id": a.pmid, "retmode": "xml"}))
    el = root.find("PubmedArticle")
    r = parse_article(el) if el is not None else {}
    if not r.get("pmc"):
        print(f"{a.pmid}: không có toàn văn trên PMC")
        sys.exit(3)
    art = ET.fromstring(eutils("efetch.fcgi", {"db": "pmc", "id": r["pmc"], "rettype": "xml"})).find(".//article")
    body = art.find("body") if art is not None else None
    if body is None:
        print(f"{a.pmid}: PMC không trả phần thân bài")
        sys.exit(3)

    def clean(node):
        return " ".join("".join(node.itertext()).split())

    def walk(node, level, out):
        for ch in node:
            if ch.tag == "sec":
                walk(ch, level + 1, out)
            elif ch.tag == "title":
                out.append("\n" + "#" * min(level, 4) + " " + clean(ch))
            elif ch.tag == "p":
                for sub_sec in ch.findall(".//table-wrap"):
                    tables.append(sub_sec)
                out.append(clean(ch))
            elif ch.tag == "table-wrap":
                tables.append(ch)
            elif ch.tag == "fig":
                out.append("[Hình] " + clean(ch))

    tables, out = [], []
    walk(body, 1, out)
    for tw in art.findall(".//table-wrap"):
        if tw not in tables:
            tables.append(tw)
    out.append("\n# Bảng")
    for tw in tables:
        label = clean(tw.find("label")) if tw.find("label") is not None else "Bảng"
        cap = clean(tw.find("caption")) if tw.find("caption") is not None else ""
        out.append(f"\n## {label}: {cap}")
        for row in tw.iter("tr"):
            out.append(" | ".join(clean(c) for c in row))
        foot = tw.find("table-wrap-foot")
        if foot is not None:
            out.append("Ghi chú: " + clean(foot))
    lic = art.find(".//license")
    license_text = clean(lic) if lic is not None else "không ghi"
    coi = art.findall(".//*[@notes-type='COI-statement']") + art.findall(".//*[@sec-type='COI-statement']") + art.findall(".//conflict")
    fund = art.findall(".//funding-statement") + art.findall(".//funding-group")
    head = [citation(r), f"PMID: {a.pmid} · {r['pmc']} · tra ngày {time.strftime('%Y-%m-%d')}", "Giấy phép: " + license_text,
            "Xung đột lợi ích: " + (" ".join(clean(x) for x in coi) or "không thấy trong XML"),
            "Tài trợ: " + (" ".join(clean(x) for x in fund) or "không thấy trong XML"), "", "# Abstract", r["abstract"], ""]
    text_out = "\n".join(head + out) + "\n"
    with open(a.out, "w", encoding="utf-8") as f:
        f.write(text_out)
    print(f"{a.pmid}: {len(text_out.split())} từ, {len(tables)} bảng -> {a.out}\nGiấy phép: {license_text[:150]}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("search")
    s.add_argument("query")
    s.add_argument("--type", default="")
    s.add_argument("--from", dest="year_from", default="")
    s.add_argument("--to", dest="year_to", default="")
    s.add_argument("--max", type=int, default=20)
    s.add_argument("--mode", choices=["keyword", "sr", "mesh", "advanced", "similar"], default="keyword")
    s.add_argument("--sort", choices=["relevance", "pub_date"], default="relevance")
    s.add_argument("--extra", default="")
    f = sub.add_parser("fetch")
    f.add_argument("pmids", nargs="+")
    f.add_argument("--abstract", action="store_true")
    f.add_argument("--json", action="store_true")
    f.add_argument("--refresh", action="store_true")
    u = sub.add_parser("fulltext")
    u.add_argument("pmid")
    u.add_argument("--out", required=True)
    h = sub.add_parser("sheet")
    h.add_argument("terms", nargs="+")
    d = sub.add_parser("seed")
    d.add_argument("topic", help="tên tab trong Sheet Da Liễu, ví dụ 'Laser picosecond'")
    d.add_argument("query")
    d.add_argument("--type", default="")
    d.add_argument("--from", dest="year_from", default="")
    d.add_argument("--to", dest="year_to", default="")
    d.add_argument("--max", type=int, default=30)
    d.add_argument("--no-sheet", action="store_true", help="chỉ tra cứu, không thêm chủ đề vào Config")
    a = ap.parse_args()
    {"search": cmd_search, "fetch": cmd_fetch, "fulltext": cmd_fulltext, "sheet": cmd_sheet, "seed": cmd_seed}[a.cmd](a)


if __name__ == "__main__":
    main()
