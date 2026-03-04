import frida
import sys
import json
import os

OUTPUT_DIR = r"D:\il2cpp_dump"
os.makedirs(OUTPUT_DIR, exist_ok=True)

DUMP_TYPE = "il2cpp_dump_with_fields_v2"

def save_json(path, obj):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)

def esc(s: str) -> str:
    if s is None:
        return ""
    return (
        s.replace("\\", "\\\\")
         .replace('"', '\\"')
         .replace("\n", "\\n")
         .replace("\r", "\\r")
    )

def safe_name(s: str) -> str:
    if not s:
        return ""
    # IDA name 不要有 < >
    return s.replace("<", "_").replace(">", "_").replace(" ", "_")

def on_message(message, data):
    if message["type"] == "send":
        payload = message.get("payload", {})
        if isinstance(payload, dict) and payload.get("type") == DUMP_TYPE:
            items = payload.get("data", [])
            print(f"[+] Received: {len(items)} items")

            all_path = os.path.join(OUTPUT_DIR, f"{DUMP_TYPE}.json")
            save_json(all_path, items)
            print(f"[+] Saved: {all_path}")

            fields = [x for x in items if x.get("kind") == "field"]
            methods = [x for x in items if x.get("kind") == "method"]

            fields_path = os.path.join(OUTPUT_DIR, "fields.json")
            methods_path = os.path.join(OUTPUT_DIR, "methods.json")
            save_json(fields_path, fields)
            save_json(methods_path, methods)
            print(f"[+] Saved: {fields_path} ({len(fields)})")
            print(f"[+] Saved: {methods_path} ({len(methods)})")

            # ---------------------------
            # 1) IDA: apply method rename
            # ---------------------------
            ida_methods = os.path.join(OUTPUT_DIR, "ida_apply_methods.py")
            with open(ida_methods, "w", encoding="utf-8") as f:
                f.write("import idaapi\nimport idc\nimport ida_funcs\n\n")
                f.write("base = idaapi.get_imagebase()\n")
                f.write("renamed = 0\nskipped = 0\n\n")
                for m in methods:
                    rva = m.get("rva")
                    name = safe_name(m.get("name", ""))
                    if rva is None or not name:
                        continue
                    f.write(f"ea = base + 0x{int(rva):x}\n")
                    f.write("if ida_funcs.get_func(ea):\n")
                    f.write(f"    if idc.set_name(ea, \"{esc(name)}\", idc.SN_NOWARN):\n")
                    f.write("        renamed += 1\n")
                    f.write("else:\n")
                    f.write("    skipped += 1\n\n")
                f.write("print('[+] renamed =', renamed)\n")
                f.write("print('[+] skipped(no func) =', skipped)\n")
            print(f"[+] IDA script saved: {ida_methods}")

            # --------------------------------
            # 2) IDA: build structs from fields
            #    - IL2CPP 32-bit object header: 0x0 klass, 0x4 monitor
            # --------------------------------
            ida_fields = os.path.join(OUTPUT_DIR, "ida_apply_fields_structs.py")
            with open(ida_fields, "w", encoding="utf-8") as f:
                f.write("import idaapi\nimport ida_struct\nimport idc\n\n")
                f.write("created = 0\nupdated = 0\nmembers_added = 0\n\n")
                f.write("def get_or_create_struct(name):\n")
                f.write("    sid = ida_struct.get_struc_id(name)\n")
                f.write("    if sid != idaapi.BADADDR:\n")
                f.write("        return sid, False\n")
                f.write("    sid = ida_struct.add_struc(idaapi.BADADDR, name, 0)\n")
                f.write("    return sid, True\n\n")
                f.write("def add_member(sid, off, mname, size=4):\n")
                f.write("    sp = ida_struct.get_struc(sid)\n")
                f.write("    if not sp:\n")
                f.write("        return False\n")
                f.write("    # 已存在则跳过\n")
                f.write("    if ida_struct.get_member(sp, off):\n")
                f.write("        return False\n")
                f.write("    flags = idc.FF_DWORD | idc.FF_DATA\n")
                f.write("    r = ida_struct.add_struc_member(sp, mname, off, flags, -1, size)\n")
                f.write("    return r == 0\n\n")

                # 先按 class 分组
                f.write("FIELDS = {}\n")
                for it in fields:
                    cls = it.get("class") or ""
                    off = it.get("offset")
                    fname = it.get("field") or ""
                    if not cls or off is None or not fname:
                        continue
                    # 只保留 offset>0
                    if int(off) <= 0:
                        continue
                    # 清理 struct/member 名字
                    s_cls = safe_name(cls)
                    s_field = safe_name(fname)
                    f.write(f"FIELDS.setdefault(\"{esc(s_cls)}\", []).append(({int(off)}, \"{esc(s_field)}\"))\n")

                f.write("\nfor sname, flist in FIELDS.items():\n")
                f.write("    sid, is_new = get_or_create_struct(sname)\n")
                f.write("    if sid == idaapi.BADADDR:\n")
                f.write("        continue\n")
                f.write("    if is_new:\n")
                f.write("        created += 1\n")
                f.write("        # IL2CPP object header placeholders (32-bit)\n")
                f.write("        add_member(sid, 0x0, \"klass\", 4)\n")
                f.write("        add_member(sid, 0x4, \"monitor\", 4)\n")
                f.write("    else:\n")
                f.write("        updated += 1\n")
                f.write("    # 去重 + 按偏移排序\n")
                f.write("    seen = set()\n")
                f.write("    flist2 = []\n")
                f.write("    for off, fn in flist:\n")
                f.write("        if (off, fn) in seen:\n")
                f.write("            continue\n")
                f.write("        seen.add((off, fn))\n")
                f.write("        flist2.append((off, fn))\n")
                f.write("    flist2.sort(key=lambda x: x[0])\n")
                f.write("    for off, fn in flist2:\n")
                f.write("        if add_member(sid, off, fn, 4):\n")
                f.write("            members_added += 1\n\n")
                f.write("print('[+] structs created =', created)\n")
                f.write("print('[+] structs updated =', updated)\n")
                f.write("print('[+] members added =', members_added)\n")

            print(f"[+] IDA script saved: {ida_fields}")

    elif message["type"] == "error":
        print("[!] Script error:", message.get("stack", message))

def main():
    package_name = "jigsawcard"  # 改成你的包名/进程名

    device = frida.get_usb_device()
    session = device.attach(package_name)

    # 这里读你 frida-compile 输出的 js，例如 f.js
    with open("f.js", "r", encoding="utf-8") as fp:
        js_code = fp.read()

    script = session.create_script(js_code)
    script.on("message", on_message)
    script.load()

    print("[*] Running... Press Ctrl+C to stop.")
    sys.stdin.read()

if __name__ == "__main__":
    main()