//🎯 FOUND → .UI_LoadingBar::.ctor method = 0x7b22aab8
//==================Run end========================
//[*] libil2cpp.so base = 0x83b87000 size = 49754112
//[*] libil2cpp.so path = /data/app/com.playvalve.dominoes-IQS9Sh_OuyTOBeh2pGusnA==/lib/arm/libil2cpp.so
//
//==============================
//Class: .UI_LoadingBar
//MethodInfo* (seed) = 0x7b22aab8
//klass              = 0x7b223a00
//==============================
//
//  1  Start  ->  0x85ee4acc  (offset 0x235dacc)
//  2  AsyncStart  ->  0x85ee4ba4  (offset 0x235dba4)
//  3  LoadSystems  ->  0x85ee4c7c  (offset 0x235dc7c)
//  4  LoadMainScene  ->  0x85ee4e38  (offset 0x235de38)
//  5  get_MainSystemsInitialized  ->  0x85ee4f14  (offset 0x235df14)
//  6  get_IsLoadingDone  ->  0x85ee4f1c  (offset 0x235df1c)
//  7  .ctor  ->  0x85ee4f24  (offset 0x235df24)
//  8  <AsyncStart>b__14_0  ->  0x85ee4f2c  (offset 0x235df2c)
//  9  <AsyncStart>g__OnPause|14_1  ->  0x85ee4f84  (offset 0x235df84)
// 10  <AsyncStart>b__14_2  ->  0x85ee5018  (offset 0x235e018)
// 11  <AsyncStart>b__14_3  ->  0x85ee5070  (offset 0x235e070)
// 12  <LoadSystems>g__callback|15_0  ->  0x85ee525c  (offset 0x235e25c)
// 13  <LoadSystems>b__15_1  ->  0x85ee5314  (offset 0x235e314)
//
//[*] Tip for IDA:
//    - If IDA imagebase = 0, press G and jump to the printed offset.
//    - ARM32 Thumb is already normalized (LSB cleared) in offsets.
//
//[+] Seed impl for Delay.DelayViewManager::Update: 0x85ee4f24 (offset 0x235df24)
//[+] done. (You can call dumpClassMethodsFromMethodInfo(ptr('0x...')) anytime.)
//
//==================Run end========================
'use strict';

const IL2CPP = "libil2cpp.so";
const addrX = "0x83a09000";
const TARGET_METHODINFO = ptr(addrX);

// ================= helpers =================

function cstr(p) { return p.isNull() ? "" : p.readCString(); }

function normalizeArm32Thumb(p) {
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

// ================= module =================

const il2cppMod = Process.getModuleByName(IL2CPP);
const IL2CPP_BASE = il2cppMod.base;

console.log("[*] libil2cpp.so base =", IL2CPP_BASE);
console.log("[*] libil2cpp.so path =", il2cppMod.path);

// ================= il2cpp API =================

const il2cpp_class_get_methods =
  new NativeFunction(exp("il2cpp_class_get_methods"), "pointer", ["pointer", "pointer"]);

const il2cpp_class_get_name =
  new NativeFunction(exp("il2cpp_class_get_name"), "pointer", ["pointer"]);

const il2cpp_class_get_namespace =
  new NativeFunction(exp("il2cpp_class_get_namespace"), "pointer", ["pointer"]);

const il2cpp_method_get_name =
  new NativeFunction(exp("il2cpp_method_get_name"), "pointer", ["pointer"]);

const il2cpp_method_get_class =
  new NativeFunction(exp("il2cpp_method_get_class"), "pointer", ["pointer"]);

const il2cpp_class_get_nested_types =
  new NativeFunction(exp("il2cpp_class_get_nested_types"), "pointer", ["pointer", "pointer"]);

// ================= MethodInfo impl resolver =================

function getMethodImplFromMethodInfo(methodInfo) {
  methodInfo = ptr(methodInfo);

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

// ================= nested dumper (recursive) =================

function dumpNestedRecursive(klass, depth) {

  const iter = Memory.alloc(Process.pointerSize);
  iter.writePointer(NULL);

  let nested;

  while (!(nested = il2cpp_class_get_nested_types(klass, iter)).isNull()) {

    const ns = cstr(il2cpp_class_get_namespace(nested));
    const name = cstr(il2cpp_class_get_name(nested));

    const indent = "  ".repeat(depth);

    console.log(`\n${indent}--- Nested: ${ns}.${name} ---`);

    // dump its methods
    const it2 = Memory.alloc(Process.pointerSize);
    it2.writePointer(NULL);

    let m;
    while (!(m = il2cpp_class_get_methods(nested, it2)).isNull()) {

      const methodName = cstr(il2cpp_method_get_name(m));
      const impl = getMethodImplFromMethodInfo(m);

      if (!impl.isNull()) {
        const off = toIl2cppOffset(impl);
        console.log(`${indent}   ${methodName} -> ${impl} (offset ${off})`);
      } else {
        console.log(`${indent}   ${methodName} -> NULL`);
      }
    }

    // 递归继续查嵌套
    dumpNestedRecursive(nested, depth + 1);
  }
}

// ================= main class dump =================

function dumpClassMethodsFromMethodInfo(methodInfo) {

  const mi = ptr(methodInfo);
  const klass = il2cpp_method_get_class(mi);

  const ns = cstr(il2cpp_class_get_namespace(klass));
  const cn = cstr(il2cpp_class_get_name(klass));

  console.log("\n==============================");
  console.log(`Class: ${ns}.${cn}`);
  console.log("MethodInfo* =", mi);
  console.log("klass       =", klass);
  console.log("==============================\n");

  const iter = Memory.alloc(Process.pointerSize);
  iter.writePointer(NULL);

  let idx = 0;
  let m;

  while (!(m = il2cpp_class_get_methods(klass, iter)).isNull()) {

    const name = cstr(il2cpp_method_get_name(m));
    const impl = getMethodImplFromMethodInfo(m);

    idx++;

    if (!impl.isNull()) {
      const off = toIl2cppOffset(impl);
      console.log(`${String(idx).padStart(3)}  ${name}  ->  ${impl} (offset ${off})`);
    } else {
      console.log(`${String(idx).padStart(3)}  ${name}  ->  NULL`);
    }
  }

  // ⭐ 自动打印 nested classes（包括协程类）
  dumpNestedRecursive(klass, 1);

  console.log("\n[*] Tip: offset 可直接在 IDA 中跳转（imagebase=0）");

  return { klass, ns, cn };
}

// ================= run =================

dumpClassMethodsFromMethodInfo(TARGET_METHODINFO);

console.log("[+] done.");
