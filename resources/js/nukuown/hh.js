function hook_dlopen(){
    const android_dlopen_ext = Module.findExportByName(null, "android_dlopen_ext");
    if(android_dlopen_ext) {
        Interceptor.attach(android_dlopen_ext, {
            onEnter: function(args) {
                const pathptr = args[0];
                if(pathptr != null && pathptr != undefined) {
                    const path = ptr(pathptr).readCString();
                    if(path != null && path.indexOf("libmsaoaidsec.so") != -1){
                        console.log(`android_dlopen_ext >>> load ${path}`);
                        hook_call_constructors_libmsaoaidsec();
                    }
                }
            },onLeave: function() {

            }
        });
    }
}

function hook_call_constructors_libmsaoaidsec() {
    let linker = null;
    if (Process.pointerSize === 4) {
          linker = Process.findModuleByName("linker");
    } else {
           linker = Process.findModuleByName("linker64");
    }
    let call_constructors_addr, get_soname
    let symbols = linker.enumerateSymbols();
    for (let index = 0; index < symbols.length; index++) {
        let symbol = symbols[index];
        if (symbol.name === "__dl__ZN6soinfo17call_constructorsEv") {
            call_constructors_addr = symbol.address;
        } else if (symbol.name === "__dl__ZNK6soinfo10get_sonameEv") {
            get_soname = new NativeFunction(symbol.address, "pointer", ["pointer"]);
        }
    }
    var listener = Interceptor.attach(call_constructors_addr, {
        onEnter: function (args) {
        var module = Process.findModuleByName("libmsaoaidsec.so")
            if (module != null) {
                Interceptor.replace(module.base.add(0x1c544), new NativeCallback(function () {
                    console.log("0x1c544:替换成功")
                }, "void", []))
                Interceptor.replace(module.base.add(0x1b8d4), new NativeCallback(function () {
                    console.log("0x1b8d4:替换成功")
                }, "void", []))
                Interceptor.replace(module.base.add(0x26e5c), new NativeCallback(function () {
                    console.log("0x26e5c:替换成功")
                }, "void", []))
                listener.detach();
            }
        },
        onLeave: function(retvel) {

        }
    })
}