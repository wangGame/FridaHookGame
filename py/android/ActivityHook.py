import frida
import sys
import atexit

dump_path = "mata.so"
dump_file = open(dump_path, "wb")
total_size = 0

def on_message(message, data):
    if message["type"] == "send":
        payload = message["payload"]
        if payload.get("type") == "il2cpp-reg":
            print("[+] CodeRegistration     =", payload["codeRegistration"])
            print("[+] MetadataRegistration =", payload["metadataRegistration"])

@atexit.register
def finish():
    dump_file.close()
    print(f"[+] dump saved: {dump_path}, bytes={total_size}")

if __name__ == '__main__':
    device = frida.get_usb_device(timeout=5)
    # gadget / spawn 场景都 OK
    session = device.attach("Jigsawcard")
    with open("../../resources/js/global.js", "r", encoding="utf-8") as f:
        js_code = f.read()
    script = session.create_script(js_code)
    script.on("message", on_message)
    script.load()
    print("Hook OK")
    sys.stdin.read()
