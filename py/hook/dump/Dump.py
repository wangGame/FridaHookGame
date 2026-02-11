import frida
import sys
import time

PACKAGE = "com.oakever.jigsawcard"
SAVE_FILE = "../metadata_dump.bin"

print("[*] connecting usb device...")

device = frida.get_usb_device(timeout=10)

front = device.get_frontmost_application()
print("[*] front app:", front)

pid = front.pid

print("[*] attaching pid:", pid)

session = device.attach(pid)

script_code = """
rpc.exports = {};

rpc.exports.dumpmeta = function () {

    var ranges = null;

    // Android frida runtime compatibility
    if (Process.enumerateRangesSync) {
        ranges = Process.enumerateRangesSync('r--');
    } else {
        ranges = Process.enumerateRanges('r--');
    }

    console.log("[JS] scan ranges:", ranges.length);

    for (var i = 0; i < ranges.length; i++) {

        var r = ranges[i];

        // metadata usually > 1MB
        if (r.size < 0x100000)
            continue;

        try {

            var data = Memory.readByteArray(r.base, r.size);
            if (!data) continue;

            var u8 = new Uint8Array(data);

            for (var j = 0; j < u8.length - 4; j++) {

                // global-metadata magic
             

                    var realBase = r.base.add(j);

                    console.log("[JS] FOUND metadata");
                    console.log("[JS] range base:", r.base);
                    console.log("[JS] offset:", j);
                    console.log("[JS] real base:", realBase);

                    var size = r.size - j;

                    return {
                        base: realBase.toString(),
                        size: size,
                        data: Memory.readByteArray(realBase, size)
                    };
                 
            }

        } catch (e) {
            // ignore unreadable range
        }
    }

    return null;
}
"""

print("[*] loading frida script...")

script = session.create_script(script_code)
script.load()

# important: wait unity load metadata
print("[*] waiting unity initialize...")
time.sleep(3)

api = script.exports_sync

print("[*] scanning memory...")

result = api.dumpmeta()

if result is None:
    print("[-] metadata not found")
    sys.exit(0)

print("[+] metadata FOUND")
print("[+] base :", result["base"])
print("[+] size :", result["size"])

data = bytes(result["data"])

with open(SAVE_FILE, "wb") as f:
    f.write(data)

print("[+] dump success:", SAVE_FILE)
print("[+] DONE")

time.sleep(2)
