# 导出地址和方法名字，方便更名字

```pycon
import frida
import sys
import json
import os

OUTPUT_DIR = r"D:\il2cpp_dump"
os.makedirs(OUTPUT_DIR, exist_ok=True)

all_data = []

def save_files():
    # ===== 保存 JSON =====
    full_path = os.path.join(OUTPUT_DIR, "il2cpp_dump.json")
    with open(full_path, "w", encoding="utf-8") as f:
        json.dump(all_data, f, indent=2, ensure_ascii=False)

    print(f"[+] JSON saved: {full_path}")

    # ===== 生成 IDA 脚本 =====
    ida_path = os.path.join(OUTPUT_DIR, "ida_rename.py")
    with open(ida_path, "w", encoding="utf-8") as f:

        f.write("import idaapi\n")
        f.write("import idc\n")
        f.write("import ida_funcs\n\n")
        f.write("base = idaapi.get_imagebase()\n\n")

        for item in all_data:
            rva = item.get("rva")
            name = item.get("name")

            if rva is None or name is None:
                continue

            safe_name = name.replace("<", "_").replace(">", "_")

            f.write(f"ea = base + 0x{rva:x}\n")
            f.write("if ida_funcs.get_func(ea):\n")
            f.write(f"    idc.set_name(ea, \"{safe_name}\", idc.SN_NOWARN)\n")
            f.write("else:\n")
            f.write("    print('Skip:', hex(ea))\n\n")

    print(f"[+] IDA script saved: {ida_path}")


def on_message(message, data):
    global all_data

    if message["type"] == "send":
        payload = message["payload"]

        if payload["type"] == "batch":
            all_data.extend(payload["data"])
            print(f"[+] Received batch, total: {len(all_data)}")

        elif payload["type"] == "done":
            print("[+] Dump complete")
            save_files()

    elif message["type"] == "error":
        print("[!] Error:", message)


def main():
    package_name = "jigsawcard"  # 改成完整包名

    device = frida.get_usb_device(timeout=10)
    session = device.attach(package_name)

    with open("s.js", "r", encoding="utf-8") as f:
        script_code = f.read()

    script = session.create_script(script_code)
    script.on("message", on_message)

    script.load()

    print("[*] Running... Press Ctrl+C to stop.")
    sys.stdin.read()


if __name__ == "__main__":
    main()

```

## 使用的js

```js 
import "frida-il2cpp-bridge";

setImmediate(() => {
    Il2Cpp.perform(() => {
        console.log("[+] IL2CPP ready");
        const exported = new Set<string>();
        const targetAssemblies = [
            "mscorlib"  // 只 dump 游戏逻辑
        ];

        targetAssemblies.forEach(name => {

            try {

                const assembly = Il2Cpp.domain.assembly(name);
                if (!assembly) {
                    console.log("[-] Assembly not found:", name);
                    return;
                }

                const image = assembly.image;

                console.log("[+] Dumping:", name);

                image.classes.forEach(c => {

                    const batch: any[] = [];

                    c.methods.forEach(m => {

                        if (!m.virtualAddress) return;

                        const va = m.virtualAddress as NativePointer;

                        let module;
                        try {
                            module = Process.findModuleByAddress(va);
                        } catch {
                            return;
                        }

                        if (!module) return;

                        // 只导出 libil2cpp.so 里的
                        if (module.name.indexOf("libil2cpp") === -1) return;

                        const key = va.toString();
                        if (exported.has(key)) return;
                        exported.add(key);

                        const rva = va.sub(module.base);

                        const cleanClass = c.name.replace(/[^a-zA-Z0-9_]/g, "_");
                        const cleanMethod = m.name.replace(/[^a-zA-Z0-9_]/g, "_");

                        batch.push({
                            namespace: c.namespace,
                            class: c.name,
                            method: m.name,
                            name: `${cleanClass}__${cleanMethod}`,
                            rva: parseInt(rva.toString(), 16)
                        });

                    });

                    if (batch.length > 0) {
                        send({
                            type: "batch",
                            data: batch
                        });
                    }

                });

            } catch (e) {
                console.log("[!] Error:", name);
            }
        });
        send({ type: "done" });
        console.log("[+] Dump finished");
    });
});

```

## 输出

```txt
....
[+] Received batch, total: 10203
[+] Received batch, total: 10204
[+] Received batch, total: 10207
[+] Received batch, total: 10208
[+] Received batch, total: 10209
[+] Dump complete
[+] JSON saved: D:\il2cpp_dump\il2cpp_dump.json
[+] IDA script saved: D:\il2cpp_dump\ida_rename.py
[+] Dump finished
```