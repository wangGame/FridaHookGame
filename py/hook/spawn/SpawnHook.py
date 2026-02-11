import frida
import sys
import time


def on_message(message, data):
    print("[FRIDA]", message)


# package_name = "com.playvalve.dominoes"

package_name = "com.oakever.jigsawcard"

device = frida.get_usb_device(timeout=5)

print("[*] Spawning:", package_name)

pid = device.spawn([package_name])

session = device.attach(pid)

with open("../../../hook/UnityHookJs.js", "r", encoding="utf-8") as f:
    js_code = f.read()

script = session.create_script(js_code)
script.on("message", on_message)
script.load()

print("[*] Script injected")

device.resume(pid)

print("[*] App resumed")
print("[*] Hook OK")

sys.stdin.read()