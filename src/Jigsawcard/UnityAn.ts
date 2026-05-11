import "frida-il2cpp-bridge";

declare const console: any;

Il2Cpp.perform(() => {

    console.log("🔥 DOTween Trace Start");

    // =========================
    // 配置
    // =========================

    // 每个方法最多完整打印多少次
    const MAX_PRINT_PER_METHOD = 20;

    // 高频方法超过 MAX 后，每隔多少次打印一次
    const PRINT_EVERY_AFTER_LIMIT = 200;

    // 是否打印参数
    const PRINT_ARGS = true;

    // 是否打印返回值
    const PRINT_RET = false;

    const callCount: any = {};

    // =========================
    // 工具函数
    // =========================

    function shortClassName(cls: any) {
        try {
            const ns = cls.namespace;
            const name = cls.name;
            if (ns && ns.length > 0) return ns + "." + name;
            return name;
        } catch (e) {
            return "UnknownClass";
        }
    }

    function methodSignature(m: any) {
        try {
            const params = m.parameters
                .map((p: any) => {
                    try {
                        return p.type.name + " " + p.name;
                    } catch (e) {
                        return "?";
                    }
                })
                .join(", ");

            const ret = (() => {
                try {
                    return m.returnType.name;
                } catch (e) {
                    return "void";
                }
            })();

            return `${ret} ${m.name}(${params})`;
        } catch (e) {
            return `${m.name}(?)`;
        }
    }

    function fmtValue(v: any): string {
        try {
            if (v === null) return "null";
            if (v === undefined) return "undefined";

            const t = typeof v;

            if (t === "number" || t === "boolean" || t === "bigint") {
                return String(v);
            }

            if (t === "string") {
                return `"${v}"`;
            }

            // Il2Cpp.Object
            try {
                if (v.class && v.handle) {
                    let clsName = shortClassName(v.class);
                    return `${clsName}@${v.handle}`;
                }
            } catch (e) {}

            // NativePointer
            try {
                if (v.isNull !== undefined) {
                    return `${v}`;
                }
            } catch (e) {}

            return String(v);
        } catch (e) {
            return "<fmt failed>";
        }
    }

    function shouldPrint(key: string): boolean {
        if (callCount[key] === undefined) {
            callCount[key] = 0;
        }

        callCount[key]++;

        const n = callCount[key];

        if (n <= MAX_PRINT_PER_METHOD) return true;
        if (n % PRINT_EVERY_AFTER_LIMIT === 0) return true;

        return false;
    }

    function findClass(className: string): any {
        for (const asm of Il2Cpp.domain.assemblies) {
            try {
                return asm.image.class(className);
            } catch (e) {}
        }
        return null;
    }

  function invokeOriginal(method: any, self: any, args: any[]) {

    if (method.isStatic) {
        return method.invoke(...args);
    }

    return method.invoke(self, ...args);
}

    // =========================
    // 方法过滤
    // =========================

    function shouldHook(className: string, methodName: string): boolean {

        // 跳过属性 getter，太吵
        if (methodName.startsWith("get_")) return false;

        // Tween / Tweener / Sequence 基础方法
        const commonNames = [
            ".ctor",
            "Play",
            "Pause",
            "Restart",
            "Rewind",
            "Kill",
            "Complete",
            "Goto",
            "Flip",
            "ForceInit",
            "IsActive",
            "IsPlaying",
            "Elapsed",
            "ElapsedPercentage",
            "Duration"
        ];

        if (commonNames.indexOf(methodName) >= 0) return true;

        // DOTween 静态创建方法
        if (className === "DG.Tweening.DOTween") {
            if (methodName === "To") return true;
            if (methodName === "Sequence") return true;
            if (methodName === "DelayedCall") return true;
            if (methodName === "Kill") return true;
            if (methodName === "Play") return true;
            if (methodName === "Pause") return true;
            if (methodName === "Restart") return true;
            if (methodName === "Clear") return true;
            if (methodName === "Init") return true;
            return false;
        }

        // ShortcutExtensions: DOMove / DOScale / DOFade / DOColor / DORotate 等
        if (className.indexOf("DG.Tweening.ShortcutExtensions") >= 0) {
            if (methodName.startsWith("DO")) return true;
            return false;
        }

        // TweenSettingsExtensions: SetEase / SetDelay / SetLoops / OnComplete 等
        if (className === "DG.Tweening.TweenSettingsExtensions") {
            if (methodName.startsWith("Set")) return true;
            if (methodName.startsWith("On")) return true;
            if (methodName === "From") return true;
            return false;
        }

        // TweenExtensions: Play/Kill/Pause/Restart 等
        if (className === "DG.Tweening.TweenExtensions") {
            if (commonNames.indexOf(methodName) >= 0) return true;
            return false;
        }

        // TweenParams
        if (className === "DG.Tweening.TweenParams") {
            if (methodName.startsWith("Set")) return true;
            if (methodName.startsWith("On")) return true;
            if (methodName === ".ctor") return true;
            return false;
        }

        // Sequence 相关
        if (className === "DG.Tweening.Sequence") {
            if (methodName === ".ctor") return true;
            return false;
        }

        if (className === "DG.Tweening.TweenSettingsExtensions") {
            if (methodName === "Append") return true;
            if (methodName === "Join") return true;
            if (methodName === "Insert") return true;
            if (methodName === "Prepend") return true;
            if (methodName === "AppendCallback") return true;
            if (methodName === "InsertCallback") return true;
        }

        // TweenManager / EaseManager 底层
        if (className === "DG.Tweening.Core.TweenManager") {
            const names = [
                "AddActiveTween",
                "Despawn",
                "Update",
                "DoGoto",
                "Complete",
                "Kill",
                "ForceInit",
                "FilteredOperation",
                "TotalPlayingTweens"
            ];
            return names.indexOf(methodName) >= 0;
        }

        if (className === "DG.Tweening.Core.Easing.EaseManager") {
            if (methodName === "Evaluate") return true;
            return false;
        }

        return false;
    }

    // =========================
    // Hook 单个类
    // =========================

    function hookClass(className: string) {
        const cls = findClass(className);

        if (!cls) {
            console.log("⚠️ Class not found:", className);
            return;
        }

        console.log("✅ Found class:", className);

        for (const m of cls.methods) {
            const methodName = m.name;

            if (!shouldHook(className, methodName)) {
                continue;
            }

            const sig = methodSignature(m);
            const key = `${className}.${sig}`;

            try {
                console.log("🎯 Hook:", key);

                m.implementation = function (...args: any[]) {

                    const print = shouldPrint(key);
                    const index = callCount[key];

                    if (print) {
                        console.log("\n==============================");
                        console.log(`🔥 [${index}] ${className}.${sig}`);

//                         try {
// //                             console.log("this =", fmtValue(this));
//                         } catch (e) {}

                        if (PRINT_ARGS) {
                            for (let i = 0; i < args.length; i++) {
                                console.log(`arg[${i}] = ${fmtValue(args[i])}`);
                            }
                        }
                    }

                    const ret = invokeOriginal(m, this, args);

                    if (print && PRINT_RET) {
                        console.log("ret =", fmtValue(ret));
                    }

                    if (print) {
                        console.log("==============================\n");
                    }

                    return ret;
                };

            } catch (e) {
                console.log("❌ Hook failed:", key, e);
            }
        }
    }

    // =========================
    // 目标类
    // =========================

    const targetClasses = [
        "DG.Tweening.DOTween",

        // 常见扩展类
        "DG.Tweening.ShortcutExtensions",
        "DG.Tweening.ShortcutExtensions46",
        "DG.Tweening.ShortcutExtensions43",
        "DG.Tweening.ShortcutExtensionsTMPText",
        "DG.Tweening.ShortcutExtensionsTextMeshPro",
        "DG.Tweening.ShortcutExtensionsModuleUI",
        "DG.Tweening.ShortcutExtensionsModulePhysics",
        "DG.Tweening.ShortcutExtensionsModulePhysics2D",
        "DG.Tweening.ShortcutExtensionsModuleSprite",
        "DG.Tweening.ShortcutExtensionsModuleAudio",

        // 设置 / 控制
        "DG.Tweening.TweenSettingsExtensions",
        "DG.Tweening.TweenExtensions",
        "DG.Tweening.TweenParams",

        // 基础类
        "DG.Tweening.Tween",
        "DG.Tweening.Tweener",
        "DG.Tweening.Sequence",

        // 底层
        "DG.Tweening.Core.TweenManager",
        "DG.Tweening.Core.Easing.EaseManager"
    ];

    for (const clsName of targetClasses) {
        hookClass(clsName);
    }

    console.log("✅ DOTween Trace Ready");
});
// import "frida-il2cpp-bridge";
//
// declare const console: any;
//
// Il2Cpp.perform(() => {
//
//     console.log("🔥 Hook DOTween SetEase Start");
//
//     function findClass(className: string): any {
//         for (const asm of Il2Cpp.domain.assemblies) {
//             try {
//                 return asm.image.class(className);
//             } catch (e) {}
//         }
//         return null;
//     }
//
//     function getEaseName(e: number) {
//         const map: any = {
//             0: "Unset",
//             1: "Linear",
//             2: "InSine",
//             3: "OutSine",
//             4: "InOutSine",
//             5: "InQuad",
//             6: "OutQuad",
//             7: "InOutQuad",
//             8: "InCubic",
//             9: "OutCubic",
//             10: "InOutCubic",
//             11: "InQuart",
//             12: "OutQuart",
//             13: "InOutQuart",
//             14: "InQuint",
//             15: "OutQuint",
//             16: "InOutQuint",
//             17: "InExpo",
//             18: "OutExpo",
//             19: "InOutExpo",
//             20: "InCirc",
//             21: "OutCirc",
//             22: "InOutCirc",
//             23: "InElastic",
//             24: "OutElastic",
//             25: "InOutElastic",
//             26: "InBack",
//             27: "OutBack",
//             28: "InOutBack",
//             29: "InBounce",
//             30: "OutBounce",
//             31: "InOutBounce",
//             32: "Flash",
//             33: "InFlash",
//             34: "OutFlash",
//             35: "InOutFlash",
//             36: "INTERNAL_Zero",
//             37: "INTERNAL_Custom"
//         };
//         return map[e] ?? `Unknown(${e})`;
//     }
//
//     function hookSetEaseClass(className: string) {
//         const cls = findClass(className);
//
//         if (!cls) {
//             console.log(`❌ not found: ${className}`);
//             return;
//         }
//
//         console.log(`✅ Found ${className}`);
//
//         for (const m of cls.methods) {
//             if (m.name !== "SetEase") continue;
//
//             const sig = m.parameters.map((p: any) => p.type.name).join(", ");
//             console.log(`🎯 Hook ${className}.SetEase(${sig})`);
//
//             m.implementation = function (...args: any[]) {
//
//                 console.log("\n==============================");
//                 console.log(`🔥 ${className}.SetEase called`);
//                 console.log("signature:", `SetEase(${sig})`);
//
//                 for (let i = 0; i < args.length; i++) {
//                     console.log(`arg[${i}] =`, args[i]);
//                 }
//
//                 // TweenSettingsExtensions.SetEase(tween, Ease ease)
//                 // 一般 arg[0] 是 Tween，arg[1] 是 Ease
//                 if (args.length >= 2 && typeof args[1] === "number") {
//                     console.log("Ease =", args[1], getEaseName(args[1]));
//                 }
//
//                 console.log("==============================\n");
//
//                 return m.invoke(...args);
//             };
//         }
//     }
//
//     hookSetEaseClass("DG.Tweening.TweenSettingsExtensions");
//     hookSetEaseClass("DG.Tweening.TweenParams");
//
//     console.log("✅ Hook DOTween SetEase Ready");
// });
// // import "frida-il2cpp-bridge";
// //
// // declare const console: any;
// //
// // Il2Cpp.perform(() => {
// //
// //     console.log("🔥 Find SetEase Start");
// //
// //     for (const asm of Il2Cpp.domain.assemblies) {
// //         try {
// //             for (const klass of asm.image.classes) {
// //                 for (const m of klass.methods) {
// //                     if (m.name === "SetEase") {
// //                         const sig = m.parameters.map((p: any) => p.type.name).join(", ");
// //                         console.log(`🎯 ${asm.name} :: ${klass.name}.${m.name}(${sig})`);
// //                     }
// //                 }
// //             }
// //         } catch (e) {}
// //     }
// //
// //     console.log("✅ Find SetEase End");
// // });
// // // import "frida-il2cpp-bridge";
// // //
// // // declare const console: any;
// // //
// // // Il2Cpp.perform(() => {
// // //
// // //     console.log("🔥 Hook AnimationCurve ctor Start");
// // //
// // //     function findClass(className: string): any {
// // //         for (const asm of Il2Cpp.domain.assemblies) {
// // //             try {
// // //                 return asm.image.class(className);
// // //             } catch (e) {}
// // //         }
// // //         return null;
// // //     }
// // //
// // //     // =========================
// // //     // 读取 Keyframe 字段
// // //     // =========================
// // //     function readField(obj: any, names: string[]) {
// // //         for (const n of names) {
// // //             try {
// // //                 return obj.field(n).value;
// // //             } catch (e) {}
// // //
// // //             try {
// // //                 if (obj[n] !== undefined) return obj[n];
// // //             } catch (e) {}
// // //         }
// // //         return undefined;
// // //     }
// // //
// // //     function dumpKeyframe(k: any, index: number) {
// // //         try {
// // //             const time = readField(k, ["m_Time", "time"]);
// // //             const value = readField(k, ["m_Value", "value"]);
// // //             const inTangent = readField(k, ["m_InTangent", "inTangent"]);
// // //             const outTangent = readField(k, ["m_OutTangent", "outTangent"]);
// // //             const weightedMode = readField(k, ["m_WeightedMode", "weightedMode"]);
// // //             const inWeight = readField(k, ["m_InWeight", "inWeight"]);
// // //             const outWeight = readField(k, ["m_OutWeight", "outWeight"]);
// // //
// // //             console.log(
// // //                 `  key[${index}] time=${time}, value=${value}, inTangent=${inTangent}, outTangent=${outTangent}, weightedMode=${weightedMode}, inWeight=${inWeight}, outWeight=${outWeight}`
// // //             );
// // //         } catch (e) {
// // //             console.log(`  key[${index}] dump failed`, k);
// // //         }
// // //     }
// // //
// // //     function dumpKeyframeArray(arr: any) {
// // //         if (!arr) {
// // //             console.log("  Keyframe[] = null");
// // //             return;
// // //         }
// // //
// // //         try {
// // //             const len = arr.length;
// // //             console.log(`  Keyframe[] length = ${len}`);
// // //
// // //             for (let i = 0; i < len; i++) {
// // //                 const k = arr.get(i);
// // //                 dumpKeyframe(k, i);
// // //             }
// // //         } catch (e) {
// // //             console.log("  ❌ dump Keyframe[] failed:", e);
// // //         }
// // //     }
// // //
// // //     function dumpCurve(curveObj: any) {
// // //         try {
// // //             const keys = curveObj.method("get_keys").invoke();
// // //             console.log("📈 AnimationCurve keys after ctor:");
// // //             dumpKeyframeArray(keys);
// // //         } catch (e) {
// // //             console.log("❌ dump curve after ctor failed:", e);
// // //         }
// // //     }
// // //
// // //     // =========================
// // //     // Hook AnimationCurve 构造
// // //     // =========================
// // //     const curveKlass = findClass("UnityEngine.AnimationCurve");
// // //
// // //     if (!curveKlass) {
// // //         console.log("❌ UnityEngine.AnimationCurve not found");
// // //         return;
// // //     }
// // //
// // //     console.log("✅ Found UnityEngine.AnimationCurve");
// // //
// // //     curveKlass.methods.forEach((m: any) => {
// // //         if (m.name !== ".ctor") return;
// // //
// // //         const sig = m.parameters
// // //             .map((p: any) => p.type.name)
// // //             .join(", ");
// // //
// // //         console.log("🎯 Hook AnimationCurve ctor:", `.ctor(${sig})`);
// // //
// // //         m.implementation = function (...args: any[]) {
// // //
// // //             console.log("\n==============================");
// // //             console.log("🔥 AnimationCurve .ctor called");
// // //             console.log("signature:", `.ctor(${sig})`);
// // //             console.log("this =", this);
// // //
// // //             for (let i = 0; i < args.length; i++) {
// // //                 console.log(`arg[${i}] =`, args[i]);
// // //
// // //                 // new AnimationCurve(Keyframe[] keys)
// // //                 if (sig.includes("Keyframe") || sig.includes("Keyframe[]")) {
// // //                     console.log(`arg[${i}] maybe Keyframe[]:`);
// // //                     dumpKeyframeArray(args[i]);
// // //                 }
// // //             }
// // //
// // //             // 重点：构造函数是非 static，必须传 this
// // //             const ret = m.invoke(this, ...args);
// // //
// // //             dumpCurve(this);
// // //
// // //             console.log("==============================\n");
// // //
// // //             return ret;
// // //         };
// // //     });
// // //
// // // });
// // // // import "frida-il2cpp-bridge";
// // // //
// // // //
// // // // const Curve = Il2Cpp.domain
// // // //     .assembly("UnityEngine.CoreModule")
// // // //     .image
// // // //     .class("UnityEngine.AnimationCurve");
// // // //
// // // // Curve.methods.forEach((m: any) => {
// // // //
// // // //     if (m.name === "set_keys" || m.name === "SetKeys") {
// // // //
// // // //         console.log("🎯 Hook AnimationCurve keys setter:", m.name);
// // // //
// // // //         m.implementation = function (...args: any[]) {
// // // //
// // // //             console.log("\n🔥 AnimationCurve keys assigned");
// // // //
// // // //             const keys = args[0];
// // // //
// // // //             console.log("keys =", keys);
// // // //
// // // //             return m.invoke(...args);
// // // //         };
// // // //     }
// // // // });
// // // // // const Keyframe = Il2Cpp.domain.assembly("UnityEngine.CoreModule")
// // // // //     .image
// // // // //     .class("UnityEngine.Keyframe");
// // // // //
// // // // // const ctors = Keyframe.methods.filter(m => m.name === ".ctor");
// // // // //
// // // // // ctors.forEach((ctor: any) => {
// // // // //
// // // // //     console.log("🎯 Hook Keyframe ctor:", ctor.name);
// // // // //
// // // // //     ctor.implementation = function (...args: any[]) {
// // // // //
// // // // //         console.log("\n======================");
// // // // //         console.log("🔥 Keyframe created");
// // // // //
// // // // //         console.log("args:", args);
// // // // //
// // // // //         // 常见结构：
// // // // //         // time, value, inTangent, outTangent
// // // // //
// // // // //         console.log(`time=${args[0]} value=${args[1]}`);
// // // // //
// // // // //         if (args.length > 2) {
// // // // //             console.log(`inTangent=${args[2]} outTangent=${args[3]}`);
// // // // //         }
// // // // //
// // // // //         const ret = ctor.invoke(...args);
// // // // //
// // // // //         console.log("======================\n");
// // // // //
// // // // //         return ret;
// // // // //     };
// // // // // });