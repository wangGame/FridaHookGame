//'use strict';
//
//const so = "libil2cpp.so";
//
//function nf(name, ret, args, required = true) {
//    const p = Module.findExportByName(so, name);
//    if (!p) {
//        if (required) throw new Error("missing export: " + name);
//        console.log("[!] missing export:", name);
//        return null;
//    }
//    return new NativeFunction(p, ret, args);
//}
//
//function cs(p) {
//    try {
//        return (!p || p.isNull()) ? "" : Memory.readCString(p);
//    } catch (e) {
//        return "";
//    }
//}
//
//const mono_get_root_domain = nf("mono_get_root_domain", "pointer", []);
//const il2cpp_thread_attach = nf("il2cpp_thread_attach", "pointer", ["pointer"]);
//const il2cpp_domain_assembly_open = nf("il2cpp_domain_assembly_open", "pointer", ["pointer", "pointer"]);
//const il2cpp_assembly_get_image = nf("il2cpp_assembly_get_image", "pointer", ["pointer"]);
//const il2cpp_class_from_name = nf("il2cpp_class_from_name", "pointer", ["pointer", "pointer", "pointer"]);
//const il2cpp_class_get_method_from_name = nf("il2cpp_class_get_method_from_name", "pointer", ["pointer", "pointer", "int"]);
//const il2cpp_method_get_name = nf("il2cpp_method_get_name", "pointer", ["pointer"], false);
//const il2cpp_method_get_param_count = nf("il2cpp_method_get_param_count", "uint32", ["pointer"], false);
//
//const method_get_pointer_ptr = Module.findExportByName(so, "il2cpp_method_get_pointer");
//const il2cpp_method_get_pointer = method_get_pointer_ptr
//    ? new NativeFunction(method_get_pointer_ptr, "pointer", ["pointer"])
//    : null;
//
//function attachThread() {
//    const domain = mono_get_root_domain();
//    if (domain.isNull()) throw new Error("mono_get_root_domain returned NULL");
//    il2cpp_thread_attach(domain);
//    return domain;
//}
//
//function getImage(assemblyName) {
//    const domain = attachThread();
//    const asm = il2cpp_domain_assembly_open(domain, Memory.allocUtf8String(assemblyName));
//    if (asm.isNull()) throw new Error("open assembly failed: " + assemblyName);
//
//    const image = il2cpp_assembly_get_image(asm);
//    if (image.isNull()) throw new Error("get image failed: " + assemblyName);
//
//    return image;
//}
//
//function findMethod(assemblyName, namespaceName, className, methodName, argc) {
//    const image = getImage(assemblyName);
//
//    const klass = il2cpp_class_from_name(
//        image,
//        Memory.allocUtf8String(namespaceName),
//        Memory.allocUtf8String(className)
//    );
//    if (klass.isNull()) {
//        throw new Error("class not found: " + namespaceName + "." + className);
//    }
//
//    const method = il2cpp_class_get_method_from_name(
//        klass,
//        Memory.allocUtf8String(methodName),
//        argc
//    );
//    if (method.isNull()) {
//        throw new Error("method not found: " + className + "." + methodName + " argc=" + argc);
//    }
//
//    return method;
//}
//
//function getMethodPointer(method) {
//    if (il2cpp_method_get_pointer) {
//        const p = il2cpp_method_get_pointer(method);
//        if (p && !p.isNull()) return p;
//    }
//    return Memory.readPointer(method);
//}
//
//function formatFrame(addr, base) {
//    let s = addr.toString();
//    try {
//        if (base && addr.compare(base) >= 0) {
//            s += " offset=" + addr.sub(base);
//        }
//    } catch (e) {}
//
//    try {
//        s += " " + DebugSymbol.fromAddress(addr);
//    } catch (e) {}
//
//    return s;
//}
//
//function hookMethod(assemblyName, namespaceName, className, methodName, argc) {
//    const method = findMethod(assemblyName, namespaceName, className, methodName, argc);
//    const addr = getMethodPointer(method);
//
//    if (!addr || addr.isNull()) {
//        throw new Error("method pointer is NULL");
//    }
//
//    const base = Module.findBaseAddress(so);
//
//    console.log("[+] target method =", className + "." + methodName);
//    console.log("[+] method =", method);
//    console.log("[+] addr =", addr);
//
//    if (base) {
//        console.log("[+] base =", base);
//        console.log("[+] ida offset =", addr.sub(base));
//    }
//    if (il2cpp_method_get_name) {
//        console.log("[+] real method name =", cs(il2cpp_method_get_name(method)));
//    }
//    if (il2cpp_method_get_param_count) {
//        console.log("[+] real argc =", il2cpp_method_get_param_count(method));
//    }
//
//    Interceptor.attach(addr, {
//        onEnter(args) {
//            this.thisObj = args[0];
//
//            console.log("\n==============================");
//            console.log(">>> ENTER " + className + "." + methodName);
//            console.log("this =", this.thisObj);
//
//            console.log("---- backtrace ----");
//            Thread.backtrace(this.context, Backtracer.FUZZY).forEach((p, i) => {
//                console.log("#" + i + " " + formatFrame(p, base));
//            });
//        },
//        onLeave(retval) {
//            console.log("<<< LEAVE " + className + "." + methodName + " ret=" + retval);
//        }
//    });
//
//    console.log("[+] hook attached");
//}
//
//setImmediate(function () {
//    try {
//        hookMethod(
//            "Assembly-CSharp.dll",
//            "",
//            "Game",
//            "SmartMatchRemainingBlocks",
//            0
//        );
//    } catch (e) {
//        console.log("[!] ERROR:", e);
//    }
//});


'use strict';

const so = "libil2cpp.so";
const ASSEMBLY = "Assembly-CSharp.dll";
const NAMESPACE = "";
const CLASS_NAME = "Game";

// ====== 可调配置 ======
const SHOW_BACKTRACE = true;
const BACKTRACE_MODE = Backtracer.FUZZY;   // ACCURATE / FUZZY
const MAX_ARGS_TO_PRINT = 6;

// 只 hook 这些关键方法
const TARGET_METHODS = [
"get_Camera",
"set_Camera",
"get_IsInitialized",
"set_IsInitialized",
"get_YC",
"get_XC",
"get_Sprite",
"get_OnComplete",
"get_PuzzleView",
"get_LinkCalculator",
"get_VS",
"get_Columns",
"get_Rows",
"get_IsDragging",
"Initialize",
"Clear",
"HideBackground",
"ShowBackground",
"StopAllSequences",
"InitWhenGameStart",
"SetFlipStateByTargetIndex",
"ProcessFlippedPieces",
"GetFlippedPieceCount",
"GetSinglePieces",
"CheckAndFlipBackIfNotLinked",
"HasFlippedPiecesInNewLinks",
"HandleGameCompleteWithFlipAnimation",
"ProcessFlippedPiecesInNewLinks",
"SetPieceValueAndFlippedState",
"CheckFastCompleteWithAnim",
"OnBeginDrag",
"OnDrag",
"OnEndDrag",
"RestartGame",
"GetCurrentLinkTargetSet",
"GetCurrentLinkDictionary",
"OnResetFinish",
"GetChipOrder",
"GetPiecePositionInfoByIndex",
"FindPieceByTargetIndex",
"CheckLeft2Piece",
"HandleExchangeTwoLink",
"HandleExchangeTwoPiece",
"CheckFastCompleteLastStep",
"GetPuzzlePosition",
"GetSizeDelta",
"CheatFinishExceptTopLeftSwap",
"CheatFinishWithSwap",
"SwapPieces",
"GetLink",
"ForeachLink",
"NotifyPieceTouched",
"NotifyStartDrag",
"NotifyEndDrag",
"IsValid",
"CalculateDropTarget",
"HandleInvalidMove",
"HandleValidMove",
"DoMove",
"DoMoveWithControl",
"CalculatePieceOverlapArea",
"TryGetPuzzleBounds",
"CalculateOverlapArea",
"CalculateTargetWithNewRule",
"CheckOverlapWithOtherBlocks",
"SetLockedPiecesForMove",
"HandleLinkResult",
"NotifyLinkResultFinish",
"NotifyNoneDragPieceMove",
"NotifyPieceLinked",
"PlayInitialLinksScaleAnimation",
"ShowOutline",
"HideOutline",
"FindTwoPiecesCanLink",
"CalculateDirection",
"IsNoAnimationOrDrag",
"SmartMatchVacantsAndDisplaced",
"SmartMatchRemainingBlocks",
"FindBestGlobalAssignment",
"BacktrackAssignment",
"EvaluateAssignment",
"FindAllPossiblePlacements",
"TryFormNewLinks",
"TrySimpleRearrangement",
"GetMovedBlockInfo",
"GetValueAt",
"FindConnectedGroups",
"FloodFillConnectedGroup",
"FindDisplacedBlocks",
"CalculateBlockPriority",
"CanFitCompletely",
"IsShapeCompatible",
"CalculateShapeMatch",
"FindBestMatchingVacantGroup",
"AssignBlockToVacantGroup",
"FindBestPlacementInVacantGroup",
"TryCutAndAssignBlocks",
"FindBestCuttableSubBlock",
"IsSubBlockConnected",
"ProcessSwapInfoOnBeginDrag",
"ProcessSwapInfoOnEndDragInvalid",
"ProcessSwapInfoOnEndDragValid",
"ProcessSwapInfoOnEndDragLastTwoPiece",
"CalculateBrokenBlocksCount",
"CalculateLink",
"SendGameStart",
"SendGameEnd",
"SendGameExit",
"SendSwapInfo",
"SendFlipChipClick",
"GetMaxBlockChips",
"GetBlockChips",
"GetDifficultyEnum",
"GetDifficultyEnumForGameStart",
"GetDifficultyEnumForGameEnd",
"GetDifficultyEnumForGameExit",
"ConvertLevelType",
"ConvertDifficultyLevel",
"ConvertSource",
"ConvertLevelTypeForGameEnd",
"ConvertDifficultyLevelForGameEnd",
"ConvertSourceForGameEnd",
"ConvertSourceForScrShow",
"ConvertLevelTypeForGameExit",
"ConvertDifficultyLevelForGameExit",
"ConvertSourceForGameExit",
"GetBlockEnlargeScale",
"GetBlockEnlargeDuration",
"GetBlockReduceDuration"
];

// ====== 基础工具 ======
function nf(name, ret, args, required = true) {
    const p = Module.findExportByName(so, name);
    if (!p) {
        if (required) throw new Error("missing export: " + name);
        console.log("[!] missing export:", name);
        return null;
    }
    return new NativeFunction(p, ret, args);
}

function cs(p) {
    try {
        return (!p || p.isNull()) ? "" : Memory.readCString(p);
    } catch (e) {
        return "";
    }
}

function ptrStr(p) {
    try {
        return p ? p.toString() : "NULL";
    } catch (e) {
        return "<?>"
    }
}

function hexOff(p, base) {
    try {
        if (!base || p.compare(base) < 0) return "";
        return p.sub(base).toString();
    } catch (e) {
        return "";
    }
}

// ====== IL2CPP 导出 ======
const mono_get_root_domain = nf("mono_get_root_domain", "pointer", []);
const il2cpp_thread_attach = nf("il2cpp_thread_attach", "pointer", ["pointer"]);
const il2cpp_domain_assembly_open = nf("il2cpp_domain_assembly_open", "pointer", ["pointer", "pointer"]);
const il2cpp_assembly_get_image = nf("il2cpp_assembly_get_image", "pointer", ["pointer"]);
const il2cpp_class_from_name = nf("il2cpp_class_from_name", "pointer", ["pointer", "pointer", "pointer"]);
const il2cpp_class_get_method_from_name = nf("il2cpp_class_get_method_from_name", "pointer", ["pointer", "pointer", "int"]);
const il2cpp_class_get_methods = nf("il2cpp_class_get_methods", "pointer", ["pointer", "pointer"], false);
const il2cpp_method_get_name = nf("il2cpp_method_get_name", "pointer", ["pointer"], false);
const il2cpp_method_get_param_count = nf("il2cpp_method_get_param_count", "uint32", ["pointer"], false);

const method_get_pointer_ptr = Module.findExportByName(so, "il2cpp_method_get_pointer");
const il2cpp_method_get_pointer = method_get_pointer_ptr
    ? new NativeFunction(method_get_pointer_ptr, "pointer", ["pointer"])
    : null;

// ====== 全局映射 ======
const base = Module.findBaseAddress(so);
const methodEntries = [];   // [{ addr, name, argc, methodName }]
const exactAddrMap = {};    // "0x..." -> entry
const hookedAddrSet = {};

// ====== IL2CPP 访问 ======
function attachThread() {
    const domain = mono_get_root_domain();
    if (domain.isNull()) throw new Error("mono_get_root_domain returned NULL");
    il2cpp_thread_attach(domain);
    return domain;
}

function getImage(assemblyName) {
    const domain = attachThread();
    const asm = il2cpp_domain_assembly_open(domain, Memory.allocUtf8String(assemblyName));
    if (asm.isNull()) throw new Error("open assembly failed: " + assemblyName);

    const image = il2cpp_assembly_get_image(asm);
    if (image.isNull()) throw new Error("get image failed: " + assemblyName);

    return image;
}

function getClass(assemblyName, namespaceName, className) {
    const image = getImage(assemblyName);
    const klass = il2cpp_class_from_name(
        image,
        Memory.allocUtf8String(namespaceName),
        Memory.allocUtf8String(className)
    );
    if (klass.isNull()) throw new Error("class not found: " + namespaceName + "." + className);
    return klass;
}

function getMethodPointer(method) {
    if (il2cpp_method_get_pointer) {
        const p = il2cpp_method_get_pointer(method);
        if (p && !p.isNull()) return p;
    }
    return Memory.readPointer(method);
}

function findMethodByName(assemblyName, namespaceName, className, methodName, argc) {
    const klass = getClass(assemblyName, namespaceName, className);
    const method = il2cpp_class_get_method_from_name(
        klass,
        Memory.allocUtf8String(methodName),
        argc
    );
    if (method.isNull()) return null;
    const addr = getMethodPointer(method);
    if (!addr || addr.isNull()) return null;

    return {
        method: method,
        addr: addr,
        name: methodName,
        argc: argc,
        fullName: className + "." + methodName + "(argc=" + argc + ")"
    };
}

// ====== 建表 ======
function buildClassMethodMap(assemblyName, namespaceName, className) {
    if (!il2cpp_class_get_methods) {
        throw new Error("il2cpp_class_get_methods not exported");
    }

    const klass = getClass(assemblyName, namespaceName, className);
    const iter = Memory.alloc(Process.pointerSize);
    Memory.writePointer(iter, ptr(0));

    console.log("[+] building method map for", className);

    while (true) {
        const method = il2cpp_class_get_methods(klass, iter);
        if (method.isNull()) break;

        const methodName = il2cpp_method_get_name ? cs(il2cpp_method_get_name(method)) : "unknown";
        const argc = il2cpp_method_get_param_count ? il2cpp_method_get_param_count(method) : -1;
        const addr = getMethodPointer(method);

        if (!addr || addr.isNull()) continue;

        const entry = {
            addr: addr,
            name: className + "." + methodName + "(argc=" + argc + ")",
            methodName: methodName,
            argc: argc
        };

        methodEntries.push(entry);
        exactAddrMap[addr.toString()] = entry;

        console.log("[MAP]", addr, "=>", entry.name);
    }

    methodEntries.sort((a, b) => {
        if (a.addr.compare(b.addr) < 0) return -1;
        if (a.addr.compare(b.addr) > 0) return 1;
        return 0;
    });

    console.log("[+] method map size =", methodEntries.length);
}

// ====== 地址反查 ======
function resolveMethodByAddress(addr) {
    const exact = exactAddrMap[addr.toString()];
    if (exact) {
        return { entry: exact, delta: ptr(0) };
    }

    let best = null;
    for (let i = 0; i < methodEntries.length; i++) {
        const e = methodEntries[i];
        if (addr.compare(e.addr) >= 0) {
            best = e;
        } else {
            break;
        }
    }

    if (!best) return null;

    let delta = ptr(0);
    try {
        delta = addr.sub(best.addr);
    } catch (e) {
        delta = ptr(0);
    }

    // 给个保守范围，避免串到后面无关很远的函数
    // 0x3000 一般够用了；太远就不认
    try {
        if (delta.compare(ptr("0x3000")) > 0) {
            return null;
        }
    } catch (e) {}

    return { entry: best, delta: delta };
}

function formatFrame(addr) {
    let s = addr.toString();

    if (base && addr.compare(base) >= 0) {
        s += " offset=" + hexOff(addr, base);
    }

    const hit = resolveMethodByAddress(addr);
    if (hit) {
        let d = "0x0";
        try {
            d = hit.delta.toString();
        } catch (e) {}
        s += " => " + hit.entry.name + " + " + d;
        return s;
    }

    try {
        s += " " + DebugSymbol.fromAddress(addr);
    } catch (e) {}

    return s;
}

// ====== hook ======
function hookOne(entry) {
    const key = entry.addr.toString();
    if (hookedAddrSet[key]) return;
    hookedAddrSet[key] = true;

    console.log("[+] hook", entry.name, "@", entry.addr, "offset=" + hexOff(entry.addr, base));

    Interceptor.attach(entry.addr, {
        onEnter(args) {
            this.entry = entry;

            console.log("\n==================================================");
            console.log(">>> ENTER", entry.name);
            console.log("this =", args[0]);

            const argc = entry.argc;
            const toPrint = Math.min(argc, MAX_ARGS_TO_PRINT);
            for (let i = 1; i <= toPrint; i++) {
                console.log("arg" + i + " =", args[i]);
            }
        },
        onLeave(retval) {
            console.log("<<< LEAVE", entry.name, "ret=", retval);
        }
    });
}

function hookTargets() {
    let hit = 0;

    for (let i = 0; i < methodEntries.length; i++) {
        const e = methodEntries[i];
        if (TARGET_METHODS.indexOf(e.methodName) !== -1) {
            hookOne(e);
            hit++;
        }
    }

    console.log("[+] total hooked target methods =", hit);
}

// ====== 主逻辑 ======
setImmediate(function () {
    try {
        console.log("[+] base =", base);
        buildClassMethodMap(ASSEMBLY, NAMESPACE, CLASS_NAME);
        hookTargets();
        console.log("[+] ready");
    } catch (e) {
        console.log("[!] ERROR:", e);
    }
});

const BACKTRACE_METHODS = [
//   "CheckOverlapWithOtherBlocks"
   ];

function readArg(p) {
    if (!p || p.isNull()) return "NULL";

    try {
        // 尝试当 int
        const v = p.toInt32();
        if (v > -1000000 && v < 1000000) return v;
    } catch (e) {}

    try {
        // 尝试当字符串
        const s = Memory.readCString(p);
        if (s && s.length < 100) return '"' + s + '"';
    } catch (e) {}

    return p.toString();
}

function readRetval(retval) {
    return readArg(retval);
}

//
//'use strict';
//
//const base = Module.findBaseAddress("libil2cpp.so");
//const addr = base.add(0x0231AA8C);
//
//function readIl2CppString32(p) {
//    try {
//        if (!p || p.isNull()) return null;
//
//        const len = p.add(0x8).readS32();
//        if (len < 0 || len > 0x1000) return null;
//
//        return p.add(0xC).readUtf16String(len);
//    } catch (e) {
//        return null;
//    }
//}
//
//Interceptor.attach(addr, {
//    onEnter(args) {
//        const msg = readIl2CppString32(args[0]);
//
//        console.log("\n=== Debug.Log hit ===");
//        console.log("arg0 =", args[0], "msg =", msg);
//        console.log("arg1 =", args[1]);
//        console.log("arg2 =", args[2]);
//        console.log("arg3 =", args[3]);
//    }
//});