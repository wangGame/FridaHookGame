import frida
import sys

pid = 40992

def on_message(message, data):
    if message["type"] == "send":
        print(message["payload"])
    else:
        print(message)

with open("Hook1.js", "r", encoding="utf-8") as f:
    js = f.read()

session = frida.attach(pid)

script = session.create_script(js)
script.on("message", on_message)

script.load()

input("attached. Enter to quit.\n")