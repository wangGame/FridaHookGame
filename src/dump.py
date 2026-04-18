# import frida
# import sys
# import json
# import os
#
# OUTPUT_DIR = r"D:\il2cpp_dump"
# os.makedirs(OUTPUT_DIR, exist_ok=True)
#
# def on_message(message, data):
#     if message["type"] == "send":
#         payload = message["payload"]
#
#         if isinstance(payload, dict) and payload.get("type") == "il2cpp_dump":
#             dump_data = payload["data"]
#
#             # ===== 保存完整 JSON =====
#             full_path = os.path.join(OUTPUT_DIR, "il2cpp_dump.json")
#             with open(full_path, "w", encoding="utf-8") as f:
#                 json.dump(dump_data, f, indent=2, ensure_ascii=False)
#
#             print(f"[+] JSON saved: {full_path}")
#
#             # ===== 生成 IDA 脚本 =====
#             ida_path = os.path.join(OUTPUT_DIR, "ida_rename.py")
#             with open(ida_path, "w", encoding="utf-8") as f:
#
#                 f.write("import idaapi\n")
#                 f.write("import idc\n")
#                 f.write("import ida_funcs\n\n")
#                 f.write("base = idaapi.get_imagebase()\n\n")
#
#                 for item in dump_data:
#                     rva = item.get("rva")
#                     name = item.get("name")
#
#                     if rva is None or name is None:
#                         continue
#
#                     safe_name = name.replace("<", "_").replace(">", "_")
#
#                     f.write(f"ea = base + 0x{rva:x}\n")
#                     f.write("if ida_funcs.get_func(ea):\n")
#                     f.write(f"    idc.set_name(ea, \"{safe_name}\", idc.SN_NOWARN)\n")
#                     f.write("else:\n")
#                     f.write("    print('Skip:', hex(ea))\n\n")
#
#             print(f"[+] IDA script saved: {ida_path}")
#
#     elif message["type"] == "error":
#         print("[!] Error:", message)
#
#
# def main():
#     package_name = "jigsawcard"  # 改成你的包名
#
#     device = frida.get_usb_device()
#     session = device.attach(package_name)
#
#     with open("dump_il2cpp.js", "r", encoding="utf-8") as f:
#         script_code = f.read()
#
#
#     script = session.create_script(script_code)
#     script.on("message", on_message)
#     # script.load()
#     script.load()
#
#     print("[*] Running... Press Ctrl+C to stop.")
#     sys.stdin.read()
#
#
# if __name__ == "__main__":
#     main()



import frida
import sys
import json
import os

OUTPUT_DIR = r"E:\work\JigsawChaiBao\classInfo\Coffee.UIParticle"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ====== IL2CPP 类型 → IDA C 类型（简易映射，可继续补） ======
TYPE_MAP = {
    "System.Void": "void",
    "System.Boolean": "bool",
    "System.Byte": "uint8",
    "System.SByte": "int8",
    "System.Int16": "int16",
    "System.UInt16": "uint16",
    "System.Int32": "int32",
    "System.UInt32": "uint32",
    "System.Int64": "int64",
    "System.UInt64": "uint64",
    "System.Single": "float",
    "System.Double": "double",
    "System.IntPtr": "void *",
    "System.UIntPtr": "void *",
    "System.String": "void *",  # 你也可以改成 Il2CppString*
    "System.Object": "void *",  # Il2CppObject*
}

def to_c_type(il2cpp_type: str) -> str:
    if not il2cpp_type:
        return "void *"

    t = il2cpp_type.strip()

    # 数组、泛型、引用等复杂类型：先粗暴当指针
    # 你后面要精确，我们再做解析器
    if "<" in t or ">" in t:
        return "void *"
    if t.endswith("[]"):
        return "void *"

    # 处理 ByRef（有些工具会显示 & 或 * 或 'System.Int32&'）
    if t.endswith("&"):
        base = t[:-1]
        return to_c_type(base) + " *"

    # 去掉 namespace 前缀差异（有些会给 fullName）
    return TYPE_MAP.get(t, "void *")

def escape_name(name: str) -> str:
    if not name:
        return ""
    # IDA 名字最好别带 < >
    return name.replace("<", "_").replace(">", "_").replace(" ", "_")

def build_ida_prototype(item: dict) -> str:
    """
    从 il2cpp_dump_v2 item 生成 C 原型字符串，给 idc.SetType 用
    item: {name, returnType, params, isStatic, class, ...}
    """
    func_name = escape_name(item.get("name", "")) or "sub_unknown"
    ret = to_c_type(item.get("returnType", ""))

    params = item.get("params", []) or []
    is_static = bool(item.get("isStatic", False))
    cls = item.get("class", "")

    c_params = []

    # 非 static：在 IDA 里显式加一个 this 参数，利于后续字段替换（this+off）
    if not is_static:
        # 这里用 void* 当 this（你也可以改成 cls*，前提是你在 IDA 里有这个 struct type）
        # 若想直接 cls*：改成 f"{cls} *this"
        c_params.append("void *this")

    # 追加真实参数（忽略 dump 里可能带的 this）
    for i, p in enumerate(params):
        p_name = p.get("name", f"arg{i}") if isinstance(p, dict) else f"arg{i}"
        p_type = p.get("type", "") if isinstance(p, dict) else ""
        ctype = to_c_type(p_type)
        p_name = escape_name(p_name) or f"arg{i}"
        c_params.append(f"{ctype} {p_name}")

    if not c_params:
        c_params = ["void"]

    # ARM32 里 calling conv 不强求，IDA 常用 __fastcall 显示；SetType 可不写
    proto = f"{ret} {func_name}({', '.join(c_params)});"
    return proto

def on_message(message, data):
    if message["type"] == "send":
        payload = message["payload"]

        if isinstance(payload, dict) and payload.get("type") in ("il2cpp_dump", "il2cpp_dump_v2"):
            dump_type = payload.get("type")
            dump_data = payload.get("data", [])

            # ===== 保存完整 JSON =====
            full_path = os.path.join(OUTPUT_DIR, f"{dump_type}.json")
            with open(full_path, "w", encoding="utf-8") as f:
                json.dump(dump_data, f, indent=2, ensure_ascii=False)

            print(f"[+] JSON saved: {full_path} ({len(dump_data)})")

            # ===== 生成 IDA 脚本 =====
            ida_path = os.path.join(OUTPUT_DIR, f"ida_apply_{dump_type}.py")
            with open(ida_path, "w", encoding="utf-8") as f:
                f.write("import idaapi\n")
                f.write("import idc\n")
                f.write("import ida_funcs\n")
                f.write("import ida_typeinf\n\n")
                f.write("base = idaapi.get_imagebase()\n")
                f.write("applied = 0\n")
                f.write("renamed = 0\n\n")

                for item in dump_data:
                    rva = item.get("rva")
                    name = item.get("name")

                    if rva is None or name is None:
                        continue

                    safe_name = escape_name(name)

                    # 写入 EA
                    f.write(f"ea = base + 0x{int(rva):x}\n")
                    f.write("fn = ida_funcs.get_func(ea)\n")
                    f.write("if not fn:\n")
                    f.write("    # print('Skip (no func):', hex(ea))\n")
                    f.write("    pass\n")
                    f.write("else:\n")
                    f.write(f"    if idc.set_name(ea, \"{safe_name}\", idc.SN_NOWARN):\n")
                    f.write("        renamed += 1\n")

                    # v2 才尝试 SetType（因为有签名信息）
                    if dump_type == "il2cpp_dump_v2":
                        proto = build_ida_prototype(item).replace("\\", "\\\\").replace("\"", "\\\"")
                        f.write("    try:\n")
                        f.write(f"        proto = \"{proto}\"\n")
                        f.write("        # Apply function prototype\n")
                        f.write("        if idc.SetType(ea, proto):\n")
                        f.write("            applied += 1\n")
                        f.write("    except Exception as e:\n")
                        f.write("        # print('SetType failed:', hex(ea), e)\n")
                        f.write("        pass\n")

                    f.write("\n")

                f.write("print('[+] renamed =', renamed)\n")
                if dump_type == "il2cpp_dump_v2":
                    f.write("print('[+] prototypes applied =', applied)\n")

            print(f"[+] IDA script saved: {ida_path}")

    elif message["type"] == "error":
        print("[!] Error:", message.get("stack", message))


def main():
    package_name = "jigsawcard"  # 改成你的包名/进程名

    device = frida.get_usb_device()
    session = device.attach(package_name)

    # 你的 JS 文件路径
    with open("dump_il2cpp.js", "r", encoding="utf-8") as f:
        script_code = f.read()

    script = session.create_script(script_code)
    script.on("message", on_message)
    script.load()

    print("[*] Running... Press Ctrl+C to stop.")
    sys.stdin.read()


if __name__ == "__main__":
    main()