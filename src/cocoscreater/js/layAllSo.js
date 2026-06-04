'use strict';

console.log("========== dlopen Trace Start ==========");

function hookDlopen(name) {
    const addr = Module.findExportByName(null, name);
    if (!addr) {
        console.log("[-] Not found: " + name);
        return;
    }

    console.log("[+] Hook " + name + " at " + addr);

    Interceptor.attach(addr, {
        onEnter(args) {
            this.path = null;

            try {
                if (!args[0].isNull()) {
                    this.path = args[0].readCString();
                }
            } catch (e) {}

            if (this.path && this.path.indexOf(".so") >= 0) {
                console.log("\n[dlopen] " + this.path);
            }
        },

        onLeave(retval) {
            if (this.path && this.path.indexOf(".so") >= 0) {
                console.log("[dlopen_ret] " + this.path + " => " + retval);

                try {
                    const m = Process.findModuleByName(this.path.split("/").pop());
                    if (m) {
                        console.log(
                            "[module] name=" + m.name +
                            " base=" + m.base +
                            " size=0x" + m.size.toString(16) +
                            " path=" + m.path
                        );
                    }
                } catch (e) {}
            }
        }
    });
}

hookDlopen("dlopen");
hookDlopen("android_dlopen_ext");

console.log("========== Current Loaded SO ==========");

Process.enumerateModules()
    .filter(m => m.path.indexOf(".so") >= 0)
    .forEach(m => {
        console.log("[SO] " + m.name + " => " + m.path);
    });