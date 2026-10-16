'use strict';

const TARGET_SO = "libcocos2djs.so";
const MAGIC = [0x48, 0x45, 0x4b, 0x3a]; // HEK:
let stalking = false;

function hasHEK(p) {
    try {
        if (!p || p.isNull()) return false;

        for (let i = 0; i < MAGIC.length; i++) {
            if (p.add(i).readU8() !== MAGIC[i]) return false;
        }

        return true;
    } catch (e) {
        return false;
    }
}

function scanHEK(p, size) {
    try {
        const max = Math.min(size, 512);

        for (let off = 0; off < max; off++) {
            if (hasHEK(p.add(off))) {
                return p.add(off);
            }
        }
    } catch (e) {}

    return null;
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
            length: len || 96,
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

function stalkCurrentThread(ms) {
    if (stalking) return;
    stalking = true;

    const tid = Process.getCurrentThreadId();
    const summaryAll = {};

    console.log("\n========== STALK START ==========");
    console.log("tid = " + tid);

    try {
        Stalker.follow(tid, {
            events: {
                call: true
            },
            onCallSummary(summary) {
                Object.keys(summary).forEach(function (k) {
                    if (!summaryAll[k]) summaryAll[k] = 0;
                    summaryAll[k] += summary[k];
                });
            }
        });
    } catch (e) {
        console.log("Stalker.follow error: " + e);
        stalking = false;
        return;
    }

    setTimeout(function () {
        try {
            Stalker.unfollow(tid);
            Stalker.garbageCollect();
        } catch (e) {}

        const arr = [];

        Object.keys(summaryAll).forEach(function (k) {
            try {
                const a = ptr(k);
                const m = Process.findModuleByAddress(a);
                if (!m) return;
                if (m.name !== TARGET_SO) return;

                arr.push({
                    addr: a,
                    count: summaryAll[k],
                    off: a.sub(m.base)
                });
            } catch (e) {}
        });

        arr.sort(function (a, b) {
            return b.count - a.count;
        });

        console.log("\n========== STALK RESULT ==========");
        console.log("只看 " + TARGET_SO + "：");

        for (let i = 0; i < Math.min(arr.length, 80); i++) {
            console.log(
                "[" + i + "] count=" + arr[i].count +
                " offset=0x" + arr[i].off.toString(16) +
                " " + addrInfo(arr[i].addr)
            );
        }

        console.log("========== STALK END ==========\n");

        stalking = false;
    }, ms || 500);
}

function hookFread() {
    const fread =
        Module.findExportByName("libc.so", "fread") ||
        Module.findExportByName(null, "fread");

    if (!fread) {
        console.log("[-] fread not found");
        return;
    }

    Interceptor.attach(fread, {
        onEnter(args) {
            this.ptr = args[0];
            this.size = args[1].toInt32();
            this.nmemb = args[2].toInt32();
            this.ctx = this.context;
            this.retAddr = this.returnAddress;
        },

        onLeave(retval) {
            let count = 0;

            try {
                count = retval.toInt32();
            } catch (e) {}

            const total = count * this.size;
            if (total <= 0) return;

            const hit = scanHEK(this.ptr, total);
            if (!hit) return;

            console.log("\n========== HEK FREAD FOUND ==========");
            console.log("return = " + addrInfo(this.retAddr));
            console.log("buf    = " + this.ptr);
            console.log("hit    = " + hit);
            console.log("size   = " + total);

            dumpHead(hit, 128);

            console.log("\nBACKTRACE:");
            printBt(this.ctx);

            // fread 返回后，追当前线程后续调用
            stalkCurrentThread(500);
        }
    });

    console.log("[+] hook fread");
}

setImmediate(function () {
    console.log("========== FIND HEK AFTER FREAD ==========");
    hookFread();
    console.log("========== HOOK INSTALLED ==========");
});