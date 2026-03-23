'use strict';

function log(msg) {
    console.log("[*] " + msg);
}

/**
 * ============================
 * 1. dump 内存 so（memcpy）
 * ============================
 */
function hook_memcpy_dump() {
    const memcpy = Module.findExportByName(null, "memcpy");
    if (!memcpy) return;

    Interceptor.attach(memcpy, {
        onEnter(args) {
            this.src = args[1];
            this.len = args[2].toInt32();
        },
        onLeave(retval) {
            // 过滤太小的（避免噪音）
            if (this.len > 0x10000) {
                try {
                    let buf = Memory.readByteArray(this.src, this.len);
                    let path = "/sdcard/dump_" + this.len + ".so";
                    let file = new File(path, "wb");
                    file.write(buf);
                    file.flush();
                    file.close();

                    log("dump so -> " + path + " size=" + this.len);
                } catch (e) {}
            }
        }
    });

    log("hook memcpy done");
}

/**
 * ============================
 * 2. Hook NativeBridge
 * ============================
 */
function hook_nativebridge() {
    const nb = Module.findBaseAddress("libhoudini.so");
    if (!nb) {
        log("libhoudini.so not loaded yet...");
        return;
    }

    log("libhoudini.so @ " + nb);

    const sym = Module.findExportByName("libhoudini.so", "NativeBridgeItf");
    if (!sym) {
        log("NativeBridgeItf not found");
        return;
    }

    const callbacks = sym;

    // struct 偏移（不同版本可能不同，常见如下）
    const loadLibraryExt_ptr = callbacks.add(Process.pointerSize * 7).readPointer();
    const getTrampoline_ptr = callbacks.add(Process.pointerSize * 5).readPointer();

    log("loadLibraryExt @ " + loadLibraryExt_ptr);
    log("getTrampoline @ " + getTrampoline_ptr);

    /**
     * hook loadLibraryExt
     */
    Interceptor.attach(loadLibraryExt_ptr, {
        onEnter(args) {
            this.path = args[0].readCString();
            log("loadLibraryExt path: " + this.path);
        },
        onLeave(retval) {
            log("handle => " + retval);
        }
    });

    /**
     * hook getTrampoline
     */
    Interceptor.attach(getTrampoline_ptr, {
        onEnter(args) {
            this.symbol = args[1].readCString();
            log("getTrampoline symbol: " + this.symbol);
        },
        onLeave(retval) {
            if (retval.isNull()) return;

            log("trampoline => " + retval);

            // 如果是 JNI_OnLoad，进一步 hook
            try {
                let name = this.symbol;
                if (name.indexOf("JNI_OnLoad") !== -1) {
                    hook_jni_onload(retval);
                }
            } catch (e) {}
        }
    });

    log("hook NativeBridge done");
}

/**
 * ============================
 * 3. Hook JNI_OnLoad
 * ============================
 */
function hook_jni_onload(addr) {
    log("Hook JNI_OnLoad @ " + addr);

    Interceptor.attach(addr, {
        onEnter(args) {
            log(">>> JNI_OnLoad called");
            log("JavaVM: " + args[0]);
            log("reserved: " + args[1]);
        },
        onLeave(retval) {
            log("<<< JNI_OnLoad return: " + retval);
        }
    });
}

/**
 * ============================
 * 4. 监听 libhoudini 加载
 * ============================
 */
function hook_dlopen() {
    const dlopen = Module.findExportByName(null, "android_dlopen_ext")
        || Module.findExportByName(null, "dlopen");

    Interceptor.attach(dlopen, {
        onEnter(args) {
            this.path = args[0].readCString();
        },
        onLeave(retval) {
            if (!this.path) return;

            if (this.path.indexOf("libhoudini.so") !== -1) {
                log("libhoudini loaded!");
                setTimeout(hook_nativebridge, 100);
            }
        }
    });
}

/**
 * ============================
 * 主入口
 * ============================
 */
function main() {
    log("Frida script start");

    hook_memcpy_dump();
    hook_dlopen();

    // 如果已经加载了
    setTimeout(hook_nativebridge, 1000);
}

setImmediate(main);