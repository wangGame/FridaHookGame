import frida
import sys

package_name = "com.oakever.jigsawcard"

js_code = """
function hookAll() {

    // =========================
    // 1. Hook android_dlopen_ext
    // =========================
    var ext = Module.findExportByName(null, "android_dlopen_ext");
    if (ext) {
        Interceptor.attach(ext, {
            onEnter: function (args) {
                this.path = Memory.readCString(args[0]);
                this.block = false;

                if (this.path.indexOf("libtcb.so") !== -1) {
                    console.log("🔥 intercept libtcb:", this.path);
                    this.block = true;
                }
            },
            onLeave: function (retval) {
                console.log("[android_dlopen_ext]", this.path);

                if (this.block) {
                    console.log("🔥 fake load libtcb");

                    // 返回一个“看起来合法”的句柄
                    retval.replace(ptr(0x1000));
                }
            }
        });
    }

    // =========================
    // 2. Hook dlsym（关键）
    // =========================
    var dlsym = Module.findExportByName(null, "dlsym");
    if (dlsym) {
        Interceptor.attach(dlsym, {
            onEnter: function (args) {
                this.handle = args[0];
                this.name = Memory.readCString(args[1]);

                // 只关心 libtcb 相关调用
                if (this.name.indexOf("tcb") !== -1 ||
                    this.name.indexOf("check") !== -1) {

                    console.log("🔥 dlsym request:", this.name);
                    this.fake = true;
                }
            },
            onLeave: function (retval) {
                if (this.fake) {
                    console.log("🔥 fake dlsym:", this.name);

                    // 返回一个假函数地址
                    retval.replace(ptr(0x12345678));
                }
            }
        });
    }

    // =========================
    // 3. Hook __system_property_get（防检测）
    // =========================
    var prop = Module.findExportByName(null, "__system_property_get");
    if (prop) {
        Interceptor.attach(prop, {
            onEnter: function (args) {
                this.key = Memory.readCString(args[0]);
                this.buf = args[1];

                if (this.key.indexOf("ro.dalvik.vm.native.bridge") !== -1) {
                    this.fake = true;
                }
            },
            onLeave: function (retval) {
                if (this.fake) {
                    console.log("🔥 hide native bridge");

                    Memory.writeUtf8String(this.buf, "");
                    retval.replace(0);
                }
            }
        });
    }
}

setImmediate(hookAll);

"""

def on_message(message, data):
    if message['type'] == 'send':
        print("[*]", message['payload'])
    else:
        print(message)

def main():
    device = frida.get_usb_device(timeout=5)

    print("[*] spawn:", package_name)
    pid = device.spawn([package_name])

    session = device.attach(pid)

    script = session.create_script(js_code)
    script.on("message", on_message)
    script.load()

    device.resume(pid)

    print("[*] running... Press Ctrl+C to exit")
    sys.stdin.read()

if __name__ == "__main__":
    main()