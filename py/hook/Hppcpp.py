# import frida
# import sys
#
# OUT_FILE = "libil2cpp.memdump.so"
#
# fp = open(OUT_FILE, "wb")
# received = 0
# expected = None
#
#
# def on_message(message, data):
#     global received, expected
#
#     if message["type"] != "send":
#         print("❌ message error:", message)
#         return
#
#     payload = message["payload"]
#     mtype = payload.get("type")
#
#     if mtype == "info":
#         expected = payload["size"]
#         print(f"[+] dumping {payload['name']}")
#         print(f"    base = {payload['base']}")
#         print(f"    size = {expected}")
#
#     elif mtype == "chunk":
#         fp.write(data)
#         received += payload["size"]
#
#         if received % (1024 * 1024) == 0:
#             print(f"[+] received {received // (1024*1024)} MB")
#
#     elif mtype == "done":
#         print("[+] dump complete")
#         print(f"[+] total bytes: {received}")
#         fp.close()
#
#     elif mtype == "error":
#         print("❌ error:", payload)
#         fp.close()
#         sys.exit(1)
#
#
# device = frida.get_usb_device(timeout=5)
# session = device.attach("Jigsawcard")
#
# with open("dump_il2cpp.js", "r", encoding="utf-8") as f:
#     script = session.create_script(f.read())
#
# script.on("message", on_message)
# script.load()
#
#
# sys.stdin.read()、


# -*- coding: utf-8 -*-
import frida
import sys
import time


DEVICE = frida.get_usb_device(timeout=5)

# 1️⃣ attach（如果是冷启动用 spawn）
session = DEVICE.attach("Jigsawcard")

# 2️⃣ 先加载 frida-il2cpp-bridge
with open("../../resources/js/dump_il2cpp.js", "r", encoding="utf-8") as f:
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
