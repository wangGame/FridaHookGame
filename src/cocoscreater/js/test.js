//////////
//////////'use strict';
//////////
//////////Java.perform(function () {
//////////    const target = 'org.cocos2dx.javascript.AppActivity';
//////////
//////////    console.log('\n========== DUMP METHODS START ==========');
//////////    console.log('class = ' + target);
//////////
//////////    try {
//////////        const Cls = Java.use(target);
//////////        const klass = Cls.class;
//////////
//////////        console.log('\n----- Declared Methods 当前类自己声明的方法 -----');
//////////
//////////        const declaredMethods = klass.getDeclaredMethods();
//////////        for (let i = 0; i < declaredMethods.length; i++) {
//////////            const m = declaredMethods[i];
//////////
//////////            console.log('[DECLARED] ' + m.toString());
//////////
//////////            try {
//////////                console.log('    name = ' + m.getName());
//////////            } catch (e) {}
//////////
//////////            try {
//////////                console.log('    return = ' + m.getReturnType().getName());
//////////            } catch (e) {}
//////////
//////////            try {
//////////                const params = m.getParameterTypes();
//////////                let arr = [];
//////////                for (let j = 0; j < params.length; j++) {
//////////                    arr.push(params[j].getName());
//////////                }
//////////                console.log('    params = (' + arr.join(', ') + ')');
//////////            } catch (e) {}
//////////        }
//////////
//////////        console.log('\n----- Public Methods 包含父类继承的 public 方法 -----');
//////////
//////////        const publicMethods = klass.getMethods();
//////////        for (let i = 0; i < publicMethods.length; i++) {
//////////            const m = publicMethods[i];
//////////
//////////            console.log('[PUBLIC] ' + m.toString());
//////////
//////////            try {
//////////                console.log('    name = ' + m.getName());
//////////            } catch (e) {}
//////////        }
//////////
//////////        console.log('\n========== DUMP METHODS END ==========');
//////////        console.log('[+] declared method count = ' + declaredMethods.length);
//////////        console.log('[+] public method count = ' + publicMethods.length);
//////////
//////////    } catch (e) {
//////////        console.log('[-] failed: ' + e);
//////////    }
//////////});
////////
////////'use strict';
////////
////////const JY = [0x6a, 0x79, 0x63, 0x72, 0x79, 0x70, 0x74]; // jycrypt
////////
////////const MAX_JS_DUMP = 4 * 1024 * 1024;
////////
////////const recentEncrypted = [];
////////const recentPaths = [];
////////const memRanges = [];
////////
////////const assetPathMap = new Map();   // AAsset* -> path
////////const fdPathMap = new Map();      // fd -> path
////////const filePathMap = new Map();    // FILE* -> path
////////
////////let jsIndex = 0;
////////let hitIndex = 0;
////////
////////const MAX_RANGES = 3000;
////////const MAX_RECENT_PATHS = 80;
////////
////////// 如果你发现 AAsset 路径追踪不到，可以改成 true。
////////// 但有些游戏 hook open/read/mmap 会刷屏或者卡顿，所以默认关闭。
////////const ENABLE_FILE_API_HOOKS = false;
////////
////////// ================== Android 本地落盘配置 ==================
////////
////////const PACKAGE_NAME = Process.name.split(":")[0];
////////const DUMP_ROOT = "/data/data/" + PACKAGE_NAME + "/files/jy_dump";
////////
////////const openPtr =
////////    Module.findExportByName("libc.so", "open") ||
////////    Module.findExportByName(null, "open");
////////
////////const writePtr =
////////    Module.findExportByName("libc.so", "write") ||
////////    Module.findExportByName(null, "write");
////////
////////const closePtr =
////////    Module.findExportByName("libc.so", "close") ||
////////    Module.findExportByName(null, "close");
////////
////////const mkdirPtr =
////////    Module.findExportByName("libc.so", "mkdir") ||
////////    Module.findExportByName(null, "mkdir");
////////
////////const libc_open = openPtr
////////    ? new NativeFunction(openPtr, "int", ["pointer", "int", "int"])
////////    : null;
////////
////////const libc_write = writePtr
////////    ? new NativeFunction(writePtr, "int", ["int", "pointer", "int"])
////////    : null;
////////
////////const libc_close = closePtr
////////    ? new NativeFunction(closePtr, "int", ["int"])
////////    : null;
////////
////////const libc_mkdir = mkdirPtr
////////    ? new NativeFunction(mkdirPtr, "int", ["pointer", "int"])
////////    : null;
////////
////////// Linux / Android bionic flags
////////const O_WRONLY = 1;
////////const O_CREAT = 64;
////////const O_TRUNC = 512;
////////const O_WRONLY_CREAT_TRUNC = O_WRONLY | O_CREAT | O_TRUNC;
////////
////////function mkdirOne(path) {
////////    try {
////////        if (!libc_mkdir) return;
////////        libc_mkdir(Memory.allocUtf8String(path), 0o777);
////////    } catch (e) {}
////////}
////////
////////function mkdirs(path) {
////////    try {
////////        const parts = path.split("/");
////////        let cur = "";
////////
////////        for (let i = 0; i < parts.length; i++) {
////////            if (parts[i].length === 0) continue;
////////
////////            cur += "/" + parts[i];
////////            mkdirOne(cur);
////////        }
////////    } catch (e) {
////////        console.log("[-] mkdirs failed: " + e);
////////    }
////////}
////////
////////function sanitizeFileName(s) {
////////    if (!s) return "unknown";
////////
////////    // 去掉 path trace 后面的 source/range/offset 等信息
////////    s = s.split(" | ")[0];
////////
////////    // assets/src/a/b/index.jsc -> assets_src_a_b_index.js
////////    s = s.replace(/^\/+/, "");
////////    s = s.replace(/[\\/:*?"<>|\s]+/g, "_");
////////
////////    // 解密后按 .js 保存
////////    s = s.replace(/\.jsc$/i, ".js");
////////
////////    if (s.length > 180) {
////////        s = s.substring(s.length - 180);
////////    }
////////
////////    if (s.length === 0) {
////////        s = "unknown";
////////    }
////////
////////    return s;
////////}
////////
////////function sanitizeReason(s) {
////////    if (!s) return "unknown";
////////    return s.replace(/[\\/:*?"<>|\s]+/g, "_");
////////}
////////
////////function dumpPtrToAndroidFile(ptr, size, filePath) {
////////    try {
////////        if (!ptr || ptr.isNull()) return false;
////////
////////        if (!libc_open || !libc_write || !libc_close) {
////////            console.log("[-] libc open/write/close not ready");
////////            return false;
////////        }
////////
////////        const fd = libc_open(
////////            Memory.allocUtf8String(filePath),
////////            O_WRONLY_CREAT_TRUNC,
////////            0o666
////////        );
////////
////////        if (fd < 0) {
////////            console.log("[-] open failed: " + filePath + " fd=" + fd);
////////            return false;
////////        }
////////
////////        let writtenTotal = 0;
////////
////////        while (writtenTotal < size) {
////////            const remain = size - writtenTotal;
////////            const chunk = remain > 65536 ? 65536 : remain;
////////
////////            const n = libc_write(fd, ptr.add(writtenTotal), chunk);
////////
////////            if (n <= 0) {
////////                console.log("[-] write failed at " + writtenTotal + ", ret=" + n);
////////                break;
////////            }
////////
////////            writtenTotal += n;
////////        }
////////
////////        libc_close(fd);
////////
////////        console.log("[+] dumped to android: " + filePath + " bytes=" + writtenTotal);
////////        return writtenTotal > 0;
////////    } catch (e) {
////////        console.log("[-] dumpPtrToAndroidFile failed: " + e);
////////        return false;
////////    }
////////}
////////
////////function dumpTextToAndroidFile(text, filePath) {
////////    try {
////////        const buf = Memory.allocUtf8String(text);
////////
////////        // 这里 meta 基本都是 ASCII，长度直接用 text.length 足够。
////////        // 如果你 meta 里放大量中文，可以适当放大一点，但一般不影响。
////////        return dumpPtrToAndroidFile(buf, text.length, filePath);
////////    } catch (e) {
////////        console.log("[-] dumpTextToAndroidFile failed: " + e);
////////        return false;
////////    }
////////}
////////
////////// ================== 基础工具函数 ==================
////////
////////function safeReadCString(p) {
////////    try {
////////        if (!p || p.isNull()) return null;
////////        return p.readCString();
////////    } catch (e) {
////////        return null;
////////    }
////////}
////////
////////function safeReadUtf8(p, maxLen) {
////////    try {
////////        if (!p || p.isNull()) return null;
////////        return p.readUtf8String(maxLen);
////////    } catch (e) {
////////        return null;
////////    }
////////}
////////
////////function safeNum(v) {
////////    try {
////////        return v.toInt32();
////////    } catch (e) {}
////////
////////    try {
////////        return parseInt(v.toString(), 10);
////////    } catch (e) {}
////////
////////    return 0;
////////}
////////
////////function rememberPath(path, source) {
////////    if (!path) return;
////////
////////    recentPaths.push({
////////        path: path,
////////        source: source,
////////        time: Date.now()
////////    });
////////
////////    while (recentPaths.length > MAX_RECENT_PATHS) {
////////        recentPaths.shift();
////////    }
////////}
////////
////////function addMemRange(start, size, path, source) {
////////    try {
////////        if (!start || start.isNull()) return;
////////        if (!path) return;
////////        if (size <= 0) return;
////////
////////        memRanges.push({
////////            start: start,
////////            end: start.add(size),
////////            size: size,
////////            path: path,
////////            source: source,
////////            time: Date.now()
////////        });
////////
////////        while (memRanges.length > MAX_RANGES) {
////////            memRanges.shift();
////////        }
////////    } catch (e) {}
////////}
////////
////////function findPathByPtr(p) {
////////    try {
////////        if (!p || p.isNull()) return null;
////////
////////        for (let i = memRanges.length - 1; i >= 0; i--) {
////////            const r = memRanges[i];
////////
////////            if (p.compare(r.start) >= 0 && p.compare(r.end) < 0) {
////////                const off = p.sub(r.start).toString(16);
////////
////////                return r.path +
////////                    " | source=" + r.source +
////////                    " | range=" + r.start + "-" + r.end +
////////                    " | offset=0x" + off +
////////                    " | size=" + r.size;
////////            }
////////        }
////////    } catch (e) {}
////////
////////    // 兜底：有些 JS buffer 是拷贝出来的新内存，和文件 read buffer 不再是同一个地址。
////////    // 这种情况下只能给出最近打开的可疑路径。
////////    try {
////////        const now = Date.now();
////////
////////        for (let i = recentPaths.length - 1; i >= 0; i--) {
////////            const item = recentPaths[i];
////////
////////            if (now - item.time < 3000) {
////////                return item.path + " | source=" + item.source + " | fallback=recent_open";
////////            }
////////        }
////////    } catch (e) {}
////////
////////    return null;
////////}
////////
////////function skipJsPrefix(p) {
////////    try {
////////        let q = p;
////////
////////        // UTF-8 BOM
////////        if (
////////            q.readU8() === 0xef &&
////////            q.add(1).readU8() === 0xbb &&
////////            q.add(2).readU8() === 0xbf
////////        ) {
////////            q = q.add(3);
////////        }
////////
////////        for (let i = 0; i < 64; i++) {
////////            const c = q.readU8();
////////
////////            // 空格 / \n / \r / \t
////////            if (c === 0x20 || c === 0x0a || c === 0x0d || c === 0x09) {
////////                q = q.add(1);
////////                continue;
////////            }
////////
////////            break;
////////        }
////////
////////        return q;
////////    } catch (e) {
////////        return p;
////////    }
////////}
////////
////////function hasJycrypt(p) {
////////    try {
////////        if (!p || p.isNull()) return false;
////////
////////        for (let i = 0; i < 7; i++) {
////////            if (p.add(i).readU8() !== JY[i]) return false;
////////        }
////////
////////        return true;
////////    } catch (e) {
////////        return false;
////////    }
////////}
////////
////////function looksJs(p) {
////////    try {
////////        if (!p || p.isNull()) return false;
////////
////////        const q = skipJsPrefix(p);
////////
////////        const b0 = q.readU8();
////////        const b1 = q.add(1).readU8();
////////        const b2 = q.add(2).readU8();
////////
////////        if (b0 === 0x28) return true; // (
////////        if (b0 === 0x2f && b1 === 0x2f) return true; // //
////////        if (b0 === 0x2f && b1 === 0x2a) return true; // /*
////////        if (b0 === 0x76 && b1 === 0x61 && b2 === 0x72) return true; // var
////////        if (b0 === 0x6c && b1 === 0x65 && b2 === 0x74) return true; // let
////////        if (b0 === 0x63 && b1 === 0x6f && b2 === 0x6e) return true; // con / const
////////        if (b0 === 0x77 && b1 === 0x69 && b2 === 0x6e) return true; // win / window
////////        if (b0 === 0x53 && b1 === 0x79 && b2 === 0x73) return true; // Sys
////////        if (b0 === 0x72 && b1 === 0x65 && b2 === 0x71) return true; // req / require
////////        if (b0 === 0x6d && b1 === 0x6f && b2 === 0x64) return true; // mod / module
////////        if (b0 === 0x22 || b0 === 0x27) return true; // " or '
////////
////////        return false;
////////    } catch (e) {
////////        return false;
////////    }
////////}
////////
////////function dumpHead(p, len) {
////////    try {
////////        return hexdump(p, {
////////            offset: 0,
////////            length: Math.min(len, 2048),
////////            header: false,
////////            ansi: false
////////        });
////////    } catch (e) {
////////        return "";
////////    }
////////}
////////
////////function rangeInfo(addr) {
////////    try {
////////        const m = Process.findModuleByAddress(addr);
////////
////////        if (m) {
////////            return m.name +
////////                " base=" + m.base +
////////                " offset=0x" + addr.sub(m.base).toString(16) +
////////                " addr=" + addr;
////////        }
////////    } catch (e) {}
////////
////////    try {
////////        const r = Process.findRangeByAddress(addr);
////////
////////        if (r) {
////////            return "range base=" + r.base +
////////                " size=0x" + r.size.toString(16) +
////////                " prot=" + r.protection +
////////                " file=" + JSON.stringify(r.file) +
////////                " offset=0x" + addr.sub(r.base).toString(16) +
////////                " addr=" + addr;
////////        }
////////    } catch (e) {}
////////
////////    return addr + " unknown";
////////}
////////
////////// ================== 明文 JS dump 核心 ==================
////////
////////function sendJs(ptr, reason, caller) {
////////    if (!looksJs(ptr)) return;
////////
////////    const text = safeReadUtf8(ptr, MAX_JS_DUMP);
////////    if (!text || text.length < 20) return;
////////
////////    const idx = jsIndex++;
////////
////////    // 这里沿用字符串长度作为 dump 长度。
////////    // cocos 打包出来的 JS 通常是 ASCII/UTF-8 文本，实际够用。
////////    const dumpLen = Math.min(text.length, MAX_JS_DUMP);
////////    const path = findPathByPtr(ptr);
////////
////////    console.log("\n========== JS PLAINTEXT DUMP ==========");
////////    console.log("index  = " + idx);
////////    console.log("reason = " + reason);
////////    console.log("caller = " + rangeInfo(caller));
////////    console.log("path   = " + (path || "UNKNOWN"));
////////    console.log("len    = " + text.length);
////////    console.log("dump_root = " + DUMP_ROOT);
////////    console.log("preview:");
////////    console.log(text.substring(0, 600));
////////
////////    // 写入 Android 本地目录
////////    try {
////////        mkdirs(DUMP_ROOT);
////////
////////        const baseName = sanitizeFileName(path || "unknown");
////////        const safeReason = sanitizeReason(reason);
////////
////////        const outName = idx + "_" + safeReason + "_" + baseName;
////////        const outPath = DUMP_ROOT + "/" + outName;
////////
////////        dumpPtrToAndroidFile(ptr, dumpLen, outPath);
////////
////////        const meta =
////////            "index  = " + idx + "\n" +
////////            "reason = " + reason + "\n" +
////////            "caller = " + rangeInfo(caller) + "\n" +
////////            "path   = " + (path || "UNKNOWN") + "\n" +
////////            "length = " + text.length + "\n" +
////////            "file   = " + outPath + "\n" +
////////            "process= " + Process.name + "\n" +
////////            "package= " + PACKAGE_NAME + "\n";
////////
////////        dumpTextToAndroidFile(meta, outPath + ".meta.txt");
////////    } catch (e) {
////////        console.log("[-] android dump failed: " + e);
////////    }
////////
////////    // 保留原来的 send 到 PC，方便你 Python 端也能接
////////    try {
////////        send({
////////            type: "js_plaintext",
////////            index: idx,
////////            reason: reason,
////////            caller: rangeInfo(caller),
////////            path: path || "UNKNOWN",
////////            length: text.length,
////////            android_path: DUMP_ROOT
////////        }, ptr.readByteArray(dumpLen));
////////    } catch (e) {
////////        console.log("[-] send js failed: " + e);
////////    }
////////}
////////
////////function rememberEncrypted(ptr, caller) {
////////    recentEncrypted.push({
////////        ptr: ptr,
////////        caller: caller,
////////        path: findPathByPtr(ptr),
////////        time: Date.now()
////////    });
////////
////////    while (recentEncrypted.length > 20) {
////////        recentEncrypted.shift();
////////    }
////////}
////////
////////function watchInplaceDecrypt(ptr, caller) {
////////    let count = 0;
////////
////////    const timer = setInterval(function () {
////////        count++;
////////
////////        try {
////////            if (looksJs(ptr)) {
////////                console.log("\n========== INPLACE DECRYPT FOUND ==========");
////////                console.log("ptr    = " + ptr);
////////                console.log("path   = " + (findPathByPtr(ptr) || "UNKNOWN"));
////////                console.log("caller = " + rangeInfo(caller));
////////                sendJs(ptr, "inplace_ptr", caller);
////////                clearInterval(timer);
////////                return;
////////            }
////////
////////            const body = ptr.add(7);
////////
////////            if (looksJs(body)) {
////////                console.log("\n========== INPLACE BODY DECRYPT FOUND ==========");
////////                console.log("ptr    = " + body);
////////                console.log("path   = " + (findPathByPtr(body) || "UNKNOWN"));
////////                console.log("caller = " + rangeInfo(caller));
////////                sendJs(body, "inplace_ptr_plus_7", caller);
////////                clearInterval(timer);
////////                return;
////////            }
////////        } catch (e) {}
////////
////////        // 最多观察约 1 秒
////////        if (count > 100) {
////////            clearInterval(timer);
////////        }
////////    }, 10);
////////}
////////
////////// ================== AAsset 路径追踪 ==================
////////
////////function hookAAsset() {
////////    const openAddr =
////////        Module.findExportByName("libandroid.so", "AAssetManager_open") ||
////////        Module.findExportByName(null, "AAssetManager_open");
////////
////////    const getBufferAddr =
////////        Module.findExportByName("libandroid.so", "AAsset_getBuffer") ||
////////        Module.findExportByName(null, "AAsset_getBuffer");
////////
////////    const getLengthAddr =
////////        Module.findExportByName("libandroid.so", "AAsset_getLength") ||
////////        Module.findExportByName(null, "AAsset_getLength");
////////
////////    const readAddr =
////////        Module.findExportByName("libandroid.so", "AAsset_read") ||
////////        Module.findExportByName(null, "AAsset_read");
////////
////////    const closeAddr =
////////        Module.findExportByName("libandroid.so", "AAsset_close") ||
////////        Module.findExportByName(null, "AAsset_close");
////////
////////    let AAsset_getLength = null;
////////
////////    if (getLengthAddr) {
////////        try {
////////            AAsset_getLength = new NativeFunction(getLengthAddr, "long", ["pointer"]);
////////        } catch (e) {
////////            AAsset_getLength = null;
////////        }
////////    }
////////
////////    if (openAddr) {
////////        Interceptor.attach(openAddr, {
////////            onEnter(args) {
////////                this.path = safeReadCString(args[1]);
////////            },
////////            onLeave(retval) {
////////                if (!retval || retval.isNull()) return;
////////                if (!this.path) return;
////////
////////                assetPathMap.set(retval.toString(), this.path);
////////                rememberPath(this.path, "AAssetManager_open");
////////
////////                console.log("[AAssetManager_open] asset=" + retval + " path=" + this.path);
////////            }
////////        });
////////
////////        console.log("[+] hook AAssetManager_open");
////////    } else {
////////        console.log("[-] AAssetManager_open not found");
////////    }
////////
////////    if (getBufferAddr) {
////////        Interceptor.attach(getBufferAddr, {
////////            onEnter(args) {
////////                this.asset = args[0];
////////                this.path = assetPathMap.get(this.asset.toString()) || null;
////////            },
////////            onLeave(retval) {
////////                if (!retval || retval.isNull()) return;
////////                if (!this.path) return;
////////
////////                let len = 0;
////////
////////                try {
////////                    if (AAsset_getLength) {
////////                        len = safeNum(AAsset_getLength(this.asset));
////////                    }
////////                } catch (e) {
////////                    len = 0;
////////                }
////////
////////                if (len > 0) {
////////                    addMemRange(retval, len, this.path, "AAsset_getBuffer");
////////                    console.log("[AAsset_getBuffer] path=" + this.path + " buf=" + retval + " len=" + len);
////////                }
////////            }
////////        });
////////
////////        console.log("[+] hook AAsset_getBuffer");
////////    } else {
////////        console.log("[-] AAsset_getBuffer not found");
////////    }
////////
////////    if (readAddr) {
////////        Interceptor.attach(readAddr, {
////////            onEnter(args) {
////////                this.asset = args[0];
////////                this.buf = args[1];
////////                this.count = safeNum(args[2]);
////////                this.path = assetPathMap.get(this.asset.toString()) || null;
////////            },
////////            onLeave(retval) {
////////                const n = safeNum(retval);
////////
////////                if (n <= 0) return;
////////                if (!this.path) return;
////////
////////                addMemRange(this.buf, n, this.path, "AAsset_read");
////////            }
////////        });
////////
////////        console.log("[+] hook AAsset_read");
////////    } else {
////////        console.log("[-] AAsset_read not found");
////////    }
////////
////////    if (closeAddr) {
////////        Interceptor.attach(closeAddr, {
////////            onEnter(args) {
////////                const key = args[0].toString();
////////                const path = assetPathMap.get(key);
////////
////////                if (path) {
////////                    assetPathMap.delete(key);
////////                }
////////            }
////////        });
////////
////////        console.log("[+] hook AAsset_close");
////////    }
////////}
////////
////////// ================== libc 文件 API 路径追踪，可选 ==================
////////
////////function hookFileApi() {
////////    if (!ENABLE_FILE_API_HOOKS) {
////////        console.log("[*] file api hooks disabled");
////////        return;
////////    }
////////
////////    hookOpen("open", 0);
////////    hookOpen("open64", 0);
////////    hookOpen("openat", 1);
////////    hookOpen("__openat", 1);
////////
////////    hookRead("read");
////////    hookRead("pread");
////////    hookRead("pread64");
////////
////////    hookFopen("fopen");
////////    hookFopen("fopen64");
////////    hookFread("fread");
////////    hookFclose("fclose");
////////
////////    hookMmap("mmap");
////////    hookMmap("mmap64");
////////}
////////
////////function hookOpen(name, pathIndex) {
////////    const addr = Module.findExportByName("libc.so", name) || Module.findExportByName(null, name);
////////
////////    if (!addr) return;
////////
////////    Interceptor.attach(addr, {
////////        onEnter(args) {
////////            this.path = safeReadCString(args[pathIndex]);
////////        },
////////        onLeave(retval) {
////////            const fd = safeNum(retval);
////////
////////            if (fd < 0) return;
////////            if (!this.path) return;
////////
////////            fdPathMap.set(fd, this.path);
////////            rememberPath(this.path, name);
////////
////////            console.log("[" + name + "] fd=" + fd + " path=" + this.path);
////////        }
////////    });
////////
////////    console.log("[+] hook " + name);
////////}
////////
////////function hookRead(name) {
////////    const addr = Module.findExportByName("libc.so", name) || Module.findExportByName(null, name);
////////
////////    if (!addr) return;
////////
////////    Interceptor.attach(addr, {
////////        onEnter(args) {
////////            this.fd = safeNum(args[0]);
////////            this.buf = args[1];
////////            this.path = fdPathMap.get(this.fd) || null;
////////        },
////////        onLeave(retval) {
////////            const n = safeNum(retval);
////////
////////            if (n <= 0) return;
////////            if (!this.path) return;
////////
////////            addMemRange(this.buf, n, this.path, name);
////////        }
////////    });
////////
////////    console.log("[+] hook " + name);
////////}
////////
////////function hookFopen(name) {
////////    const addr = Module.findExportByName("libc.so", name) || Module.findExportByName(null, name);
////////
////////    if (!addr) return;
////////
////////    Interceptor.attach(addr, {
////////        onEnter(args) {
////////            this.path = safeReadCString(args[0]);
////////        },
////////        onLeave(retval) {
////////            if (!retval || retval.isNull()) return;
////////            if (!this.path) return;
////////
////////            filePathMap.set(retval.toString(), this.path);
////////            rememberPath(this.path, name);
////////
////////            console.log("[" + name + "] FILE=" + retval + " path=" + this.path);
////////        }
////////    });
////////
////////    console.log("[+] hook " + name);
////////}
////////
////////function hookFread(name) {
////////    const addr = Module.findExportByName("libc.so", name) || Module.findExportByName(null, name);
////////
////////    if (!addr) return;
////////
////////    Interceptor.attach(addr, {
////////        onEnter(args) {
////////            this.ptr = args[0];
////////            this.size = safeNum(args[1]);
////////            this.nmemb = safeNum(args[2]);
////////            this.file = args[3];
////////            this.path = filePathMap.get(this.file.toString()) || null;
////////        },
////////        onLeave(retval) {
////////            const count = safeNum(retval);
////////            const total = count * this.size;
////////
////////            if (total <= 0) return;
////////            if (!this.path) return;
////////
////////            addMemRange(this.ptr, total, this.path, name);
////////        }
////////    });
////////
////////    console.log("[+] hook " + name);
////////}
////////
////////function hookFclose(name) {
////////    const addr = Module.findExportByName("libc.so", name) || Module.findExportByName(null, name);
////////
////////    if (!addr) return;
////////
////////    Interceptor.attach(addr, {
////////        onEnter(args) {
////////            const key = args[0].toString();
////////
////////            if (filePathMap.has(key)) {
////////                filePathMap.delete(key);
////////            }
////////        }
////////    });
////////
////////    console.log("[+] hook " + name);
////////}
////////
////////function hookMmap(name) {
////////    const addr = Module.findExportByName("libc.so", name) || Module.findExportByName(null, name);
////////
////////    if (!addr) return;
////////
////////    Interceptor.attach(addr, {
////////        onEnter(args) {
////////            this.length = safeNum(args[1]);
////////            this.fd = safeNum(args[4]);
////////            this.path = fdPathMap.get(this.fd) || null;
////////        },
////////        onLeave(retval) {
////////            if (!retval || retval.isNull()) return;
////////            if (retval.equals(ptr("-1"))) return;
////////            if (!this.path) return;
////////            if (this.length <= 0) return;
////////
////////            addMemRange(retval, this.length, this.path, name);
////////            console.log("[" + name + "] path=" + this.path + " addr=" + retval + " len=" + this.length);
////////        }
////////    });
////////
////////    console.log("[+] hook " + name);
////////}
////////
////////// ================== memcmp 检测 jycrypt / JS 明文 ==================
////////
////////function hookMemcmp() {
////////    const addr = Module.findExportByName("libc.so", "memcmp");
////////
////////    if (!addr) {
////////        console.log("[-] memcmp not found");
////////        return;
////////    }
////////
////////    Interceptor.attach(addr, {
////////        onEnter(args) {
////////            this.hit = false;
////////
////////            let n = 0;
////////
////////            try {
////////                n = args[2].toInt32();
////////            } catch (e) {
////////                return;
////////            }
////////
////////            if (n !== 7 && n !== 8) return;
////////
////////            const a = args[0];
////////            const b = args[1];
////////
////////            const aJy = hasJycrypt(a);
////////            const bJy = hasJycrypt(b);
////////
////////            const aJs = looksJs(a);
////////            const bJs = looksJs(b);
////////
////////            if (!aJy && !bJy && !aJs && !bJs) return;
////////
////////            this.hit = true;
////////            this.a = a;
////////            this.b = b;
////////            this.n = n;
////////            this.aJy = aJy;
////////            this.bJy = bJy;
////////            this.aJs = aJs;
////////            this.bJs = bJs;
////////            this.caller = this.returnAddress;
////////        },
////////
////////        onLeave(retval) {
////////            if (!this.hit) return;
////////
////////            const ret = retval.toInt32();
////////            const idx = hitIndex++;
////////
////////            const pathA = findPathByPtr(this.a);
////////            const pathB = findPathByPtr(this.b);
////////
////////            console.log("\n========== JYCRYPT MEMCMP ==========");
////////            console.log("index  = " + idx);
////////            console.log("caller = " + rangeInfo(this.caller));
////////            console.log("len    = " + this.n);
////////            console.log("ret    = " + ret);
////////
////////            console.log("arg0   = " + this.a + " jy=" + this.aJy + " js=" + this.aJs);
////////            console.log("path0  = " + (pathA || "UNKNOWN"));
////////            console.log(dumpHead(this.a, 2048));
////////
////////            console.log("arg1   = " + this.b + " jy=" + this.bJy + " js=" + this.bJs);
////////            console.log("path1  = " + (pathB || "UNKNOWN"));
////////            console.log(dumpHead(this.b, 2048));
////////
////////            // ret == 0：说明 memcmp 命中了 jycrypt 头，当前 buffer 很可能是密文。
////////            // 然后开始短时间观察这个 buffer 是否被原地解密。
////////            if (ret === 0) {
////////                const encPtr = this.aJy ? this.a : this.b;
////////                const encPath = findPathByPtr(encPtr);
////////
////////                console.log(">>> ret=0，当前 buffer 是 jycrypt 密文");
////////                console.log(">>> encPtr = " + encPtr);
////////                console.log(">>> encPath = " + (encPath || "UNKNOWN"));
////////                console.log(">>> caller  = " + rangeInfo(this.caller));
////////
////////                rememberEncrypted(encPtr, this.caller);
////////                watchInplaceDecrypt(encPtr, this.caller);
////////            }
////////
////////            // 有些流程会在 memcmp 参数里直接出现 JS 明文，也一起 dump。
////////            if (this.aJs) {
////////                sendJs(this.a, "memcmp_arg0_js_ret_" + ret, this.caller);
////////            }
////////
////////            if (this.bJs) {
////////                sendJs(this.b, "memcmp_arg1_js_ret_" + ret, this.caller);
////////            }
////////        }
////////    });
////////
////////    console.log("[+] hook memcmp jycrypt stage2");
////////}
////////
////////// ================== 启动 ==================
////////
////////setImmediate(function () {
////////    console.log("========== Hook JYCRYPT Stage2 + Android File Dump ==========");
////////    console.log("[*] process = " + Process.name);
////////    console.log("[*] package = " + PACKAGE_NAME);
////////    console.log("[*] dump root = " + DUMP_ROOT);
////////
////////    mkdirs(DUMP_ROOT);
////////
////////    hookAAsset();
////////    hookFileApi();
////////    hookMemcmp();
////////
////////    console.log("========== Hook Installed ==========");
////////});
//////// ================== Android 本地落盘配置 ==================
//////
//////// 不要直接用 Process.name.split(":")[0]
//////// 有些 Frida 版本/环境里 Process.name 是 undefined
//////
//////const openPtr =
//////    Module.findExportByName("libc.so", "open") ||
//////    Module.findExportByName(null, "open");
//////
//////const readPtr =
//////    Module.findExportByName("libc.so", "read") ||
//////    Module.findExportByName(null, "read");
//////
//////const writePtr =
//////    Module.findExportByName("libc.so", "write") ||
//////    Module.findExportByName(null, "write");
//////
//////const closePtr =
//////    Module.findExportByName("libc.so", "close") ||
//////    Module.findExportByName(null, "close");
//////
//////const mkdirPtr =
//////    Module.findExportByName("libc.so", "mkdir") ||
//////    Module.findExportByName(null, "mkdir");
//////
//////const libc_open = openPtr
//////    ? new NativeFunction(openPtr, "int", ["pointer", "int", "int"])
//////    : null;
//////
//////const libc_read = readPtr
//////    ? new NativeFunction(readPtr, "int", ["int", "pointer", "int"])
//////    : null;
//////
//////const libc_write = writePtr
//////    ? new NativeFunction(writePtr, "int", ["int", "pointer", "int"])
//////    : null;
//////
//////const libc_close = closePtr
//////    ? new NativeFunction(closePtr, "int", ["int"])
//////    : null;
//////
//////const libc_mkdir = mkdirPtr
//////    ? new NativeFunction(mkdirPtr, "int", ["pointer", "int"])
//////    : null;
//////
//////// O_RDONLY
//////const O_RDONLY = 0;
//////
//////// O_WRONLY | O_CREAT | O_TRUNC
//////const O_WRONLY = 1;
//////const O_CREAT = 64;
//////const O_TRUNC = 512;
//////const O_WRONLY_CREAT_TRUNC = O_WRONLY | O_CREAT | O_TRUNC;
//////
//////function getPackageNameByJava() {
//////    let result = null;
//////
//////    try {
//////        if (typeof Java === "undefined" || !Java.available) {
//////            return null;
//////        }
//////
//////        Java.performNow(function () {
//////            try {
//////                const ActivityThread = Java.use("android.app.ActivityThread");
//////
//////                const app = ActivityThread.currentApplication();
//////                if (app) {
//////                    result = app.getApplicationContext().getPackageName().toString();
//////                    return;
//////                }
//////
//////                const pkg = ActivityThread.currentPackageName();
//////                if (pkg) {
//////                    result = pkg.toString();
//////                    return;
//////                }
//////
//////                const proc = ActivityThread.currentProcessName();
//////                if (proc) {
//////                    result = proc.toString().split(":")[0];
//////                    return;
//////                }
//////            } catch (e) {
//////                console.log("[-] getPackageNameByJava inner failed: " + e);
//////            }
//////        });
//////    } catch (e) {
//////        console.log("[-] getPackageNameByJava failed: " + e);
//////    }
//////
//////    return result;
//////}
//////
//////function getPackageNameByCmdline() {
//////    try {
//////        if (!libc_open || !libc_read || !libc_close) {
//////            return null;
//////        }
//////
//////        const fd = libc_open(Memory.allocUtf8String("/proc/self/cmdline"), O_RDONLY, 0);
//////        if (fd < 0) {
//////            return null;
//////        }
//////
//////        const buf = Memory.alloc(512);
//////        const n = libc_read(fd, buf, 511);
//////        libc_close(fd);
//////
//////        if (n <= 0) {
//////            return null;
//////        }
//////
//////        const cmdline = buf.readUtf8String(n);
//////        if (!cmdline) {
//////            return null;
//////        }
//////
//////        // /proc/self/cmdline 一般是 com.xxx.game\0
//////        return cmdline.split("\x00")[0].split(":")[0];
//////    } catch (e) {
//////        console.log("[-] getPackageNameByCmdline failed: " + e);
//////        return null;
//////    }
//////}
//////
//////function getPackageNameSafe() {
//////    let pkg = null;
//////
//////    pkg = getPackageNameByJava();
//////    if (pkg && pkg.length > 0) {
//////        return pkg.split(":")[0];
//////    }
//////
//////    pkg = getPackageNameByCmdline();
//////    if (pkg && pkg.length > 0) {
//////        return pkg.split(":")[0];
//////    }
//////
//////    try {
//////        if (
//////            typeof Process !== "undefined" &&
//////            Process.name &&
//////            typeof Process.name === "string" &&
//////            Process.name.length > 0
//////        ) {
//////            return Process.name.split(":")[0];
//////        }
//////    } catch (e) {}
//////
//////    return "unknown_pkg";
//////}
//////
//////const PACKAGE_NAME = getPackageNameSafe();
//////
//////let DUMP_ROOT = "/data/data/" + PACKAGE_NAME + "/files/jy_dump";
//////
//////// 如果还是拿不到包名，就退到 /data/local/tmp，避免 /data/data/unknown_pkg 写失败
//////if (PACKAGE_NAME === "unknown_pkg") {
//////    DUMP_ROOT = "/data/local/tmp/jy_dump_unknown";
//////}
//////
//////console.log("[*] resolved package = " + PACKAGE_NAME);
//////console.log("[*] dump root = " + DUMP_ROOT);
////
////
////'use strict';
////
////const JY = [0x6a, 0x79, 0x63, 0x72, 0x79, 0x70, 0x74]; // jycrypt
////
////const MAX_JS_DUMP = 4 * 1024 * 1024;
////
////const recentEncrypted = [];
////const recentPaths = [];
////const memRanges = [];
////
////const assetPathMap = new Map();   // AAsset* -> path
////const fdPathMap = new Map();      // fd -> path
////const filePathMap = new Map();    // FILE* -> path
////
////let jsIndex = 0;
////let hitIndex = 0;
////
////const MAX_RANGES = 3000;
////const MAX_RECENT_PATHS = 80;
////
////// ============================================================
////// Android 本地落盘配置：只给 dump 用，不影响原 hook 逻辑
////// ============================================================
////
////// 这里直接写死你的包名，最稳。
////// 如果换包，改这里即可。
//////const DUMP_PACKAGE = "com.block.juggle";
//////const DUMP_ROOT = "/data/data/" + DUMP_PACKAGE + "/files/jy_dump";
////const DUMP_PACKAGE = "com.block.juggle";
////
////// 直接放到你这个可 pull 的目录
////const DUMP_ROOT = "/storage/emulated/0/Android/data/com.block.juggle/files/frida_dex_dump";
////
////const dumpOpenPtr =
////    Module.findExportByName("libc.so", "open") ||
////    Module.findExportByName(null, "open");
////
////const dumpWritePtr =
////    Module.findExportByName("libc.so", "write") ||
////    Module.findExportByName(null, "write");
////
////const dumpClosePtr =
////    Module.findExportByName("libc.so", "close") ||
////    Module.findExportByName(null, "close");
////
////const dumpMkdirPtr =
////    Module.findExportByName("libc.so", "mkdir") ||
////    Module.findExportByName(null, "mkdir");
////
////const dump_open = dumpOpenPtr
////    ? new NativeFunction(dumpOpenPtr, "int", ["pointer", "int", "int"])
////    : null;
////
////const dump_write = dumpWritePtr
////    ? new NativeFunction(dumpWritePtr, "int", ["int", "pointer", "int"])
////    : null;
////
////const dump_close = dumpClosePtr
////    ? new NativeFunction(dumpClosePtr, "int", ["int"])
////    : null;
////
////const dump_mkdir = dumpMkdirPtr
////    ? new NativeFunction(dumpMkdirPtr, "int", ["pointer", "int"])
////    : null;
////
////// Android / Linux flags
////// O_WRONLY | O_CREAT | O_TRUNC
////const DUMP_O_WRONLY_CREAT_TRUNC = 1 | 64 | 512;
////
////// 0777 / 0666，避免旧 JS 环境不支持 0o 写法
////const MODE_777 = 511;
////const MODE_666 = 438;
////
////function dumpMkdirOne(path) {
////    try {
////        if (!dump_mkdir) return;
////        dump_mkdir(Memory.allocUtf8String(path), MODE_777);
////    } catch (e) {}
////}
////
////function dumpMkdirs(path) {
////    try {
////        const parts = path.split("/");
////        let cur = "";
////
////        for (let i = 0; i < parts.length; i++) {
////            if (parts[i].length === 0) continue;
////
////            cur += "/" + parts[i];
////            dumpMkdirOne(cur);
////        }
////    } catch (e) {
////        console.log("[-] dumpMkdirs failed: " + e);
////    }
////}
////
////function dumpSanitizeFileName(s) {
////    if (!s) s = "unknown";
////
////    // 去掉 path trace 后面的 source/range/offset 等信息
////    s = s.split(" | ")[0];
////
////    // assets/src/a/b/index.jsc -> assets_src_a_b_index.js
////    s = s.replace(/^\/+/, "");
////    s = s.replace(/[\\/:*?"<>|\s]+/g, "_");
////    s = s.replace(/\.jsc$/i, ".js");
////
////    if (s.length > 180) {
////        s = s.substring(s.length - 180);
////    }
////
////    if (s.length === 0) {
////        s = "unknown";
////    }
////
////    // 没扩展名的话，默认按 js 保存
////    if (!/\.js$/i.test(s)) {
////        s += ".js";
////    }
////
////    return s;
////}
////
////function dumpSanitizeReason(s) {
////    if (!s) return "unknown";
////    return s.replace(/[\\/:*?"<>|\s]+/g, "_");
////}
////
////function dumpCStringByteLen(ptr, maxLen) {
////    try {
////        const step = 4096;
////        let total = 0;
////
////        while (total < maxLen) {
////            const n = Math.min(step, maxLen - total);
////            const buf = ptr.add(total).readByteArray(n);
////            if (!buf) break;
////
////            const arr = new Uint8Array(buf);
////
////            for (let i = 0; i < arr.length; i++) {
////                if (arr[i] === 0) {
////                    return total + i;
////                }
////            }
////
////            total += n;
////        }
////
////        return maxLen;
////    } catch (e) {
////        return 0;
////    }
////}
////
////function dumpPtrToAndroidFile(ptr, size, filePath) {
////    try {
////        if (!ptr || ptr.isNull()) return false;
////
////        if (!dump_open || !dump_write || !dump_close) {
////            console.log("[-] dump libc open/write/close not ready");
////            return false;
////        }
////
////        const fd = dump_open(
////            Memory.allocUtf8String(filePath),
////            DUMP_O_WRONLY_CREAT_TRUNC,
////            MODE_666
////        );
////
////        if (fd < 0) {
////            console.log("[-] dump open failed: " + filePath + " fd=" + fd);
////            return false;
////        }
////
////        let writtenTotal = 0;
////
////        while (writtenTotal < size) {
////            const remain = size - writtenTotal;
////            const chunk = remain > 65536 ? 65536 : remain;
////
////            const n = dump_write(fd, ptr.add(writtenTotal), chunk);
////
////            if (n <= 0) {
////                console.log("[-] dump write failed at " + writtenTotal + ", ret=" + n);
////                break;
////            }
////
////            writtenTotal += n;
////        }
////
////        dump_close(fd);
////
////        console.log("[+] dumped to android: " + filePath + " bytes=" + writtenTotal);
////        return writtenTotal > 0;
////    } catch (e) {
////        console.log("[-] dumpPtrToAndroidFile failed: " + e);
////        return false;
////    }
////}
////
////function dumpTextToAndroidFile(text, filePath) {
////    try {
////        const buf = Memory.allocUtf8String(text);
////        const size = dumpCStringByteLen(buf, 1024 * 1024);
////        return dumpPtrToAndroidFile(buf, size, filePath);
////    } catch (e) {
////        console.log("[-] dumpTextToAndroidFile failed: " + e);
////        return false;
////    }
////}
////
////// ============================================================
////// 原始基础函数
////// ============================================================
////
////function safeReadCString(p) {
////    try {
////        if (!p || p.isNull()) return null;
////        return p.readCString();
////    } catch (e) {
////        return null;
////    }
////}
////
////function safeReadUtf8(p, maxLen) {
////    try {
////        if (!p || p.isNull()) return null;
////        return p.readUtf8String(maxLen);
////    } catch (e) {
////        return null;
////    }
////}
////
////function safeNum(v) {
////    try {
////        return v.toInt32();
////    } catch (e) {}
////
////    try {
////        return parseInt(v.toString(), 10);
////    } catch (e) {}
////
////    return 0;
////}
////
////function rememberPath(path, source) {
////    if (!path) return;
////
////    recentPaths.push({
////        path: path,
////        source: source,
////        time: Date.now()
////    });
////
////    while (recentPaths.length > MAX_RECENT_PATHS) {
////        recentPaths.shift();
////    }
////}
////
////function addMemRange(start, size, path, source) {
////    try {
////        if (!start || start.isNull()) return;
////        if (!path) return;
////        if (size <= 0) return;
////
////        memRanges.push({
////            start: start,
////            end: start.add(size),
////            size: size,
////            path: path,
////            source: source,
////            time: Date.now()
////        });
////
////        while (memRanges.length > MAX_RANGES) {
////            memRanges.shift();
////        }
////    } catch (e) {}
////}
////
////function findPathByPtr(p) {
////    try {
////        if (!p || p.isNull()) return null;
////
////        for (let i = memRanges.length - 1; i >= 0; i--) {
////            const r = memRanges[i];
////
////            if (p.compare(r.start) >= 0 && p.compare(r.end) < 0) {
////                const off = p.sub(r.start).toString(16);
////
////                return r.path +
////                    " | source=" + r.source +
////                    " | range=" + r.start + "-" + r.end +
////                    " | offset=0x" + off +
////                    " | size=" + r.size;
////            }
////        }
////    } catch (e) {}
////
////    // 兜底：有些 JS buffer 是拷贝出来的新内存，和文件 read buffer 不再是同一个地址。
////    // 这种情况下只能给出最近打开的可疑路径。
////    try {
////        const now = Date.now();
////
////        for (let i = recentPaths.length - 1; i >= 0; i--) {
////            const item = recentPaths[i];
////
////            if (now - item.time < 3000) {
////                return item.path + " | source=" + item.source + " | fallback=recent_open";
////            }
////        }
////    } catch (e) {}
////
////    return null;
////}
////
////function skipJsPrefix(p) {
////    try {
////        let q = p;
////
////        // UTF-8 BOM
////        if (
////            q.readU8() === 0xef &&
////            q.add(1).readU8() === 0xbb &&
////            q.add(2).readU8() === 0xbf
////        ) {
////            q = q.add(3);
////        }
////
////        for (let i = 0; i < 64; i++) {
////            const c = q.readU8();
////
////            // 空格 / \n / \r / \t
////            if (c === 0x20 || c === 0x0a || c === 0x0d || c === 0x09) {
////                q = q.add(1);
////                continue;
////            }
////
////            break;
////        }
////
////        return q;
////    } catch (e) {
////        return p;
////    }
////}
////
////function hasJycrypt(p) {
////    try {
////        if (!p || p.isNull()) return false;
////
////        for (let i = 0; i < 7; i++) {
////            if (p.add(i).readU8() !== JY[i]) return false;
////        }
////
////        return true;
////    } catch (e) {
////        return false;
////    }
////}
////
////function looksJs(p) {
////    try {
////        if (!p || p.isNull()) return false;
////
////        const q = skipJsPrefix(p);
////
////        const b0 = q.readU8();
////        const b1 = q.add(1).readU8();
////        const b2 = q.add(2).readU8();
////
////        if (b0 === 0x28) return true; // (
////        if (b0 === 0x2f && b1 === 0x2f) return true; // //
////        if (b0 === 0x2f && b1 === 0x2a) return true; // /*
////        if (b0 === 0x76 && b1 === 0x61 && b2 === 0x72) return true; // var
////        if (b0 === 0x6c && b1 === 0x65 && b2 === 0x74) return true; // let
////        if (b0 === 0x63 && b1 === 0x6f && b2 === 0x6e) return true; // con / const
////        if (b0 === 0x77 && b1 === 0x69 && b2 === 0x6e) return true; // win / window
////        if (b0 === 0x53 && b1 === 0x79 && b2 === 0x73) return true; // Sys
////        if (b0 === 0x72 && b1 === 0x65 && b2 === 0x71) return true; // req / require
////        if (b0 === 0x6d && b1 === 0x6f && b2 === 0x64) return true; // mod / module
////        if (b0 === 0x22 || b0 === 0x27) return true; // " or '
////
////        return false;
////    } catch (e) {
////        return false;
////    }
////}
////
////function dumpHead(p, len) {
////    try {
////        return hexdump(p, {
////            offset: 0,
////            length: Math.min(len, 2048),
////            header: false,
////            ansi: false
////        });
////    } catch (e) {
////        return "";
////    }
////}
////
////function rangeInfo(addr) {
////    try {
////        const m = Process.findModuleByAddress(addr);
////
////        if (m) {
////            return m.name +
////                " base=" + m.base +
////                " offset=0x" + addr.sub(m.base).toString(16) +
////                " addr=" + addr;
////        }
////    } catch (e) {}
////
////    try {
////        const r = Process.findRangeByAddress(addr);
////
////        if (r) {
////            return "range base=" + r.base +
////                " size=0x" + r.size.toString(16) +
////                " prot=" + r.protection +
////                " file=" + JSON.stringify(r.file) +
////                " offset=0x" + addr.sub(r.base).toString(16) +
////                " addr=" + addr;
////        }
////    } catch (e) {}
////
////    return addr + " unknown";
////}
////
////// ============================================================
////// 明文 JS 出口：这里是唯一改动核心，新增 Android 落盘
////// ============================================================
////
////function sendJs(ptr, reason, caller) {
////    if (!looksJs(ptr)) return;
////
////    const text = safeReadUtf8(ptr, MAX_JS_DUMP);
////    if (!text || text.length < 20) return;
////
////    const idx = jsIndex++;
////    const path = findPathByPtr(ptr);
////
////    let dumpLen = dumpCStringByteLen(ptr, MAX_JS_DUMP);
////    if (dumpLen <= 0) {
////        dumpLen = Math.min(text.length, MAX_JS_DUMP);
////    }
////
////    console.log("\n========== JS PLAINTEXT DUMP ==========");
////    console.log("index  = " + idx);
////    console.log("reason = " + reason);
////    console.log("caller = " + rangeInfo(caller));
////    console.log("path   = " + (path || "UNKNOWN"));
////    console.log("len    = " + text.length);
////    console.log("bytes  = " + dumpLen);
////    console.log("dump_root = " + DUMP_ROOT);
////    console.log("preview:");
////    console.log(text.substring(0, 600));
////
////    // ================== 新增：写入 Android 本地 ==================
////    try {
////        dumpMkdirs(DUMP_ROOT);
////
////        const baseName = dumpSanitizeFileName(path || "unknown");
////        const safeReason = dumpSanitizeReason(reason);
////
////        const outName = idx + "_" + safeReason + "_" + baseName;
////        const outPath = DUMP_ROOT + "/" + outName;
////
////        dumpPtrToAndroidFile(ptr, dumpLen, outPath);
////
////        const meta =
////            "index  = " + idx + "\n" +
////            "reason = " + reason + "\n" +
////            "caller = " + rangeInfo(caller) + "\n" +
////            "path   = " + (path || "UNKNOWN") + "\n" +
////            "length = " + text.length + "\n" +
////            "bytes  = " + dumpLen + "\n" +
////            "file   = " + outPath + "\n" +
////            "dump_root = " + DUMP_ROOT + "\n";
////
////        dumpTextToAndroidFile(meta, outPath + ".meta.txt");
////    } catch (e) {
////        console.log("[-] android dump failed: " + e);
////    }
////
////    // ================== 保留原来的 send 到 Python ==================
////    try {
////        send({
////            type: "js_plaintext",
////            index: idx,
////            reason: reason,
////            caller: rangeInfo(caller),
////            path: path || "UNKNOWN",
////            length: text.length,
////            bytes: dumpLen,
////            android_path: DUMP_ROOT
////        }, ptr.readByteArray(dumpLen));
////    } catch (e) {
////        console.log("[-] send js failed: " + e);
////    }
////}
////
////function rememberEncrypted(ptr, caller) {
////    recentEncrypted.push({
////        ptr: ptr,
////        caller: caller,
////        path: findPathByPtr(ptr),
////        time: Date.now()
////    });
////
////    while (recentEncrypted.length > 20) {
////        recentEncrypted.shift();
////    }
////}
////
////function watchInplaceDecrypt(ptr, caller) {
////    let count = 0;
////
////    const timer = setInterval(function () {
////        count++;
////
////        try {
////            if (looksJs(ptr)) {
////                console.log("\n========== INPLACE DECRYPT FOUND ==========");
////                console.log("ptr    = " + ptr);
////                console.log("path   = " + (findPathByPtr(ptr) || "UNKNOWN"));
////                console.log("caller = " + rangeInfo(caller));
////                sendJs(ptr, "inplace_ptr", caller);
////                clearInterval(timer);
////                return;
////            }
////
////            const body = ptr.add(7);
////
////            if (looksJs(body)) {
////                console.log("\n========== INPLACE BODY DECRYPT FOUND ==========");
////                console.log("ptr    = " + body);
////                console.log("path   = " + (findPathByPtr(body) || "UNKNOWN"));
////                console.log("caller = " + rangeInfo(caller));
////                sendJs(body, "inplace_ptr_plus_7", caller);
////                clearInterval(timer);
////                return;
////            }
////        } catch (e) {}
////
////        if (count > 100) {
////            clearInterval(timer);
////        }
////    }, 10);
////}
////
////// ============================================================
////// AAsset Hook：保持原逻辑
////// ============================================================
////
////function hookAAsset() {
////    const openAddr =
////        Module.findExportByName("libandroid.so", "AAssetManager_open") ||
////        Module.findExportByName(null, "AAssetManager_open");
////
////    const getBufferAddr =
////        Module.findExportByName("libandroid.so", "AAsset_getBuffer") ||
////        Module.findExportByName(null, "AAsset_getBuffer");
////
////    const getLengthAddr =
////        Module.findExportByName("libandroid.so", "AAsset_getLength") ||
////        Module.findExportByName(null, "AAsset_getLength");
////
////    const readAddr =
////        Module.findExportByName("libandroid.so", "AAsset_read") ||
////        Module.findExportByName(null, "AAsset_read");
////
////    const closeAddr =
////        Module.findExportByName("libandroid.so", "AAsset_close") ||
////        Module.findExportByName(null, "AAsset_close");
////
////    let AAsset_getLength = null;
////
////    if (getLengthAddr) {
////        try {
////            AAsset_getLength = new NativeFunction(getLengthAddr, "long", ["pointer"]);
////        } catch (e) {
////            AAsset_getLength = null;
////        }
////    }
////
////    if (openAddr) {
////        Interceptor.attach(openAddr, {
////            onEnter(args) {
////                this.path = safeReadCString(args[1]);
////            },
////            onLeave(retval) {
////                if (!retval || retval.isNull()) return;
////                if (!this.path) return;
////
////                assetPathMap.set(retval.toString(), this.path);
////                rememberPath(this.path, "AAssetManager_open");
////
////                console.log("[AAssetManager_open] asset=" + retval + " path=" + this.path);
////            }
////        });
////
////        console.log("[+] hook AAssetManager_open");
////    } else {
////        console.log("[-] AAssetManager_open not found");
////    }
////
////    if (getBufferAddr) {
////        Interceptor.attach(getBufferAddr, {
////            onEnter(args) {
////                this.asset = args[0];
////                this.path = assetPathMap.get(this.asset.toString()) || null;
////            },
////            onLeave(retval) {
////                if (!retval || retval.isNull()) return;
////                if (!this.path) return;
////
////                let len = 0;
////
////                try {
////                    if (AAsset_getLength) {
////                        len = safeNum(AAsset_getLength(this.asset));
////                    }
////                } catch (e) {
////                    len = 0;
////                }
////
////                if (len > 0) {
////                    addMemRange(retval, len, this.path, "AAsset_getBuffer");
////                    console.log("[AAsset_getBuffer] path=" + this.path + " buf=" + retval + " len=" + len);
////                }
////            }
////        });
////
////        console.log("[+] hook AAsset_getBuffer");
////    } else {
////        console.log("[-] AAsset_getBuffer not found");
////    }
////
////    if (readAddr) {
////        Interceptor.attach(readAddr, {
////            onEnter(args) {
////                this.asset = args[0];
////                this.buf = args[1];
////                this.count = safeNum(args[2]);
////                this.path = assetPathMap.get(this.asset.toString()) || null;
////            },
////            onLeave(retval) {
////                const n = safeNum(retval);
////
////                if (n <= 0) return;
////                if (!this.path) return;
////
////                addMemRange(this.buf, n, this.path, "AAsset_read");
////            }
////        });
////
////        console.log("[+] hook AAsset_read");
////    } else {
////        console.log("[-] AAsset_read not found");
////    }
////
////    if (closeAddr) {
////        Interceptor.attach(closeAddr, {
////            onEnter(args) {
////                const key = args[0].toString();
////                const path = assetPathMap.get(key);
////
////                if (path) {
////                    assetPathMap.delete(key);
////                }
////            }
////        });
////
////        console.log("[+] hook AAsset_close");
////    }
////}
////
////// ============================================================
////// File API Hook：默认保持你原来注释状态，不开启
////// ============================================================
////
////function hookFileApi() {
//////    hookOpen("open", 0);
//////    hookOpen("open64", 0);
//////    hookOpen("openat", 1);
//////    hookOpen("__openat", 1);
//////
//////    hookRead("read");
//////    hookRead("pread");
//////    hookRead("pread64");
//////
//////    hookFopen("fopen");
//////    hookFopen("fopen64");
//////    hookFread("fread");
//////    hookFclose("fclose");
//////
//////    hookMmap("mmap");
//////    hookMmap("mmap64");
////}
////
////function hookOpen(name, pathIndex) {
////    const addr = Module.findExportByName("libc.so", name) || Module.findExportByName(null, name);
////
////    if (!addr) return;
////
////    Interceptor.attach(addr, {
////        onEnter(args) {
////            this.path = safeReadCString(args[pathIndex]);
////        },
////        onLeave(retval) {
////            const fd = safeNum(retval);
////
////            if (fd < 0) return;
////            if (!this.path) return;
////
////            fdPathMap.set(fd, this.path);
////            rememberPath(this.path, name);
////
////            console.log("[" + name + "] fd=" + fd + " path=" + this.path);
////        }
////    });
////
////    console.log("[+] hook " + name);
////}
////
////function hookRead(name) {
////    const addr = Module.findExportByName("libc.so", name) || Module.findExportByName(null, name);
////
////    if (!addr) return;
////
////    Interceptor.attach(addr, {
////        onEnter(args) {
////            this.fd = safeNum(args[0]);
////            this.buf = args[1];
////            this.path = fdPathMap.get(this.fd) || null;
////        },
////        onLeave(retval) {
////            const n = safeNum(retval);
////
////            if (n <= 0) return;
////            if (!this.path) return;
////
////            addMemRange(this.buf, n, this.path, name);
////        }
////    });
////
////    console.log("[+] hook " + name);
////}
////
////function hookFopen(name) {
////    const addr = Module.findExportByName("libc.so", name) || Module.findExportByName(null, name);
////
////    if (!addr) return;
////
////    Interceptor.attach(addr, {
////        onEnter(args) {
////            this.path = safeReadCString(args[0]);
////        },
////        onLeave(retval) {
////            if (!retval || retval.isNull()) return;
////            if (!this.path) return;
////
////            filePathMap.set(retval.toString(), this.path);
////            rememberPath(this.path, name);
////
////            console.log("[" + name + "] FILE=" + retval + " path=" + this.path);
////        }
////    });
////
////    console.log("[+] hook " + name);
////}
////
////function hookFread(name) {
////    const addr = Module.findExportByName("libc.so", name) || Module.findExportByName(null, name);
////
////    if (!addr) return;
////
////    Interceptor.attach(addr, {
////        onEnter(args) {
////            this.ptr = args[0];
////            this.size = safeNum(args[1]);
////            this.nmemb = safeNum(args[2]);
////            this.file = args[3];
////            this.path = filePathMap.get(this.file.toString()) || null;
////        },
////        onLeave(retval) {
////            const count = safeNum(retval);
////            const total = count * this.size;
////
////            if (total <= 0) return;
////            if (!this.path) return;
////
////            addMemRange(this.ptr, total, this.path, name);
////        }
////    });
////
////    console.log("[+] hook " + name);
////}
////
////function hookFclose(name) {
////    const addr = Module.findExportByName("libc.so", name) || Module.findExportByName(null, name);
////
////    if (!addr) return;
////
////    Interceptor.attach(addr, {
////        onEnter(args) {
////            const key = args[0].toString();
////
////            if (filePathMap.has(key)) {
////                filePathMap.delete(key);
////            }
////        }
////    });
////
////    console.log("[+] hook " + name);
////}
////
////function hookMmap(name) {
////    const addr = Module.findExportByName("libc.so", name) || Module.findExportByName(null, name);
////
////    if (!addr) return;
////
////    Interceptor.attach(addr, {
////        onEnter(args) {
////            this.length = safeNum(args[1]);
////            this.fd = safeNum(args[4]);
////            this.path = fdPathMap.get(this.fd) || null;
////        },
////        onLeave(retval) {
////            if (!retval || retval.isNull()) return;
////            if (retval.equals(ptr("-1"))) return;
////            if (!this.path) return;
////            if (this.length <= 0) return;
////
////            addMemRange(retval, this.length, this.path, name);
////            console.log("[" + name + "] path=" + this.path + " addr=" + retval + " len=" + this.length);
////        }
////    });
////
////    console.log("[+] hook " + name);
////}
////
////// ============================================================
////// memcmp Hook：保持原逻辑
////// ============================================================
////
////function hookMemcmp() {
////    const addr = Module.findExportByName("libc.so", "memcmp");
////
////    if (!addr) {
////        console.log("[-] memcmp not found");
////        return;
////    }
////
////    Interceptor.attach(addr, {
////        onEnter(args) {
////            this.hit = false;
////
////            let n = 0;
////
////            try {
////                n = args[2].toInt32();
////            } catch (e) {
////                return;
////            }
////
////            if (n !== 7 && n !== 8) return;
////
////            const a = args[0];
////            const b = args[1];
////
////            const aJy = hasJycrypt(a);
////            const bJy = hasJycrypt(b);
////
////            const aJs = looksJs(a);
////            const bJs = looksJs(b);
////
////            if (!aJy && !bJy && !aJs && !bJs) return;
////
////            this.hit = true;
////            this.a = a;
////            this.b = b;
////            this.n = n;
////            this.aJy = aJy;
////            this.bJy = bJy;
////            this.aJs = aJs;
////            this.bJs = bJs;
////            this.caller = this.returnAddress;
////        },
////
////        onLeave(retval) {
////            if (!this.hit) return;
////
////            const ret = retval.toInt32();
////            const idx = hitIndex++;
////
////            const pathA = findPathByPtr(this.a);
////            const pathB = findPathByPtr(this.b);
////
////            console.log("\n========== JYCRYPT MEMCMP ==========");
////            console.log("index  = " + idx);
////            console.log("caller = " + rangeInfo(this.caller));
////            console.log("len    = " + this.n);
////            console.log("ret    = " + ret);
////
////            console.log("arg0   = " + this.a + " jy=" + this.aJy + " js=" + this.aJs);
////            console.log("path0  = " + (pathA || "UNKNOWN"));
////            console.log(dumpHead(this.a, 10));
////
////            console.log("arg1   = " + this.b + " jy=" + this.bJy + " js=" + this.bJs);
////            console.log("path1  = " + (pathB || "UNKNOWN"));
////            console.log(dumpHead(this.b, 10));
////
////            if (ret === 0) {
////                const encPtr = this.aJy ? this.a : this.b;
////                const encPath = findPathByPtr(encPtr);
////
////                console.log(">>> ret=0，当前 buffer 是 jycrypt 密文");
////                console.log(">>> encPtr = " + encPtr);
////                console.log(">>> encPath = " + (encPath || "UNKNOWN"));
////                console.log(">>> caller  = " + rangeInfo(this.caller));
////
////                rememberEncrypted(encPtr, this.caller);
////                watchInplaceDecrypt(encPtr, this.caller);
////            }
////
////            if (this.aJs) {
////                sendJs(this.a, "memcmp_arg0_js_ret_" + ret, this.caller);
////            }
////
////            if (this.bJs) {
////                sendJs(this.b, "memcmp_arg1_js_ret_" + ret, this.caller);
////            }
////        }
////    });
////
////    console.log("[+] hook memcmp jycrypt stage2");
////}
////
////// ============================================================
////// 启动：保持原来的启动结构
////// ============================================================
////
////setImmediate(function () {
////    console.log("========== Hook JYCRYPT Stage2 + Path Trace + Android Dump ==========");
////    console.log("[*] dump root = " + DUMP_ROOT);
////
////    dumpMkdirs(DUMP_ROOT);
////
////    dumpTextToAndroidFile(
////        "script started\n" +
////        "dump_root = " + DUMP_ROOT + "\n" +
////        "time = " + Date.now() + "\n",
////        DUMP_ROOT + "/_script_started.txt"
////    );
////
////    console.log("[+] wrote marker: " + DUMP_ROOT + "/_script_started.txt");
////
////    hookAAsset();
////    hookFileApi();
////    hookMemcmp();
////
////    console.log("========== Hook Installed ==========");
////});
//'use strict';
//
//const JY = [0x6a, 0x79, 0x63, 0x72, 0x79, 0x70, 0x74]; // jycrypt
//
//const MAX_JS_DUMP = 4 * 1024 * 1024;
//
//const recentEncrypted = [];
//const recentPaths = [];
//const memRanges = [];
//
//const assetPathMap = new Map();   // AAsset* -> path
//const fdPathMap = new Map();      // fd -> path
//const filePathMap = new Map();    // FILE* -> path
//
//let jsIndex = 0;
//let hitIndex = 0;
//let decryptWatchIndex = 0;
//
//const MAX_RANGES = 3000;
//const MAX_RECENT_PATHS = 80;
//
//// true = 每次命中都保存，包括重复内容。
//// false = 相同 hash 的明文只保存一次。
//const SAVE_DUPLICATE_DECRYPTED_JS = true;
//const dumpedJsHashSet = new Set();
//
//// 原来 100 * 10ms = 1 秒，可能太短。
//// 这里改成 1000 * 10ms = 10 秒。
//const DECRYPT_WATCH_MAX_COUNT = 1000;
//
//// ============================================================
//// Android 本地落盘配置
//// ============================================================
//
//const DUMP_PACKAGE = "com.block.juggle";
//
//// 你确认可以 pull 的目录
//const DUMP_ROOT = "/storage/emulated/0/Android/data/com.block.juggle/files/frida_dex_dump";
//
//// 解密后的 JS 专门放这里
//const JS_DUMP_ROOT = DUMP_ROOT + "/decrypted_js";
//
//const dumpOpenPtr =
//    Module.findExportByName("libc.so", "open") ||
//    Module.findExportByName(null, "open");
//
//const dumpWritePtr =
//    Module.findExportByName("libc.so", "write") ||
//    Module.findExportByName(null, "write");
//
//const dumpClosePtr =
//    Module.findExportByName("libc.so", "close") ||
//    Module.findExportByName(null, "close");
//
//const dumpMkdirPtr =
//    Module.findExportByName("libc.so", "mkdir") ||
//    Module.findExportByName(null, "mkdir");
//
//const dump_open = dumpOpenPtr
//    ? new NativeFunction(dumpOpenPtr, "int", ["pointer", "int", "int"])
//    : null;
//
//const dump_write = dumpWritePtr
//    ? new NativeFunction(dumpWritePtr, "int", ["int", "pointer", "int"])
//    : null;
//
//const dump_close = dumpClosePtr
//    ? new NativeFunction(dumpClosePtr, "int", ["int"])
//    : null;
//
//const dump_mkdir = dumpMkdirPtr
//    ? new NativeFunction(dumpMkdirPtr, "int", ["pointer", "int"])
//    : null;
//
//// O_WRONLY | O_CREAT | O_TRUNC
//const DUMP_O_WRONLY_CREAT_TRUNC = 1 | 64 | 512;
//
//// 0777 / 0666，避免旧 JS 环境不支持 0o 写法
//const MODE_777 = 511;
//const MODE_666 = 438;
//
//function dumpMkdirOne(path) {
//    try {
//        if (!dump_mkdir) return;
//        dump_mkdir(Memory.allocUtf8String(path), MODE_777);
//    } catch (e) {}
//}
//
//function dumpMkdirs(path) {
//    try {
//        const parts = path.split("/");
//        let cur = "";
//
//        for (let i = 0; i < parts.length; i++) {
//            if (parts[i].length === 0) continue;
//
//            cur += "/" + parts[i];
//            dumpMkdirOne(cur);
//        }
//    } catch (e) {
//        console.log("[-] dumpMkdirs failed: " + e);
//    }
//}
//
//function dumpSanitizeFileName(s) {
//    if (!s) s = "unknown";
//
//    // 去掉 path trace 后面的 source/range/offset 等信息
//    s = s.split(" | ")[0];
//
//    // assets/src/a/b/index.jsc -> assets_src_a_b_index.js
//    s = s.replace(/^\/+/, "");
//    s = s.replace(/[\\/:*?"<>|\s]+/g, "_");
//    s = s.replace(/\.jsc$/i, ".js");
//
//    if (s.length > 180) {
//        s = s.substring(s.length - 180);
//    }
//
//    if (s.length === 0) {
//        s = "unknown";
//    }
//
//    if (!/\.js$/i.test(s)) {
//        s += ".js";
//    }
//
//    return s;
//}
//
//function dumpSanitizeReason(s) {
//    if (!s) return "unknown";
//    return s.replace(/[\\/:*?"<>|\s]+/g, "_");
//}
//
//function dumpCStringByteLen(ptr, maxLen) {
//    try {
//        const step = 4096;
//        let total = 0;
//
//        while (total < maxLen) {
//            const n = Math.min(step, maxLen - total);
//            const buf = ptr.add(total).readByteArray(n);
//            if (!buf) break;
//
//            const arr = new Uint8Array(buf);
//
//            for (let i = 0; i < arr.length; i++) {
//                if (arr[i] === 0) {
//                    return total + i;
//                }
//            }
//
//            total += n;
//        }
//
//        return maxLen;
//    } catch (e) {
//        return 0;
//    }
//}
//
//function dumpPtrToAndroidFile(ptr, size, filePath) {
//    try {
//        if (!ptr || ptr.isNull()) return false;
//
//        if (!dump_open || !dump_write || !dump_close) {
//            console.log("[-] dump libc open/write/close not ready");
//            return false;
//        }
//
//        const fd = dump_open(
//            Memory.allocUtf8String(filePath),
//            DUMP_O_WRONLY_CREAT_TRUNC,
//            MODE_666
//        );
//
//        if (fd < 0) {
//            console.log("[-] dump open failed: " + filePath + " fd=" + fd);
//            return false;
//        }
//
//        let writtenTotal = 0;
//
//        while (writtenTotal < size) {
//            const remain = size - writtenTotal;
//            const chunk = remain > 65536 ? 65536 : remain;
//
//            const n = dump_write(fd, ptr.add(writtenTotal), chunk);
//
//            if (n <= 0) {
//                console.log("[-] dump write failed at " + writtenTotal + ", ret=" + n);
//                break;
//            }
//
//            writtenTotal += n;
//        }
//
//        dump_close(fd);
//
//        console.log("[+] dumped to android: " + filePath + " bytes=" + writtenTotal);
//        return writtenTotal > 0;
//    } catch (e) {
//        console.log("[-] dumpPtrToAndroidFile failed: " + e);
//        return false;
//    }
//}
//
//function dumpTextToAndroidFile(text, filePath) {
//    try {
//        const buf = Memory.allocUtf8String(text);
//        const size = dumpCStringByteLen(buf, 1024 * 1024);
//        return dumpPtrToAndroidFile(buf, size, filePath);
//    } catch (e) {
//        console.log("[-] dumpTextToAndroidFile failed: " + e);
//        return false;
//    }
//}
//
//function simpleHashPtr(ptr, size) {
//    try {
//        if (!ptr || ptr.isNull()) return "null";
//
//        const max = Math.min(size, 1024 * 1024);
//        const step = 4096;
//
//        let h = 2166136261 >>> 0;
//        let total = 0;
//
//        while (total < max) {
//            const n = Math.min(step, max - total);
//            const buf = ptr.add(total).readByteArray(n);
//            if (!buf) break;
//
//            const arr = new Uint8Array(buf);
//
//            for (let i = 0; i < arr.length; i++) {
//                h ^= arr[i];
//                h = Math.imul(h, 16777619) >>> 0;
//            }
//
//            total += n;
//        }
//
//        return size + "_" + h.toString(16);
//    } catch (e) {
//        return "hash_error_" + Date.now();
//    }
//}
//
//// ============================================================
//// 基础函数
//// ============================================================
//
//function safeReadCString(p) {
//    try {
//        if (!p || p.isNull()) return null;
//        return p.readCString();
//    } catch (e) {
//        return null;
//    }
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
//function safeNum(v) {
//    try {
//        return v.toInt32();
//    } catch (e) {}
//
//    try {
//        return parseInt(v.toString(), 10);
//    } catch (e) {}
//
//    return 0;
//}
//
//function rememberPath(path, source) {
//    if (!path) return;
//
//    recentPaths.push({
//        path: path,
//        source: source,
//        time: Date.now()
//    });
//
//    while (recentPaths.length > MAX_RECENT_PATHS) {
//        recentPaths.shift();
//    }
//}
//
//function addMemRange(start, size, path, source) {
//    try {
//        if (!start || start.isNull()) return;
//        if (!path) return;
//        if (size <= 0) return;
//
//        memRanges.push({
//            start: start,
//            end: start.add(size),
//            size: size,
//            path: path,
//            source: source,
//            time: Date.now()
//        });
//
//        while (memRanges.length > MAX_RANGES) {
//            memRanges.shift();
//        }
//    } catch (e) {}
//}
//
//function findPathByPtr(p) {
//    try {
//        if (!p || p.isNull()) return null;
//
//        for (let i = memRanges.length - 1; i >= 0; i--) {
//            const r = memRanges[i];
//
//            if (p.compare(r.start) >= 0 && p.compare(r.end) < 0) {
//                const off = p.sub(r.start).toString(16);
//
//                return r.path +
//                    " | source=" + r.source +
//                    " | range=" + r.start + "-" + r.end +
//                    " | offset=0x" + off +
//                    " | size=" + r.size;
//            }
//        }
//    } catch (e) {}
//
//    try {
//        const now = Date.now();
//
//        for (let i = recentPaths.length - 1; i >= 0; i--) {
//            const item = recentPaths[i];
//
//            if (now - item.time < 3000) {
//                return item.path + " | source=" + item.source + " | fallback=recent_open";
//            }
//        }
//    } catch (e) {}
//
//    return null;
//}
//
//function skipJsPrefix(p) {
//    try {
//        let q = p;
//
//        // UTF-8 BOM
//        if (
//            q.readU8() === 0xef &&
//            q.add(1).readU8() === 0xbb &&
//            q.add(2).readU8() === 0xbf
//        ) {
//            q = q.add(3);
//        }
//
//        for (let i = 0; i < 64; i++) {
//            const c = q.readU8();
//
//            // 空格 / \n / \r / \t
//            if (c === 0x20 || c === 0x0a || c === 0x0d || c === 0x09) {
//                q = q.add(1);
//                continue;
//            }
//
//            break;
//        }
//
//        return q;
//    } catch (e) {
//        return p;
//    }
//}
//
//function hasJycrypt(p) {
//    try {
//        if (!p || p.isNull()) return false;
//
//        for (let i = 0; i < 7; i++) {
//            if (p.add(i).readU8() !== JY[i]) return false;
//        }
//
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
//        const q = skipJsPrefix(p);
//
//        const b0 = q.readU8();
//        const b1 = q.add(1).readU8();
//        const b2 = q.add(2).readU8();
//
//        if (b0 === 0x28) return true; // (
//        if (b0 === 0x2f && b1 === 0x2f) return true; // //
//        if (b0 === 0x2f && b1 === 0x2a) return true; // /*
//        if (b0 === 0x76 && b1 === 0x61 && b2 === 0x72) return true; // var
//        if (b0 === 0x6c && b1 === 0x65 && b2 === 0x74) return true; // let
//        if (b0 === 0x63 && b1 === 0x6f && b2 === 0x6e) return true; // con / const
//        if (b0 === 0x77 && b1 === 0x69 && b2 === 0x6e) return true; // win / window
//        if (b0 === 0x53 && b1 === 0x79 && b2 === 0x73) return true; // Sys
//        if (b0 === 0x72 && b1 === 0x65 && b2 === 0x71) return true; // req / require
//        if (b0 === 0x6d && b1 === 0x6f && b2 === 0x64) return true; // mod / module
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
//            length: Math.min(len, 2048),
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
//
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
//
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
//// ============================================================
//// 保存解密后的 JS
//// ============================================================
//
//function sendJs(ptr, reason, caller) {
//    if (!looksJs(ptr)) return;
//
//    const text = safeReadUtf8(ptr, MAX_JS_DUMP);
//    if (!text || text.length < 20) return;
//
//    const idx = jsIndex++;
//    const path = findPathByPtr(ptr);
//
//    let dumpLen = dumpCStringByteLen(ptr, MAX_JS_DUMP);
//    if (dumpLen <= 0) {
//        dumpLen = Math.min(text.length, MAX_JS_DUMP);
//    }
//
//    const hash = simpleHashPtr(ptr, dumpLen);
//
//    if (!SAVE_DUPLICATE_DECRYPTED_JS) {
//        if (dumpedJsHashSet.has(hash)) {
//            console.log("[*] skip duplicate decrypted js hash=" + hash + " reason=" + reason);
//            return;
//        }
//
//        dumpedJsHashSet.add(hash);
//    }
//
//    console.log("\n========== JS PLAINTEXT DUMP ==========");
//    console.log("index  = " + idx);
//    console.log("reason = " + reason);
//    console.log("caller = " + rangeInfo(caller));
//    console.log("path   = " + (path || "UNKNOWN"));
//    console.log("len    = " + text.length);
//    console.log("bytes  = " + dumpLen);
//    console.log("hash   = " + hash);
//    console.log("dump_root = " + JS_DUMP_ROOT);
//    console.log("preview:");
//    console.log(text.substring(0, 600));
//
//    try {
//        dumpMkdirs(JS_DUMP_ROOT);
//
//        const baseName = dumpSanitizeFileName(path || "unknown");
//        const safeReason = dumpSanitizeReason(reason);
//
//        // 时间戳 + idx + hash，避免覆盖
//        const timeTag = Date.now();
//        const outName = timeTag + "_" + idx + "_" + safeReason + "_" + hash + "_" + baseName;
//        const outPath = JS_DUMP_ROOT + "/" + outName;
//
//        const ok = dumpPtrToAndroidFile(ptr, dumpLen, outPath);
//
//        const meta =
//            "index  = " + idx + "\n" +
//            "reason = " + reason + "\n" +
//            "caller = " + rangeInfo(caller) + "\n" +
//            "path   = " + (path || "UNKNOWN") + "\n" +
//            "length = " + text.length + "\n" +
//            "bytes  = " + dumpLen + "\n" +
//            "hash   = " + hash + "\n" +
//            "file   = " + outPath + "\n" +
//            "dump_root = " + JS_DUMP_ROOT + "\n";
//
//        dumpTextToAndroidFile(meta, outPath + ".meta.txt");
//
//        if (ok) {
//            console.log("[+] saved decrypted js: " + outPath);
//        } else {
//            console.log("[-] save decrypted js failed: " + outPath);
//        }
//    } catch (e) {
//        console.log("[-] android dump failed: " + e);
//    }
//
//    try {
//        send({
//            type: "js_plaintext",
//            index: idx,
//            reason: reason,
//            caller: rangeInfo(caller),
//            path: path || "UNKNOWN",
//            length: text.length,
//            bytes: dumpLen,
//            hash: hash,
//            android_path: JS_DUMP_ROOT
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
//        path: findPathByPtr(ptr),
//        time: Date.now()
//    });
//
//    while (recentEncrypted.length > 20) {
//        recentEncrypted.shift();
//    }
//}
//
//function watchInplaceDecrypt(ptr, caller) {
//    const watchId = decryptWatchIndex++;
//
//    let count = 0;
//    let dumped = false;
//
//    console.log("[*] start decrypt watch #" + watchId + " ptr=" + ptr + " path=" + (findPathByPtr(ptr) || "UNKNOWN"));
//
//    const timer = setInterval(function () {
//        count++;
//
//        try {
//            // 情况 1：原始 ptr 直接变成 JS
//            if (looksJs(ptr)) {
//                console.log("\n========== INPLACE DECRYPT FOUND ==========");
//                console.log("watch  = " + watchId);
//                console.log("ptr    = " + ptr);
//                console.log("path   = " + (findPathByPtr(ptr) || "UNKNOWN"));
//                console.log("caller = " + rangeInfo(caller));
//
//                sendJs(ptr, "inplace_ptr_watch_" + watchId, caller);
//                dumped = true;
//                clearInterval(timer);
//                return;
//            }
//
//            // 情况 2：jycrypt 头保留，body 变成 JS
//            const body = ptr.add(7);
//
//            if (looksJs(body)) {
//                console.log("\n========== INPLACE BODY DECRYPT FOUND ==========");
//                console.log("watch  = " + watchId);
//                console.log("ptr    = " + body);
//                console.log("path   = " + (findPathByPtr(body) || "UNKNOWN"));
//                console.log("caller = " + rangeInfo(caller));
//
//                sendJs(body, "inplace_ptr_plus_7_watch_" + watchId, caller);
//                dumped = true;
//                clearInterval(timer);
//                return;
//            }
//
//            // 情况 3：有些解密后真正 JS 起点有小偏移，扫前 64 字节
//            for (let off = 1; off <= 64; off++) {
//                const p = ptr.add(off);
//
//                if (looksJs(p)) {
//                    console.log("\n========== INPLACE OFFSET DECRYPT FOUND ==========");
//                    console.log("watch  = " + watchId);
//                    console.log("offset = " + off);
//                    console.log("ptr    = " + p);
//                    console.log("path   = " + (findPathByPtr(p) || "UNKNOWN"));
//                    console.log("caller = " + rangeInfo(caller));
//
//                    sendJs(p, "inplace_offset_" + off + "_watch_" + watchId, caller);
//                    dumped = true;
//                    clearInterval(timer);
//                    return;
//                }
//            }
//        } catch (e) {}
//
//        if (count > DECRYPT_WATCH_MAX_COUNT) {
//            if (!dumped) {
//                console.log("[*] decrypt watch timeout #" + watchId + " ptr=" + ptr);
//            }
//
//            clearInterval(timer);
//        }
//    }, 10);
//}
//
//// ============================================================
//// AAsset Hook
//// ============================================================
//
//function hookAAsset() {
//    const openAddr =
//        Module.findExportByName("libandroid.so", "AAssetManager_open") ||
//        Module.findExportByName(null, "AAssetManager_open");
//
//    const getBufferAddr =
//        Module.findExportByName("libandroid.so", "AAsset_getBuffer") ||
//        Module.findExportByName(null, "AAsset_getBuffer");
//
//    const getLengthAddr =
//        Module.findExportByName("libandroid.so", "AAsset_getLength") ||
//        Module.findExportByName(null, "AAsset_getLength");
//
//    const readAddr =
//        Module.findExportByName("libandroid.so", "AAsset_read") ||
//        Module.findExportByName(null, "AAsset_read");
//
//    const closeAddr =
//        Module.findExportByName("libandroid.so", "AAsset_close") ||
//        Module.findExportByName(null, "AAsset_close");
//
//    let AAsset_getLength = null;
//
//    if (getLengthAddr) {
//        try {
//            AAsset_getLength = new NativeFunction(getLengthAddr, "long", ["pointer"]);
//        } catch (e) {
//            AAsset_getLength = null;
//        }
//    }
//
//    if (openAddr) {
//        Interceptor.attach(openAddr, {
//            onEnter(args) {
//                this.path = safeReadCString(args[1]);
//            },
//            onLeave(retval) {
//                if (!retval || retval.isNull()) return;
//                if (!this.path) return;
//
//                assetPathMap.set(retval.toString(), this.path);
//                rememberPath(this.path, "AAssetManager_open");
//
//                console.log("[AAssetManager_open] asset=" + retval + " path=" + this.path);
//            }
//        });
//
//        console.log("[+] hook AAssetManager_open");
//    } else {
//        console.log("[-] AAssetManager_open not found");
//    }
//
//    if (getBufferAddr) {
//        Interceptor.attach(getBufferAddr, {
//            onEnter(args) {
//                this.asset = args[0];
//                this.path = assetPathMap.get(this.asset.toString()) || null;
//                this.caller = this.returnAddress;
//            },
//            onLeave(retval) {
//                if (!retval || retval.isNull()) return;
//                if (!this.path) return;
//
//                let len = 0;
//
//                try {
//                    if (AAsset_getLength) {
//                        len = safeNum(AAsset_getLength(this.asset));
//                    }
//                } catch (e) {
//                    len = 0;
//                }
//
//                if (len > 0) {
//                    addMemRange(retval, len, this.path, "AAsset_getBuffer");
//                    console.log("[AAsset_getBuffer] path=" + this.path + " buf=" + retval + " len=" + len);
//
//                    try {
//                        if (hasJycrypt(retval)) {
//                            console.log("[*] jycrypt asset buffer found by AAsset_getBuffer path=" + this.path + " ptr=" + retval);
//                            rememberEncrypted(retval, this.caller || ptr(0));
//                            watchInplaceDecrypt(retval, this.caller || ptr(0));
//                        }
//
//                        // 有些资源可能已经是明文 JS
//                        if (looksJs(retval)) {
//                            sendJs(retval, "AAsset_getBuffer_plain_js", this.caller || ptr(0));
//                        }
//                    } catch (e) {
//                        console.log("[-] AAsset_getBuffer decrypt watch failed: " + e);
//                    }
//                }
//            }
//        });
//
//        console.log("[+] hook AAsset_getBuffer");
//    } else {
//        console.log("[-] AAsset_getBuffer not found");
//    }
//
//    if (readAddr) {
//        Interceptor.attach(readAddr, {
//            onEnter(args) {
//                this.asset = args[0];
//                this.buf = args[1];
//                this.count = safeNum(args[2]);
//                this.path = assetPathMap.get(this.asset.toString()) || null;
//                this.caller = this.returnAddress;
//            },
//            onLeave(retval) {
//                const n = safeNum(retval);
//
//                if (n <= 0) return;
//                if (!this.path) return;
//
//                addMemRange(this.buf, n, this.path, "AAsset_read");
//
//                try {
//                    if (hasJycrypt(this.buf)) {
//                        console.log("[*] jycrypt asset buffer found by AAsset_read path=" + this.path + " ptr=" + this.buf + " len=" + n);
//                        rememberEncrypted(this.buf, this.caller || ptr(0));
//                        watchInplaceDecrypt(this.buf, this.caller || ptr(0));
//                    }
//
//                    // 如果 read 出来已经是 JS 明文，也直接保存
//                    if (looksJs(this.buf)) {
//                        sendJs(this.buf, "AAsset_read_plain_js", this.caller || ptr(0));
//                    }
//                } catch (e) {
//                    console.log("[-] AAsset_read decrypt watch failed: " + e);
//                }
//            }
//        });
//
//        console.log("[+] hook AAsset_read");
//    } else {
//        console.log("[-] AAsset_read not found");
//    }
//
//    if (closeAddr) {
//        Interceptor.attach(closeAddr, {
//            onEnter(args) {
//                const key = args[0].toString();
//                const path = assetPathMap.get(key);
//
//                if (path) {
//                    assetPathMap.delete(key);
//                }
//            }
//        });
//
//        console.log("[+] hook AAsset_close");
//    }
//}
//
//// ============================================================
//// File API Hook：默认保持注释状态
//// ============================================================
//
//function hookFileApi() {
////    hookOpen("open", 0);
////    hookOpen("open64", 0);
////    hookOpen("openat", 1);
////    hookOpen("__openat", 1);
////
////    hookRead("read");
////    hookRead("pread");
////    hookRead("pread64");
////
////    hookFopen("fopen");
////    hookFopen("fopen64");
////    hookFread("fread");
////    hookFclose("fclose");
////
////    hookMmap("mmap");
////    hookMmap("mmap64");
//}
//
//function hookOpen(name, pathIndex) {
//    const addr = Module.findExportByName("libc.so", name) || Module.findExportByName(null, name);
//
//    if (!addr) return;
//
//    Interceptor.attach(addr, {
//        onEnter(args) {
//            this.path = safeReadCString(args[pathIndex]);
//        },
//        onLeave(retval) {
//            const fd = safeNum(retval);
//
//            if (fd < 0) return;
//            if (!this.path) return;
//
//            fdPathMap.set(fd, this.path);
//            rememberPath(this.path, name);
//
//            console.log("[" + name + "] fd=" + fd + " path=" + this.path);
//        }
//    });
//
//    console.log("[+] hook " + name);
//}
//
//function hookRead(name) {
//    const addr = Module.findExportByName("libc.so", name) || Module.findExportByName(null, name);
//
//    if (!addr) return;
//
//    Interceptor.attach(addr, {
//        onEnter(args) {
//            this.fd = safeNum(args[0]);
//            this.buf = args[1];
//            this.path = fdPathMap.get(this.fd) || null;
//        },
//        onLeave(retval) {
//            const n = safeNum(retval);
//
//            if (n <= 0) return;
//            if (!this.path) return;
//
//            addMemRange(this.buf, n, this.path, name);
//
//            try {
//                if (hasJycrypt(this.buf)) {
//                    console.log("[*] jycrypt file buffer found by " + name + " path=" + this.path + " ptr=" + this.buf + " len=" + n);
//                    rememberEncrypted(this.buf, this.returnAddress || ptr(0));
//                    watchInplaceDecrypt(this.buf, this.returnAddress || ptr(0));
//                }
//
//                if (looksJs(this.buf)) {
//                    sendJs(this.buf, name + "_plain_js", this.returnAddress || ptr(0));
//                }
//            } catch (e) {}
//        }
//    });
//
//    console.log("[+] hook " + name);
//}
//
//function hookFopen(name) {
//    const addr = Module.findExportByName("libc.so", name) || Module.findExportByName(null, name);
//
//    if (!addr) return;
//
//    Interceptor.attach(addr, {
//        onEnter(args) {
//            this.path = safeReadCString(args[0]);
//        },
//        onLeave(retval) {
//            if (!retval || retval.isNull()) return;
//            if (!this.path) return;
//
//            filePathMap.set(retval.toString(), this.path);
//            rememberPath(this.path, name);
//
//            console.log("[" + name + "] FILE=" + retval + " path=" + this.path);
//        }
//    });
//
//    console.log("[+] hook " + name);
//}
//
//function hookFread(name) {
//    const addr = Module.findExportByName("libc.so", name) || Module.findExportByName(null, name);
//
//    if (!addr) return;
//
//    Interceptor.attach(addr, {
//        onEnter(args) {
//            this.ptr = args[0];
//            this.size = safeNum(args[1]);
//            this.nmemb = safeNum(args[2]);
//            this.file = args[3];
//            this.path = filePathMap.get(this.file.toString()) || null;
//            this.caller = this.returnAddress;
//        },
//        onLeave(retval) {
//            const count = safeNum(retval);
//            const total = count * this.size;
//
//            if (total <= 0) return;
//            if (!this.path) return;
//
//            addMemRange(this.ptr, total, this.path, name);
//
//            try {
//                if (hasJycrypt(this.ptr)) {
//                    console.log("[*] jycrypt file buffer found by " + name + " path=" + this.path + " ptr=" + this.ptr + " len=" + total);
//                    rememberEncrypted(this.ptr, this.caller || ptr(0));
//                    watchInplaceDecrypt(this.ptr, this.caller || ptr(0));
//                }
//
//                if (looksJs(this.ptr)) {
//                    sendJs(this.ptr, name + "_plain_js", this.caller || ptr(0));
//                }
//            } catch (e) {}
//        }
//    });
//
//    console.log("[+] hook " + name);
//}
//
//function hookFclose(name) {
//    const addr = Module.findExportByName("libc.so", name) || Module.findExportByName(null, name);
//
//    if (!addr) return;
//
//    Interceptor.attach(addr, {
//        onEnter(args) {
//            const key = args[0].toString();
//
//            if (filePathMap.has(key)) {
//                filePathMap.delete(key);
//            }
//        }
//    });
//
//    console.log("[+] hook " + name);
//}
//
//function hookMmap(name) {
//    const addr = Module.findExportByName("libc.so", name) || Module.findExportByName(null, name);
//
//    if (!addr) return;
//
//    Interceptor.attach(addr, {
//        onEnter(args) {
//            this.length = safeNum(args[1]);
//            this.fd = safeNum(args[4]);
//            this.path = fdPathMap.get(this.fd) || null;
//            this.caller = this.returnAddress;
//        },
//        onLeave(retval) {
//            if (!retval || retval.isNull()) return;
//            if (retval.equals(ptr("-1"))) return;
//            if (!this.path) return;
//            if (this.length <= 0) return;
//
//            addMemRange(retval, this.length, this.path, name);
//            console.log("[" + name + "] path=" + this.path + " addr=" + retval + " len=" + this.length);
//
//            try {
//                if (hasJycrypt(retval)) {
//                    console.log("[*] jycrypt mmap buffer found by " + name + " path=" + this.path + " ptr=" + retval + " len=" + this.length);
//                    rememberEncrypted(retval, this.caller || ptr(0));
//                    watchInplaceDecrypt(retval, this.caller || ptr(0));
//                }
//
//                if (looksJs(retval)) {
//                    sendJs(retval, name + "_plain_js", this.caller || ptr(0));
//                }
//            } catch (e) {}
//        }
//    });
//
//    console.log("[+] hook " + name);
//}
//
//// ============================================================
//// memcmp Hook
//// ============================================================
//
//function hookMemcmp() {
//    const addr = Module.findExportByName("libc.so", "memcmp");
//
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
//
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
//            const aJs = looksJs(a);
//            const bJs = looksJs(b);
//
//            if (!aJy && !bJy && !aJs && !bJs) return;
//
//            this.hit = true;
//            this.a = a;
//            this.b = b;
//            this.n = n;
//            this.aJy = aJy;
//            this.bJy = bJy;
//            this.aJs = aJs;
//            this.bJs = bJs;
//            this.caller = this.returnAddress;
//        },
//
//        onLeave(retval) {
//            if (!this.hit) return;
//
//            const ret = retval.toInt32();
//            const idx = hitIndex++;
//
//            const pathA = findPathByPtr(this.a);
//            const pathB = findPathByPtr(this.b);
//
//            console.log("\n========== JYCRYPT MEMCMP ==========");
//            console.log("index  = " + idx);
//            console.log("caller = " + rangeInfo(this.caller));
//            console.log("len    = " + this.n);
//            console.log("ret    = " + ret);
//
//            console.log("arg0   = " + this.a + " jy=" + this.aJy + " js=" + this.aJs);
//            console.log("path0  = " + (pathA || "UNKNOWN"));
//            console.log(dumpHead(this.a, 10));
//
//            console.log("arg1   = " + this.b + " jy=" + this.bJy + " js=" + this.bJs);
//            console.log("path1  = " + (pathB || "UNKNOWN"));
//            console.log(dumpHead(this.b, 10));
//
//            if (ret === 0) {
//                const encPtr = this.aJy ? this.a : this.b;
//                const encPath = findPathByPtr(encPtr);
//
//                console.log(">>> ret=0，当前 buffer 是 jycrypt 密文");
//                console.log(">>> encPtr = " + encPtr);
//                console.log(">>> encPath = " + (encPath || "UNKNOWN"));
//                console.log(">>> caller  = " + rangeInfo(this.caller));
//
//                rememberEncrypted(encPtr, this.caller);
//                watchInplaceDecrypt(encPtr, this.caller);
//            }
//
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
//// ============================================================
//// 启动
//// ============================================================
//
//setImmediate(function () {
//    console.log("========== Hook JYCRYPT Stage2 + Save All Decrypted JS ==========");
//    console.log("[*] dump root = " + DUMP_ROOT);
//    console.log("[*] js dump root = " + JS_DUMP_ROOT);
//
//    dumpMkdirs(DUMP_ROOT);
//    dumpMkdirs(JS_DUMP_ROOT);
//
//    const markerPath = DUMP_ROOT + "/_script_started.txt";
//
//    const ok = dumpTextToAndroidFile(
//        "script started\n" +
//        "dump_root = " + DUMP_ROOT + "\n" +
//        "js_dump_root = " + JS_DUMP_ROOT + "\n" +
//        "time = " + Date.now() + "\n",
//        markerPath
//    );
//
//    if (ok) {
//        console.log("[+] wrote marker: " + markerPath);
//    } else {
//        console.log("[-] wrote marker failed: " + markerPath);
//    }
//
//    hookAAsset();
//    hookFileApi();
//    hookMemcmp();
//
//    console.log("========== Hook Installed ==========");
//});