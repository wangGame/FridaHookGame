import "frida-il2cpp-bridge";

setImmediate(() => {
    Il2Cpp.perform(() => {
        console.log("[+] IL2CPP ready");
        const exported = new Set<string>();
        const targetAssemblies = [
            "mscorlib"  // 只 dump 游戏逻辑
        ];

        targetAssemblies.forEach(name => {

            try {

                const assembly = Il2Cpp.domain.assembly(name);
                if (!assembly) {
                    console.log("[-] Assembly not found:", name);
                    return;
                }

                const image = assembly.image;

                console.log("[+] Dumping:", name);

                image.classes.forEach(c => {

                    const batch: any[] = [];

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

                        // 只导出 libil2cpp.so 里的
                        if (module.name.indexOf("libil2cpp") === -1) return;

                        const key = va.toString();
                        if (exported.has(key)) return;
                        exported.add(key);

                        const rva = va.sub(module.base);

                        const cleanClass = c.name.replace(/[^a-zA-Z0-9_]/g, "_");
                        const cleanMethod = m.name.replace(/[^a-zA-Z0-9_]/g, "_");

                        batch.push({
                            namespace: c.namespace,
                            class: c.name,
                            method: m.name,
                            name: `${cleanClass}__${cleanMethod}`,
                            rva: parseInt(rva.toString(), 16)
                        });

                    });

                    if (batch.length > 0) {
                        send({
                            type: "batch",
                            data: batch
                        });
                    }

                });

            } catch (e) {
                console.log("[!] Error:", name);
            }
        });
        send({ type: "done" });
        console.log("[+] Dump finished");
    });
});
