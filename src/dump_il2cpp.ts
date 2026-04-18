import "frida-il2cpp-bridge";

Il2Cpp.perform(() => {

    const image = Il2Cpp.domain.assembly("Assembly-CSharp").image;

    image.classes.forEach(c => {

        c.methods.forEach(m => {

            console.log(
                c.name,
                m.name,
                "VA:",
                m.virtualAddress,
                "RVA:",
                m.relativeVirtualAddress
            );

        });

    });

});
// 需要和 frida-il2cpp-bridge.js 放在同目录
// 用法: frida -H 127.0.0.1:1234 -F -l trace_il2cpp.js

// 'use strict';
//
// import "frida-il2cpp-bridge";
//
// //
// //
// // //
// // // import "frida-il2cpp-bridge";
// // //
// // Il2Cpp.perform(() => {
// //
// //     const Game = Il2Cpp.domain
// //         .assembly("Assembly-CSharp")
// //         .image
// //         .class("Game");
// //
// //     const method = Game.method("NotifyEndDrag");
// //
// //     console.log("[+] Hooking Game::NotifyEndDrag");
// //
// //     method.implementation = function (...args: any[]) {
// //
// //         const link = args[0];          // ⚠ 不要 as NativePointer
// //         const isValidMove = args[1] as boolean;
// //
// //         console.log("======== NotifyEndDrag ========");
// //         console.log("isValidMove =", isValidMove);
// //
// //         try {
// //
// //             if (link) {
// //
// //                 // link 本身就是 Il2Cpp.Object
// //                 const hashSetObj = link;
// //
// //                 const enumerator = hashSetObj
// //                     .method("GetEnumerator")
// //                     .invoke();
// //
// //                 while (enumerator.method("MoveNext").invoke()) {
// //
// //                     const current =
// //                         enumerator.method("get_Current").invoke();
// //
// //                     console.log("Element:", current);
// //                 }
// //             }
// //
// //         } catch (e) {
// //             console.log("[!] HashSet read error:", e);
// //         }
// //
// //         return this.method("NotifyEndDrag").invoke(...args);
// //     };
// //
// //     console.log("[+] Hook Installed");
// // });
//
//
// // import "frida-il2cpp-bridge";
// //
// // Il2Cpp.perform(() => {
// //
// //     const Game = Il2Cpp.domain
// //         .assembly("Assembly-CSharp")
// //         .image
// //         .class("Game");
// //
// //     console.log("[+] Tracing all Game methods");
// //
// //     Il2Cpp.trace(true)
// //         .classes(Game)
// //         .and()
// //         .attach();
// // });
//
// //
// // import "frida-il2cpp-bridge";
// //
// // Il2Cpp.perform(() => {
// //
// //     const Game = Il2Cpp.domain
// //         .assembly("Assembly-CSharp")
// //         .image
// //         .class("Game");
// //
// //     const method = Game.method("NotifyEndDrag");
// //
// //     const addr = method.virtualAddress;
// //
// //     console.log("Function address:", addr);
// //
// //     const size = 0x200; // 读取 0x200 字节汇编
// //
// //     console.log(
// //         Instruction.parse(addr).toString()
// //     );
// //
// //     console.log(
// //         Instruction.parse(addr.add(4)).toString()
// //     );
// //
// // });
// //
//
// //
// // import "frida-il2cpp-bridge";
// //
// // Il2Cpp.perform(() => {
// //
// //     const Game = Il2Cpp.domain
// //         .assembly("Assembly-CSharp")
// //         .image
// //         .class("Game");
// //
// //     const method = Game.method("NotifyEndDrag");
// //     const target = method.virtualAddress;
// //
// //     console.log("Hooking at:", target);
// //
// //     Interceptor.attach(target, {
// //         onEnter(args) {
// //
// //             console.log("=== Enter NotifyEndDrag ===");
// //
// //             Stalker.follow(this.threadId, {
// //                 events: {
// //                     call: true,
// //                     ret: false,
// //                     exec: true,
// //                     block: false,
// //                     compile: false
// //                 },
// //                 onReceive(events) {
// //                     const parsed = Stalker.parse(events);
// //
// //                     parsed.forEach(event => {
// //                         if (event.type === "exec") {
// //                             try {
// //                                 const ins = Instruction.parse(event.address);
// //                                 console.log(event.address + "  " + ins.toString());
// //                             } catch {}
// //                         }
// //
// //                         if (event.type === "call") {
// //                             console.log("CALL -> " + event.target);
// //                         }
// //                     });
// //                 }
// //             });
// //         },
// //
// //         onLeave(retval) {
// //             console.log("=== Leave NotifyEndDrag ===");
// //             Stalker.unfollow(this.threadId);
// //             Stalker.garbageCollect();
// //         }
// //     });
// //
// // });
//
//
//
// import "frida-il2cpp-bridge";
//
// Il2Cpp.perform(() => {
//
//     const Game = Il2Cpp.domain
//         .assembly("Assembly-CSharp")
//         .image
//         .class("Game");
//
//     const method = Game.method("NotifyEndDrag");
//     const target = method.virtualAddress;
//
//     console.log("Hooking at:", target);
//
//     Interceptor.attach(target, {
//
//     onEnter(args) {
//
//         Stalker.follow(this.threadId, {
//             events: {
//                 call: true,
//                 exec: true
//             },
//
//             onReceive(rawEvents) {
//
//                 const events = Stalker.parse(rawEvents);
//
//                 for (let i = 0; i < events.length; i++) {
//
//                     const ev: any = events[i];
//
//                     const type = ev[0];
//
//                     if (type === "exec") {
//                         const addr = ev[1];
//                         try {
//                             const ins = Instruction.parse(addr);
//                             console.log(addr + "  " + ins);
//                         } catch {}
//                     }
//
//                     if (type === "call") {
//                         console.log("CALL -> " + ev[1]);
//                     }
//                 }
//             }
//         });
//     },
//
//     onLeave() {
//         Stalker.unfollow(this.threadId);
//         Stalker.garbageCollect();
//     }
// });
//
//
// });
//

//
// // import "frida-il2cpp-bridge";
// // interface CpuContext {
// //     r0: NativePointer;
// //     r1: NativePointer;
// //     r2: NativePointer;
// //     r3: NativePointer;
// //     r4: NativePointer;
// //     r5: NativePointer;
// //     r6: NativePointer;
// //     r7: NativePointer;
// //     r8: NativePointer;
// //     r9: NativePointer;
// //     r10: NativePointer;
// //     r11: NativePointer;
// //     r12: NativePointer;
// //     sp: NativePointer;
// //     lr: NativePointer;
// //     pc: NativePointer;
// // }
// // import "frida-il2cpp-bridge";
// //
// // Il2Cpp.perform(() => {
// //
// //     const loopAddr = ptr("0x845efdb8");
// //
// //     Interceptor.attach(loopAddr, {
// //
// //         onEnter(args) {
// //
// //             const ctx: any = this.context;   // ⚠ any 绕过 TS 类型检查
// //
// //             const r4 = ctx.r4;   // 循环变量 i
// //             const r6 = ctx.r6;   // List对象
// //
// //             try {
// //                 const count = r6.add(4).readU32();
// //                 const arrayPtr = r6.readPointer();
// //                 const element = arrayPtr.add(r4.toInt32() * 4).readPointer();
// //
// //                 console.log("---- Loop State ----");
// //                 console.log("i =", r4);
// //                 console.log("count =", count);
// //                 console.log("arrayPtr =", arrayPtr);
// //                 console.log("element =", element);
// //                 console.log("--------------------");
// //
// //             } catch (e) {
// //                 console.log("[!] error reading memory:", e);
// //             }
// //
// //         }
// //     });
// //
// // });

//
// import "frida-il2cpp-bridge";
//
// function safeTypeName(t: any): string {
//     try {
//         // frida-il2cpp-bridge 的 type 对象通常有 .name / .fullName
//         return (t?.fullName ?? t?.name ?? String(t)) as string;
//     } catch {
//         return "";
//     }
// }
//
// function sanitize(s: string): string {
//     return (s || "").replace(/[^a-zA-Z0-9_]/g, "_");
// }
//
// Il2Cpp.perform(() => {
//     const result: any[] = [];
//     const exported = new Set<string>();
//
//     const targetAssemblies = [
//         "Assembly-CSharp",
//         // "UnityEngine.CoreModule",
//         // "UnityEngine.UI",
//         // "System",
//         // "mscorlib",
//     ];
//
//     for (const asmName of targetAssemblies) {
//         let assembly: any;
//         try {
//             assembly = Il2Cpp.domain.assembly(asmName);
//         } catch (e) {
//             console.log(`[!] Cannot load assembly: ${asmName} -> ${e}`);
//             continue;
//         }
//         if (!assembly) continue;
//
//         const image = assembly.image;
//         console.log(`[+] Scanning image: ${asmName} classes=${image.classes.length}`);
//
//         for (const c of image.classes) {
//             // 组合一个更稳定的类标识
//             const namespace = c.namespace || "";
//             const className = c.name || "";
//             const declaringType = namespace ? `${namespace}.${className}` : className;
//
//             for (const m of c.methods) {
//                 // 注意：virtualAddress 为空说明可能是抽象/泛型未实例化/或被裁剪
//                 const va: NativePointer | null = (m.virtualAddress ?? null) as any;
//                 if (!va || va.isNull()) continue;
//
//                 let module: Module | null = null;
//                 try {
//                     module = Process.findModuleByAddress(va);
//                 } catch {
//                     module = null;
//                 }
//                 if (!module) continue;
//
//                 const key = va.toString();
//                 if (exported.has(key)) continue;
//                 exported.add(key);
//
//                 const rva = va.sub(module.base);
//
//                 // 方法名清洗，用来给 IDA 命名
//                 const cleanClass = sanitize(className);
//                 const cleanMethod = sanitize(m.name || "");
//                 const newName = `${cleanClass}__${cleanMethod}`;
//
//                 // 是否 static / 返回值 / 参数
//                 let isStatic = false;
//                 try { isStatic = !!(m.isStatic); } catch {}
//
//                 let returnType = "";
//                 try { returnType = safeTypeName(m.returnType); } catch {}
//
//                 let params: { name: string; type: string }[] = [];
//                 let paramCount = 0;
//
//                 // frida-il2cpp-bridge 不同版本：m.parameters 或 m.parameterCount + m.parameter(i)
//                 try {
//                     if (Array.isArray((m as any).parameters)) {
//                         const ps = (m as any).parameters;
//                         paramCount = ps.length;
//                         params = ps.map((p: any, idx: number) => ({
//                             name: (p?.name ?? `arg${idx}`) as string,
//                             type: safeTypeName(p?.type),
//                         }));
//                     } else if (typeof (m as any).parameterCount === "number" && typeof (m as any).parameter === "function") {
//                         paramCount = (m as any).parameterCount;
//                         for (let i = 0; i < paramCount; i++) {
//                             const p = (m as any).parameter(i);
//                             params.push({
//                                 name: (p?.name ?? `arg${i}`) as string,
//                                 type: safeTypeName(p?.type),
//                             });
//                         }
//                     } else if (typeof (m as any).parameterCount === "number" && Array.isArray((m as any).parameters)) {
//                         // 冗余保护
//                         const ps = (m as any).parameters;
//                         paramCount = ps.length;
//                         params = ps.map((p: any, idx: number) => ({
//                             name: (p?.name ?? `arg${idx}`) as string,
//                             type: safeTypeName(p?.type),
//                         }));
//                     }
//                 } catch {
//                     // ignore
//                 }
//
//                 // 尝试拿到更完整的签名字符串（若 bridge 提供）
//                 let signature = "";
//                 try {
//                     // 有些版本 m.signature / m.toString() 会包含参数/返回值
//                     signature = (m.signature ?? "") as string;
//                     if (!signature) signature = String(m);
//                 } catch {
//                     signature = "";
//                 }
//
//                 result.push({
//                     module: module.name,
//                     image: asmName,
//                     namespace,
//                     class: className,
//                     declaringType,
//                     method: m.name,
//                     name: newName,
//                     isStatic,
//                     returnType,
//                     params,
//                     paramCount,
//                     va: va.toString(),
//                     rva: parseInt(rva.toString(), 16),
//                     // 这个字段很适合做 IDA SetType 的来源
//                     signature,
//                 });
//             }
//         }
//     }
//
//     console.log(`[+] Dump finished. Total methods exported: ${result.length}`);
//
//     // 发回 python 端保存为 json
//     send({
//         type: "il2cpp_dump_v2",
//         data: result,
//     });
//
//     // 如需在控制台抽样打印几条：
//     // result.slice(0, 10).forEach(x => console.log(x.declaringType, x.method, x.rva, x.signature));
// });