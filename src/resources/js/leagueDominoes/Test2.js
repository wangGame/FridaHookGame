'use strict';

/**
 * ==========================
 * Il2Cpp API
 * ==========================
 */

function nf(name, ret, args) {
    const addr = Module.findExportByName("libil2cpp.so", name);
    if (addr === null) {
        throw new Error("❌ Missing export: " + name);
    }
    return new NativeFunction(addr, ret, args);
}

const il2cpp_domain_get = nf("il2cpp_domain_get", "pointer", []);
const il2cpp_domain_get_assemblies = nf("il2cpp_domain_get_assemblies", "pointer", ["pointer", "pointer"]);
const il2cpp_assembly_get_image = nf("il2cpp_assembly_get_image", "pointer", ["pointer"]);
const il2cpp_class_from_name = nf("il2cpp_class_from_name", "pointer", ["pointer", "pointer", "pointer"]);
const il2cpp_class_get_method_from_name = nf("il2cpp_class_get_method_from_name", "pointer", ["pointer", "pointer", "int"]);
const il2cpp_method_get_pointer = nf("il2cpp_method_get_pointer", "pointer", ["pointer"]);

/**
 * ==========================
 * 通过名字查找 Il2Cpp 方法
 * ==========================
 */
function findIl2cppMethod(assemblyName, namespaceName, className, methodName, argCount) {
    const domain = il2cpp_domain_get();
    if (domain.isNull()) return ptr(0);

    const countPtr = Memory.alloc(Process.pointerSize);
    const assemblies = il2cpp_domain_get_assemblies(domain, countPtr);
    const count = countPtr.readU32();

    for (let i = 0; i < count; i++) {
        const assembly = assemblies.add(i * Process.pointerSize).readPointer();
        const image = il2cpp_assembly_get_image(assembly);

        const klass = il2cpp_class_from_name(
            image,
            Memory.allocUtf8String(namespaceName),
            Memory.allocUtf8String(className)
        );
        if (klass.isNull()) continue;

        const method = il2cpp_class_get_method_from_name(
            klass,
            Memory.allocUtf8String(methodName),
            argCount
        );
        if (method.isNull()) continue;

        const fnPtr = il2cpp_method_get_pointer(method);
        if (!fnPtr.isNull()) {
            return fnPtr;   // ✅ 一定是 NativePointer
        }
    }

    return ptr(0);
}

/**
 * ==========================
 * Tile 打印（你已验证的结构）
 * ==========================
 *
 * Tile
 *  └── value @ 0x28 -> TileValue*
 *
 * TileValue
 *  ├── leftEnd  @ 0x8  (int32)
 *  └── rightEnd @ 0xC  (int32)
 */
function printTile(tilePtr) {
    if (tilePtr.isNull()) return;

    const valuePtr = tilePtr.add(0x28).readPointer();
    if (valuePtr.isNull()) return;

    const left  = valuePtr.add(0x8).readS32();
    const right = valuePtr.add(0xC).readS32();

    console.log("🀄 Tile: [" + left + "|" + right + "]");
}

/**
 * ==========================
 * 查找并 Hook
 * ==========================
 */

const target = findIl2cppMethod(
    "Assembly-CSharp",
    "",
    "AILogic",
    "GetTileForNextMove",
    3
);

if (target.isNull()) {
    throw new Error("❌ AILogic.GetTileForNextMove not found");
}

console.log("🎯 AILogic.GetTileForNextMove =", target);

Interceptor.attach(target, {
    onEnter(args) {
        console.log("\n🎮 AILogic.GetTileForNextMove ENTER");
        console.log("   mode     =", args[0]);
        console.log("   aiPlayer =", args[1]);
        console.log("   table    =", args[2]);
    },
    onLeave(retval) {
        if (retval.isNull()) {
            console.log("   return = null");
            return;
        }
        printTile(retval);
    }
});
