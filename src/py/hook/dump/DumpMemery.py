import frida
import time
import os
import subprocess


REMOTE_PATH = "/data/local/tmp"
LOCAL_PATH = "../dump_out1"

if not os.path.exists(LOCAL_PATH):
    os.makedirs(LOCAL_PATH)


def on_message(message, data):
    print(message)


print("[*] Connecting device...")

device = frida.get_usb_device(timeout=10)


front = device.get_frontmost_application()
print("[*] front app:", front)

print("[*] Please open target app manually!")

time.sleep(5)


pid = front.pid

print("[*] attaching pid:", pid)

session = device.attach(pid)

with open("../../../resources/js/dump_all.js", "r", encoding="utf-8") as f:
    script_code = f.read()

script = session.create_script(script_code)
script.on("message", on_message)
script.load()

print("[*] Dumping...")

time.sleep(60)

print("[*] Pulling files...")
ADB_PATH = r"D:\\Android\\android-sdk\\platform-tools\\adb.exe"
subprocess.call([
    ADB_PATH, "pull",
    REMOTE_PATH,
    LOCAL_PATH
])

print("[✓] DONE")
