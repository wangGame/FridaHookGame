import frida
import sys

PACKAGE_NAME = "Domino Legends"
PACKAGE_NAME = "Art Jigsaw Puzzle"
OUTPUT_FILE = "libil2cpp_dumpx.so"


def on_message(message, data):
    if message["type"] == "send":
        print("[+] Receiving dump1...")

        with open(OUTPUT_FILE, "wb") as f:
            f.write(data)

        print("[✓] Saved to", OUTPUT_FILE)

    elif message["type"] == "error":
        print("[!] Error:", message)


def main():
    device = frida.get_usb_device(timeout=10)

    print("[*] Attaching to", PACKAGE_NAME)
    session = device.attach(PACKAGE_NAME)

    with open("../resources/jiacard/dump.js", "r", encoding="utf-8") as f:
        script_code = f.read()

    script = session.create_script(script_code)
    script.on("message", on_message)
    script.load()

    print("[*] Script loaded.")
    sys.stdin.read()


if __name__ == "__main__":
    main()
