//打印出size

//const modName = "libcocos2djs.so";
//const m = Process.findModuleByName(modName);
//console.log("[+] module:", m.name, "base=", m.base, "size=", m.size);



//const modName = "libcocos2djs.so";
//[
//  "*eval*",
//  "*ScriptEngine*eval*",
//  "*ScriptingCore*eval*",
//  "*runScript*",
//].forEach(pat => {
//  const hits = DebugSymbol.findFunctionsMatching(`${modName}!${pat}`);
//  console.log("\n[match]", pat, "count =", hits.length);
//  hits.slice(0, 50).forEach(a => {
//    console.log(" ", a, DebugSymbol.fromAddress(a).name);
//  });
//});
//
//function hookOpenRead() {
//  const openPtr = Module.findExportByName(null, "open");
//  const openatPtr = Module.findExportByName(null, "openat");
//
//  if (openPtr) {
//    Interceptor.attach(openPtr, {
//      onEnter(args) {
//        this.path = args[0].readCString();
//      },
//      onLeave(ret) {
//        if (this.path && (this.path.endsWith(".js") || this.path.includes(".js"))) {
//          console.log("[open]", this.path);
//        }
//      }
//    });
//  }
//
//  if (openatPtr) {
//    Interceptor.attach(openatPtr, {
//      onEnter(args) {
//        try {
//            this.path = args[1].readCString();
//            console.log(path)
//        } catch(e) {}
//      },
//      onLeave(ret) {
//        if (this.path && (this.path.endsWith(".js") || this.path.includes(".js"))) {
//          console.log("[openat]", this.path);
//        }
//      }
//    });
//  }
//}
//
//hookOpenRead();

// Hook Android AssetManager (reads files inside APK assets/)
//(function () {
//  const libandroid = "libandroid.so";
//
//  const pOpen = Module.findExportByName(libandroid, "AAssetManager_open");
//  const pOpenFd = Module.findExportByName(libandroid, "AAsset_openFileDescriptor");
//  const pRead = Module.findExportByName(libandroid, "AAsset_read");
//
//  if (!pOpen) {
//    console.log("[-] AAssetManager_open not found (unexpected on Android)");
//    return;
//  }
//
//  console.log("[+] AAssetManager_open =", pOpen);
//  if (pOpenFd) console.log("[+] AAsset_openFileDescriptor =", pOpenFd);
//  if (pRead) console.log("[+] AAsset_read =", pRead);
//
//  // 记录 asset 指针 -> 资源名
//  const assetNameMap = new Map();
//
//  Interceptor.attach(pOpen, {
//    onEnter(args) {
//      this.name = args[1].readCString(); // asset filename inside APK assets/
//      this.mode = args[2].toInt32();
//    },
//    onLeave(retval) {
//      const assetPtr = retval;
//      if (assetPtr.isNull()) return;
//
//      assetNameMap.set(assetPtr.toString(), this.name);
//
//      // 只打印你关心的
//      const n = (this.name || "").toLowerCase();
//      if (
//        n.endsWith(".js") || n.endsWith(".jsc") || n.endsWith(".json") ||
//        n.endsWith(".bin") || n.includes("src/") || n.includes("main") ||
//        n.includes("bundle") || n.includes("script")
//      ) {
//        console.log(`[AAsset open] ${this.name} (mode=${this.mode}) => ${assetPtr}`);
//      }
//    }
//  });
//
//  if (pOpenFd) {
//    Interceptor.attach(pOpenFd, {
//      onEnter(args) {
//        this.assetPtr = args[0];
//      },
//      onLeave(retval) {
//        const key = this.assetPtr.toString();
//        const name = assetNameMap.get(key);
//        if (name) console.log(`[AAsset fd] ${name} => fd=${retval.toInt32()}`);
//      }
//    });
//  }
//
//  if (pRead) {
//    Interceptor.attach(pRead, {
//      onEnter(args) {
//        this.assetPtr = args[0];
//        this.buf = args[1];
//        this.count = args[2].toInt32();
//        this.name = assetNameMap.get(this.assetPtr.toString());
//      },
//      onLeave(retval) {
//        const nread = retval.toInt32();
//        if (nread <= 0) return;
//
//        // 只对疑似脚本的资源做一点“预览”，避免刷屏
//        if (!this.name) return;
//        const lower = this.name.toLowerCase();
//        if (!(lower.endsWith(".js") || lower.endsWith(".jsc") || lower.endsWith(".bin"))) return;
//
//        try {
//          // 预览前 120 字节（可能是文本，也可能是字节码）
//          const bytes = this.buf.readByteArray(Math.min(120, nread));
//          console.log(`[AAsset read] ${this.name} n=${nread} preview=${hexdump(bytes, { length: 64 })}`);
//        } catch (e) {}
//      }
//    });
//  }
//})();


//Process.enumerateRanges({
//    protection: 'r--',
//    coalesce: true
//}).forEach(function(range) {
//
//    try {
//        Memory.scan(range.base, range.size, "66 75 6e 63 74 69 6f 6e", {
//            onMatch: function(address, size) {
//                var str = Memory.readUtf8String(address);
//                if (str && str.length > 100) {
//                    console.log("Possible JS:");
//                    console.log(str.substring(0,300));
//                }
//            }
//        });
//    } catch(e){}
//});


Process.enumerateRanges({
    protection: 'r--',
    coalesce: true
}).forEach(function(range) {

    Memory.scan(range.base, range.size, "63 63 2e 5f 52 46", { // cc._RF
        onMatch: function(address, size) {

            var str = Memory.readUtf8String(address);

            if (str && str.length > 1000) {
                console.log("===== REAL GAME JS =====");
                console.log(str.substring(0,1000));
            }
        }
    });

});