'use strict';

/**
 * ============================
 * 配置区
 * ============================
 */

const GAME_SO_KEYWORDS = [
    "libcocos",
    "libil2cpp",
    "libgame",
    "libunity",
    "libmono"
];

const SYSTEM_SO_KEYWORDS = [
    "libc.so",
    "liblog.so",
    "libart.so",
    "libandroid_runtime.so",
    "libbase.so"
];

const SYSTEM_LOG_KEYWORDS = [
    "/proc/",
    "ActivityManager",
    "OpenGLRenderer",
    "EGL_emulation",
    "SurfaceFlinger"
];

// 只匹配特定字符串
const ONLY_MATCH_TEXT = null;

// 只保留 talog SendEvent
const EVENT_PREFIX = "talog SendEvent";

// 最大 callstack 层数（0 = 全部）
const MAX_CALLSTACK_DEPTH = 10;


/**
 * ============================
 * 工具函数
 * ============================
 */

function containsAny(str, arr) {
    for (let i = 0; i < arr.length; i++) {
        if (str.indexOf(arr[i]) !== -1) return true;
    }
    return false;
}

function isSystemLogText(text) {
    return containsAny(text, SYSTEM_LOG_KEYWORDS);
}

function hasGameSoInBacktrace(bt) {
    for (let i = 0; i < bt.length; i++) {
        const s = bt[i].toString();
        if (containsAny(s, GAME_SO_KEYWORDS)) {
            return true;
        }
    }
    return false;
}

// 裁剪符号字符串
function simplifySymbolLine(line) {
    return line
        .replace(/^0x[0-9a-f]+ [^!]+!_ZN\d+/i, "")
        .replace(/\+0x[0-9a-f]+$/i, "")
        .trim();
}

// 尝试解析 JSON
function tryParseJSON(str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return null;
    }
}


/**
 * ============================
 * 主 Hook
 * ============================
 */

function hookVsnprintf() {
    const vsnprintf = Module.findExportByName(null, "vsnprintf");
    if (!vsnprintf) {
        console.error("[-] vsnprintf not found");
        return;
    }

    console.log("[+] hook vsnprintf @", vsnprintf);

    Interceptor.attach(vsnprintf, {
        onEnter: function (args) {
            this.buf = args[0];
            this.backtrace = Thread.backtrace(
                this.context,
                Backtracer.ACCURATE
            ).map(DebugSymbol.fromAddress);
        },

        onLeave: function () {
            try {
                if (!this.buf) return;

                const text = this.buf.readCString();
                if (!text || text.length < 2) return;
                if (isSystemLogText(text)) return;
                if (ONLY_MATCH_TEXT && text.indexOf(ONLY_MATCH_TEXT) === -1) return;
                if (!hasGameSoInBacktrace(this.backtrace)) return;

                // ===== 事件识别 =====
                if (text.startsWith(EVENT_PREFIX)) {
                    // 拆成 eventName + json
                    const m = text.match(/^talog SendEvent\s+(\w+)\s+(.*)$/);
                    if (m) {
                        const eventName = m[1];
                        const jsonStr = m[2];
                        const data = tryParseJSON(jsonStr);

                        console.log("\n🟢🟢🟢 GAME EVENT 🟢🟢🟢");
                        console.log(" Event:", eventName);
                        console.log(" Data:", data ? JSON.stringify(data) : jsonStr);

                        // 显示 callstack（最多 MAX_CALLSTACK_DEPTH 层）
                        console.log(" 🔽 CALL STACK 🔽");
                        let depth = MAX_CALLSTACK_DEPTH || this.backtrace.length;
                        for (let i = 0; i < this.backtrace.length && i < depth; i++) {
                            const simple = simplifySymbolLine(this.backtrace[i].toString());
                            if (simple.length > 0) console.log("  " + simple);
                        }
                        console.log("🔴🔴🔴 END 🔴🔴🔴\n");
                        return;
                    }
                }

                // ===== 普通游戏日志 =====
                console.log("\n🟡🟡🟡 GAME LOG 🟡🟡🟡");
                console.log(text.trim());

                let depth = MAX_CALLSTACK_DEPTH || this.backtrace.length;
                console.log(" 🔽 CALL STACK 🔽");
                for (let i = 0; i < this.backtrace.length && i < depth; i++) {
                    const simple = simplifySymbolLine(this.backtrace[i].toString());
                    if (simple.length > 0) console.log("  " + simple);
                }
                console.log("🔴🔴🔴 END 🔴🔴🔴\n");

            } catch (e) {}
        }
    });
}

/**
 * ============================
 * 启动
 * ============================
 */

setImmediate(function () {
    console.log("[*] cocos/game log filter enabled");
    hookVsnprintf();
});
