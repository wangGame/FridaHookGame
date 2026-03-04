'use strict';

const soName = "libcocos2dcpp.so";
const funcName = "_ZN5Level14drawACardLogicEbi";
const target = Module.findExportByName(soName, funcName);
console.log("[+] target @", target);

const mod = Process.getModuleByName(soName);
const base = mod.base;

// 预建：按地址排序的符号表（只做一次）
let symList = mod.enumerateSymbols()
  .filter(s => s.address) // 有些条目可能没地址
  .map(s => ({ addr: ptr(s.address), name: s.name }))
  .sort((a, b) => a.addr.compare(b.addr));

// 二分查找：找 <= p 的最近符号
function nearestSymbol(p) {
  let lo = 0, hi = symList.length - 1;
  let best = null;

  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const a = symList[mid].addr;
    if (a.compare(p) <= 0) {
      best = symList[mid];
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return best;
}

function rva(p) {
  return "0x" + p.sub(base).toString(16);
}

function pretty(p) {
  const m = Process.findModuleByAddress(p);
  if (!m) return p.toString();

  if (m.name !== soName) {
    const ds = DebugSymbol.fromAddress(p);
    return `${m.name}!${(ds && ds.name) ? ds.name : p.toString()}`;
  }

  // 先试 DebugSymbol（有时能直接给出名字）
  const ds = DebugSymbol.fromAddress(p);
  if (ds && ds.name && !ds.name.startsWith("0x")) {
    return `${soName}!${ds.name} (${rva(p)})`;
  }

  // 再用“最近符号 + 偏移”
  const ns = nearestSymbol(p);
  if (ns) {
    const off = p.sub(ns.addr);
    return `${soName}!${ns.name}+0x${off.toString(16)} (${rva(p)})`;
  }

  // 彻底没有符号就只能 rva
  return `${soName}!${rva(p)}`;
}

// 解析 bl/blx 目标
function resolveCallTarget(opStr, ctx) {
  if (!opStr) return null;
  const m = opStr.match(/0x[0-9a-fA-F]+/);
  if (m) return ptr(m[0]);

  const reg = opStr.trim().toLowerCase();
  if (/^(r[0-9]|r1[0-2]|lr|ip|sp|pc)$/.test(reg)) {
    try { return ptr(ctx[reg]); } catch (_) { return null; }
  }
  return null;
}

Interceptor.attach(target, {
  onEnter(args) {
    this.tid = Process.getCurrentThreadId();
    this.count = 0;

    Stalker.follow(this.tid, {
      transform: (iterator) => {
        let ins;
        while ((ins = iterator.next()) !== null) {
          const mnem = ins.mnemonic;
          if (mnem === 'bl' || mnem === 'blx') {
            const opStrCopy = ins.opStr ? ("" + ins.opStr) : "";
            const mnemCopy = "" + mnem;

            iterator.putCallout((ctx) => {
              if (this.count++ > 80) return;
              const from = ptr(ctx.pc);
              const to = resolveCallTarget(opStrCopy, ctx);
              if (!to) return;

              const toMod = Process.findModuleByAddress(to);
              if (!toMod || toMod.name !== soName) return;

              console.log(`  ${pretty(from)}  --${mnemCopy}-->  ${pretty(to)}`);
            });
          }
          iterator.keep();
        }
      }

//        transform: (iterator) => {
//          let ins;
//
//          while ((ins = iterator.next()) !== null) {
//
//            console.log(
//              ins.address,
//              ins.mnemonic,
//              ins.opStr
//            );
//
//            iterator.keep();
//          }
//        }
    });
  },

  onLeave(retval) {
    Stalker.unfollow(this.tid);
    Stalker.garbageCollect();
    console.log("🟢 RESULT =", retval.toInt32());
  }
});


//'use strict';
//
//const soName = "libcocos2dcpp.so";
//const funcName = "_ZN5Level17calcDrawACardOddsEb";
//const target = Module.findExportByName(soName, funcName);
//console.log("[+] target @", target);
//
//function sym(p) {
//  const mod = Process.findModuleByAddress(p);
//  if (!mod) return p.toString();
//  const ds = DebugSymbol.fromAddress(p);
//  const name = (ds && ds.name) ? ds.name : ("0x" + p.sub(mod.base).toString(16));
//  return `${mod.name}!${name}`;
//}
//
//// 解析 bl/blx 的目标：立即数 or 寄存器
//function resolveCallTarget(opStr, ctx) {
//  if (!opStr) return null;
//
//  // 1) 立即数 0x1234...
//  const m = opStr.match(/0x[0-9a-fA-F]+/);
//  if (m) return ptr(m[0]);
//
//  // 2) 寄存器：r0-r12, lr 等（常见 blx r3）
//  const reg = opStr.trim().toLowerCase();
//  if (/^(r[0-9]|r1[0-2]|lr|ip|sp|pc)$/.test(reg)) {
//    // ctx[reg] 在某些架构名可能不同，这里尽量兼容
//    try { return ptr(ctx[reg]); } catch (_) { return null; }
//  }
//
//  return null;
//}
//
//Interceptor.attach(target, {
//  onEnter(args) {
//    this.tid = Process.getCurrentThreadId();
//    this.count = 0;
//
//    Stalker.follow(this.tid, {
//      transform: (iterator) => {
//        let ins;
//        while ((ins = iterator.next()) !== null) {
//
//          // 只关心 call 指令
//          const mnem = ins.mnemonic;
//          if (mnem === 'bl' || mnem === 'blx') {
//
//            // ✅ 关键：把需要的字段复制出来，别在 callout 里用 ins
//            const opStrCopy = ins.opStr ? ("" + ins.opStr) : "";
//            const mnemCopy = "" + mnem;
//
//            iterator.putCallout((ctx) => {
//              if (this.count++ > 60) return;
//
//              const from = ptr(ctx.pc);
//              let to = resolveCallTarget(opStrCopy, ctx);
//              if (!to) return;
//
//              const toMod = Process.findModuleByAddress(to);
//              if (!toMod || toMod.name !== soName) return;
//
//              console.log(`  ${sym(from)}  --${mnemCopy}-->  ${sym(to)}`);
//            });
//          }
//
//          iterator.keep();
//        }
//      }
//    });
//  },
//
//  onLeave(retval) {
//    Stalker.unfollow(this.tid);
//    Stalker.garbageCollect();
//    console.log("🟢 RESULT =", retval.toInt32());
//  }
//});


//🟢 RESULT = 0
//  ↳ CALL -> libcocos2dcpp.so!_ZN5Level17calcDrawACardOddsEb+0x3e (0x34ecff)
//  ↳ CALL -> libcocos2dcpp.so!_ZN5Level17calcDrawACardOddsEb+0x6a (0x34ed2b)
//  ↳ CALL -> libcocos2dcpp.so!_ZN13ConfigManager4openERKNSt6__ndk112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEEb+0x1c (0x46efad)
//  ↳ CALL -> libcocos2dcpp.so!_ZNSt6__ndk16__treeINS_12__value_typeINS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPN9rapidjson15GenericDocumentINS8_4UTF8IcEENS8_19MemoryPoolAllocatorINS8_12CrtAllocatorEEESD_EEEENS_19__map_value_compareIS7_SH_NS_4lessIS7_EELb1EEENS5_ISH_EEE4findIS7_EENS_15__tree_iteratorISH_PNS_11__tree_nodeISH_PvEEiEERKT_+0x44 (0x46fbbb)
//  ↳ CALL -> libcocos2dcpp.so!_ZNSt6__ndk16__treeINS_12__value_typeINS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPN9rapidjson15GenericDocumentINS8_4UTF8IcEENS8_19MemoryPoolAllocatorINS8_12CrtAllocatorEEESD_EEEENS_19__map_value_compareIS7_SH_NS_4lessIS7_EELb1EEENS5_ISH_EEE4findIS7_EENS_15__tree_iteratorISH_PNS_11__tree_nodeISH_PvEEiEERKT_+0x96 (0x46fc0d)
//  ↳ CALL -> libcocos2dcpp.so!_ZN5Level17calcDrawACardOddsEb+0x1ee (0x34eeaf)
//  ↳ CALL -> libcocos2dcpp.so!_ZN5Level17calcDrawACardOddsEb+0x210 (0x34eed1)
//  ↳ CALL -> libcocos2dcpp.so!_ZN5Level17calcDrawACardOddsEb+0x232 (0x34eef3)
//  ↳ CALL -> libcocos2dcpp.so!_ZN5Level17calcDrawACardOddsEb+0x2a2 (0x34ef63)
//  ↳ CALL -> libcocos2dcpp.so!_ZN5Level17calcDrawACardOddsEb+0x30a (0x34efcb)
//  ↳ CALL -> libcocos2dcpp.so!_ZN5Level17calcDrawACardOddsEb+0x3a0 (0x34f061)
//  ↳ CALL -> libcocos2dcpp.so!_ZN5Level17calcDrawACardOddsEb+0x40a (0x34f0cb)
//  ↳ CALL -> libcocos2dcpp.so!_ZN5Level17calcDrawACardOddsEb+0x470 (0x34f131)
//  ↳ CALL -> libcocos2dcpp.so!_ZN5Level17calcDrawACardOddsEb+0x4d6 (0x34f197)
//  ↳ CALL -> libcocos2dcpp.so!_ZN5Level17calcDrawACardOddsEb+0x52a (0x34f1eb)
//  ↳ CALL -> libcocos2dcpp.so!_ZN5Level17calcDrawACardOddsEb+0x5d8 (0x34f299)

//
//'use strict';
//
//const soName = "libcocos2dcpp.so";
//const funcName = "_ZN5Level17calcDrawACardOddsEb";
//
//const addr = Module.findExportByName(soName, funcName);
//console.log("[+] target @", addr);
//
//function rvaStr(mod, p) {
//  return "0x" + p.sub(mod.base).toString(16);
//}
//
//// 可选：缓存符号（如果库里符号多，enumerateSymbols 很慢，别每次都跑）
//let symCache = null;
//function buildSymCache() {
//  if (symCache) return symCache;
//  symCache = new Map();
//  try {
//    const m = Process.getModuleByName(soName);
//    m.enumerateSymbols().forEach(s => {
//      // 只缓存函数符号（type 可能是 "function"/"OBJECT" 等，安卓上不一定可靠）
//      symCache.set(ptr(s.address).toString(), s.name);
//    });
//  } catch (e) {}
//  return symCache;
//}
//
//function prettyName(p) {
//  const mod = Process.findModuleByAddress(p);
//  if (!mod) return p.toString();
//
//  // 1) DebugSymbol（最快，成功率取决于符号信息）
//  const ds = DebugSymbol.fromAddress(p);
//  // ds.name 可能是 "sub_1234" / null / 或者真实符号
//  if (ds && ds.name && ds.name !== "0x" + p.toString(16)) {
//    return `${mod.name}!${ds.name} (${rvaStr(mod, p)})`;
//  }
//
//  // 2) 如果 enumerateSymbols 能用：从缓存里找最近的符号（或精确匹配）
//  // 精确匹配：
//  const cache = buildSymCache();
//  const exact = cache.get(p.toString());
//  if (exact) return `${mod.name}!${exact} (${rvaStr(mod, p)})`;
//
//  // 3) 退化：只输出模块+RVA
//  return `${mod.name}!${rvaStr(mod, p)}`;
//}
//
//Interceptor.attach(addr, {
//  onEnter(args) {
//    this.callCount = 0;
//    this.seen = {};
//    this.tid = Process.getCurrentThreadId();
//
//    Stalker.follow(this.tid, {
//      events: { call: true },
//      onReceive: (events) => {
//        const parsed = Stalker.parse(events);
//
//        for (let i = 0; i < parsed.length; i++) {
//          if (this.callCount > 30) break;
//
//          const callTarget = ptr(parsed[i][1]);
//          const mod = Process.findModuleByAddress(callTarget);
//          if (!mod || mod.name !== soName) continue;
//
//          const key = callTarget.toString();
//          if (this.seen[key]) continue;
//          this.seen[key] = true;
//
//          console.log("  ↳ CALL -> " + prettyName(callTarget));
//          this.callCount++;
//        }
//      }
//    });
//  },
//
//  onLeave(retval) {
//    Stalker.unfollow(this.tid);
//    Stalker.garbageCollect();
//    console.log("🟢 RESULT =", retval.toInt32());
//  }
//});

//'use strict';
//
//const soName = "libcocos2dcpp.so";
//
//
//const funcName = "_ZN5Level17calcDrawACardOddsEb"; // 替换为你的实际函数名 const addr = Module.findExportByName(soName, funcName); console.log("[+] cards2Str @", addr);
//
//const addr = Module.findExportByName(soName, funcName);
//console.log("[+] cards2Str @", addr);
//Interceptor.attach(addr, {
//
//    onEnter(args) {
//
//        this.callCount = 0;
//        this.seen = {};
//        this.tid = Process.getCurrentThreadId();
//
//        Stalker.follow(this.tid, {
//            events: { call: true },
//
//            onReceive: (events) => {
//
//                const parsed = Stalker.parse(events);
//
//                for (let i = 0; i < parsed.length; i++) {
//
//                    if (this.callCount > 30)
//                        break;
//
//                    const callTarget = ptr(parsed[i][1]);
//                    const mod = Process.findModuleByAddress(callTarget);
//
//                    if (!mod || mod.name !== soName)
//                        continue;
//
//                    const key = callTarget.toString();
//                    if (this.seen[key])
//                        continue;
//
//                    this.seen[key] = true;
//
//                    console.log("  ↳ CALL -> " + callTarget);
//
//                    this.callCount++;
//                }
//            }
//        });
//    },
//
//    onLeave(retval) {
//
//        Stalker.unfollow(this.tid);
//        Stalker.garbageCollect();
//
//        console.log("🟢 RESULT =", retval.toInt32());
//    }
//});