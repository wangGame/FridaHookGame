'use strict';

const TARGET_SO = "libcocos2djs.so";
const MAGIC = [0x6a, 0x79, 0x63, 0x72, 0x79, 0x70, 0x74]; // jycrypt

let stalking = false;

function hasJycrypt(p) {
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

function printBacktrace(context) {
    console.log("\n========== BACKTRACE ==========");

    try {
        const bt = Thread.backtrace(context, Backtracer.ACCURATE);

        for (let i = 0; i < bt.length; i++) {
            console.log("#" + i + " " + addrInfo(bt[i]));
        }
    } catch (e) {
        console.log("backtrace error: " + e);
    }
}

function stalkCurrentThread(ms) {
    if (stalking) return;
    stalking = true;

    const tid = Process.getCurrentThreadId();
    const summaryAll = {};

    console.log("\n========== STALK START ==========");
    console.log("tid = " + tid);

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
        console.log("只看 " + TARGET_SO + " 内部调用：");

        for (let i = 0; i < Math.min(arr.length, 60); i++) {
            console.log(
                "[" + i + "] count=" + arr[i].count +
                " offset=0x" + arr[i].off.toString(16) +
                " " + addrInfo(arr[i].addr)
            );
        }

        console.log("========== STALK END ==========\n");

        stalking = false;
    }, ms || 300);
}

function hookMemcmp() {
    const memcmp = Module.findExportByName("libc.so", "memcmp");

    if (!memcmp) {
        console.log("[-] memcmp not found");
        return;
    }

    Interceptor.attach(memcmp, {
        onEnter(args) {
            this.hit = false;
            this.ctx = this.context;

            let len = 0;
            try {
                len = args[2].toInt32();
            } catch (e) {
                return;
            }

            if (len !== 7 && len !== 8) return;

            const a = args[0];
            const b = args[1];

            const aJy = hasJycrypt(a);
            const bJy = hasJycrypt(b);

            if (!aJy && !bJy) return;

            this.hit = true;
            this.a = a;
            this.b = b;
            this.len = len;
            this.aJy = aJy;
            this.bJy = bJy;
            this.caller = this.returnAddress;
        },

        onLeave(retval) {
            if (!this.hit) return;

            const ret = retval.toInt32();

            console.log("\n========== JYCRYPT MEMCMP ==========");
            console.log("ret    = " + ret);
            console.log("len    = " + this.len);
            console.log("caller = " + addrInfo(this.caller));
            console.log("arg0   = " + this.a + " jy=" + this.aJy);
            console.log("arg1   = " + this.b + " jy=" + this.bJy);

            printBacktrace(this.ctx);

            if (ret === 0) {
                console.log("\n>>> memcmp 命中 jycrypt，开始跟踪后续调用");
                stalkCurrentThread(300);
            }
        }
    });

    console.log("[+] hook memcmp");
}

setImmediate(function () {
    console.log("========== FIND JYCRYPT DECRYPT POINT ==========");
    console.log("target so = " + TARGET_SO);

    hookMemcmp();

    console.log("========== HOOK INSTALLED ==========");
});