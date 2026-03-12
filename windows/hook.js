//function logModule(namePart) {
//  const mods = Process.enumerateModules();
//  const hit = mods.find(m => m.name.toLowerCase().includes(namePart.toLowerCase()));
//  if (!hit) {
//    console.log(`[MISS] module contains "${namePart}" not found`);
//    return null;
//  }
//  console.log(`[MOD] ${hit.name} base=${hit.base} size=${hit.size} path=${hit.path}`);
//  return hit;
//}
//
//function hookCreateFileW() {
//  const p = Module.findExportByName("Kernel32.dll", "CreateFileW");
//  if (!p) { console.log("[MISS] CreateFileW"); return; }
//
//  Interceptor.attach(p, {
//    onEnter(args) {
//      try {
//        const path = Memory.readUtf16String(args[0]);
//        if (!path) return;
//
//        const s = path.toLowerCase();
//
//        if (s.includes(".jar") ||
//            s.includes(".class") ||
//            s.includes("\\lib\\") ||
//            s.includes("\\jre\\") ||
//            s.includes("\\java\\")) {
//
//          console.log(`[CreateFileW] ${path}`);
//        }
//      } catch (e) {}
//    }
//  });
//
//  console.log("[OK] hooked CreateFileW");
//}
//
//function hookRegisterNatives() {
//
//  const p = Module.findExportByName("jvm.dll", "JNI_RegisterNatives")
//         || Module.findExportByName("jvm.dll", "RegisterNatives");
//
//  if (!p) {
//    console.log("[MISS] JNI_RegisterNatives / RegisterNatives not found in jvm.dll");
//    return;
//  }
//
//  Interceptor.attach(p, {
//    onEnter(args) {
//
//      const methods = args[2];
//      const nMethods = args[3].toInt32();
//
//      console.log(`\n[RegisterNatives] nMethods=${nMethods} methodsPtr=${methods}`);
//    }
//  });
//
//  console.log("[OK] hooked RegisterNatives");
//}
//
//console.log("== Frida attach to javaw.exe ==");
//
//logModule("jvm.dll");
//logModule("kernel32.dll");
//
//hookCreateFileW();
//hookRegisterNatives();




console.log("=== JVM class hook start ===");

function hookDefineClass() {

    const addr = Module.findExportByName("jvm.dll", "JVM_DefineClass");

    if (!addr) {
        console.log("❌ JVM_DefineClass not found");
        return;
    }

    console.log("✅ JVM_DefineClass @", addr);

    Interceptor.attach(addr, {

        onEnter(args) {

            try {

                const name = Memory.readCString(args[1]);

                const data = args[2];
                const len  = args[3].toInt32();

                console.log("\n📦 Class loaded:", name);
                console.log("   bytecode size:", len);

                // dump class 文件
                if (len > 0 && len < 5 * 1024 * 1024) {

                    const bytes = Memory.readByteArray(data, len);

                    send({
                        type: "class",
                        name: name,
                        size: len
                    }, bytes);
                }

            } catch (e) {}
        }
    });
}

hookDefineClass();