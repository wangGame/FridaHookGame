# frida-getget使用


启动游戏，执行下面操作

```shell
frida -U Gadget
```

## 遍历process

找到我们关心的App

```python
import frida
device = frida.get_usb_device(timeout=5)
print("===== Process list =====")
for p in device.enumerate_processes():
    print(f"{p.pid:<8} {p.name}")
```

输出

```shell
2727     com.android.systemui
2750     经典多米诺
2752     webview_zygote32
```

## hook指定的app

### attach指定的App

```python
import frida  # 导入frida模块
import sys  # 导入sys模块


def on_message(message, data):  # js中执行send函数后要回调的函数
    print(message)


rdev = frida.get_usb_device()

attachSession = rdev.attach("经典多米诺")
with open("src/resources/js/dominoesjs/HookMethod.js", "r", encoding="utf-8") as f:
    script = attachSession.create_script(f.read())

# with open("dominoesjs/HookMethod.js", "r", encoding="utf-8") as f:
#     script = attachxx.create_script(f.read())

script.on('message', on_message)  # 加载回调函数，也就是js中执行send函数规定要执行的python函数
script.load()  # 加载脚本

sys.stdin.read()
```

attach前面的App名字

### hook指定的部分

hook指定so下的配置

```shell
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
```

## hook指定方法的步骤

先获取方法的地址

## 多米诺骨牌Ai返回点数打印

```json
'use strict';

/**
 * ==========================
 * Il2Cpp API
 * ==========================
 */

const il2cpp_object_get_class = new NativeFunction(
    Module.findExportByName("libil2cpp.so", "il2cpp_object_get_class"),
    "pointer",
    ["pointer"]
);

const il2cpp_class_get_name = new NativeFunction(
    Module.findExportByName("libil2cpp.so", "il2cpp_class_get_name"),
    "pointer",
    ["pointer"]
);

/**
 * ==========================
 * 计算目标函数地址（关键）
 * ==========================
 */

const base = Module.findBaseAddress("libil2cpp.so");
if (!base) {
    console.log("❌ libil2cpp.so not loaded");

}

const RVA_GetTileForNextMove = 0x64BC38;
const addr = base.add(RVA_GetTileForNextMove);

console.log("🎯 AILogic.GetTileForNextMove =", addr);

/**
 * ==========================
 * 打印
 * ==========================
 */
//
//function dumpTile(tilePtr) {
//    if (tilePtr.isNull()) return;
//    console.log("🀄 Dumping Tile at: " + tilePtr);
//
//    // 假设 Tile 对象大小不大，尝试打印前 0x20 字节
//    for (var i = 0; i < 0x20; i += 4) {
//        var val = tilePtr.add(i).readU32();
//        console.log(" offset 0x" + i.toString(16) + ": 0x" + val.toString(16) + " / " + val);
//    }
//}

//function findTileValues(tilePtr) {
//    if (tilePtr.isNull()) return;
//    console.log("🀄 Scanning Tile at: " + tilePtr);
//
//    for (var i = 0; i < 0x20; i += 1) { // 每个字节扫
//        var val = tilePtr.add(i).readU8();
//        if (val >= 0 && val <= 6) {
//            console.log(" possible value at offset 0x" + i.toString(16) + ": " + val);
//        }
//    }
//}

//function printTile(tilePtr) {
//    if (tilePtr.isNull()) return;
//
//    // Tile.value 偏移 0x28
//    var valuePtr = tilePtr.add(0x28).readPointer();
//    if (valuePtr.isNull()) return;
//
//    // TileValue.left / right 偏移 0x0 / 0x1
//    var left = valuePtr.readU8();
//    var right = valuePtr.add(1).readU8();
//
//    console.log("🀄 Tile: [" + left + "|" + right + "]");
//}


function printTile(tilePtr) {
    if (tilePtr.isNull()) return;

    // Tile.value 偏移 0x28
    var tileValuePtr = tilePtr.add(0x28).readPointer();
    if (tileValuePtr.isNull()) return;

    // TileValue.leftEnd / rightEnd 偏移 0x8 / 0xC
    var left = tileValuePtr.add(0x8).readS32();   // ETiles 是 enum -> int32
    var right = tileValuePtr.add(0xC).readS32();

    console.log("🀄 Tile: [" + left + "|" + right + "]");
}

/**
 * ==========================
 * Hook
 * ==========================
 */

Interceptor.attach(addr, {
    onEnter(args) {
        console.log("\n🎮 AILogic.GetTileForNextMove ENTER");
        console.log("   mode     =", args[0]);
        console.log("   aiPlayer =", args[1]);
        console.log("   table    =", args[2]);
    },
    onLeave(retval) {
        if (retval.isNull()) {
            console.log("   return = null");
            return;
        }

//        // 打印返回对象类型
//        const klass = il2cpp_object_get_class(retval);
//        const name = il2cpp_class_get_name(klass).readCString();
//
//        console.log("   return object =", retval);
//        console.log("   return class  =", name);

        printTile(retval);
    }
});
```

## 修改返回的值

```js
function printTile(tilePtr) {
    if (tilePtr.isNull()) return;

    // Tile.value 偏移 0x28
    var tileValuePtr = tilePtr.add(0x28).readPointer();
    if (tileValuePtr.isNull()) return;

    // TileValue.leftEnd / rightEnd 偏移 0x8 / 0xC
    var left = tileValuePtr.add(0x8).readS32();   // ETiles 是 enum -> int32
    var right = tileValuePtr.add(0xC).readS32();

    console.log("🀄 Tile: [" + left + "|" + right + "]");

        // 🔥 修改返回点数
    tileValuePtr.add(0x8).writeS32(6);
    tileValuePtr.add(0xC).writeS32(6);

    console.log("🔥 After:  [6|6]");
}
```