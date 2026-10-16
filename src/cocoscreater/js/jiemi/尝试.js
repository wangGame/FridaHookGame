'use strict';

const SO_NAME = "libcocos2djs.so";
const DECRYPT_OFF = 0x909790;

// 改这里：手机里的 HEK 文件路径
const INPUT_FILE = "/storage/emulated/0/Android/data/com.block.juggle/files/input.hek";

// 输出目录
const DUMP_DIR = "/storage/emulated/0/Android/data/com.block.juggle/files/hek_decrypt_out";

const O_RDONLY = 0;
const O_WRONLY_CREAT_TRUNC = 1 | 64 | 512;
const SEEK_SET = 0;
const SEEK_END = 2;
const MODE_777 = 511;
const MODE_666 = 438;

const openPtr =
    Module.findExportByName("libc.so", "open") ||
    Module.findExportByName(null, "open");

const readPtr =
    Module.findExportByName("libc.so", "read") ||
    Module.findExportByName(null, "read");

const writePtr =
    Module.findExportByName("libc.so", "write") ||
    Module.findExportByName(null, "write");

const closePtr =
    Module.findExportByName("libc.so", "close") ||
    Module.findExportByName(null, "close");

const lseekPtr =
    Module.findExportByName("libc.so", "lseek") ||
    Module.findExportByName(null, "lseek");

const mkdirPtr =
    Module.findExportByName("libc.so", "mkdir") ||
    Module.findExportByName(null, "mkdir");

const libc_open = new NativeFunction(openPtr, "int", ["pointer", "int", "int"]);
const libc_read = new NativeFunction(readPtr, "int", ["int", "pointer", "int"]);
const libc_write = new NativeFunction(writePtr, "int", ["int", "pointer", "int"]);
const libc_close = new NativeFunction(closePtr, "int", ["int"]);
const libc_lseek = new NativeFunction(lseekPtr, "long", ["int", "long", "int"]);
const libc_mkdir = new NativeFunction(mkdirPtr, "int", ["pointer", "int"]);

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

        let s = readAscii(p, 512);
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
        if (s.indexOf("module.exports") === 0) return true;

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

function dumpPtrToFile(ptrData, size, filePath) {
    const fd = libc_open(
        Memory.allocUtf8String(filePath),
        O_WRONLY_CREAT_TRUNC,
        MODE_666
    );

    if (fd < 0) {
        console.log("[-] open output failed: " + filePath);
        return false;
    }

    let written = 0;

    while (written < size) {
        const remain = size - written;
        const chunk = remain > 65536 ? 65536 : remain;

        const n = libc_write(fd, ptrData.add(written), chunk);
        if (n <= 0) break;

        written += n;
    }

    libc_close(fd);

    console.log("[+] write file: " + filePath + " bytes=" + written);
    return written > 0;
}

function readWholeFile(path) {
    const fd = libc_open(
        Memory.allocUtf8String(path),
        O_RDONLY,
        0
    );

    if (fd < 0) {
        console.log("[-] open input failed: " + path);
        return null;
    }

    const size = libc_lseek(fd, 0, SEEK_END);
    libc_lseek(fd, 0, SEEK_SET);

    if (size <= 0) {
        console.log("[-] invalid file size: " + size);
        libc_close(fd);
        return null;
    }

    const buf = Memory.alloc(size + 16);

    let readTotal = 0;

    while (readTotal < size) {
        const remain = size - readTotal;
        const chunk = remain > 65536 ? 65536 : remain;

        const n = libc_read(fd, buf.add(readTotal), chunk);
        if (n <= 0) break;

        readTotal += n;
    }

    libc_close(fd);

    if (readTotal !== size) {
        console.log("[-] read size mismatch read=" + readTotal + " size=" + size);
    }

    console.log("[+] read input: " + path + " bytes=" + readTotal);

    return {
        ptr: buf,
        size: readTotal
    };
}

function zeroMem(p, size) {
    try {
        const arr = new Uint8Array(size);
        p.writeByteArray(arr.buffer);
    } catch (e) {}
}

function dumpIfJs(label, p) {
    try {
        if (!isReadable(p)) return false;
        if (!looksJs(p)) return false;

        const len = cStringLen(p, 64 * 1024 * 1024);
        if (len <= 16) return false;

        mkdirs(DUMP_DIR);

        const outPath = DUMP_DIR + "/" + label + "_" + Date.now() + "_" + len + ".js";

        dumpPtrToFile(p, len, outPath);

        console.log("\n========== JS FOUND ==========");
        console.log("label = " + label);
        console.log("ptr   = " + p);
        console.log("len   = " + len);
        console.log("file  = " + outPath);
        console.log("preview:");
        console.log(readAscii(p, 600));

        return true;
    } catch (e) {
        console.log("dumpIfJs error: " + e);
        return false;
    }
}

function tryOutputStruct(name, obj) {
    try {
        if (!isReadable(obj)) return false;

        let found = false;

        // 你日志里确认过：
        // arg2 + 0 -> JS 指针
        // arg3 + 8 -> JS 指针
        const offs = [0, 8, 16, 24, 32, 40, 48, 56];

        for (let i = 0; i < offs.length; i++) {
            const off = offs[i];

            try {
                const p = obj.add(off).readPointer();

                if (dumpIfJs(name + "_deref_" + off, p)) {
                    found = true;
                }
            } catch (e) {}
        }

        // 有些情况返回的可能就是直接 JS 指针
        if (dumpIfJs(name + "_direct", obj)) {
            found = true;
        }

        return found;
    } catch (e) {
        return false;
    }
}

function checkHEK(buf) {
    try {
        return (
            buf.readU8() === 0x48 &&
            buf.add(1).readU8() === 0x45 &&
            buf.add(2).readU8() === 0x4b &&
            buf.add(3).readU8() === 0x3a
        );
    } catch (e) {
        return false;
    }
}

function callDecrypt(inputPtr, inputSize) {
    const base = Module.findBaseAddress(SO_NAME);

    if (!base) {
        console.log("[-] base not found: " + SO_NAME);
        return;
    }

    const fnAddr = base.add(DECRYPT_OFF);

    console.log("[+] base    = " + base);
    console.log("[+] decrypt = " + fnAddr + " offset=0x" + DECRYPT_OFF.toString(16));

    // 全 pointer 调用，AArch64 上就是 x0-x7
    const decrypt = new NativeFunction(
        fnAddr,
        "int",
        ["pointer", "pointer", "pointer", "pointer", "pointer", "pointer", "pointer", "pointer"]
    );

    const out2 = Memory.alloc(0x100);
    const out3 = Memory.alloc(0x100);

    zeroMem(out2, 0x100);
    zeroMem(out3, 0x100);

    console.log("[*] call decrypt...");
    console.log("    x0 input = " + inputPtr);
    console.log("    x1 size  = " + inputSize);
    console.log("    x2 out2  = " + out2);
    console.log("    x3 out3  = " + out3);

    let ret = 0;

    try {
        ret = decrypt(
            inputPtr,
            ptr(inputSize),
            out2,
            out3,
            ptr(0),
            ptr(0),
            ptr(0),
            ptr(0)
        );
    } catch (e) {
        console.log("[-] decrypt call crashed/failed: " + e);
        return;
    }

    console.log("[+] decrypt ret = " + ret);

    let found = false;

    if (tryOutputStruct("arg2", out2)) found = true;
    if (tryOutputStruct("arg3", out3)) found = true;

    if (!found) {
        console.log("[-] no JS found in arg2/arg3");
        console.log("[*] out2 dump:");
        console.log(hexdump(out2, { length: 0x80, header: false, ansi: false }));
        console.log("[*] out3 dump:");
        console.log(hexdump(out3, { length: 0x80, header: false, ansi: false }));
    }
}

setImmediate(function () {
    console.log("========== CALL HEK DECRYPT ==========");
    console.log("[*] input = " + INPUT_FILE);

    const file = readWholeFile(INPUT_FILE);
    if (!file) return;

    if (!checkHEK(file.ptr)) {
        console.log("[-] input is not HEK: file");
        console.log(hexdump(file.ptr, { length: 32, header: false, ansi: false }));
        return;
    }

    callDecrypt(file.ptr, file.size);

    console.log("========== DONE ==========");
});