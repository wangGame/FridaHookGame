import frida
import sys

# target = "com.oakever.jigsawcard:GP6Service"

device = frida.get_usb_device(timeout=5)
#
# print("[*] Waiting... make sure App is running")
# input("Press Enter to attach GP6Service...")

session = device.attach(15344)

with open("../../../hook/HookSo.js", "r", encoding="utf-8") as f:
    js = f.read()

script = session.create_script(js)

def on_message(msg, data):
    print(msg)

script.on("message", on_message)
script.load()

print("[+] GP6Service hooked")

sys.stdin.read()
