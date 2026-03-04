import frida
import sys
import os

PACKAGE = "Block Blast!"
OUTPUT_DIR = "dump1"

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

def on_message(message, data):
    if message["type"] == "send":
        payload = message["payload"]

        if payload.get("type") == "dump1":
            file_name = payload["file"]
            content = payload["data"]

            path = os.path.join(OUTPUT_DIR, file_name)

            with open(path, "w", encoding="utf-8") as f:
                f.write(content)

            print("[+] Saved:", path)

    elif message["type"] == "error":
        print(message)

def main():
    device = frida.get_usb_device()
    session = device.attach(PACKAGE)

    with open("dump_cocos.js", "r", encoding="utf-8") as f:
        script_code = f.read()

    script = session.create_script(script_code)
    script.on("message", on_message)
    script.load()

    print("[*] Running... Press Ctrl+C to stop.")
    sys.stdin.read()

if __name__ == "__main__":
    main()