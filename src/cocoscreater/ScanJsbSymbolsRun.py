import frida
import os
import json
import time
import threading
import traceback

# =========================
# 配置区
# =========================

# 推荐包名
# process_name = "com.xxx.xxx"

# 也可以进程名
process_name = "Block Blast!"

js_path = r"./js/ScanJsbSymbols.js"

out_dir = r"./jsb_scan_result"
os.makedirs(out_dir, exist_ok=True)

result_path = os.path.join(out_dir, "jsb_scan_result.json")

done_event = threading.Event()

result = {
    "process": process_name,
    "exports": [],
    "symbols": [],
    "memory_hits": [],
    "scan_errors": [],
    "summary": {}
}


def fmt_size(n):
    n = float(n)
    units = ["B", "KB", "MB", "GB", "TB"]
    i = 0

    while n >= 1024 and i < len(units) - 1:
        n /= 1024
        i += 1

    return "%.2f%s" % (n, units[i])


def save_result():
    with open(result_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)


def on_message(message, data):
    try:
        if message["type"] == "error":
            print("[script error]")
            print(message.get("description", ""))
            print(message.get("stack", ""))
            done_event.set()
            return

        if message["type"] != "send":
            print("[message]", message)
            return

        payload = message["payload"]
        t = payload.get("type")

        if t == "start":
            result["config"] = payload
            print("[+] scan start")
            print("    scan_anon =", payload.get("scan_anon"))
            print("    scan_exec =", payload.get("scan_exec"))
            print("    max_range_size =", fmt_size(payload.get("max_range_size", 0)))
            print("    scan_chunk_size =", fmt_size(payload.get("scan_chunk_size", 0)))

        elif t == "symbol_scan_start":
            print("[+] symbol scan start")
            print("    module_count =", payload.get("module_count"))

        elif t == "export_hit":
            result["exports"].append(payload)
            print(
                "[export] kw=%s module=%s addr=%s name=%s" %
                (
                    payload.get("keyword"),
                    payload.get("module"),
                    payload.get("address"),
                    payload.get("name")
                )
            )

        elif t == "symbol_hit":
            result["symbols"].append(payload)
            print(
                "[symbol] kw=%s module=%s addr=%s name=%s" %
                (
                    payload.get("keyword"),
                    payload.get("module"),
                    payload.get("address"),
                    payload.get("name")
                )
            )

        elif t == "symbol_scan_done":
            print("[+] symbol scan done")
            print("    export_hits =", payload.get("export_hits"))
            print("    symbol_hits =", payload.get("symbol_hits"))

        elif t == "memory_scan_start":
            print("[+] memory scan start")
            print("    range_count =", payload.get("range_count"))
            print("    total_size  =", fmt_size(payload.get("total_size", 0)))
            print("    keywords    =", payload.get("keywords"))

        elif t == "keyword_start":
            print("\n========== keyword: %s ==========" % payload.get("keyword"))

        elif t == "keyword_progress":
            print(
                "\r[scan] kw=%s range=%s/%s scanned=%s hits=%s" %
                (
                    payload.get("keyword"),
                    payload.get("range_index"),
                    payload.get("range_count"),
                    fmt_size(payload.get("scanned_bytes", 0)),
                    payload.get("hits")
                ),
                end="",
                flush=True
            )

        elif t == "memory_hit":
            result["memory_hits"].append(payload)
            print()
            print(
                "[mem] kw=%s addr=%s prot=%s file=%s" %
                (
                    payload.get("keyword"),
                    payload.get("address"),
                    payload.get("protection"),
                    payload.get("file")
                )
            )
            print("      around:", payload.get("around"))

        elif t == "scan_error":
            result["scan_errors"].append(payload)
            print()
            print(
                "[-] scan error kw=%s addr=%s size=%s err=%s file=%s" %
                (
                    payload.get("keyword"),
                    payload.get("address"),
                    fmt_size(payload.get("size", 0)),
                    payload.get("error"),
                    payload.get("file")
                )
            )

        elif t == "keyword_done":
            print()
            print(
                "[+] keyword done: %s hits=%s stopped=%s" %
                (
                    payload.get("keyword"),
                    payload.get("hits"),
                    payload.get("stopped")
                )
            )

        elif t == "memory_scan_done":
            result["summary"] = payload.get("summary", {})
            print("[+] memory scan done")
            print(json.dumps(result["summary"], indent=2, ensure_ascii=False))

        elif t == "done":
            print("[+] all done")
            save_result()
            print("[+] result:", result_path)
            done_event.set()

        else:
            print("[send]", payload)

    except Exception:
        print("[on_message exception]")
        traceback.print_exc()
        done_event.set()


def main():
    print("========== Scan JSB Symbols ==========")
    print("[*] process:", process_name)
    print("[*] js_path:", js_path)

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
            save_result()
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