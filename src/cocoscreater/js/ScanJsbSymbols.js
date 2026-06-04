// ScanJsbSymbols.js

console.log("========== Scan JSB Symbols / Strings ==========");

// =========================
// 配置区
// =========================

// 是否跳过系统库
const SKIP_SYSTEM = true;

// 是否跳过 /dev/binder /dev/kgsl 等设备映射
const SKIP_DEV_MAPPING = true;

// 是否只扫描非系统 so / apk / 匿名内存
const ONLY_INTERESTING_FILE = true;

// 单个 range 最大扫描大小
const MAX_RANGE_SIZE = 0x2000000; // 32MB

// 每个关键词最多打印多少个内存命中
const MAX_HITS_PER_KEYWORD = 80;

// 每个符号关键词最多打印多少个命中
const MAX_SYMBOL_HITS = 300;

// 扫描 chunk 大小
const SCAN_CHUNK_SIZE = 0x40000; // 256KB

// 是否扫描匿名内存
// 如果你想找运行时解密出来的 JSB 字符串，可以 true
const SCAN_ANON = true;

// 是否扫描 r-x 段
// 字符串一般在 r-- / rw-，r-x 可以先 false
const SCAN_EXEC = false;

// 关键词
const KEYWORDS = [
    "jsb",
    "JSB",
    "jsb_",
    "_jsb",
    "register_all",
    "register_all_",
    "ScriptingCore",
    "ScriptEngine",
    "se::ScriptEngine",
    "se::Object",
    "se::Value",
    "cocos2d::",
    "cc._RF.push",
    "cc.Class",
    "window.__require"
];

// 重点符号关键词
const SYMBOL_KEYWORDS = [
    "jsb",
    "JSB",
    "register_all",
    "ScriptingCore",
    "ScriptEngine",
    "se::",
    "Java_org_cocos2dx",
    "cocos2d"
];


// =========================
// 工具函数
// =========================

function addrToNum(p) {
    return parseInt(p.toString(), 16);
}

function fmtSize(n) {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let v = Number(n);
    let i = 0;

    while (v >= 1024 && i < units.length - 1) {
        v /= 1024;
        i++;
    }

    return v.toFixed(2) + units[i];
}

function strToHexPattern(s) {
    const arr = [];

    for (let i = 0; i < s.length; i++) {
        let h = s.charCodeAt(i).toString(16);
        if (h.length < 2) h = "0" + h;
        arr.push(h);
    }

    return arr.join(" ");
}

function isReadableProt(prot) {
    return prot.indexOf("r") >= 0;
}

function isExecProt(prot) {
    return prot.indexOf("x") >= 0;
}

function safeReadAsciiAround(addr, rangeBase, rangeSize) {
    try {
        const before = 64;
        const after = 192;

        const baseNum = addrToNum(rangeBase);
        const addrNum = addrToNum(addr);
        const rangeEnd = baseNum + rangeSize;

        let startNum = addrNum - before;
        if (startNum < baseNum) startNum = baseNum;

        let endNum = addrNum + after;
        if (endNum > rangeEnd) endNum = rangeEnd;

        const start = ptr(startNum);
        const size = endNum - startNum;

        if (size <= 0) return "";

        const data = Memory.readByteArray(start, size);
        if (data === null) return "";

        const u8 = new Uint8Array(data);
        let s = "";

        for (let i = 0; i < u8.length; i++) {
            const c = u8[i];

            if (c >= 0x20 && c <= 0x7e) {
                s += String.fromCharCode(c);
            } else if (c === 0x00) {
                s += "\\0";
            } else if (c === 0x0a) {
                s += "\\n";
            } else if (c === 0x0d) {
                s += "\\r";
            } else if (c === 0x09) {
                s += "\\t";
            } else {
                s += ".";
            }
        }

        if (s.length > 300) {
            s = s.substring(0, 300);
        }

        return s;

    } catch (e) {
        return "";
    }
}

function shouldSkipFilePath(file) {
    if (file === "") {
        return !SCAN_ANON;
    }

    if (SKIP_DEV_MAPPING) {
        if (file.indexOf("/dev/") === 0) return true;
        if (file.indexOf("anon_inode:") >= 0) return true;
    }

    if (SKIP_SYSTEM) {
        if (file.indexOf("/system/") >= 0) return true;
        if (file.indexOf("/apex/") >= 0) return true;
        if (file.indexOf("/vendor/") >= 0) return true;
        if (file.indexOf("/proc/") >= 0) return true;
        if (file.indexOf("/sys/") >= 0) return true;
    }

    if (ONLY_INTERESTING_FILE) {
        if (file === "") return false;
        if (file.endsWith(".so")) return false;
        if (file.endsWith(".apk")) return false;
        if (file.indexOf("/data/app/") >= 0) return false;
        if (file.indexOf("/data/data/") >= 0) return false;
        if (file.indexOf("/sdcard/") >= 0) return false;

        return true;
    }

    return false;
}

function shouldSkipRange(r) {
    const file = r.file ? r.file.path : "";

    if (!isReadableProt(r.protection)) return true;

    if (!SCAN_EXEC && isExecProt(r.protection)) {
        return true;
    }

    if (r.size <= 0) return true;

    if (r.size > MAX_RANGE_SIZE) {
        console.log(
            "[skip large range] base=" + r.base +
            " size=" + fmtSize(r.size) +
            " prot=" + r.protection +
            " file=" + file
        );
        return true;
    }

    if (shouldSkipFilePath(file)) {
        return true;
    }

    return false;
}

function hasKeyword(name, keywords) {
    if (!name) return false;

    for (let i = 0; i < keywords.length; i++) {
        if (name.indexOf(keywords[i]) >= 0) {
            return keywords[i];
        }
    }

    return null;
}


// =========================
// 1. 扫模块 exports / symbols
// =========================

function enumerateExportsSafe(m) {
    try {
        if (typeof m.enumerateExports === "function") {
            return m.enumerateExports();
        }
    } catch (e) {
    }

    try {
        if (typeof Module.enumerateExports === "function") {
            return Module.enumerateExports(m.name);
        }
    } catch (e) {
    }

    return [];
}

function enumerateSymbolsSafe(m) {
    try {
        if (typeof m.enumerateSymbols === "function") {
            return m.enumerateSymbols();
        }
    } catch (e) {
    }

    try {
        if (typeof Module.enumerateSymbols === "function") {
            return Module.enumerateSymbols(m.name);
        }
    } catch (e) {
    }

    return [];
}

function scanModuleSymbols() {
    console.log("\n========== Scan Module Exports / Symbols ==========");

    const modules = Process.enumerateModules();
    let exportHitCount = 0;
    let symbolHitCount = 0;

    send({
        type: "symbol_scan_start",
        module_count: modules.length
    });

    modules.forEach(m => {
        const path = m.path || "";

        if (shouldSkipFilePath(path)) {
            return;
        }

        // exports
        const exports = enumerateExportsSafe(m);

        for (let i = 0; i < exports.length; i++) {
            const e = exports[i];
            const k = hasKeyword(e.name, SYMBOL_KEYWORDS);

            if (k) {
                exportHitCount++;

                const item = {
                    type: "export_hit",
                    keyword: k,
                    module: m.name,
                    path: path,
                    name: e.name,
                    address: e.address ? e.address.toString() : "",
                    export_type: e.type || ""
                };

                console.log(
                    "[export] " +
                    "kw=" + k +
                    " module=" + m.name +
                    " addr=" + item.address +
                    " name=" + e.name
                );

                send(item);

                if (exportHitCount >= MAX_SYMBOL_HITS) {
                    break;
                }
            }
        }

        // symbols
        const symbols = enumerateSymbolsSafe(m);

        for (let i = 0; i < symbols.length; i++) {
            const s = symbols[i];
            const k = hasKeyword(s.name, SYMBOL_KEYWORDS);

            if (k) {
                symbolHitCount++;

                const item = {
                    type: "symbol_hit",
                    keyword: k,
                    module: m.name,
                    path: path,
                    name: s.name,
                    address: s.address ? s.address.toString() : "",
                    symbol_type: s.type || "",
                    section: s.section ? s.section.id || "" : ""
                };

                console.log(
                    "[symbol] " +
                    "kw=" + k +
                    " module=" + m.name +
                    " addr=" + item.address +
                    " name=" + s.name
                );

                send(item);

                if (symbolHitCount >= MAX_SYMBOL_HITS) {
                    break;
                }
            }
        }
    });

    send({
        type: "symbol_scan_done",
        export_hits: exportHitCount,
        symbol_hits: symbolHitCount
    });

    console.log("[+] export hits = " + exportHitCount);
    console.log("[+] symbol hits = " + symbolHitCount);
}


// =========================
// 2. 扫内存字符串
// =========================

function collectScanRanges() {
    const prots = ["r--", "rw-", "r-x", "rwx"];
    const seen = {};
    const result = [];

    prots.forEach(prot => {
        let ranges = [];

        try {
            ranges = Process.enumerateRanges({
                protection: prot,
                coalesce: false
            });
        } catch (e) {
            console.log("[-] enumerateRanges failed: " + prot + " " + e);
            return;
        }

        ranges.forEach(r => {
            const file = r.file ? r.file.path : "";
            const key = r.base + "-" + r.size + "-" + r.protection + "-" + file;

            if (seen[key]) return;
            seen[key] = true;

            if (shouldSkipRange(r)) return;

            result.push(r);
        });
    });

    result.sort((a, b) => addrToNum(a.base) - addrToNum(b.base));

    return result;
}

function scanOneKeyword(keyword, ranges) {
    const pattern = strToHexPattern(keyword);

    let hitCount = 0;
    let scannedBytes = 0;
    let lastProgress = Date.now();

    console.log("\n========== Scan keyword: " + keyword + " ==========");
    console.log("[pattern] " + pattern);

    send({
        type: "keyword_start",
        keyword: keyword,
        pattern: pattern,
        range_count: ranges.length
    });

    for (let ri = 0; ri < ranges.length; ri++) {
        const r = ranges[ri];
        const file = r.file ? r.file.path : "";

        let offset = 0;

        while (offset < r.size) {
            const chunkSize = Math.min(SCAN_CHUNK_SIZE, r.size - offset);
            const addr = r.base.add(offset);

            try {
                const hits = Memory.scanSync(addr, chunkSize, pattern);

                for (let hi = 0; hi < hits.length; hi++) {
                    const h = hits[hi];

                    hitCount++;

                    const around = safeReadAsciiAround(h.address, r.base, r.size);

                    const item = {
                        type: "memory_hit",
                        keyword: keyword,
                        address: h.address.toString(),
                        range_base: r.base.toString(),
                        range_size: r.size,
                        protection: r.protection,
                        file: file,
                        around: around
                    };

                    console.log(
                        "[mem hit] " +
                        "kw=" + keyword +
                        " addr=" + item.address +
                        " prot=" + r.protection +
                        " file=" + file +
                        " text=" + around
                    );

                    send(item);

                    if (hitCount >= MAX_HITS_PER_KEYWORD) {
                        send({
                            type: "keyword_done",
                            keyword: keyword,
                            hits: hitCount,
                            stopped: true
                        });

                        console.log("[+] keyword " + keyword + " hits >= limit, stop");
                        return hitCount;
                    }
                }

            } catch (e) {
                send({
                    type: "scan_error",
                    keyword: keyword,
                    address: addr.toString(),
                    size: chunkSize,
                    error: String(e),
                    file: file
                });
            }

            offset += chunkSize;
            scannedBytes += chunkSize;

            const now = Date.now();
            if (now - lastProgress >= 1000) {
                lastProgress = now;

                send({
                    type: "keyword_progress",
                    keyword: keyword,
                    range_index: ri,
                    range_count: ranges.length,
                    scanned_bytes: scannedBytes,
                    hits: hitCount
                });
            }
        }
    }

    send({
        type: "keyword_done",
        keyword: keyword,
        hits: hitCount,
        stopped: false
    });

    console.log("[+] keyword " + keyword + " hits = " + hitCount);

    return hitCount;
}

function scanMemoryStrings() {
    console.log("\n========== Scan Memory Strings ==========");

    const ranges = collectScanRanges();

    let totalSize = 0;

    ranges.forEach(r => {
        totalSize += r.size;
    });

    console.log("[+] scan ranges = " + ranges.length);
    console.log("[+] scan size   = " + fmtSize(totalSize));

    send({
        type: "memory_scan_start",
        range_count: ranges.length,
        total_size: totalSize,
        keywords: KEYWORDS
    });

    const summary = {};

    for (let i = 0; i < KEYWORDS.length; i++) {
        const kw = KEYWORDS[i];
        const count = scanOneKeyword(kw, ranges);
        summary[kw] = count;
    }

    send({
        type: "memory_scan_done",
        summary: summary
    });
}


// =========================
// main
// =========================

function main() {
    console.log("[*] start scan jsb symbols");

    send({
        type: "start",
        skip_system: SKIP_SYSTEM,
        skip_dev_mapping: SKIP_DEV_MAPPING,
        only_interesting_file: ONLY_INTERESTING_FILE,
        scan_anon: SCAN_ANON,
        scan_exec: SCAN_EXEC,
        max_range_size: MAX_RANGE_SIZE,
        scan_chunk_size: SCAN_CHUNK_SIZE
    });

    scanModuleSymbols();
    scanMemoryStrings();

    send({
        type: "done"
    });

    console.log("========== Scan JSB Symbols / Strings Done ==========");
}

setTimeout(main, 1000);