import "frida-il2cpp-bridge";

type DumpParam = {
    name: string;
    type: string;
};

type DumpItem = {
    module: string;
    namespace: string;
    class: string;
    method: string;
    name: string;
    rva: number;
    returnType: string;
    params: DumpParam[];
    isStatic: boolean;
    assembly: string;
    image: string;
};

type DumpOkResult = {
    ok: true;
    input: string;
    usedName: string;
    imageName: string;
    count: number;
    data: DumpItem[];
};

type DumpFailResult = {
    ok: false;
    input: string;
    error: string;
    stack: string;
};

type DumpResult = DumpOkResult | DumpFailResult;

function sanitizeAssemblyName(name: string): string {
    if (!name) return "";
    return name.endsWith(".dll") ? name.slice(0, -4) : name;
}

function errorToString(e: unknown): { error: string; stack: string } {
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
    dumpassembly(name: string): Promise<DumpResult> {
        return new Promise<DumpResult>((resolve) => {
            try {
                Il2Cpp.perform(() => {
                    try {
                        const result: DumpItem[] = [];
                        const exported: Set<string> = new Set<string>();

                        const rawName: string = String(name || "").trim();
                        const candidates: string[] = [...new Set<string>([
                            rawName,
                            sanitizeAssemblyName(rawName),
                            rawName + ".dll"
                        ].filter(Boolean))];

                        let assembly: Il2Cpp.Assembly | null = null;
                        let usedName: string | null = null;

                        for (const n of candidates) {
                            try {
                                const a = Il2Cpp.domain.assembly(n);
                                if (a) {
                                    assembly = a;
                                    usedName = n;
                                    break;
                                }
                            } catch (_) {}
                        }

                        if (!assembly || !usedName) {
                            resolve({
                                ok: false,
                                input: rawName,
                                error: "assembly not found",
                                stack: ""
                            });
                            return;
                        }

                        const image = assembly.image;

                        image.classes.forEach((c: Il2Cpp.Class) => {
                            c.methods.forEach((m: Il2Cpp.Method) => {
                                try {
                                    if (!m.virtualAddress) return;

                                    const va: NativePointer = m.virtualAddress;
                                    let module: Module | null = null;

                                    try {
                                        module = Process.findModuleByAddress(va);
                                    } catch (_) {
                                        return;
                                    }

                                    if (!module) return;

                                    const key = va.toString();
                                    if (exported.has(key)) return;
                                    exported.add(key);

                                    const rva = va.sub(module.base);

                                    const cleanClass = String(c.name ?? "").replace(/[^a-zA-Z0-9_]/g, "_");
                                    const cleanMethod = String(m.name ?? "").replace(/[^a-zA-Z0-9_]/g, "_");
                                    const newName = `${cleanClass}__${cleanMethod}`;

                                    const params: DumpParam[] = [];
                                    try {
                                        for (const p of m.parameters) {
                                            params.push({
                                                name: String(p.name ?? ""),
                                                type: String(p.type?.name ?? "")
                                            });
                                        }
                                    } catch (_) {}

                                    let returnType = "";
                                    try {
                                        returnType = String(m.returnType?.name ?? "");
                                    } catch (_) {}

                                    let isStatic = false;
                                    try {
                                        isStatic = !!m.isStatic;
                                    } catch (_) {}

                                    result.push({
                                        module: String(module.name ?? ""),
                                        namespace: String(c.namespace ?? ""),
                                        class: String(c.name ?? ""),
                                        method: String(m.name ?? ""),
                                        name: newName,
                                        rva: parseInt(rva.toString(), 16),
                                        returnType: String(returnType ?? ""),
                                        params,
                                        isStatic,
                                        assembly: String(image.name ?? ""),
                                        image: String(image.name ?? "")
                                    });
                                } catch (_) {}
                            });
                        });

                        resolve({
                            ok: true,
                            input: rawName,
                            usedName: String(usedName ?? ""),
                            imageName: String(image.name ?? ""),
                            count: result.length,
                            data: result
                        });
                    } catch (e: unknown) {
                        const err = errorToString(e);
                        resolve({
                            ok: false,
                            input: String(name || ""),
                            error: err.error,
                            stack: err.stack
                        });
                    }
                });
            } catch (e: unknown) {
                const err = errorToString(e);
                resolve({
                    ok: false,
                    input: String(name || ""),
                    error: err.error,
                    stack: err.stack
                });
            }
        });
    }
};