import "frida-il2cpp-bridge";

Il2Cpp.perform(() => {

    const image = Il2Cpp.domain.assembly("Assembly-CSharp").image;

    const exported = new Set<string>();
    const result: any[] = [];

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

    send({
        type: "il2cpp_dump",
        data: result
    });
});
