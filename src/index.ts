// @ts-nocheck
import "frida-il2cpp-bridge";

Il2Cpp.perform(() => {
  const il2cppBase = Process.getModuleByName("libil2cpp.so").base;

  const classNameKeywords = ["DTween", "DOTween", "Tween"];
  const namespaceKeywords = ["DG.Tweening", "DTween", "Tween"];

  const methodNameAllow = [
    "Play", "Restart", "Pause", "Kill", "Complete",
    "Append", "Join", "Insert", "SetEase", "SetDelay",
    "OnComplete", "OnKill", "OnPlay", "OnPause", "OnUpdate",
    "DO", "Do", "Create", "Init", "Setup", "Start"
  ];

  const PRINT_BACKTRACE = true;
  const BACKTRACE_MAX = 18;
  const MAX_HOOKS = 400;

  const depthByTid = new Map<number, number>();
  let seq = 0;

  function tid(): number {
    return Process.getCurrentThreadId();
  }

  function indent(n: any): string {
    return "  ".repeat(Math.max(0, Number(n) || 0));
  }

  function shouldHookMethod(name: any): boolean {
    const s = String(name);
    return methodNameAllow.some(k => s.includes(k));
  }

  function looksLikeTargetClass(klass: any): boolean {
    const full = `${klass.namespace}.${klass.name}`;
    const ns = klass.namespace || "";
    const cn = klass.name || "";
    const hitName = classNameKeywords.some(k => String(cn).includes(k) || String(full).includes(k));
    const hitNs = namespaceKeywords.some(k => String(ns).includes(k) || String(full).includes(k));
    return hitName || hitNs;
  }

  function fmtMethod(m: any): string {
    const k = m.class;
    const va = m.virtualAddress;
    if (va.isNull()) return `${k.namespace}.${k.name}::${m.name} (no impl)`;
    const off = va.sub(il2cppBase);
    return `${k.namespace}.${k.name}::${m.name}  off=${off}`;
  }

  function nativeBacktrace(context: any): string {
    try {
      return Thread.backtrace(context, Backtracer.ACCURATE)
        .slice(0, BACKTRACE_MAX)
        .map(DebugSymbol.fromAddress)
        .map(s => "    " + s.toString())
        .join("\n");
    } catch (e) {
      return "    <backtrace failed>";
    }
  }

  let hooked = 0;

  for (const asm of Il2Cpp.domain.assemblies) {
    const img = asm.image;

    for (const klass of img.classes) {
      if (!looksLikeTargetClass(klass)) continue;

      for (const m of klass.methods) {
        if (m.virtualAddress.isNull()) continue;
        if (!shouldHookMethod(m.name)) continue;
        if (hooked >= MAX_HOOKS) break;

        const original = m.implementation;

        m.implementation = function (...args: any[]) {
          const id = ++seq;
          const t = tid();
          const d = depthByTid.get(t) || 0;
          depthByTid.set(t, d + 1);

          console.log(`${indent(d)}[${id}] ENTER ${fmtMethod(m)}`);

          if (PRINT_BACKTRACE) {
            try {
              // 注意：某些环境下 this.context 不可用；如果你发现没栈，我再给你 attach 版
              // @ts-ignore
              const bt = nativeBacktrace(this.context);
              console.log(bt);
            } catch (_) {}
          }

          let ret: any;
          try {
            ret = original.apply(this, args);
          } finally {
            const d2 = (depthByTid.get(t) || 1) - 1;
            depthByTid.set(t, d2);
            console.log(`${indent(d2)}[${id}] LEAVE ${fmtMethod(m)}`);
          }
          return ret;
        };

        hooked++;
      }

      if (hooked >= MAX_HOOKS) break;
    }

    if (hooked >= MAX_HOOKS) break;
  }

  console.log(`[+] hooked ${hooked} tween-ish methods.`);
  console.log(`[*] Click once and watch ENTER/LEAVE order.`);
});
