'use strict';

const MAGICS = [
    { name: "jycrypt", bytes: [0x6a, 0x79, 0x63, 0x72, 0x79, 0x70, 0x74] },
    { name: "HEK:",    bytes: [0x48, 0x45, 0x4b, 0x3a] }
];

const watchedPages = new Set();

function matchMagic(p) {
    try {
        if (!p || p.isNull()) return null;

        for (const m of MAGICS) {
            let ok = true;
            for (let i = 0; i < m.bytes.length; i++) {
                if (p.add(i).readU8() !== m.bytes[i]) {
                    ok = false;
                    break;
                }
            }
            if (ok) return m.name;
        }

        return null;
    } catch (e) {
        return null;
    }
}

function scanMagic(p, size) {
    try {
        const max = Math.min(size, 512);

        for (let off = 0; off < max; off++) {
            const hit = matchMagic(p.add(off));
            if (hit) {
                return {
                    name: hit,
                    ptr: p.add(off),
                    off: off
                };
            }
        }

        return null;
    } catch (e) {
        return null;
    }
}

function addrInfo(addr) {
    try {
        const m = Process.findModuleByAddress(addr);
        const s = DebugSymbol.fromAddress(addr);

        if (m) {
            return m.name +
                " offset=0x" + addr.sub(m.base).toString(16) +
                " addr=" + addr +
                " " + s;
        }

        return addr + " " + s;
    } catch (e) {
        return addr.toString();
    }
}

function dumpHead(p, len) {
    try {
        console.log(hexdump(p, {
            offset: 0,
            length: len || 64,
            header: false,
            ansi: false
        }));
    } catch (e) {}
}

function printBt(context) {
    try {
        const bt = Thread.backtrace(context, Backtracer.ACCURATE);
        for (let i = 0; i < bt.length; i++) {
            console.log("#" + i + " " + addrInfo(bt[i]));
        }
    } catch (e) {
        console.log("bt error: " + e);
    }
}

function pageDown(p) {
    const pageSize = Process.pageSize;
    return ptr(p.toUInt64().and(ptr(-pageSize).toUInt64()));
}

function watchBuffer(ptrHit, reason) {
    try {
        const page = pageDown(ptrHit);
        const key = page.toString();

        if (watchedPages.has(key)) return;
        watchedPages.add(key);

        console.log("\n========== WATCH BUFFER ==========");
        console.log("reason = " + reason);
        console.log("ptr    = " + ptrHit);
        console.log("page   = " + page);

        MemoryAccessMonitor.enable(
            [{ base: page, size: Process.pageSize }],
            {
                onAccess(details) {
                    console.log("\n========== BUFFER ACCESS ==========");
                    console.log("operation = " + details.operation);
                    console.log("address   = " + details.address);
                    console.log("from      = " + addrInfo(details.from));
                    console.log("range     = " + details.rangeIndex);
                    console.log("page      = " + details.pageIndex);

                    try {
                        dumpHead(ptrHit, 96);
                    } catch (e) {}

                    try {
                        MemoryAccessMonitor.disable();
                    } catch (e) {}
                }
            }
        );
    } catch (e) {
        console.log("watchBuffer error: " + e);
    }
}

function handleBuffer(buf, size, reason, context) {
    const hit = scanMagic(buf, size);
    if (!hit) return;

    console.log("\n========== MAGIC BUFFER FOUND ==========");
    console.log("magic  = " + hit.name);
    console.log("reason = " + reason);
    console.log("buf    = " + buf);
    console.log("hitPtr = " + hit.ptr);
    console.log("offset = " + hit.off);
    console.log("size   = " + size);

    dumpHead(hit.ptr, 96);

    console.log("\nBACKTRACE:");
    printBt(context);

    watchBuffer(hit.ptr, reason);
}

function hookAAssetRead() {
    const addr =
        Module.findExportByName("libandroid.so", "AAsset_read") ||
        Module.findExportByName(null, "AAsset_read");

    if (!addr) {
        console.log("[-] AAsset_read not found");
        return;
    }

    Interceptor.attach(addr, {
        onEnter(args) {
            this.buf = args[1];
            this.count = args[2].toInt32();
            this.ctx = this.context;
        },
        onLeave(retval) {
            let n = 0;
            try {
                n = retval.toInt32();
            } catch (e) {}

            if (n <= 0) return;
            handleBuffer(this.buf, n, "AAsset_read", this.ctx);
        }
    });

    console.log("[+] hook AAsset_read");
}

function hookRead() {
    const addr =
        Module.findExportByName("libc.so", "read") ||
        Module.findExportByName(null, "read");

    if (!addr) {
        console.log("[-] read not found");
        return;
    }

    Interceptor.attach(addr, {
        onEnter(args) {
            this.buf = args[1];
            this.count = args[2].toInt32();
            this.ctx = this.context;
        },
        onLeave(retval) {
            let n = 0;
            try {
                n = retval.toInt32();
            } catch (e) {}

            if (n <= 0) return;
            handleBuffer(this.buf, n, "read", this.ctx);
        }
    });

    console.log("[+] hook read");
}

function hookFread() {
    const addr =
        Module.findExportByName("libc.so", "fread") ||
        Module.findExportByName(null, "fread");

    if (!addr) {
        console.log("[-] fread not found");
        return;
    }

    Interceptor.attach(addr, {
        onEnter(args) {
            this.ptr = args[0];
            this.size = args[1].toInt32();
            this.nmemb = args[2].toInt32();
            this.ctx = this.context;
        },
        onLeave(retval) {
            let count = 0;
            try {
                count = retval.toInt32();
            } catch (e) {}

            const total = count * this.size;
            if (total <= 0) return;

            handleBuffer(this.ptr, total, "fread", this.ctx);
        }
    });

    console.log("[+] hook fread");
}

setImmediate(function () {
    console.log("========== FIND MAGIC READ + ACCESS ==========");

    hookAAssetRead();
    hookRead();
    hookFread();

    console.log("========== HOOK INSTALLED ==========");
});