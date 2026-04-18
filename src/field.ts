// import "frida-il2cpp-bridge";
//
// Il2Cpp.perform(() => {
//
//     const result: any[] = [];
//     const exported = new Set<string>();
//
//     const targetAssemblies = [
//         "Assembly-CSharp",
// //         "mscorlib"
//     ];
//
//     targetAssemblies.forEach(name => {
//
//         try {
//             const assembly = Il2Cpp.domain.assembly(name);
//             console.log(assembly)
//             if (!assembly) return;
//
//             const image = assembly.image;
//
//             image.classes.forEach(c => {
//
//                 // =========================
//                 // 1) dump Fields（成员字段）
//                 // =========================
//                 try {
//                     c.fields.forEach(f => {
//                         // 有些包 strip 后 name/type 可能不完整，但 offset 往往还在
//                         const cleanClass = c.name.replace(/[^a-zA-Z0-9_]/g, "_");
//                         const cleanField = (f.name ?? "field").replace(/[^a-zA-Z0-9_]/g, "_");
//
//                         result.push({
//                             kind: "field",
//                             assembly: name,
//                             namespace: c.namespace,
//                             class: c.name,
//                             field: f.name,
//                             fieldType: f.type?.name,
//                             offset: f.offset,           // 重点：字段偏移
//                             name: `${cleanClass}__${cleanField}`,
//                         });
//                     });
//                 } catch (e) {
//                     // 某些桥接版本/类可能 fields 访问异常，忽略即可
//                 }
//
//                 // ==========================================
//                 // 2) dump Properties（用 get_/set_ 识别）
//                 // ==========================================
//                 // 注意：property 本质是方法（get_XXX / set_XXX）
//                 // 这里不额外存一份 properties，只做标记也可以
//                 const isGetterSetter = (mn: string) =>
//                     mn.startsWith("get_") || mn.startsWith("set_");
//
//                 // =========================
//                 // 3) dump Methods（你的原逻辑）
//                 // =========================
//                 c.methods.forEach(m => {
//
//                     if (!m.virtualAddress) return;
//
//                     const va = m.virtualAddress as NativePointer;
//
//                     let module;
//                     try {
//                         module = Process.findModuleByAddress(va);
//                     } catch {
//                         return;
//                     }
//                     if (!module) return;
//
//                     const key = va.toString();
//                     if (exported.has(key)) return;
//                     exported.add(key);
//
//                     const rva = va.sub(module.base);
//
//                     const cleanClass = c.name.replace(/[^a-zA-Z0-9_]/g, "_");
//                     const cleanMethod = m.name.replace(/[^a-zA-Z0-9_]/g, "_");
//                     const newName = `${cleanClass}__${cleanMethod}`;
//
//                     result.push({
//                         kind: isGetterSetter(m.name) ? "property_method" : "method",
//                         module: module.name,
//                         assembly: name,
//                         namespace: c.namespace,
//                         class: c.name,
//                         method: m.name,
//                         name: newName,
//                         va: va.toString(),
//                         rva: parseInt(rva.toString(), 16)
//                     });
//
//                 });
//
//             });
//
//         } catch (e) {
//             console.log("[!] Error loading assembly:", name, e);
//         }
//
//     });
//
//     console.log("[+] Dump finished. Total:", result.length);
//
//     send({
//         type: "il2cpp_dump_with_fields",
//         data: result
//     });
//
// });


// import "frida-il2cpp-bridge";
//
// Il2Cpp.perform(() => {
//
//     const targetAssemblies = [
//         "Assembly-CSharp"
//     ];
//
//     targetAssemblies.forEach(name => {
//
//         try {
//             const assembly = Il2Cpp.domain.assembly(name);
//             if (!assembly) return;
//
//             console.log("\n===============================");
//             console.log("Assembly:", name);
//             console.log("===============================\n");
//
//             const image = assembly.image;
//
//             image.classes.forEach(c => {
//
//                 console.log("\n----------------------------------");
//                 console.log("Class:", c.namespace, c.name);
//                 console.log("----------------------------------");
//
//                 // ===== Fields =====
//                 if (c.fields.length > 0) {
//                     console.log("  [Fields]");
//                     c.fields.forEach(f => {
//                         console.log(
//                             "   -",
//                             f.name,
//                             "| type:", f.type?.name,
//                             "| offset:", "0x" + f.offset.toString(16)
//                         );
//                     });
//                 }
//
//                 // ===== Methods =====
//                 if (c.methods.length > 0) {
//                     console.log("  [Methods]");
//                     c.methods.forEach(m => {
//
//                         const tag =
//                             m.name.startsWith("get_") ? "[GET]" :
//                             m.name.startsWith("set_") ? "[SET]" :
//                             "     ";
//
//                         console.log(
//                             "   ",
//                             tag,
//                             m.name,
//                             "| RVA:",
//                             m.relativeVirtualAddress
//                         );
//                     });
//                 }
//
//             });
//
//         } catch (e) {
//             console.log("[!] Error loading assembly:", name, e);
//         }
//
//     });
//
//     console.log("\n[+] Dump finished.\n");
//
// });


// field.ts  (TypeScript, frida-compile 可直接过)
// 目标：同时导出 Fields(实例字段 offset>0) + Methods(带 isStatic/returnType/params/签名文本)，并 send 回 Python
import "frida-il2cpp-bridge";

Il2Cpp.perform(() => {
  const result: any[] = [];
  const exported = new Set<string>();

  const targetAssemblies = [
    "Assembly-CSharp",
    // "mscorlib",
  ];

  // 过滤掉噪音：匿名类型/泛型定义类（<>c, List`1 等），它们字段 offset 经常是 0
  const FILTER_NOISY_TYPES = true;

  function sanitize(s: string): string {
    return (s || "").replace(/[^a-zA-Z0-9_]/g, "_");
  }

  function isNoisyClassName(name: string): boolean {
    if (!FILTER_NOISY_TYPES) return false;
    return name.includes("<") || name.includes(">") || name.includes("`");
  }

  function typeName(t: any): string {
    // 不依赖 TS 定义：运行时有啥拿啥
    try {
      return (t?.fullName ?? t?.name ?? "") as string;
    } catch {
      return "";
    }
  }

  function getFieldOffset(f: any): number {
    // 不同版本 bridge 字段名不同，做 fallback
    const off =
      (typeof f.offset === "number" ? f.offset : undefined) ??
      (typeof f.fieldOffset === "number" ? f.fieldOffset : undefined) ??
      (typeof f.instanceOffset === "number" ? f.instanceOffset : undefined) ??
      0;
    return off | 0;
  }

  function getFieldIsStatic(f: any): boolean {
    const v =
      (typeof f.isStatic === "boolean" ? f.isStatic : undefined) ??
      (typeof f.static === "boolean" ? f.static : undefined) ??
      (typeof f.flags?.isStatic === "boolean" ? f.flags.isStatic : undefined) ??
      false;
    return !!v;
  }

  function getMethodParams(m: any): any[] {
    try {
      if (Array.isArray(m.parameters)) return m.parameters;
    } catch {}
    try {
      if (typeof m.parameterCount === "number" && typeof m.parameter === "function") {
        const arr: any[] = [];
        for (let i = 0; i < m.parameterCount; i++) arr.push(m.parameter(i));
        return arr;
      }
    } catch {}
    return [];
  }

  function methodSignatureText(m: any): string {
    // 不依赖 m.signature（TS 类型里可能没有），用 String(m) 最稳
    try {
      const sig = (m as any).signature;
      if (typeof sig === "string" && sig.length) return sig;
    } catch {}
    try {
      return String(m);
    } catch {
      return "";
    }
  }

  for (const asmName of targetAssemblies) {
    try {
      const assembly = Il2Cpp.domain.assembly(asmName);
      if (!assembly) continue;

      const image = assembly.image;
      console.log(`[+] Scanning ${asmName} classes=${image.classes.length}`);

      for (const c of image.classes) {
        const clsName = c.name || "";
        if (FILTER_NOISY_TYPES && isNoisyClassName(clsName)) continue;

        const ns = c.namespace || "";
        const declaringType = ns ? `${ns}.${clsName}` : clsName;

        // -------------------------
        // Fields (实例字段 only)
        // -------------------------
        try {
          for (const f of c.fields) {
            const isStatic = getFieldIsStatic(f);
            const off = getFieldOffset(f);

            // 只保留：实例字段 且 offset>0
            if (isStatic) continue;
            if (off <= 0) continue;

            const cleanClass = sanitize(clsName);
            const cleanField = sanitize(f.name ?? "field");

            result.push({
              kind: "field",
              assembly: asmName,
              namespace: ns,
              class: clsName,
              declaringType,
              field: f.name ?? "",
              fieldType: typeName(f.type),
              offset: off,
              isStatic: false,
              name: `${cleanClass}__${cleanField}`,
            });
          }
        } catch {
          // ignore
        }

        // -------------------------
        // Methods
        // -------------------------
        for (const m of c.methods) {
          const va = m.virtualAddress as NativePointer | null;
          if (!va || va.isNull()) continue;

          let module: Module | null = null;
          try {
            module = Process.findModuleByAddress(va);
          } catch {
            module = null;
          }
          if (!module) continue;

          const key = va.toString();
          if (exported.has(key)) continue;
          exported.add(key);

          const rva = va.sub(module.base);

          const cleanClass = sanitize(clsName);
          const cleanMethod = sanitize(m.name || "");
          const newName = `${cleanClass}__${cleanMethod}`;

          const ps = getMethodParams(m).map((p: any, idx: number) => ({
            name: (p?.name ?? `arg${idx}`) as string,
            type: typeName(p?.type),
          }));

          result.push({
            kind: "method",
            module: module.name,
            assembly: asmName,
            namespace: ns,
            class: clsName,
            declaringType,
            method: m.name || "",
            name: newName,

            isStatic: !!(m as any).isStatic,
            returnType: typeName((m as any).returnType),
            params: ps,
            paramCount: ps.length,

            va: va.toString(),
            rva: parseInt(rva.toString(), 16),

            signature: methodSignatureText(m),
          });
        }
      }
    } catch (e) {
      console.log("[!] Error loading assembly:", asmName, e);
    }
  }

  console.log("[+] Dump finished. Total items:", result.length);

  send({
    type: "il2cpp_dump_with_fields_v2",
    data: result,
  });
});