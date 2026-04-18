'use strict';
function dumpSymbol(addr) {
    const s = DebugSymbol.fromAddress(addr);

    let base = null;
    let offset = null;

    if (s.moduleName) {
        const m = Process.findModuleByName(s.moduleName);
        if (m) {
            base = m.base;
            offset = ptr(addr).sub(m.base);
        }
    }

    return {
        address: addr,
        function: s.name,
        module: s.moduleName,
        moduleBase: base,
        offset: offset
    };
}


function hookVsnprintf() {
    const vsnprintf = Module.findExportByName(null, "vsnprintf");
    if (!vsnprintf) {
        console.error("[-] vsnprintf not found");
        return;
    }

    console.log("[+] hook vsnprintf @", vsnprintf);

    Interceptor.attach(vsnprintf, {
        onEnter(args) {
            const bt = Thread.backtrace(this.context, Backtracer.ACCURATE);

            const symbols = bt.map(dumpSymbol);

            // 是否命中 libcocos.so
            const hit = symbols.some(s => s.module === "libcocos2dcpp.so");
            if (!hit) return;

            console.log("=========== BACKTRACE (hit libcocos.so) BEGIN ===========");

            symbols.forEach((info, i) => {
                console.log(
                    `#${i}`,
                    "\n  address     :", info.address,
                    "\n  function    :", info.function,
                    "\n  module      :", info.module,
                    "\n  moduleBase  :", info.moduleBase,
                    "\n  offset      :", info.offset,
                    "\n  file        :", info.file,
                    "\n  line        :", info.line
                );
            });

            console.log("=========== BACKTRACE END =============");
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
