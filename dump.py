import frida
import sys
import json
import os

OUTPUT_DIR = r"D:\il2cpp_dump"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def on_message(message, data):
    if message["type"] == "send":
        payload = message["payload"]

        if isinstance(payload, dict) and payload.get("type") == "il2cpp_dump":
            dump_data = payload["data"]

            # ===== 保存完整 JSON =====
            full_path = os.path.join(OUTPUT_DIR, "il2cpp_dump.json")
            with open(full_path, "w", encoding="utf-8") as f:
                json.dump(dump_data, f, indent=2, ensure_ascii=False)

            print(f"[+] JSON saved: {full_path}")

            # ===== 生成 IDA 脚本 =====
            ida_path = os.path.join(OUTPUT_DIR, "ida_rename.py")
            with open(ida_path, "w", encoding="utf-8") as f:

                f.write("import idaapi\n")
                f.write("import idc\n")
                f.write("import ida_funcs\n\n")
                f.write("base = idaapi.get_imagebase()\n\n")

                for item in dump_data:
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

    elif message["type"] == "error":
        print("[!] Error:", message)


def main():
    package_name = "jigsawcard"  # 改成你的包名

    device = frida.get_usb_device()
    session = device.attach(package_name)

    with open("dump_il2cpp.js", "r", encoding="utf-8") as f:
        script_code = f.read()

    script = session.create_script(script_code)
    script.on("message", on_message)
    # script.load()
    script.load(timeout=130)

    print("[*] Running... Press Ctrl+C to stop.")
    sys.stdin.read()


if __name__ == "__main__":
    main()
