console.log("[*] so load monitor started");

function hook_dlopen() {

    var dlopen = Module.findExportByName(null, "dlopen");
    var android_dlopen_ext = Module.findExportByName(null, "android_dlopen_ext");

    if (dlopen) {
        Interceptor.attach(dlopen, {
            onEnter: function (args) {
                this.path = args[0].readCString();
            },
            onLeave: function (retval) {
                if (this.path) {
                    console.log("[dlopen] =>", this.path);
                }
            }
        });
    }

    if (android_dlopen_ext) {
        Interceptor.attach(android_dlopen_ext, {
            onEnter: function (args) {
                this.path = args[0].readCString();
            },
            onLeave: function (retval) {
                if (this.path) {
                    console.log("[android_dlopen_ext] =>", this.path);
                }
            }
        });
    }
}

setImmediate(hook_dlopen);
