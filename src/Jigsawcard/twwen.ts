// ====== 工具函数 ======
function getExport(name) {
    const addr = Module.findExportByName("libil2cpp.so", name);
    if (!addr) throw "❌ 找不到导出: " + name;
    return addr;
}

const il2cpp_domain_get = new NativeFunction(getExport("il2cpp_domain_get"), "pointer", []);
const il2cpp_domain_get_assemblies = new NativeFunction(getExport("il2cpp_domain_get_assemblies"), "pointer", ["pointer", "pointer"]);
const il2cpp_assembly_get_image = new NativeFunction(getExport("il2cpp_assembly_get_image"), "pointer", ["pointer"]);
const il2cpp_class_from_name = new NativeFunction(getExport("il2cpp_class_from_name"), "pointer", ["pointer", "pointer", "pointer"]);
const il2cpp_class_get_methods = new NativeFunction(getExport("il2cpp_class_get_methods"), "pointer", ["pointer", "pointer"]);
const il2cpp_method_get_name = new NativeFunction(getExport("il2cpp_method_get_name"), "pointer", ["pointer"]);
const il2cpp_method_get_param_count = new NativeFunction(getExport("il2cpp_method_get_param_count"), "int", ["pointer"]);


// Il2CppMethod 结构里 methodPointer 偏移（通用做法：0x0 或 0x10/0x18，不同版本不同）
function getMethodPointer(method) {
    // 常见 offset 尝试
    const ptr1 = method.readPointer();          // 偏移 0
    if (!ptr1.isNull()) return ptr1;

    const ptr2 = method.add(Process.pointerSize).readPointer(); // 偏移 8
    if (!ptr2.isNull()) return ptr2;

    const ptr3 = method.add(0x10).readPointer();
    return ptr3;
}


// ====== 查找类 ======
function findClass(image, namespace, name) {
    return il2cpp_class_from_name(
        image,
        Memory.allocUtf8String(namespace),
        Memory.allocUtf8String(name)
    );
}


// ====== 枚举方法 ======
function findMethods(klass, targetName) {
    const iter = Memory.alloc(Process.pointerSize);
    iter.writePointer(ptr(0));

    let method;
    const results = [];

    while (!(method = il2cpp_class_get_methods(klass, iter)).isNull()) {

        const namePtr = il2cpp_method_get_name(method);
        const name = namePtr.readUtf8String();

        if (name === targetName) {
            const paramCount = il2cpp_method_get_param_count(method);
            const fnPtr = getMethodPointer(method);

            console.log(`✅ 找到 ${name} 参数:${paramCount} 地址:${fnPtr}`);
            results.push(fnPtr);
        }
    }

    return results;
}


// ====== 主逻辑 ======
setImmediate(function () {

    const domain = il2cpp_domain_get();

    const sizePtr = Memory.alloc(4);
    const assemblies = il2cpp_domain_get_assemblies(domain, sizePtr);
    const size = sizePtr.readU32();

    console.log("assemblies:", size);

    for (let i = 0; i < size; i++) {

        const assembly = assemblies.add(i * Process.pointerSize).readPointer();
        const image = il2cpp_assembly_get_image(assembly);

        // 找 DOTween
        const klass = findClass(image, "DG.Tweening", "ShortcutExtensions");

        if (klass.isNull()) continue;

        console.log("🎯 找到 ShortcutExtensions");

        const targets = ["DOMove", "DOScale", "DORotate", "DOLocalMove"];

        targets.forEach(name => {

            const addrs = findMethods(klass, name);

            addrs.forEach(addr => {

                Interceptor.attach(addr, {

                    onEnter(args) {

                        console.log(`\n🎬 ${name}`);

                        try {
                            // Vector3
                            const x = args[1].readFloat();
                            const y = args[1].add(4).readFloat();
                            const z = args[1].add(8).readFloat();

                            const duration = args[2].toFloat();

                            console.log("📌 pos:", x, y, z);
                            console.log("⏱ duration:", duration);

                        } catch (e) {
                            console.log("error:", e);
                        }
                    }
                });

            });

        });

    }

});