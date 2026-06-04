'use strict';

console.log("========== Game SO Only ==========");

function isGameSo(path) {
    if (!path) return false;

    if (path.indexOf("/system/") === 0) return false;
    if (path.indexOf("/vendor/") === 0) return false;
    if (path.indexOf("/apex/") === 0) return false;
    if (path.indexOf("linux-vdso") >= 0) return false;

    return path.indexOf(".so") >= 0;
}

Process.enumerateModules()
    .filter(m => isGameSo(m.path))
    .forEach(m => {
        console.log("[GAME_SO] " + m.name + " => " + m.path);
    });

function hookDlopen(name) {
    const addr = Module.findExportByName(null, name);
    if (!addr) return;

    Interceptor.attach(addr, {
        onEnter(args) {
            this.path = null;
            try {
                if (!args[0].isNull()) {
                    this.path = args[0].readCString();
                }
            } catch (e) {}
        },
        onLeave(retval) {
            if (!this.path) return;
            if (!isGameSo(this.path)) return;

            console.log("[DLOPEN_GAME] " + this.path + " => " + retval);
        }
    });
}

hookDlopen("dlopen");
hookDlopen("android_dlopen_ext");