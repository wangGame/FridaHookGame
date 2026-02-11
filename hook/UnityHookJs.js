//
//Java.perform(function () {
//
//    var UnityPlayer = Java.use("com.unity3d.player.UnityPlayer");
//
//    UnityPlayer.loadNative
//        .overload('java.lang.String')
//        .implementation = function (lib) {
//
//            console.log("\n==== Unity loadNative HIT ====");
//            console.log("arg:", lib);
//
//            var ret = this.loadNative(lib);
//
//            console.log("loadNative return:", ret);
//
//            return ret;
//        };
//});



//Interceptor.attach(Module.findExportByName("libc.so", "open"), {
//    onEnter: function(args) {
//
//           var path = Memory.readUtf8String(args[0]);
//
//            if (path.indexOf(".so") !== -1) {
//                console.log("[SO OPEN]", path);
//            }
////
//
//            if (path.indexOf("libil2cpp.so") !== -1) {
//
//                console.log("\n========== IL2CPP OPEN ==========");
//                console.log("[PATH]", path);
//
//                console.log("------ Call Stack ------");
//
//                console.log(
//                    Thread.backtrace(this.context, Backtracer.FUZZY)
//                        .map(DebugSymbol.fromAddress)
//                        .join("\n")
//                );
//
//                console.log("===============================\n");
//            }
//
//    }
//});


//Interceptor.attach(Module.findExportByName("libc.so", "mmap"), {
//    onEnter: function(args) {
//        this.size = args[1].toInt32();
//    },
//    onLeave: function(ret) {
//        if (this.size > 0x100000) {
//            console.log("[MMAP] size:", this.size, " addr:", ret);
//        }
//    }
//});

//Interceptor.attach(Module.findExportByName("libc.so", "memcpy"), {
//    onEnter: function(args) {
//        this.dst = args[0];
//        this.size = args[2].toInt32();
//
//        if (this.size > 0x200000) {
//            console.log("[MEMCPY] size:", this.size);
//        }
//    }
//});


//Interceptor.attach(Module.findExportByName("libc.so", "memcpy"), {
//    onEnter: function(args) {
//
//        this.dst = args[0];
//        this.src = args[1];
//        this.size = args[2].toInt32();
//
//        if (this.size > 0x100000) {
//
//            console.log("\n[DECRYPT COPY]");
//            console.log("DST:", this.dst);
//            console.log("SRC:", this.src);
//            console.log("SIZE:", this.size);
//
//            console.log(
//                Thread.backtrace(this.context, Backtracer.FUZZY)
//                    .map(DebugSymbol.fromAddress)
//                    .join("\n")
//            );
//        }
//    }
//});

//var dumped = false;
//
//Interceptor.attach(Module.findExportByName("libc.so", "memcpy"), {
//    onEnter: function(args) {
//
//        var dst = args[0];
//        var size = args[2].toInt32();
//
//        if (size > 7000000 && !dumped) {
//
//            dumped = true;
//
//            console.log("[FOUND IL2CPP]");
//            console.log("BASE:", dst);
//            console.log("SIZE:", size);
//
//            setTimeout(function () {
//
//                try {
//
//                    var data = Memory.readByteArray(dst, size);
//
//                    var file = new File(
//                        "/data/data/com.oakever.jigsawcard/files/libil2cpp_dump.so",
//                        "wb"
//                    );
//
//                    file.write(data);
//                    file.flush();
//                    file.close();
//
//                    console.log("[DUMP OK]");
//
//                } catch (e) {
//                    console.log("[DUMP ERROR]", e);
//                }
//
//            }, 500);
//        }
//    }
//});
//
//var dumped = false;
//
//Interceptor.attach(Module.findExportByName("libc.so", "memcpy"), {
//    onEnter: function(args) {
//
//        var dst = args[0];
//        var size = args[2].toInt32();
//
//        if (size > 0x700000 && !dumped) {
//
//            dumped = true;
//
//            console.log("[FOUND IL2CPP] base:", dst, " size:", size);
//
//            setTimeout(function () {
//
//                var data = Memory.readByteArray(dst, size);
//
//                var f = new File("/sdcard/libil2cpp_dump.so", "wb");
//                f.write(data);
//                f.close();
//
//                console.log("[DUMP OK] /sdcard/libil2cpp_dump.so");
//
//            }, 1000);
//        }
//    }
//});


//Interceptor.attach(Module.findExportByName(null, "dlopen"), {
//    onEnter: function(args) {
//        var name = Memory.readUtf8String(args[0]);
//        if (name.indexOf("il2cpp") !== -1) {
//            console.log("\n[dlopen]", name);
//            console.log(
//                Thread.backtrace(this.context, Backtracer.ACCURATE)
//                    .map(DebugSymbol.fromAddress)
//                    .join("\n")
//            );
//        }
//    }
//});

//Interceptor.attach(Module.findExportByName("libc.so", "open"), {
//    onEnter: function(args) {
//
//           var path = Memory.readUtf8String(args[0]);
//
////            if (path.indexOf(".so") !== -1) {
////
////                console.log("[SO OPEN]", path);
////            }
////
//
//            if (path.indexOf("libil2cpp.so") !== -1) {
//
//                console.log("\n========== IL2CPP OPEN ==========");
//                console.log("[PATH]", path);
//
//                console.log("------ Call Stack ------");
//
//                console.log(
//                    Thread.backtrace(this.context, Backtracer.FUZZY)
//                        .map(DebugSymbol.fromAddress)
//                        .join("\n")
//                );
//
//                console.log("===============================\n");
//            }
//
//    }
//});


//Java.perform(function () {
//
//    var UnityPlayer = Java.use("com.unity3d.player.UnityPlayer");
//
//    console.log("===== UnityPlayer methods =====");
//
//    UnityPlayer.class.getDeclaredMethods().forEach(function (m) {
//        console.log(m.toString());
//    });
//
//});

'use strict';

var dumped = false;

// ==========================
// 等待 il2cpp 出现
// ==========================

function waitForIl2cpp(callback) {

    var count = 0;

    var timer = setInterval(function () {

        var m = Process.findModuleByName("libil2cpp.so");

        if (m) {

            clearInterval(timer);

            console.log("\n[✓] IL2CPP FOUND");
            console.log("BASE:", m.base);
            console.log("SIZE:", m.size);

            callback(m);

        } else {

            count++;

            if (count % 5 === 0) {
                console.log("[...] Waiting il2cpp load");
            }

        }

    }, 300);
}

// ==========================
// dump 实现（安全分块）
// ==========================

function dumpModule(m) {

    if (dumped) return;

    dumped = true;

    try {

        var path =
            "/sdcard/" +
            m.name + "_" +
            m.base + "_" +
            m.size + ".so";

        console.log("[*] Dumping to:", path);

        var file = new File(path, "wb");

        var step = 1024 * 1024; // 1MB

        for (var i = 0; i < m.size; i += step) {

            var len = Math.min(step, m.size - i);

            var buf = ptr(m.base).add(i).readByteArray(len);

            file.write(buf);
        }

        file.flush();
        file.close();

        console.log("\n[✓] DUMP SUCCESS");
        console.log("[✓] File:", path);

    } catch (e) {

        console.log("\n[×] DUMP FAILED");
        console.log(e);
    }
}

// ==========================
// hook dlopen
// ==========================

function hookDlopen() {

    var dlopen = Module.findExportByName(null, "dlopen");

    if (!dlopen) {
        console.log("[!] dlopen not found");
        return;
    }

    Interceptor.attach(dlopen, {

        onEnter: function (args) {

            this.path = args[0].readCString();

        },

        onLeave: function () {

            if (this.path &&
                this.path.indexOf("libil2cpp.so") !== -1) {

                console.log("\n[+] dlopen il2cpp detected");

                waitForIl2cpp(dumpModule);
            }
        }
    });

    console.log("[✓] dlopen hooked");
}

// ==========================
// hook android_dlopen_ext
// ==========================

function hookAndroidDlopenExt() {

    var func = Module.findExportByName(null, "android_dlopen_ext");

    if (!func) {
        console.log("[!] android_dlopen_ext not found");
        return;
    }

    Interceptor.attach(func, {

        onEnter: function (args) {

            this.path = args[0].readCString();

        },

        onLeave: function () {

            if (this.path &&
                this.path.indexOf("libil2cpp.so") !== -1) {

                console.log("\n[+] android_dlopen_ext il2cpp detected");

                waitForIl2cpp(dumpModule);
            }
        }
    });

    console.log("[✓] android_dlopen_ext hooked");
}

// ==========================
// 主入口
// ==========================

setImmediate(function () {

    console.log("\n====== Unity IL2CPP Dumper ======");

    hookDlopen();
    hookAndroidDlopenExt();

    // 兜底：已经加载过
    var m = Process.findModuleByName("libil2cpp.so");

    if (m) {

        console.log("\n[!] IL2CPP already loaded");

        console.log("BASE:", m.base);
        console.log("SIZE:", m.size);

        dumpModule(m);
    }

},1399);

