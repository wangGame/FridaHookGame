import "frida-il2cpp-bridge";
// Il2Cpp.perform(function () {
//     var klass = Il2Cpp.domain.assembly("Assembly-CSharp")
//         .image
//         .class("Effect_Ribbons_L");
//
//     var method = klass.method("Create");
//
//     console.log("addr =", method.virtualAddress);
//
//     Interceptor.attach(method.virtualAddress, {
//         onEnter: function (args) {
//             console.log("Create called");
//             console.log("this =", args[0]);
//         }
//     });
// });

// Il2Cpp.perform(() => {
//     Il2Cpp.domain.assemblies.forEach(a => {
//         console.log(a.name);
//     });
// });

// Il2Cpp.perform(() => {
//     const assembly = Il2Cpp.domain.assemblies
//     .find(a => a.name === "Assembly-CSharp");
//
// if (!assembly) {
//     console.log("Assembly-CSharp not found!");
//     return;
// }
//
// const image = assembly.image;
//
// image.classes.forEach(klass => { if (klass.name.includes("Ribbon") || klass.name.includes("Effect")) { console.log(klass.name); }})
//
// });


// Il2Cpp.perform(() => {
//     const assembly = Il2Cpp.domain.assemblies
//         .find(a => a.name === "Assembly-CSharp")!;
//
//     assembly.image.classes.forEach(klass => {
//         if (klass.name.includes("Ribbon")) {
//             console.log("name =", klass.name);
//             console.log("namespace =", klass.namespace);
//             console.log("full =", klass.namespace + "." + klass.name);
//         }
//     });
// });

Il2Cpp.perform(() => {

    const assembly = Il2Cpp.domain.assemblies
        .find(a => a.name === "Assembly-CSharp")!;

    // ✅ 使用完整类名
    const klass = assembly.image.class("PluginNotifier__NotifyPieceLinked");

    // 🔍 如果不确定是否有重载，可以先打印
    klass.methods.forEach(m => {
        if (m.name === "Create") {
            console.log("Create found:", m.parameterCount, m.virtualAddress);
        }
    });

    // 👉 选择正确方法（一般无参）
    const method = klass.methods.find(m => m.name === "Create")!;

    console.log("🎯 hook addr =", method.virtualAddress);

    Interceptor.attach(method.virtualAddress, {
        onEnter(args) {
            console.log("🔥 Effect_Ribbons_L.Create called");
            console.log("this =", args[0]);
        },
        onLeave(retval) {
            console.log("Create end");
        }
    });

});