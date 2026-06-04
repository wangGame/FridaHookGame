import frida
import sys
import os
import json
import threading
import time
import traceback

# =========================
# 配置区
# =========================

# 推荐用包名，更稳定
# process_name = "com.block.juggle"

# 也可以用进程名
process_name = "Block Blast!"

js_path = r"./js/DumpCocosSo.js"

out_dir = r"./memdump"
os.makedirs(out_dir, exist_ok=True)

index_path = os.path.join(out_dir, "index.json")


# =========================
# 全局状态
# =========================

done_event = threading.Event()

index = {
    "process": process_name,
    "ranges": [],
    "skipped_ranges": []
}

open_files = {}
range_meta = {}

progress = {
    "range_count": 0,
    "will_dump_count": 0,
    "range_done": 0,
    "range_skipped": 0,
    "total_size": 0,
    "processed_bytes": 0,
    "current_range_id": -1,
    "current_range_size": 0,
    "current_range_offset": 0,
    "start_time": time.time(),
    "last_print": 0,
}


# =========================
# 工具函数
# =========================

def safe_filename(s: str) -> str:
    bad = ['/', '\\', ':', '*', '?', '"', '<', '>', '|', ' ']
    for b in bad:
        s = s.replace(b, "_")
    return s


def fmt_size(n: float) -> str:
    n = float(n)

    units = ["B", "KB", "MB", "GB", "TB"]
    i = 0

    while n >= 1024 and i < len(units) - 1:
        n /= 1024
        i += 1

    return "%.2f%s" % (n, units[i])


def fmt_time(sec: float) -> str:
    if sec < 0 or sec == float("inf"):
        return "--:--"

    sec = int(sec)

    h = sec // 3600
    m = (sec % 3600) // 60
    s = sec % 60

    if h > 0:
        return "%02d:%02d:%02d" % (h, m, s)

    return "%02d:%02d" % (m, s)


def print_progress(force=False):
    now = time.time()

    if not force and now - progress["last_print"] < 1.0:
        return

    progress["last_print"] = now

    total = int(progress["total_size"])
    done = int(progress["processed_bytes"])

    elapsed = max(now - progress["start_time"], 0.001)
    speed = done / elapsed

    if total > 0:
        percent = done * 100.0 / total
        if percent > 100:
            percent = 100.0
    else:
        percent = 0.0

    if total > 0 and speed > 0:
        eta = (total - done) / speed
        if eta < 0:
            eta = 0
    else:
        eta = -1

    current_range = progress["current_range_id"] + 1
    range_count = progress["range_count"]

    if current_range < 0:
        current_range = 0

    line = (
        "\r[progress] "
        "range %d/%d | "
        "done %d | "
        "skip %d | "
        "%.2f%% | "
        "%s / %s | "
        "speed %s/s | "
        "eta %s"
    ) % (
        current_range,
        range_count,
        progress["range_done"],
        progress["range_skipped"],
        percent,
        fmt_size(done),
        fmt_size(total),
        fmt_size(speed),
        fmt_time(eta)
    )

    sys.stdout.write(line)
    sys.stdout.flush()


def close_all_files():
    for rid, fp in list(open_files.items()):
        try:
            fp.flush()
            fp.close()
        except Exception:
            pass

        open_files.pop(rid, None)


def write_index():
    with open(index_path, "w", encoding="utf-8") as f:
        json.dump(index, f, indent=2, ensure_ascii=False)


# =========================
# Frida message 回调
# =========================

def on_message(message, data):
    global index

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
        msg_type = payload.get("type")

        # =========================
        # start
        # =========================
        if msg_type == "start":
            total_size = int(payload.get("total_size", 0) or 0)
            range_count = int(payload.get("range_count", 0) or 0)
            will_dump_count = int(payload.get("will_dump_count", 0) or 0)
            chunk_size = int(payload.get("chunk_size", 0) or 0)

            print("[+] dump start")
            print("    range_count        =", range_count)
            print("    will_dump_count    =", will_dump_count)
            print("    total_size         =", fmt_size(total_size))
            print("    chunk_size         = 0x%x" % chunk_size)
            print("    skip_system        =", payload.get("skip_system"))
            print("    skip_so            =", payload.get("skip_so"))
            print("    skip_large_anon_rw =", payload.get("skip_large_anon_rw"))
            print("    max_anon_rw_size   =", fmt_size(payload.get("max_anon_rw_size", 0) or 0))
            print("    start_range_id     =", payload.get("start_range_id"))
            print("    only_anon          =", payload.get("only_anon"))
            print("    only_writable      =", payload.get("only_writable"))

            index["config"] = payload

            progress["range_count"] = range_count
            progress["will_dump_count"] = will_dump_count
            progress["total_size"] = total_size
            progress["processed_bytes"] = 0
            progress["range_done"] = 0
            progress["range_skipped"] = 0
            progress["current_range_id"] = -1
            progress["current_range_size"] = 0
            progress["current_range_offset"] = 0
            progress["start_time"] = time.time()
            progress["last_print"] = 0

            print_progress(force=True)

        # =========================
        # range skip
        # =========================
        elif msg_type == "range_skip":
            rid = int(payload["id"])
            reason = payload.get("reason", "")
            base = payload.get("base", "")
            size = int(payload.get("size", 0) or 0)
            prot = payload.get("protection", "")
            file_path = payload.get("file", "")

            meta = dict(payload)
            index["skipped_ranges"].append(meta)

            progress["range_skipped"] += 1
            progress["current_range_id"] = rid

            print(
                "\n[range skip] id=%d base=%s size=%s prot=%s reason=%s file=%s" %
                (rid, base, fmt_size(size), prot, reason, file_path)
            )

            print_progress(force=True)

        # =========================
        # range start
        # =========================
        elif msg_type == "range_start":
            rid = int(payload["id"])
            base = payload["base"]
            size = int(payload["size"])
            prot = payload["protection"]
            file_path = payload.get("file", "")

            name = "range_%05d_%s_%s_0x%x.bin" % (
                rid,
                base,
                prot.replace("-", "_"),
                size
            )

            name = safe_filename(name)
            bin_path = os.path.join(out_dir, name)

            fp = open(bin_path, "wb")
            fp.truncate(size)

            open_files[rid] = fp

            meta = dict(payload)
            meta["dump_file"] = name
            range_meta[rid] = meta

            progress["current_range_id"] = rid
            progress["current_range_size"] = size
            progress["current_range_offset"] = 0

            print(
                "\n[range start] id=%d base=%s size=%s prot=%s file=%s" %
                (rid, base, fmt_size(size), prot, file_path)
            )

            print_progress(force=True)

        # =========================
        # chunk
        # =========================
        elif msg_type == "chunk":
            rid = int(payload["id"])
            offset = int(payload["offset"])
            size = int(payload["size"])

            fp = open_files.get(rid)

            if fp is None:
                print("\n[-] no open file for range", rid)
                return

            if data is None:
                print(
                    "\n[-] empty data rid=%d offset=0x%x size=0x%x" %
                    (rid, offset, size)
                )
                return

            fp.seek(offset)
            fp.write(data)

            progress["processed_bytes"] += size
            progress["current_range_id"] = rid
            progress["current_range_offset"] = offset + size

            print_progress()

        # =========================
        # read error
        # =========================
        elif msg_type == "read_error":
            rid = int(payload["id"])
            size = int(payload.get("size", 0) or 0)

            print(
                "\n[-] read error id=%d addr=%s offset=0x%x size=0x%x err=%s" %
                (
                    rid,
                    payload.get("addr"),
                    int(payload.get("offset", 0) or 0),
                    size,
                    payload.get("error")
                )
            )

            meta = range_meta.get(rid)

            if meta is not None:
                meta.setdefault("read_errors", []).append(payload)

            # 读失败的块也算处理过，否则进度会卡住
            progress["processed_bytes"] += size
            progress["current_range_id"] = rid

            print_progress(force=True)

        # =========================
        # range done
        # =========================
        elif msg_type == "range_done":
            rid = int(payload["id"])

            fp = open_files.pop(rid, None)

            if fp:
                fp.flush()
                fp.close()

            meta = range_meta.get(rid)

            if meta:
                index["ranges"].append(meta)

            progress["range_done"] += 1
            progress["current_range_id"] = rid
            progress["current_range_offset"] = progress["current_range_size"]

            print_progress(force=True)
            print("\n[range done] id=%d" % rid)

        # =========================
        # progress
        # =========================
        elif msg_type == "progress":
            progress["processed_bytes"] = int(
                payload.get("processed_bytes", progress["processed_bytes"]) or 0
            )
            progress["total_size"] = int(
                payload.get("total_size", progress["total_size"]) or 0
            )
            progress["current_range_id"] = int(
                payload.get("range_id", progress["current_range_id"]) or 0
            )
            progress["current_range_offset"] = int(
                payload.get("range_offset", progress["current_range_offset"]) or 0
            )
            progress["current_range_size"] = int(
                payload.get("range_size", progress["current_range_size"]) or 0
            )

            print_progress()

        # =========================
        # done
        # =========================
        elif msg_type == "done":
            processed_bytes = int(payload.get("processed_bytes", progress["processed_bytes"]) or 0)

            progress["processed_bytes"] = processed_bytes

            print_progress(force=True)
            print()

            print("[+] dump done")

            close_all_files()
            write_index()

            print("[+] index:", index_path)
            done_event.set()

        else:
            print("\n[send]", payload)

    except Exception:
        print("\n[on_message exception]")
        traceback.print_exc()
        done_event.set()


# =========================
# 主函数
# =========================

def main():
    print("========== Frida Memory Dump ==========")
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
    print("[*] dumping...")

    try:
        while not done_event.is_set():
            time.sleep(0.2)

    except KeyboardInterrupt:
        print("\n[*] interrupted by user")

    finally:
        close_all_files()

        try:
            write_index()
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

    print("[*] output dir:", out_dir)
    print("========== Finished ==========")


if __name__ == "__main__":
    main()