
import "frida-il2cpp-bridge";

const curveClass: any = Il2Cpp.domain
    .assembly("UnityEngine.CoreModule")
    .image
    .class("UnityEngine.AnimationCurve");

const eval = curveClass.methods.find((m: any) => m.name === "Evaluate")!;

eval.implementation = function (t: number) {

    console.log("\n🔥 REAL AnimationCurve Evaluate");

    console.log("this =", this);

    const result = eval.invoke(this, t);

    console.log("t =", t);
    console.log("value =", result);

    try {
        const keys = this.method("get_keys").invoke(this);

        console.log("📊 keys length =", keys.length);

        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            console.log(`key[${i}] time=${k.time} value=${k.value}`);
        }

    } catch (e) {
        console.log("❌ still no keys (not real AnimationCurve instance)");
    }

    return result;
};

// declare const console: any;
//
// Il2Cpp.perform(() => {
//
//     console.log("🔥 AnimationCurve Hook Start");
//
//     const curveClass: any = Il2Cpp.domain
//         .assembly("UnityEngine.CoreModule")
//         .image
//         .class("UnityEngine.AnimationCurve");
//
//     const evalMethod: any = curveClass.method("Evaluate");
// let count = 0;
//     evalMethod.implementation = function (this: any, ...args: any[]) {
//         const t = args[0];
//
//         const result = this.method("Evaluate").invoke(t);
//
//         console.log("\n======================");
//         console.log("📈 Curve Evaluate");
//         console.log("t =", t);
//         console.log("value =", result);
//         console.log("======================\n");
//
//             console.log("🔥 Evaluate #", count++, "t =", t, "value =", result);
//
//
//         return result;
//     };
//
// });

// import "frida-il2cpp-bridge";
//
// declare const console: any;
//
// Il2Cpp.perform(() => {
//
//     console.log("🔥 DOTween SetEase Hook Start");
//
//     let klass: any = null;
//
//     for (const asm of Il2Cpp.domain.assemblies) {
//
//         try {
//             klass = asm.image.class("DG.Tweening.TweenSettingsExtensions");
//             console.log("✅ Found in:", asm.name);
//             break;
//         } catch (e) {}
//     }
//
//     if (!klass) {
//         console.log("❌ TweenSettingsExtensions not found");
//         return;
//     }
//
//     const setEase = klass.methods.find((m: any) => m.name === "SetEase");
//
//     if (!setEase) {
//         console.log("❌ SetEase method not found");
//         return;
//     }
//
//     setEase.implementation = function (...args: any[]) {
//
//         const v = args[0];
//
//         console.log("\n======================");
//         console.log("🔥 SetEase called");
//
//         // Ease enum
//         if (typeof v === "number") {
//             console.log("🎯 Ease enum:", v);
//         }
//
//         // AnimationCurve
//         else if (v && v.keys) {
//
//             console.log("🎯 AnimationCurve:");
//
//             const keys = v.keys;
//             for (let i = 0; i < keys.length; i++) {
//                 const k = keys[i];
//                 console.log(
//                     `key[${i}] time=${k.time} value=${k.value}`
//                 );
//             }
//         }
//
//         console.log("======================\n");
//
//         return setEase.invoke(...args);
//     };
//
// });
//
// // import "frida-il2cpp-bridge";
// //
// // declare const console: any;
// //
// // Il2Cpp.perform(() => {
// //
// //     console.log("🔥 DOTween Full Hook Start");
// //
// //     // =========================
// //     // Ease 解析
// //     // =========================
// //     function getEaseName(e: number) {
// //         const map: any = {
// //             0: "Unset",
// //             1: "Linear",
// //             2: "InSine",
// //             3: "OutSine",
// //             4: "InOutSine",
// //             5: "InQuad",
// //             6: "OutQuad",
// //             7: "InOutQuad",
// //             8: "InCubic",
// //             9: "OutCubic",
// //             10: "InOutCubic",
// //             26: "OutBounce"
// //         };
// //         return map[e] ?? ("Unknown(" + e + ")");
// //     }
// //
// //     // =========================
// //     // AnimationCurve dump
// //     // =========================
// //     function dumpCurve(curve: any) {
// //         try {
// //             const keys = curve.keys;
// //
// //             console.log("📈 AnimationCurve:");
// //
// //             for (let i = 0; i < keys.length; i++) {
// //                 const k = keys[i];
// //                 console.log(
// //                     `  key[${i}] time=${k.time} value=${k.value} inT=${k.inTangent} outT=${k.outTangent}`
// //                 );
// //             }
// //         } catch (e) {
// //             console.log("❌ Curve parse failed");
// //         }
// //     }
// //
// //     // =========================
// //     // 找 ShortcutExtensions
// //     // =========================
// //     let klass: any = null;
// //
// //     for (const asm of Il2Cpp.domain.assemblies) {
// //         try {
// //             klass = asm.image.class("DG.Tweening.ShortcutExtensions");
// //             console.log("✅ Found in:", asm.name);
// //             break;
// //         } catch (e) {}
// //     }
// //
// //     if (!klass) {
// //         console.log("❌ ShortcutExtensions not found");
// //         return;
// //     }
// //
// //     // =========================
// //     // Hook 方法
// //     // =========================
// //     function hook(method: any) {
// //
// //         console.log("🎯 Hook:", method.name);
// //
// //         method.implementation = function (...args: any[]) {
// //
// //             console.log("\n======================");
// //             console.log("🔥 DOTween:", method.name);
// //
// //             // 打印参数 + 识别曲线
// //             for (let i = 0; i < args.length; i++) {
// //
// //                 const a = args[i];
// //
// //                 // 👉 Ease（通常是 number）
// //                 if (typeof a === "number") {
// //                     console.log(`arg[${i}] Ease =>`, getEaseName(a));
// //                     continue;
// //                 }
// //
// //                 // 👉 AnimationCurve
// //                 if (a && a.keys) {
// //                     console.log(`arg[${i}] AnimationCurve detected`);
// //                     dumpCurve(a);
// //                     continue;
// //                 }
// //
// //                 console.log(`arg[${i}] =`, a);
// //             }
// //
// //             // ⚠️ static method
// //             const ret = method.invoke(...args);
// //
// //             console.log("======================\n");
// //
// //             return ret;
// //         };
// //     }
// //
// //     // =========================
// //     // Hook list
// //     // =========================
// //     const targets = [
// //         "DOMove",
// //         "DOLocalMove",
// //         "DOLocalMoveY",
// //         "DORotate",
// //         "DOLocalRotate",
// //         "DOScale",
// //         "DOColor",
// //         "DOFade",
// //         "DOShakePosition",
// //         "DOShakeRotation",
// //         "DOShakeScale",
// //         "DOPath",
// //         "DOLocalPath",
// //         "DOKill"
// //     ];
// //
// //     klass.methods.forEach((m: any) => {
// //         if (targets.includes(m.name)) {
// //             hook(m);
// //         }
// //     });
// //
// // });
// //
// // import "frida-il2cpp-bridge";
// //
// // declare const console: any;
// //
// // Il2Cpp.perform(() => {
// //
// //     console.log("🔥 DOTween Curve Hook Start");
// //
// //     // =========================
// //     // Ease 名称映射（可扩展）
// //     // =========================
// //     function getEaseName(v: number) {
// //         const map: any = {
// //             0: "Unset",
// //             1: "Linear",
// //             2: "InSine",
// //             3: "OutSine",
// //             4: "InOutSine",
// //             5: "InQuad",
// //             6: "OutQuad",
// //             7: "InOutQuad",
// //             26: "OutBounce"
// //         };
// //         return map[v] ?? ("Unknown(" + v + ")");
// //     }
// //
// //     // =========================
// //     // AnimationCurve 打印
// //     // =========================
// //     function dumpCurve(curve: any) {
// //         try {
// //             const keys = curve.keys;
// //
// //             console.log("📈 AnimationCurve detected:");
// //             for (let i = 0; i < keys.length; i++) {
// //                 const k = keys[i];
// //                 console.log(
// //                     `  key[${i}] time=${k.time} value=${k.value} inT=${k.inTangent} outT=${k.outTangent}`
// //                 );
// //             }
// //         } catch (e) {
// //             console.log("❌ Curve parse failed");
// //         }
// //     }
// //
// //     // =========================
// //     // 找 Tween 类
// //     // =========================
// //     let tweenClass: any = null;
// //
// //     for (const asm of Il2Cpp.domain.assemblies) {
// //         try {
// //             tweenClass = asm.image.class("DG.Tweening.Tween");
// //             console.log("✅ Found Tween in:", asm.name);
// //             break;
// //         } catch (e) {}
// //     }
// //
// //     if (!tweenClass) {
// //         console.log("❌ Tween class not found");
// //         return;
// //     }
// //
// //     // =========================
// //     // Hook SetEase（核心）
// //     // =========================
// //     const setEase = tweenClass.methods.find((m: any) => m.name === "SetEase");
// //
// //     if (!setEase) {
// //         console.log("❌ SetEase not found");
// //         return;
// //     }
// //
// //     console.log("🎯 Hook SetEase OK");
// //
// //     setEase.implementation = function (...args: any[]) {
// //
// //         console.log("\n======================");
// //         console.log("🔥 SetEase called");
// //
// //         const easeArg = args[0];
// //
// //         // =========================
// //         // 情况1：Ease enum
// //         // =========================
// //         if (typeof easeArg === "number") {
// //             console.log("🎯 Ease:", getEaseName(easeArg));
// //         }
// //
// //         // =========================
// //         // 情况2：AnimationCurve
// //         // =========================
// //         else if (easeArg && easeArg.keys) {
// //             console.log("🎯 Custom AnimationCurve:");
// //             dumpCurve(easeArg);
// //         }
// //
// //         // =========================
// //         // fallback
// //         // =========================
// //         else {
// //             console.log("🎯 Unknown ease:", easeArg);
// //         }
// //
// //         console.log("======================\n");
// //
// //         return setEase.invoke(...args);
// //     };
// //
// // });