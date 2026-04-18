//import "frida-il2cpp-bridge";
//
//Il2Cpp.perform(() => {
//
//    console.log("[+] Tracing selected classes");
//
//    const assemblies = Il2Cpp.domain.assemblies;
//
//    for (const asm of assemblies) {
//        const image = asm.image;
//
//        for (const klass of image.classes) {
//
//            // ⭐ 可以在这里加过滤条件
//            if (klass.name.includes("Game") || klass.name.includes("Drag")) {
//
//                console.log("[+] Hook class:", klass.name);
//
//                Il2Cpp.trace(false)
//                    .classes(klass)
//                    .and()
//                    .attach();
//            }
//        }
//    }
//});
//






//import "frida-il2cpp-bridge";
//
//Il2Cpp.perform(() => {
//
//    console.log("\n🔥 Hook EaseCurve___ctor START");
//
//    // 找类
//    const klass = Il2Cpp.domain
//        .assemblies
//        .map(a => a.image)
//        .flatMap(img => img.classes)
//        .find(c => c.name.includes("EaseCurve"));
//
//    if (!klass) {
//        console.log("❌ EaseCurve class not found");
//        return;
//    }
//
//    const ctor = klass.methods.find(m => m.name.includes(".ctor"));
//
//    if (!ctor) {
//        console.log("❌ EaseCurve ctor not found");
//        return;
//    }
//
//    console.log("🎯 Found ctor at:", ctor.virtualAddress);
//
//    ctor.implementation = function (thisPtr, a2) {
//
//        console.log("\n==============================");
//        console.log("🔥 EaseCurve___ctor called");
//
//        console.log("this =", thisPtr);
//        console.log("a2 (curve source) =", a2);
//        console.log("==============================");
//
//        try {
//            const obj = Il2Cpp.Object.from(thisPtr);
//
//            console.log("\n📦 Dump EaseCurve fields:");
//
//            obj.$class.fields.forEach(f => {
//                try {
//                    const val = obj.field(f.name).value;
//                    console.log(`   ${f.name} =`, val);
//                } catch (e) {}
//            });
//
//        } catch (e) {
//            console.log("⚠️ dump failed:", e);
//        }
//
//        const ret = ctor.invoke(thisPtr, a2);
//
//        console.log("==============================\n");
//
//        return ret;
//    };
//
//    console.log("✅ Hook installed");
//});
//
//
//
//
//
//
//
//












//import "frida-il2cpp-bridge";
////
////Il2Cpp.perform(() => {
////
////    const targets = [
//////        "DG.Tweening.ShortcutExtensions",
//////        "DG.Tweening.TweenSettingsExtensions",
//////        "DG.Tweening.Core.Easing.EaseManager",
////        "GameAnimationController"
////    ];
////
////    for (const asm of Il2Cpp.domain.assemblies) {
////
////        for (const klass of asm.image.classes) {
////
////            if (targets.includes(klass.fullName)) {
////
////                console.log("🎯 TRACE:", klass.fullName);
////
////                Il2Cpp.trace(true)
////                    .classes(klass)
////                    .and()
////                    .attach();
////            }
////        }
////    }
////});
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
////import "frida-il2cpp-bridge";
////
////Il2Cpp.perform(() => {
////
////
////    for (const asm of Il2Cpp.domain.assemblies) {
////
////        try {
////            const klass = asm.image.tryClass("DG.Tweening.TweenSettingsExtensions");
////                   Il2Cpp.trace(true)
////                         .classes(klass)
////                         .and()
////                          .attach();
//////            if (klass) {
//////                console.log("🎯 FOUND IN:", asm.name);
//////                console.log("class:", klass.name);
//////
//////                klass.methods.forEach(m => {
//////                    console.log("👉", m.name);
//////                });
//////            }
////
////        } catch (e) {}
////    }
////});
//
//
////import "frida-il2cpp-bridge";
////Il2Cpp.perform(() => {
////
////
////const easeManager = Il2Cpp.domain
////    .assembly("DOTween")
////    .image
////    .class("DG.Tweening.Core.Easing.EaseManager");
////
////       Il2Cpp.trace(true)
////                         .classes(easeManager)
////                         .and()
////                          .attach();
////}
////);
//
//
//import "frida-il2cpp-bridge";
//Il2Cpp.perform(() => {
//
//    for (const asm of Il2Cpp.domain.assemblies) {
//        try {
//            const klass = asm.image.class("DG.Tweening.ShortcutExtensions");
//
//            if (klass) {
//                console.log("[+] Found ShortcutExtensions in:", asm.name);
//
////                klass.methods.forEach(m => {
////                    console.log("👉", m.name);
////                });
//                     Il2Cpp.trace(true)
//                         .classes(klass)
//                         .and()
//                          .attach();
//            }
//
//        } catch (e) {}
//    }
//});
//
//////import "frida-il2cpp-bridge";
//////
//////
//////Il2Cpp.perform(() => {
//////
//////
//////
//////
//////
////////    console.log("[+] Tracing Unity Animation related classes");
////////
////////    const image = Il2Cpp.domain
////////    .assembly("UnityEngine.CoreModule")
////////    .image;
////////
////////for (const klass of image.classes) {
////////
////////    const name = klass.name || "";
////////
////////    if (
////////        name.includes("Animation") ||
////////        name.includes("Animator") ||
////////        name.includes("Playable") ||
////////        name.includes("Curve")
////////    ) {
////////        console.log(`[+] Found: UnityEngine.${name}`);
////////
////////        Il2Cpp.trace(true)
////////         .classes(klass)
////////         .and()
////////          .attach();
////////
////////    }
////////}
//////});
////
////
//import "frida-il2cpp-bridge";
//
//Il2Cpp.perform(() => {
//
//    const klass = Il2Cpp.domain
//        .assembly("DOTween")   // ⭐ 有些项目是 Assembly-CSharp，要注意
//        .image
//        .class("DG.Tweening.TweenSettingsExtensions");
//
//    console.log("[+] Class:", klass.name);
//
//    const methods = klass.methods;
//
//    console.log(`[+] Method count: ${methods.length}`);
//    Il2Cpp.trace(false)
//     .classes(klass)
//      .and()
//      .attach();
//
////    methods.forEach(m => {
////        try {
////            console.log(
////                `👉 ${m.name}(` +
////                m.parameters.map(p => p.type.name).join(", ") +
////                `) : ${m.returnType.name}`
////            );
////        } catch (e) {
////            console.log("⚠️ parse method error:", e);
////        }
////    });
//});






//import "frida-il2cpp-bridge";
//
//
//Il2Cpp.perform(() => {
//
//
//    const klass = Il2Cpp.domain
//        .assembly("Assembly-CSharp")
//        .image
//        .class("GameAnimationController");
//
//    const method = klass.method("DoMove");
//
//    console.log("[+] Hook method:", method.name);
//
////    Il2Cpp.trace(true)
////        .methods(method)
////        .and()
////        .attach();
//
//function dumpHex(ptr, size = 0x60) {
//    console.log("\n========================");
//    console.log("🔥 HEX DUMP:", ptr);
//    console.log("========================");
//
//    let line = "";
//
//    for (let i = 0; i < size; i++) {
//
//        const byte = Memory.readU8(ptr.add(i));
//        line += byte.toString(16).padStart(2, "0") + " ";
//
//        if ((i + 1) % 16 === 0) {
//            console.log(i.toString(16).padStart(4, "0"), ":", line);
//            line = "";
//        }
//    }
//}
//
//function scanFloats(ptr, size = 0x60) {
//
//    console.log("\n========================");
//    console.log("🔥 FLOAT SCAN");
//    console.log("========================");
//
//    const result = [];
//
//    for (let i = 0; i < size; i += 4) {
//
//        const f = Memory.readFloat(ptr.add(i));
//
//        // 过滤明显无效值
//        if (Math.abs(f) > 0.001 && Math.abs(f) < 1000) {
//            result.push({ offset: i, value: f });
//        }
//    }
//
//    result.forEach(r => {
//        console.log("offset:", r.offset.toString(16), "value:", r.value);
//    });
//
//    return result;
//}
//
//function tryDetectVector3(floatList) {
//
//    console.log("\n========================");
//    console.log("🔥 VECTOR CANDIDATES");
//    console.log("========================");
//
//    for (let i = 0; i < floatList.length - 2; i++) {
//
//        const a = floatList[i];
//        const b = floatList[i + 1];
//        const c = floatList[i + 2];
//
//        // 判断是否像 Vector3
//        if (
//            Math.abs(a.value) < 100 &&
//            Math.abs(b.value) < 100 &&
//            Math.abs(c.value) < 100
//        ) {
//            console.log(
//                `possible Vector3 @0x${a.offset.toString(16)} ->`,
//                `(${a.value.toFixed(2)}, ${b.value.toFixed(2)}, ${c.value.toFixed(2)})`
//            );
//        }
//    }
//}
//
//method.implementation = function (...args) {
//   const list = args[0];
//
//            const count = list.method("get_Count").invoke();
//            const getItem = list.method("get_Item");
//
//            console.log("\n========================");
//            console.log("🔥 DoMove triggered");
//            console.log("count =", count);
//
//            for (let i = 0; i < count; i++) {
//
//                const item = getItem.invoke(i);
//
//                const ptr = item.handle || item.address;
//
//                console.log("\n🔥 ITEM", i, "PTR =", ptr);
//
//                // 1️⃣ 原始内存
//                dumpHex(ptr, 0x60);
//
//                // 2️⃣ float扫描
//                const floats = scanFloats(ptr, 0x60);
//
//                // 3️⃣ 尝试识别Vector3
//                tryDetectVector3(floats);
//            }
//
//    return this.call(...args);
//};
//
//
//
//
//});


//import "frida-il2cpp-bridge";
//
//Il2Cpp.perform(function () {
//
//    console.log("\n==============================");
//    console.log("🔥 EaseFunction Hook Started");
//    console.log("==============================\n");
//
//    // =========================
//    // 🎯 IDA 地址
//    // =========================
////    var easeFunctionCtor = ptr("0x00D4876C");
////
////    Interceptor.attach(easeFunctionCtor, {
////
////        onEnter: function (args) {
////
////            this.self = args[0];
////            this.obj = args[1];
////            this.method = args[2];
////
////            console.log("\n====================");
////            console.log("🔥 EaseFunction___ctor CALLED");
////            console.log("====================");
////
////            console.log("this =", this.self);
////            console.log("curve obj =", this.obj);
////            console.log("method/table =", this.method);
////
////            // =========================
////            // 🧠 尝试解析曲线类型
////            // =========================
////            try {
////
////                var v = this.obj.toInt32();
////
////                console.log("curve raw =", v);
////
////                // Ease 映射（Unity常见）
////                var map = {
////                    0: "Linear",
////                    1: "InSine",
////                    2: "OutSine",
////                    3: "InOutSine",
////                    4: "InQuad",
////                    5: "OutQuad",
////                    6: "InOutQuad",
////                    7: "Bounce",
////                    8: "Elastic"
////                };
////
////                console.log("➡ curve =", map[v] || "Unknown");
////
////                // =========================
////                // 💣 作弊：强制 Linear（可选）
////                // =========================
////                // args[1] = ptr("0");
////
////            } catch (e) {
////                console.log("⚠ parse failed");
////            }
////        },
////
////        onLeave: function (retval) {
////            console.log("✔ EaseFunction created");
////            console.log("====================\n");
////        }
////    });
//
//Interceptor.attach(ptr("0x00D6ED38"), {
//    onEnter: function (args) {
//
//        console.log("\n🔥 EaseCurve ctor");
//
//        var curve = args[1];
//
//        console.log("animCurve =", curve);
//
//        // 💣 如果是 Unity AnimationCurve
//        try {
//            console.log(Il2Cpp.stringify(curve));
//        } catch (e) {}
//    }
//});
//    console.log("✔ Hook attached:", easeFunctionCtor);
//});

//import "frida-il2cpp-bridge";
//
//    console.log("\n==============================");
//    console.log("🔥 Track CLASS FULL TRACE");
//    console.log("==============================\n");
//
//    // =========================
//    // 🎯 获取 Track 类
//    // =========================
//    var Track = Il2Cpp.domain
//        .assembly("DOTween")
//        .image
//        .class("EaseCurve");
//
//    console.log("✔ Track class found");
//
//    // =========================
//    // 🔥 遍历所有方法
//    // =========================
//    Track.methods.forEach(function (method) {
//
//        console.log("hooking:", method.name);
//
//        try {
//
//            Interceptor.attach(method.virtualAddress, {
//
//                onEnter: function (args) {
//
//                    console.log("\n====================");
//                    console.log("🔥 Track method called:", method.name);
//                    console.log("this =", args[0]);
//
//                    // =====================
//                    // 打印参数（最多3个）
//                    // =====================
//                    for (var i = 1; i <= 3; i++) {
//                        try {
//                            console.log("arg" + i + " =", args[i]);
//                        } catch (e) {}
//                    }
//                },
//
//                onLeave: function (retval) {
//                    console.log("return =", retval);
//                    console.log("====================\n");
//                }
//            });
//
//        } catch (e) {
//            console.log("❌ hook failed:", method.name, e);
//        }
//    });
//Il2Cpp.domain.assemblies.forEach(a => {
//    try {
//        a.image.classes.forEach(c => {
//            if (c.name.includes("Ease")) {
//                console.log(c.name, "in", a.name);
//            }
//        });
//    } catch (e) {}
//});

//
//import "frida-il2cpp-bridge";
//
//Il2Cpp.perform(() => {
//
//    console.log("\n==============================");
//    console.log("🔥 Ease System Trace Loop");
//    console.log("==============================\n");
//
//    Il2Cpp.domain.assemblies.forEach(a => {
//        a.image.classes.forEach(c => {
//
//            if (!(c.name.includes("Ease") || c.name.includes("Curve")))
//                return;
//
//            console.log("[FOUND CLASS]", a.name, "=>", c.name);
//
//            try {
//
//                Il2Cpp.trace(true)
//                    .classes(c)
//                    .and()
//                    .attach({
//                        onEnter(args) {
//
//                            console.log("\n====================");
//                            console.log("🔥 CLASS:", c.name);
//                            console.log("🔥 METHOD:", this.method.name);
//
//                            for (let i = 0; i < args.length; i++) {
//                                console.log("arg[" + i + "] =", args[i]);
//                            }
//                        },
//                        onLeave(retval) {
//                            console.log("return =", retval);
//                        }
//                    });
//
//                console.log("✔ traced:", c.name);
//
//            } catch (e) {
//                console.log("❌ trace failed:", c.name, e);
//            }
//        });
//    });
//
//});
//
//import "frida-il2cpp-bridge";
//
//Il2Cpp.perform(() => {
//
//    console.log("\n==============================");
//    console.log("🔥 AnimationCurve Keyframe Hook");
//    console.log("==============================\n");
//
//    const AnimationCurve = Il2Cpp.domain
//        .assembly("UnityEngine.CoreModule")
//        .image
//        .class("UnityEngine.AnimationCurve");
//
//    // =========================
//    // 1. length（关键：知道有多少 keyframe）
//    // =========================
//    AnimationCurve.method("get_length").implementation = function () {
//        const len = this.method("get_length").invoke();
//        console.log("\n[Curve length] =", len);
//        return len;
//    };
//
//    // =========================
//    // 2. get_Item（关键：每个 keyframe）
//    // =========================
//    AnimationCurve.method("get_Item").implementation = function (index) {
//
//        const key = this.method("get_Item").invoke(index);
//
//        console.log("\n==============================");
//        console.log("🔥 KEYFRAME INDEX =", index);
//
//        // UnityEngine.Keyframe结构（常见字段）
//        try {
//            console.log("time  =", key.time);
//            console.log("value =", key.value);
//            console.log("inTangent  =", key.inTangent);
//            console.log("outTangent =", key.outTangent);
//        } catch (e) {
//            console.log("❌ keyframe parse failed:", e);
//        }
//
//        return key;
//    };
//
//});
import "frida-il2cpp-bridge";

Il2Cpp.perform(() => {

    console.log("\n==============================");
    console.log("🔥 DOTween FULL FIXED HOOK");
    console.log("==============================\n");

    // =========================================================
    // 🎯 1. AnimationCurve Keyframe（安全版）
    // =========================================================
//    try {
//        const AC = Il2Cpp.domain
//            .assembly("UnityEngine.CoreModule")
//            .image
//            .class("UnityEngine.AnimationCurve");
//
//        AC.method("get_length").implementation = function () {
//            const len = this.method("get_length").invoke();
//            console.log("\n[Curve length] =", len);
//            return len;
//        };
//
//        AC.method("get_Item").implementation = function (i) {
//
//            const k = this.method("get_Item").invoke(i);
//
//            console.log("\n==============================");
//            console.log("🔥 KEYFRAME INDEX =", i);
//
//            try {
//                console.log("time      =", k.field("m_Time").value);
//                console.log("value     =", k.field("m_Value").value);
//                console.log("inTan     =", k.field("m_InTangent").value);
//                console.log("outTan    =", k.field("m_OutTangent").value);
//            } catch (e) {
//                console.log("❌ keyframe read failed:", e);
//            }
//
//            return k;
//        };
//
//        console.log("✔ AnimationCurve hooked");
//    } catch (e) {
//        console.log("❌ AnimationCurve not found:", e);
//    }
//

    // =========================================================
    // 🎯 2. EaseCurve ctor（正确 hook）
    // =========================================================
    try {
        const EaseCurve = Il2Cpp.domain
            .assembly("DOTween")
            .image
            .class("DG.Tweening.Core.Easing.EaseCurve");

        EaseCurve.method(".ctor").implementation = function (...args) {

            console.log("\n==============================");
            console.log("🔥 EaseCurve::.ctor");

            try {
                const anim = args[0];
                console.log("AnimationCurve length =", anim?.method("get_length")?.invoke?.());
            } catch (e) {}

            // ❗正确调用 ctor（必须 this.method）
            return this.method(".ctor").invoke(this, ...args);
        };

        console.log("✔ EaseCurve ctor hooked");
    } catch (e) {
        console.log("❌ EaseCurve not found:", e);
    }


    // =========================================================
    // 🎯 3. EaseCurve Evaluate
    // =========================================================
    try {
        const EaseCurve = Il2Cpp.domain
            .assembly("DOTween")
            .image
            .class("DG.Tweening.Core.Easing.EaseCurve");

        EaseCurve.methods.forEach(m => {
            if (m.name === "Evaluate") {

                const orig = m.implementation;

                m.implementation = function (...args) {

                    console.log("\n==============================");
                    console.log("🔥 EaseCurve::Evaluate");

                    console.log("time     =", args[1]);
                    console.log("duration =", args[2]);

                    const ret = orig.apply(this, args);

                    console.log("result   =", ret);

                    return ret;
                };
            }
        });

        console.log("✔ EaseCurve Evaluate hooked");
    } catch (e) {
        console.log("❌ EaseCurve Evaluate not found:", e);
    }


    // =========================================================
    // 🎯 4. EaseManager Evaluate（修复参数 bug）
    // =========================================================
//    try {
//        const EaseManager = Il2Cpp.domain
//            .assembly("DOTween")
//            .image
//            .class("DG.Tweening.Core.Easing.EaseManager");
//
//        EaseManager.methods.forEach(m => {
//            if (m.name === "Evaluate") {
//
//                const orig = m.implementation;
//
//                m.implementation = function (...args) {
//
//                    console.log("\n==============================");
//                    console.log("🔥 EaseManager::Evaluate");
//
//                    console.log("easeType =", args[0]);
//                    console.log("custom   =", args[1]);
//                    console.log("time     =", args[2]);
//                    console.log("duration =", args[3]);
//                    console.log("amp      =", args[4]);
//                    console.log("period   =", args[5]);
//
//                    // ❗关键修复：不要再传 this
//                    const ret = orig.apply(this, args);
//
//                    console.log("result   =", ret);
//
//                    return ret;
//                };
//            }
//        });
//
//        console.log("✔ EaseManager Evaluate hooked");
//    } catch (e) {
//        console.log("❌ EaseManager not found:", e);
//    }

});