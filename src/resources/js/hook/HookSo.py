import frida
import sys

package = "com.android.settings"   # 你可以换成游戏包名

def on_message(message, data):
    print("[FRIDA]", message)

device = frida.get_usb_device(timeout=5)

apps = device.get_frontmost_application()
print(apps.name)
session = device.attach(apps.pid)

with open("js/testenv.js", "r", encoding="utf-8") as f:
    js_code = f.read()

script = session.create_script(js_code)

def on_message(msg, data):
    print(msg)

script.on("message", on_message)
script.load()

print("[*] so hook installed")

sys.stdin.read()
