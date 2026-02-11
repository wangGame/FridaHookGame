'use strict';

const START = ptr('0x0735c000');
const SIZE  = 0x023C8000;
const CHUNK = 0x10000; // 64KB

const OUT = "/data/local/tmp/libil2cpp_safe.bin";

var f = new File(OUT, "wb");

var offset = 0;

while (offset < SIZE) {

    var readSize = Math.min(CHUNK, SIZE - offset);

    try {

        var buf = Memory.readByteArray(START.add(offset), readSize);
        f.write(buf);

    } catch (e) {

        console.log("[-] Fail at", START.add(offset), e);
        break;
    }

    offset += readSize;

    if ((offset & 0xFFFFF) == 0) { // 每1MB提示
        console.log("[*] Dumped", (offset/1024/1024).toFixed(1), "MB");
    }
}

f.close();

console.log("[✓] Finished");
