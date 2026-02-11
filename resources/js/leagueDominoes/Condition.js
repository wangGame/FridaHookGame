//'use strict';
//
///**
// * =====================================================
// * PV_BaseFullScreenAdsHandler::CheckCommonConditions
// * 完整 Hook + 参数打印 + 强制返回 true
// * =====================================================
// */
//
///**
// * ==========================
// * Il2CppString 结构
// * ==========================
// * Il2CppString:
// * 0x00 Il2CppObject
// * 0x10 char16_t chars[]
// */
//const IL2CPP_STRING_CHARS = 0x10;
//
///**
// * ==========================
// * 工具函数
// * ==========================
// */
//function readIl2CppString(strPtr) {
//    if (strPtr.isNull()) return "null";
//    try {
//        return strPtr.add(IL2CPP_STRING_CHARS).readUtf16String();
//    } catch (e) {
//        return "<invalid>";
//    }
//}
//
///**
// * ==========================
// * libil2cpp.so 基址
// * ==========================
// */
//const base = Module.findBaseAddress("libil2cpp.so");
//if (!base) {
//    throw "❌ libil2cpp.so not found";
//}
//console.log("✅ libil2cpp.so base =", base);
//
///**
// * ==========================
// * 方法地址（你已算出的真实函数）
// * ==========================
// * 你日志中已经确认：
// * 🎯 real func = 0x86d017b0
// */
//const realFunc = ptr("0x86d017b0");
//console.log("🎯 CheckCommonConditions =", realFunc);
//
///**
// * ==========================
// * 原函数声明
// * ==========================
// */
//const orig_Check = new NativeFunction(
//    realFunc,
//    'int', // bool -> int
//    ['pointer', 'pointer', 'pointer', 'int']
//);
//
///**
// * ==========================
// * Hook
// * ==========================
// */
//Interceptor.replace(
//    realFunc,
//    new NativeCallback(function (thiz, placement, outResultPtr, a4) {
//
//        console.log("\n🚫 CheckCommonConditions 被调用");
//
//        // this
//        console.log("   📦 this =", thiz);
//
//        // placement
//        const placementStr = readIl2CppString(placement);
//        console.log("   📍 placement =", placementStr);
//
//        // out string（Il2CppString**）
//        let outStr = "null";
//        try {
//            const outStrPtr = Memory.readPointer(outResultPtr);
//            outStr = readIl2CppString(outStrPtr);
//        } catch (e) {
//            outStr = "<read failed>";
//        }
//        console.log("   🧾 out result (before) =", outStr);
//
//        console.log("   ⚙ a4 =", a4);
//
//        // 调用原函数（可选）
//        const origRet = orig_Check(thiz, placement, outResultPtr, a4);
//        console.log("   🔙 原始返回 =", origRet);
//
//        // 再读一次 out
//        try {
//            const outStrPtr2 = Memory.readPointer(outResultPtr);
//            console.log("   🧾 out result (after) =", readIl2CppString(outStrPtr2));
//        } catch {}
//
//        // 🚀 强制通过
//        console.log("   ✅ 返回 true（劫持）");
//        return 1;
//
//    }, 'int', ['pointer', 'pointer', 'pointer', 'int'])
//);
//
//console.log("✅ CheckCommonConditions Hook 完成");

'use strict';

/**
 * =====================================================
 * Conditions::AnyConditionMet
 * 打印 _conditions 数组（验证用）
 * =====================================================
 */

/**
 * ==========================
 * libil2cpp.so 基址
 * ==========================
 */
const base = Module.findBaseAddress("libil2cpp.so");
if (!base) {
    throw "❌ libil2cpp.so not found";
}
console.log("✅ libil2cpp.so base =", base);

/**
 * ==========================
 * RVA
 * ==========================
 */
const RVA_AnyConditionMet = 0x2192B10;
const addr_AnyConditionMet = base.add(RVA_AnyConditionMet);
console.log("🎯 Conditions.AnyConditionMet =", addr_AnyConditionMet);

/**
 * ==========================
 * 原函数
 * ==========================
 */
const orig_AnyConditionMet = new NativeFunction(
    addr_AnyConditionMet,
    'int',        // bool -> int
    ['pointer']   // this
);

/**
 * ==========================
 * Il2CppArray 读取
 * ==========================
 */
function readIl2CppArray(arrayPtr) {
    if (arrayPtr.isNull()) return [];

    let result = [];
    try {
        const length = arrayPtr.add(0x18).readU32();
        const dataBase = arrayPtr.add(0x20);

        for (let i = 0; i < length; i++) {
            const elemPtr = dataBase
                .add(i * Process.pointerSize)
                .readPointer();
            result.push(elemPtr);
        }
    } catch (e) {
        console.log("❌ readIl2CppArray error:", e);
    }
    return result;
}

/**
 * ==========================
 * 打印 Conditions._conditions
 * ==========================
 */
function dumpConditions(thiz) {
    console.log("📦 Conditions this =", thiz);

    // FieldOffset(0x8)
    const arrPtr = thiz.add(0x8).readPointer();
    console.log("📦 _conditions array ptr =", arrPtr);

    if (arrPtr.isNull()) {
        console.log("⚠️ _conditions == null");
        return;
    }

    const list = readIl2CppArray(arrPtr);
    console.log("📊 _conditions.length =", list.length);

    for (let i = 0; i < list.length; i++) {
        console.log(`   [${i}] Condition* =`, list[i]);
    }
}

/**
 * ==========================
 * Hook
 * ==========================
 */
Interceptor.replace(
    addr_AnyConditionMet,
    new NativeCallback(function (thiz) {

        console.log("\n🚀 AnyConditionMet 被调用");

        dumpConditions(thiz);

        const ret = orig_AnyConditionMet(thiz);
        console.log("🔙 原始返回 =", ret);

        // 👉 如果你想直接“强制命中任意条件”，打开下面这行
        // return 1;

        return ret;

    }, 'int', ['pointer'])
);

console.log("✅ AnyConditionMet Hook 完成");
