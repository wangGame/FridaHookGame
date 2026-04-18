import frida
import sys
import time

PACKAGE_NAME = "jigsawcard"

def on_message(message, data):
    print(message)

device = frida.get_usb_device(timeout=5)

print("[*] Waiting for app to start...")

# 等待游戏运行
while True:
    try:
        session = device.attach(PACKAGE_NAME)
        break
    except frida.ProcessNotFoundError:
        time.sleep(1)

print("[*] Attached!")

with open("resources/temp/RunMethod.js", "r", encoding="utf-8") as f:
    script_code = f.read()

script = session.create_script(script_code)
script.on("message", on_message)

print("[*] Loading script...")
script.load()

print("[*] Running...")

sys.stdin.read()
