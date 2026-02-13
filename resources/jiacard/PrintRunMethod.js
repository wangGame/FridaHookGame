'use strict';

(function () {

    console.log("🚀 il2cpp Invoke resolver starting...");

    const il2cpp = Process.findModuleByName("libil2cpp.so");
    if (!il2cpp) {
        console.log("❌ libil2cpp.so not found");
        throw new Error("abort");
    }

    console.log("✅ libil2cpp.so @", il2cpp.base, "size =", il2cpp.size);

    function mustExport(name) {
        const p = Module.findExportByName("libil2cpp.so", name);
        if (!p) {
            console.log("❌ missing export:", name);
            throw new Error("abort");
        }
        return p;
    }

    const f_getMethodName = new NativeFunction(
        mustExport("il2cpp_method_get_name"),
        'pointer',
        ['pointer']
    );

    const f_getMethodClass = new NativeFunction(
        mustExport("il2cpp_method_get_class"),
        'pointer',
        ['pointer']
    );

    const f_getClassName = new NativeFunction(
        mustExport("il2cpp_class_get_name"),
        'pointer',
        ['pointer']
    );

    const f_getClassNamespace = new NativeFunction(
        mustExport("il2cpp_class_get_namespace"),
        'pointer',
        ['pointer']
    );

    const invoke = Module.findExportByName("libil2cpp.so", "il2cpp_runtime_invoke");
    if (!invoke) {
        console.log("❌ il2cpp_runtime_invoke not found");
        throw new Error("abort");
    }

    console.log("✅ hook il2cpp_runtime_invoke @", invoke);

    const seen = {};

    Interceptor.attach(invoke, {
        onEnter(args) {
            try {
                const method = args[0];
                const obj = args[1];
                if (obj.isNull()) return;

                const key = method.toString();
                if (seen[key]) return;
                seen[key] = true;

                const namePtr = f_getMethodName(method);
                const klass = f_getMethodClass(method);
                const classNamePtr = f_getClassName(klass);
                const nsPtr = f_getClassNamespace(klass);

                const methodName = namePtr.readCString();
                const className = classNamePtr.readCString();
                const ns = nsPtr.readCString();

                console.log(
                    `🎯 FOUND → ${ns}.${className}::${methodName}`,
                    "method =", method
                );

            } catch (e) {
                // 静默，防止影响运行
            }
        }
    });

})();