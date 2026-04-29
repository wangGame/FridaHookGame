import frida
import json
from pathlib import Path

ROOT_OUTPUT_DIR = Path(r"E:\work\JigsawChaiBao\class")
ROOT_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

PACKAGE_NAME = "jigsawcard"
JS_FILE = "dump_Charp.js"

ASSEMBLIES = [
    "Assembly-CSharp",
    "UnityEngine.UI",
    "UnityEngine.CoreModule",
    "mscorlib",
]

def safe_name(name: str) -> str:
    bad = '<>:"/\\|?*'
    for ch in bad:
        name = name.replace(ch, "_")
    return name


# =========================
# 生成 C# 类
# =========================
def build_cs(cls: dict) -> str:
    lines = []

    ns = cls.get("namespace", "")
    name = cls.get("class", "Unknown")
    parent = cls.get("parent")
    class_ptr = cls.get("classPtr", "0x0")

    if ns:
        lines.append(f"namespace {ns}")
        lines.append("{")

    lines.append(f"// ClassPtr: {class_ptr}")

    if parent:
        lines.append(f"public class {name} : {parent}")
    else:
        lines.append(f"public class {name}")

    lines.append("{")

    # ===== Fields =====
    for f in cls.get("fields", []):
        lines.append(f"    // 0x{f['offset']:X}")
        lines.append(f"    public {f['type']} {f['name']};")
        lines.append("")

    # ===== Methods =====
    for m in cls.get("methods", []):
        params = []
        for p in m.get("params", []):
            params.append(f"{p['type']} {p['name']}")

        pstr = ", ".join(params)

        lines.append(f"    // RVA: 0x{m['rva']:X}")
        lines.append(f"    {m['returnType']} {m['name']}({pstr});")
        lines.append("")

    lines.append("}")

    if ns:
        lines.append("}")

    return "\n".join(lines)


# =========================
# 保存（按 Assembly 分类）
# =========================
def save_all(payload):
    for cls in payload["data"]:

        assembly = cls.get("assembly", "Unknown")
        assembly_dir = ROOT_OUTPUT_DIR / safe_name(assembly)
        assembly_dir.mkdir(parents=True, exist_ok=True)

        class_name = safe_name(cls["class"])
        path = assembly_dir / f"{class_name}.cs"

        code = build_cs(cls)

        with open(path, "w", encoding="utf-8") as f:
            f.write(code)

    print(f"[+] Saved {len(payload['data'])} classes")


def main():
    device = frida.get_usb_device()
    session = device.attach(PACKAGE_NAME)

    with open(JS_FILE, "r", encoding="utf-8") as f:
        js_code = f.read()

    script = session.create_script(js_code)
    script.load()

    print("[*] Running...")

    for asm in ASSEMBLIES:
        print(f"[*] Dump: {asm}")

        result = script.exports_sync.dumpassembly(asm)

        if not result.get("ok"):
            print("[!] Failed:", asm)
            continue

        save_all(result)

    session.detach()
    print("[+] Done")


if __name__ == "__main__":
    main()