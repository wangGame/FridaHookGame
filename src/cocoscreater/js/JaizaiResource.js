// HookCocosResources.js
// 用途：追踪 Cocos Creator / Cocos2d-x 实际加载了哪些资源
// Android Frida 使用

'use strict';

const CONFIG = {
    // 只打印这些后缀，避免日志爆炸
    exts: [
        ".json", ".plist", ".png", ".jpg", ".jpeg", ".webp",
        ".atlas", ".fnt", ".ttf", ".mp3", ".ogg", ".wav",
        ".bin", ".cconb", ".ccjson", ".bundle", ".pak",
        ".lvconf", ".prefab", ".scene", ".anim", ".mtl", ".effect"
    ],

    // 只关心这些路径关键词；为空则不过滤路径
    pathKeywords: [
        "assets/",
        "res/",
        "src/",
        "jsb-adapter/",
        "import/",
        "native/",
        "resources/",
        "关卡",
        "config",
        "level"
    ],

    printStack: false,
    maxPathLen: 4096
};

const seen = new Set();

function shouldLog(path) {
    if (!path) return false;
    if (path.length <= 0 || path.length > CONFIG.maxPathLen) return false;

    const lower = path.toLowerCase();

    let extOk = CONFIG.exts.length === 0;
    for (const e of CONFIG.exts) {
        if (lower.endsWith(e.toLowerCase())) {
            extOk = true;
            break;
        }
    }

    let keyOk = CONFIG.pathKeywords.length === 0;
    for (const k of CONFIG.pathKeywords) {
        if (path.indexOf(k) >= 0) {
            keyOk = true;
            break;
        }
    }

    return extOk || keyOk;
}

function logResource(tag, path) {
    if (!shouldLog(path)) return;

    const key = tag + "|" + path;
    if (seen.has(key)) return;
    seen.add(key);

    console.log("\n========== COCOS RESOURCE ==========");
    console.log("type = " + tag);
    console.log("path = " + path);

    if (CONFIG.printStack) {
        console.log(
            Thread.backtrace(this.context, Backtracer.ACCURATE)
                .map(DebugSymbol.fromAddress)
                .join("\n")
        );
    }
}

function readCString(p) {
    try {
        if (p.isNull()) return null;
        return p.readUtf8String();
    } catch (e) {
        return null;
    }
}

// libc++ std::__ndk1::string
function readStdString(p) {
    try {
        if (p.isNull()) return null;

        const first = p.readU8();

        // libc++ short string
        if ((first & 1) === 0) {
            const len = first >> 1;
            if (len <= 0 || len > 512) return null;
            return p.add(1).readUtf8String(len);
        }

        // libc++ long string
        const dataPtr = p.add(Process.pointerSize * 2).readPointer();
        if (dataPtr.isNull()) return null;

        return dataPtr.readUtf8String();
    } catch (e) {
        return null;
    }
}

function tryReadStdStringArgs(args, count) {
    const result = [];

    for (let i = 0; i < count; i++) {
        try {
            const s = readStdString(args[i]);
            if (s && shouldLog(s)) {
                result.push({
                    index: i,
                    value: s
                });
            }
        } catch (e) {}
    }

    return result;
}

function hookExport(moduleName, exportName, tag, argIndex, isCString) {
    const addr = Module.findExportByName(moduleName, exportName);
    if (!addr) return false;

    console.log("[+] hook " + moduleName + "!" + exportName + " => " + addr);

    Interceptor.attach(addr, {
        onEnter(args) {
            let path = null;
            if (isCString) {
                path = readCString(args[argIndex]);
            } else {
                path = readStdString(args[argIndex]);
            }
            logResource(tag, path);
        }
    });

    return true;
}

function hookLibcFileApis() {
    const libc = "libc.so";

    hookExport(libc, "open", "libc.open", 0, true);
    hookExport(libc, "open64", "libc.open64", 0, true);
    hookExport(libc, "fopen", "libc.fopen", 0, true);
    hookExport(libc, "fopen64", "libc.fopen64", 0, true);

    const openat = Module.findExportByName(libc, "openat");
    if (openat) {
        console.log("[+] hook libc.openat => " + openat);
        Interceptor.attach(openat, {
            onEnter(args) {
                const path = readCString(args[1]);
                logResource("libc.openat", path);
            }
        });
    }

    const access = Module.findExportByName(libc, "access");
    if (access) {
        console.log("[+] hook libc.access => " + access);
        Interceptor.attach(access, {
            onEnter(args) {
                const path = readCString(args[0]);
                logResource("libc.access", path);
            }
        });
    }
}

function hookAndroidAssetManager() {
    const addr = Module.findExportByName("libandroid.so", "AAssetManager_open");
    if (!addr) {
        console.log("[-] AAssetManager_open not found");
        return;
    }

    console.log("[+] hook AAssetManager_open => " + addr);

    Interceptor.attach(addr, {
        onEnter(args) {
            const filename = readCString(args[1]);
            logResource("AAssetManager_open", filename);
        }
    });
}

function hookCocosFileUtilsBySymbols() {
    const modules = Process.enumerateModules()
        .filter(m => {
            const n = m.name.toLowerCase();
            return n.indexOf("cocos") >= 0 ||
                   n.indexOf("creator") >= 0 ||
                   n.indexOf("game") >= 0 ||
                   n.indexOf("main") >= 0;
        });

    const keywords = [
        "FileUtils",
        "fullPathForFilename",
        "getPathForFilename",
        "getDataFromFile",
        "getStringFromFile",
        "isFileExist",
        "isFileExistInternal",
        "getValueMapFromFile",
        "getValueVectorFromFile"
    ];

    for (const m of modules) {
        let symbols = [];

        try {
            symbols = Module.enumerateSymbolsSync(m.name);
        } catch (e) {
            continue;
        }

        for (const s of symbols) {
            const name = s.name || "";

            let hit = false;
            for (const k of keywords) {
                if (name.indexOf(k) >= 0) {
                    hit = true;
                    break;
                }
            }

            // 兼容 mangled name
            if (!hit) {
                if (
                    name.indexOf("FileUtils") >= 0 ||
                    name.indexOf("getDataFromFile") >= 0 ||
                    name.indexOf("getStringFromFile") >= 0 ||
                    name.indexOf("fullPathForFilename") >= 0 ||
                    name.indexOf("getPathForFilename") >= 0
                ) {
                    hit = true;
                }
            }

            if (!hit) continue;

            try {
                console.log("[+] hook cocos symbol:");
                console.log("    module = " + m.name);
                console.log("    name   = " + name);
                console.log("    addr   = " + s.address);

                Interceptor.attach(s.address, {
                    onEnter(args) {
                        const arr = tryReadStdStringArgs(args, 8);
                        for (const item of arr) {
                            logResource("Cocos.FileUtils arg[" + item.index + "]", item.value);
                        }
                    }
                });
            } catch (e) {
                console.log("[-] hook failed: " + name + " : " + e);
            }
        }
    }
}

function hookDlopen() {
    const androidDlopenExt = Module.findExportByName(null, "android_dlopen_ext");
    if (!androidDlopenExt) return;

    Interceptor.attach(androidDlopenExt, {
        onEnter(args) {
            this.path = readCString(args[0]);
        },
        onLeave(retval) {
            if (!this.path) return;

            const p = this.path.toLowerCase();
            if (
                p.indexOf("cocos") >= 0 ||
                p.indexOf("creator") >= 0 ||
                p.indexOf("game") >= 0 ||
                p.indexOf("main") >= 0
            ) {
                console.log("\n[+] dlopen: " + this.path);
                setTimeout(function () {
                    hookCocosFileUtilsBySymbols();
                }, 300);
            }
        }
    });
}

function main() {
    console.log("========== Hook Cocos Creator Resources ==========");

    hookLibcFileApis();
    hookAndroidAssetManager();
    hookCocosFileUtilsBySymbols();
    hookDlopen();

    console.log("========== Hook Installed ==========");
}

setImmediate(main);