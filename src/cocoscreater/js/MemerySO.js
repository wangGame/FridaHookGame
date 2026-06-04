// scan_so_cocos.js

console.log("========== Cocos Memory SO Scanner ==========");

function ptrStr(p) {
    try {
        return p.toString();
    } catch (_) {
        return String(p);
    }
}

function safeReadCString(addr, maxLen) {
    try {
        return addr.readCString(maxLen || 256);
    } catch (_) {
        return "";
    }
}

function printModule(m) {
    console.log(
        "[MODULE] " +
        m.name +
        " base=" + m.base +
        " size=0x" + m.size.toString(16) +
        " path=" + m.path
    );
}

function isCocosLike(nameOrPath) {
    const s = (nameOrPath || "").toLowerCase();
    return (
        s.includes("cocos") ||
        s.includes("cocos2d") ||
        s.includes("cocos2djs") ||
        s.includes("jsb") ||
        s.includes("jsc") ||
        s.includes("v8") ||
        s.includes("quickjs") ||
        s.includes("spidermonkey") ||
        s.includes("lua")
    );
}

// ===============================
// 1. 枚举正常加载的 so
// ===============================
console.log("\n========== Loaded Modules ==========");

const modules = Process.enumerateModules();

modules.forEach(m => {
    if (
        m.path.includes(".so") ||
        m.name.endsWith(".so") ||
        isCocosLike(m.name) ||
        isCocosLike(m.path)
    ) {
        printModule(m);
    }
});

console.log("\n========== Cocos-like Modules ==========");

modules.forEach(m => {
    if (isCocosLike(m.name) || isCocosLike(m.path)) {
        printModule(m);
    }
});


// ===============================
// 2. 扫描内存里的 ELF 头
// ===============================

function scanElfInRanges(protection) {
    console.log("\n========== Scan ELF in ranges: " + protection + " ==========");

    let ranges = [];

    try {
        ranges = Process.enumerateRanges({
            protection: protection,
            coalesce: false
        });
    } catch (e) {
        console.log("[-] enumerateRanges failed: " + protection + " " + e);
        return;
    }

    const elfPattern = "7f 45 4c 46"; // ELF magic

    ranges.forEach(r => {
        // 太大的区间分块扫，避免卡死
        const maxChunk = 0x1000000; // 16MB
        let offset = 0;

        while (offset < r.size) {
            const chunkSize = Math.min(maxChunk, r.size - offset);
            const start = r.base.add(offset);

            try {
                Memory.scan(start, chunkSize, elfPattern, {
                    onMatch(address, size) {
                        const mod = Process.findModuleByAddress(address);
                        const file = r.file ? r.file.path : "";

                        console.log("\n[ELF FOUND]");
                        console.log("  addr   = " + address);
                        console.log("  range  = " + r.base + " - " + r.base.add(r.size));
                        console.log("  prot   = " + r.protection);
                        console.log("  file   = " + file);

                        if (mod) {
                            console.log("  module = " + mod.name);
                            console.log("  mbase  = " + mod.base);
                            console.log("  msize  = 0x" + mod.size.toString(16));
                            console.log("  mpath  = " + mod.path);
                        } else {
                            console.log("  module = <not in Process.enumerateModules>");
                        }

                        // ELF 附近看看有没有可读字符串
                        try {
                            const near = address.add(0x100);
                            const s = safeReadCString(near, 128);
                            if (s.length > 0) {
                                console.log("  near+0x100 str = " + JSON.stringify(s));
                            }
                        } catch (_) {}
                    },
                    onError(reason) {
                        // 忽略不可读小段
                    },
                    onComplete() {}
                });
            } catch (e) {
                // 忽略异常区域
            }

            offset += chunkSize;
        }
    });
}

// ELF 头通常在 r--，但内存 so / 壳可能在 r-x 或 rw-
scanElfInRanges("r--");
scanElfInRanges("r-x");
scanElfInRanges("rw-");
scanElfInRanges("rwx");


// ===============================
// 3. 扫描 Cocos 关键字符串
// ===============================

const cocosPatterns = [
    {
        name: "cocos2d",
        hex: "63 6f 63 6f 73 32 64"
    },
    {
        name: "Cocos",
        hex: "43 6f 63 6f 73"
    },
    {
        name: "jsb_",
        hex: "6a 73 62 5f"
    },
    {
        name: "se::",
        hex: "73 65 3a 3a"
    },
    {
        name: "FileUtils",
        hex: "46 69 6c 65 55 74 69 6c 73"
    },
    {
        name: "getDataFromFile",
        hex: "67 65 74 44 61 74 61 46 72 6f 6d 46 69 6c 65"
    },
    {
        name: "assets/",
        hex: "61 73 73 65 74 73 2f"
    },
    {
        name: "src/",
        hex: "73 72 63 2f"
    }
];

function scanCocosStrings() {
    console.log("\n========== Scan Cocos Strings ==========");

    const ranges = Process.enumerateRanges({
        protection: "r--",
        coalesce: false
    });

    cocosPatterns.forEach(pat => {
        console.log("\n---- pattern: " + pat.name + " ----");

        ranges.forEach(r => {
            const maxChunk = 0x800000; // 8MB
            let offset = 0;

            while (offset < r.size) {
                const chunkSize = Math.min(maxChunk, r.size - offset);
                const start = r.base.add(offset);

                try {
                    Memory.scan(start, chunkSize, pat.hex, {
                        onMatch(address, size) {
                            const mod = Process.findModuleByAddress(address);
                            const file = r.file ? r.file.path : "";

                            console.log(
                                "[STR] " + pat.name +
                                " addr=" + address +
                                " range=" + r.base +
                                " file=" + file +
                                " module=" + (mod ? mod.name : "<none>")
                            );

                            // 打印附近字符串
                            try {
                                const s = safeReadCString(address, 256);
                                if (s.length > 0) {
                                    console.log("      text=" + JSON.stringify(s));
                                }
                            } catch (_) {}
                        },
                        onError(reason) {},
                        onComplete() {}
                    });
                } catch (_) {}

                offset += chunkSize;
            }
        });
    });
}



scanCocosStrings();

console.log("\n========== Scan Installed ==========");