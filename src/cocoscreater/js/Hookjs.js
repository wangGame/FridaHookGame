'use strict';

const JY = [0x6a, 0x79, 0x63, 0x72, 0x79, 0x70, 0x74]; // jycrypt

const MAX_JS_DUMP = 4 * 1024 * 1024;

const recentEncrypted = [];
const recentPaths = [];
const memRanges = [];

const assetPathMap = new Map();   // AAsset* -> path
const fdPathMap = new Map();      // fd -> path
const filePathMap = new Map();    // FILE* -> path

let jsIndex = 0;
let hitIndex = 0;

const MAX_RANGES = 3000;
const MAX_RECENT_PATHS = 80;

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
                    " | range=" + r.start + "-0x" + r.end.toString(16) +
                    " | offset=0x" + off +
                    " | size=" + r.size;
            }
        }
    } catch (e) {}

    // 兜底：有些 JS buffer 是拷贝出来的新内存，和文件 read buffer 不再是同一个地址。
    // 这种情况下只能给出最近打开的可疑路径。
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

function looksJs(p) {
    try {
        if (!p || p.isNull()) return false;

        const q = skipJsPrefix(p);

        const b0 = q.readU8();
        const b1 = q.add(1).readU8();
        const b2 = q.add(2).readU8();

        if (b0 === 0x28) return true; // (
        if (b0 === 0x2f && b1 === 0x2f) return true; // //
        if (b0 === 0x2f && b1 === 0x2a) return true; // /*
        if (b0 === 0x76 && b1 === 0x61 && b2 === 0x72) return true; // var
        if (b0 === 0x6c && b1 === 0x65 && b2 === 0x74) return true; // let
        if (b0 === 0x63 && b1 === 0x6f && b2 === 0x6e) return true; // con
        if (b0 === 0x77 && b1 === 0x69 && b2 === 0x6e) return true; // win
        if (b0 === 0x53 && b1 === 0x79 && b2 === 0x73) return true; // Sys
        if (b0 === 0x72 && b1 === 0x65 && b2 === 0x71) return true; // req
        if (b0 === 0x6d && b1 === 0x6f && b2 === 0x64) return true; // mod
        if (b0 === 0x22 || b0 === 0x27) return true; // " or '

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

function sendJs(ptr, reason, caller) {
    if (!looksJs(ptr)) return;

    const text = safeReadUtf8(ptr, MAX_JS_DUMP);
    if (!text || text.length < 20) return;

    const idx = jsIndex++;
    const dumpLen = Math.min(text.length, MAX_JS_DUMP);
    const path = findPathByPtr(ptr);

    console.log("\n========== JS PLAINTEXT DUMP ==========");
    console.log("index  = " + idx);
    console.log("reason = " + reason);
    console.log("caller = " + rangeInfo(caller));
    console.log("path   = " + (path || "UNKNOWN"));
    console.log("len    = " + text.length);
    console.log("preview:");
    console.log(text.substring(0, 600));

    try {
        send({
            type: "js_plaintext",
            index: idx,
            reason: reason,
            caller: rangeInfo(caller),
            path: path || "UNKNOWN",
            length: text.length
        }, ptr.readByteArray(dumpLen));
    } catch (e) {
        console.log("[-] send js failed: " + e);
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
    let count = 0;

    const timer = setInterval(function () {
        count++;

        try {
            if (looksJs(ptr)) {
                console.log("\n========== INPLACE DECRYPT FOUND ==========");
                console.log("ptr    = " + ptr);
                console.log("path   = " + (findPathByPtr(ptr) || "UNKNOWN"));
                console.log("caller = " + rangeInfo(caller));
                sendJs(ptr, "inplace_ptr", caller);
                clearInterval(timer);
                return;
            }

            const body = ptr.add(7);

            if (looksJs(body)) {
                console.log("\n========== INPLACE BODY DECRYPT FOUND ==========");
                console.log("ptr    = " + body);
                console.log("path   = " + (findPathByPtr(body) || "UNKNOWN"));
                console.log("caller = " + rangeInfo(caller));
                sendJs(body, "inplace_ptr_plus_7", caller);
                clearInterval(timer);
                return;
            }
        } catch (e) {}

        if (count > 100) {
            clearInterval(timer);
        }
    }, 10);
}

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
            },
            onLeave(retval) {
                const n = safeNum(retval);

                if (n <= 0) return;
                if (!this.path) return;

                addMemRange(this.buf, n, this.path, "AAsset_read");
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
        },
        onLeave(retval) {
            const n = safeNum(retval);

            if (n <= 0) return;
            if (!this.path) return;

            addMemRange(this.buf, n, this.path, name);
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
        },
        onLeave(retval) {
            const count = safeNum(retval);
            const total = count * this.size;

            if (total <= 0) return;
            if (!this.path) return;

            addMemRange(this.ptr, total, this.path, name);
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
        },
        onLeave(retval) {
            if (!retval || retval.isNull()) return;
            if (retval.equals(ptr("-1"))) return;
            if (!this.path) return;
            if (this.length <= 0) return;

            addMemRange(retval, this.length, this.path, name);
            console.log("[" + name + "] path=" + this.path + " addr=" + retval + " len=" + this.length);
        }
    });

    console.log("[+] hook " + name);
}

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

            console.log("arg0   = " + this.a + " jy=" + this.aJy + " js=" + this.aJs);
            console.log("path0  = " + (pathA || "UNKNOWN"));
            console.log(dumpHead(this.a, 2048));

            console.log("arg1   = " + this.b + " jy=" + this.bJy + " js=" + this.bJs);
            console.log("path1  = " + (pathB || "UNKNOWN"));
            console.log(dumpHead(this.b, 2048));

            if (ret === 0) {
                const encPtr = this.aJy ? this.a : this.b;
                const encPath = findPathByPtr(encPtr);

                console.log(">>> ret=0，当前 buffer 是 jycrypt 密文");
                console.log(">>> encPtr = " + encPtr);
                console.log(">>> encPath = " + (encPath || "UNKNOWN"));
                console.log(">>> caller  = " + rangeInfo(this.caller));

                rememberEncrypted(encPtr, this.caller);
                watchInplaceDecrypt(encPtr, this.caller);
            }

            if (this.aJs) {
                sendJs(this.a, "memcmp_arg0_js_ret_" + ret, this.caller);
            }

            if (this.bJs) {
                sendJs(this.b, "memcmp_arg1_js_ret_" + ret, this.caller);
            }
        }
    });

    console.log("[+] hook memcmp jycrypt stage2");
}

setImmediate(function () {
    console.log("========== Hook JYCRYPT Stage2 + Path Trace ==========");

    hookAAsset();
    hookFileApi();
    hookMemcmp();

    console.log("========== Hook Installed ==========");
});
//'use strict';
//
//const JY = [0x6a, 0x79, 0x63, 0x72, 0x79, 0x70, 0x74]; // jycrypt
//
//const MAX_JS_DUMP = 4 * 1024 * 1024;
//const recentEncrypted = [];
//let jsIndex = 0;
//let hitIndex = 0;
//
//function hasJycrypt(p) {
//    try {
//        if (!p || p.isNull()) return false;
//        for (let i = 0; i < 7; i++) {
//            if (p.add(i).readU8() !== JY[i]) return false;
//        }
//        return true;
//    } catch (e) {
//        return false;
//    }
//}
//
//function looksJs(p) {
//    try {
//        if (!p || p.isNull()) return false;
//
//        const b0 = p.readU8();
//        const b1 = p.add(1).readU8();
//        const b2 = p.add(2).readU8();
//
//        if (b0 === 0x28) return true; // (
//        if (b0 === 0x2f && b1 === 0x2f) return true; // //
//        if (b0 === 0x2f && b1 === 0x2a) return true; // /*
//        if (b0 === 0x76 && b1 === 0x61 && b2 === 0x72) return true; // var
//        if (b0 === 0x6c && b1 === 0x65 && b2 === 0x74) return true; // let
//        if (b0 === 0x63 && b1 === 0x6f && b2 === 0x6e) return true; // con
//        if (b0 === 0x77 && b1 === 0x69 && b2 === 0x6e) return true; // win
//        if (b0 === 0x53 && b1 === 0x79 && b2 === 0x73) return true; // Sys
//        if (b0 === 0x72 && b1 === 0x65 && b2 === 0x71) return true; // req
//        if (b0 === 0x22 || b0 === 0x27) return true; // " or '
//
//        return false;
//    } catch (e) {
//        return false;
//    }
//}
//
//function dumpHead(p, len) {
//    try {
//        return hexdump(p, {
//            offset: 0,
//            length: Math.min(len, 96),
//            header: false,
//            ansi: false
//        });
//    } catch (e) {
//        return "";
//    }
//}
//
//function rangeInfo(addr) {
//    try {
//        const m = Process.findModuleByAddress(addr);
//        if (m) {
//            return m.name +
//                " base=" + m.base +
//                " offset=0x" + addr.sub(m.base).toString(16) +
//                " addr=" + addr;
//        }
//    } catch (e) {}
//
//    try {
//        const r = Process.findRangeByAddress(addr);
//        if (r) {
//            return "range base=" + r.base +
//                " size=0x" + r.size.toString(16) +
//                " prot=" + r.protection +
//                " file=" + JSON.stringify(r.file) +
//                " offset=0x" + addr.sub(r.base).toString(16) +
//                " addr=" + addr;
//        }
//    } catch (e) {}
//
//    return addr + " unknown";
//}
//
//function safeReadUtf8(p, maxLen) {
//    try {
//        if (!p || p.isNull()) return null;
//        return p.readUtf8String(maxLen);
//    } catch (e) {
//        return null;
//    }
//}
//
//function sendJs(ptr, reason, caller) {
//    if (!looksJs(ptr)) return;
//
//    const text = safeReadUtf8(ptr, MAX_JS_DUMP);
//    if (!text || text.length < 20) return;
//
//    const idx = jsIndex++;
//    const dumpLen = Math.min(text.length, MAX_JS_DUMP);
//
//    console.log("\n========== JS PLAINTEXT DUMP ==========");
//    console.log("index  = " + idx);
//    console.log("reason = " + reason);
//    console.log("caller = " + rangeInfo(caller));
//    console.log("len    = " + text.length);
//    console.log("preview:");
//    console.log(text.substring(0, 600));
//
//    try {
//        send({
//            type: "js_plaintext",
//            index: idx,
//            reason: reason,
//            caller: rangeInfo(caller),
//            length: text.length
//        }, ptr.readByteArray(dumpLen));
//    } catch (e) {
//        console.log("[-] send js failed: " + e);
//    }
//}
//
//function rememberEncrypted(ptr, caller) {
//    recentEncrypted.push({
//        ptr: ptr,
//        caller: caller,
//        time: Date.now()
//    });
//
//    while (recentEncrypted.length > 20) {
//        recentEncrypted.shift();
//    }
//}
//
//function watchInplaceDecrypt(ptr, caller) {
//    let count = 0;
//
//    const timer = setInterval(function () {
//        count++;
//
//        try {
//            // 情况 1：原 buffer 直接变成 JS
//            if (looksJs(ptr)) {
//                console.log("\n========== INPLACE DECRYPT FOUND ==========");
//                console.log("ptr    = " + ptr);
//                console.log("caller = " + rangeInfo(caller));
//                sendJs(ptr, "inplace_ptr", caller);
//                clearInterval(timer);
//                return;
//            }
//
//            // 情况 2：跳过 jycrypt 头后的 body 变成 JS
//            const body = ptr.add(7);
//            if (looksJs(body)) {
//                console.log("\n========== INPLACE BODY DECRYPT FOUND ==========");
//                console.log("ptr    = " + body);
//                console.log("caller = " + rangeInfo(caller));
//                sendJs(body, "inplace_ptr_plus_7", caller);
//                clearInterval(timer);
//                return;
//            }
//        } catch (e) {}
//
//        // 最多观察大约 1 秒
//        if (count > 100) {
//            clearInterval(timer);
//        }
//    }, 10);
//}
//
//function hookMemcmp() {
//    const addr = Module.findExportByName("libc.so", "memcmp");
//    if (!addr) {
//        console.log("[-] memcmp not found");
//        return;
//    }
//
//    Interceptor.attach(addr, {
//        onEnter(args) {
//            this.hit = false;
//
//            let n = 0;
//            try {
//                n = args[2].toInt32();
//            } catch (e) {
//                return;
//            }
//
//            if (n !== 7 && n !== 8) return;
//
//            const a = args[0];
//            const b = args[1];
//
//            const aJy = hasJycrypt(a);
//            const bJy = hasJycrypt(b);
//
//            if (!aJy && !bJy) return;
//
//            this.hit = true;
//            this.a = a;
//            this.b = b;
//            this.n = n;
//            this.aJy = aJy;
//            this.bJy = bJy;
//            this.aJs = looksJs(a);
//            this.bJs = looksJs(b);
//            this.caller = this.returnAddress;
//        },
//
//        onLeave(retval) {
//            if (!this.hit) return;
//
//            const ret = retval.toInt32();
//            const idx = hitIndex++;
//
//            console.log("\n========== JYCRYPT MEMCMP ==========");
//            console.log("index  = " + idx);
//            console.log("caller = " + rangeInfo(this.caller));
//            console.log("len    = " + this.n);
//            console.log("ret    = " + ret);
//
//            console.log("arg0   = " + this.a + " jy=" + this.aJy + " js=" + this.aJs);
//            console.log(dumpHead(this.a, 2048));
//
//            console.log("arg1   = " + this.b + " jy=" + this.bJy + " js=" + this.bJs);
//            console.log(dumpHead(this.b, 2048));
//
//            // ret == 0：真正命中 jycrypt 加密脚本
//            if (ret === 0) {
//                const encPtr = this.aJy ? this.a : this.b;
//
//                console.log(">>> ret=0，当前 buffer 是 jycrypt 密文");
//                console.log(">>> encPtr = " + encPtr);
//                console.log(">>> check offset in IDA: libcocos2djs.so + 0x648ba4");
//
//                rememberEncrypted(encPtr, this.caller);
//                watchInplaceDecrypt(encPtr, this.caller);
//            }
//
//            // ret != 0，但参数已经是 JS，说明解密后/明文脚本进入执行链
//            if (this.aJs) {
//                sendJs(this.a, "memcmp_arg0_js_ret_" + ret, this.caller);
//            }
//
//            if (this.bJs) {
//                sendJs(this.b, "memcmp_arg1_js_ret_" + ret, this.caller);
//            }
//        }
//    });
//
//    console.log("[+] hook memcmp jycrypt stage2");
//}
//
//setImmediate(function () {
//    console.log("========== Hook JYCRYPT Stage2 ==========");
//    hookMemcmp();
//    console.log("========== Hook Installed ==========");
//});