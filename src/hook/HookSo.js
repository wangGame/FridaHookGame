console.log("===== GP6Service Loaded Modules =====");

// ① 当前已加载
Process.enumerateModules().forEach(function (m) {

    if (m.path.indexOf("/data/") !== -1) {
        console.log(
            "BASE:", m.base,
            "NAME:", m.name,
            "PATH:", m.path
        );
    }
});

console.log("===== Monitor New SO Load =====");

// ② 监听后续加载

function hook_dlopen() {

    var f1 = Module.findExportByName(null, "android_dlopen_ext");
    var f2 = Module.findExportByName(null, "dlopen");

    function attach_func(func, tag) {
        if (!func) return;

        Interceptor.attach(func, {
            onEnter: function (args) {
                this.path = args[0].readCString();
            },
            onLeave: function () {
                if (this.path) {

                    // 只关心 app 自己的库
                    if (this.path.indexOf("/data/") !== -1) {
                        console.log("NEW[" + tag + "] =>", this.path);
                    }
                }
            }
        });
    }

    attach_func(f1, "android");
    attach_func(f2, "dlopen");
}

setImmediate(hook_dlopen);
