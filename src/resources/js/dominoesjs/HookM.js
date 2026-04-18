'use strict';

/**
 * ==========================
 * 配置区
 * ==========================
 */
const MODULE = "libcocos2dcpp.so";
const ENABLE_BACKTRACE = false;   // 需要堆栈就改 true
const BACKTRACE_DEPTH = 12;

/**
 * ==========================
 * 基础工具
 * ==========================
 */

function logBt(ctx) {
  if (!ENABLE_BACKTRACE) return;
  try {
    const bt = Thread.backtrace(ctx, Backtracer.ACCURATE)
      .slice(0, BACKTRACE_DEPTH)
      .map((a, i) => {
        const s = DebugSymbol.fromAddress(a);
        return `   #${i} ${a} ${s.name || ""} ${s.moduleName || ""}`;
      })
      .join("\n");
    console.log("📚 Backtrace:\n" + bt);
  } catch (e) {
    console.log("📚 Backtrace failed:", e);
  }
}

// ARM32 Thumb: 函数指针 bit0=1 表示 Thumb，attach 前清掉 bit0
function normCodePtr(p) {
  p = ptr(p);
  // 只影响 arm32 thumb；arm64 也不会坏事（bit0 本来就是 0）
  return p.and(ptr('0xfffffffe'));
}

function safeAttach(addr, callbacks) {
  const a = normCodePtr(addr);
  try {
    Interceptor.attach(a, callbacks);
    return true;
  } catch (e) {
    console.log(`❌ attach failed @ ${a} raw=${ptr(addr)} => ${e}`);
    return false;
  }
}

function hookSymbol(module, symbol, callbacks) {
  const addr = Module.findExportByName(module, symbol);
  if (!addr) {
    console.log(`❌ [MISS] ${symbol}`);
    return null;
  }
  console.log(`✅ [HOOK] ${symbol} @ ${addr}`);
  if (!safeAttach(addr, callbacks)) {
    console.log(`⚠️  failed to hook ${symbol} (addr=${addr})`);
  }
  return addr;
}

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
  try { fmt = args[0].readCString(); } catch { return; }
  console.log(`\n📝 cocos2d::log -> ${fmt}`);

  const specs = fmt.match(/%[sdif]/g);
  if (!specs) return;

  let idx = 1;
  specs.forEach((spec, i) => {
    try {
      const a = args[idx++];
      if (spec === "%s") console.log(`   arg${i+1} (str)   =`, a.readCString());
      else if (spec === "%f") console.log(`   arg${i+1} (float) =`, a.readFloat());
      else console.log(`   arg${i+1} (int)   =`, a.toInt32());
    } catch {
      console.log(`   arg${i+1} <invalid>`);
    }
  });
}

/**
 * ==========================
 * std::string 读取（libc++/ndk）
 * ==========================
 */
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
  } catch {
    return null;
  }
}

function extFromFlag(flag) {
  // 你反编译：a3!=0 => ".txt", a3==0 => ".json"
  return (flag !== 0) ? ".txt" : ".json";
}

/**
 * ==========================
 * Stats vfunc Hook / Fallback
 * ==========================
 */

let statsHooksInstalled = false;

// fallback NativeFunction（不 attach）方式：直接调用返回 int
let statsNF = {
  f28: null,
  f60: null,
  f92: null,
  initDone: false
};

function tryHookRetInt(name, addr) {
  const a = normCodePtr(addr);
  console.log(`[+] hook ${name} @ ${a} (raw=${ptr(addr)})`);
  return safeAttach(a, {
    onEnter(args) { this.thiz = args[0]; },
    onLeave(retval) {
      console.log(`📌 ${name} this=${this.thiz} ret=${retval.toInt32()} (0x${retval.toUInt32().toString(16)})`);
    }
  });
}

function buildNativeInt(codePtr) {
  const a = normCodePtr(codePtr);
  return new NativeFunction(a, 'int', ['pointer'], { abi: 'default' });
}

function ensureStatsHooks(statsPtr) {
  if (statsHooksInstalled) return;
  statsHooksInstalled = true; // 先置 true，避免失败重复刷屏

  try {
    const stats = ptr(statsPtr);
    if (stats.isNull()) return;

    const vtbl = stats.readPointer();
    const f28 = vtbl.add(0x1c).readPointer(); // +28
    const f60 = vtbl.add(0x3c).readPointer(); // +60
    const f92 = vtbl.add(0x5c).readPointer(); // +92

    console.log(`🧩 Stats object=${stats} vtbl=${vtbl}`);
    console.log(`[+] stats vfuncs raw: f28=${f28} f60=${f60} f92=${f92}`);

    // 先尝试 attach
    const ok28 = tryHookRetInt("Stats::vfunc[28]", f28);
    const ok60 = tryHookRetInt("Stats::vfunc[60]", f60);
    const ok92 = tryHookRetInt("Stats::vfunc[92]", f92);

    // 任何一个 hook 不上，就准备 NativeFunction fallback（用于你后续在调用点打印）
    if (!ok28 || !ok60 || !ok92) {
      console.log("⚠️ Some vfunc cannot be intercepted; enabling NativeFunction fallback...");
      try {
        statsNF.f28 = buildNativeInt(f28);
        statsNF.f60 = buildNativeInt(f60);
        statsNF.f92 = buildNativeInt(f92);
        statsNF.initDone = true;
        console.log("✅ NativeFunction fallback ready.");
      } catch (e) {
        console.log("❌ NativeFunction fallback build failed:", e);
      }
    }
  } catch (e) {
    console.log("❌ ensureStatsHooks failed:", e);
  }
}

/**
 * 如果你想在某个调用点“直接打印 f28/f60/f92”，可以调用它：
 */
function dumpStatsByCall(statsPtr, tag) {
  if (!statsNF.initDone) return;
  try {
    const s = ptr(statsPtr);
    if (s.isNull()) return;
    const a = statsNF.f28(s);
    const b = statsNF.f60(s);
    const c = statsNF.f92(s);
    console.log(`🧾 [${tag}] StatsCall this=${s} f28=${a} f60=${b} f92=${c}`);
  } catch (e) {
    console.log("dumpStatsByCall failed:", e);
  }
}

/**
 * ==========================
 * Hook 配置
 * ==========================
 */

const HOOKS = [
  {
    name: "cocos2d::log",
    symbol: "_ZN7cocos2d3logEPKcz",
    onEnter(args) { parseCocosLog(args); }
  },

  /**
   * Player::getCurrStatistics
   */
  {
    name: "Player::getCurrStatistics",
    symbol: "_ZN6Player17getCurrStatisticsEv",
    onEnter(args) {
      console.log("\n🎯 Player::getCurrStatistics ENTER this=", args[0]);
      logBt(this.context);
    },
    onLeave(retval) {
      const stats = retval;
      console.log("🎯 Player::getCurrStatistics RET stats =", stats);
      if (stats.isNull()) return;

      // 验证 vtbl 属于模块
      try {
        const vtbl = stats.readPointer();
        console.log("   vtbl =", vtbl);

        // 安装 stats vfunc hooks（只装一次）
//        ensureStatsHooks(stats);
      } catch (e) {
        console.log("   read vtbl failed:", e);
      }
    }
  },

  /**
   * Level::robotDrawCard
   * 注意：这个函数一般只有 this 参数，没有 args[1]！
   */
  {
    name: "Level::robotDrawCard",
    symbol: "_ZN5Level13robotDrawCardEv",
    onEnter(args) {
      this.level = args[0];
      console.log("\n🤖 Level::robotDrawCard ENTER this =", this.level);
      logBt(this.context);
    },
    onLeave(retval) {
      console.log("🤖 Level::robotDrawCard RET =", retval.toInt32());

      // 如果你想在这里顺便看 stats 三个值（fallback 情况）
      // 但你需要先能拿到 player->getCurrStatistics 的返回 stats 指针
      // 最简单：你可以用一个全局变量缓存 lastStats（见下面“缓存 lastStats”）
    }
  },

  {
    name: "Level::robotDrawNoCard",
    symbol: "_ZN5Level15robotDrawNoCardEv",
    onEnter(args) {
      console.log("\n🎯 Level::robotDrawNoCard ENTER this =", args[0]);
      logBt(this.context);
    },
    onLeave(retval) {
      console.log("🎯 Level::robotDrawNoCard RET original =", retval.toInt32());
      // 如果你要强制 >=5
      // retval.replace(5);
      // console.log("🎯 Level::robotDrawNoCard RET patched  =", retval.toInt32());
    }
  },

  {
    name: "UIGame::startRobotRound",
    symbol: "_ZN6UIGame15startRobotRoundEv",
    onEnter(args) {
      console.log("\n🎯 UIGame::startRobotRound ENTER this =", args[0]);
      logBt(this.context);
    },
    onLeave(retval) {
      console.log("🎯 UIGame::startRobotRound RET =", retval.toInt32());
    }
  },

  /**
   * ConfigManager::open 你那段是 OK 的
   */
  {
    name: "ConfigManager::open",
    symbol: "_ZN13ConfigManager4openERKNSt6__ndk112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEEb",
    onEnter(args) {
      // a1=this, a2=&std::string, a3=flag
      const flag = args[2].toInt32();
      const base = readStdString(args[1]) || "(null)";
      const full = base + extFromFlag(flag);
      console.log("\n🎯 ConfigManager::open", full);
      // logBt(this.context);
    },
    onLeave(retval) {
      console.log("🎯 ConfigManager::open RET =", retval.toInt32());
    }
  },

  /**
   * 你自己想看的其他函数也可以继续加
   * 注意：尽量别乱读 args[1]，先确认真实签名
   */
];

/**
 * ==========================
 * (可选) 缓存最近一次 stats 指针，用于在别处打印
 * ==========================
 */
let lastStats = ptr(0);

(function installStatsCache() {
  // 这里通过再 hook 一次 getCurrStatistics 来缓存 lastStats，避免你在 robotDrawCard 里拿不到 stats
  const sym = "_ZN6Player17getCurrStatisticsEv";
  const addr = Module.findExportByName(MODULE, sym);
  if (!addr) return;

  safeAttach(addr, {
    onLeave(retval) {
      if (!retval.isNull()) lastStats = retval;
      // 如果 hook vfunc attach 失败，仍可用 NativeFunction 调用打印：
      if (statsNF.initDone && !lastStats.isNull()) {
        dumpStatsByCall(lastStats, "lastStats");
      }
    }
  });
})();

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
        this.path = null;
        try { this.path = args[0].readCString(); } catch {}
      },
      onLeave(retval) {
        if (!this.path) return;
        if (this.path.indexOf(MODULE) !== -1) {
          console.log("\n📦 SO Loaded:", this.path);
          setTimeout(hookAll, 100);
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
    console.log("✅ SO already loaded:", m.base, "size=", m.size);
    hookAll();
  } else {
    console.log("⏳ Waiting for SO load...");
    waitForSoLoad();
  }
});