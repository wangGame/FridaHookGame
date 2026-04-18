const TARGET_LIB = "libil2cpp.so";

let probed = false;

function probe() {
    if (probed) return;

    const base = Module.findBaseAddress(TARGET_LIB);
    if (!base) return;

    probed = true;

    console.log("[🔥] " + TARGET_LIB + " loaded @ " + base);

    // 👉 这里写你的逻辑（比如枚举导出 / hook）
    Module.enumerateExportsSync(TARGET_LIB).forEach(e => {
        console.log("[EXPORT] " + e.name);
    });
}

// =========================
// Hook dlopen 系列
// =========================
function hookLoad(name) {
    const addr = Module.findExportByName(null, name);
    if (!addr) {
        console.log("[-] no " + name);
        return;
    }

    Interceptor.attach(addr, {
        onEnter(args) {
            this.path = args[0] ? args[0].readCString() : "";
        },
        onLeave(ret) {
            if (!this.path) return;

            const p = this.path.toLowerCase();

            // 👉 只过滤关键 so（你可以改）
            if (
                p.includes("il2cpp") ||
                p.includes("unity") ||
                p.includes("mono") ||
                p.includes("main")
            ) {
                console.log("[" + name + "] " + this.path + " ret=" + ret);

                // 等待 so 完全加载后再 probe
                setTimeout(probe, 50);
            }
        }
    });

    console.log("[+] hooked " + name);
}

// =========================
// 启动
// =========================
setImmediate(() => {
    console.log("[*] start hook dlopen");

    hookLoad("dlopen");
    hookLoad("android_dlopen_ext");

    // 👉 防止已经加载（attach 场景）
    setTimeout(probe, 1000);
});