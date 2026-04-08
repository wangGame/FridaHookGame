//// 先拿 NativeBridgeItf
//var nb = Module.findBaseAddress("libhoudini.so");
//
//var dlsym = Module.findExportByName(null, "dlsym");
//
//Interceptor.attach(dlsym, {
//    onEnter: function (args) {
//        var name = Memory.readCString(args[1]);
//        if (name === "NativeBridgeItf") {
//            console.log("🔥 got NativeBridgeItf");
//        }
//    },
//    onLeave: function (retval) {
//        if (!retval.isNull()) {
//            var callbacks = retval;
//
//            // loadLibraryExt 在 struct 里的偏移（不同版本可能不同，一般第2~3个函数）
//            var loadLibraryExt = callbacks.add(Process.pointerSize * 2).readPointer();
//
//            console.log("🔥 hook loadLibraryExt:", loadLibraryExt);
//
//            Interceptor.attach(loadLibraryExt, {
//                onEnter: function (args) {
//                    var path = Memory.readCString(args[0]);
//                    console.log("🔥 NativeBridge load:", path);
//                },
//                onLeave: function (retval) {
//                    console.log("🔥 handle:", retval);
//                }
//            });
//        }
//    }
//});
//

//'use strict';
//
//const soName = "libil2cpp.so";
//const RETRY_INTERVAL_MS = 30;
//
//let hooked = false;
//
//function getExport(name) {
//    const p = Module.findExportByName(soName, name);
//    if (p === null) {
//        throw new Error("❌ export not found: " + name);
//    }
//    return p;
//}
//
//const il2cpp_domain_get = new NativeFunction(
//    getExport("il2cpp_domain_get"),
//    'pointer',
//    []
//);
//
//const il2cpp_domain_get_assemblies = new NativeFunction(
//    getExport("il2cpp_domain_get_assemblies"),
//    'pointer',
//    ['pointer', 'pointer']
//);
//
//const il2cpp_assembly_get_image = new NativeFunction(
//    getExport("il2cpp_assembly_get_image"),
//    'pointer',
//    ['pointer']
//);
//
//const il2cpp_image_get_name = new NativeFunction(
//    getExport("il2cpp_image_get_name"),
//    'pointer',
//    ['pointer']
//);
//
//const il2cpp_class_from_name = new NativeFunction(
//    getExport("il2cpp_class_from_name"),
//    'pointer',
//    ['pointer', 'pointer', 'pointer']
//);
//
//const il2cpp_class_get_method_from_name = new NativeFunction(
//    getExport("il2cpp_class_get_method_from_name"),
//    'pointer',
//    ['pointer', 'pointer', 'int']
//);
//
//function readCString(p) {
//    if (p.isNull()) return "";
//    try {
//        return p.readCString();
//    } catch (e) {
//        return "";
//    }
//}
//
//function findAssemblyImage(assemblyName) {
//    const domain = il2cpp_domain_get();
//    if (domain.isNull()) {
//        console.log("⏳ il2cpp domain not ready");
//        return ptr(0);
//    }
//
//    const sizePtr = Memory.alloc(Process.pointerSize);
//    sizePtr.writeUInt(0);
//
//    const assemblies = il2cpp_domain_get_assemblies(domain, sizePtr);
//    const count = sizePtr.readUInt();
//
//    console.log("📦 assembly count =", count);
//
//    for (let i = 0; i < count; i++) {
//        const assembly = assemblies.add(i * Process.pointerSize).readPointer();
//        if (assembly.isNull()) continue;
//
//        const image = il2cpp_assembly_get_image(assembly);
//        if (image.isNull()) continue;
//
//        const namePtr = il2cpp_image_get_name(image);
//        const name = readCString(namePtr);
//
//        if (name === assemblyName || name.indexOf(assemblyName) !== -1) {
//            console.log("✅ found assembly image:", name, image);
//            return image;
//        }
//    }
//
//    console.log("⏳ assembly image not found yet:", assemblyName);
//    return ptr(0);
//}
//
//function findIl2cppMethod(assemblyName, namespaceName, className, methodName, paramCount) {
//    const image = findAssemblyImage(assemblyName);
//    if (image.isNull()) {
//        return ptr(0);
//    }
//
//    const nsPtr = Memory.allocUtf8String(namespaceName);
//    const classPtr = Memory.allocUtf8String(className);
//
//    const klass = il2cpp_class_from_name(image, nsPtr, classPtr);
//    if (klass.isNull()) {
//        console.log(`⏳ class not found yet: ${namespaceName}.${className}`);
//        return ptr(0);
//    }
//
//    console.log("✅ class =", klass);
//
//    const methodNamePtr = Memory.allocUtf8String(methodName);
//    const method = il2cpp_class_get_method_from_name(klass, methodNamePtr, paramCount);
//    if (method.isNull()) {
//        console.log(`⏳ method not found yet: ${className}.${methodName}/${paramCount}`);
//        return ptr(0);
//    }
//
//    console.log("✅ MethodInfo =", method);
//
//    const methodPtr = method.readPointer();
//    if (methodPtr.isNull()) {
//        console.log(`⏳ method pointer is null: ${className}.${methodName}`);
//        return ptr(0);
//    }
//
//    return methodPtr;
//}
//
//function tryHook() {
//    if (hooked) {
//        return;
//    }
//
//    try {
//        const target = findIl2cppMethod(
//            "Assembly-CSharp",
//            "Config",
//            "ManhattanSortConfigCache",
//            "ContainsKey",
//            1
//        );
//
//        if (target.isNull()) {
//            console.log("🔄 target not ready, retry later...");
//            return;
//        }
//
//        console.log("🎯 ManhattanHardSortConfigCache.Load =", target);
//
//        Interceptor.attach(target, {
//            onEnter(args) {
//                console.log("\n📦 ManhattanHardSortConfigCache.Load ENTER");
//                console.log("   this =", args[0]);
//            },
//            onLeave(retval) {
//                console.log("📦 ManhattanHardSortConfigCache.Load LEAVE");
//            }
//        });
//
//        hooked = true;
//        console.log("✅ hook success");
//    } catch (e) {
//        console.log("🔄 hook failed, retry later:", e);
//    }
//}
//
//setInterval(tryHook, RETRY_INTERVAL_MS);
//tryHook();

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
////'use strict';
////
////const soName = "libil2cpp.so";
////
////function getExport(name) {
////    const p = Module.findExportByName(soName, name);
////    if (p === null) {
////        throw new Error("❌ export not found: " + name);
////    }
////    return p;
////}
////
////const il2cpp_domain_get = new NativeFunction(
////    getExport("il2cpp_domain_get"),
////    'pointer',
////    []
////);
////
////const il2cpp_domain_get_assemblies = new NativeFunction(
////    getExport("il2cpp_domain_get_assemblies"),
////    'pointer',
////    ['pointer', 'pointer']
////);
////
////const il2cpp_assembly_get_image = new NativeFunction(
////    getExport("il2cpp_assembly_get_image"),
////    'pointer',
////    ['pointer']
////);
////
////const il2cpp_image_get_name = new NativeFunction(
////    getExport("il2cpp_image_get_name"),
////    'pointer',
////    ['pointer']
////);
////
////const il2cpp_class_from_name = new NativeFunction(
////    getExport("il2cpp_class_from_name"),
////    'pointer',
////    ['pointer', 'pointer', 'pointer']
////);
////
////const il2cpp_class_get_method_from_name = new NativeFunction(
////    getExport("il2cpp_class_get_method_from_name"),
////    'pointer',
////    ['pointer', 'pointer', 'int']
////);
////
////function readCString(p) {
////    if (p.isNull()) return "";
////    try {
////        return p.readCString();
////    } catch (e) {
////        return "";
////    }
////}
////
////function findAssemblyImage(assemblyName) {
////    const domain = il2cpp_domain_get();
////    if (domain.isNull()) {
////        throw new Error("❌ il2cpp_domain_get returned null");
////    }
////
////    const sizePtr = Memory.alloc(Process.pointerSize);
////    sizePtr.writeUInt(0);
////
////    const assemblies = il2cpp_domain_get_assemblies(domain, sizePtr);
////    const count = sizePtr.readUInt();
////
////    console.log("📦 assembly count =", count);
////
////    for (let i = 0; i < count; i++) {
////        const assembly = assemblies.add(i * Process.pointerSize).readPointer();
////        if (assembly.isNull()) continue;
////
////        const image = il2cpp_assembly_get_image(assembly);
////        if (image.isNull()) continue;
////
////        const namePtr = il2cpp_image_get_name(image);
////        const name = readCString(namePtr);
////
////        if (name === assemblyName || name.indexOf(assemblyName) !== -1) {
////            console.log("✅ found assembly image:", name, image);
////            return image;
////        }
////    }
////
////    return ptr(0);
////}
////
////function findIl2cppMethod(assemblyName, namespaceName, className, methodName, paramCount) {
////    const image = findAssemblyImage(assemblyName);
////    if (image.isNull()) {
////        throw new Error("❌ assembly image not found: " + assemblyName);
////    }
////
////    const nsPtr = Memory.allocUtf8String(namespaceName);
////    const classPtr = Memory.allocUtf8String(className);
////
////    const klass = il2cpp_class_from_name(image, nsPtr, classPtr);
////    if (klass.isNull()) {
////        throw new Error(`❌ class not found: ${namespaceName}.${className}`);
////    }
////
////    console.log("✅ class =", klass);
////
////    const methodNamePtr = Memory.allocUtf8String(methodName);
////    const method = il2cpp_class_get_method_from_name(klass, methodNamePtr, paramCount);
////    if (method.isNull()) {
////        throw new Error(`❌ method not found: ${className}.${methodName}/${paramCount}`);
////    }
////
////    console.log("✅ MethodInfo =", method);
////
////    // 大多数 il2cpp 版本里，MethodInfo 第一个指针就是 methodPointer
////    const methodPtr = method.readPointer();
////
////    if (methodPtr.isNull()) {
////        throw new Error(`❌ method pointer is null: ${className}.${methodName}`);
////    }
////
////    return methodPtr;
////}
////
////const target = findIl2cppMethod(
////    "Assembly-CSharp",
////    "Config",
////    "ManhattanHardSortConfigCache",
////    "Load",
////    0
////);
////
////if (target.isNull()) {
////    throw new Error("❌ ManhattanHardSortConfigCache.Load not found");
////}
////
////console.log("🎯 ManhattanHardSortConfigCache.Load =", target);
////
////Interceptor.attach(target, {
////    onEnter(args) {
////        console.log("\n📦 ManhattanHardSortConfigCache.Load ENTER");
////        console.log("   this =", args[0]);
////    },
////    onLeave(retval) {
////        console.log("📦 ManhattanHardSortConfigCache.Load LEAVE");
////    }
////});
////'use strict';
////
////const base = Module.findBaseAddress("libil2cpp.so");
////const addr = base.add(0x0231AA8C);
////
////function readIl2CppString32(p) {
////    try {
////        if (!p || p.isNull()) return null;
////
////        const len = p.add(0x8).readS32();
////        if (len < 0 || len > 0x20000) return null;
////
////        return p.add(0xC).readUtf16String(len);
////    } catch (e) {
////        return null;
////    }
////}
////
////function sanitizeString(str) {
////    if (str == null) return str;
////    return str
////        .replace(/\r/g, "\\r")
////        .replace(/\n/g, "\\n")
////        .replace(/\t/g, "\\t")
////        .replace(/\0/g, "\\0");
////}
////
////function printLongString(tag, str, chunkSize) {
////    if (str === null || str === undefined) {
////        console.log(tag + " = <null>");
////        return;
////    }
////
////    const safe = sanitizeString(str);
////    chunkSize = chunkSize || 300;
////
////    console.log(tag + " charLength = " + str.length);
////    console.log(tag + " safeLength = " + safe.length);
////
////    for (let i = 0; i < safe.length; i += chunkSize) {
////        console.log(tag + "[" + i + "-" + Math.min(i + chunkSize, safe.length) + "] = " +
////            safe.slice(i, i + chunkSize));
////    }
////}
////
////Interceptor.attach(addr, {
////    onEnter(args) {
////        const msg = readIl2CppString32(args[0]);
////
////        console.log("\n=== Debug.Log hit ===");
////        console.log("arg0 =", args[0], "arg1 =", args[1], "arg2 =", args[2], "arg3 =", args[3]);
////
////        printLongString("msg", msg, 300);
////    }
////});
////
//
////
////
////'use strict';
////
////const soName = "libil2cpp.so";
////
////function getExport(name) {
////    const p = Module.findExportByName(soName, name);
////    if (p === null) {
////        throw new Error("❌ export not found: " + name);
////    }
////    return p;
////}
////
////const il2cpp_domain_get = new NativeFunction(getExport("il2cpp_domain_get"), 'pointer', []);
////const il2cpp_domain_get_assemblies = new NativeFunction(getExport("il2cpp_domain_get_assemblies"), 'pointer', ['pointer', 'pointer']);
////const il2cpp_assembly_get_image = new NativeFunction(getExport("il2cpp_assembly_get_image"), 'pointer', ['pointer']);
////const il2cpp_image_get_name = new NativeFunction(getExport("il2cpp_image_get_name"), 'pointer', ['pointer']);
////
////const il2cpp_image_get_class_count = new NativeFunction(
////    getExport("il2cpp_image_get_class_count"),
////    'uint',
////    ['pointer']
////);
////
////const il2cpp_image_get_class = new NativeFunction(
////    getExport("il2cpp_image_get_class"),
////    'pointer',
////    ['pointer', 'uint']
////);
////
////const il2cpp_class_get_name = new NativeFunction(
////    getExport("il2cpp_class_get_name"),
////    'pointer',
////    ['pointer']
////);
////
////const il2cpp_class_get_namespace = new NativeFunction(
////    getExport("il2cpp_class_get_namespace"),
////    'pointer',
////    ['pointer']
////);
////
////function readCString(p) {
////    if (!p || p.isNull()) return "";
////    try {
////        return p.readCString();
////    } catch (e) {
////        return "";
////    }
////}
////
////function findAssemblyImage(assemblyName) {
////    const domain = il2cpp_domain_get();
////    const sizePtr = Memory.alloc(Process.pointerSize);
////    sizePtr.writeUInt(0);
////
////    const assemblies = il2cpp_domain_get_assemblies(domain, sizePtr);
////    const count = sizePtr.readUInt();
////
////    console.log("📦 assembly count =", count);
////
////    for (let i = 0; i < count; i++) {
////        const assembly = assemblies.add(i * Process.pointerSize).readPointer();
////        if (assembly.isNull()) continue;
////
////        const image = il2cpp_assembly_get_image(assembly);
////        if (image.isNull()) continue;
////
////        const name = readCString(il2cpp_image_get_name(image));
////        if (name === assemblyName || name.indexOf(assemblyName) !== -1) {
////            console.log("✅ found assembly image:", name, image);
////            return image;
////        }
////    }
////
////    throw new Error("❌ assembly not found: " + assemblyName);
////}
////
////function searchClasses(image, keywords) {
////    const count = il2cpp_image_get_class_count(image);
////    console.log("📚 class count =", count);
////
////    const lowerKeywords = keywords.map(k => k.toLowerCase());
////
////    for (let i = 0; i < count; i++) {
////        const klass = il2cpp_image_get_class(image, i);
////        if (klass.isNull()) continue;
////
////        const name = readCString(il2cpp_class_get_name(klass));
////        const ns = readCString(il2cpp_class_get_namespace(klass));
////        const full = (ns ? ns + "." : "") + name;
////        const fullLower = full.toLowerCase();
////
////        let ok = false;
////        for (const kw of lowerKeywords) {
////            if (fullLower.indexOf(kw) !== -1) {
////                ok = true;
////                break;
////            }
////        }
////
////        if (ok) {
////            console.log("✅", full);
////        }
////    }
////}
////
////const image = findAssemblyImage("Assembly-CSharp");
////searchClasses(image, [
////    "manhattan",
////    "hardsort",
////    "config",
////    "cache"
////]);
//
////
////'use strict';
////
////const base = Module.findBaseAddress("libil2cpp.so");
////const addr = base.add(0x0231AA8C);
////
////function readIl2CppString32(p) {
////    try {
////        if (!p || p.isNull()) return null;
////
////        const len = p.add(0x8).readS32();
////        if (len < 0 || len > 0x1000) return null;
////
////        return p.add(0xC).readUtf16String(len);
////    } catch (e) {
////        return null;
////    }
////}
////
////Interceptor.attach(addr, {
////    onEnter(args) {
////        const msg = readIl2CppString32(args[0]);
////
////        console.log("\n=== Debug.Log hit ===");
////        console.log("arg0 =", args[0], "msg =", msg);
////        console.log("arg1 =", args[1]);
////        console.log("arg2 =", args[2]);
////        console.log("arg3 =", args[3]);
////    }
////});
//
//
//
////'use strict';
////
////const base = Module.findBaseAddress("libil2cpp.so");
////const addr = base.add(0x0231AA8C);
////function readIl2CppString32(p) {
////    try {
////        if (!p || p.isNull()) return null;
////
////        // 32位 Il2CppString:
////        // 0x0 klass
////        // 0x4 monitor
////        // 0x8 len
////        // 0xC chars (utf16)
////        const len = p.add(0x8).readS32();
////
////        if (len < 0 || len > 0x1000) return null;
////
////        return p.add(0xC).readUtf16String(len);
////    } catch (e) {
////        return null;
////    }
////}
////function readIl2CppString(p) {
////    try {
////        if (!p || p.isNull()) return null;
////        const len = p.add(0x10).readS32();
////        if (len < 0 || len > 0x1000) return null;
////        return p.add(0x14).readUtf16String(len);
////    } catch (e) {
////        return null;
////    }
////}
////
////function probe(p) {
////    const s = readIl2CppString(p);
////    if (s !== null) return '[str] ' + JSON.stringify(s);
////
////    try {
////        return '[u32] ' + p.toUInt32();
////    } catch (e) {}
////
////    return '[ptr] ' + p;
////}
////
////Interceptor.attach(addr, {
////    onEnter(args) {
////        console.log('\n=== Debug.Log candidate ===');
////        for (let i = 0; i < 6; i++) {
////            console.log('arg' + i + ' => ' + probe(args[i]));
////        }
////    }
////});
////'use strict';
////
////var modules = Process.enumerateModules();
////
////modules.forEach(function(m) {
////    if (m.name.indexOf("libil2cpp.so") !== -1) {
////        console.log("base => " + m.base);
////    }
////});
////
//////0x83248000
////'use strict';
////
////var base = Module.findBaseAddress("libil2cpp.so");
////
////// 替换成你的 RVA
////var addr = base.add(0x0231AA8C);
////
////Interceptor.attach(addr, {
////    onEnter: function (args) {
////
////        console.log("args0=" + args[0]);
////        console.log("args1=" + args[1]);
////        console.log("args2=" + args[2]);
////        console.log("args3=" + args[3]);
////
////        var msg = args[2];
////
////        console.log("[UnityLog] " + readIl2CppString(msg));
////    }
////});
////
////function readIl2CppString(ptr) {
////    try {
////        if (ptr.isNull()) return null;
////
////        var len = ptr.add(0x10).readInt();
////
////        if (len <= 0 || len > 0x1000) return null;
////
////        return ptr.add(0x14).readUtf16String(len);
////    } catch (e) {
////        return null;
////    }
////}
////
////// 🔥 自动找字符串参数
////function findStringArg(args) {
////    for (var i = 0; i < 4; i++) {
////        var str = readIl2CppString(args[i]);
////        if (str && str.length > 0) {
////            return str;
////        }
////    }
////    return null;
////}
////
////function dumpString(ptr) {
////    if (ptr.isNull()) return "null";
////
////    try {
////        // ✅ 方式1：按 Unity String 读（优先）
////        var len = ptr.add(0x10).readInt();
////
////        if (len > 0 && len < 0x1000) {
////            return ptr.add(0x14).readUtf16String(len);
////        }
////    } catch (e) {}
////
////    try {
////        // ✅ 方式2：强行当 UTF16 读一段
////        return ptr.readUtf16String(64);
////    } catch (e) {}
////
////    try {
////        // ✅ 方式3：当 UTF8 读
////        return ptr.readCString();
////    } catch (e) {}
////
////    // 最后兜底：打印地址
////    return "[0x" + ptr.toString(16) + "]";
////}
////
//////function tryReadIl2CppString(obj) {
//////    try {
//////        if (obj.isNull()) return "null";
//////
//////        // 读取 klass
//////        var klass = obj.readPointer();
//////
//////        if (klass.isNull()) return "[InvalidObject]";
//////
//////        // klass->name（偏移不固定，但 string 有特征）
//////        var namePtr = klass.add(0x10).readPointer();
//////
//////        if (!namePtr.isNull()) {
//////            var name = namePtr.readCString();
//////
//////            // 🔥 判断是不是 String
//////            if (name.indexOf("String") !== -1) {
//////                var len = obj.add(0x10).readInt();
//////                return obj.add(0x14).readUtf16String(len);
//////            }
//////        }
//////
//////        return "[NotStringObject]";
//////    } catch (e) {
//////        return "[ParseError]";
//////    }
//////}
//////// ✅ 读取 Unity String
//////function readIl2CppString(str) {
//////    try {
//////        if (str.isNull()) return "null";
//////
//////        var len = str.add(0x10).readInt();   // length
//////        var data = str.add(0x14);            // chars
//////
//////        return data.readUtf16String(len);
//////    } catch (e) {
//////        return "read failed";
//////    }
//////}
////
////
////function tryReadString(obj) {
////    try {
////        if (obj.isNull()) return "null";
////
////        var len = obj.add(0x10).readInt();
////
////        // 简单判断是不是 string
////        if (len > 0 && len < 0x1000) {
////            return obj.add(0x14).readUtf16String(len);
////        }
////
////        return "[NotString]";
////    } catch (e) {
////        return "[ParseError]";
////    }
////}
////console.log("hook Debug.Log done");
//////'use strict';
//////
//////function hookLogExport(name, argTypes, reader) {
//////    const p = Module.findExportByName(null, name);
//////    if (!p) {
//////        console.log('[!] missing export:', name);
//////        return;
//////    }
//////
//////    console.log('[+] hook', name, '@', p);
//////
//////    Interceptor.attach(p, {
//////        onEnter(args) {
//////            try {
//////                console.log(reader(args));
//////            } catch (e) {
//////                console.log('[!] ' + name + ' read failed:', e);
//////            }
//////        }
//////    });
//////}
//////
//////function cstr(p) {
//////    try {
//////        return (!p || p.isNull()) ? 'NULL' : Memory.readCString(p);
//////    } catch (e) {
//////        return '<bad-cstr>';
//////    }
//////}
//////
//////// int __android_log_write(int prio, const char* tag, const char* text)
//////hookLogExport('__android_log_write', ['int', 'pointer', 'pointer'], (args) => {
//////    const prio = args[0].toInt32();
//////    const tag = cstr(args[1]);
//////    const msg = cstr(args[2]);
//////    return `[log_write] prio=${prio} tag=${tag} msg=${msg}`;
//////});
//////
//////// int __android_log_buf_write(int bufID, int prio, const char* tag, const char* text)
//////hookLogExport('__android_log_buf_write', ['int', 'int', 'pointer', 'pointer'], (args) => {
//////    const bufId = args[0].toInt32();
//////    const prio = args[1].toInt32();
//////    const tag = cstr(args[2]);
//////    const msg = cstr(args[3]);
//////    return `[log_buf_write] buf=${bufId} prio=${prio} tag=${tag} msg=${msg}`;
//////});

'use strict';

const so = "libil2cpp.so";

// Unity 常见日志类
const TARGETS = [
    {
        assembly: "UnityEngine.CoreModule.dll",
        namespaceName: "UnityEngine",
        className: "DebugLogHandler",
        methodName: "Internal_Log",
        argc: 4
    },
    {
        assembly: "UnityEngine.CoreModule.dll",
        namespaceName: "UnityEngine",
        className: "DebugLogHandler",
        methodName: "Internal_LogException",
        argc: 2
    }
];

// ===== 基础工具 =====
function nf(name, ret, args, required = true) {
    const p = Module.findExportByName(so, name);
    if (!p) {
        if (required) throw new Error("missing export: " + name);
        console.log("[!] missing export:", name);
        return null;
    }
    return new NativeFunction(p, ret, args);
}

function ptrStr(p) {
    try {
        return p ? p.toString() : "NULL";
    } catch (e) {
        return "<?>"
    }
}

function safeReadCString(p) {
    try {
        if (!p || p.isNull()) return "";
        return Memory.readCString(p);
    } catch (e) {
        return "";
    }
}

function safeReadUtf16(p, len) {
    try {
        if (!p || p.isNull()) return "";
        return Memory.readUtf16String(p, len);
    } catch (e) {
        return "";
    }
}

// Il2CppString:
// 32位: [klass*][monitor*][length:int][chars...]
// 64位: [klass*][monitor*][length:int][chars...]
function readIl2CppString(strPtr) {
    if (!strPtr || strPtr.isNull()) return "NULL";

    try {
        const lenOff = Process.pointerSize * 2;
        const dataOff = lenOff + 4;

        const len = Memory.readS32(strPtr.add(lenOff));
        if (len < 0 || len > 100000) {
            return "<invalid il2cpp string len=" + len + " ptr=" + strPtr + ">";
        }

        const text = safeReadUtf16(strPtr.add(dataOff), len);
        return text;
    } catch (e) {
        return "<readIl2CppString failed @" + strPtr + " : " + e + ">";
    }
}

function readMaybeObjectString(objPtr) {
    if (!objPtr || objPtr.isNull()) return "NULL";

    // 有些参数本身就是 string 对象
    try {
        return readIl2CppString(objPtr);
    } catch (e) {
        return ptrStr(objPtr);
    }
}
////
//////// ===== IL2CPP 导出 =====
//////const mono_get_root_domain = nf("mono_get_root_domain", "pointer", []);
//////const il2cpp_thread_attach = nf("il2cpp_thread_attach", "pointer", ["pointer"]);
//////const il2cpp_domain_assembly_open = nf("il2cpp_domain_assembly_open", "pointer", ["pointer", "pointer"]);
//////const il2cpp_assembly_get_image = nf("il2cpp_assembly_get_image", "pointer", ["pointer"]);
//////const il2cpp_class_from_name = nf("il2cpp_class_from_name", "pointer", ["pointer", "pointer", "pointer"]);
//////const il2cpp_class_get_method_from_name = nf("il2cpp_class_get_method_from_name", "pointer", ["pointer", "pointer", "int"]);
//////const il2cpp_method_get_name = nf("il2cpp_method_get_name", "pointer", ["pointer"], false);
//////const il2cpp_method_get_param_count = nf("il2cpp_method_get_param_count", "uint32", ["pointer"], false);
//////
//////const method_get_pointer_ptr = Module.findExportByName(so, "il2cpp_method_get_pointer");
//////const il2cpp_method_get_pointer = method_get_pointer_ptr
//////    ? new NativeFunction(method_get_pointer_ptr, "pointer", ["pointer"])
//////    : null;
//////
//////// ===== IL2CPP 访问 =====
//////function attachThread() {
//////    const domain = mono_get_root_domain();
//////    if (domain.isNull()) throw new Error("mono_get_root_domain returned NULL");
//////    il2cpp_thread_attach(domain);
//////    return domain;
//////}
//////
//////function getImage(assemblyName) {
//////    const domain = attachThread();
//////
//////    const asm = il2cpp_domain_assembly_open(
//////        domain,
//////        Memory.allocUtf8String(assemblyName)
//////    );
//////    if (asm.isNull()) {
//////        throw new Error("open assembly failed: " + assemblyName);
//////    }
//////
//////    const image = il2cpp_assembly_get_image(asm);
//////    if (image.isNull()) {
//////        throw new Error("get image failed: " + assemblyName);
//////    }
//////
//////    return image;
//////}
//////
//////function getClass(assemblyName, namespaceName, className) {
//////    const image = getImage(assemblyName);
//////    const klass = il2cpp_class_from_name(
//////        image,
//////        Memory.allocUtf8String(namespaceName),
//////        Memory.allocUtf8String(className)
//////    );
//////    if (klass.isNull()) {
//////        throw new Error("class not found: " + namespaceName + "." + className);
//////    }
//////    return klass;
//////}
//////
//////function getMethodPointer(method) {
//////    if (il2cpp_method_get_pointer) {
//////        const p = il2cpp_method_get_pointer(method);
//////        if (p && !p.isNull()) return p;
//////    }
//////    return Memory.readPointer(method);
//////}
//////
//////function findMethod(assemblyName, namespaceName, className, methodName, argc) {
//////    const klass = getClass(assemblyName, namespaceName, className);
//////
//////    const method = il2cpp_class_get_method_from_name(
//////        klass,
//////        Memory.allocUtf8String(methodName),
//////        argc
//////    );
//////    if (method.isNull()) {
//////        throw new Error(
//////            "method not found: " +
//////            namespaceName + "." + className + "." + methodName +
//////            " argc=" + argc
//////        );
//////    }
//////
//////    const addr = getMethodPointer(method);
//////    if (!addr || addr.isNull()) {
//////        throw new Error("method pointer NULL: " + methodName);
//////    }
//////
//////    return {
//////        method,
//////        addr,
//////        assemblyName,
//////        namespaceName,
//////        className,
//////        methodName,
//////        argc
//////    };
//////}
//////
//////// ===== 日志类型辅助 =====
//////function logTypeToString(v) {
//////    switch (v) {
//////        case 0: return "Error";
//////        case 1: return "Assert";
//////        case 2: return "Warning";
//////        case 3: return "Log";
//////        case 4: return "Exception";
//////        default: return "Unknown(" + v + ")";
//////    }
//////}
//////
//////function logOptionToString(v) {
//////    switch (v) {
//////        case 0: return "None";
//////        case 1: return "NoStacktrace";
//////        default: return "Unknown(" + v + ")";
//////    }
//////}
//////
//////// ===== Hook =====
//////function hookInternalLog(entry) {
//////    console.log(
//////        "[+] hook",
//////        entry.namespaceName + "." + entry.className + "." + entry.methodName,
//////        "@",
//////        entry.addr
//////    );
//////
//////    Interceptor.attach(entry.addr, {
//////        onEnter(args) {
//////            // 实例方法 this
//////            const thisObj = args[0];
//////
//////            // Internal_Log(LogType logType, LogOption logOptions, string msg, Object context)
//////            const logType = args[1].toInt32();
//////            const logOption = args[2].toInt32();
//////            const msgPtr = args[3];
//////            const ctxObj = args[4];
//////
//////            const msg = readIl2CppString(msgPtr);
//////
//////            console.log("\n================ UNITY LOG ================");
//////            console.log("this       =", ptrStr(thisObj));
//////            console.log("logType    =", logTypeToString(logType), "(" + logType + ")");
//////            console.log("logOption  =", logOptionToString(logOption), "(" + logOption + ")");
//////            console.log("message    =", msg);
//////            console.log("context    =", ptrStr(ctxObj));
//////        }
//////    });
//////}
//////
//////function hookInternalLogException(entry) {
//////    console.log(
//////        "[+] hook",
//////        entry.namespaceName + "." + entry.className + "." + entry.methodName,
//////        "@",
//////        entry.addr
//////    );
//////
//////    Interceptor.attach(entry.addr, {
//////        onEnter(args) {
//////            // Internal_LogException(Exception ex, Object context)
//////            const thisObj = args[0];
//////            const exObj = args[1];
//////            const ctxObj = args[2];
//////
//////            console.log("\n============= UNITY EXCEPTION =============");
//////            console.log("this       =", ptrStr(thisObj));
//////            console.log("exception  =", ptrStr(exObj));
//////            console.log("context    =", ptrStr(ctxObj));
//////
//////            // 这里只先打印指针
//////            // 如果你后面想继续展开 Exception.message / stackTrace，
//////            // 我可以再给你补一版专门读 System.Exception 的脚本
//////        }
//////    });
//////}
//////
//////function hookOneTarget(t) {
//////    const entry = findMethod(
//////        t.assembly,
//////        t.namespaceName,
//////        t.className,
//////        t.methodName,
//////        t.argc
//////    );
//////
//////    if (il2cpp_method_get_name) {
//////        console.log("[+] real method =", safeReadCString(il2cpp_method_get_name(entry.method)));
//////    }
//////    if (il2cpp_method_get_param_count) {
//////        console.log("[+] real argc =", il2cpp_method_get_param_count(entry.method));
//////    }
//////
//////    if (t.methodName === "Internal_Log") {
//////        hookInternalLog(entry);
//////    } else if (t.methodName === "Internal_LogException") {
//////        hookInternalLogException(entry);
//////    }
//////}
//////
//////setImmediate(function () {
//////    try {
//////        const base = Module.findBaseAddress(so);
//////        console.log("[+] base =", base);
//////
//////        for (let i = 0; i < TARGETS.length; i++) {
//////            try {
//////                hookOneTarget(TARGETS[i]);
//////            } catch (e) {
//////                console.log("[!] target hook failed:", JSON.stringify(TARGETS[i]), "err=", e);
//////            }
//////        }
//////
//////        console.log("[+] unity log hooks ready");
//////    } catch (e) {
//////        console.log("[!] ERROR:", e);
//////    }
//////});