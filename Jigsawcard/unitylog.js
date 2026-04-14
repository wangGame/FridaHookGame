'use strict';

const base = Module.findBaseAddress("libil2cpp.so");
const addr = base.add(0x0231AA8C);

function readIl2CppString32(p) {
    try {
        if (!p || p.isNull()) return null;

        const len = p.add(0x8).readS32();
        if (len < 0 || len > 0x1000) return null;

        return p.add(0xC).readUtf16String(len);
    } catch (e) {
        return null;
    }
}

Interceptor.attach(addr, {
    onEnter(args) {
        const msg = readIl2CppString32(args[0]);

        console.log("\n=== Debug.Log hit ===");
        console.log("msg =", msg);

        // 👉 获取调用链
        const bt = Thread.backtrace(this.context, Backtracer.ACCURATE)
            .slice(0, 2) // ⭐ 只取两层
            .map(DebugSymbol.fromAddress);

        console.log("=== Call Stack (top 2) ===");
        bt.forEach((s, i) => {
            console.log(`#${i} ${s.address} ${s.name} (${s.moduleName})`);
        });
    }
});
//
//'use strict';
//
//const base = Module.findBaseAddress("libil2cpp.so");
//const addr = base.add(0x0231AA8C);
//
//function readIl2CppString32(p) {
//    try {
//        if (!p || p.isNull()) return null;
//
//        const len = p.add(0x8).readS32();
//        if (len < 0 || len > 0x1000) return null;
//
//        return p.add(0xC).readUtf16String(len);
//    } catch (e) {
//        return null;
//    }
//}
//
//Interceptor.attach(addr, {
//    onEnter(args) {
//        const msg = readIl2CppString32(args[0]);
//
//        console.log("\n=== Debug.Log hit ===");
//        console.log("arg0 =", args[0], "msg =", msg);
//        console.log("arg1 =", args[1]);
//        console.log("arg2 =", args[2]);
//        console.log("arg3 =", args[3]);
//    }
//});