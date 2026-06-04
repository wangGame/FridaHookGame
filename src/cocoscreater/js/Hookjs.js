'use strict';

const MARKER = [0x48, 0x45, 0x4b, 0x3a]; // HEK:
const MARKER_LEN = MARKER.length;

const MAX_JS_DUMP = 4 * 1024 * 1024;
const recentEncrypted = [];

let jsIndex = 0;
let hitIndex = 0;

function hasMarker(p) {
    try {
        if (!p || p.isNull()) return false;

        for (let i = 0; i < MARKER_LEN; i++) {
            if (p.add(i).readU8() !== MARKER[i]) {
                return false;
            }
        }

        return true;
    } catch (e) {
        return false;
    }
}

function looksJs(p) {
    try {
        if (!p || p.isNull()) return false;

        const b0 = p.readU8();
        const b1 = p.add(1).readU8();
        const b2 = p.add(2).readU8();

        if (b0 === 0x28) return true; // (
        if (b0 === 0x2f && b1 === 0x2f) return true; // //
        if (b0 === 0x2f && b1 === 0x2a) return true; // /*
        if (b0 === 0x76 && b1 === 0x61 && b2 === 0x72) return true; // var
        if (b0 === 0x6c && b1 === 0x65 && b2 === 0x74) return true; // let
        if (b0 === 0x63 && b1 === 0x6f && b2 === 0x6e) return true; // con
        if (b0 === 0x77 && b1 === 0x69 && b2 === 0x6e) return true; // win
        if (b0 === 0x53 && b1 === 0x79 && b2 === 0x73) return true; // Sys
        if (b0 === 0x72 && b1 === 0x65 && b2 === 0x71) return true; // req
        if (b0 === 0x22 || b0 === 0x27) return true; // " or '

        return false;
    } catch (e) {
        return false;
    }
}

function dumpHead(p, len) {
    try {
        return hexdump(p, {
            offset: 0,
            length: Math.min(len, 96),
            header: false,
            ansi: false
        });
    } catch (e) {
        return "";
    }
}

function rangeInfo(addr) {
    try {
        const m = Process.findModuleByAddress(addr);
        if (m) {
            return m.name +
                " base=" + m.base +
                " offset=0x" + addr.sub(m.base).toString(16) +
                " addr=" + addr;
        }
    } catch (e) {}

    try {
        const r = Process.findRangeByAddress(addr);
        if (r) {
            return "range base=" + r.base +
                " size=0x" + r.size.toString(16) +
                " prot=" + r.protection +
                " file=" + JSON.stringify(r.file) +
                " offset=0x" + addr.sub(r.base).toString(16) +
                " addr=" + addr;
        }
    } catch (e) {}

    return addr + " unknown";
}

function safeReadUtf8(p, maxLen) {
    try {
        if (!p || p.isNull()) return null;
        return p.readUtf8String(maxLen);
    } catch (e) {
        return null;
    }
}

function sendJs(ptr, reason, caller) {
    if (!looksJs(ptr)) return;

    const text = safeReadUtf8(ptr, MAX_JS_DUMP);
    if (!text || text.length < 20) return;

    const idx = jsIndex++;
    const dumpLen = Math.min(text.length, MAX_JS_DUMP);

    console.log("\n========== JS PLAINTEXT DUMP ==========");
    console.log("index  = " + idx);
    console.log("reason = " + reason);
    console.log("caller = " + rangeInfo(caller));
    console.log("len    = " + text.length);
    console.log("preview:");
    console.log(text.substring(0, 600));

    try {
        send({
            type: "js_plaintext",
            index: idx,
            reason: reason,
            caller: rangeInfo(caller),
            length: text.length
        }, ptr.readByteArray(dumpLen));
    } catch (e) {
        console.log("[-] send js failed: " + e);
    }
}

function rememberEncrypted(ptr, caller) {
    recentEncrypted.push({
        ptr: ptr,
        caller: caller,
        time: Date.now()
    });

    while (recentEncrypted.length > 20) {
        recentEncrypted.shift();
    }
}

function watchInplaceDecrypt(ptr, caller) {
    let count = 0;

    const timer = setInterval(function () {
        count++;

        try {
            // 情况 1：原 buffer 直接变成 JS
            if (looksJs(ptr)) {
                console.log("\n========== INPLACE DECRYPT FOUND ==========");
                console.log("ptr    = " + ptr);
                console.log("caller = " + rangeInfo(caller));
                sendJs(ptr, "inplace_ptr", caller);
                clearInterval(timer);
                return;
            }

            // 情况 2：跳过 HEK: 头后的 body 变成 JS
            const body = ptr.add(MARKER_LEN);
            if (looksJs(body)) {
                console.log("\n========== INPLACE BODY DECRYPT FOUND ==========");
                console.log("ptr    = " + body);
                console.log("caller = " + rangeInfo(caller));
                sendJs(body, "inplace_ptr_plus_" + MARKER_LEN, caller);
                clearInterval(timer);
                return;
            }
        } catch (e) {}

        // 最多观察大约 1 秒
        if (count > 100) {
            clearInterval(timer);
        }
    }, 10);
}

function hookMemcmp() {
    const addr = Module.findExportByName("libc.so", "memcmp");
    if (!addr) {
        console.log("[-] memcmp not found");
        return;
    }

    Interceptor.attach(addr, {
        onEnter(args) {
            this.hit = false;

            let n = 0;
            try {
                n = args[2].toInt32();
            } catch (e) {
                return;
            }

            // HEK: 长度是 4
            // 允许 5 是为了兼容 HEK:\0 这种比较
            if (n !== MARKER_LEN && n !== MARKER_LEN + 1) return;

            const a = args[0];
            const b = args[1];

            const aMarker = hasMarker(a);
            const bMarker = hasMarker(b);

            if (!aMarker && !bMarker) return;

            this.hit = true;
            this.a = a;
            this.b = b;
            this.n = n;
            this.aMarker = aMarker;
            this.bMarker = bMarker;
            this.aJs = looksJs(a);
            this.bJs = looksJs(b);
            this.caller = this.returnAddress;
        },

        onLeave(retval) {
            if (!this.hit) return;

            const ret = retval.toInt32();
            const idx = hitIndex++;

            console.log("\n========== HEK MARKER MEMCMP ==========");
            console.log("index  = " + idx);
            console.log("caller = " + rangeInfo(this.caller));
            console.log("len    = " + this.n);
            console.log("ret    = " + ret);

            console.log("arg0   = " + this.a + " marker=" + this.aMarker + " js=" + this.aJs);
            console.log(dumpHead(this.a, 32));

            console.log("arg1   = " + this.b + " marker=" + this.bMarker + " js=" + this.bJs);
            console.log(dumpHead(this.b, 32));

            // ret == 0：真正命中 HEK: 加密脚本
            if (ret === 0) {
                const encPtr = this.aMarker ? this.a : this.b;

                console.log(">>> ret=0，当前 buffer 命中 HEK: 标记");
                console.log(">>> encPtr = " + encPtr);
                console.log(">>> caller = " + rangeInfo(this.caller));

                rememberEncrypted(encPtr, this.caller);
                watchInplaceDecrypt(encPtr, this.caller);
            }

            // ret != 0，但参数已经是 JS，说明解密后/明文脚本进入执行链
            if (this.aJs) {
                sendJs(this.a, "memcmp_arg0_js_ret_" + ret, this.caller);
            }

            if (this.bJs) {
                sendJs(this.b, "memcmp_arg1_js_ret_" + ret, this.caller);
            }
        }
    });

    console.log("[+] hook memcmp HEK: stage2");
}

setImmediate(function () {
    console.log("========== Hook HEK: Stage2 ==========");
    console.log("marker = HEK:");
    console.log("marker length = " + MARKER_LEN);
    hookMemcmp();
    console.log("========== Hook Installed ==========");
});


//'use strict';
//
//const JY = [0x6a, 0x79, 0x63, 0x72, 0x79, 0x70, 0x74]; // jycrypt
//
//const MAX_JS_DUMP = 4 * 1024 * 1024;
//const recentEncrypted = [];
//let jsIndex = 0;
//let hitIndex = 0;
//
//function hasJycrypt(p) {
//    try {
//        if (!p || p.isNull()) return false;
//        for (let i = 0; i < 7; i++) {
//            if (p.add(i).readU8() !== JY[i]) return false;
//        }
//        return true;
//    } catch (e) {
//        return false;
//    }
//}
//
//function looksJs(p) {
//    try {
//        if (!p || p.isNull()) return false;
//
//        const b0 = p.readU8();
//        const b1 = p.add(1).readU8();
//        const b2 = p.add(2).readU8();
//
//        if (b0 === 0x28) return true; // (
//        if (b0 === 0x2f && b1 === 0x2f) return true; // //
//        if (b0 === 0x2f && b1 === 0x2a) return true; // /*
//        if (b0 === 0x76 && b1 === 0x61 && b2 === 0x72) return true; // var
//        if (b0 === 0x6c && b1 === 0x65 && b2 === 0x74) return true; // let
//        if (b0 === 0x63 && b1 === 0x6f && b2 === 0x6e) return true; // con
//        if (b0 === 0x77 && b1 === 0x69 && b2 === 0x6e) return true; // win
//        if (b0 === 0x53 && b1 === 0x79 && b2 === 0x73) return true; // Sys
//        if (b0 === 0x72 && b1 === 0x65 && b2 === 0x71) return true; // req
//        if (b0 === 0x22 || b0 === 0x27) return true; // " or '
//
//        return false;
//    } catch (e) {
//        return false;
//    }
//}
//
//function dumpHead(p, len) {
//    try {
//        return hexdump(p, {
//            offset: 0,
//            length: Math.min(len, 96),
//            header: false,
//            ansi: false
//        });
//    } catch (e) {
//        return "";
//    }
//}
//
//function rangeInfo(addr) {
//    try {
//        const m = Process.findModuleByAddress(addr);
//        if (m) {
//            return m.name +
//                " base=" + m.base +
//                " offset=0x" + addr.sub(m.base).toString(16) +
//                " addr=" + addr;
//        }
//    } catch (e) {}
//
//    try {
//        const r = Process.findRangeByAddress(addr);
//        if (r) {
//            return "range base=" + r.base +
//                " size=0x" + r.size.toString(16) +
//                " prot=" + r.protection +
//                " file=" + JSON.stringify(r.file) +
//                " offset=0x" + addr.sub(r.base).toString(16) +
//                " addr=" + addr;
//        }
//    } catch (e) {}
//
//    return addr + " unknown";
//}
//
//function safeReadUtf8(p, maxLen) {
//    try {
//        if (!p || p.isNull()) return null;
//        return p.readUtf8String(maxLen);
//    } catch (e) {
//        return null;
//    }
//}
//
//function sendJs(ptr, reason, caller) {
//    if (!looksJs(ptr)) return;
//
//    const text = safeReadUtf8(ptr, MAX_JS_DUMP);
//    if (!text || text.length < 20) return;
//
//    const idx = jsIndex++;
//    const dumpLen = Math.min(text.length, MAX_JS_DUMP);
//
//    console.log("\n========== JS PLAINTEXT DUMP ==========");
//    console.log("index  = " + idx);
//    console.log("reason = " + reason);
//    console.log("caller = " + rangeInfo(caller));
//    console.log("len    = " + text.length);
//    console.log("preview:");
//    console.log(text.substring(0, 600));
//
//    try {
//        send({
//            type: "js_plaintext",
//            index: idx,
//            reason: reason,
//            caller: rangeInfo(caller),
//            length: text.length
//        }, ptr.readByteArray(dumpLen));
//    } catch (e) {
//        console.log("[-] send js failed: " + e);
//    }
//}
//
//function rememberEncrypted(ptr, caller) {
//    recentEncrypted.push({
//        ptr: ptr,
//        caller: caller,
//        time: Date.now()
//    });
//
//    while (recentEncrypted.length > 20) {
//        recentEncrypted.shift();
//    }
//}
//
//function watchInplaceDecrypt(ptr, caller) {
//    let count = 0;
//
//    const timer = setInterval(function () {
//        count++;
//
//        try {
//            // 情况 1：原 buffer 直接变成 JS
//            if (looksJs(ptr)) {
//                console.log("\n========== INPLACE DECRYPT FOUND ==========");
//                console.log("ptr    = " + ptr);
//                console.log("caller = " + rangeInfo(caller));
//                sendJs(ptr, "inplace_ptr", caller);
//                clearInterval(timer);
//                return;
//            }
//
//            // 情况 2：跳过 jycrypt 头后的 body 变成 JS
//            const body = ptr.add(7);
//            if (looksJs(body)) {
//                console.log("\n========== INPLACE BODY DECRYPT FOUND ==========");
//                console.log("ptr    = " + body);
//                console.log("caller = " + rangeInfo(caller));
//                sendJs(body, "inplace_ptr_plus_7", caller);
//                clearInterval(timer);
//                return;
//            }
//        } catch (e) {}
//
//        // 最多观察大约 1 秒
//        if (count > 100) {
//            clearInterval(timer);
//        }
//    }, 10);
//}
//
//function hookMemcmp() {
//    const addr = Module.findExportByName("libc.so", "memcmp");
//    if (!addr) {
//        console.log("[-] memcmp not found");
//        return;
//    }
//
//    Interceptor.attach(addr, {
//        onEnter(args) {
//            this.hit = false;
//
//            let n = 0;
//            try {
//                n = args[2].toInt32();
//            } catch (e) {
//                return;
//            }
//
//            if (n !== 7 && n !== 8) return;
//
//            const a = args[0];
//            const b = args[1];
//
//            const aJy = hasJycrypt(a);
//            const bJy = hasJycrypt(b);
//
//            if (!aJy && !bJy) return;
//
//            this.hit = true;
//            this.a = a;
//            this.b = b;
//            this.n = n;
//            this.aJy = aJy;
//            this.bJy = bJy;
//            this.aJs = looksJs(a);
//            this.bJs = looksJs(b);
//            this.caller = this.returnAddress;
//        },
//
//        onLeave(retval) {
//            if (!this.hit) return;
//
//            const ret = retval.toInt32();
//            const idx = hitIndex++;
//
//            console.log("\n========== JYCRYPT MEMCMP ==========");
//            console.log("index  = " + idx);
//            console.log("caller = " + rangeInfo(this.caller));
//            console.log("len    = " + this.n);
//            console.log("ret    = " + ret);
//
//            console.log("arg0   = " + this.a + " jy=" + this.aJy + " js=" + this.aJs);
//            console.log(dumpHead(this.a, 32));
//
//            console.log("arg1   = " + this.b + " jy=" + this.bJy + " js=" + this.bJs);
//            console.log(dumpHead(this.b, 32));
//
//            // ret == 0：真正命中 jycrypt 加密脚本
//            if (ret === 0) {
//                const encPtr = this.aJy ? this.a : this.b;
//
//                console.log(">>> ret=0，当前 buffer 是 jycrypt 密文");
//                console.log(">>> encPtr = " + encPtr);
//                console.log(">>> check offset in IDA: libcocos2djs.so + 0x648ba4");
//
//                rememberEncrypted(encPtr, this.caller);
//                watchInplaceDecrypt(encPtr, this.caller);
//            }
//
//            // ret != 0，但参数已经是 JS，说明解密后/明文脚本进入执行链
//            if (this.aJs) {
//                sendJs(this.a, "memcmp_arg0_js_ret_" + ret, this.caller);
//            }
//
//            if (this.bJs) {
//                sendJs(this.b, "memcmp_arg1_js_ret_" + ret, this.caller);
//            }
//        }
//    });
//
//    console.log("[+] hook memcmp jycrypt stage2");
//}
//
//setImmediate(function () {
//    console.log("========== Hook JYCRYPT Stage2 ==========");
//    hookMemcmp();
//    console.log("========== Hook Installed ==========");
//});