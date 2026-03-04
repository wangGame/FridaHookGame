# import frida
# import sys
# import json
# import os
#
# OUTPUT_DIR = r"D:\il2cpp_dump"
# os.makedirs(OUTPUT_DIR, exist_ok=True)
#
# # def on_message(message, data):
# #     if message["type"] == "send":
# #         payload = message["payload"]
# #
# #         if isinstance(payload, dict) and payload.get("type") == "il2cpp_dump":
# #             dump_data = payload["data"]
# #
# #             # ===== 保存完整 JSON =====
# #             full_path = os.path.join(OUTPUT_DIR, "il2cpp_dump.json")
# #             with open(full_path, "w", encoding="utf-8") as f:
# #                 json.dump(dump_data, f, indent=2, ensure_ascii=False)
# #
# #             print(f"[+] JSON saved: {full_path}")
# #
# #             # ===== 生成 IDA 脚本 =====
# #             ida_path = os.path.join(OUTPUT_DIR, "ida_rename.py")
# #             with open(ida_path, "w", encoding="utf-8") as f:
# #
# #                 f.write("import idaapi\n")
# #                 f.write("import idc\n")
# #                 f.write("import ida_funcs\n\n")
# #                 f.write("base = idaapi.get_imagebase()\n\n")
# #
# #                 for item in dump_data:
# #                     rva = item.get("rva")
# #                     name = item.get("name")
# #
# #                     if rva is None or name is None:
# #                         continue
# #
# #                     safe_name = name.replace("<", "_").replace(">", "_")
# #
# #                     f.write(f"ea = base + 0x{rva:x}\n")
# #                     f.write("if ida_funcs.get_func(ea):\n")
# #                     f.write(f"    idc.set_name(ea, \"{safe_name}\", idc.SN_NOWARN)\n")
# #                     f.write("else:\n")
# #                     f.write("    print('Skip:', hex(ea))\n\n")
# #
# #             print(f"[+] IDA script saved: {ida_path}")
# #
# #     elif message["type"] == "error":
# #         print("[!] Error:", message)
#
# def on_message(message, data):
#     print("[DBG] message:", message)  # ✅ 先强制打印所有消息
#
#     if message.get("type") == "send":
#         payload = message.get("payload")
#         print("[DBG] payload:", payload)
#
#         if isinstance(payload, dict) and payload.get("type") == "il2cpp_dump_with_fields":
#             dump_data = payload.get("data", [])
#
#             full_path = os.path.join(OUTPUT_DIR, "il2cpp_dump_with_fields.json")
#             with open(full_path, "w", encoding="utf-8") as f:
#                 json.dump(dump_data, f, indent=2, ensure_ascii=False)
#
#             print(f"[+] JSON saved: {full_path}")
#
# def main():
#     package_name = "jigsawcard"  # 改成你的包名
#
#     device = frida.get_usb_device()
#     session = device.attach(package_name)
#
#     with open("f.js", "r", encoding="utf-8") as f:
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

import json
import re
from collections import defaultdict

JSON_PATH = r"D:\il2cpp_dump\il2cpp_dump_with_fields.json"
OUT_IDA   = r"D:\il2cpp_dump\ida_apply_methods_and_fields_ida9.py"

def ida_safe(s: str) -> str:
    if s is None:
        return "X"
    s = re.sub(r"[^a-zA-Z0-9_]", "_", s)
    s = re.sub(r"_+", "_", s).strip("_")
    if not s:
        s = "X"
    if s[0].isdigit():
        s = "_" + s
    return s

def esc(s: str) -> str:
    if s is None:
        s = ""
    return s.replace("\\", "\\\\").replace("\"", "\\\"")

TYPE_SIZE = {
    "System.Boolean": 1,
    "System.Byte": 1,
    "System.SByte": 1,
    "System.Int16": 2,
    "System.UInt16": 2,
    "System.Char": 2,
    "System.Int32": 4,
    "System.UInt32": 4,
    "System.Single": 4,
    "System.Int64": 8,
    "System.UInt64": 8,
    "System.Double": 8,
    "System.IntPtr": 0,
    "System.UIntPtr": 0,
    "System.String": 0,
    "System.Object": 0,
}

def main():
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    methods = []
    fields_by_class = defaultdict(list)

    for it in data:
        kind = it.get("kind")

        if kind in ("method", "property_method"):
            rva = it.get("rva")
            cls = it.get("class") or ""
            m   = it.get("method") or ""
            if rva is None:
                continue
            methods.append((int(rva), f"{ida_safe(cls)}__{ida_safe(m)}"))

        elif kind == "field":
            ns  = it.get("namespace") or ""
            cls = it.get("class") or ""
            key = f"{ns}.{cls}".strip(".")
            off = it.get("offset")
            fn  = it.get("field") or "field"
            ft  = it.get("fieldType") or ""
            if off is None:
                continue
            fields_by_class[key].append((int(off), fn, ft))

    # de-dup methods
    seen = set()
    uniq_methods = []
    for rva, nm in methods:
        k = (rva, nm)
        if k in seen:
            continue
        seen.add(k)
        uniq_methods.append((rva, nm))

    for k in list(fields_by_class.keys()):
        fields_by_class[k].sort(key=lambda x: x[0])

    with open(OUT_IDA, "w", encoding="utf-8") as o:
        o.write("import idaapi\nimport idc\nimport ida_funcs\nimport ida_bytes\nimport re\n\n")
        o.write("def _is_64bit():\n")
        o.write("    try:\n")
        o.write("        return bool(idaapi.get_inf_attr(idaapi.INF_IS_64BIT))\n")
        o.write("    except Exception:\n")
        o.write("        pass\n")
        o.write("    try:\n")
        o.write("        lflags = idaapi.get_inf_attr(idaapi.INF_LFLAGS)\n")
        o.write("        return (lflags & idaapi.LFLG_64BIT) != 0\n")
        o.write("    except Exception:\n")
        o.write("        return True\n\n")
        o.write("IS_64 = _is_64bit()\n")
        o.write("PTRSZ = 8 if IS_64 else 4\n")
        o.write("base = idaapi.get_imagebase()\n")
        o.write("print('[+] IS_64=', IS_64, 'PTRSZ=', PTRSZ, 'BASE=', hex(base))\n\n")

        o.write("TYPE_SIZE = {\n")
        for t, sz in TYPE_SIZE.items():
            if sz == 0:
                o.write(f"    \"{esc(t)}\": PTRSZ,\n")
            else:
                o.write(f"    \"{esc(t)}\": {sz},\n")
        o.write("}\n\n")

        o.write("def _clean(s):\n")
        o.write("    s = s or ''\n")
        o.write("    s = re.sub(r'[^a-zA-Z0-9_]', '_', s)\n")
        o.write("    s = re.sub(r'_+', '_', s).strip('_')\n")
        o.write("    if not s: s='X'\n")
        o.write("    if s[0].isdigit(): s='_'+s\n")
        o.write("    return s\n\n")

        o.write("def add_or_get_struct(name):\n")
        o.write("    sid = idc.get_struc_id(name)\n")
        o.write("    if sid == idc.BADADDR:\n")
        o.write("        sid = idc.add_struc(-1, name, 0)\n")
        o.write("    return sid\n\n")

        o.write("def add_member(sid, off, name, size):\n")
        o.write("    name = _clean(name)\n")
        o.write("    if idc.get_member_id(sid, off) != idc.BADADDR:\n")
        o.write("        return\n")
        o.write("    flags = ida_bytes.FF_DATA\n")
        o.write("    if size == 1:\n        flags |= ida_bytes.FF_BYTE\n")
        o.write("    elif size == 2:\n        flags |= ida_bytes.FF_WORD\n")
        o.write("    elif size == 4:\n        flags |= ida_bytes.FF_DWORD\n")
        o.write("    elif size == 8:\n        flags |= ida_bytes.FF_QWORD\n")
        o.write("    else:\n        flags |= ida_bytes.FF_DWORD\n")
        o.write("    idc.add_struc_member(sid, name, off, flags, -1, size)\n\n")

        # embed data
        o.write("METHODS = [\n")
        for rva, nm in uniq_methods:
            o.write(f"    (0x{rva:x}, \"{esc(nm)}\"),\n")
        o.write("]\n\n")

        o.write("FIELDS = {\n")
        for cls, flist in fields_by_class.items():
            o.write(f"    \"{esc(cls)}\": [\n")
            for off, fn, ft in flist:
                o.write(f"        (0x{off:x}, \"{esc(fn)}\", \"{esc(ft)}\"),\n")
            o.write("    ],\n")
        o.write("}\n\n")

        o.write("def make_structs():\n")
        o.write("    cnt = 0\n")
        o.write("    for cls, flist in FIELDS.items():\n")
        o.write("        sname = _clean(cls.replace('.', '_'))\n")
        o.write("        sid = add_or_get_struct(sname)\n")
        o.write("        for off, fname, ftype in flist:\n")
        o.write("            size = TYPE_SIZE.get(ftype, PTRSZ)\n")
        o.write("            add_member(sid, off, fname, size)\n")
        o.write("        cnt += 1\n")
        o.write("    print('[+] structs updated:', cnt)\n\n")

        o.write("def rename_methods():\n")
        o.write("    n = 0\n")
        o.write("    for rva, nm in METHODS:\n")
        o.write("        ea = base + rva\n")
        o.write("        if idaapi.getseg(ea) is None:\n")
        o.write("            continue\n")
        o.write("        idc.set_name(ea, nm, idc.SN_NOWARN)\n")
        o.write("        n += 1\n")
        o.write("    print('[+] renamed methods:', n)\n\n")

        o.write("def main():\n")
        o.write("    make_structs()\n")
        o.write("    rename_methods()\n")
        o.write("    idaapi.auto_wait()\n")
        o.write("    print('[+] done')\n\n")
        o.write("main()\n")

    print("[+] wrote:", OUT_IDA)

if __name__ == "__main__":
    main()