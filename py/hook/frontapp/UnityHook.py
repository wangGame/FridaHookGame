import frida
import sys

def on_message(message, data):
    print("[FRIDA]", message)

device = frida.get_usb_device(timeout=5)

apps = device.get_frontmost_application()
print(apps.name+"   "+str(apps.pid))
print(apps)
session = device.attach(apps.pid)


with open("../../../hook/UnityHookJs.js", "r", encoding="utf-8") as f:
    js_code = f.read()


script = session.create_script(js_code)
script.on("message", on_message)
script.load()

print("Hook OK")
sys.stdin.read()
