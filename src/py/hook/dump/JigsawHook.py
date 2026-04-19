import frida
import sys

PACKAGE = "jigsawcard"

def on_message(message, data):
    if message["type"] == "send":
        print("[JS]", message["payload"])
    elif message["type"] == "error":
        print("[JS ERROR]", message)

print("[*] Connecting USB device...")
device = frida.get_usb_device(timeout=10)

print("[*] Spawning:", PACKAGE)
pid = device.attach(PACKAGE)

session = device.attach(pid)

with open("../../../hook/JigsawDump.js", "r", encoding="utf-8") as f:
    script = session.create_script(f.read())

script.on("message", on_message)

print("[*] Injecting script...")
script.load()

device.resume(pid)

print("[*] App resumed")

input("[*] Press ENTER to dump1...")

print("[*] Dumping il2cpp...")

segments = script.exports.dump()

print("[*] Writing file...")

with open("libil2cpp_dump.bin", "wb") as f:
    for seg in segments:
        f.write(seg["data"])

print("[✓] Dump finished: libil2cpp_dump.bin")
