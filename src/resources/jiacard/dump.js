function dumpIl2cpp() {

    var module = Process.findModuleByName("libil2cpp.so");
    if (!module) {
        console.log("[-] libil2cpp.so not found");
        return;
    }

    console.log("[+] Found libil2cpp.so");
    console.log("    Base:", module.base);
    console.log("    Size:", module.size);

    var ranges = module.enumerateRanges("r--");

    console.log("[+] Readable ranges:", ranges.length);

    var totalSize = 0;
    ranges.forEach(function (r) {
        totalSize += r.size;
    });

    var finalBuffer = new Uint8Array(totalSize);
    var offset = 0;

    ranges.forEach(function (range) {

        try {
            var bytes = range.base.readByteArray(range.size);
            var arr = new Uint8Array(bytes);

            finalBuffer.set(arr, offset);
            offset += arr.length;

        } catch (e) {
            console.log("[-] Skip unreadable range:", range.base);
        }

    });

    console.log("[+] Sending to PC...");
    send("done", finalBuffer.buffer);
    console.log("[✓] Dump sent.");
}

setImmediate(function () {

    var timer = setInterval(function () {

        var m = Process.findModuleByName("libil2cpp.so");
        if (m) {
            clearInterval(timer);
            dumpIl2cpp();
        }

    }, 500);
});
