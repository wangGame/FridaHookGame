import frida
import sys
import time

jsPath = "cocosjs.js"
jsPath = "PrintVTable.js"

PACKAGE_NAME = "经典多米诺"

def on_message(message, data):
    print(message)

device = frida.get_usb_device(timeout=5)

print("[*] Waiting for app to start...")

# 等待游戏运行
# while True:
#     try:
#
#         break
#     except frida.ProcessNotFoundError:
#         time.sleep(1)

session = device.attach(PACKAGE_NAME)
print("[*] Attached!")

with open(jsPath, "r", encoding="utf-8") as f:
    script_code = f.read()

script = session.create_script(script_code)
script.on("message", on_message)

print("[*] Loading script...")
script.load()

print("[*] Running...")

sys.stdin.read()
