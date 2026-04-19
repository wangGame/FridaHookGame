import frida
import sys
import json
import os
from pathlib import Path

ROOT_OUTPUT_DIR = Path(r"E:\work\JigsawChaiBao\classInfo")
ROOT_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

ASSEMBLIES = [
    "Assembly-CSharp",
    "Coffee.UIEffect",
    "Coffee.UIParticle",
    "DOTween",
    "Facebook.Unity.Android",
    "Facebook.Unity.Settings",
    "Facebook.Unity",
    "Firebase.App",
    "Firebase.Crashlytics",
    "Firebase.Platform",
    "Gilzoide.SqliteNet",
    "Google.FlatBuffers",
    "Google.Play.Common",
    "Newtonsoft.Json",
    "System.Core",
    "System.Data",
    "System.Numerics",
    "System.Runtime.Serialization",
    "System",
    "Unity.TextMeshPro",
    "Unity.Timeline",
    "UnityEngine.AndroidJNIModule",
    "UnityEngine.AnimationModule",
    "UnityEngine.AssetBundleModule",
    "UnityEngine.AudioModule",
    "UnityEngine.CoreModule",
    "UnityEngine.DirectorModule",
    "UnityEngine.IMGUIModule",
    "UnityEngine.InputLegacyModule",
    "UnityEngine.ParticleSystemModule",
    "UnityEngine.Physics2DModule",
    "UnityEngine.PhysicsModule",
    "UnityEngine.PropertiesModule",
    "UnityEngine.SpriteShapeModule",
    "UnityEngine.TextCoreFontEngineModule",
    "UnityEngine.TextRenderingModule",
    "UnityEngine.UI",
    "UnityEngine.UIElementsModule",
    "UnityEngine.UIModule",
    "UnityEngine.UnityWebRequestModule",
    "UnityEngine.VideoModule",
    "com.beatles.unity.ui",
    "com.learnings.download-unity",
    "com.learnings.unity.assetbundle",
    "com.learnings.unity.log",
    "com.learnings.unity.nativeutil-unity",
    "com.learnings.unity.storage.flatbuffers",
    "com.learnings.unity.unikit.runtime",
    "i2",
    "mscorlib",
    "spine-csharp",
    "spine-timeline",
    "spine-unity"
]

PACKAGE_NAME = "jigsawcard"
JS_FILE = "dump_class_il2cpp.js"


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
    "System.String": "void *",
    "System.Object": "void *",
}

def to_c_type(il2cpp_type: str) -> str:
    if not il2cpp_type:
        return "void *"

    t = il2cpp_type.strip()

    if "<" in t or ">" in t:
        return "void *"
    if t.endswith("[]"):
        return "void *"
    if t.endswith("&"):
        base = t[:-1]
        return to_c_type(base) + " *"

    return TYPE_MAP.get(t, "void *")

def escape_name(name: str) -> str:
    if not name:
        return ""
    return (
        name.replace("<", "_")
            .replace(">", "_")
            .replace(" ", "_")
            .replace(":", "_")
            .replace(",", "_")
    )

def safe_dir_name(name: str) -> str:
    bad = '<>:"/\\|?*'
    for ch in bad:
        name = name.replace(ch, "_")
    return name

def build_ida_prototype(item: dict) -> str:
    func_name = escape_name(item.get("name", "")) or "sub_unknown"
    ret = to_c_type(item.get("returnType", ""))

    params = item.get("params", []) or []
    is_static = bool(item.get("isStatic", False))

    c_params = []

    if not is_static:
        c_params.append("void *this")

    for i, p in enumerate(params):
        if isinstance(p, dict):
            p_name = p.get("name", f"arg{i}")
            p_type = p.get("type", "")
        else:
            p_name = f"arg{i}"
            p_type = ""

        ctype = to_c_type(p_type)
        p_name = escape_name(p_name) or f"arg{i}"
        c_params.append(f"{ctype} {p_name}")

    if not c_params:
        c_params = ["void"]

    return f"{ret} {func_name}({', '.join(c_params)});"

def write_ida_script(dump_data, ida_path: Path):
    with open(ida_path, "w", encoding="utf-8") as f:
        f.write("import idaapi\n")
        f.write("import idc\n")
        f.write("import ida_funcs\n")
        f.write("import ida_typeinf\n\n")

        f.write("base = idaapi.get_imagebase()\n")
        f.write("renamed = 0\n")
        f.write("typed = 0\n")
        f.write("fields_applied = 0\n\n")

        for item in dump_data:
            rva = item.get("rva")
            name = item.get("name")

            if rva is None or not name:
                continue

            safe_name = escape_name(name)

            f.write(f"ea = base + 0x{int(rva):x}\n")

            f.write("fn = ida_funcs.get_func(ea)\n")
            f.write("if fn:\n")

            # =========================
            # 1. rename function
            # =========================
            f.write(f"    if idc.set_name(ea, \"{safe_name}\", idc.SN_NOWARN):\n")
            f.write("        renamed += 1\n")

            # =========================
            # 2. set prototype
            # =========================
            proto = build_ida_prototype(item).replace("\\", "\\\\").replace("\"", "\\\"")

            f.write("    try:\n")
            f.write(f"        proto = \"{proto}\"\n")
            f.write("        if idc.SetType(ea, proto):\n")
            f.write("            typed += 1\n")
            f.write("    except:\n")
            f.write("        pass\n")

            # =========================
            # 3. fields comment attach
            # =========================
            fields = item.get("fields", [])

            if fields:
                f.write("    # ===== Fields =====\n")
                for fd in fields:
                    fname = escape_name(fd.get("name", ""))
                    ftype = fd.get("type", "")
                    offset = fd.get("offset", 0)

                    f.write(
                        f"    # {fname} : {ftype} @0x{int(offset):x}\n"
                    )

                f.write("    # ==================\n")

            f.write("\n")

        f.write("print('[+] renamed =', renamed)\n")
        f.write("print('[+] typed =', typed)\n")


def save_dump_result(assembly_name: str, payload: dict):
    out_dir = ROOT_OUTPUT_DIR / safe_dir_name(assembly_name)
    out_dir.mkdir(parents=True, exist_ok=True)

    json_path = out_dir / "il2cpp_dump_v2.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(payload["data"], f, indent=2, ensure_ascii=False)

    ida_path = out_dir / "ida_apply_il2cpp_dump_v2.py"
    write_ida_script(payload["data"], ida_path)

    print(f"[+] Saved JSON: {json_path}")
    print(f"[+] Saved IDA : {ida_path}")

def main():
    device = frida.get_usb_device()
    session = device.attach(PACKAGE_NAME)

    with open(JS_FILE, "r", encoding="utf-8") as f:
        script_code = f.read()

    script = session.create_script(script_code)
    script.load()

    print("[*] Attached and script loaded.")

    for asm in ASSEMBLIES:
        print(f"\n[*] Dumping assembly: {asm}")
        try:
            payload = script.exports_sync.dumpassembly(asm)
        except Exception as e:
            print(f"[!] RPC failed for {asm}: {e}")
            continue

        if not payload.get("ok"):
            print(f"[!] Dump failed: {asm}")
            print(f"    error = {payload.get('error')}")
            continue

        print(f"[+] OK: input={payload.get('input')} used={payload.get('usedName')} count={payload.get('count')}")
        save_dump_result(asm, payload)

    print("\n[+] All done.")
    session.detach()

if __name__ == "__main__":
    main()