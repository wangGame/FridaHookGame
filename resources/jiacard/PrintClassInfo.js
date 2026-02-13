'use strict';

/**
 * Dump all methods of the class that owns a given MethodInfo*
 * Example input: Delay.DelayViewManager::Update MethodInfo* = 0x837a54a0
 *
 * Notes:
 * - Your device is ARM32 (lib/arm/), so Thumb bit may appear in code pointers.
 * - il2cpp_method_get_pointer export is missing in your build; we read methodPointer from MethodInfo* by heuristics.
 */

const IL2CPP = "libil2cpp.so";

// ====== CONFIG: your example MethodInfo* ======
const TARGET_METHODINFO = ptr("0x837f79b8"); // Delay.DelayViewManager::Update method = 0x837a54a0

// ====== basic helpers ======
function cstr(p) { return p.isNull() ? "" : p.readCString(); }

function normalizeArm32Thumb(p) {
  // On ARM32, code pointers may have LSB=1 to indicate Thumb.
  if (Process.arch === "arm" && !p.isNull() && p.and(1).toInt32() === 1) {
    return p.and(ptr("0xfffffffe"));
  }
  return p;
}

function isExecutableCodePtr(p) {
  if (p.isNull()) return false;
  const r = Process.findRangeByAddress(p);
  if (!r) return false;
  return r.protection.indexOf("x") !== -1;
}

function exp(name) {
  const p = Module.findExportByName(IL2CPP, name);
  if (!p) throw new Error("missing export: " + name);
  return p;
}

// ====== module info ======
const il2cppMod = Process.getModuleByName(IL2CPP);
const IL2CPP_BASE = il2cppMod.base;

console.log("[*] libil2cpp.so base =", IL2CPP_BASE, "size =", il2cppMod.size);
console.log("[*] libil2cpp.so path =", il2cppMod.path);

// ====== il2cpp APIs (exports you confirmed exist) ======
const il2cpp_class_get_methods   = new NativeFunction(exp("il2cpp_class_get_methods"), "pointer", ["pointer", "pointer"]);
const il2cpp_class_get_name      = new NativeFunction(exp("il2cpp_class_get_name"), "pointer", ["pointer"]);
const il2cpp_class_get_namespace = new NativeFunction(exp("il2cpp_class_get_namespace"), "pointer", ["pointer"]);

const il2cpp_method_get_name  = new NativeFunction(exp("il2cpp_method_get_name"), "pointer", ["pointer"]);
const il2cpp_method_get_class = new NativeFunction(exp("il2cpp_method_get_class"), "pointer", ["pointer"]);

// ====== read native impl from MethodInfo* (since il2cpp_method_get_pointer is missing) ======
function getMethodImplFromMethodInfo(methodInfo) {
  methodInfo = ptr(methodInfo);

  // On ARM32, pointers are 4 bytes. methodPointer is typically very early in MethodInfo.
  // We'll scan a few candidate offsets and pick the first that looks like an executable code pointer.
  const candidates = [
    0x0, 0x4, 0x8, 0xC,
    0x10, 0x14, 0x18, 0x1C,
    0x20, 0x24, 0x28, 0x2C,
    0x30, 0x34, 0x38, 0x3C
  ];

  for (const off of candidates) {
    let p;
    try {
      p = methodInfo.add(off).readPointer();
    } catch (e) {
      continue;
    }
    const real = normalizeArm32Thumb(p);
    if (isExecutableCodePtr(real)) return real;
  }
  return NULL;
}

function toIl2cppOffset(codePtr) {
  const real = normalizeArm32Thumb(ptr(codePtr));
  return real.sub(IL2CPP_BASE);
}

// ====== dump all methods for a class identified by a MethodInfo* ======
function dumpClassMethodsFromMethodInfo(methodInfo) {
  const mi = ptr(methodInfo);
  const klass = il2cpp_method_get_class(mi);

  const ns = cstr(il2cpp_class_get_namespace(klass));
  const cn = cstr(il2cpp_class_get_name(klass));

  console.log("\n==============================");
  console.log(`Class: ${ns}.${cn}`);
  console.log("MethodInfo* (seed) =", mi);
  console.log("klass              =", klass);
  console.log("==============================\n");

  const iter = Memory.alloc(Process.pointerSize);
  iter.writePointer(NULL);

  let idx = 0;
  while (true) {
    const m = il2cpp_class_get_methods(klass, iter);
    if (m.isNull()) break;

    const name = cstr(il2cpp_method_get_name(m));
    const impl = getMethodImplFromMethodInfo(m);

    idx++;

    if (!impl.isNull()) {
      const off = toIl2cppOffset(impl);
      console.log(
        `${String(idx).padStart(3)}  ${name}  ->  ${impl}  (offset ${off})`
      );
    } else {
      console.log(
        `${String(idx).padStart(3)}  ${name}  ->  NULL (no impl / abstract / generic?)`
      );
    }
  }

  console.log("\n[*] Tip for IDA:");
  console.log("    - If IDA imagebase = 0, press G and jump to the printed offset.");
  console.log("    - ARM32 Thumb is already normalized (LSB cleared) in offsets.\n");

  return { klass, ns, cn };
}

// ====== optional: attach to the seed method's impl to verify it's running ======
function tryAttachSeedMethod(methodInfo, expectedFullName) {
  const impl = getMethodImplFromMethodInfo(methodInfo);
  if (impl.isNull()) {
    console.log("[!] Seed MethodInfo* has no detectable impl; cannot attach.");
    return;
  }

  const off = toIl2cppOffset(impl);
  console.log(`[+] Seed impl for ${expectedFullName}:`, impl, `(offset ${off})`);

  Interceptor.attach(impl, {
    onEnter(args) {
      console.log(`[CALL] ${expectedFullName} @ ${impl}`);
    }
  });
}

// ====== run ======
const seedName = "Delay.DelayViewManager::Update";
const info = dumpClassMethodsFromMethodInfo(TARGET_METHODINFO);

// 如果你想确认 Update 是否真的在跑，把下面这行保留；不想刷屏就注释掉
tryAttachSeedMethod(TARGET_METHODINFO, seedName);

// expose function to call manually in console if needed
globalThis.dumpClassMethodsFromMethodInfo = dumpClassMethodsFromMethodInfo;
globalThis.getMethodImplFromMethodInfo = getMethodImplFromMethodInfo;
globalThis.toIl2cppOffset = toIl2cppOffset;

console.log("[+] done. (You can call dumpClassMethodsFromMethodInfo(ptr('0x...')) anytime.)");
