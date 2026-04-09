// ================== 配置 ==================
const TARGET_CLASS = "ShortcutExtensions";
const TARGET_NAMESPACE = "DG.Tweening";

const TARGET_METHODS = [
    "DOMove",
    "DOLocalMove",
    "DOScale",
    "DORotate"
];

// 日志限频（毫秒）
const LOG_INTERVAL = 1000;


// ================== IL2CPP API ==================
function getExport(name) {
    const addr = Module.findExportByName("libil2cpp.so", name);
    if (!addr) throw "❌ 找不到导出: " + name;
    return addr;
}

const il2cpp_domain_get = new NativeFunction(getExport("il2cpp_domain_get"), "pointer", []);
const il2cpp_domain_get_assemblies = new NativeFunction(getExport("il2cpp_domain_get_assemblies"), "pointer", ["pointer", "pointer"]);
const il2cpp_assembly_get_image = new NativeFunction(getExport("il2cpp_assembly_get_image"), "pointer", ["pointer"]);
const il22cpp_class_from_name = new NativeFunction(getExport("il2cpp_class_from_name"), "pointer", ["pointer", "pointer", "pointer"]);
const il2cpp_class_get_methods = new NativeFunction(getExport("il2cpp_class_get_methods"), "pointer", ["pointer", "pointer"]);
const il2cpp_method_get_name = new NativeFunction(getExport("il2cpp_method_get_name"), "pointer", ["pointer"]);
const il2cpp_method_get_param_count = new NativeFunction(getExport("il2cpp_method_get_param_count"), "int", ["pointer"]);


// ================== 工具函数 ==================

// 自动获取 methodPointer（适配不同 Unity 版本）
function getMethodPointer(method) {
    const offsets = [0x0, Process.pointerSize, 0x10];

    for (let off of offsets) {
        try {
            const p = method.add(off).readPointer();
            if (!p.isNull()) return p;
        } catch (e) {}
    }
    return ptr(0);
}

// 判断内存是否可读（防止 crash）
function isReadable(p) {
    try {
        Memory.readU8(p);
        return true;
    } catch (e) {
        return false;
    }
}

// 安全解析 Vector3（核心🔥）
function readVec3Safe(p) {

    if (!isReadable(p)) return null;

    // 尝试：直接结构体
    try {
        const x = p.readFloat();
        const y = p.add(4).readFloat();
        const z = p.add(8).readFloat();

        if (isFinite(x) && Math.abs(x) < 100000) {
            return [x, y, z];
        }
    } catch (e) {}

    // 尝试：一级指针
    try {
        const p1 = p.readPointer();
        if (!isReadable(p1)) return null;

        const x = p1.readFloat();
        const y = p1.add(4).readFloat();
        const z = p1.add(8).readFloat();

        return [x, y, z];
    } catch (e) {}

    // 尝试：二级指针（极端情况）
    try {
        const p1 = p.readPointer();
        const p2 = p1.readPointer();

        if (!isReadable(p2)) return null;

        const x = p2.readFloat();
        const y = p2.add(4).readFloat();
        const z = p2.add(8).readFloat();

        return [x, y, z];
    } catch (e) {}

    return null;
}

function hexDump(ptr, size) {
    try {
        return hexdump(ptr, {
            offset: 0,
            length: size,
            header: false,
            ansi: false
        });
    } catch (e) {
        return "❌ 无法读取内存";
    }
}
function regToFloatSafe(reg) {
    try {
        const val = reg.toUInt32();

        const buf = Memory.alloc(4);
        buf.writeU32(val);

        const f = buf.readFloat();

        // 简单过滤异常值
        if (!isFinite(f) || Math.abs(f) > 100000) return null;

        return f;
    } catch (e) {
        return null;
    }
}

function getReg(ctx, index) {
    const arch = Process.arch;

    if (arch === "arm64") {
        return ctx["x" + index];
    }

    if (arch === "arm") {
        return ctx["r" + index];
    }

    if (arch === "ia32") {
        const map = ["eax", "ecx", "edx", "ebx"];
        return ctx[map[index]];
    }

    if (arch === "x64") {
        const map = ["rdi", "rsi", "rdx", "rcx"];
        return ctx[map[index]];
    }

    return undefined;
}

function regToFloat(reg) {
    if (!reg) return null;

    const buf = Memory.alloc(4);
    buf.writeU32(reg.toUInt32());
    return buf.readFloat();
}
// ================== 主逻辑 ==================
setImmediate(function () {

    console.log("🚀 DOTween Hook 启动");

    const domain = il2cpp_domain_get();

    const sizePtr = Memory.alloc(4);
    const assemblies = il2cpp_domain_get_assemblies(domain, sizePtr);
    const size = sizePtr.readU32();

    console.log("📦 assemblies:", size);

    for (let i = 0; i < size; i++) {

        const assembly = assemblies.add(i * Process.pointerSize).readPointer();
        const image = il2cpp_assembly_get_image(assembly);

        const klass = il22cpp_class_from_name(
            image,
            Memory.allocUtf8String(TARGET_NAMESPACE),
            Memory.allocUtf8String(TARGET_CLASS)
        );

        if (klass.isNull()) continue;

        console.log("🎯 找到类:", TARGET_CLASS);

        const iter = Memory.alloc(Process.pointerSize);
        iter.writePointer(ptr(0));

        let method;

        while (!(method = il2cpp_class_get_methods(klass, iter)).isNull()) {

            const name = il2cpp_method_get_name(method).readUtf8String();

            if (TARGET_METHODS.indexOf(name) === -1) continue;

            const paramCount = il2cpp_method_get_param_count(method);
            const fnPtr = getMethodPointer(method);

            if (fnPtr.isNull()) continue;

            console.log(`✅ Hook ${name} | 参数:${paramCount} | 地址:${fnPtr}`);

            let lastTime = 0;

            Interceptor.attach(fnPtr, {

                onEnter(args) {

                 const ctx = this.context;

        const r1 = getReg(ctx, 1);
        const r2 = getReg(ctx, 2);
        const r3 = getReg(ctx, 3);
        const r4 = getReg(ctx, 4);

        if (!r1 || !r2 || !r3) {
            console.log("❌ 寄存器不存在，arch:", Process.arch);
            return;
        }

        const x = regToFloat(r1);
        const y = regToFloat(r2);
        const z = regToFloat(r3);
        const duration = regToFloat(r4);

        console.log("\n🎬 DORotate");
        console.log("📌 pos:", x, y, z);
        console.log("⏱ duration:", duration);
                }

            });

        }

    }

});