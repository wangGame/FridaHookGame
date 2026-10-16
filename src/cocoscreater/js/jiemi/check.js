'use strict';

const SO_NAME = "libcocos2djs.so";

const OFFSETS = [
    0x8eba10,
    0x8ebb08,

    0x8c2350,

    0x8f6270,
    0x8f62d0,

    0x8fc534,
    0x8fc53c,
    0x8fc57c,

    0x90974c,
    0x909790,

    0x92320c,
    0x9c82b4,
    0x9bf74c
];

const HEK = [0x48, 0x45, 0x4b, 0x3a]; // HEK:

const recentHekRanges = [];

function isReadable(p) {
    try {
        if (!p || p.isNull()) return false;
        const r = Process.findRangeByAddress(p);
        return !!r && r.protection.indexOf("r") >= 0;
    } catch (e) {
        return false;
    }
}

function hasHEK(p) {
    try {
        if (!isReadable(p)) return false;

        for (let i = 0; i < HEK.length; i++) {
            if (p.add(i).readU8() !== HEK[i]) return false;
        }

        return true;
    } catch (e) {
        return false;
    }
}

function scanHEK(p, size) {
    try {
        if (!isReadable(p)) return null;

        const max = Math.min(size, 512);

        for (let off = 0; off < max; off++) {
            const q = p.add(off);
            if (hasHEK(q)) return q;
        }

        return null;
    } catch (e) {
        return null;
    }
}

function rememberHekRange(start, size, reason) {
    try {
        recentHekRanges.push({
            start: start,
            end: start.add(size),
            size: size,
            reason: reason,
            time: Date.now()
        });

        while (recentHekRanges.length > 32) {
            recentHekRanges.shift();
        }
    } catch (e) {}
}

function findHekRange(p) {
    try {
        if (!p || p.isNull()) return null;

        for (let i = recentHekRanges.length - 1; i >= 0; i--) {
            const r = recentHekRanges[i];

            if (p.compare(r.start) >= 0 && p.compare(r.end) < 0) {
                return r;
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
        if (!isReadable(p)) return;

        console.log(hexdump(p, {
            offset: 0,
            length: len || 128,
            header: false,
            ansi: false
        }));

        const s = readAscii(p, len || 128);
        if (s) {
            console.log("ascii = " + s.substring(0, 200));
        }
    } catch (e) {}
}

function readAscii(p, len) {
    try {
        if (!isReadable(p)) return "";

        const buf = p.readByteArray(len);
        if (!buf) return "";

        const arr = new Uint8Array(buf);
        let s = "";

        for (let i = 0; i < arr.length; i++) {
            const c = arr[i];
            if (c === 0) break;

            if (c >= 0x20 && c <= 0x7e) {
                s += String.fromCharCode(c);
            } else if (c === 0x0a || c === 0x0d || c === 0x09) {
                s += " ";
            } else {
                s += ".";
            }
        }

        return s;
    } catch (e) {
        return "";
    }
}

function printableScore(p, len) {
    try {
        if (!isReadable(p)) return 0;

        const buf = p.readByteArray(len);
        if (!buf) return 0;

        const arr = new Uint8Array(buf);

        let total = 0;
        let printable = 0;
        let zeros = 0;

        for (let i = 0; i < arr.length; i++) {
            const c = arr[i];

            if (c === 0) {
                zeros++;
                continue;
            }

            total++;

            if (
                (c >= 0x20 && c <= 0x7e) ||
                c === 0x0a ||
                c === 0x0d ||
                c === 0x09
            ) {
                printable++;
            }
        }

        if (total < 16) return 0;
        if (zeros > 4) return 0;

        return printable / total;
    } catch (e) {
        return 0;
    }
}

function looksPlainStrong(p) {
    try {
        if (!isReadable(p)) return false;

        const score = printableScore(p, 256);
        if (score < 0.85) return false;

        let s = readAscii(p, 256);
        if (!s) return false;

        s = s.replace(/^\s+/, "");

        // JSON
        if (s.indexOf("{") === 0) {
            if (s.indexOf(":") > 0 || s.indexOf("\"") > 0) return true;
        }

        if (s.indexOf("[") === 0) {
            if (s.indexOf("{") >= 0 || s.indexOf("\"") >= 0 || s.indexOf("]") >= 0) return true;
        }

        // JS
        if (s.indexOf("window.__require") === 0) return true;
        if (s.indexOf("window.__r") === 0) return true;
        if (s.indexOf("cc._RF") === 0) return true;
        if (s.indexOf("(function") === 0) return true;
        if (s.indexOf("!function") === 0) return true;
        if (s.indexOf("'use strict'") === 0) return true;
        if (s.indexOf("\"use strict\"") === 0) return true;
        if (s.indexOf("var ") === 0) return true;
        if (s.indexOf("let ") === 0) return true;
        if (s.indexOf("const ") === 0) return true;
        if (s.indexOf("module.exports") === 0) return true;

        return false;
    } catch (e) {
        return false;
    }
}

function checkOnePointer(label, p) {
    try {
        if (!isReadable(p)) return false;

        let printed = false;

        const r = findHekRange(p);
        if (r) {
            console.log(label + " points into recent HEK range ptr=" + p + " range=" + r.start + "-" + r.end + " size=" + r.size);
            dumpHead(p, 128);
            printed = true;
        }

        if (hasHEK(p)) {
            console.log(label + " direct HEK ptr=" + p);
            dumpHead(p, 128);
            printed = true;
        }

        if (looksPlainStrong(p)) {
            console.log(label + " STRONG PLAIN ptr=" + p);
            dumpHead(p, 256);
            printed = true;
        }

        return printed;
    } catch (e) {
        return false;
    }
}

function checkArgOrObject(label, p) {
    let hit = false;

    try {
        if (!isReadable(p)) return false;

        // 直接指针
        if (checkOnePointer(label, p)) hit = true;

        // 常见 C++ 对象内嵌指针
        const ptrOffs = [0, 8, 16, 24, 32, 40, 48, 56];

        for (let i = 0; i < ptrOffs.length; i++) {
            const off = ptrOffs[i];

            let q = null;

            try {
                q = p.add(off).readPointer();
            } catch (e) {
                continue;
            }

            if (!isReadable(q)) continue;

            if (checkOnePointer(label + " deref+" + off + " rawPtr=" + q, q)) {
                hit = true;
            }
        }
    } catch (e) {}

    return hit;
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

            console.log("\n========== FREAD HEK ==========");
            console.log("return = " + addrInfo(this.retAddr));
            console.log("buf    = " + this.ptr);
            console.log("hit    = " + hit);
            console.log("size   = " + total);

            dumpHead(hit, 128);

            rememberHekRange(hit, total - hit.sub(this.ptr).toInt32(), "fread");
        }
    });

    console.log("[+] hook fread");
}

function hookOffset(base, off) {
    const addr = base.add(off);

    Interceptor.attach(addr, {
        onEnter(args) {
            this.off = off;
            this.args = [];
            this.interesting = false;

            for (let i = 0; i < 8; i++) {
                this.args.push(args[i]);
            }

            for (let i = 0; i < 8; i++) {
                if (checkArgOrObject("ENTER 0x" + off.toString(16) + " arg[" + i + "]=" + args[i], args[i])) {
                    this.interesting = true;
                }
            }
        },

        onLeave(retval) {
            let printedHeader = false;

            function header(self) {
                if (printedHeader) return;
                printedHeader = true;
                console.log("\n========== CHECK LEAVE 0x" + self.off.toString(16) + " ==========");
                console.log("retval = " + retval);
            }

            if (checkArgOrObject("LEAVE 0x" + this.off.toString(16) + " retval=" + retval, retval)) {
                header(this);
            }

            for (let i = 0; i < this.args.length; i++) {
                if (checkArgOrObject("LEAVE 0x" + this.off.toString(16) + " arg[" + i + "]=" + this.args[i], this.args[i])) {
                    header(this);
                }
            }
        }
    });

    console.log("[+] hook 0x" + off.toString(16) + " addr=" + addr);
}

setImmediate(function () {
    console.log("========== HOOK HEK CANDIDATE V2 ==========");

    hookFread();

    const base = Module.findBaseAddress(SO_NAME);

    if (!base) {
        console.log("[-] base not found: " + SO_NAME);
        return;
    }

    console.log("[+] base = " + base);

    for (let i = 0; i < OFFSETS.length; i++) {
        hookOffset(base, OFFSETS[i]);
    }

    console.log("========== HOOK INSTALLED ==========");
});