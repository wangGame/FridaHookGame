'use strict';

function checkIl2cpp() {
    const base = Module.findBaseAddress("libil2cpp.so");
    if (base !== null) {
        console.log("✅ libil2cpp.so 已加载 @", base);
        return true;
    } else {
        console.log("❌ libil2cpp.so 尚未加载");
        return false;
    }
}

setImmediate(checkIl2cpp);