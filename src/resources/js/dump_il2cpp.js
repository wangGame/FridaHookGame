//'use strict';
//
//const CHUNK_SIZE = 0x10000;
//
//function dumpSoToPython(name) {
//    const m = Process.findModuleByName(name);
//    if (!m) {
//        send({ type: "error", msg: "module not found", name });
//        return;
//    }
//
//    send({
//        type: "info",
//        name: name,
//        base: m.base.toString(),
//        size: m.size
//    });
//
//    let offset = 0;
//
//    while (offset < m.size) {
//        const size = Math.min(CHUNK_SIZE, m.size - offset);
//        const addr = m.base.add(offset);
//
//        let data = null;
//
//        try {
//            data = Memory.readByteArray(addr, size);
//        } catch (e) {
//            // ⚠️ 不退出，只跳过
//            send({
//                type: "warn",
//                msg: "skip unreadable page",
//                offset: offset,
//                addr: addr.toString()
//            });
//
//            // 用空数据补齐，保证文件 size 对齐
//            data = new Uint8Array(size);
//        }
//
//        send({
//            type: "chunk",
//            offset: offset,
//            size: size
//        }, data);
//
//        offset += size;
//    }
//
//    send({
//        type: "done",
//        total: m.size
//    });
//}
//
//setImmediate(function () {
//    dumpSoToPython("libil2cpp.so");
//});

//
//
//'use strict';
//
//const il2cpp = Process.findModuleByName("libil2cpp.so");
//
//if (!il2cpp) {
//    console.log("❌ libil2cpp.so not found");
//} else {
//
//    console.log("✅ libil2cpp.so @", il2cpp.base, "size =", il2cpp.size);
//
//    // ================================
//    // 枚举可执行内存段
//    // ================================
//    const execRanges = Process.enumerateRangesSync({
//        protection: 'r-x',
//        coalesce: true
//    }).filter(r =>
//        r.base.compare(il2cpp.base) >= 0 &&
//        r.base.compare(il2cpp.base.add(il2cpp.size)) < 0
//    );
//
//    console.log("📌 exec ranges:", execRanges.length);
//
//    // ================================
//    // 尝试 hook 每一页
//    // ================================
//    execRanges.forEach(r => {
//        const pageCount = r.size / 0x1000;
//
//        for (let i = 0; i < pageCount; i++) {
//            const addr = r.base.add(i * 0x1000);
//
//            try {
//                Interceptor.attach(addr, {
//                    onEnter(args) {
//                        try {
//                            const logType = args[0].toInt32();
//                            const obj = args[1];
//
//                            if (logType < 0 || logType > 5) return;
//                            if (obj.isNull()) return;
//
//                            const strPtr = obj
//                                .add(Process.pointerSize * 2)
//                                .readPointer();
//
//                            if (strPtr.isNull()) return;
//
//                            const msg = strPtr.readCString();
//                            if (!msg || msg.length < 2) return;
//
//                            console.log(`🎯 [Unity Debug.Log][${logType}] ${msg}`);
//                        } catch (e) {
//                            // 吞异常，避免崩
//                        }
//                    }
//                });
//
//                console.log("HOOK OK @", addr);
//            } catch (e) {
//                // 某些地址不可 hook，忽略
//            }
//        }
//    });
//}



// 'use strict';
//
//console.log("🚀 il2cpp Runtime.Invoke hook starting...");
//
//const il2cpp = Process.findModuleByName("libil2cpp.so");
//
//if (!il2cpp) {
//    console.log("❌ libil2cpp.so not found");
//} else {
//
//    console.log("✅ libil2cpp.so @", il2cpp.base, "size =", il2cpp.size);
//
//    const invoke = Module.findExportByName(
//        "libil2cpp.so",
//        "il2cpp_runtime_invoke"
//    );
//
//    if (!invoke) {
//        console.log("❌ il2cpp_runtime_invoke not found");
//    } else {
//
//        console.log("✅ il2cpp_runtime_invoke @", invoke);
//
//        Interceptor.attach(invoke, {
//            onEnter(args) {
//                try {
//                    const method = args[0]; // MethodInfo*
//                    const obj = args[1];    // this
//                    const params = args[2];
//
//                    if (obj.isNull()) return;
//
//                    const retAddr = this.context.lr || this.returnAddress;
//
//                    console.log(
//                        "🎯 Invoke",
//                        "method =", method,
//                        "this =", obj,
//                        "ret =", retAddr
//                    );
//
//                } catch (e) {
//                    // 吃异常，保证不崩
//                }
//            }
//        });
//    }
//}


//'use strict';
//
//(function () {
//
//    console.log("🚀 il2cpp Invoke resolver starting...");
//
//    const il2cpp = Process.findModuleByName("libil2cpp.so");
//    if (!il2cpp) {
//        console.log("❌ libil2cpp.so not found");
//        throw new Error("abort");
//    }
//
//    console.log("✅ libil2cpp.so @", il2cpp.base, "size =", il2cpp.size);
//
//    function mustExport(name) {
//        const p = Module.findExportByName("libil2cpp.so", name);
//        if (!p) {
//            console.log("❌ missing export:", name);
//            throw new Error("abort");
//        }
//        return p;
//    }
//
//    const f_getMethodName = new NativeFunction(
//        mustExport("il2cpp_method_get_name"),
//        'pointer',
//        ['pointer']
//    );
//
//    const f_getMethodClass = new NativeFunction(
//        mustExport("il2cpp_method_get_class"),
//        'pointer',
//        ['pointer']
//    );
//
//    const f_getClassName = new NativeFunction(
//        mustExport("il2cpp_class_get_name"),
//        'pointer',
//        ['pointer']
//    );
//
//    const f_getClassNamespace = new NativeFunction(
//        mustExport("il2cpp_class_get_namespace"),
//        'pointer',
//        ['pointer']
//    );
//
//    const invoke = Module.findExportByName("libil2cpp.so", "il2cpp_runtime_invoke");
//    if (!invoke) {
//        console.log("❌ il2cpp_runtime_invoke not found");
//        throw new Error("abort");
//    }
//
//    console.log("✅ hook il2cpp_runtime_invoke @", invoke);
//
//    const seen = {};
//
//    Interceptor.attach(invoke, {
//        onEnter(args) {
//            try {
//                const method = args[0];
//                const obj = args[1];
//                if (obj.isNull()) return;
//
//                const key = method.toString();
//                if (seen[key]) return;
//                seen[key] = true;
//
//                const namePtr = f_getMethodName(method);
//                const klass = f_getMethodClass(method);
//                const classNamePtr = f_getClassName(klass);
//                const nsPtr = f_getClassNamespace(klass);
//
//                const methodName = namePtr.readCString();
//                const className = classNamePtr.readCString();
//                const ns = nsPtr.readCString();
//
//                console.log(
//                    `🎯 FOUND → ${ns}.${className}::${methodName}`,
//                    "method =", method
//                );
//
//            } catch (e) {
//                // 静默，防止影响运行
//            }
//        }
//    });
//
//})();



//'use strict';
//
//const UPDATE_ADDR = ptr("0xb6b219f8");
//
//let gGameManager = null;
//let gKlass = null;
//let dumped = false;
//
///*
// * ==============================
// * 只在 Update 里“抓对象”
// * ==============================
// */
//Interceptor.attach(UPDATE_ADDR, {
//    onEnter(args) {
//        if (gGameManager) return;
//
//        gGameManager = args[0];
//        gKlass = Memory.readPointer(gGameManager);
//
//        console.log("🎮 GameManager =", gGameManager);
//        console.log("🏷️ Klass       =", gKlass);
//
//        // 立刻切走，不在 UnityMain 干活
//        setImmediate(dumpGameManagerSafe);
//    }
//});
//
///*
// * ==============================
// * IL2CPP API（延迟调用）
// * ==============================
// */
//const il2cpp = {
//    class_get_methods: new NativeFunction(
//        Module.findExportByName("libil2cpp.so", "il2cpp_class_get_methods"),
//        'pointer',
//        ['pointer', 'pointer']
//    ),
//    class_get_fields: new NativeFunction(
//        Module.findExportByName("libil2cpp.so", "il2cpp_class_get_fields"),
//        'pointer',
//        ['pointer', 'pointer']
//    ),
//    field_get_name: new NativeFunction(
//        Module.findExportByName("libil2cpp.so", "il2cpp_field_get_name"),
//        'pointer',
//        ['pointer']
//    ),
//    field_get_offset: new NativeFunction(
//        Module.findExportByName("libil2cpp.so", "il2cpp_field_get_offset"),
//        'int',
//        ['pointer']
//    )
//};
//
///*
// * ==============================
// * 真正 dump（安全线程）
// * ==============================
// */
//function dumpGameManagerSafe() {
//    if (dumped) return;
//    dumped = true;
//
//    console.log("\n📜 ===== GameManager Methods =====");
//
//    try {
//        const iter = Memory.alloc(Process.pointerSize);
//        Memory.writePointer(iter, ptr(0));
//
//        while (true) {
//            const method = il2cpp.class_get_methods(gKlass, iter);
//            if (method.isNull()) break;
//
//            const name = Memory.readPointer(method).readCString();
//
//            console.log("  🎯", name);
//        }
//    } catch (e) {
//        console.log("⚠️ method dump failed:", e);
//    }
//
//    console.log("\n🧱 ===== GameManager Fields =====");
//
//    try {
//        const iter = Memory.alloc(Process.pointerSize);
//        Memory.writePointer(iter, ptr(0));
//
//        while (true) {
//            const field = il2cpp.class_get_fields(gKlass, iter);
//            if (field.isNull()) break;
//
//            const name = il2cpp.field_get_name(field).readCString();
//            const off  = il2cpp.field_get_offset(field);
//
//            console.log(
//                "  🧩",
//                name,
//                "+0x" + off.toString(16)
//            );
//        }
//    } catch (e) {
//        console.log("⚠️ field dump failed:", e);
//    }
//
//    console.log("\n✅ GameManager dump DONE");
//}


//Module.enumerateExports("libil2cpp.so", {
//    onMatch(e) {
////        if (e.name.indexOf("Log") !== -1) {
//            console.log(e.name, e.address);
////        }
//
//    },
//    onComplete() {}
//});


//'use strict';
//
//const il2cpp = {
//    runtime_invoke: null,
//    method_get_name: null,
//    method_get_class: null,
//    class_get_name: null,
//    class_get_namespace: null
//};
//
//function initIl2cpp() {
//    const base = "libil2cpp.so";
//
//    il2cpp.runtime_invoke = Module.findExportByName(base, "il2cpp_runtime_invoke");
//    il2cpp.method_get_name = Module.findExportByName(base, "il2cpp_method_get_name");
//    il2cpp.method_get_class = Module.findExportByName(base, "il2cpp_method_get_class");
//    il2cpp.class_get_name = Module.findExportByName(base, "il2cpp_class_get_name");
//    il2cpp.class_get_namespace = Module.findExportByName(base, "il2cpp_class_get_namespace");
//
//    if (!il2cpp.runtime_invoke) {
//        console.log("❌ il2cpp not ready");
//        return false;
//    }
//
//    console.log("✅ il2cpp api ready");
//    return true;
//}
//
//function getMethodFullName(method) {
//    try {
//        const getName = new NativeFunction(il2cpp.method_get_name, 'pointer', ['pointer']);
//        const getClass = new NativeFunction(il2cpp.method_get_class, 'pointer', ['pointer']);
//        const getClassName = new NativeFunction(il2cpp.class_get_name, 'pointer', ['pointer']);
//        const getNamespace = new NativeFunction(il2cpp.class_get_namespace, 'pointer', ['pointer']);
//
//        const name = getName(method).readCString();
//        const klass = getClass(method);
//        const className = getClassName(klass).readCString();
//        const namespaceName = getNamespace(klass).readCString();
//
//        return namespaceName + "." + className + "::" + name;
//    } catch (e) {
//        return null;
//    }
//}
//
//function hookRuntimeInvoke() {
//    const runtimeInvoke = new NativeFunction(
//        il2cpp.runtime_invoke,
//        'pointer',
//        ['pointer', 'pointer', 'pointer', 'pointer']
//    );
//
//    Interceptor.attach(runtimeInvoke, {
//        onEnter(args) {
//            const method = args[0];
//            const fullName = getMethodFullName(method);
//
//            if (!fullName) return;
//
//            // 👇 先过滤一波噪音（可按需调整）
//            if (
//                fullName.indexOf("UnityEngine") !== -1 ||
//                fullName.indexOf("System") !== -1
//            ) {
//                return;
//            }
//
//            if (
//                fullName.indexOf("UnityEngine.") === 0 ||
//                fullName.indexOf("System.") === 0 ||
//                fullName.indexOf("Spine.Unity.") === 0||
//                fullName.indexOf(".RoundedCorners::LateUpdate") === 0||
//                fullName.indexOf("DG.Tweening.Core") === 0||
//
//                fullName.indexOf("Learnings.Unity.UniKit.Runtime") === 0
//
//
//            ) {
//                return;
//            }
//if (
//    fullName.endsWith("::Update") ||
//    fullName.endsWith("::LateUpdate") ||
//    fullName.endsWith("::FixedUpdate")
//) {
//    return;
//}
//            console.log("🎯 CALL →", fullName);
//        }
//    });
//
//    console.log("✅ hook il2cpp_runtime_invoke");
//}
//
//setTimeout(function () {
//    if (initIl2cpp()) {
//        hookRuntimeInvoke();
//    }
//}, 1000);


//'use strict';
//
//const il2cpp = {
//    runtime_invoke: null,
//    method_get_name: null,
//    method_get_class: null,
//    class_get_name: null,
//    class_get_namespace: null
//};
//
//let mouseUpActive = false; // 是否正在抬起事件期间
//
//// --------------------- 初始化 il2cpp API ---------------------
//function initIl2cpp() {
//    const base = "libil2cpp.so";
//
//    il2cpp.runtime_invoke = Module.findExportByName(base, "il2cpp_runtime_invoke");
//    il2cpp.method_get_name = Module.findExportByName(base, "il2cpp_method_get_name");
//    il2cpp.method_get_class = Module.findExportByName(base, "il2cpp_method_get_class");
//    il2cpp.class_get_name = Module.findExportByName(base, "il2cpp_class_get_name");
//    il2cpp.class_get_namespace = Module.findExportByName(base, "il2cpp_class_get_namespace");
//
//    if (!il2cpp.runtime_invoke) {
//        console.log("❌ il2cpp_runtime_invoke not found");
//        return false;
//    }
//
//    console.log("✅ il2cpp API ready");
//    return true;
//}
//
//// --------------------- 获取方法完整名字 ---------------------
//function getMethodFullName(method) {
//    try {
//        const getName = new NativeFunction(il2cpp.method_get_name, 'pointer', ['pointer']);
//        const getClass = new NativeFunction(il2cpp.method_get_class, 'pointer', ['pointer']);
//        const getClassName = new NativeFunction(il2cpp.class_get_name, 'pointer', ['pointer']);
//        const getNamespace = new NativeFunction(il2cpp.class_get_namespace, 'pointer', ['pointer']);
//
//        const name = getName(method).readCString();
//        const klass = getClass(method);
//        const className = getClassName(klass).readCString();
//        const namespaceName = getNamespace(klass).readCString();
//
//        return namespaceName + "." + className + "::" + name;
//    } catch (e) {
//        return null;
//    }
//}
//
//// --------------------- 过滤噪音 ---------------------
//function shouldIgnore(fullName) {
//    const ignorePrefixes = [
//        "UnityEngine.",
//        "System.",
//        "Spine.Unity.",
//        "TMPro.",
//        "DG.Tweening."
//    ];
//
//    for (let p of ignorePrefixes) {
//        if (fullName.startsWith(p)) return true;
//    }
//
//    // 过滤 Update / FixedUpdate / LateUpdate
//    if (fullName.indexOf("Update") !== -1) return true;
//
//    return false;
//}
//
//// --------------------- hook runtime_invoke ---------------------
//function hookRuntimeInvoke() {
//    const runtimeInvoke = new NativeFunction(
//        il2cpp.runtime_invoke,
//        'pointer',
//        ['pointer', 'pointer', 'pointer', 'pointer']
//    );
//
//    Interceptor.attach(runtimeInvoke, {
//        onEnter(args) {
//            const fullName = getMethodFullName(args[0]);
//            if (!fullName) return;
//
//            // 检测抬起入口
//            if (fullName.endsWith("InputListener::OnMouseUp")) {
//                mouseUpActive = true;
//                console.log("👆 Mouse Up START →", fullName);
//            }
//
//            // 如果当前处于抬起期间，打印方法调用
//            if (mouseUpActive && !shouldIgnore(fullName)) {
//                console.log("👆 [MouseUp] CALL →", fullName);
//            }
//        },
//        onLeave(retval) {
//            // 检测抬起结束
//            const fullName = getMethodFullName(this.method);
//            if (!fullName) return;
//
//            if (fullName.endsWith("InputListener::OnMouseUp")) {
//                mouseUpActive = false;
//                console.log("👆 Mouse Up END →", fullName);
//            }
//        }
//    });
//
//    console.log("✅ hook il2cpp_runtime_invoke for MouseUp");
//}
//
//// --------------------- 启动 ---------------------
//setTimeout(function () {
//    if (initIl2cpp()) {
//        hookRuntimeInvoke();
//    }
//}, 1000);



//'use strict';
//
//function readSizeT(p) {
//    return Process.pointerSize === 8
//        ? p.readU64().toNumber()
//        : p.readU32();
//}
//function readCStringSafe(p) {
//    if (p.isNull()) return null;
//    try {
//        const s = p.readCString();
//        if (!s || s.length === 0) return null;
//        return s;
//    } catch (e) {
//        return null;
//    }
//}
//
//function getMethodName(method) {
//    // 尝试常见偏移
//    const candidates = [
//        Process.pointerSize * 1, // +0x8
//        Process.pointerSize * 2, // +0x10
//        Process.pointerSize * 3  // +0x18
//    ];
//
//    for (let off of candidates) {
//        const p = method.add(off).readPointer();
//        const s = readCStringSafe(p);
//        if (s) return s;
//    }
//    return "<unknown>";
//}
//
//setImmediate(function () {
//    console.log("🚀 IL2CPP class dumper REAL start...");
//
//    const base = Module.findBaseAddress("libil2cpp.so");
//    console.log("✅ libil2cpp.so base =", base);
//
//    function nf(name, ret, args) {
//        const addr = Module.findExportByName("libil2cpp.so", name);
//        if (!addr) {
//            console.log("❌ missing export:", name);
//            return null;
//        }
//        return new NativeFunction(addr, ret, args);
//    }
//
//    const il2cpp_domain_get =
//        nf("il2cpp_domain_get", 'pointer', []);
//
//    const il2cpp_domain_get_assemblies =
//        Module.findExportByName("libil2cpp.so", "il2cpp_domain_get_assemblies");
//
//    const il2cpp_assembly_get_image =
//        nf("il2cpp_assembly_get_image", 'pointer', ['pointer']);
//
//    const il2cpp_image_get_class_count =
//        nf("il2cpp_image_get_class_count", 'int', ['pointer']);
//
//    const il2cpp_image_get_class =
//        nf("il2cpp_image_get_class", 'pointer', ['pointer', 'int']);
//
//    const il2cpp_class_get_name =
//        nf("il2cpp_class_get_name", 'pointer', ['pointer']);
//
//    const il2cpp_class_get_namespace =
//        nf("il2cpp_class_get_namespace", 'pointer', ['pointer']);
//
//    const il2cpp_class_get_methods =
//        nf("il2cpp_class_get_methods", 'pointer', ['pointer', 'pointer']);
//
//    if (!il2cpp_domain_get || !il2cpp_domain_get_assemblies) {
//        console.log("❌ core il2cpp api missing");
//        return;
//    }
//
//    const domain = il2cpp_domain_get();
//
//    const sizePtr = Memory.alloc(Process.pointerSize);
//    sizePtr.writePointer(ptr(0));
//
//    const getAssemblies = new NativeFunction(
//        il2cpp_domain_get_assemblies,
//        'pointer',
//        ['pointer', 'pointer']
//    );
//
//    const assembliesPtr = getAssemblies(domain, sizePtr);
//    const assemblyCount = readSizeT(sizePtr);
//
//    console.log("📦 Assembly count =", assemblyCount);
//
//    for (let i = 0; i < assemblyCount; i++) {
//        const assembly = assembliesPtr
//            .add(i * Process.pointerSize)
//            .readPointer();
//
//        if (assembly.isNull()) continue;
//
//        const image = il2cpp_assembly_get_image(assembly);
//        if (image.isNull()) continue;
//
//        const classCount = il2cpp_image_get_class_count(image);
//
//        for (let j = 0; j < classCount; j++) {
//            const klass = il2cpp_image_get_class(image, j);
//            if (klass.isNull()) continue;
//
//            const className =
//                il2cpp_class_get_name(klass).readCString();
//            const namespaceName =
//                il2cpp_class_get_namespace(klass).readCString();
//
//            const iter = Memory.alloc(Process.pointerSize);
//            iter.writePointer(ptr(0));
//
//            let method;
//            while (!(method = il2cpp_class_get_methods(klass, iter)).isNull()) {
//
//                // ⭐ 核心：MethodInfo[0] 就是函数指针
//                const methodPtr = method.readPointer();
//                if (methodPtr.isNull()) continue;
//
//                // name 偏移通常在 +0x10 / +0x18（64 位）
//                const namePtr = method.add(Process.pointerSize * 2).readPointer();
//                const methodName = namePtr.readCString();
//
//                console.log(
//                    `🎯 ${namespaceName}.${className}::${methodName} @ ${methodPtr}`
//                );
//            }
//        }
//    }
//
//    console.log("✅ dump finished");
//});


'use strict';

/*
 * ===============================
 * 工具函数
 * ===============================
 */

function readSizeT(p) {
    return Process.pointerSize === 8
        ? p.readU64().toNumber()
        : p.readU32();
}

function readCStringSafe(p) {
    if (p.isNull()) return null;
    try {
        return p.readCString();
    } catch (e) {
        return null;
    }
}

function isLikelyMethodName(s) {
    if (!s) return false;
    if (s.length < 2 || s.length > 80) return false;
    return /^[a-zA-Z0-9_<>.$]+$/.test(s);
}

/*
 * ⭐ 核心：兼容 Unity 2021+ / 裁剪 / LTO 的 MethodInfo name 解析
 */
function getMethodName(method) {
    const offsets = [0x8, 0x10, 0x18, 0x20, 0x28];
    for (let off of offsets) {
        const p = method.add(off).readPointer();
        const s = readCStringSafe(p);
        if (isLikelyMethodName(s)) {
            return s;
        }
    }
    return "<unknown>";
}

/*
 * MethodInfo[0] 永远是 methodPointer
 */
function getMethodPointer(method) {
    return method.readPointer();
}

/*
 * ===============================
 * 主逻辑
 * ===============================
 */

setImmediate(function () {
    console.log("🚀 IL2CPP full dumper start...");

    const il2cppBase = Module.findBaseAddress("libil2cpp.so");
    if (!il2cppBase) {
        console.log("❌ libil2cpp.so not found");
        return;
    }

    console.log("✅ libil2cpp.so base =", il2cppBase);

    function nf(name, ret, args) {
        const addr = Module.findExportByName("libil2cpp.so", name);
        if (!addr) {
            console.log("❌ missing export:", name);
            return null;
        }
        return new NativeFunction(addr, ret, args);
    }

    const il2cpp_domain_get =
        nf("il2cpp_domain_get", 'pointer', []);

    const il2cpp_domain_get_assemblies_ptr =
        Module.findExportByName("libil2cpp.so", "il2cpp_domain_get_assemblies");

    const il2cpp_assembly_get_image =
        nf("il2cpp_assembly_get_image", 'pointer', ['pointer']);

    const il2cpp_image_get_class_count =
        nf("il2cpp_image_get_class_count", 'int', ['pointer']);

    const il2cpp_image_get_class =
        nf("il2cpp_image_get_class", 'pointer', ['pointer', 'int']);

    const il2cpp_class_get_name =
        nf("il2cpp_class_get_name", 'pointer', ['pointer']);

    const il2cpp_class_get_namespace =
        nf("il2cpp_class_get_namespace", 'pointer', ['pointer']);

    const il2cpp_class_get_methods =
        nf("il2cpp_class_get_methods", 'pointer', ['pointer', 'pointer']);

    if (!il2cpp_domain_get || !il2cpp_domain_get_assemblies_ptr) {
        console.log("❌ il2cpp core api missing");
        return;
    }

    const il2cpp_domain_get_assemblies =
        new NativeFunction(il2cpp_domain_get_assemblies_ptr, 'pointer', ['pointer', 'pointer']);

    const domain = il2cpp_domain_get();

    const sizePtr = Memory.alloc(Process.pointerSize);
    sizePtr.writePointer(ptr(0));

    const assembliesPtr = il2cpp_domain_get_assemblies(domain, sizePtr);
    const assemblyCount = readSizeT(sizePtr);

    console.log("📦 Assembly count =", assemblyCount);

    /*
     * ===============================
     * 你关心的类关键字（可改）
     * ===============================
     */
    const INTEREST_KEYWORDS = [
        "Combo",
        "Ad",
        "Logic",
        "GameUI",
        "Plugin"
    ];

    for (let i = 0; i < assemblyCount; i++) {
        const assembly = assembliesPtr.add(i * Process.pointerSize).readPointer();
        if (assembly.isNull()) continue;

        const image = il2cpp_assembly_get_image(assembly);
        if (image.isNull()) continue;

        const classCount = il2cpp_image_get_class_count(image);

        for (let j = 0; j < classCount; j++) {
            const klass = il2cpp_image_get_class(image, j);
            if (klass.isNull()) continue;

            const className =
                il2cpp_class_get_name(klass).readCString();
            const namespaceName =
                il2cpp_class_get_namespace(klass).readCString();

            const fullClass = `${namespaceName}.${className}`;

            // 👉 只关心你这类 UI / Game / Plugin
            if (!INTEREST_KEYWORDS.some(k => fullClass.indexOf(k) !== -1)) {
                continue;
            }

            const iter = Memory.alloc(Process.pointerSize);
            iter.writePointer(ptr(0));

            let method;
            while (!(method = il2cpp_class_get_methods(klass, iter)).isNull()) {
                const methodPtr = getMethodPointer(method);
                if (methodPtr.isNull()) continue;

                const methodName = getMethodName(method);

                console.log(
                    `🎯 ${fullClass}::${methodName} @ ${methodPtr}`
                );

                /*
                 * ===============================
                 * 示例 Hook（你可以直接改）
                 * ===============================
                 */
                if (
                    fullClass.indexOf("ComboPlugin") !== -1 &&
                    methodName !== "<unknown>"
                ) {
                    try {
                        Interceptor.attach(methodPtr, {
                            onEnter(args) {
                             if(fullName.startsWith("UnityEngine"))return;
                                console.log(
                                    `🔥 HIT ${fullClass}::${methodName}`
                                );
                            }
                        });
                    } catch (e) {
                        // 有些方法可能已经被 hook / inline，忽略
                    }
                }
            }
        }
    }

    console.log("✅ IL2CPP dump & hook finished");
});
