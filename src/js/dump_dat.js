function dumpFileFromMemory(keyword, outName) {
    var ranges = Process.enumerateRangesSync({
        protection: 'r--',
        coalesce: true
    });

    var found = false;

    ranges.forEach(function (r) {
        if (r.file && r.file.path.indexOf(keyword) >= 0) {
            found = true;

            console.log("[+] Found:", r.file.path);
            console.log("[*] Base:", r.base, "Size:", r.size);

            var path = "/data/local/tmp/" + outName;

            try {
                var file = new File(path, "wb");

                // 分块读，避免崩
                var chunkSize = 0x100000;
                var offset = 0;

                while (offset < r.size) {
                    var size = Math.min(chunkSize, r.size - offset);

                    var buffer = Memory.readByteArray(r.base.add(offset), size);
                    file.write(buffer);

                    offset += size;
                }

                file.flush();
                file.close();

                console.log("[+] Dump success:", path);
            } catch (e) {
                console.log("[-] Dump failed:", e);
            }
        }
    });

    if (!found) {
        console.log("[-] Not found:", keyword);
    }
}

// =========================
// 主逻辑
// =========================
setImmediate(function () {

    console.log("[*] Metadata dump start");

    // 1️⃣ dump global-metadata.dat（最关键）
    dumpFileFromMemory("global-metadata.dat", "global-metadata.dat");

    // 2️⃣ dump mscorlib 资源（你已经看到的那个）
    dumpFileFromMemory("mscorlib.dll-resources.dat", "mscorlib-resources.dat");

});