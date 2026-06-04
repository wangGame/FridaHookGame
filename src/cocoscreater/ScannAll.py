import os
import json


# =========================
# 这里改参数
# =========================

DUMP_DIR = r"./memdump"

# 如果 ONLY_KEYWORDS 不为空，只扫描这里面的关键词
ONLY_KEYWORDS = [
    "System.register",
    "__require",
    ".jsc",
    ".js",
    ".ts",
    ".lvconf",
    "关卡配置文件",
    "关卡列表",
]

# 如果 ONLY_KEYWORDS 为空，则使用 DEFAULT_KEYWORDS + EXTRA_KEYWORDS
EXTRA_KEYWORDS = [
    "Block",
    "Level",
    "Config",
    "Game",
]

CONTEXT_SIZE = 256

MAX_HITS_PER_KEYWORD = 200

SCAN_UTF8 = True
SCAN_UTF16LE = True


DEFAULT_KEYWORDS = [
    # Cocos Creator 2.x
    "cc._RF.push",
    "cc._RF.pop",
    "window.__require",
    "__require",
    "module.exports",
    "exports.",

    # Cocos Creator 3.x
    "System.register",
    "_decorator",
    "ccclass",
    "property",
    "Component",
    "assetManager",
    "resources.load",

    # JS / TS / JSC
    ".jsc",
    ".js",
    ".ts",
    "src/",
    "assets/",
    "scripts/",
    "resources/",
    "bundle",

    # 资源 / 关卡
    ".lvconf",
    "关卡",
    "关卡列表",
    "关卡配置文件",
    "GLVRH4HEHKCY",
    "YDX1NUVSW5UB",
]


def iter_find(data: bytes, pattern: bytes):
    start = 0
    while True:
        pos = data.find(pattern, start)
        if pos < 0:
            break
        yield pos
        start = pos + 1


def safe_decode_utf8(data: bytes):
    return data.decode("utf-8", errors="replace")


def safe_decode_utf16le(data: bytes):
    if len(data) % 2 == 1:
        data = data[:-1]
    return data.decode("utf-16le", errors="replace")


def clean_text(s: str):
    s = s.replace("\x00", ".")
    s = s.replace("\r", "\\r")
    s = s.replace("\n", "\\n")
    s = s.replace("\t", "\\t")
    return s


def load_index(dump_dir):
    index_path = os.path.join(dump_dir, "index.json")
    with open(index_path, "r", encoding="utf-8") as f:
        return json.load(f)


def scan_file_for_keyword(bin_path, meta, keyword, encoding, pattern, context_size):
    hits = []

    with open(bin_path, "rb") as f:
        data = f.read()

    base = int(meta["base"], 16)

    for pos in iter_find(data, pattern):
        addr = base + pos

        start = max(0, pos - context_size)
        end = min(len(data), pos + len(pattern) + context_size)
        ctx = data[start:end]

        if encoding == "utf16le":
            text = safe_decode_utf16le(ctx)
        else:
            text = safe_decode_utf8(ctx)

        hits.append({
            "keyword": keyword,
            "encoding": encoding,
            "addr": "0x%x" % addr,
            "file_offset": "0x%x" % pos,
            "range_base": meta["base"],
            "range_end": meta["end"],
            "protection": meta.get("protection", ""),
            "mapped_file": meta.get("file", ""),
            "dump_file": meta.get("dump_file", ""),
            "context": clean_text(text),
        })

    return hits


def build_keywords():
    if ONLY_KEYWORDS:
        return ONLY_KEYWORDS

    keywords = list(DEFAULT_KEYWORDS)
    keywords.extend(EXTRA_KEYWORDS)
    return keywords


def build_patterns(keywords):
    patterns = []

    for kw in keywords:
        if SCAN_UTF8:
            patterns.append((kw, "utf8", kw.encode("utf-8", errors="ignore")))

        if SCAN_UTF16LE:
            patterns.append((kw, "utf16le", kw.encode("utf-16le", errors="ignore")))

    return patterns


def main():
    dump_dir = DUMP_DIR

    index = load_index(dump_dir)
    keywords = build_keywords()
    patterns = build_patterns(keywords)

    hits_txt_path = os.path.join(dump_dir, "hits.txt")
    hits_jsonl_path = os.path.join(dump_dir, "hits.jsonl")

    total_hits = 0
    hit_counter = {}

    print("[+] dump dir:", dump_dir)
    print("[+] keywords:", keywords)
    print("[+] scan utf8:", SCAN_UTF8)
    print("[+] scan utf16le:", SCAN_UTF16LE)

    with open(hits_txt_path, "w", encoding="utf-8") as txt, \
         open(hits_jsonl_path, "w", encoding="utf-8") as jsonl:

        ranges = index.get("ranges", [])
        print("[+] ranges:", len(ranges))

        for i, meta in enumerate(ranges):
            dump_file = meta.get("dump_file")
            if not dump_file:
                continue

            bin_path = os.path.join(dump_dir, dump_file)
            if not os.path.exists(bin_path):
                continue

            size = os.path.getsize(bin_path)
            mapped_file = meta.get("file", "")

            print(
                "[scan] %d/%d %s size=0x%x file=%s" %
                (i + 1, len(ranges), dump_file, size, mapped_file)
            )

            for kw, enc, pat in patterns:
                if not pat:
                    continue

                key = kw + "|" + enc

                if hit_counter.get(key, 0) >= MAX_HITS_PER_KEYWORD:
                    continue

                hits = scan_file_for_keyword(
                    bin_path=bin_path,
                    meta=meta,
                    keyword=kw,
                    encoding=enc,
                    pattern=pat,
                    context_size=CONTEXT_SIZE,
                )

                for h in hits:
                    if hit_counter.get(key, 0) >= MAX_HITS_PER_KEYWORD:
                        break

                    hit_counter[key] = hit_counter.get(key, 0) + 1
                    total_hits += 1

                    jsonl.write(json.dumps(h, ensure_ascii=False) + "\n")

                    txt.write("\n" + "=" * 80 + "\n")
                    txt.write("keyword     : %s\n" % h["keyword"])
                    txt.write("encoding    : %s\n" % h["encoding"])
                    txt.write("addr        : %s\n" % h["addr"])
                    txt.write("file_offset : %s\n" % h["file_offset"])
                    txt.write("range       : %s - %s\n" % (h["range_base"], h["range_end"]))
                    txt.write("protection  : %s\n" % h["protection"])
                    txt.write("mapped_file : %s\n" % h["mapped_file"])
                    txt.write("dump_file   : %s\n" % h["dump_file"])
                    txt.write("context:\n%s\n" % h["context"])

    print("[+] total hits:", total_hits)
    print("[+] txt :", hits_txt_path)
    print("[+] json:", hits_jsonl_path)


if __name__ == "__main__":
    main()