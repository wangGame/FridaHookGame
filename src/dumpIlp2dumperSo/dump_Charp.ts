import "frida-il2cpp-bridge";

type DumpParam = {
    name: string;
    type: string;
};

type DumpField = {
    name: string;
    type: string;
    isStatic: boolean;
    offset: number;
};

type DumpMethod = {
    name: string;
    rva: number;
    returnType: string;
    params: DumpParam[];
    isStatic: boolean;
};

type DumpClass = {
    namespace: string;
    class: string;
    parent: string;

    classPtr: string;   // ✅ 类地址

    fields: DumpField[];
    methods: DumpMethod[];

    assembly: string;
    image: string;
};

function errorToString(e: unknown) {
    if (e instanceof Error) {
        return {
            error: e.message || String(e),
            stack: e.stack || ""
        };
    }
    return {
        error: String(e),
        stack: ""
    };
}

rpc.exports = {
    dumpassembly(name: string) {
        return new Promise((resolve) => {
            try {
                Il2Cpp.perform(() => {

                    try {
                        const classMap = new Map<string, DumpClass>();

                        const assembly = Il2Cpp.domain.assembly(name);
                        if (!assembly) {
                            resolve({ ok: false, error: "assembly not found" });
                            return;
                        }

                        const image = assembly.image;

                        image.classes.forEach((c: Il2Cpp.Class) => {

                            const key = `${c.namespace}.${c.name}`;

                            if (!classMap.has(key)) {

                                const fields: DumpField[] = [];

                                try {
                                    c.fields.forEach((f: Il2Cpp.Field) => {
                                        fields.push({
                                            name: String(f.name ?? ""),
                                            type: String(f.type?.name ?? ""),
                                            isStatic: !!f.isStatic,
                                            offset: Number(f.offset ?? 0)
                                        });
                                    });
                                } catch (_) {}

                                classMap.set(key, {
                                    namespace: String(c.namespace ?? ""),
                                    class: String(c.name ?? ""),
                                    parent: String(c.parent?.name ?? ""),
                                    classPtr: c.handle.toString(),   // ✅ 核心

                                    fields,
                                    methods: [],

                                    assembly: String(image.name ?? ""),
                                    image: String(image.name ?? "")
                                });
                            }

                            const cls = classMap.get(key)!;

                            c.methods.forEach((m: Il2Cpp.Method) => {
                                try {
                                    if (!m.virtualAddress) return;

                                    const va = m.virtualAddress;
                                    const module = Process.findModuleByAddress(va);
                                    if (!module) return;

                                    const rva = Number(va.sub(module.base));

                                    const params: DumpParam[] = [];

                                    for (const p of m.parameters) {
                                        params.push({
                                            name: String(p.name ?? ""),
                                            type: String(p.type?.name ?? "")
                                        });
                                    }

                                    cls.methods.push({
                                        name: String(m.name ?? ""),
                                        rva,
                                        returnType: String(m.returnType?.name ?? ""),
                                        params,
                                        isStatic: !!m.isStatic
                                    });

                                } catch (_) {}
                            });

                        });

                        resolve({
                            ok: true,
                            count: classMap.size,
                            data: Array.from(classMap.values())
                        });

                    } catch (e) {
                        resolve({ ok: false, ...errorToString(e) });
                    }
                });

            } catch (e) {
                resolve({ ok: false, ...errorToString(e) });
            }
        });
    }
};