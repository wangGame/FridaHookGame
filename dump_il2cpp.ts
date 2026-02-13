import "frida-il2cpp-bridge";

Il2Cpp.perform(() => {

    const result: any[] = [];
    const exported = new Set<string>();

    const targetAssemblies = [
//         "Assembly-CSharp"
//         "UnityEngine.CoreModule"
//         "UnityEngine.UI"
//          "System"
         "mscorlib"
    ];

    targetAssemblies.forEach(name => {

        try {
            const assembly = Il2Cpp.domain.assembly(name);
            if (!assembly) return;

            const image = assembly.image;

            image.classes.forEach(c => {

                c.methods.forEach(m => {

                    if (!m.virtualAddress) return;

                    const va = m.virtualAddress as NativePointer;

                    let module;
                    try {
                        module = Process.findModuleByAddress(va);
                    } catch {
                        return;
                    }

                    if (!module) return;

                    const key = va.toString();
                    if (exported.has(key)) return;
                    exported.add(key);

                    const rva = va.sub(module.base);

                    const cleanClass = c.name.replace(/[^a-zA-Z0-9_]/g, "_");
                    const cleanMethod = m.name.replace(/[^a-zA-Z0-9_]/g, "_");

                    const newName = `${cleanClass}__${cleanMethod}`;

                    result.push({
                        module: module.name,
                        namespace: c.namespace,
                        class: c.name,
                        method: m.name,
                        name: newName,
                        rva: parseInt(rva.toString(), 16)
                    });

                });

            });

        } catch (e) {
            console.log("[!] Error loading assembly:", name);
        }

    });

    console.log("[+] Dump finished. Total:", result.length);

    send({
        type: "il2cpp_dump",
        data: result
    });

});
