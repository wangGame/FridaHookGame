# -*- coding: utf-8 -*-
import os
import re
import time
import hashlib
import subprocess
from pathlib import Path

import frida


# ============================================================
# 配置区
# ============================================================

PACKAGE_NAME = "com.block.juggle"
PROCESS_NAME = "Block Blast!"

# 本地 HEK 文件目录
LOCAL_ROOT = Path(r"D:\blockBlast\Block_Blast_v\assets\assets")

# 本地解密输出目录
LOCAL_OUT_ROOT = Path(r"D:\blockBlast\Block_Blast_v\assets_decrypted")

# 手机临时目录
ANDROID_WORK_ROOT = "/storage/emulated/0/Android/data/com.block.juggle/files/hek_batch_decrypt"
ANDROID_IN_DIR = ANDROID_WORK_ROOT + "/in"
ANDROID_OUT_DIR = ANDROID_WORK_ROOT + "/out"

# 解密函数
SO_NAME = "libcocos2djs.so"
DECRYPT_OFF = 0x909790

# 游戏已经运行就用 False；需要脚本启动游戏就改 True
SPAWN_APP = False


# ============================================================
# Frida JS Agent
# ============================================================

FRIDA_JS = r"""
'use strict';

const SO_NAME = "libcocos2djs.so";
const DECRYPT_OFF = 0x909790;

const MAX_OUTPUT_SIZE = 128 * 1024 * 1024;

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
    throw new Error("missing libc symbols");
}

const libc_open = new NativeFunction(openPtr, "int", ["pointer", "int", "int"]);
const libc_read = new NativeFunction(readPtr, "int", ["int", "pointer", "int"]);
const libc_write = new NativeFunction(writePtr, "int", ["int", "pointer", "int"]);
const libc_close = new NativeFunction(closePtr, "int", ["int"]);
const libc_lseek = new NativeFunction(lseekPtr, "long", ["int", "long", "int"]);
const libc_mkdir = new NativeFunction(mkdirPtr, "int", ["pointer", "int"]);

function toNumber(v) {
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

function dirname(path) {
    const idx = path.lastIndexOf("/");
    if (idx <= 0) return "/";
    return path.substring(0, idx);
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

function readWholeFile(path) {
    const fd = libc_open(Memory.allocUtf8String(path), O_RDONLY, 0);

    if (fd < 0) {
        return {
            ok: false,
            error: "open input failed: " + path
        };
    }

    const size = toNumber(libc_lseek(fd, 0, SEEK_END));
    libc_lseek(fd, 0, SEEK_SET);

    if (size <= 0) {
        libc_close(fd);
        return {
            ok: false,
            error: "invalid file size: " + size
        };
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
        return {
            ok: false,
            error: "read mismatch read=" + readTotal + " size=" + size
        };
    }

    return {
        ok: true,
        ptr: buf,
        size: readTotal
    };
}

function writePtrToFile(ptrData, size, filePath) {
    mkdirs(dirname(filePath));

    const fd = libc_open(
        Memory.allocUtf8String(filePath),
        O_WRONLY_CREAT_TRUNC,
        MODE_666
    );

    if (fd < 0) {
        return {
            ok: false,
            error: "open output failed: " + filePath
        };
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

    if (written !== size) {
        return {
            ok: false,
            error: "write mismatch written=" + written + " size=" + size
        };
    }

    return {
        ok: true
    };
}

function scanSignature(p, size) {
    const signs = [
        "window.__require",
        "window.__r",
        "(function",
        "!function",
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

function guessExt(p, size, sign) {
    const preview = readAscii(p, Math.min(size, 512)).replace(/^\s+/, "");

    if (preview.indexOf("{") === 0 || preview.indexOf("[") === 0) {
        return "json";
    }

    if (sign === "{" || sign === "[") {
        return "json";
    }

    return "js";
}

function decryptFile(inputPath, outputPath) {
    const base = Module.findBaseAddress(SO_NAME);

    if (!base) {
        return {
            ok: false,
            error: "base not found: " + SO_NAME
        };
    }

    const fnAddr = base.add(DECRYPT_OFF);

    const file = readWholeFile(inputPath);

    if (!file.ok) {
        return file;
    }

    if (!checkHEK(file.ptr)) {
        return {
            ok: false,
            error: "not HEK file"
        };
    }

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

    let ret = 0;

    try {
        ret = decrypt(
            file.ptr,
            ptr(file.size),
            out2,
            out3,
            ptr(0),
            ptr(0),
            ptr(0),
            ptr(0)
        );
    } catch (e) {
        return {
            ok: false,
            error: "decrypt call failed: " + e
        };
    }

    let outPtr = ptr(0);
    let outLen = 0;

    try {
        outPtr = out2.readPointer();
        outLen = out3.readU32();
    } catch (e) {
        return {
            ok: false,
            ret: ret,
            error: "read output struct failed: " + e
        };
    }

    if (ret !== 1) {
        return {
            ok: false,
            ret: ret,
            error: "decrypt ret != 1"
        };
    }

    if (!isReadable(outPtr)) {
        return {
            ok: false,
            ret: ret,
            error: "output ptr not readable: " + outPtr
        };
    }

    if (outLen <= 0 || outLen > MAX_OUTPUT_SIZE) {
        return {
            ok: false,
            ret: ret,
            error: "invalid output len: " + outLen
        };
    }

    const sig = scanSignature(outPtr, outLen);

    let bodyPtr = outPtr;
    let bodyLen = outLen;
    let sigOffset = 0;
    let sign = "raw";
    let ext = "bin";

    if (sig) {
        sigOffset = sig.offset;
        sign = sig.sign;
        bodyPtr = outPtr.add(sigOffset);
        bodyLen = outLen - sigOffset;
        ext = guessExt(bodyPtr, bodyLen, sign);
    }

    const w = writePtrToFile(bodyPtr, bodyLen, outputPath);

    if (!w.ok) {
        return {
            ok: false,
            ret: ret,
            error: w.error
        };
    }

    return {
        ok: true,
        ret: ret,
        inputSize: file.size,
        outputSize: outLen,
        bodySize: bodyLen,
        sigOffset: sigOffset,
        signature: sign,
        ext: ext,
        androidOutput: outputPath,
        preview: readAscii(bodyPtr, Math.min(bodyLen, 300))
    };
}

// 重点：这里必须导出 decryptFile。
// Python 里 script.exports_sync.decrypt_file(...) 会自动映射到 JS 的 decryptFile。
rpc.exports = {
    decryptFile: function (inputPath, outputPath) {
        return decryptFile(inputPath, outputPath);
    }
};
"""


# ============================================================
# Python 工具函数
# ============================================================

def run_cmd(cmd, check=True, quiet=False):
    p = subprocess.run(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="ignore",
    )

    if not quiet and p.stdout.strip():
        print(p.stdout.strip())

    if check and p.returncode != 0:
        raise RuntimeError(f"command failed: {' '.join(cmd)}\n{p.stdout}")

    return p.stdout


def adb_shell(cmd, quiet=True):
    return run_cmd(["adb", "shell", cmd], quiet=quiet)


def adb_push(local_path: Path, remote_path: str):
    run_cmd(["adb", "push", str(local_path), remote_path], quiet=True)


def adb_pull(remote_path: str, local_path: Path):
    local_path.parent.mkdir(parents=True, exist_ok=True)
    run_cmd(["adb", "pull", remote_path, str(local_path)], quiet=True)


def safe_remote_name(rel_path: str) -> str:
    h = hashlib.sha1(rel_path.encode("utf-8", errors="ignore")).hexdigest()[:16]
    base = os.path.basename(rel_path)
    base = re.sub(r"[^A-Za-z0-9._-]+", "_", base)

    if not base:
        base = "file"

    return f"{h}_{base}"


def is_hek_file(path: Path) -> bool:
    try:
        with path.open("rb") as f:
            return f.read(4) == b"HEK:"
    except Exception:
        return False


def iter_files(root: Path):
    for dirpath, _, filenames in os.walk(root):
        for name in filenames:
            yield Path(dirpath) / name


def on_message(message, data):
    if message["type"] == "send":
        print("[frida]", message.get("payload"))
    elif message["type"] == "error":
        print("[frida error]", message.get("stack", message))
    else:
        print("[frida msg]", message)


def attach_frida():
    device = frida.get_usb_device(timeout=10)

    if SPAWN_APP:
        print(f"[*] spawn {PACKAGE_NAME}")
        pid = device.spawn([PACKAGE_NAME])
        session = device.attach(pid)
        script = session.create_script(FRIDA_JS)
        script.on("message", on_message)
        script.load()
        device.resume(pid)
        time.sleep(2)
        return device, session, script

    try:
        print(f"[*] attach process: {PROCESS_NAME}")
        session = device.attach(PROCESS_NAME)
    except Exception:
        print(f"[*] attach package: {PACKAGE_NAME}")
        session = device.attach(PACKAGE_NAME)

    script = session.create_script(FRIDA_JS)
    script.on("message", on_message)
    script.load()

    return device, session, script


# ============================================================
# 主流程
# ============================================================

def main():
    if not LOCAL_ROOT.exists():
        raise FileNotFoundError(f"LOCAL_ROOT not found: {LOCAL_ROOT}")

    print("========== BATCH HEK DECRYPT ==========")
    print(f"local root : {LOCAL_ROOT}")
    print(f"local out  : {LOCAL_OUT_ROOT}")
    print(f"android in : {ANDROID_IN_DIR}")
    print(f"android out: {ANDROID_OUT_DIR}")

    adb_shell(f"mkdir -p {ANDROID_IN_DIR}", quiet=True)
    adb_shell(f"mkdir -p {ANDROID_OUT_DIR}", quiet=True)

    _, session, script = attach_frida()

    total = 0
    hek_count = 0
    ok_count = 0
    fail_count = 0
    skip_count = 0

    for file_path in iter_files(LOCAL_ROOT):
        total += 1

        rel = file_path.relative_to(LOCAL_ROOT).as_posix()

        if not is_hek_file(file_path):
            skip_count += 1
            continue

        hek_count += 1

        remote_name = safe_remote_name(rel)
        remote_in = f"{ANDROID_IN_DIR}/{remote_name}"
        remote_out = f"{ANDROID_OUT_DIR}/{remote_name}.out"

        print(f"\n[{hek_count}] decrypt: {rel}")

        try:
            adb_push(file_path, remote_in)

            # Python 的 decrypt_file 会映射到 JS 的 decryptFile
            result = script.exports_sync.decrypt_file(remote_in, remote_out)

            if not result or not result.get("ok"):
                fail_count += 1
                print(f"[-] decrypt failed: {rel}")
                print(f"    result = {result}")
                continue

            ext = result.get("ext", "bin")
            sig = result.get("signature", "raw")
            body_size = result.get("bodySize", 0)

            local_out = LOCAL_OUT_ROOT / (rel + f".dec.{ext}")

            adb_pull(remote_out, local_out)

            ok_count += 1

            print(f"[+] ok: {rel}")
            print(f"    signature = {sig}")
            print(f"    size      = {body_size}")
            print(f"    out       = {local_out}")

        except Exception as e:
            fail_count += 1
            print(f"[-] exception: {rel}")
            print(f"    {e}")

    print("\n========== SUMMARY ==========")
    print(f"total files : {total}")
    print(f"HEK files   : {hek_count}")
    print(f"success     : {ok_count}")
    print(f"failed      : {fail_count}")
    print(f"skipped     : {skip_count}")
    print(f"output dir  : {LOCAL_OUT_ROOT}")

    try:
        session.detach()
    except Exception:
        pass


if __name__ == "__main__":
    main()