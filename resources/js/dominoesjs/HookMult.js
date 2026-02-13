//'use strict';
//
///**
// * ==========================
// * 基础工具
// * ==========================
// */
//
//function hookSymbol(module, symbol, callbacks) {
//    const addr = Module.findExportByName(module, symbol);
//
//    if (!addr) {
//        console.log(`❌ [MISS] ${symbol}`);
//
//    }
//
//    console.log(`✅ [HOOK] ${symbol} @ ${addr}`);
//
//    Interceptor.attach(addr, callbacks);
//}
//
///**
// * ==========================
// * cocos2d::log 专用解析
// * ==========================
// */
//
//function parseCocosLog(args) {
//    let fmt;
//    try {
//        fmt = args[0].readCString();
//    } catch {
//        return;
//    }
//
//    console.log(`\n📝 cocos2d::log -> ${fmt}`);
//
//    const specs = fmt.match(/%[sdif]/g);
//    if (!specs) return;
//
//    let idx = 1;
//    specs.forEach((spec, i) => {
//        try {
//            const a = args[idx++];
//            if (spec === "%s") {
//                console.log(`   arg${i+1} (str) =`, a.readCString());
//            } else if (spec === "%f") {
//                console.log(`   arg${i+1} (float) =`, a.readFloat());
//            } else {
//                console.log(`   arg${i+1} (int) =`, a.toInt32());
//            }
//        } catch {
//            console.log(`   arg${i+1} <invalid>`);
//        }
//    });
//}
//
///**
// * ==========================
// * Hook 配置区（你只改这里）
// * ==========================
// */
//
//const MODULE = "libcocos2dcpp.so";
//
//const HOOKS = [
//
//    // cocos2d::log
//    {
//        name: "cocos2d::log",
//        symbol: "_ZN7cocos2d3logEPKcz",
//        onEnter(args) {
//            parseCocosLog(args);
//        }
//    },
//    // Level::robotChangeLogic(int)
////    {
////        name: "Level::robotDrawCard",
////        symbol: "_ZN5Level13robotDrawCardEv",
////        onEnter(args) {
////            console.log("\n🤖 robotDrawCard");
////            console.log("   this   =", args[0]);
////            console.log("   reason =", args[1].toInt32());
////
////             Thread.backtrace(this.context, Backtracer.ACCURATE)
////            .forEach((addr, i) => {
////                const sym = DebugSymbol.fromAddress(addr);
////                console.log(
////                    `   #${i} ${addr} ${sym.name || ""} ${sym.moduleName || ""}`
////                );
////            });
////        },
////        onLeave(retval) {
////            console.log("   return =", retval.toInt32());
////        }
////    },
////
////    // Level::robotPlayAHandLogicB(...)
////    {
////        name: "Level::robotChangeCard",
////        symbol: "_ZN5Level15robotChangeCardEv", // ⚠️ 以你实际符号为准
////        onEnter(args) {
////            console.log("\n🎯 robotChangeCard ENTER");
////            console.log("   this =", args[0]);
////            console.log("   arg =", args[1]);
////        }
////    },
////
////    // Level::robotPlayAHandLogicB(...)
////    {
////        name: "Level::robotPlayHand",
////        symbol: "_ZN6UIGame13robotPlayHandEi10EDirection", // ⚠️ 以你实际符号为准
////        onEnter(args) {
////            console.log("\n🎯 robotPlayHand ENTER");
////            console.log("   this =", args[0]);
////            console.log("   arg =", args[1]);
////        }
////    },
////    {
////        name: "Level::robotDrawNoCard",
////        symbol: "_ZN5Level15robotDrawNoCardEv", // ⚠️ 以你实际符号为准
////        onEnter(args) {
////            console.log("\n🎯 robotDrawNoCard ENTER");
////            console.log("   this =", args[0]);
////            console.log("   arg =", args[1]);
////        }
////    },
////       {
////        name: "Level::endRobotRound",
////        symbol: "_ZN7UIGameB13endRobotRoundEfb", // ⚠️ 以你实际符号为准
////        onEnter(args) {
////            console.log("\n🎯 endRobotRound ENTER");
////            console.log("   this =", args[0]);
////            console.log("   arg =", args[1]);
////        }
////    },
////       {
////        name: "Level::endLevel",
////        symbol: "_ZN5Level8endLevelEb", // ⚠️ 以你实际符号为准
////        onEnter(args) {
////            console.log("\n🎯 endLevel ENTER");
////            console.log("   this =", args[0]);
////            console.log("   arg =", args[1]);
////        }
////    },
////     {
////        name: "Level::calcRobotPointFailOdds",
////        symbol: "_ZN5Level22calcRobotPointFailOddsEv", // ⚠️ 以你实际符号为准
////        onEnter(args) {
////            console.log("\n🎯 calcRobotPointFailOdds ENTER");
////            console.log("   this =", args[0]);
////            console.log("   arg =", args[1]);
////         }
////    }
//,
//     {
//        name: "Level::calcDrawACardOdds",
//        symbol: "_ZN5Level17calcDrawACardOddsEb", // ⚠️ 以你实际符号为准
//        onEnter(args) {
//            console.log("\n🎯 calcDrawACardOdds ENTER");
//            console.log("   this =", args[0]);
//            console.log("   arg =", args[1]);
//        },
//        onLeave(retval) {
//
////            console.log("   return =", retval.toInt32());
//
//        console.log("   original return =", retval.toInt32());
//
//        // 🔥 强制修改返回值为 0
//        retval.replace(0);
//
//        console.log("   patched return  =", retval.toInt32());
//        }
//    },
////     {
////        name: "Level::playLogicGeneral",
////        symbol: "_ZN5Level16playLogicGeneralERNSt6__ndk16vectorIiNS0_9allocatorIiEEEERNS1_IS4_NS2_IS4_EEEE", // ⚠️ 以你实际符号为准
////        onEnter(args) {
////            console.log("\n🎯 playLogicGeneral ENTER");
////            console.log("   this =", args[0]);
////            console.log("   arg =", args[1]);
////        }
////
////    }
////,
////     {
////        name: "Level::drawACardLogic",
////        symbol: "_ZN5Level14drawACardLogicEbi", // ⚠️ 以你实际符号为准
////        onEnter(args) {
////            console.log("\n🎯 drawACardLogic ENTER");
////            console.log("   this =", args[0]);
////            console.log("   arg =", args[1]);
////        }
////    }
////     {
////        name: "Level::changeLuckyDrawLogic",
////        symbol: "_ZN5Level20changeLuckyDrawLogicEii", // ⚠️ 以你实际符号为准
////        onEnter(args) {
////            console.log("\n🎯 changeLuckyDrawLogic ENTER");
////            console.log("   this =", args[0]);
////            console.log("   arg =", args[1]);
////        }
////    },
////     {
////        name: "Level::lottoCard",
////        symbol: "_ZN6UIGame9lottoCardEbb", // ⚠️ 以你实际符号为准
////        onEnter(args) {
////            console.log("\n🎯 lottoCard ENTER");
////            console.log("   this =", args[0]);
////            console.log("   arg =", args[1]);
////        }
////    },
////     {
////        name: "Level::robotPlayAHandLogicB",
////        symbol: "_ZN5Level20robotPlayAHandLogicBERNSt6__ndk16vectorIiNS0_9allocatorIiEEEERNS1_IS4_NS2_IS4_EEEE", // ⚠️ 以你实际符号为准
////        onEnter(args) {
////            console.log("\n🎯 robotPlayAHandLogicB ENTER");
////            console.log("   this =", args[0]);
////            console.log("   arg =", args[1]);
////
////
////             Thread.backtrace(this.context, Backtracer.ACCURATE)
////            .forEach((addr, i) => {
////                const sym = DebugSymbol.fromAddress(addr);
////                console.log(
////                    `   #${i} ${addr} ${sym.name || ""} ${sym.moduleName || ""}`
////                );
////            });
////        }
////    },
////     {
////        name: "Level::startRobotRound",
////        symbol: "_ZN6UIGame15startRobotRoundEv", // ⚠️ 以你实际符号为准
////        onEnter(args) {
////            console.log("\n🎯 startRobotRound ENTER");
////            console.log("   this =", args[0]);
////            console.log("   arg =", args[1]);
////        }
////    },
//
////    ,
////     {
////        name: "LevelData::randomRobot",
////        symbol: "_ZN9LevelData11randomRobotE11ELevelModel", // ⚠️ 以你实际符号为准
////        onEnter(args) {
////                 console.log("LevelData::randomRobot")
////
////                 console.log(args[1])
////        }
////    }
////    ,
////     {
////        name: "LevelBase::isPlaceCard",
////        symbol: "_ZN9LevelBase11isPlaceCardER8CardDataRNSt6__ndk16vectorI7IntVec2NS2_9allocatorIS4_EEEE", // ⚠️ 以你实际符号为准
////        onEnter(args) {
////            console.log("\n🎯 LevelBase::isPlaceCard");
////            console.log("   this =", args[0]);
////            console.log("   arg =", args[1]);
////        },       onLeave(retval) {
////            console.log("   return =", retval.toInt32());
////        }
////    }
////    ,
////     {
////        name: "ConfigManager::open",
////        symbol: "_ZN13ConfigManager4openERKNSt6__ndk112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEEb", // ⚠️ 以你实际符号为准
////         onEnter(args) {
////            this.a1 = args[0]; // this指针
////            this.a2 = args[1]; // 文件名/数据指针
////            this.a3 = args[2]; // 是否json标志
////            console.log(`🎯 ConfigManager::open ENTER`);
////            console.log(`   this = ${this.a1}`);
////            console.log(`   arg a2 = ${this.a2}`);
////            console.log(`   arg a3 = ${this.a3}`);
////        },
////        onLeave(retval) {
////            console.log(`ConfigManager::open returned: ${retval}`);
////
////            // 尝试获取 v30 / v31 指向的解密内容
////            try {
////                // 在你的汇编里 v30/v31 保存了解密后的内容
////                // 假设第一个字节是长度或者指针，你可以尝试读取前几个字节
////                // 这里仅做示例，读取前 256 字节
////                let jsonPtr = this.a2; // 如果有其他中间变量，改为 v31 或 v37
////                let bytes = Memory.readByteArray(jsonPtr, 256);
////                if (bytes) {
////                    let hex = hexdump(bytes, { offset: 0, length: 256, header: false, ansi: true });
////                    console.log("💾 JSON bytes (first 256 bytes):\n" + hex);
////                } else {
////                    console.log("无法读取 JSON 内存");
////                }
////            } catch (e) {
////                console.log("无法直接读取 JSON 内容:", e.message);
////            }
////        }
////    }
//];
//
////_ZN13ConfigManager4openERKNSt6__ndk112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEEb
//
///**
// * ==========================
// * 启动 hook
// * ==========================
// */
//
//HOOKS.forEach(h => {
//    hookSymbol(MODULE, h.symbol, {
//        onEnter: h.onEnter,
//        onLeave: h.onLeave
//    });
//});
//
//{
////
//const sym = "_ZNSt6__ndk124uniform_int_distributionIiEclINS_23mersenne_twister_engineIjLj32ELj624ELj397ELj31ELj2567483615ELj11ELj4294967295ELj7ELj2636928640ELj15ELj4022730752ELj18ELj1812433253EEEEEiRT_RKNS1_10param_typeE";
//
//let addr = null;
//
//// 常见在 libc++_shared.so
//addr = Module.findExportByName("libc++_shared.so", sym);
//
//// 如果没找到，就全模块扫一遍符号（有的模块会内置 libc++）
//if (!addr) {
//  Process.enumerateModules().forEach(m => {
//    try {
//      const a = Module.findExportByName(m.name, sym);
//      if (a) { addr = a; console.log("found in", m.name, a); }
//    } catch (e) {}
//  });
//}
//
//console.log("operator() addr =", addr);
////
////
//const opAddr = ptr(addr);
//
//Interceptor.attach(opAddr, {
//    onEnter(args) {
//        // args[0] 一般是 this 指针（RNG / distribution 对象）
//        this.thisPtr = args[0];
//    },
//    onLeave(retval) {
//        // operator() 返回的是 int
//        const r = retval.toInt32();
//
//        console.log(
//            `🎲 RNG operator() => ${r}, this=${this.thisPtr}`
//        );
//    }
//});
//
//
//
//}
//
//// cocos_file_hook.js
//// cocos_only_filename.js
//
////const fopenPtr = Module.findExportByName(null, "fopen");
////
////if (!fopenPtr) {
////    console.log("❌ fopen not found");
////}
////
////Interceptor.attach(fopenPtr, {
////    onEnter(args) {
////        try {
////            const path = args[0].readUtf8String();
////            const mode = args[1].readUtf8String();
////
////            // 只关心读文件
////            if (mode.indexOf("r") !== -1) {
////                console.log("📂 fopen:", path);
////            }
////        } catch (e) {}
////    }
////});
////
////console.log("✅ fopen hook installed");
//
//const sym = "_ZN13ConfigManager4openERKNSt6__ndk112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEEb";
//const addr = Module.findExportByName(MODULE, sym);
//
//if (!addr) {
//    console.log("❌ real open not found");
//
//}
//
//console.log("✅ real ConfigManager::open @", addr);
//
//function findFileNameAround(ptr) {
//
//        console.log("🔎 findFileNameAround @", ptr);
//
//    // 📌 打印调用栈
//    try {
//        console.log("📚 Backtrace:");
//        console.log(
//            Thread.backtrace(this.context, Backtracer.ACCURATE)
//                .map(DebugSymbol.fromAddress)
//                .join("\n")
//        );
//    } catch (e) {
//        console.log("Backtrace failed:", e);
//    }
//
//
//
//    try {
//        // 在 std::string 对象周围 ±0x80 扫描
//        for (let off = -0x40; off <= 0x40; off += 4) {
//            let p;
//            try {
//                p = Memory.readPointer(ptr.add(off));
//            } catch (_) {
//                continue;
//            }
//
//            if (p.isNull()) continue;
//
//            try {
//                const s = Memory.readUtf8String(p, 64);
//                if (!s) continue;
//
//                // 文件名特征过滤
//                if (
//                    s.length >= 3 &&
//                    s.length <= 64 &&
//                    /^[a-zA-Z0-9_\-./]+$/.test(s)
//                ) {
//                    return s;
//                }
//            } catch (_) {}
//        }
//    } catch (_) {}
//
//    return "<filename not found>";
//}
//
//
//'use strict';
//
//// 你这个地址 0x...f91 是奇数，说明是 Thumb 模式入口（正常）
//// 直接 attach 这个 ptr 就行，不用额外处理。
//
//// === 读取 std::__ndk1::basic_string（与你反编译 open() 里逻辑一致）===
//// b0 = *a2
//// (b0 & 1)==0 => short: len=b0>>1, data=a2+1
//// (b0 & 1)==1 => long : len=*(a2+4), ptr=*(a2+8)
//function readStdString(strPtr) {
//  try {
//    if (strPtr.isNull()) return null;
//    const b0 = Memory.readU8(strPtr);
//    const isLong = (b0 & 1) === 1;
//    if (!isLong) {
//      const len = (b0 >> 1) & 0x7f;
//      return Memory.readUtf8String(strPtr.add(1), len);
//    } else {
//      const len = Memory.readU32(strPtr.add(4));
//      const data = Memory.readPointer(strPtr.add(8));
//      if (data.isNull()) return null;
//      return Memory.readUtf8String(data, len);
//    }
//  } catch (e) {
//    return null;
//  }
//}
//
//function extFromFlag(a3) {
//  // 你反编译里：a3!=0 => ".txt", a3==0 => ".json"
//  return (a3 !== 0) ? ".txt" : ".json";
//}
//
//Interceptor.attach(ptr("0x850b1f91"), {
//  onEnter(args) {
//    // a1=this, a2=&std::string, a3=flag
//    const flag = args[2].toInt32();
//    const base = readStdString(args[1]) || "(null)";
//    const full = base + extFromFlag(flag);
//    // 你只要文件名就打印这一行即可
//    console.log(full);
//
//
//    console.log("📚 Backtrace:");
//        console.log(
//            Thread.backtrace(this.context, Backtracer.ACCURATE)
//                .map(DebugSymbol.fromAddress)
//                .join("\n")
//        );
//  }
//});
//
//
//
//
//
//function readI32(p) { return Memory.readS32(p); }
//
//const DRAW_ADDR = ptr("0x84f92595");  // 换成 drawACardLogic 地址
//console.log(DRAW_ADDR)
//Interceptor.attach(DRAW_ADDR, {
//  onEnter(args) {
//    this.thisPtr = args[0];
//    this.a2 = args[1].toInt32();
//    this.a3 = args[2].toInt32();
//
//    // this[382] => this + 0x5F8
//    this.v38 = readI32(this.thisPtr.add(382 * 4));
//
//    // 常见计数（可选，后面和 cardConuts 相关）
//    this.c355 = readI32(this.thisPtr.add(355 * 4));
//    this.c356 = readI32(this.thisPtr.add(356 * 4));
//
//    console.log("\n🎯 drawACardLogic ENTER");
//    console.log("   this =", this.thisPtr);
//    console.log("   a2   =", ptr(this.a2), "(机器人这里你已经看到是 0)");
//    console.log("   a3   =", this.a3);
//    console.log("   this[382] =", this.v38, "(概率加成因子: +50*x)");
//    console.log("   this[355] =", this.c355, " this[356] =", this.c356);
//  },
//
//  onLeave(retval) {
//    console.log("🎯 drawACardLogic LEAVE ret =", retval.toInt32());
//  }
//});
//
//
