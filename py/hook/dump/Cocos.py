import frida, time, os, sys

PACKAGE = "com.red.sortingstore.android"
OUT_DIR = "./dumped_pngs"
os.makedirs(OUT_DIR, exist_ok=True)
_buffers = {}

def on_message(message, data):
    if message["type"] == "send":
        p = message.get("payload", {})
        if p.get("kind") == "png_chunk":
            addr, off, total = p["addr"], p["off"], p["total"]
            b = _buffers.setdefault(addr, bytearray(total))
            b[off:off+len(data)] = data
            if off + len(data) >= total:
                fn = os.path.join(OUT_DIR, f"{addr.replace('0x','')}_{total}.png")
                with open(fn, "wb") as f:
                    f.write(b)
                print("[+] saved:", fn)
                _buffers.pop(addr, None)
    else:
        print("[!]", message)

def main():
    device = frida.get_usb_device(timeout=10)

    # attach: 不 spawn
    pid = 6598
    session = device.attach(pid)

    with open("../../../hook/CocosHook2.js", "r", encoding="utf-8") as f:
        script = session.create_script(f.read())
    script.on("message", on_message)
    script.load()

    input("[*] 先把游戏切到图片已经出现的界面，再按回车开始扫描...")

    opts = {
        "rangeMode": "rw",         # 先用 rw 更快/误报少；不行再换 "r"
        "maxHits": 100,
        "minSize": 4096,
        "maxRangeSize": 256 * 1024 * 1024,
    }

    hits = script.exports_sync.scanpng(opts)
    print("[*] scan hits:", len(hits))

    ok = [h for h in hits if int(h.get("size", 0)) > 0]
    print("[*] parsable png:", len(ok))

    for i, h in enumerate(ok, 1):
        addr = h["addr"]
        size = int(h["size"])
        print(f"[*] dumping {i}/{len(ok)} {addr} size={size}")
        script.exports_sync.dumpchunks(addr, size, 512 * 1024)

    print("[*] done. Ctrl+C exit")
    sys.stdin.read()

if __name__ == "__main__":
    main()
