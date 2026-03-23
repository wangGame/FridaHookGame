'use strict';

/**
 * ==========================
 * 配置区
 * ==========================
 */

const MODULE = "libcocos2dcpp.so";

/**
 * ==========================
 * 基础工具
 * ==========================
 */
//
function hookSymbol(module, symbol, callbacks) {

    const addr = Module.findExportByName(module, symbol);

    if (!addr) {
        console.log(`❌ [MISS] ${symbol}`);
        return;
    }

    console.log(`✅ [HOOK] ${symbol} @ ${addr}`);

    Interceptor.attach(addr, callbacks);
}
//const IDA_IMAGE_BASE = ptr('0x0');
//// 如果你在 IDA 里把 libcocos2dcpp.so rebased 成 0，那么就保持 0x0
//// 如果你在 IDA 里设置了别的 image base（比如 0x10000000），就改成对应值
//
//function fmtPtr(p) {
//  return ptr(p).toString();
//}
//function fmtHex32(u) {
//  // 打印成 8 位（32-bit）十六进制
//  const x = (u >>> 0).toString(16);
//  return "0x" + ("00000000".slice(x.length) + x);
//}
//
//function hookSymbol(moduleName, symbol, callbacks) {
//
//    const mod = Process.getModuleByName(moduleName);
//
//    const sym = mod.enumerateSymbols().find(s => s.name === symbol);
//
//    if (!sym) {
//        console.log(`❌ [MISS] ${symbol}`);
//        return null;
//    }
//
//    const addr = sym.address;
//
//    const rva = addr.sub(mod.base);
//    const idaAddr = IDA_IMAGE_BASE.add(rva);
//
//    console.log(
//        `✅ [HOOK] ${symbol}\n` +
//        `    VA  = ${addr}\n` +
//        `    RVA = ${rva}\n` +
//        `    IDA = ${idaAddr}\n`
//    );
//
//    Interceptor.attach(addr, callbacks);
//
//    return addr;
//}

function hookAll() {

    console.log("\n==========================");
    console.log("🚀 Start Hooking Symbols");
    console.log("==========================\n");

    HOOKS.forEach(h => {

        hookSymbol(MODULE, h.symbol, {
            onEnter: h.onEnter,
            onLeave: h.onLeave
        });

    });

}

/**
 * ==========================
 * cocos2d::log 专用解析
 * ==========================
 */

function parseCocosLog(args) {

    let fmt;

    try {
        fmt = args[0].readCString();
    } catch {
        return;
    }

    console.log(`\n📝 cocos2d::log -> ${fmt}`);

    const specs = fmt.match(/%[sdif]/g);
    if (!specs) return;

    let idx = 1;

    specs.forEach((spec, i) => {

        try {

            const a = args[idx++];

            if (spec === "%s") {
                console.log(`   arg${i+1} (str) =`, a.readCString());
            }

            else if (spec === "%f") {
                console.log(`   arg${i+1} (float) =`, a.readFloat());
            }

            else {
                console.log(`   arg${i+1} (int) =`, a.toInt32());
            }

        } catch {

            console.log(`   arg${i+1} <invalid>`);

        }

    });

}
function analyzeStruct(base, size) {

    console.log("\n======= STRUCT ANALYZE =======");

    for (var i = 0; i < size; i += 4) {

        var addr = base.add(i);
        var val = addr.readU32();

        var type = "int";

        // 判断 pointer
        if (val > 0x10000000 && val < 0xF0000000) {
            type = "ptr";
        }

        // 判断小整数（状态）
        if (val >= 0 && val <= 20) {
            type = "state";
        }

        console.log(
            "0x" + i.toString(16).padStart(4, "0"),
            " -> ",
            val,
            " (" + type + ")"
        );
    }

    console.log("======= END STRUCT =======");
}
/**
 * ==========================
 * Hook 配置
 * ==========================
 */

const HOOKS = [
//    {
//        name: "Player::getStatistics",
//        symbol: "_ZN6Player13getStatisticsE11ELevelModel",
//        onEnter(args) {
//            console.log("\n🎯 Player::getStatistics ENTER");
//            console.log("   this =", args[0]);
//            console.log("   levelModel =", args[1].toInt32());
//        },
//        onLeave(retval) {
//            console.log("🎯 Player::getStatistics LEAVE");
//            console.log("   return =", retval.toInt32());
//        }
//    },

//    {
//        name: "Player::getCurrStatistics",
//        symbol: "_ZN6Player17getCurrStatisticsEv",
//        onEnter(args) {
//            console.log("\n🎯 Player::getCurrStatistics ENTER");
//            console.log("   this =", args[0]);
//        },
//        onLeave(retval) {
//            console.log("🎯 Player::getCurrStatistics LEAVE");
//            console.log("   return =", retval.readPointer());
//        }
//    },
    {
        name: "LevelBase::levelStartStatistics",
        symbol: "_ZN9LevelBase20levelStartStatisticsEv",
        onEnter(args) {
            console.log("\n🎯 LevelBase::levelStartStatistics ENTER");
            console.log("   this =", args[0]);
        },
        onLeave(retval) {
            console.log("🎯 LevelBase::levelStartStatistics LEAVE");
            console.log("   return =", retval.toInt32());
        }
    },

    {
        name: "LevelBase::levelRoundStatistics",
        symbol: "_ZN9LevelBase20levelRoundStatisticsEv",
        onEnter(args) {
            console.log("\n🎯 LevelBase::levelRoundStatistics ENTER");
            console.log("   this =", args[0]);
        },
        onLeave(retval) {
            console.log("🎯 LevelBase::levelRoundStatistics LEAVE");
            console.log("   return =", retval.toInt32());
        }
    },
//
//{
//        name: "Level::_ZN8CardDataC2ERKS_",
//        symbol: "_ZN8CardDataC2ERKS_",
//        onEnter(args) {
//            console.log("\n🎯 Level::_ZN8CardDataC2ERKS_ ENTER");
//            console.log("   this =", args[0]);
//        },
//        onLeave(retval) {
//            console.log("🎯 Level::_ZN8CardDataC2ERKS_ LEAVE");
//            console.log("   return =", retval.toInt32());
//        }
//    },

{
        name: "Level::robotPlayAHandPointB",
        symbol: "_ZN5Level20robotPlayAHandPointBERNSt6__ndk16vectorIiNS0_9allocatorIiEEEERNS1_IS4_NS2_IS4_EEEE",
        onEnter(args) {
            console.log("\n🎯 Level::robotPlayAHandPointB ENTER");
            console.log("   this =", args[0]);
            console.log("   this =", args[1]);
            console.log("   this =", args[2]);
            console.log("   this =", args[3]);
        },
        onLeave(retval) {
            console.log("🎯 Level::robotPlayAHandPointB LEAVE");
            console.log("   return =", retval.toInt32());
        }
    },

{

        name: "Level::blockLogic1",
        symbol: "_ZN5Level11blockLogic1ERNSt6__ndk16vectorIiNS0_9allocatorIiEEEERNS1_IS4_NS2_IS4_EEEE",
        onEnter(args) {



  console.log("\n🎯 Level::blockLogic1 ENTER");
            const a2 = args[1];   // 具体第几个参数要看平台调用约定

//
//for (let i = 377; i <= 383; i++) {
//    const off = i * 4;
//    const val = Memory.readS32(a2.add(off));
//    console.log(`a2[${i}] -> a2+0x${off.toString(16).toUpperCase()} = ${val}`);
//}


for (let i = 0; i < 512; i++) {   // 512个int = 0x800字节
    try {
        const val = Memory.readS32(a2.add(i * 4));
        console.log(`a2[${i}] = ${val}`);
    } catch (e) {
        console.log(`a2[${i}] ❌ invalid`);
        break;
    }
}

        },
        onLeave(retval) {
      console.log("🎯 Level::blockLogic1 LEAVE");
        console.log("return =", retval);
        }
    },

{
        name: "Level::blockLogic2",
        symbol: "_ZN5Level11blockLogic2ERNSt6__ndk16vectorIiNS0_9allocatorIiEEEERNS1_IS4_NS2_IS4_EEEE",
        onEnter(args) {
            console.log("\n🎯 Level::blockLogic2 ENTER");
            console.log("   this =", args[0]);
        },
        onLeave(retval) {
            console.log("🎯 Level::blockLogic2 LEAVE");
            console.log("   return =", retval.toInt32());
        }
    },

{
        name: "Level::playLogic",
        symbol: "_ZN5Level9playLogicERNSt6__ndk16vectorIiNS0_9allocatorIiEEEERNS1_IS4_NS2_IS4_EEEE",
        onEnter(args) {
            console.log("\n🎯 Level::playLogic ENTER");
            console.log("   this =", args[0]);
        },
        onLeave(retval) {
            console.log("🎯 Level::playLogic LEAVE");
            console.log("   return =", retval.toInt32());
        }
    },

    {
        name: "Level::getRobotPlayAHandInfo",
        symbol: "_ZN5Level21getRobotPlayAHandInfoEv",
        onEnter(args) {
            console.log("\n🎯 Level::getRobotPlayAHandInfo ENTER");
            console.log("   this =", args[0]);
        },
        onLeave(retval) {
            console.log("🎯 Level::getRobotPlayAHandInfo LEAVE");
            console.log("   return =", retval.toInt32());
        }
    },

    {
        name: "LevelBase::levelEndStatistics",
        symbol: "_ZN9LevelBase18levelEndStatisticsEv",
        onEnter(args) {
            console.log("\n🎯 LevelBase::levelEndStatistics ENTER");
            console.log("   this =", args[0]);
        },
        onLeave(retval) {
            console.log("🎯 LevelBase::levelEndStatistics LEAVE");
            console.log("   return =", retval.toInt32());
        }
    },

    {
        name: "Statistics::updateLevelSta",
        symbol: "_ZN10Statistics14updateLevelStaE11ELevelModelbP9LevelData",
        onEnter(args) {
            console.log("\n🎯 Statistics::updateLevelSta ENTER");
            console.log("   this =", args[0]);
            console.log("   levelModel =", args[1].toInt32());
            console.log("   win =", args[2].toInt32());
            console.log("   levelData =", args[3]);
        },
        onLeave(retval) {
            console.log("🎯 Statistics::updateLevelSta LEAVE");
            console.log("   return =", retval.toInt32());
        }
    },

    {
        name: "Statistics::updateRoundSta",
        symbol: "_ZN10Statistics14updateRoundStaEb",
        onEnter(args) {
            console.log("\n🎯 Statistics::updateRoundSta ENTER");
            console.log("   this =", args[0]);
            console.log("   win =", args[1].toInt32());
        },
        onLeave(retval) {
            console.log("🎯 Statistics::updateRoundSta LEAVE");
            console.log("   return =", retval.toInt32());
        }
    },

    {
        name: "Statistics::addDiff",
        symbol: "_ZN10Statistics7addDiffEi",
        onEnter(args) {
            console.log("\n🎯 Statistics::addDiff ENTER");
            console.log("   this =", args[0]);
            console.log("   diff =", args[1].toInt32());
        },
        onLeave(retval) {
            console.log("🎯 Statistics::addDiff LEAVE");
            console.log("   return =", retval.toInt32());
        }
    },

    {
        name: "Statistics::addMultiDiff",
        symbol: "_ZN10Statistics12addMultiDiffEi",
        onEnter(args) {
            console.log("\n🎯 Statistics::addMultiDiff ENTER");
            console.log("   this =", args[0]);
            console.log("   diff =", args[1].toInt32());
        },
        onLeave(retval) {
            console.log("🎯 Statistics::addMultiDiff LEAVE");
            console.log("   return =", retval.toInt32());
        }
    },

    {
        name: "Statistics::setWinLevelCount",
        symbol: "_ZN10Statistics16setWinLevelCountEi",
        onEnter(args) {
            console.log("\n🎯 Statistics::setWinLevelCount ENTER");
            console.log("   this =", args[0]);
            console.log("   winCount =", args[1].toInt32());
        },
        onLeave(retval) {
            console.log("🎯 Statistics::setWinLevelCount LEAVE");
            console.log("   return =", retval.toInt32());
        }
    },

//    {
//        name: "Statistics::setWinRoundCount",
//        symbol: "_ZN10Statistics16setWinRoundCountEi",
//        onEnter(args) {
//            console.log("\n🎯 Statistics::setWinRoundCount ENTER");
//            console.log("   this =", args[0]);
//            console.log("   winRound =", args[1].toInt32());
//        },
//        onLeave(retval) {
//            console.log("🎯 Statistics::setWinRoundCount LEAVE");
//            console.log("   return =", retval.toInt32());
//        }
//    }
//    ,
    {
        name: "cocos2d::log",
        symbol: "_ZN7cocos2d3logEPKcz",
        onEnter(args) {
            parseCocosLog(args);
        }
    },
    {
        name: "Level::robotDrawCard",
        symbol: "_ZN5Level13robotDrawCardEv",
        onEnter(args) {
            console.log("\n🤖 robotDrawCard");
            console.log("   this   =", args[0]);
            console.log("   reason =", args[1].toInt32());
             Thread.backtrace(this.context, Backtracer.ACCURATE)
            .forEach((addr, i) => {
                const sym = DebugSymbol.fromAddress(addr);
                console.log(
                    `   #${i} ${addr} ${sym.name || ""} ${sym.moduleName || ""}`
                );
            });
        },
        onLeave(retval) {
            console.log("   return =", retval.toInt32());
        }
    },
    {
        name: "Level::robotChangeCard",
        symbol: "_ZN5Level15robotChangeCardEv", // ⚠️ 以你实际符号为准
        onEnter(args) {
            console.log("\n🎯 robotChangeCard ENTER");
            console.log("   this =", args[0]);
            console.log("   arg =", args[1]);
        },
        onLeave(retval) {
             console.log("   robotChangeCard =====================", retval.toInt32());
//              retval.replace(2);
            console.log("   return =", retval.toInt32());
        }
    },
    {
        name: "Level::robotPlayHand",
        symbol: "_ZN6UIGame13robotPlayHandEi10EDirection", // ⚠️ 以你实际符号为准
        onEnter(args) {
            console.log("\n🎯 robotPlayHand ENTER");
            console.log("   this =", args[0]);
            console.log("   arg =", args[1]);
        },
        onLeave(retval) {
            console.log("   return =", retval.toInt32());
        }
    },
        {
        name: "Level::robotChangeLogic",
        symbol: "_ZN5Level16robotChangeLogicEi", // ⚠️ 以你实际符号为准
        onEnter(args) {
            console.log("\n🎯 robotChangeLogic ENTER");
            console.log("   this =", args[0]);
            console.log("   arg =", args[1]);
        },onLeave(retval) {
            console.log("   original return =", retval.toInt32());

            console.log("   patched return  =", retval.toInt32());
        }
    },
//    {
//        name: "Level::IsVer4TestB",
//        symbol: "_ZN11SHUtilities11IsVer4TestBEv", // ⚠️ 以你实际符号为准
//        onEnter(args) {
//            console.log("\n🎯 IsVer4TestB ENTER");
//            console.log("   this =", args[0]);
//            console.log("   arg =", args[1]);
//        },onLeave(retval) {
//            console.log("   original return =", retval.toInt32());
//            retval.replace(1);
//            console.log("   patched return  =", retval.toInt32());
//        }
//    },
    {
        name: "Level::robotDrawNoCard",
        symbol: "_ZN5Level15robotDrawNoCardEv", // ⚠️ 以你实际符号为准
        onEnter(args) {
            console.log("\n🎯 robotDrawNoCard ENTER");
            console.log("   this =", args[0]);
            console.log("   arg =", args[1]);
        },onLeave(retval) {
            console.log("   original return =", retval.toInt32());
            retval.replace(5);
            console.log("   patched return  =", retval.toInt32());
        }
    },
    {
        name: "Level::endRobotRound",
        symbol: "_ZN7UIGameB13endRobotRoundEfb", // ⚠️ 以你实际符号为准
        onLeave(retval) {
            console.log("   return =", retval.toInt32());
        },
        onEnter(args) {
            console.log("\n🎯 endRobotRound ENTER");
            console.log("   this =", args[0]);
            console.log("   arg =", args[1]);
        }
    },
    {
        name: "Level::endLevel",
        symbol: "_ZN5Level8endLevelEb", // ⚠️ 以你实际符号为准
        onLeave(retval) {
            console.log("   return =", retval.toInt32());
        },
        onEnter(args) {
            console.log("\n🎯 endLevel ENTER");
            console.log("   this =", args[0]);
            console.log("   arg =", args[1]);
        }
    },
//     {
//        name: "Level::calcRobotPointFailOdds",
//        symbol: "_ZN5Level22calcRobotPointFailOddsEv", // ⚠️ 以你实际符号为准
//        onEnter(args) {
//            console.log("\n🎯 calcRobotPointFailOdds ENTER");
//            console.log("   this =", args[0]);
//            console.log("   arg =", args[1]);
//         },onLeave(retval) {
//            console.log("   return =", retval.toInt32());
//        }
//    },
    {
        name: "Level::calcDrawACardOdds",
        symbol: "_ZN5Level17calcDrawACardOddsEb", // ⚠️ 以你实际符号为准
        onEnter(args) {
            console.log("\n🎯 calcDrawACardOdds ENTER");
            console.log("   this =", args[0]);
            console.log("   arg =", args[1]);
        },
        onLeave(retval) {
            console.log("   original return =", retval.toInt32());
            // 🔥 强制修改返回值为 0
            retval.replace(0);
            console.log("   patched return  =", retval.toInt32());
        }
    },
    {
        name: "Level::playLogicGeneral",
        symbol: "_ZN5Level16playLogicGeneralERNSt6__ndk16vectorIiNS0_9allocatorIiEEEERNS1_IS4_NS2_IS4_EEEE", // ⚠️ 以你实际符号为准
        onEnter(args) {
            console.log("\n🎯 playLogicGeneral ENTER");
            console.log("   this =", args[0]);
            console.log("   arg =", args[1]);
        },onLeave(retval) {
            console.log("   return =", retval.toInt32());
        }
    },
    {
        name: "Level::drawACardLogic",
        symbol: "_ZN5Level14drawACardLogicEbi", // ⚠️ 以你实际符号为准
        onEnter(args) {
            console.log("\n🎯 drawACardLogic ENTER");
            console.log("   this =", args[0]);
            console.log("   arg =", args[1]);
        },onLeave(retval) {
            console.log("   original return ", retval.toInt32());
            // 🔥 强制修改返回值为 0
            console.log("   patched return ", retval.toInt32());
        }
    },
    {
        name: "Level::changeLuckyDrawLogic",
        symbol: "_ZN5Level20changeLuckyDrawLogicEii", // ⚠️ 以你实际符号为准
        onLeave(retval) {
            console.log("   return =", retval.toInt32());
        },
        onEnter(args) {
            console.log("\n🎯 changeLuckyDrawLogic ENTER");
            console.log("   this =", args[0]);
            console.log("   arg =", args[1]);
        }
    },
    {
        name: "Level::lottoCard",
        symbol: "_ZN6UIGame9lottoCardEbb", // ⚠️ 以你实际符号为准
        onEnter(args) {
            console.log("\n🎯 lottoCard ENTER");
            console.log("   this =", args[0]);
            console.log("   arg =", args[1]);
        },onLeave(retval){
            console.log("   return =", retval.toInt32());
        }
    },
    {
        name: "Level::robotPlayAHandLogicB",
        symbol: "_ZN5Level20robotPlayAHandLogicBERNSt6__ndk16vectorIiNS0_9allocatorIiEEEERNS1_IS4_NS2_IS4_EEEE", // ⚠️ 以你实际符号为准
        onEnter(args) {
            console.log("\n🎯 robotPlayAHandLogicB ENTER");
            console.log("   this =", args[0]);
            console.log("   arg =", args[1]);
            console.log("   arg =", args[2]);
            console.log("   arg =", args[3]);

//            Thread.backtrace(this.context, Backtracer.ACCURATE)
//                .forEach((addr, i) => {
//                    const sym = DebugSymbol.fromAddress(addr);
//                    console.log(
//                        `   #${i} ${addr} ${sym.name || ""} ${sym.moduleName || ""}`
//                    );
//            });
        },onLeave(retval){
            console.log("   return =", retval.toInt32());
        }
    },
    {
        name: "Level::startRobotRound",
        symbol: "_ZN6UIGame15startRobotRoundEv", // ⚠️ 以你实际符号为准
        onEnter(args) {
            console.log("\n🎯 startRobotRound ENTER");
            console.log("   this =", args[0]);
            console.log("   arg =", args[1]);
        },onLeave(retval){
            console.log("   return =", retval.toInt32());
        }
    },
    {
        name: "LevelData::randomRobot",
        symbol: "_ZN9LevelData11randomRobotE11ELevelModel", // ⚠️ 以你实际符号为准
        onEnter(args) {
                 console.log("LevelData::randomRobot")
                 console.log(args[1])
        },onLeave(retval){
            console.log("   return =", retval.toInt32());
        }
    }
    ,
     {
        name: "ConfigManager::open",
        symbol: "_ZN13ConfigManager4openERKNSt6__ndk112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEEb", // ⚠️ 以你实际符号为准
          onEnter(args) {
            console.log("\n🎯 ConfigManager::open");

            // a1=this, a2=&std::string, a3=flag
            const flag = args[2].toInt32();
            const base = readStdString(args[1]) || "(null)";
            const full = base + extFromFlag(flag);
            // 你只要文件名就打印这一行即可
            console.log(full);


//            console.log("📚 Backtrace:");
//                console.log(
//                    Thread.backtrace(this.context, Backtracer.ACCURATE)
//                        .map(DebugSymbol.fromAddress)
//                        .join("\n")
//                );
          },onLeave(retval){
            console.log("   return =", retval.toInt32());
        }
    },
     {
        name: "SHUtilities::IsTestMode",
        symbol: "_ZN11SHUtilities10IsTestModeEv", // ⚠️ 以你实际符号为准
        onEnter(args) {
            console.log("\n🎯 SHUtilities::IsTestMode");
            console.log("   this =", args[0]);
            console.log("   arg =", args[1]);
        },onLeave(retval) {
            console.log("   original return =", retval.toInt32());
//            retval.replace(1);
            console.log("   patched return  =", retval.toInt32());
        }
    }
];

function hookRetInt(name, addr) {
  Interceptor.attach(ptr(addr), {
    onEnter(args) {
      this.thiz = args[0];
    },
    onLeave(retval) {
      console.log(`📌 ${name} this=${this.thiz} ret=${retval.toInt32()} (0x${retval.toUInt32().toString(16)})`);
    }
  });
}
/**
 * ==========================
 * 等待 SO 加载
 * ==========================
 */

function waitForSoLoad() {

    const dlopen = Module.findExportByName(null, "dlopen");
    const android_dlopen_ext = Module.findExportByName(null, "android_dlopen_ext");

    function hook_dlopen(addr) {

        if (!addr) return;

        Interceptor.attach(addr, {

            onEnter(args) {

                this.path = args[0].readCString();

            },

            onLeave(retval) {

                if (!this.path) return;

                if (this.path.indexOf(MODULE) !== -1) {

                    console.log("\n📦 SO Loaded:", this.path);

                    setTimeout(function(){

                        hookAll();

                    }, 100);

                }

            }

        });

    }

    hook_dlopen(dlopen);
    hook_dlopen(android_dlopen_ext);

}

/**
 * ==========================
 * 启动入口
 * ==========================
 */

setImmediate(function () {

    console.log("Frida Script Start");

    const m = Process.findModuleByName(MODULE);

    if (m) {

        console.log("✅ SO already loaded");

        hookAll();

    } else {

        console.log("⏳ Waiting for SO load...");

        waitForSoLoad();

    }

});


// 你这个地址 0x...f91 是奇数，说明是 Thumb 模式入口（正常）
// 直接 attach 这个 ptr 就行，不用额外处理。

// === 读取 std::__ndk1::basic_string（与你反编译 open() 里逻辑一致）===
// b0 = *a2
// (b0 & 1)==0 => short: len=b0>>1, data=a2+1
// (b0 & 1)==1 => long : len=*(a2+4), ptr=*(a2+8)
function readStdString(strPtr) {
  try {
    if (strPtr.isNull()) return null;
    const b0 = Memory.readU8(strPtr);
    const isLong = (b0 & 1) === 1;
    if (!isLong) {
      const len = (b0 >> 1) & 0x7f;
      return Memory.readUtf8String(strPtr.add(1), len);
    } else {
      const len = Memory.readU32(strPtr.add(4));
      const data = Memory.readPointer(strPtr.add(8));
      if (data.isNull()) return null;
      return Memory.readUtf8String(data, len);
    }
  } catch (e) {
    return null;
  }
}

function extFromFlag(a3) {
  // 你反编译里：a3!=0 => ".txt", a3==0 => ".json"
  return (a3 !== 0) ? ".txt" : ".json";
}