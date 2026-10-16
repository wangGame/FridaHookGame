'use strict';

const JY = [0x6a, 0x79, 0x63, 0x72, 0x79, 0x70, 0x74]; // jycrypt

// 改大，避免 4MB 截断
const MAX_JS_DUMP = 32 * 1024 * 1024;

const recentEncrypted = [];
const recentPaths = [];
const memRanges = [];

const assetPathMap = new Map();   // AAsset* -> path
const fdPathMap = new Map();      // fd -> path
const filePathMap = new Map();    // FILE* -> path

let jsIndex = 0;
let hitIndex = 0;
let decryptWatchIndex = 0;

const MAX_RANGES = 3000;
const MAX_RECENT_PATHS = 80;

// true = 重复内容也保存。
// false = 相同 hash 的 JS 只保存一次。
const SAVE_DUPLICATE_DECRYPTED_JS = true;
const dumpedJsHashSet = new Set();

// 观察解密时间，1000 * 10ms = 10 秒
const DECRYPT_WATCH_MAX_COUNT = 1000;

// ============================================================
// Android 本地落盘配置
// ============================================================

const DUMP_PACKAGE = "com.block.juggle";

// 你确认可以 adb pull 的目录
const DUMP_ROOT = "/storage/emulated/0/Android/data/com.block.juggle/files/frida_dex_dump";

// 解密后的 JS 放这里
const JS_DUMP_ROOT = DUMP_ROOT + "/decrypted_js";

const dumpOpenPtr =
    Module.findExportByName("libc.so", "open") ||
    Module.findExportByName(null, "open");

const dumpWritePtr =
    Module.findExportByName("libc.so", "write") ||
    Module.findExportByName(null, "write");

const dumpClosePtr =
    Module.findExportByName("libc.so", "close") ||
    Module.findExportByName(null, "close");

const dumpMkdirPtr =
    Module.findExportByName("libc.so", "mkdir") ||
    Module.findExportByName(null, "mkdir");

const dump_open = dumpOpenPtr
    ? new NativeFunction(dumpOpenPtr, "int", ["pointer", "int", "int"])
    : null;

const dump_write = dumpWritePtr
    ? new NativeFunction(dumpWritePtr, "int", ["int", "pointer", "int"])
    : null;

const dump_close = dumpClosePtr
    ? new NativeFunction(dumpClosePtr, "int", ["int"])
    : null;

const dump_mkdir = dumpMkdirPtr
    ? new NativeFunction(dumpMkdirPtr, "int", ["pointer", "int"])
    : null;

// O_WRONLY | O_CREAT | O_TRUNC
const DUMP_O_WRONLY_CREAT_TRUNC = 1 | 64 | 512;

// 0777 / 0666
const MODE_777 = 511;
const MODE_666 = 438;

function dumpMkdirOne(path) {
    try {
        if (!dump_mkdir) return;
        dump_mkdir(Memory.allocUtf8String(path), MODE_777);
    } catch (e) {}
}

function dumpMkdirs(path) {
    try {
        const parts = path.split("/");
        let cur = "";

        for (let i = 0; i < parts.length; i++) {
            if (parts[i].length === 0) continue;

            cur += "/" + parts[i];
            dumpMkdirOne(cur);
        }
    } catch (e) {
        console.log("[-] dumpMkdirs failed: " + e);
    }
}

function dumpSanitizeFileName(s) {
    if (!s) s = "unknown";

    s = s.split(" | ")[0];

    s = s.replace(/^\/+/, "");
    s = s.replace(/[\\/:*?"<>|\s]+/g, "_");
    s = s.replace(/\.jsc$/i, ".js");

    if (s.length > 180) {
        s = s.substring(s.length - 180);
    }

    if (s.length === 0) {
        s = "unknown";
    }

    if (!/\.js$/i.test(s)) {
        s += ".js";
    }

    return s;
}

function dumpSanitizeReason(s) {
    if (!s) return "unknown";
    return s.replace(/[\\/:*?"<>|\s]+/g, "_");
}

function dumpPtrToAndroidFile(ptr, size, filePath) {
    try {
        if (!ptr || ptr.isNull()) return false;

        if (!dump_open || !dump_write || !dump_close) {
            console.log("[-] dump libc open/write/close not ready");
            return false;
        }

        const fd = dump_open(
            Memory.allocUtf8String(filePath),
            DUMP_O_WRONLY_CREAT_TRUNC,
            MODE_666
        );

        if (fd < 0) {
            console.log("[-] dump open failed: " + filePath + " fd=" + fd);
            return false;
        }

        let writtenTotal = 0;

        while (writtenTotal < size) {
            const remain = size - writtenTotal;
            const chunk = remain > 65536 ? 65536 : remain;

            const n = dump_write(fd, ptr.add(writtenTotal), chunk);

            if (n <= 0) {
                console.log("[-] dump write failed at " + writtenTotal + ", ret=" + n);
                break;
            }

            writtenTotal += n;
        }

        dump_close(fd);

        console.log("[+] dumped to android: " + filePath + " bytes=" + writtenTotal);
        return writtenTotal > 0;
    } catch (e) {
        console.log("[-] dumpPtrToAndroidFile failed: " + e);
        return false;
    }
}

function dumpCStringByteLen(ptr, maxLen) {
    try {
        const step = 4096;
        let total = 0;

        while (total < maxLen) {
            const n = Math.min(step, maxLen - total);
            const buf = ptr.add(total).readByteArray(n);
            if (!buf) break;

            const arr = new Uint8Array(buf);

            for (let i = 0; i < arr.length; i++) {
                if (arr[i] === 0) {
                    return total + i;
                }
            }

            total += n;
        }

        return total;
    } catch (e) {
        return 0;
    }
}

function dumpTextToAndroidFile(text, filePath) {
    try {
        const buf = Memory.allocUtf8String(text);
        const size = dumpCStringByteLen(buf, 1024 * 1024);
        return dumpPtrToAndroidFile(buf, size, filePath);
    } catch (e) {
        console.log("[-] dumpTextToAndroidFile failed: " + e);
        return false;
    }
}

function simpleHashPtr(ptr, size) {
    try {
        if (!ptr || ptr.isNull()) return "null";

        const max = Math.min(size, 1024 * 1024);
        const step = 4096;

        let h = 2166136261 >>> 0;
        let total = 0;

        while (total < max) {
            const n = Math.min(step, max - total);
            const buf = ptr.add(total).readByteArray(n);
            if (!buf) break;

            const arr = new Uint8Array(buf);

            for (let i = 0; i < arr.length; i++) {
                h ^= arr[i];
                h = Math.imul(h, 16777619) >>> 0;
            }

            total += n;
        }

        return size + "_" + h.toString(16);
    } catch (e) {
        return "hash_error_" + Date.now();
    }
}

// ============================================================
// 基础函数
// ============================================================

function safeReadCString(p) {
    try {
        if (!p || p.isNull()) return null;
        return p.readCString();
    } catch (e) {
        return null;
    }
}

function safeReadUtf8(p, maxLen) {
    try {
        if (!p || p.isNull()) return null;
        return p.readUtf8String(maxLen);
    } catch (e) {
        return null;
    }
}

// 只读少量 ASCII，用于判断 JS 开头。
// 比 readUtf8String 更稳，避免一次性读大块失败。
function safeReadAscii(p, maxLen) {
    try {
        if (!p || p.isNull()) return "";

        const buf = p.readByteArray(maxLen);
        if (!buf) return "";

        const arr = new Uint8Array(buf);
        let s = "";

        for (let i = 0; i < arr.length; i++) {
            const c = arr[i];

            if (c === 0) break;

            s += String.fromCharCode(c);
        }

        return s;
    } catch (e) {
        return "";
    }
}

function safeNum(v) {
    try {
        return v.toInt32();
    } catch (e) {}

    try {
        return parseInt(v.toString(), 10);
    } catch (e) {}

    return 0;
}

function rememberPath(path, source) {
    if (!path) return;

    recentPaths.push({
        path: path,
        source: source,
        time: Date.now()
    });

    while (recentPaths.length > MAX_RECENT_PATHS) {
        recentPaths.shift();
    }
}

function addMemRange(start, size, path, source) {
    try {
        if (!start || start.isNull()) return;
        if (!path) return;
        if (size <= 0) return;

        memRanges.push({
            start: start,
            end: start.add(size),
            size: size,
            path: path,
            source: source,
            time: Date.now()
        });

        while (memRanges.length > MAX_RANGES) {
            memRanges.shift();
        }
    } catch (e) {}
}

function findPathByPtr(p) {
    try {
        if (!p || p.isNull()) return null;

        for (let i = memRanges.length - 1; i >= 0; i--) {
            const r = memRanges[i];

            if (p.compare(r.start) >= 0 && p.compare(r.end) < 0) {
                const off = p.sub(r.start).toString(16);

                return r.path +
                    " | source=" + r.source +
                    " | range=" + r.start + "-" + r.end +
                    " | offset=0x" + off +
                    " | size=" + r.size;
            }
        }
    } catch (e) {}

    try {
        const now = Date.now();

        for (let i = recentPaths.length - 1; i >= 0; i--) {
            const item = recentPaths[i];

            if (now - item.time < 3000) {
                return item.path + " | source=" + item.source + " | fallback=recent_open";
            }
        }
    } catch (e) {}

    return null;
}

function skipJsPrefix(p) {
    try {
        let q = p;

        // UTF-8 BOM
        if (
            q.readU8() === 0xef &&
            q.add(1).readU8() === 0xbb &&
            q.add(2).readU8() === 0xbf
        ) {
            q = q.add(3);
        }

        for (let i = 0; i < 64; i++) {
            const c = q.readU8();

            // 空格 / \n / \r / \t
            if (c === 0x20 || c === 0x0a || c === 0x0d || c === 0x09) {
                q = q.add(1);
                continue;
            }

            break;
        }

        return q;
    } catch (e) {
        return p;
    }
}

function hasJycrypt(p) {
    try {
        if (!p || p.isNull()) return false;

        for (let i = 0; i < 7; i++) {
            if (p.add(i).readU8() !== JY[i]) return false;
        }

        return true;
    } catch (e) {
        return false;
    }
}

// 更强的 JS 明文识别。
// 避免把 request/content/wind.so 这种短字符串误判成 JS。
// 重点补充 !function / (() => / window.__require。
function looksJs(p) {
    try {
        if (!p || p.isNull()) return false;

        const q = skipJsPrefix(p);

        let t = safeReadAscii(q, 256);
        if (!t || t.length === 0) return false;

        t = t.replace(/^\s+/, "");
        if (t.length === 0) return false;

        // Cocos 大包
        if (t.indexOf("window.__require") === 0) return true;
        if (t.indexOf("window.__r") === 0) return true;

        // 常见 JS 包裹
        if (t.indexOf("(function") === 0) return true;
        if (t.indexOf("!function") === 0) return true;
        if (t.indexOf(";!function") === 0) return true;
        if (t.indexOf("(()=>") === 0) return true;
        if (t.indexOf("(()") === 0) return true;
        if (t.indexOf("(async") === 0) return true;

        // 普通 JS 开头
        if (t.indexOf("var ") === 0) return true;
        if (t.indexOf("let ") === 0) return true;
        if (t.indexOf("const ") === 0) return true;
        if (t.indexOf("function ") === 0) return true;
        if (t.indexOf("class ") === 0) return true;

        // 模块系统
        if (t.indexOf("module.exports") === 0) return true;
        if (t.indexOf("exports.") === 0) return true;
        if (t.indexOf("Object.defineProperty") === 0) return true;
        if (t.indexOf("require(") === 0) return true;
        if (t.indexOf("__require") === 0) return true;
        if (t.indexOf("System.register") === 0) return true;
        if (t.indexOf("define(") === 0) return true;

        // 全局对象
        if (t.indexOf("window.") === 0) return true;
        if (t.indexOf("window[") === 0) return true;
        if (t.indexOf("globalThis.") === 0) return true;
        if (t.indexOf("self.") === 0) return true;

        // Cocos 常见
        if (t.indexOf("cc.") === 0) return true;
        if (t.indexOf("cc._RF") === 0) return true;

        // use strict
        if (t.indexOf("\"use strict\"") === 0) return true;
        if (t.indexOf("'use strict'") === 0) return true;
        if (t.indexOf("\"use strict\";") === 0) return true;
        if (t.indexOf("'use strict';") === 0) return true;

        // ES module
        if (t.indexOf("import ") === 0) return true;
        if (t.indexOf("export ") === 0) return true;

        // 注释开头的 JS，前 256 字节里有明显 JS 结构
        if (t.indexOf("//") === 0 || t.indexOf("/*") === 0) {
            if (t.indexOf("function") >= 0) return true;
            if (t.indexOf("var ") >= 0) return true;
            if (t.indexOf("const ") >= 0) return true;
            if (t.indexOf("window.") >= 0) return true;
            if (t.indexOf("module.exports") >= 0) return true;
        }

        return false;
    } catch (e) {
        return false;
    }
}

function dumpHead(p, len) {
    try {
        return hexdump(p, {
            offset: 0,
            length: Math.min(len, 2048),
            header: false,
            ansi: false
        });
    } catch (e) {
        return "";
    }
}

function rangeInfo(addr) {
    try {
        const m = Process.findModuleByAddress(addr);

        if (m) {
            return m.name +
                " base=" + m.base +
                " offset=0x" + addr.sub(m.base).toString(16) +
                " addr=" + addr;
        }
    } catch (e) {}

    try {
        const r = Process.findRangeByAddress(addr);

        if (r) {
            return "range base=" + r.base +
                " size=0x" + r.size.toString(16) +
                " prot=" + r.protection +
                " file=" + JSON.stringify(r.file) +
                " offset=0x" + addr.sub(r.base).toString(16) +
                " addr=" + addr;
        }
    } catch (e) {}

    return addr + " unknown";
}

// ============================================================
// 保存解密后的 JS
// ============================================================

function sendJs(ptr, reason, caller) {
    return sendJsKnown(ptr, reason, caller, 0);
}

function sendJsKnown(ptr, reason, caller, knownSize) {
    try {
        if (!looksJs(ptr)) return;

        let dumpLen = 0;

        if (knownSize && knownSize > 0) {
            dumpLen = Math.min(knownSize, MAX_JS_DUMP);
        } else {
            dumpLen = dumpCStringByteLen(ptr, MAX_JS_DUMP);
        }

        if (dumpLen <= 0) return;

        // 太短的大多不是完整 JS
        if (dumpLen < 8) return;

        const idx = jsIndex++;
        const path = findPathByPtr(ptr);

        const hash = simpleHashPtr(ptr, dumpLen);

        if (!SAVE_DUPLICATE_DECRYPTED_JS) {
            if (dumpedJsHashSet.has(hash)) {
                console.log("[*] skip duplicate decrypted js hash=" + hash + " reason=" + reason);
                return;
            }

            dumpedJsHashSet.add(hash);
        }

        const preview = safeReadUtf8(ptr, Math.min(dumpLen, 2048)) || safeReadAscii(ptr, Math.min(dumpLen, 2048));

        console.log("\n========== JS PLAINTEXT DUMP ==========");
        console.log("index  = " + idx);
        console.log("reason = " + reason);
        console.log("caller = " + rangeInfo(caller));
        console.log("path   = " + (path || "UNKNOWN"));
        console.log("bytes  = " + dumpLen);
        console.log("hash   = " + hash);
        console.log("dump_root = " + JS_DUMP_ROOT);
        console.log("preview:");
        console.log(preview.substring(0, 600));

        dumpMkdirs(JS_DUMP_ROOT);

        const baseName = dumpSanitizeFileName(path || "unknown");
        const safeReason = dumpSanitizeReason(reason);

        const timeTag = Date.now();

        const outName =
            timeTag + "_" +
            idx + "_" +
            safeReason + "_" +
            hash + "_" +
            baseName;

        const outPath = JS_DUMP_ROOT + "/" + outName;

        const ok = dumpPtrToAndroidFile(ptr, dumpLen, outPath);

        const meta =
            "index  = " + idx + "\n" +
            "reason = " + reason + "\n" +
            "caller = " + rangeInfo(caller) + "\n" +
            "path   = " + (path || "UNKNOWN") + "\n" +
            "bytes  = " + dumpLen + "\n" +
            "hash   = " + hash + "\n" +
            "file   = " + outPath + "\n" +
            "dump_root = " + JS_DUMP_ROOT + "\n" +
            "preview = " + preview.substring(0, 300).replace(/\n/g, "\\n") + "\n";

        dumpTextToAndroidFile(meta, outPath + ".meta.txt");

        if (ok) {
            console.log("[+] saved decrypted js: " + outPath);
        } else {
            console.log("[-] save decrypted js failed: " + outPath);
        }

        try {
            send({
                type: "js_plaintext",
                index: idx,
                reason: reason,
                caller: rangeInfo(caller),
                path: path || "UNKNOWN",
                bytes: dumpLen,
                hash: hash,
                android_path: JS_DUMP_ROOT
            }, ptr.readByteArray(dumpLen));
        } catch (e) {
            console.log("[-] send js failed: " + e);
        }
    } catch (e) {
        console.log("[-] sendJsKnown failed: " + e);
    }
}

function rememberEncrypted(ptr, caller) {
    recentEncrypted.push({
        ptr: ptr,
        caller: caller,
        path: findPathByPtr(ptr),
        time: Date.now()
    });

    while (recentEncrypted.length > 20) {
        recentEncrypted.shift();
    }
}

function watchInplaceDecrypt(ptr, caller) {
    const watchId = decryptWatchIndex++;

    let count = 0;
    let dumped = false;

    console.log("[*] start decrypt watch #" + watchId + " ptr=" + ptr + " path=" + (findPathByPtr(ptr) || "UNKNOWN"));

    const timer = setInterval(function () {
        count++;

        try {
            // 情况 1：原始 ptr 直接变成 JS
            if (looksJs(ptr)) {
                console.log("\n========== INPLACE DECRYPT FOUND ==========");
                console.log("watch  = " + watchId);
                console.log("ptr    = " + ptr);
                console.log("path   = " + (findPathByPtr(ptr) || "UNKNOWN"));
                console.log("caller = " + rangeInfo(caller));

                sendJs(ptr, "inplace_ptr_watch_" + watchId, caller);
                dumped = true;
                clearInterval(timer);
                return;
            }

            // 情况 2：跳过 jycrypt 头
            const body = ptr.add(7);

            if (looksJs(body)) {
                console.log("\n========== INPLACE BODY DECRYPT FOUND ==========");
                console.log("watch  = " + watchId);
                console.log("ptr    = " + body);
                console.log("path   = " + (findPathByPtr(body) || "UNKNOWN"));
                console.log("caller = " + rangeInfo(caller));

                sendJs(body, "inplace_ptr_plus_7_watch_" + watchId, caller);
                dumped = true;
                clearInterval(timer);
                return;
            }

            // 情况 3：真实 JS 起点有小偏移
            for (let off = 1; off <= 64; off++) {
                const p = ptr.add(off);

                if (looksJs(p)) {
                    console.log("\n========== INPLACE OFFSET DECRYPT FOUND ==========");
                    console.log("watch  = " + watchId);
                    console.log("offset = " + off);
                    console.log("ptr    = " + p);
                    console.log("path   = " + (findPathByPtr(p) || "UNKNOWN"));
                    console.log("caller = " + rangeInfo(caller));

                    sendJs(p, "inplace_offset_" + off + "_watch_" + watchId, caller);
                    dumped = true;
                    clearInterval(timer);
                    return;
                }
            }
        } catch (e) {}

        if (count > DECRYPT_WATCH_MAX_COUNT) {
            if (!dumped) {
                console.log("[*] decrypt watch timeout #" + watchId + " ptr=" + ptr);
            }

            clearInterval(timer);
        }
    }, 10);
}

// ============================================================
// AAsset Hook
// ============================================================

function hookAAsset() {
    const openAddr =
        Module.findExportByName("libandroid.so", "AAssetManager_open") ||
        Module.findExportByName(null, "AAssetManager_open");

    const getBufferAddr =
        Module.findExportByName("libandroid.so", "AAsset_getBuffer") ||
        Module.findExportByName(null, "AAsset_getBuffer");

    const getLengthAddr =
        Module.findExportByName("libandroid.so", "AAsset_getLength") ||
        Module.findExportByName(null, "AAsset_getLength");

    const readAddr =
        Module.findExportByName("libandroid.so", "AAsset_read") ||
        Module.findExportByName(null, "AAsset_read");

    const closeAddr =
        Module.findExportByName("libandroid.so", "AAsset_close") ||
        Module.findExportByName(null, "AAsset_close");

    let AAsset_getLength = null;

    if (getLengthAddr) {
        try {
            AAsset_getLength = new NativeFunction(getLengthAddr, "long", ["pointer"]);
        } catch (e) {
            AAsset_getLength = null;
        }
    }

    if (openAddr) {
        Interceptor.attach(openAddr, {
            onEnter(args) {
                this.path = safeReadCString(args[1]);
            },
            onLeave(retval) {
                if (!retval || retval.isNull()) return;
                if (!this.path) return;

                assetPathMap.set(retval.toString(), this.path);
                rememberPath(this.path, "AAssetManager_open");

                console.log("[AAssetManager_open] asset=" + retval + " path=" + this.path);
            }
        });

        console.log("[+] hook AAssetManager_open");
    } else {
        console.log("[-] AAssetManager_open not found");
    }

    if (getBufferAddr) {
        Interceptor.attach(getBufferAddr, {
            onEnter(args) {
                this.asset = args[0];
                this.path = assetPathMap.get(this.asset.toString()) || null;
                this.caller = this.returnAddress;
            },
            onLeave(retval) {
                if (!retval || retval.isNull()) return;
                if (!this.path) return;

                let len = 0;

                try {
                    if (AAsset_getLength) {
                        len = safeNum(AAsset_getLength(this.asset));
                    }
                } catch (e) {
                    len = 0;
                }

                if (len > 0) {
                    addMemRange(retval, len, this.path, "AAsset_getBuffer");
                    console.log("[AAsset_getBuffer] path=" + this.path + " buf=" + retval + " len=" + len);

                    try {
                        if (hasJycrypt(retval)) {
                            console.log("[*] jycrypt asset buffer found by AAsset_getBuffer path=" + this.path + " ptr=" + retval);
                            rememberEncrypted(retval, this.caller || ptr(0));
                            watchInplaceDecrypt(retval, this.caller || ptr(0));
                        }

                        if (looksJs(retval)) {
                            sendJsKnown(retval, "AAsset_getBuffer_plain_js", this.caller || ptr(0), len);
                        }
                    } catch (e) {
                        console.log("[-] AAsset_getBuffer decrypt watch failed: " + e);
                    }
                }
            }
        });

        console.log("[+] hook AAsset_getBuffer");
    } else {
        console.log("[-] AAsset_getBuffer not found");
    }

    if (readAddr) {
        Interceptor.attach(readAddr, {
            onEnter(args) {
                this.asset = args[0];
                this.buf = args[1];
                this.count = safeNum(args[2]);
                this.path = assetPathMap.get(this.asset.toString()) || null;
                this.caller = this.returnAddress;
            },
            onLeave(retval) {
                const n = safeNum(retval);

                if (n <= 0) return;
                if (!this.path) return;

                addMemRange(this.buf, n, this.path, "AAsset_read");

                try {
                    if (hasJycrypt(this.buf)) {
                        console.log("[*] jycrypt asset buffer found by AAsset_read path=" + this.path + " ptr=" + this.buf + " len=" + n);
                        rememberEncrypted(this.buf, this.caller || ptr(0));
                        watchInplaceDecrypt(this.buf, this.caller || ptr(0));
                    }

                    if (looksJs(this.buf)) {
                        sendJsKnown(this.buf, "AAsset_read_plain_js", this.caller || ptr(0), n);
                    }
                } catch (e) {
                    console.log("[-] AAsset_read decrypt watch failed: " + e);
                }
            }
        });

        console.log("[+] hook AAsset_read");
    } else {
        console.log("[-] AAsset_read not found");
    }

    if (closeAddr) {
        Interceptor.attach(closeAddr, {
            onEnter(args) {
                const key = args[0].toString();
                const path = assetPathMap.get(key);

                if (path) {
                    assetPathMap.delete(key);
                }
            }
        });

        console.log("[+] hook AAsset_close");
    }
}

// ============================================================
// File API Hook：默认不开
// ============================================================

function hookFileApi() {
//    hookOpen("open", 0);
//    hookOpen("open64", 0);
//    hookOpen("openat", 1);
//    hookOpen("__openat", 1);
//
//    hookRead("read");
//    hookRead("pread");
//    hookRead("pread64");
//
//    hookFopen("fopen");
//    hookFopen("fopen64");
//    hookFread("fread");
//    hookFclose("fclose");
//
//    hookMmap("mmap");
//    hookMmap("mmap64");
}

function hookOpen(name, pathIndex) {
    const addr = Module.findExportByName("libc.so", name) || Module.findExportByName(null, name);

    if (!addr) return;

    Interceptor.attach(addr, {
        onEnter(args) {
            this.path = safeReadCString(args[pathIndex]);
        },
        onLeave(retval) {
            const fd = safeNum(retval);

            if (fd < 0) return;
            if (!this.path) return;

            fdPathMap.set(fd, this.path);
            rememberPath(this.path, name);

            console.log("[" + name + "] fd=" + fd + " path=" + this.path);
        }
    });

    console.log("[+] hook " + name);
}

function hookRead(name) {
    const addr = Module.findExportByName("libc.so", name) || Module.findExportByName(null, name);

    if (!addr) return;

    Interceptor.attach(addr, {
        onEnter(args) {
            this.fd = safeNum(args[0]);
            this.buf = args[1];
            this.path = fdPathMap.get(this.fd) || null;
            this.caller = this.returnAddress;
        },
        onLeave(retval) {
            const n = safeNum(retval);

            if (n <= 0) return;
            if (!this.path) return;

            addMemRange(this.buf, n, this.path, name);

            try {
                if (hasJycrypt(this.buf)) {
                    console.log("[*] jycrypt file buffer found by " + name + " path=" + this.path + " ptr=" + this.buf + " len=" + n);
                    rememberEncrypted(this.buf, this.caller || ptr(0));
                    watchInplaceDecrypt(this.buf, this.caller || ptr(0));
                }

                if (looksJs(this.buf)) {
                    sendJsKnown(this.buf, name + "_plain_js", this.caller || ptr(0), n);
                }
            } catch (e) {}
        }
    });

    console.log("[+] hook " + name);
}

function hookFopen(name) {
    const addr = Module.findExportByName("libc.so", name) || Module.findExportByName(null, name);

    if (!addr) return;

    Interceptor.attach(addr, {
        onEnter(args) {
            this.path = safeReadCString(args[0]);
        },
        onLeave(retval) {
            if (!retval || retval.isNull()) return;
            if (!this.path) return;

            filePathMap.set(retval.toString(), this.path);
            rememberPath(this.path, name);

            console.log("[" + name + "] FILE=" + retval + " path=" + this.path);
        }
    });

    console.log("[+] hook " + name);
}

function hookFread(name) {
    const addr = Module.findExportByName("libc.so", name) || Module.findExportByName(null, name);

    if (!addr) return;

    Interceptor.attach(addr, {
        onEnter(args) {
            this.ptr = args[0];
            this.size = safeNum(args[1]);
            this.nmemb = safeNum(args[2]);
            this.file = args[3];
            this.path = filePathMap.get(this.file.toString()) || null;
            this.caller = this.returnAddress;
        },
        onLeave(retval) {
            const count = safeNum(retval);
            const total = count * this.size;

            if (total <= 0) return;
            if (!this.path) return;

            addMemRange(this.ptr, total, this.path, name);

            try {
                if (hasJycrypt(this.ptr)) {
                    console.log("[*] jycrypt file buffer found by " + name + " path=" + this.path + " ptr=" + this.ptr + " len=" + total);
                    rememberEncrypted(this.ptr, this.caller || ptr(0));
                    watchInplaceDecrypt(this.ptr, this.caller || ptr(0));
                }

                if (looksJs(this.ptr)) {
                    sendJsKnown(this.ptr, name + "_plain_js", this.caller || ptr(0), total);
                }
            } catch (e) {}
        }
    });

    console.log("[+] hook " + name);
}

function hookFclose(name) {
    const addr = Module.findExportByName("libc.so", name) || Module.findExportByName(null, name);

    if (!addr) return;

    Interceptor.attach(addr, {
        onEnter(args) {
            const key = args[0].toString();

            if (filePathMap.has(key)) {
                filePathMap.delete(key);
            }
        }
    });

    console.log("[+] hook " + name);
}

function hookMmap(name) {
    const addr = Module.findExportByName("libc.so", name) || Module.findExportByName(null, name);

    if (!addr) return;

    Interceptor.attach(addr, {
        onEnter(args) {
            this.length = safeNum(args[1]);
            this.fd = safeNum(args[4]);
            this.path = fdPathMap.get(this.fd) || null;
            this.caller = this.returnAddress;
        },
        onLeave(retval) {
            if (!retval || retval.isNull()) return;
            if (retval.equals(ptr("-1"))) return;
            if (!this.path) return;
            if (this.length <= 0) return;

            addMemRange(retval, this.length, this.path, name);
            console.log("[" + name + "] path=" + this.path + " addr=" + retval + " len=" + this.length);

            try {
                if (hasJycrypt(retval)) {
                    console.log("[*] jycrypt mmap buffer found by " + name + " path=" + this.path + " ptr=" + retval + " len=" + this.length);
                    rememberEncrypted(retval, this.caller || ptr(0));
                    watchInplaceDecrypt(retval, this.caller || ptr(0));
                }

                if (looksJs(retval)) {
                    sendJsKnown(retval, name + "_plain_js", this.caller || ptr(0), this.length);
                }
            } catch (e) {}
        }
    });

    console.log("[+] hook " + name);
}

// ============================================================
// memcmp Hook
// ============================================================

function hookMemcmp() {
    const addr = Module.findExportByName("libc.so", "memcmp");

    if (!addr) {
        console.log("[-] memcmp not found");
        return;
    }

    Interceptor.attach(addr, {
        onEnter(args) {
            this.hit = false;

            let n = 0;

            try {
                n = args[2].toInt32();
            } catch (e) {
                return;
            }

            if (n !== 7 && n !== 8) return;

            const a = args[0];
            const b = args[1];

            const aJy = hasJycrypt(a);
            const bJy = hasJycrypt(b);

            const aJs = looksJs(a);
            const bJs = looksJs(b);

            if (!aJy && !bJy && !aJs && !bJs) return;

            this.hit = true;
            this.a = a;
            this.b = b;
            this.n = n;
            this.aJy = aJy;
            this.bJy = bJy;
            this.aJs = aJs;
            this.bJs = bJs;
            this.caller = this.returnAddress;
        },

        onLeave(retval) {
            if (!this.hit) return;

            const ret = retval.toInt32();
            const idx = hitIndex++;

            const pathA = findPathByPtr(this.a);
            const pathB = findPathByPtr(this.b);

            console.log("\n========== JYCRYPT MEMCMP ==========");
            console.log("index  = " + idx);
            console.log("caller = " + rangeInfo(this.caller));
            console.log("len    = " + this.n);
            console.log("ret    = " + ret);

            console.log("arg0   = " + this.a + " jy=" + this.aJy + " js=" + looksJs(this.a));
            console.log("path0  = " + (pathA || "UNKNOWN"));
            console.log(dumpHead(this.a, 10));

            console.log("arg1   = " + this.b + " jy=" + this.bJy + " js=" + looksJs(this.b));
            console.log("path1  = " + (pathB || "UNKNOWN"));
            console.log(dumpHead(this.b, 10));

            if (ret === 0) {
                const encPtr = this.aJy ? this.a : this.b;
                const encPath = findPathByPtr(encPtr);

                console.log(">>> ret=0，当前 buffer 可能是 jycrypt 密文或命中字符串");
                console.log(">>> encPtr = " + encPtr);
                console.log(">>> encPath = " + (encPath || "UNKNOWN"));
                console.log(">>> caller  = " + rangeInfo(this.caller));

                if (hasJycrypt(encPtr)) {
                    rememberEncrypted(encPtr, this.caller);
                    watchInplaceDecrypt(encPtr, this.caller);
                }
            }

            // 这里重新判断，不依赖 onEnter 的旧结果
            try {
                if (looksJs(this.a)) {
                    sendJs(this.a, "memcmp_arg0_js_ret_" + ret, this.caller);
                }
            } catch (e) {}

            try {
                if (looksJs(this.b)) {
                    sendJs(this.b, "memcmp_arg1_js_ret_" + ret, this.caller);
                }
            } catch (e) {}

            // 如果任意一边是 jycrypt，也启动观察
            try {
                if (hasJycrypt(this.a)) {
                    rememberEncrypted(this.a, this.caller);
                    watchInplaceDecrypt(this.a, this.caller);
                }
            } catch (e) {}

            try {
                if (hasJycrypt(this.b)) {
                    rememberEncrypted(this.b, this.caller);
                    watchInplaceDecrypt(this.b, this.caller);
                }
            } catch (e) {}
        }
    });

    console.log("[+] hook memcmp jycrypt stage2");
}

// ============================================================
// 启动
// ============================================================

setImmediate(function () {
    console.log("========== Hook JYCRYPT Stage2 + Export All Decrypted JS ==========");
    console.log("[*] dump root = " + DUMP_ROOT);
    console.log("[*] js dump root = " + JS_DUMP_ROOT);

    dumpMkdirs(DUMP_ROOT);
    dumpMkdirs(JS_DUMP_ROOT);

    const markerPath = DUMP_ROOT + "/_script_started.txt";

    const ok = dumpTextToAndroidFile(
        "script started\n" +
        "dump_root = " + DUMP_ROOT + "\n" +
        "js_dump_root = " + JS_DUMP_ROOT + "\n" +
        "time = " + Date.now() + "\n",
        markerPath
    );

    if (ok) {
        console.log("[+] wrote marker: " + markerPath);
    } else {
        console.log("[-] wrote marker failed: " + markerPath);
    }

    hookAAsset();
    hookFileApi();
    hookMemcmp();

    console.log("========== Hook Installed ==========");
});