'use strict';

/*
 * Cocos Creator Texture 路径链路追踪
 * 重点：
 * 1. FileUtils / AAsset / open/read 打印路径
 * 2. dump import/json/lvconf 等文本内容片段
 * 3. Hook Image::initWithImageFile
 * 4. Hook ImageAsset / Texture2D / SimpleTexture 上传链路
 */

const CFG = {
    PRINT_STACK: false,

    // 第一次建议只开 true，日志太多再关
    DUMP_TEXT_CONTENT: true,

    // 同一个路径最多打印几次
    SAME_PATH_LIMIT: 3,

    // std::string 参数探测数量
    STD_STRING_ARG_COUNT: 8,

    // 只扫描这些 so；空数组表示扫描所有 so
    MODULE_HINTS: [
        "libcocos",
        "libgame",
        "libnative",
        "libil2cpp",
        "libmain"
    ],

    // 如果 so 符号被 strip，可以把 IDA 里的 offset 填这里
    // offset 是函数相对 so base 的偏移，不是绝对地址
    MANUAL_HOOKS: [
        // { module: "libcocos.so", offset: "0x123456", tag: "Image.initWithImageFile" },
        // { module: "libcocos.so", offset: "0x234567", tag: "Texture2D.setMipmaps" },
    ],

    PATH_KEYWORDS: [
        ".png", ".jpg", ".jpeg", ".webp",
        ".pvr", ".pkm", ".astc",
        ".json", ".plist", ".atlas", ".txt",
        ".lvconf", ".fnt", ".bin",
        "assets/", "assets\\",
        "import", "native",
        "resources", "res/",
        "texture", "sprite",
        "关卡", "配置"
    ],

    TEXT_DUMP_KEYWORDS: [
        ".json", ".plist", ".atlas", ".txt",
        ".lvconf", ".fnt",
        "config", "settings", "import"
    ],

    MAX_DUMP_BYTES: 1200
};

const hooked = {};
const fdPath = {};
const assetPath = {};
const pathCounter = {};
const contentCounter = {};
const lastPathByThread = {};

function now() {
    return new Date().toISOString().replace("T", " ").replace("Z", "");
}

function tidOf(ctx) {
    try {
        return ctx.threadId;
    } catch (_) {
        return 0;
    }
}

function isReadable(p) {
    try {
        p = ptr(p);
        if (p.isNull()) return false;
        const r = Process.findRangeByAddress(p);
        return !!r && r.protection.indexOf("r") >= 0;
    } catch (_) {
        return false;
    }
}

function readCStringSafe(p) {
    try {
        p = ptr(p);
        if (!isReadable(p)) return null;
        const s = p.readUtf8String();
        if (!s || s.length <= 0) return null;
        return s;
    } catch (_) {
        return null;
    }
}

function readSizeT(p) {
    if (Process.pointerSize === 8) {
        return Number(p.readU64());
    }
    return p.readU32();
}

function isTextLike(s) {
    if (!s || s.length <= 0) return false;
    if (s.length > 4096) return false;

    let bad = 0;
    for (let i = 0; i < s.length; i++) {
        const c = s.charCodeAt(i);
        if (c < 0x20 && c !== 0x09 && c !== 0x0a && c !== 0x0d) {
            bad++;
        }
    }
    return bad <= 2;
}

function interestingPath(s) {
    if (!s) return false;
    const x = s.toLowerCase();

    for (const k of CFG.PATH_KEYWORDS) {
        if (x.indexOf(k.toLowerCase()) >= 0) return true;
    }

    // uuid / hash 风格文件名
    if (/[a-f0-9]{16,}/i.test(s)) return true;
    if (/[A-Z0-9]{8,}\.(png|jpg|jpeg|webp|json|lvconf|bin)/i.test(s)) return true;

    return false;
}

function shouldDumpContent(path) {
    if (!CFG.DUMP_TEXT_CONTENT || !path) return false;
    const x = path.toLowerCase();

    for (const k of CFG.TEXT_DUMP_KEYWORDS) {
        if (x.indexOf(k.toLowerCase()) >= 0) return true;
    }
    return false;
}

function readStdString(p) {
    try {
        p = ptr(p);
        if (!isReadable(p)) return null;

        const candidates = [];

        // libc++ short string:
        // first byte = size << 1, lowest bit 0
        try {
            const b0 = p.readU8();
            const len = b0 >> 1;
            if ((b0 & 1) === 0 && len >= 0 && len < 256 && isReadable(p.add(1))) {
                const s = p.add(1).readUtf8String(len);
                if (isTextLike(s)) candidates.push(s);
            }
        } catch (_) {}

        // libc++ long string:
        // [cap][size][data]
        try {
            const len = readSizeT(p.add(Process.pointerSize));
            const data = p.add(Process.pointerSize * 2).readPointer();
            if (len > 0 && len < 1024 * 1024 && isReadable(data)) {
                const s = data.readUtf8String(len);
                if (isTextLike(s)) candidates.push(s);
            }
        } catch (_) {}

        // libstdc++ 常见布局：
        // [data][size][cap]
        try {
            const data = p.readPointer();
            const len = readSizeT(p.add(Process.pointerSize));
            if (len > 0 && len < 1024 * 1024 && isReadable(data)) {
                const s = data.readUtf8String(len);
                if (isTextLike(s)) candidates.push(s);
            }
        } catch (_) {}

        if (candidates.length <= 0) return null;

        for (const s of candidates) {
            if (interestingPath(s)) return s;
        }

        return candidates[0];
    } catch (_) {
        return null;
    }
}

function snapshotStdStringArgs(args, count) {
    const out = [];

    for (let i = 0; i < count; i++) {
        try {
            const p = args[i];
            const s = readStdString(p);
            if (s && interestingPath(s)) {
                out.push({
                    index: i,
                    ptr: p,
                    value: s
                });
            }
        } catch (_) {}
    }

    return out;
}

function snapshotStdStringPtrs(ptrs) {
    const out = [];

    for (let i = 0; i < ptrs.length; i++) {
        try {
            const p = ptrs[i];
            const s = readStdString(p);
            if (s && interestingPath(s)) {
                out.push({
                    index: i,
                    ptr: p,
                    value: s
                });
            }
        } catch (_) {}
    }

    return out;
}

function fmtArgStrings(arr) {
    if (!arr || arr.length <= 0) return "";
    return arr.map(x => `arg[${x.index}] ${x.ptr} = "${x.value}"`).join("\n");
}

function bt(ctx) {
    if (!CFG.PRINT_STACK) return "";
    try {
        return Thread.backtrace(ctx.context, Backtracer.ACCURATE)
            .map(DebugSymbol.fromAddress)
            .join("\n");
    } catch (_) {
        return "";
    }
}

function rememberPath(ctx, tag, path) {
    if (!path) return;
    const tid = tidOf(ctx);
    lastPathByThread[tid] = {
        time: Date.now(),
        tag: tag,
        path: path
    };
}

function recentPath(ctx) {
    const tid = tidOf(ctx);
    const r = lastPathByThread[tid];
    if (!r) return null;

    const age = Date.now() - r.time;
    if (age > 3000) return null;

    return `${r.tag}: ${r.path}, age=${age}ms`;
}

function limitedPathLog(key, limit) {
    pathCounter[key] = pathCounter[key] || 0;
    pathCounter[key]++;
    return pathCounter[key] <= limit;
}

function limitedContentLog(key, limit) {
    contentCounter[key] = contentCounter[key] || 0;
    contentCounter[key]++;
    return contentCounter[key] <= limit;
}

function logPath(ctx, tag, path, extra) {
    if (!path || !interestingPath(path)) return;

    rememberPath(ctx, tag, path);

    const key = tag + "|" + path;
    if (!limitedPathLog(key, CFG.SAME_PATH_LIMIT)) return;

    let msg = "";
    msg += `\n========== ${tag} ==========\n`;
    msg += `time = ${now()}\n`;
    msg += `tid  = ${tidOf(ctx)}\n`;
    msg += `path = ${path}\n`;
    if (extra) msg += extra + "\n";

    const stack = bt(ctx);
    if (stack) msg += "\n[backtrace]\n" + stack + "\n";

    console.log(msg);
}

function bytesToPrintable(buf, len) {
    try {
        const n = Math.min(len, CFG.MAX_DUMP_BYTES);
        const ab = buf.readByteArray(n);
        if (!ab) return "";

        const u8 = new Uint8Array(ab);
        let s = "";

        for (let i = 0; i < u8.length; i++) {
            const c = u8[i];

            if (c === 0x0a) {
                s += "\n";
            } else if (c === 0x0d) {
                s += "\r";
            } else if (c === 0x09) {
                s += "\t";
            } else if (c >= 0x20 && c <= 0x7e) {
                s += String.fromCharCode(c);
            } else {
                s += ".";
            }
        }

        return s;
    } catch (_) {
        return "";
    }
}

function dumpBuffer(ctx, tag, path, buf, len) {
    if (!path || !shouldDumpContent(path)) return;
    if (!buf || ptr(buf).isNull()) return;
    if (len <= 0) return;

    const key = tag + "|" + path;
    if (!limitedContentLog(key, 2)) return;

    const text = bytesToPrintable(ptr(buf), len);
    if (!text) return;

    let msg = "";
    msg += `\n========== CONTENT ${tag} ==========\n`;
    msg += `time = ${now()}\n`;
    msg += `tid  = ${tidOf(ctx)}\n`;
    msg += `path = ${path}\n`;
    msg += `size = ${len}\n`;
    msg += `---- dump begin ----\n`;
    msg += text;
    msg += `\n---- dump end ----\n`;

    console.log(msg);
}

function attachOnce(addr, name, callbacks) {
    try {
        const k = ptr(addr).toString();
        if (hooked[k]) return false;
        hooked[k] = true;

        Interceptor.attach(ptr(addr), callbacks);
        console.log(`[+] hook ${name} => ${addr}`);
        return true;
    } catch (e) {
        console.log(`[-] hook failed ${name} @ ${addr}: ${e}`);
        return false;
    }
}

function hookExport(name, callbacks) {
    try {
        const addr = Module.findExportByName(null, name);
        if (!addr) return false;
        return attachOnce(addr, name, callbacks);
    } catch (_) {
        return false;
    }
}

function installLibcHooks() {
    hookExport("open", {
        onEnter(args) {
            this.path = readCStringSafe(args[0]);
        },
        onLeave(retval) {
            const fd = retval.toInt32();
            if (fd >= 0 && this.path) {
                fdPath[fd] = this.path;
                logPath(this, "open", this.path, `fd = ${fd}`);
            }
        }
    });

    hookExport("open64", {
        onEnter(args) {
            this.path = readCStringSafe(args[0]);
        },
        onLeave(retval) {
            const fd = retval.toInt32();
            if (fd >= 0 && this.path) {
                fdPath[fd] = this.path;
                logPath(this, "open64", this.path, `fd = ${fd}`);
            }
        }
    });

    hookExport("openat", {
        onEnter(args) {
            this.path = readCStringSafe(args[1]);
        },
        onLeave(retval) {
            const fd = retval.toInt32();
            if (fd >= 0 && this.path) {
                fdPath[fd] = this.path;
                logPath(this, "openat", this.path, `fd = ${fd}`);
            }
        }
    });

    hookExport("fopen", {
        onEnter(args) {
            this.path = readCStringSafe(args[0]);
            if (this.path) {
                logPath(this, "fopen", this.path, "");
            }
        }
    });

    hookExport("access", {
        onEnter(args) {
            const path = readCStringSafe(args[0]);
            if (path) {
                logPath(this, "access", path, "");
            }
        }
    });

    hookExport("stat", {
        onEnter(args) {
            const path = readCStringSafe(args[0]);
            if (path) {
                logPath(this, "stat", path, "");
            }
        }
    });

    hookExport("lstat", {
        onEnter(args) {
            const path = readCStringSafe(args[0]);
            if (path) {
                logPath(this, "lstat", path, "");
            }
        }
    });

    hookExport("read", {
        onEnter(args) {
            this.fd = args[0].toInt32();
            this.buf = args[1];
            this.path = fdPath[this.fd];
        },
        onLeave(retval) {
            const n = retval.toInt32();
            if (n > 0 && this.path) {
                dumpBuffer(this, "read", this.path, this.buf, n);
            }
        }
    });

    hookExport("close", {
        onEnter(args) {
            const fd = args[0].toInt32();
            if (fdPath[fd]) delete fdPath[fd];
        }
    });
}

function installAssetHooks() {
    let getLength = null;

    try {
        const pLen = Module.findExportByName(null, "AAsset_getLength");
        if (pLen) {
            getLength = new NativeFunction(pLen, "int", ["pointer"]);
        }
    } catch (_) {}

    hookExport("AAssetManager_open", {
        onEnter(args) {
            this.path = readCStringSafe(args[1]);
        },
        onLeave(retval) {
            if (!retval.isNull() && this.path) {
                assetPath[retval.toString()] = this.path;
                logPath(this, "AAssetManager_open", this.path, `asset = ${retval}`);
            }
        }
    });

    hookExport("AAsset_read", {
        onEnter(args) {
            this.asset = args[0];
            this.buf = args[1];
            this.path = assetPath[this.asset.toString()];
        },
        onLeave(retval) {
            const n = retval.toInt32();
            if (n > 0 && this.path) {
                dumpBuffer(this, "AAsset_read", this.path, this.buf, n);
            }
        }
    });

    hookExport("AAsset_getBuffer", {
        onEnter(args) {
            this.asset = args[0];
            this.path = assetPath[this.asset.toString()];
        },
        onLeave(retval) {
            if (!retval.isNull() && this.path && getLength) {
                try {
                    const n = getLength(this.asset);
                    dumpBuffer(this, "AAsset_getBuffer", this.path, retval, n);
                } catch (_) {}
            }
        }
    });

    hookExport("AAsset_close", {
        onEnter(args) {
            const k = args[0].toString();
            if (assetPath[k]) delete assetPath[k];
        }
    });
}

function containsAny(s, arr) {
    for (const x of arr) {
        if (s.indexOf(x) >= 0) return true;
    }
    return false;
}

function classifySymbol(name) {
    if (name.indexOf("jsb_global_load_image") >= 0) {
        return "JSB.loadImage";
    }

    if (
        name.indexOf("initWithImageFile") >= 0 &&
        (
            name.indexOf("Image") >= 0 ||
            name.indexOf("cocos2d") >= 0 ||
            name.indexOf("cc") >= 0
        )
    ) {
        return "Image.initWithImageFile";
    }

    if (
        name.indexOf("initWithImageData") >= 0 &&
        (
            name.indexOf("Image") >= 0 ||
            name.indexOf("cocos2d") >= 0 ||
            name.indexOf("cc") >= 0
        )
    ) {
        return "Image.initWithImageData";
    }

    if (
        name.indexOf("FileUtils") >= 0 &&
        containsAny(name, [
            "fullPathForFilename",
            "getPathForFilename",
            "getDataFromFile",
            "getStringFromFile",
            "isFileExist",
            "isFileExistInternal",
            "getContents",
            "getDataFromZip"
        ])
    ) {
        return "FileUtils";
    }

    if (
        name.indexOf("ImageAsset") >= 0 &&
        containsAny(name, [
            "setData",
            "setNativeAsset",
            "setFormat",
            "reset"
        ])
    ) {
        return "ImageAsset";
    }

    if (
        name.indexOf("Texture2D") >= 0 &&
        containsAny(name, [
            "onLoaded",
            "initialize",
            "setMipmaps",
            "setMipmapParams",
            "assignImage",
            "reset"
        ])
    ) {
        return "TextureStep";
    }

    if (
        name.indexOf("SimpleTexture") >= 0 &&
        containsAny(name, [
            "tryReset",
            "createTexture",
            "uploadData",
            "reset"
        ])
    ) {
        return "TextureStep";
    }

    if (name.indexOf("copyBuffersToTexture") >= 0) {
        return "GFX.copyBuffersToTexture";
    }

    return null;
}

function makeCppHook(tag, symbolName) {
    return {
        onEnter(args) {
            this.tag = tag;
            this.symbolName = symbolName;
            this.argPtrs = [];

            for (let i = 0; i < CFG.STD_STRING_ARG_COUNT; i++) {
                try {
                    this.argPtrs.push(args[i]);
                } catch (_) {}
            }

            const strings = snapshotStdStringArgs(args, CFG.STD_STRING_ARG_COUNT);

            if (tag === "Image.initWithImageFile") {
                let path = null;
                if (strings.length > 0) path = strings[0].value;

                let msg = "";
                msg += `symbol = ${symbolName}\n`;
                if (strings.length > 0) msg += fmtArgStrings(strings) + "\n";

                logPath(this, "ImageFile", path || symbolName, msg);
                if (path) rememberPath(this, "ImageFile", path);
                return;
            }

            if (tag === "FileUtils") {
                if (strings.length > 0) {
                    let msg = "";
                    msg += `symbol = ${symbolName}\n`;
                    msg += fmtArgStrings(strings) + "\n";

                    logPath(this, "FileUtils", strings[0].value, msg);
                }
                return;
            }

            if (tag === "JSB.loadImage") {
                let msg = "";
                msg += `symbol = ${symbolName}\n`;
                const near = recentPath(this);
                if (near) msg += `recent_path = ${near}\n`;

                console.log(`\n========== JSB.loadImage ==========\n${msg}`);
                return;
            }

            if (tag === "Image.initWithImageData") {
                let msg = "";
                msg += `symbol = ${symbolName}\n`;
                msg += `arg0 = ${args[0]}\n`;
                msg += `arg1 = ${args[1]}\n`;
                msg += `arg2 = ${args[2]}\n`;
                const near = recentPath(this);
                if (near) msg += `recent_path = ${near}\n`;

                console.log(`\n========== ImageData ==========\n${msg}`);
                return;
            }

            if (tag === "ImageAsset") {
                let msg = "";
                msg += `symbol = ${symbolName}\n`;
                const near = recentPath(this);
                if (near) msg += `recent_path = ${near}\n`;
                if (strings.length > 0) msg += fmtArgStrings(strings) + "\n";

                console.log(`\n========== ImageAsset ==========\n${msg}`);
                return;
            }

            if (tag === "TextureStep" || tag === "GFX.copyBuffersToTexture") {
                const key = tag + "|" + symbolName;
                if (!limitedPathLog(key, 30)) return;

                let msg = "";
                msg += `symbol = ${symbolName}\n`;
                const near = recentPath(this);
                if (near) msg += `recent_path = ${near}\n`;
                if (strings.length > 0) msg += fmtArgStrings(strings) + "\n";

                console.log(`\n========== ${tag} ==========\n${msg}`);
                return;
            }
        },

        onLeave(retval) {
            if (this.tag !== "FileUtils") return;

            const after = snapshotStdStringPtrs(this.argPtrs);
            if (after.length <= 0) return;

            let msg = "";
            msg += `symbol = ${this.symbolName}\n`;
            msg += `[after]\n`;
            msg += fmtArgStrings(after) + "\n";

            console.log(`\n========== FileUtils.return ==========\n${msg}`);
        }
    };
}

function moduleWanted(m) {
    if (!m || !m.name) return false;
    if (m.name.indexOf(".so") < 0) return false;

    if (CFG.MODULE_HINTS.length <= 0) return true;

    const n = m.name.toLowerCase();
    for (const h of CFG.MODULE_HINTS) {
        if (n.indexOf(h.toLowerCase()) >= 0) return true;
    }

    return false;
}

function installCppSymbolHooks() {
    const modules = Process.enumerateModules();
    let count = 0;

    for (const m of modules) {
        if (!moduleWanted(m)) continue;

        let symbols = [];
        try {
            symbols = Module.enumerateSymbolsSync(m.name);
        } catch (_) {
            continue;
        }

        for (const s of symbols) {
            if (!s || !s.address || !s.name) continue;
            if (s.type && s.type !== "function") continue;

            const tag = classifySymbol(s.name);
            if (!tag) continue;

            if (attachOnce(s.address, `${tag} ${s.name}`, makeCppHook(tag, s.name))) {
                count++;
            }
        }
    }

    console.log(`[+] cpp symbol hooks installed: ${count}`);
}

function installManualHooks() {
    for (const h of CFG.MANUAL_HOOKS) {
        try {
            const m = Process.findModuleByName(h.module);
            if (!m) {
                console.log(`[-] manual hook module not found: ${h.module}`);
                continue;
            }

            const off = parseInt(h.offset, 16);
            const addr = m.base.add(off);
            const name = `${h.tag} ${h.module}+${h.offset}`;

            attachOnce(addr, name, makeCppHook(h.tag, name));
        } catch (e) {
            console.log(`[-] manual hook failed: ${JSON.stringify(h)} ${e}`);
        }
    }
}

function hookDlopen() {
    function onLoadHook(name) {
        hookExport(name, {
            onEnter(args) {
                this.path = readCStringSafe(args[0]);
            },
            onLeave(retval) {
                if (!this.path) return;
                if (this.path.indexOf(".so") < 0) return;

                setTimeout(function () {
                    installCppSymbolHooks();
                    installManualHooks();
                }, 100);
            }
        });
    }

    onLoadHook("dlopen");
    onLoadHook("android_dlopen_ext");
}

function main() {
    console.log("========== Cocos Texture Path Trace ==========");
    console.log(`pointerSize = ${Process.pointerSize}`);
    console.log(`printStack  = ${CFG.PRINT_STACK}`);

    installLibcHooks();
    installAssetHooks();
    installCppSymbolHooks();
    installManualHooks();
    hookDlopen();

    console.log("========== Trace Installed ==========");
}

setImmediate(main);