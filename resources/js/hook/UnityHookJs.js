//function waitForIl2cpp() {
//
//    var base = Module.findBaseAddress("libil2cpp.so");
//
//    if (base) {
//        console.log("IL2CPP BASE FOUND:", base);
//        return;
//    }
//
//    setTimeout(waitForIl2cpp, 100);
//}

//waitForIl2cpp();


//var base = Module.findBaseAddress("libil2cpp.so");
//console.log("BASE:", base);



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



//
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

var dumped = false;

Interceptor.attach(Module.findExportByName("libc.so", "memcpy"), {
    onEnter: function(args) {

        var dst = args[0];
        var size = args[2].toInt32();

        if (size > 7000000 && !dumped) {

            dumped = true;

            console.log("[FOUND IL2CPP]");
            console.log("BASE:", dst);
            console.log("SIZE:", size);

            setTimeout(function () {

                try {

                    var data = Memory.readByteArray(dst, size);

                    var file = new File(
                        "/data/data/com.oakever.jigsawcard/files/libil2cpp_dump.so",
                        "wb"
                    );

                    file.write(data);
                    file.flush();
                    file.close();

                    console.log("[DUMP OK]");

                } catch (e) {
                    console.log("[DUMP ERROR]", e);
                }

            }, 500);
        }
    }
});
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