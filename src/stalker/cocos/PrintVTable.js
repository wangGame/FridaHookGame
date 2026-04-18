//const base = Module.findBaseAddress("libcocos2dcpp.so");
//const vtable = base.add(0x75FC00);
//
//for (let i = 0; i < 40; i++) {
//
//    const fn = vtable.add(i * Process.pointerSize).readPointer();
//
//    console.log(
//        i,
//        fn,
//        DebugSymbol.fromAddress(fn)
//    );
//}

//const mod = Process.findModuleByName("libcocos2dcpp.so");
//
//if (fn.compare(mod.base) >= 0 &&
//    fn.compare(mod.base.add(mod.size)) < 0) {
//
//    console.log(i, DebugSymbol.fromAddress(fn));
//}
//


Memory.scan(
    Process.findModuleByName("libcocos2dcpp.so").base,
    Process.findModuleByName("libcocos2dcpp.so").size,
    "00 FC 75 00",
    {
        onMatch(addr) {
            console.log("possible LevelBase:", addr);
        }
    }
);