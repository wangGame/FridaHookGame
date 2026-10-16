'use strict';

const SO_NAME = "libcocos2djs.so";
const DECRYPT_OFF = 0x909790;

const DUMP_DIR = "/storage/emulated/0/Android/data/com.block.juggle/files/hek_js_dump";

const O_WRONLY_CREAT_TRUNC = 1 | 64 | 512;
const MODE_777 = 511;
const MODE_666 = 438;

const openPtr =
    Module.findExportByName("libc.so", "open") ||
    Module.findExportByName(null, "open");

const writePtr =
    Module.findExportByName("libc.so", "write") ||
    Module.findExportByName(null, "write");

const closePtr =
    Module.findExportByName("libc.so", "close") ||
    Module.findExportByName(null, "close");

const mkdirPtr =
    Module.findExportByName("libc.so", "mkdir") ||
    Module.findExportByName(null, "mkdir");

const libc_open = new NativeFunction(openPtr, "int", ["pointer", "int", "int"]);
const libc_write = new NativeFunction(writePtr, "int", ["int", "pointer", "int"]);
const libc_close = new NativeFunction(closePtr, "int", ["int"]);
const libc_mkdir = new NativeFunction(mkdirPtr, "int", ["pointer", "int"]);

let dumpIndex = 0;
const dumped = new Set();

function mkdirs(path) {
    const parts = path.split("/");
    let cur = "";

    for (let i = 0; i < parts.length; i++) {
        if (parts[i].length === 0) continue;
        cur += "/" + parts[i];

        try {
            libc_mkdir(Memory.allocUtf8String(cur), MODE_777);
        } catch (e) {}
    }
}

function isReadable(p) {
    try {
        if (!p || p.isNull()) return false;
        const r = Process.findRangeByAddress(p);
        return !!r && r.protection.indexOf("r") >= 0;
    } catch (e) {
        return false;
    }
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

function looksJs(p) {
    try {
        if (!isReadable(p)) return false;

        let s = readAscii(p, 256);
        if (!s) return false;

        s = s.replace(/^\s+/, "");

        if (s.indexOf("(function") === 0) return true;
        if (s.indexOf("!function") === 0) return true;
        if (s.indexOf("window.__require") === 0) return true;
        if (s.indexOf("window.__r") === 0) return true;
        if (s.indexOf("cc._RF") === 0) return true;
        if (s.indexOf("'use strict'") === 0) return true;
        if (s.indexOf('"use strict"') === 0) return true;
        if (s.indexOf("var ") === 0) return true;
        if (s.indexOf("let ") === 0) return true;
        if (s.indexOf("const ") === 0) return true;

        return false;
    } catch (e) {
        return false;
    }
}

function cStringLen(p, maxLen) {
    try {
        let total = 0;
        const step = 4096;

        while (total < maxLen) {
            const n = Math.min(step, maxLen - total);
            const buf = p.add(total).readByteArray(n);
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

function dumpPtr(ptrJs, reason) {
    try {
        if (!looksJs(ptrJs)) return;

        const len = cStringLen(ptrJs, 32 * 1024 * 1024);
        if (len <= 16) return;

        const key = ptrJs.toString() + "_" + len;
        if (dumped.has(key)) return;
        dumped.add(key);

        mkdirs(DUMP_DIR);

        const idx = dumpIndex++;
        const outPath = DUMP_DIR + "/decrypt_" + idx + "_" + reason + "_" + len + ".js";

        const fd = libc_open(
            Memory.allocUtf8String(outPath),
            O_WRONLY_CREAT_TRUNC,
            MODE_666
        );

        if (fd < 0) {
            console.log("[-] open failed: " + outPath);
            return;
        }

        let written = 0;

        while (written < len) {
            const remain = len - written;
            const chunk = remain > 65536 ? 65536 : remain;
            const n = libc_write(fd, ptrJs.add(written), chunk);

            if (n <= 0) break;
            written += n;
        }

        libc_close(fd);

        console.log("\n========== DECRYPTED JS DUMP ==========");
        console.log("reason = " + reason);
        console.log("ptr    = " + ptrJs);
        console.log("bytes  = " + written);
        console.log("file   = " + outPath);
        console.log("preview:");
        console.log(readAscii(ptrJs, 500));
    } catch (e) {
        console.log("dumpPtr error: " + e);
    }
}

function tryDeref(basePtr, off, reason) {
    try {
        if (!isReadable(basePtr)) return;

        const p = basePtr.add(off).readPointer();
        if (!isReadable(p)) return;

        dumpPtr(p, reason + "_deref_" + off);
    } catch (e) {}
}

function hookDecrypt() {
    const base = Module.findBaseAddress(SO_NAME);

    if (!base) {
        console.log("[-] base not found: " + SO_NAME);
        return;
    }

    const addr = base.add(DECRYPT_OFF);

    Interceptor.attach(addr, {
        onEnter(args) {
            this.arg0 = args[0];
            this.arg1 = args[1];
            this.arg2 = args[2];
            this.arg3 = args[3];
            this.arg4 = args[4];

            console.log("\n========== ENTER DECRYPT 0x909790 ==========");
            console.log("arg0 = " + this.arg0);
            console.log("arg1 = " + this.arg1);
            console.log("arg2 = " + this.arg2);
            console.log("arg3 = " + this.arg3);
            console.log("arg4 = " + this.arg4);
        },

        onLeave(retval) {
            console.log("\n========== LEAVE DECRYPT 0x909790 ==========");
            console.log("retval = " + retval);

            // 你日志里已经确认：
            // arg2 + 0  -> JS 指针
            // arg3 + 8  -> JS 指针
            tryDeref(this.arg2, 0, "arg2");
            tryDeref(this.arg2, 8, "arg2");
            tryDeref(this.arg2, 16, "arg2");
            tryDeref(this.arg2, 24, "arg2");

            tryDeref(this.arg3, 0, "arg3");
            tryDeref(this.arg3, 8, "arg3");
            tryDeref(this.arg3, 16, "arg3");
            tryDeref(this.arg3, 24, "arg3");

            dumpPtr(retval, "retval");
        }
    });

    console.log("[+] hook decrypt offset 0x909790 addr=" + addr);
}

setImmediate(function () {
    console.log("========== HOOK HEK DECRYPT 0x909790 ==========");
    hookDecrypt();
    console.log("========== HOOK INSTALLED ==========");
});