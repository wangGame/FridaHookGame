'use strict';

// 你日志里打印的
const rawVtable = ptr("0x7c984325");

// ✅ 关键：vtable 地址必须去掉 thumb 位
const vtable = rawVtable.and(ptr("0xFFFFFFFE"));

console.log("🧠 Level vtable aligned =", vtable);

// vfunc +0x10
let rawFunc = vtable.add(0x10).readU32();

// 再给函数补回 THUMB 位
let func = ptr(rawFunc | 1);

console.log("🎯 Level vfunc +0x10 =", func);

Interceptor.attach(func, {
    onEnter(args) {
        console.log("➡️ Level vfunc ENTER");
        console.log("   this =", args[0]);
    },
    onLeave(retval) {
        console.log("⬅️ Level vfunc LEAVE");
    }
});


//'use strict';
//
///**
// * =========================================
// * Player::onGameEvent 控制器
// * =========================================
// */
//
//// 1️⃣ 找 thunk 地址
//const addr = Module.findExportByName(
//    "libcocos2dcpp.so",
//    "_ZN6Player12getLevelDataE11ELevelModel"
//);
//
//console.log("[*] settleLogic thunk =", addr);
//if (addr.isNull()) {
//    console.log("[-] symbol not found");
//}
//
//// 2️⃣ std::string (libc++ / NDK) 解析
//function readStdString(strRef) {
//    try {
//        const dataPtr = strRef
//            .add(Process.pointerSize)
//            .readPointer();
//        return dataPtr.readCString();
//    } catch (e) {
//        return "<parse failed>";
//    }
//}
//
//// 3️⃣ 控制开关（你只改这里）
//const CONTROL = {
//    logAllEvents: true,        // 打印所有事件
//    forceSelectCard: true,     // 强制选牌
//    forcedIndex: 0,            // 永远选第 0 张
//    blockAI: false,            // 是否屏蔽 AI 行为
//    onlyPlayer: true           // 只控制玩家（不动 AI）
//};
//
//// 4️⃣ Hook thunk
//Interceptor.attach(addr, {
//    onEnter(args) {
//        console.log(args[0])
//        console.log(args[1])
//
//
////        /*
////            a1 -> this
////            a2 -> std::string const&
////            a3 -> int (index / code)
////        */
////        const thisPtr = args[0];
////        const strRef  = args[1];
////        const index   = args[2].toInt32();
////        const event   = readStdString(strRef);
////        console.log(event)
////        console.log(thisPtr)
////        console.log(index)
////
////
////        // 记录
////        if (CONTROL.logAllEvents) {
////            console.log(
////                `[onGameEvent] event="${event}" index=${index} this=${thisPtr}`
////            );
////        }
////
////        /**
////         * ==============================
////         * 🎯 控制逻辑区（核心）
////         * ==============================
////         */
////
////        // 1️⃣ 选牌事件（最常见、最有价值）
////        if (CONTROL.forceSelectCard &&
////            (event === "select_card" || event.indexOf("SelectCard") !== -1)) {
////
////            console.log(">>> [CONTROL] force select card");
////
////            args[2] = ptr(CONTROL.forcedIndex);
////            return;
////        }
////
////        // 2️⃣ AI 行为拦截（直接让 AI 不动）
////        if (CONTROL.blockAI &&
////            (event.indexOf("ai") !== -1 || event.indexOf("robot") !== -1)) {
////
////            console.log(">>> [CONTROL] block AI event");
////            args[2] = ptr(-1); // 很多游戏 -1 = ignore
////            return;
////        }
////
////        // 3️⃣ 回合开始（可以用来重置状态）
////        if (event === "round_start") {
////            console.log(">>> round start");
////        }
////
////        // 4️⃣ 回合结束（统计 / 调试）
////        if (event === "round_end") {
////            console.log(">>> round end");
////        }
////
////        // 5️⃣ 兜底：记录未知事件
////        if (event === "<parse failed>") {
////            console.log("!!! unknown string layout");
////        }
//    },
//    onLeave(retval) {
//        // 如果你想强制成功返回
//        // retval.replace(1);
//    }
//});


//'use strict';

//int __fastcall Level::startLevel(int a1, int a2, int a3)
// a2是模式
// a3是存储还是新开
// v10 = 150;  局的分数


//const soName   = "libcocos2dcpp.so";      // 替换为你的实际 so
//const funcName = "_ZN9LevelData14randomOterInfoE11ELevelModel"; // 替换为你的实际函数名
//
//const addr = Module.findExportByName(soName, funcName);
//console.log("[+] cards2Str @", addr);
//
//Interceptor.attach(addr, {
//    onEnter(args) {
//        console.log("xxxxxxxxxxxxxxxxx"+args[1].toInt32());
////        this.keyPtr = args[1];
////        this.keyStr = this.keyPtr.readCString(); // 读取 C 字符串
////        console.log("🟢 getStringForKey key =", this.keyStr);
//
//
//    },
//
//    onLeave(retval) {
//        console.log("🔵 getPlayCnt return =", retval.toInt32());
//    }
//});



//
//const libName = "libcocos2dcpp.so"; // 或实际所在 so
//const symbolName = "_ZN11DataManager9getPlayerEv";
//
//const getPlayerAddr = Module.findExportByName(libName, symbolName);
//
//if (!getPlayerAddr) {
//    console.log("❌ getPlayer not found");
//}
//
//console.log("✅ DataManager::getPlayer =", getPlayerAddr);
//
//Interceptor.attach(getPlayerAddr, {
//    onEnter(args) {
//        // this 指针
//        this.dm = args[0];
//        console.log("➡️ getPlayer ENTER");
//        console.log("   DataManager this =", this.dm);
//    },
//    onLeave(retval) {
//        console.log("⬅️ getPlayer LEAVE");
//        console.log("   Player* =", retval);
//
//        if (!retval.isNull()) {
//            try {
//                // Player + 3072 = Level*
//                const levelPtr = retval.add(3072).readPointer();
//                console.log("   Level* @ Player+3072 =", levelPtr);
//
//                // 如果你想继续 hook Level 的虚函数
//                const vtable = levelPtr.readPointer();
//                console.log("   Level vtable =", vtable);
//            } catch (e) {
//                console.log("⚠️ read level failed:", e);
//            }
//        }
//    }
//});
