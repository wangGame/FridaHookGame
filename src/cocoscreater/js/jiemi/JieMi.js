'use strict';

// ===============================
// 配置
// ===============================

const SO_NAME = "libcocos2djs.so";
const DECRYPT_OFF = 0x909790;

// 改这里：手机里的 HEK 文件路径
const INPUT_FILE = "/storage/emulated/0/Android/data/com.block.juggle/files/input.hek";

// 输出目录
const OUTPUT_DIR = "/storage/emulated/0/Android/data/com.block.juggle/files/hek_decrypt_out";

// 最大输出大小保护
const MAX_OUTPUT_SIZE = 128 * 1024 * 1024;

// ===============================
// libc
// ===============================

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

if (!openPtr || !readPtr || !writePtr || !closePtr || !lseekPtr || !mkdirPtr) {
    throw new Error("libc symbols missing");
}

const libc_open = new NativeFunction(openPtr, "int", ["pointer", "int", "int"]);
const libc_read = new NativeFunction(readPtr, "int", ["int", "pointer", "int"]);
const libc_write = new NativeFunction(writePtr, "int", ["int", "pointer", "int"]);
const libc_close = new NativeFunction(closePtr, "int", ["int"]);
const libc_lseek = new NativeFunction(lseekPtr, "long", ["int", "long", "int"]);
const libc_mkdir = new NativeFunction(mkdirPtr, "int", ["pointer", "int"]);

// ===============================
// 工具函数
// ===============================

function toNum(v) {
    try {
        if (typeof v === "number") return v;
    } catch (e) {}

    try {
        if (v.toNumber) return v.toNumber();
    } catch (e) {}

    try {
        if (v.toInt32) return v.toInt32();
    } catch (e) {}

    try {
        return parseInt(v.toString(), 10);
    } catch (e) {}

    return 0;
}

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
        if (!r) return false;

        return r.protection.indexOf("r") >= 0;
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
                s += String.fromCharCode(c);
            } else {
                s += ".";
            }
        }

        return s;
    } catch (e) {
        return "";
    }
}

function dumpHex(p, len) {
    try {
        if (!isReadable(p)) return;

        console.log(hexdump(p, {
            offset: 0,
            length: len,
            header: false,
            ansi: false
        }));
    } catch (e) {
        console.log("hexdump failed: " + e);
    }
}

function checkHEK(p) {
    try {
        return (
            p.readU8() === 0x48 &&
            p.add(1).readU8() === 0x45 &&
            p.add(2).readU8() === 0x4b &&
            p.add(3).readU8() === 0x3a
        );
    } catch (e) {
        return false;
    }
}

function zeroMem(p, size) {
    try {
        const z = new Uint8Array(size);
        p.writeByteArray(z.buffer);
    } catch (e) {
        for (let i = 0; i < size; i++) {
            try {
                p.add(i).writeU8(0);
            } catch (_) {
                break;
            }
        }
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

// ===============================
// 文件读写
// ===============================

function readWholeFile(path) {
    const fd = libc_open(Memory.allocUtf8String(path), O_RDONLY, 0);

    if (fd < 0) {
        console.log("[-] open input failed: " + path);
        return null;
    }

    const endRet = libc_lseek(fd, 0, SEEK_END);
    const size = toNum(endRet);

    libc_lseek(fd, 0, SEEK_SET);

    if (size <= 0) {
        console.log("[-] invalid file size: " + size);
        libc_close(fd);
        return null;
    }

    const buf = Memory.alloc(size + 16);
    zeroMem(buf, size + 16);

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

function writePtrToFile(ptrData, size, filePath) {
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

    return written === size;
}

// ===============================
// 输出识别
// ===============================

function scanSignature(p, size) {
    const signs = [
        "(function",
        "!function",
        "window.__require",
        "window.__r",
        "cc._RF",
        "'use strict'",
        "\"use strict\"",
        "var ",
        "let ",
        "const ",
        "module.exports",
        "{",
        "["
    ];

    const max = Math.min(size, 8192);

    for (let off = 0; off < max; off++) {
        for (let i = 0; i < signs.length; i++) {
            const s = signs[i];

            try {
                let ok = true;

                for (let j = 0; j < s.length; j++) {
                    if (p.add(off + j).readU8() !== s.charCodeAt(j)) {
                        ok = false;
                        break;
                    }
                }

                if (ok) {
                    return {
                        offset: off,
                        sign: s
                    };
                }
            } catch (e) {}
        }
    }

    return null;
}

function guessExt(p, size) {
    const preview = readAscii(p, Math.min(size, 512)).replace(/^\s+/, "");

    if (preview.indexOf("{") === 0 || preview.indexOf("[") === 0) {
        return "json";
    }

    return "js";
}

function dumpDecryptOutput(out2, out3) {
    console.log("\n========== OUTPUT STRUCT ==========");

    console.log("[*] out2:");
    dumpHex(out2, 0x40);

    console.log("[*] out3:");
    dumpHex(out3, 0x40);

    let outPtr = ptr(0);
    let outLen = 0;

    try {
        outPtr = out2.readPointer();
    } catch (e) {
        console.log("[-] read out2[0] failed: " + e);
        return false;
    }

    try {
        outLen = out3.readU32();
    } catch (e) {
        console.log("[-] read out3[0] failed: " + e);
        outLen = 0;
    }

    console.log("[+] output ptr = " + outPtr);
    console.log("[+] output len = " + outLen + " / 0x" + outLen.toString(16));

    if (!isReadable(outPtr)) {
        console.log("[-] output ptr not readable");
        return false;
    }

    if (outLen <= 0 || outLen > MAX_OUTPUT_SIZE) {
        console.log("[-] invalid output len: " + outLen);
        return false;
    }

    mkdirs(OUTPUT_DIR);

    console.log("\n========== OUTPUT HEAD ==========");
    dumpHex(outPtr, Math.min(outLen, 256));

    console.log("\n========== OUTPUT ASCII ==========");
    console.log(readAscii(outPtr, Math.min(outLen, 1000)));

    const ts = Date.now();

    const rawPath = OUTPUT_DIR + "/decrypt_raw_" + ts + "_" + outLen + ".bin";
    writePtrToFile(outPtr, outLen, rawPath);

    const sig = scanSignature(outPtr, outLen);

    if (sig) {
        const bodyPtr = outPtr.add(sig.offset);
        const bodyLen = outLen - sig.offset;
        const ext = guessExt(bodyPtr, bodyLen);

        const outPath =
            OUTPUT_DIR +
            "/decrypt_" +
            ts +
            "_off_" +
            sig.offset +
            "_" +
            bodyLen +
            "." +
            ext;

        writePtrToFile(bodyPtr, bodyLen, outPath);

        console.log("\n========== DECRYPT RESULT ==========");
        console.log("signature = " + sig.sign);
        console.log("offset    = " + sig.offset);
        console.log("body ptr  = " + bodyPtr);
        console.log("body len  = " + bodyLen);
        console.log("raw file  = " + rawPath);
        console.log("out file  = " + outPath);

        console.log("\npreview:");
        console.log(readAscii(bodyPtr, Math.min(bodyLen, 1200)));

        return true;
    }

    console.log("\n[-] no JS/JSON signature found");
    console.log("[*] raw output dumped:");
    console.log(rawPath);

    return false;
}

// ===============================
// 调用 HEK 解密函数
// ===============================

function callDecrypt(inputPtr, inputSize) {
    const base = Module.findBaseAddress(SO_NAME);

    if (!base) {
        console.log("[-] base not found: " + SO_NAME);
        return false;
    }

    const fnAddr = base.add(DECRYPT_OFF);

    console.log("[+] base    = " + base);
    console.log("[+] decrypt = " + addrInfo(fnAddr));

    const decrypt = new NativeFunction(
        fnAddr,
        "int",
        [
            "pointer",
            "pointer",
            "pointer",
            "pointer",
            "pointer",
            "pointer",
            "pointer",
            "pointer"
        ]
    );

    const out2 = Memory.alloc(0x100);
    const out3 = Memory.alloc(0x100);

    zeroMem(out2, 0x100);
    zeroMem(out3, 0x100);

    console.log("\n========== CALL DECRYPT ==========");
    console.log("x0 input = " + inputPtr);
    console.log("x1 size  = " + inputSize);
    console.log("x2 out2  = " + out2);
    console.log("x3 out3  = " + out3);

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
        console.log("[-] decrypt call failed: " + e);
        return false;
    }

    console.log("[+] decrypt ret = " + ret);

    if (ret !== 1) {
        console.log("[-] decrypt returned non-success");
    }

    return dumpDecryptOutput(out2, out3);
}

// ===============================
// main
// ===============================

setImmediate(function () {
    console.log("========== CALL HEK DECRYPT FULL ==========");
    console.log("[*] input  = " + INPUT_FILE);
    console.log("[*] output = " + OUTPUT_DIR);

    const file = readWholeFile(INPUT_FILE);

    if (!file) {
        console.log("[-] read input failed");
        return;
    }

    console.log("\n========== INPUT HEAD ==========");
    dumpHex(file.ptr, Math.min(file.size, 128));

    if (!checkHEK(file.ptr)) {
        console.log("[-] input is not HEK:");
        return;
    }

    console.log("[+] input is HEK:");

    const ok = callDecrypt(file.ptr, file.size);

    if (ok) {
        console.log("\n========== DONE SUCCESS ==========");
    } else {
        console.log("\n========== DONE BUT NO FINAL TEXT FOUND ==========");
    }

    console.log("[*] pull command:");
    console.log("adb pull " + OUTPUT_DIR + " ./hek_decrypt_out");
});