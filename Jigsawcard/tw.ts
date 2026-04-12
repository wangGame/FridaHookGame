// import "frida-il2cpp-bridge";
//
// Il2Cpp.perform(() => {
//
//     const AnimationCurve = Il2Cpp.domain
//         .assembly("UnityEngine.CoreModule")
//         .image
//         .class("UnityEngine.AnimationCurve");
//
//     const Evaluate = AnimationCurve.method("Evaluate");
//
// Evaluate.implementation = function (...args: any[]) {
//
//
//         const time = args[0] as number;
//
//         const self = this as Il2Cpp.Object;
//
//         const result = Evaluate.invoke(self, time);
//
//         console.log("time:", time, "result:", result);
//
//         return result;
// };
//
// });



// import "frida-il2cpp-bridge";
//
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
//// //

// import "frida-il2cpp-bridge";
//
// Il2Cpp.perform(() => {
//
//     const AnimationCurve = Il2Cpp.domain
//         .assembly("UnityEngine.CoreModule")
//         .image
//         .class("UnityEngine.AnimationCurve");
//
//     const Evaluate = AnimationCurve.method("Evaluate");
//
//     Evaluate.implementation = function (...args: any[]) {
//
//         const time = args[0];
//
//         const self = this as Il2Cpp.Object;
//
//
//
//       const result = this.method("Evaluate").invoke(time);
//         console.log("🔥 curve time:", time, "result:", result);
//         return result;
//     };
//
// });

import "frida-il2cpp-bridge";

Il2Cpp.perform(() => {

    const Curve = Il2Cpp.domain
        .assembly("UnityEngine.CoreModule")
        .image
        .class("UnityEngine.AnimationCurve");

    Curve.methods.forEach(m => {

        const name = m.name;

        try {

            // 🎯 核心计算
            if (name === "Evaluate") {
                m.implementation = function (...args: any[]) {

                    const t = args[0];
                    const self = this as Il2Cpp.Object;

                    const result = m.invoke(self, t);

                    console.log("🔥 Evaluate:", t, "=>", result);

                    return result;
                };
            }

            // 🎯 曲线修改
            if (
                name.includes("Key") ||
                name === "set_keys" ||
                name === "get_keys"
            ) {
                m.implementation = function (...args: any[]) {

                    console.log("📊 Curve modify:", name);

                    return m.invoke(this as Il2Cpp.Object, ...args);
                };
            }

            // 🎯 构造
            if (name === ".ctor") {
                m.implementation = function (...args: any[]) {

                    console.log("🆕 Curve created");

                    return m.invoke(this as Il2Cpp.Object, ...args);
                };
            }

        } catch (e) {
            // 有些方法不能 hook（IL2CPP优化/inline）
        }
    });

});