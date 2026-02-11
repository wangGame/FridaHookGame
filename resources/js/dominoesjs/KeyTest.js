//'use strict';
//
///**
// * ==========================
// * 基础工具
// * ==========================
// */
//
//function hookSymbol(module, symbol, callbacks) {
//    const addr = Module.findExportByName(module, symbol);
//
//    if (!addr) {
//        console.log(`❌ [MISS] ${symbol}`);
//
//    }
//
//    console.log(`✅ [HOOK] ${symbol} @ ${addr}`);
//
//    Interceptor.attach(addr, callbacks);
//}
//
///**
// * ==========================
// * cocos2d::log 专用解析
// * ==========================
// */
//
//function parseCocosLog(args) {
//    let fmt;
//    try {
//        fmt = args[0].readCString();
//    } catch {
//        return;
//    }
//
//    console.log(`\n📝 cocos2d::log -> ${fmt}`);
//
//    const specs = fmt.match(/%[sdif]/g);
//    if (!specs) return;
//
//    let idx = 1;
//    specs.forEach((spec, i) => {
//        try {
//            const a = args[idx++];
//            if (spec === "%s") {
//                console.log(`   arg${i+1} (str) =`, a.readCString());
//            } else if (spec === "%f") {
//                console.log(`   arg${i+1} (float) =`, a.readFloat());
//            } else {
//                console.log(`   arg${i+1} (int) =`, a.toInt32());
//            }
//        } catch {
//            console.log(`   arg${i+1} <invalid>`);
//        }
//    });
//}
//
///**
// * ==========================
// * Hook 配置区（你只改这里）
// * ==========================
// */
//
//const MODULE = "libdiguogameshow.so";
//
//const HOOKS = [
//    {
//        name: "StringUtil",
//        symbol: "_ZN5Level13robotDrawCardEv",
//        onEnter(args) {
//            console.log("\n🤖 robotDrawCard");
//            console.log("   this   =", args[0]);
//            console.log("   reason =", args[1].toInt32());
//        },
//        onLeave(retval) {
//            console.log("   return =", retval.toInt32());
//        }
//    }
//];
//
////_ZN13ConfigManager4openERKNSt6__ndk112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEEb
//
///**
// * ==========================
// * 启动 hook
// * ==========================
// */
//
//HOOKS.forEach(h => {
//    hookSymbol(MODULE, h.symbol, {
//        onEnter: h.onEnter,
//        onLeave: h.onLeave
//    });
//});
const sym = "_ZNSt6__ndk124uniform_int_distributionIiEclINS_23mersenne_twister_engineIjLj32ELj624ELj397ELj31ELj2567483615ELj11ELj4294967295ELj7ELj2636928640ELj15ELj4022730752ELj18ELj1812433253EEEEEiRT_RKNS1_10param_typeE";

let addr = null;

// 常见在 libc++_shared.so
addr = Module.findExportByName("libc++_shared.so", sym);

// 如果没找到，就全模块扫一遍符号（有的模块会内置 libc++）
if (!addr) {
  Process.enumerateModules().forEach(m => {
    try {
      const a = Module.findExportByName(m.name, sym);
      if (a) { addr = a; console.log("found in", m.name, a); }
    } catch (e) {}
  });
}

console.log("operator() addr =", addr);


const opAddr = ptr(addr);

Interceptor.attach(opAddr, {
    onEnter(args) {
        // args[0] 一般是 this 指针（RNG / distribution 对象）
        this.thisPtr = args[0];
    },
    onLeave(retval) {
        // operator() 返回的是 int
        const r = retval.toInt32();

        console.log(
            `🎲 RNG operator() => ${r}, this=${this.thisPtr}`
        );
    }
});
