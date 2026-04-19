# brige使用

## Unity

- 测试环境

```ts 
import "frida-il2cpp-bridge";

setImmediate(() => {
    Il2Cpp.perform(() => {
        console.log("Unity Version:", Il2Cpp.unityVersion);
        const image = Il2Cpp.domain.assembly("Assembly-CSharp")?.image;
        console.log("Image:", image);
    });
});
```

- 查看所有的类

```ts
// 第一阶段：Dump 所有类
import "frida-il2cpp-bridge";
setImmediate(() => {
    Il2Cpp.perform(() => {
        console.log("Unity:", Il2Cpp.unityVersion);
        const image = Il2Cpp.domain.assembly("Assembly-CSharp").image;
        console.log("Dumping classes...");

        // Dumping classes...
        // Found: AnalyzeData
        // Found: AnalyzeDataFlatBuffersDirect
        // Found: AnalyzeData
        // Found: AnalyzeDataVerify

        //         image.classes
        //             .filter(c => c.name.includes("AnalyzeData"))
        //             .forEach(c => console.log("Found:", c.name));
        image.classes.forEach(c => {
            console.log(c.namespace + "." + c.name);
        });
    });
});
```

- 查看方法地址

```ts
import "frida-il2cpp-bridge";
Il2Cpp.perform(() => {
    const image = Il2Cpp.domain.assembly("Assembly-CSharp").image;
    image.classes.forEach(c => {
        c.methods.forEach(m => {
            console.log(
                c.name,
                m.name,
                "VA:",
                m.virtualAddress,
                "RVA:",
                m.relativeVirtualAddress
            );
        });
    });
});
```

- 查看方法的信息

```ts
setImmediate(() => {

    Il2Cpp.perform(() => {
        const assembly = Il2Cpp.domain.assembly("Assembly-CSharp");
        const image = assembly.image;
        let output = "";
        image.classes.forEach(c => {
            output += `\n// Namespace: ${c.namespace}\n`;
            output += `class ${c.name}\n{\n`;
            // 字段
            c.fields.forEach(f => {
                output += `    ${f.type.name} ${f.name};\n`;
            });
            // 方法
            c.methods.forEach(m => {
                output += `    ${m.returnType.name} ${m.name}(...);\n`;
            });
            output += "}\n";
        });
        console.log(output)
    });
});
```

- dump信息

```ts 
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
```

- 调用信息，以及参数

```ts 
//最牛逼的一个
Il2Cpp.perform(() => {

    const Game = Il2Cpp.domain
        .assembly("Assembly-CSharp")
        .image
        .class("Game");

    console.log("[+] Tracing all Game methods");

    Il2Cpp.trace(true)
        .classes(Game)
        .and()
        .attach();
});
```

-------
上面为脚本代码

一个完整的使用代码

- python

```python
import frida
import sys
import time


DEVICE = frida.get_usb_device(timeout=5)

# 1️⃣ attach（如果是冷启动用 spawn）
session = DEVICE.attach("Jigsawcard")

# 2️⃣ 先加载 frida-il2cpp-bridge
with open("../../resources/js/dump_class_il2cpp.js", "r", encoding="utf-8") as f:
    bridge_code = f.read()

bridge = session.create_script(bridge_code)
bridge.load()

print("✅ frida-il2cpp-bridge loaded")

# 3️⃣ 再加载你自己的脚本
with open("../../resources/js/unity/il2cpp_dump_safe.js", "r", encoding="utf-8") as f:
    user_code = f.read()

script = session.create_script(user_code)
script.load()

print("🚀 user script loaded")

# 4️⃣ 防止 Python 退出
sys.stdin.read()
```

- 编译ts

```shell
frida-compile .\dump_il2cpp.ts -o .\dump_il2cpp.js
```



