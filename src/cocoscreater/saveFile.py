import frida
import sys
import time
from pathlib import Path


# =========================
# 配置区
# =========================

PACKAGE = "com.block.juggle"

# 这里填你的 Frida JS 脚本路径
# 也就是上一条那个 hook memcmp / dump js 的 js
SCRIPT_PATH = "./js/Hookjs.js"

OUT_DIR = Path("jycrypt_js_dump")

# True = spawn 启动，适合抓启动阶段
# False = attach 已运行进程，适合热更新资源已经加载后的情况
USE_SPAWN = True

# attach 模式下用 app 名称或包名
ATTACH_TARGET = "Block Blast!"


# =========================
# 工具函数
# =========================

def safe_filename(s: str) -> str:
    if not s:
        return "unknown"

    bad = '<>:"/\\|?*\n\r\t'
    for ch in bad:
        s = s.replace(ch, "_")

    if len(s) > 120:
        s = s[:120]

    return s


def print_message(message):
    msg_type = message.get("type")

    if msg_type == "error":
        print("\n========== FRIDA ERROR ==========")
        print("description:", message.get("description"))
        print("stack:")
        print(message.get("stack"))
        print("=================================\n")
    else:
        print(message)


# =========================
# Frida message 回调
# =========================

def on_message(message, data):
    if message.get("type") != "send":
        print_message(message)
        return

    payload = message.get("payload", {})
    typ = payload.get("type")

    # =========================
    # 保存明文 JS
    # =========================
    if typ == "js_plaintext":
        index = payload.get("index", 0)
        reason = payload.get("reason", "")
        caller = payload.get("caller", "")
        length = payload.get("length", 0)

        if data is None:
            print("\n========== PY JS PLAINTEXT ==========")
            print("index  =", index)
            print("reason =", reason)
            print("caller =", caller)
            print("length =", length)
            print("data   = None")
            return

        out_name = f"js_plain_{int(index):04d}_{safe_filename(reason)}.js"
        out_path = OUT_DIR / out_name
        out_path.write_bytes(data)

        print("\n========== PY JS PLAINTEXT ==========")
        print("index  =", index)
        print("reason =", reason)
        print("caller =", caller)
        print("length =", length)
        print("save   =", out_path)

        try:
            preview = data[:500].decode("utf-8", errors="replace")
            print("preview:")
            print(preview)
        except Exception as e:
            print("preview decode failed:", e)

        return

    # =========================
    # 如果后面 JS 里 send 了解密数据，也可以保存
    # =========================
    if typ == "jsc_decrypt":
        index = payload.get("index", 0)
        name = payload.get("name", "decrypt")
        caller = payload.get("caller", "")

        if data:
            out_name = f"jsc_decrypt_{int(index):04d}_{safe_filename(name)}.js"
            out_path = OUT_DIR / out_name
            out_path.write_bytes(data)

            print("\n========== PY JSC DECRYPT ==========")
            print("index  =", index)
            print("name   =", name)
            print("caller =", caller)
            print("size   =", len(data))
            print("save   =", out_path)
        return

    # =========================
    # 普通 send 日志
    # =========================
    print("\n========== PY SEND ==========")
    print(payload)


# =========================
# 主逻辑
# =========================

def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    script_path = Path(SCRIPT_PATH)
    if not script_path.exists():
        print("[-] JS 脚本不存在:", script_path)
        return

    script_code = script_path.read_text(encoding="utf-8")

    print("========== JYCRYPT JS DUMP RUNNER ==========")
    print("[*] package    :", PACKAGE)
    print("[*] script     :", script_path)
    print("[*] out_dir    :", OUT_DIR.resolve())
    print("[*] use_spawn  :", USE_SPAWN)

    device = frida.get_usb_device(timeout=10)

    if USE_SPAWN:
        print("[*] spawning...")

        session = device.attach(ATTACH_TARGET)

        print("[*] creating script...")
        script = session.create_script(script_code)
        script.on("message", on_message)

        print("[*] loading script...")
        script.load()

        print("[*] resuming...")


    else:
        print("[*] attaching target:", ATTACH_TARGET)

        try:
            session = device.attach(ATTACH_TARGET)
        except frida.ProcessNotFoundError:
            print("[!] attach by name failed, try package:", PACKAGE)
            session = device.attach(PACKAGE)

        print("[*] creating script...")
        script = session.create_script(script_code)
        script.on("message", on_message)

        print("[*] loading script...")
        script.load()

    print("[*] running...")
    print("[*] output dir:", OUT_DIR.resolve())
    print("[*] press Ctrl+C to stop")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[*] stopping...")

        try:
            script.unload()
        except Exception:
            pass

        try:
            session.detach()
        except Exception:
            pass

        print("[*] stopped")


if __name__ == "__main__":
    main()