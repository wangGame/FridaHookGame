import frida

PACKAGE = "jigsawcard"
JS_FILE = "dump_so_memory.js"

OUT_FILE = "libil2cpp_dump.so"


def main():
    device = frida.get_usb_device()
    session = device.attach(PACKAGE)

    file = open(OUT_FILE, "wb")

    def on_message(message, data):
        if message["type"] == "send":
            payload = message["payload"]

            if payload["type"] == "chunk":
                file.write(data)   # ✅ 真正二进制在 data 里

            elif payload["type"] == "info":
                print("[*] base:", payload["base"])
                print("[*] size:", payload["size"])

            elif payload["type"] == "done":
                print("[+] dump finished")
                file.close()
                session.detach()

    with open(JS_FILE, "r", encoding="utf-8") as f:
        script = session.create_script(f.read())

    script.on("message", on_message)
    script.load()

    print("[*] dumping...")

    script.exports_sync.dumpso()

    import sys
    sys.stdin.read()


if __name__ == "__main__":
    main()