import frida
import sys

PID = 7816  # 你刚刚打印出来的

with open("../../resources/js/hook.js", "r", encoding="utf-8") as f:
    js_code = f.read()

def on_message(message, data):
    if message["type"] == "send":
        print("[JS]", message["payload"])
    elif message["type"] == "error":
        print("[JS ERROR]", message)
    else:
        print(message)

dm = frida.get_device_manager()
device = dm.add_remote_device("127.0.0.1:27042")

session = device.attach(PID)

script = session.create_script(js_code)
script.on("message", on_message)
script.load()

print("[*] Attached & injected into pid", PID)
sys.stdin.read()
