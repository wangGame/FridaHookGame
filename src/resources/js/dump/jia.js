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
