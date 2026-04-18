'use strict';

const IL2CPP = "libil2cpp.so";
const il2cppMod = Process.getModuleByName(IL2CPP);
const BASE = il2cppMod.base;

function exp(name) {
  const p = Module.findExportByName(IL2CPP, name);
  if (!p) throw new Error("missing export: " + name);
  return p;
}
function cstr(p) { return p.isNull() ? "" : p.readCString(); }
function normalizeThumb(p) {
  if (Process.arch === "arm" && !p.isNull() && p.and(1).toInt32() === 1) return p.and(ptr("0xfffffffe"));
  return p;
}
function isExec(p) {
  if (p.isNull()) return false;
  const r = Process.findRangeByAddress(p);
  return r && r.protection.indexOf("x") !== -1;
}
function getImplFromMethodInfo(mi) {
  const cand = [0x0,0x4,0x8,0xC,0x10,0x14,0x18,0x1C,0x20,0x24,0x28,0x2C,0x30];
  for (const off of cand) {
    let p;
    try { p = mi.add(off).readPointer(); } catch (e) { continue; }
    const real = normalizeThumb(p);
    if (isExec(real)) return real;
  }
  return NULL;
}
function offOf(p) { return normalizeThumb(p).sub(BASE); }

const il2cpp_class_get_name      = new NativeFunction(exp("il2cpp_class_get_name"), "pointer", ["pointer"]);
const il2cpp_class_get_namespace = new NativeFunction(exp("il2cpp_class_get_namespace"), "pointer", ["pointer"]);
const il2cpp_method_get_name     = new NativeFunction(exp("il2cpp_method_get_name"), "pointer", ["pointer"]);
const il2cpp_method_get_class    = new NativeFunction(exp("il2cpp_method_get_class"), "pointer", ["pointer"]);
const il2cpp_class_get_methods   = new NativeFunction(exp("il2cpp_class_get_methods"), "pointer", ["pointer", "pointer"]);

// 你已经有任意一个 MethodInfo* 的时候最好用它拿 klass。
// 但如果你没有 seed，我们就走“找到一个 DTween 方法后用它扩展”。
// 这里先给一个函数：给一个 MethodInfo*，打印它所属类所有方法。
function dumpClassFromMethodInfo(methodInfo) {
  const klass = il2cpp_method_get_class(methodInfo);
  const ns = cstr(il2cpp_class_get_namespace(klass));
  const cn = cstr(il2cpp_class_get_name(klass));
  console.log(`\n===== ${ns}.${cn} =====`);

  const iter = Memory.alloc(Process.pointerSize);
  iter.writePointer(NULL);

  while (true) {
    const m = il2cpp_class_get_methods(klass, iter);
    if (m.isNull()) break;

    const mn = cstr(il2cpp_method_get_name(m));
    const impl = getImplFromMethodInfo(m);
    if (!impl.isNull()) {
      console.log(`${mn} -> ${impl} (off ${offOf(impl)})`);
    }
  }
}

globalThis.dumpClassFromMethodInfo = dumpClassFromMethodInfo;
console.log("[+] loaded. Call dumpClassFromMethodInfo(ptr('0xMETHODINFO'))");
