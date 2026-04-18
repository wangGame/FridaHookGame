//function hook_open() {
//
//    var openPtr = Module.findExportByName(null, "open");
//
//    Interceptor.attach(openPtr, {
//        onEnter: function (args) {
//
//            var path = Memory.readCString(args[0]);
//
//            if (path.indexOf("metadata") != -1) {
//
//                console.log("\n====== open metadata ======");
//                console.log("path:", path);
//
//                console.log(
//                    Thread.backtrace(this.context, Backtracer.FUZZY)
//                    .map(DebugSymbol.fromAddress)
//                    .join("\n")
//                );
//            }
//        }
//    });
//}
//
//setImmediate(hook_open);


function hook_mmap(name) {

    var addr = Module.findExportByName(null, name);
    if (!addr) return;

    console.log("[+] Hook", name, addr);

    Interceptor.attach(addr, {

        onEnter: function (args) {

            this.size = args[1].toInt32();
            this.prot = args[2].toInt32();
            this.flags = args[3].toInt32();

            this.fd = args[4].toInt32();
            this.offset = args[5];
        },

        onLeave: function (retval) {

            if (retval.isNull()) return;

            console.log("\n====== " + name + " ======");
            console.log("base :", retval);
            console.log("size :", this.size);
            console.log("prot :", this.prot);
            console.log("flags:", this.flags);

            // 判断是否可执行
            if ((this.prot & 4) != 0) {
                console.log(">>> EXECUTABLE MEMORY <<<");
            }

            // 找到属于哪个模块
            var module = Process.findModuleByAddress(retval);

            if (module) {

                var rva = ptr(retval).sub(module.base);

                console.log("module :", module.name);
                console.log("module base :", module.base);
                console.log("IDA RVA :", rva);

            } else {

                console.log("module : <anonymous mmap>");
            }

            // 打印调用栈
            console.log(
                Thread.backtrace(this.context, Backtracer.ACCURATE)
                .map(function (addr) {

                    var m = Process.findModuleByAddress(addr);

                    if (m) {
                        var rva = ptr(addr).sub(m.base);
                        return addr + " " + m.name + "!" + rva;
                    }

                    return addr;

                }).join("\n")
            );

        }
    });
}

setImmediate(function(){

    hook_mmap("mmap");
    hook_mmap("mmap64");
    hook_mmap("mmap2");

});