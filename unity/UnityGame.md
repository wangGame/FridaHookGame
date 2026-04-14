# Unity游戏拆解思路

1.从内存中dump il2cpp.so

```js
'use strict';

let dumped = false;

function tryDumpIl2cpp() {
    if (dumped) {
        return;
    }

    const module = Process.findModuleByName("libil2cpp.so");
    if (!module) {
        return;
    }

    dumped = true;
    console.log("[+] libil2cpp loaded");
    console.log("[+] base =", module.base);
    console.log("[+] size =", module.size);

    const ranges = Process.enumerateRangesSync({
        protection: 'r',
        coalesce: true
    });

    const il2cppRanges = ranges.filter(r =>
        r.base.compare(module.base) >= 0 &&
        r.base.compare(module.base.add(module.size)) < 0
    );

    let total = 0;
    il2cppRanges.forEach(r => {
        try {
            const data = Memory.readByteArray(r.base, r.size);
            send({
                type: "dump",
                base: r.base.toString(),
                size: r.size
            }, data);
            total += r.size;
        } catch (e) {
            console.log("[-] skip range", r.base, e);
        }
    });

    console.log("[+] dump finished, bytes =", total);
}
```

2.将dump的so放入到ida中

3.生成unity game名字和地址值 脚本

```js 
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

```

4.ida执行脚本,替换方法名字

ida:file->script file->第三步得到的文件进行替换
