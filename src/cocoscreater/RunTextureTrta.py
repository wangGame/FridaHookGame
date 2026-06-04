import frida
import sys
import time

PACKAGE_NAME = "com.xxx.xxx"   # 改成你的包名
JS_PATH = "js/RunTextureTrace.js"

SPAWN_APP = True


def on_message(message, data):
    if message["type"] == "send":
        print("[send]", message["payload"])
    elif message["type"] == "error":
        print("[error]", message.get("description"))
        print(message.get("stack"))
    else:
        print("[message]", message)


def main():
    device = frida.get_usb_device(timeout=10)

    if SPAWN_APP:
        print("[*] spawning:", PACKAGE_NAME)
        pid = device.spawn([PACKAGE_NAME])
        session = device.attach(pid)
    else:
        print("[*] attaching:", PACKAGE_NAME)
        session = device.attach(PACKAGE_NAME)
        pid = None

    with open(JS_PATH, "r", encoding="utf-8") as f:
        script_code = f.read()

    script = session.create_script(script_code)
    script.on("message", on_message)

    print("[*] loading script")
    script.load()

    if SPAWN_APP and pid is not None:
        print("[*] resuming app")
        device.resume(pid)

    print("[*] running, press Ctrl+C to stop")
    try:
        sys.stdin.read()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()