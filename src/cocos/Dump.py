import frida
import sys
import os
import json

PACKAGE = "Block Blast!"
OUTPUT_DIR = "dump"

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

all_content = []

def on_message(message, data):
    global all_content

    if message["type"] == "send":
        payload = message["payload"]

        if payload.get("type") == "dump1":
            file_name = payload["file"]
            content = payload["data"]

            path = os.path.join(OUTPUT_DIR, file_name)

            with open(path, "w", encoding="utf-8") as f:
                f.write(content)

            print("[+] Saved:", path)

            all_content.append(content)

        elif payload.get("type") == "log":
            print("[JS]", payload.get("data"))

    elif message["type"] == "error":
        print("[ERROR]", message)

def main():
    print("[*] Connecting to USB device...")
    device = frida.get_usb_device(timeout=10)

    print("[*] Attaching to:", PACKAGE)
    session = device.attach(PACKAGE)

    with open("dump_cocos.js", "r", encoding="utf-8") as f:
        script_code = f.read()

    script = session.create_script(script_code)
    script.on("message", on_message)
    script.load()

    print("[*] Running... Press Ctrl+C to stop.")

    try:
        sys.stdin.read()
    except KeyboardInterrupt:
        print("\n[*] Stopping...")

        if all_content:
            merged_path = os.path.join(OUTPUT_DIR, "all_dump.js")
            with open(merged_path, "w", encoding="utf-8") as f:
                f.write("\n\n".join(all_content))

            print("[+] Merged file saved:", merged_path)

if __name__ == "__main__":
    main()