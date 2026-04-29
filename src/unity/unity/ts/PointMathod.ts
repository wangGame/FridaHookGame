import "frida-il2cpp-bridge";

Il2Cpp.perform(() => {
    const image = Il2Cpp.domain.assembly("Assembly-CSharp").image;
    const Game = image.class("Game");

    const method: any = (Game as any).methods
        .find((m: any) => m.name.includes("CalculateShapeMatch"));

    console.log(`[+] Hook ${Game.name}::${method.name}`);
    console.log(`[+] VA = ${method.virtualAddress}`);
    console.log(`[+] Ret = ${method.returnType.name}`);

    const params: any[] = method.parameters ?? [];
    params.forEach((p, i) => {
        console.log(`  Param[${i}] ${p.name}: ${p.type.name}`);
    });

    Interceptor.attach(method.virtualAddress, {
        onEnter(args) {
            console.log("==============================");
            console.log("[+] Game::CalculateShapeMatch");

            // native 层：
            // args[0] = this / static unused
            // args[1] = 第一个真实 C# 参数
            // args[2] = MethodInfo*/RuntimeMethod*
            console.log(`[raw] this/a0      = ${args[0]}`);
            console.log(`[raw] param0/a1    = ${args[1]}`);
            console.log(`[raw] methodInfo/a2 = ${args[2]}`);

            // 先不要 new Il2Cpp.Object(args[1])
            // 先确认 args[1] 是不是对象指针、int、struct 指针
        },

        onLeave(retval) {
            console.log(`[ret raw] ${retval}`);
            console.log(`[ret int] ${retval.toInt32()}`);
        }
    });
});
// import "frida-il2cpp-bridge";
//
// Il2Cpp.perform(() => {
//     const image = Il2Cpp.domain.assembly("Assembly-CSharp").image;
//     const Game = image.class("Game");
//
//     const methods: any[] = (Game as any).methods;
//
//     methods
//         .filter(m => m.name.includes("CalculateShapeMatch"))
//         .forEach(m => {
//             console.log("==============================");
//             console.log(`[+] ${Game.name}::${m.name}`);
//             console.log(`[+] VA: ${m.virtualAddress}`);
//             console.log(`[+] RVA: ${m.relativeVirtualAddress}`);
//             console.log(`[+] Static: ${m.isStatic}`);
//             console.log(`[+] ReturnType: ${m.returnType.name}`);
//
//             const params: any[] = (m as any).parameters ?? [];
//             console.log(`[+] ParamCount: ${params.length}`);
//
//             params.forEach((p, i) => {
//                 console.log(`  Param[${i}] ${p.name}: ${p.type.name}`);
//             });
//         });
// });
// import "frida-il2cpp-bridge";
//
// Il2Cpp.perform(() => {
//
//     const klass = Il2Cpp.domain
//         .assembly("Assembly-CSharp")
//         .image
//         .class("Game");
//
// //     Il2Cpp.trace(true)
// //         .assemblies(Il2Cpp.domain.assembly("Assembly-CSharp"))
// //         .filterMethods(m =>
// // //             m.name.includes("SmartMatch")
// // //                 ||m.name.includes("FindConnect")
// // //                 ||m.name.includes("CalculateShapeMatch")
// // //                 || m.name.includes("CanFitCompletely")
// // //                 ||
// //                 m.name.includes("CalculateShapeMatch")
// //                 )
// //         .and()
// //         .attach();
//
//
//         Il2Cpp.trace(true)
//             .assemblies(Il2Cpp.domain.assembly("Assembly-CSharp"))
//             .filterMethods(m => m.name.includes("CalculateShapeMatch")
//
//
//                     )
//             .and()
//             .attach();
//
// //     Il2Cpp.trace(true)
// //         .assemblies(Il2Cpp.domain.assembly("Assembly-CSharp"))
// //         .filterMethods(m => m.name.includes("CalculateBlockPriority")
// //                 ||m.name.includes("CanFitCompletely")
// //                 ||m.name.includes("CalculateShapeMatch")
// //                 )
// //         .and()
// //         .attach();
// });
//
