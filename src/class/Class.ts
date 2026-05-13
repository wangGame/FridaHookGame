import "frida-il2cpp-bridge";

declare const console: any;

Il2Cpp.perform(() => {

    function safeValue(v: any): string {
        try {
            if (v === null || v === undefined) return "null";

            if (v instanceof Il2Cpp.String) {
                return `"${v.content}"`;
            }

            if (v instanceof Il2Cpp.Object) {
                return `${v} (${v.class.name})`;
            }

            return v.toString();
        } catch (e) {
            return `<error: ${e}>`;
        }
    }

    function dumpFields(obj: Il2Cpp.Object) {
        console.log("\n========== dump fields ==========");
        console.log("class =", obj.class.fullName ?? obj.class.name);

        for (const f of obj.class.fields) {
            try {
                if (f.isStatic) continue;

                const value = obj.field(f.name).value;
                console.log(`${f.type.name} ${f.name} = ${safeValue(value)}`);
            } catch (e) {
                console.log(`${f.name} = <read error: ${e}>`);
            }
        }

        console.log("=================================\n");
    }

    const image = Il2Cpp.domain.assembly("Assembly-CSharp").image;

    // 改成你要看的类
    const klass = image.class("Game");

    console.log("[+] class =", klass.fullName ?? klass.name);

    // 不要 const choose = Il2Cpp.gc.choose
    // 直接这样调用
    Il2Cpp.gc.choose(klass).forEach((obj: Il2Cpp.Object) => {
        dumpFields(obj);
    });
});