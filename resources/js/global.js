//function dumpGlobalMetadata() {
//    const magic = [0x94, 0x43, 0x72, 0x12]; // FAB11BAF (LE)
//    const ranges = Process.enumerateRangesSync({
//        protection: 'r--',
//        coalesce: true
//    });
//       console.log(ranges)
//    for (const r of ranges) {
//        try {
//            const idx = Memory.scanSync(r.base, r.size, magic);
//            if (idx.length > 0) {
//                const addr = idx[0].address;
//                console.log("[+] global-metadata found @", addr);
//
//                // metadata size 在 header 里
//                const size = addr.add(0x18).readU32(); // metadataSize
//                const data = Memory.readByteArray(addr, size);
//                console.log("-------")
//                send({
//                    type: "metadata",
//                    base: addr.toString(),
//                    size: size
//                }, data);
//
//                return;
//            }
//        } catch (e) {}
//    }
//}
//dumpGlobalMetadata()

//'use strict';
//
//console.log("📦 Loaded .so modules:");
//
//Process.enumerateModules().forEach(m => {
//    if (m.name.endsWith(".so")) {
//        console.log(
//            `[SO] ${m.name}\n` +
//            `     base=${m.base} size=${m.size} path=${m.path}`
//        );
//    }
//});


//const il2cpp = Process.findModuleByName("libil2cpp.so");
//
//Process.enumerateRanges({ protection: 'r-x', coalesce: true })
//    .filter(r =>
//        r.base.compare(il2cpp.base) >= 0 &&
//        r.base.compare(il2cpp.base.add(il2cpp.size)) < 0
//    )
//    .forEach(r => {
//        console.log("EXEC RANGE:", r.base, r.size);
//    });

//
//'use strict';
//
//const il2cpp = Process.findModuleByName("libil2cpp.so");
//
//function inIl2cpp(addr) {
//    return addr.compare(il2cpp.base) >= 0 &&
//           addr.compare(il2cpp.base.add(il2cpp.size)) < 0;
//}
//
//Interceptor.attach(Module.findExportByName(null, "pthread_create"), {
//    onEnter(args) {
//        this.tid = Process.getCurrentThreadId();
//    },
//    onLeave() {
//        const tid = this.tid;
//
//        Stalker.follow(tid, {
//            events: {
//                call: true
//            },
//            onReceive(events) {
//                const parsed = Stalker.parse(events);
//                parsed.forEach(e => {
//                    if (e[0] === 'call') {
//                        const target = ptr(e[2]);
//                        if (inIl2cpp(target)) {
//                            console.log(
//                                "🔥 CALL @",
//                                target,
//                                "off=",
//                                target.sub(il2cpp.base)
//                            );
//                        }
//                    }
//                });
//            }
//        });
//    }
//});
//
//console.log("✅ Stalker armed");

//
//'use strict';
//
//const base = ptr("0xb96a2000");
//
//function hookOnce(addr) {
//    try {
//        let hit = false;
//        Interceptor.attach(addr, {
//            onEnter(args) {
//                if (!hit) {
//                    hit = true;
//                    console.log("🔥 HIT @", addr);
//                }
//            }
//        });
//    } catch (e) {}
//}
//
//// 前后 ±0x400（256 条指令左右）
//for (let off = -0x400; off <= 0x400; off += 4) {
//    hookOnce(base.add(off));
//}
//
//console.log("✅ dense hook armed");