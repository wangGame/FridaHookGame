import frida
import os
import json
import csv
import time
import threading
import traceback

# =========================
# 配置区
# =========================

process_name = "Block Blast!"
js_path = r"./js/Hookjs.js"

out_dir = r"./native_jsb_string_map"
os.makedirs(out_dir, exist_ok=True)

json_path = os.path.join(out_dir, "native_jsb_string_map.json")
csv_path = os.path.join(out_dir, "native_jsb_string_map.csv")

done_event = threading.Event()

result = {
    "process": process_name,
    "config": {},
    "hits": [],
    "errors": []
}


def fmt_size(n):
    n = float(n)
    units = ["B", "KB", "MB", "GB", "TB"]
    i = 0

    while n >= 1024 and i < len(units) - 1:
        n /= 1024
        i += 1

    return "%.2f%s" % (n, units[i])


def save_json():
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)


def save_csv():
    fields = [
        "keyword",
        "address",

        "protection",
        "range_base",
        "range_size",
        "range_file",

        "map_start",
        "map_end",
        "map_perms",
        "map_offset",
        "map_delta",
        "map_file_offset",
        "map_path",
        "map_line",

        "module_name",
        "module_path",
        "module_base",
        "module_offset",

        "nearest_module_name",
        "nearest_module_path",
        "nearest_module_base",
        "nearest_module_delta",

        "around"
    ]

    with open(csv_path, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()

        for h in result["hits"]:
            writer.writerow({k: h.get(k, "") for k in fields})


def save_all():
    save_json()
    save_csv()


def on_message(message, data):
    try:
        if message["type"] == "error":
            print("\n[script error]")
            print(message.get("description", ""))
            print(message.get("stack", ""))
            done_event.set()
            return

        if message["type"] != "send":
            print("\n[message]", message)
            return

        payload = message["payload"]
        t = payload.get("type")

        if t == "start":
            result["config"] = payload

            print("[+] start")
            print("    modules   =", payload.get("modules"))
            print("    maps      =", payload.get("maps"))
            print("    ranges    =", payload.get("ranges"))
            print("    scan_size =", fmt_size(payload.get("scan_size", 0)))
            print("    keywords  =", len(payload.get("keywords", [])))

        elif t == "keyword_start":
            print("\n========== keyword: %s ==========" % payload.get("keyword"))

        elif t == "hit":
            result["hits"].append(payload)

            print(
                "[hit] kw=%s addr=%s map_path=%s file_off=%s module=%s module_off=%s" %
                (
                    payload.get("keyword"),
                    payload.get("address"),
                    payload.get("map_path"),
                    payload.get("map_file_offset"),
                    payload.get("module_name"),
                    payload.get("module_offset")
                )
            )

        elif t == "scan_error":
            result["errors"].append(payload)

            print(
                "[-] scan error kw=%s addr=%s size=%s err=%s" %
                (
                    payload.get("keyword"),
                    payload.get("address"),
                    fmt_size(payload.get("size", 0)),
                    payload.get("error")
                )
            )

        elif t == "keyword_done":
            print(
                "[+] keyword done: %s hits=%s stopped=%s" %
                (
                    payload.get("keyword"),
                    payload.get("hits"),
                    payload.get("stopped")
                )
            )

        elif t == "done":
            print("[+] done")

            save_all()

            print("[+] json:", json_path)
            print("[+] csv :", csv_path)

            done_event.set()

        else:
            print("[send]", payload)

    except Exception:
        print("\n[on_message exception]")
        traceback.print_exc()
        done_event.set()


def main():
    print("========== Native JSB String Map ==========")
    print("[*] process:", process_name)
    print("[*] js_path:", js_path)
    print("[*] out_dir:", out_dir)

    if not os.path.exists(js_path):
        print("[-] js not found:", js_path)
        return

    device = frida.get_usb_device(timeout=10)

    print("[*] attaching...")
    session = device.attach(process_name)

    with open(js_path, "r", encoding="utf-8") as f:
        js_code = f.read()

    script = session.create_script(js_code)
    script.on("message", on_message)
    script.load()

    print("[*] script loaded")

    try:
        while not done_event.is_set():
            time.sleep(0.2)

    except KeyboardInterrupt:
        print("\n[*] interrupted")

    finally:
        try:
            save_all()
        except Exception:
            pass

        try:
            script.unload()
        except Exception:
            pass

        try:
            session.detach()
        except Exception:
            pass

    print("[*] finished")


if __name__ == "__main__":
    main()