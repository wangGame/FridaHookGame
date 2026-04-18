/**
*  能用部分，通过illcpp来得到方法的参数和返回
*/

'use strict';

/**
 * ==========================
 * Il2Cpp API
 * ==========================
 */

const il2cpp_object_get_class = new NativeFunction(
    Module.findExportByName("libil2cpp.so", "il2cpp_object_get_class"),
    "pointer",
    ["pointer"]
);

const il2cpp_class_get_name = new NativeFunction(
    Module.findExportByName("libil2cpp.so", "il2cpp_class_get_name"),
    "pointer",
    ["pointer"]
);

/**
 * ==========================
 * 计算目标函数地址（关键）
 * ==========================
 */

const base = Module.findBaseAddress("libil2cpp.so");
if (!base) {
    console.log("❌ libil2cpp.so not loaded");

}

const RVA_GetTileForNextMove = 0x64BC38;
const addr = base.add(RVA_GetTileForNextMove);

console.log("🎯 AILogic.GetTileForNextMove =", addr);

/**
 * ==========================
 * 打印
 * ==========================
 */
//
//function dumpTile(tilePtr) {
//    if (tilePtr.isNull()) return;
//    console.log("🀄 Dumping Tile at: " + tilePtr);
//
//    // 假设 Tile 对象大小不大，尝试打印前 0x20 字节
//    for (var i = 0; i < 0x20; i += 4) {
//        var val = tilePtr.add(i).readU32();
//        console.log(" offset 0x" + i.toString(16) + ": 0x" + val.toString(16) + " / " + val);
//    }
//}

//function findTileValues(tilePtr) {
//    if (tilePtr.isNull()) return;
//    console.log("🀄 Scanning Tile at: " + tilePtr);
//
//    for (var i = 0; i < 0x20; i += 1) { // 每个字节扫
//        var val = tilePtr.add(i).readU8();
//        if (val >= 0 && val <= 6) {
//            console.log(" possible value at offset 0x" + i.toString(16) + ": " + val);
//        }
//    }
//}

//function printTile(tilePtr) {
//    if (tilePtr.isNull()) return;
//
//    // Tile.value 偏移 0x28
//    var valuePtr = tilePtr.add(0x28).readPointer();
//    if (valuePtr.isNull()) return;
//
//    // TileValue.left / right 偏移 0x0 / 0x1
//    var left = valuePtr.readU8();
//    var right = valuePtr.add(1).readU8();
//
//    console.log("🀄 Tile: [" + left + "|" + right + "]");
//}


function printTile(tilePtr) {
    if (tilePtr.isNull()) return;

    // Tile.value 偏移 0x28
    var tileValuePtr = tilePtr.add(0x28).readPointer();
    if (tileValuePtr.isNull()) return;

    // TileValue.leftEnd / rightEnd 偏移 0x8 / 0xC
    var left = tileValuePtr.add(0x8).readS32();   // ETiles 是 enum -> int32
    var right = tileValuePtr.add(0xC).readS32();

    console.log("🀄 Tile: [" + left + "|" + right + "]");

        // 🔥 修改返回点数
    tileValuePtr.add(0x8).writeS32(6);
    tileValuePtr.add(0xC).writeS32(6);

    console.log("🔥 After:  [6|6]");
}

/**
 * ==========================
 * Hook
 * ==========================
 */

Interceptor.attach(addr, {
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

//        // 打印返回对象类型
//        const klass = il2cpp_object_get_class(retval);
//        const name = il2cpp_class_get_name(klass).readCString();
//
//        console.log("   return object =", retval);
//        console.log("   return class  =", name);

        printTile(retval);
    }
});
