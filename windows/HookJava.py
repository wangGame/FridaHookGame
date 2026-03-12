import frida
import sys

pid = 40992

def on_message(message, data):

    if message["type"] == "send":
        print("[*]", message["payload"])

    elif message["type"] == "error":
        print("[!] Script error:", message)

    else:
        print(message)


# 读取 JS 文件
with open("hook.js", "r", encoding="utf-8") as f:
    js_code = f.read()


session = frida.attach(pid)

script = session.create_script(js_code)

script.on("message", on_message)

script.load()

print("attached. press Enter to quit.")

sys.stdin.read()