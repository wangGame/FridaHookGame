'use strict';

var dumpIndex = 0;

//================ WebP HEADER CHECK =================

function isWebP(u8, off) {

    if (off + 12 > u8.length) return false;

    return (
        u8[off]     === 0x52 && // R
        u8[off + 1] === 0x49 && // I
        u8[off + 2] === 0x46 && // F
        u8[off + 3] === 0x46 && // F
        u8[off + 8] === 0x57 && // W
        u8[off + 9] === 0x45 && // E
        u8[off +10] === 0x42 && // B
        u8[off +11] === 0x50    // P
    );
}

//================ SAFE MEMORY READ =================

function safeRead(addr, size) {

    var MAX = 1024 * 1024; // 每次最多1MB
    var offset = 0;
    var blocks = [];

    while (offset < size) {

        var len = Math.min(MAX, size - offset);

        try {

            var chunk = Memory.readByteArray(addr.add(offset), len);
            blocks.push(chunk);
            offset += len;

        } catch (e) {

            // 碰到保护页直接停止
            break;
        }
    }

    if (blocks.length === 0) return null;

    // 合并
    var total = 0;
    blocks.forEach(b => total += b.byteLength);

    var result = new Uint8Array(total);
    var pos = 0;

    blocks.forEach(function (b) {
        var u8 = new Uint8Array(b);
        result.set(u8, pos);
        pos += u8.length;
    });

    return result;
}

//================ SAVE FILE =================

function saveWebP(u8buf) {

    Java.perform(function () {

        try {

            var ActivityThread = Java.use("android.app.ActivityThread");
            var ctx = ActivityThread.currentApplication().getApplicationContext();

            var baseDir = ctx.getExternalFilesDir(null).getAbsolutePath();
            var dumpDir = baseDir + "/webpdump/";

            var File = Java.use("java.io.File");
            var FileOutputStream = Java.use("java.io.FileOutputStream");

            var dir = File.$new(dumpDir);
            if (!dir.exists()) dir.mkdirs();

            var outPath = dumpDir + "webp_" + dumpIndex + ".webp";
            dumpIndex++;

            var fos = FileOutputStream.$new(outPath);

            var javaBytes = Java.array('byte', u8buf);
            fos.write(javaBytes);
            fos.flush();
            fos.close();

            console.log("[WEBP SAVED]", outPath);

        } catch (e) {

            console.log("[SAVE ERROR]", e);

        }

    });
}

//================ MMAP HOOK =================

Interceptor.attach(Module.findExportByName("libc.so", "mmap"), {

    onEnter: function (args) {

        this.size = args[1].toInt32();

    },

    onLeave: function (retval) {

        var addr = retval;

        if (addr.isNull()) return;

        // 过滤小内存
        if (this.size < 1024 * 30) return; // 30KB 以下忽略

        try {

            var mem = safeRead(addr, this.size);
            if (!mem) return;

            var u8 = mem;

            for (var i = 0; i < u8.length - 12; i++) {

                if (!isWebP(u8, i)) continue;

                // 读取 RIFF size (little endian)
                var size =
                    (u8[i + 4]) |
                    (u8[i + 5] << 8) |
                    (u8[i + 6] << 16) |
                    (u8[i + 7] << 24);

                var total = size + 8;

                if (total < 64 || total > 50 * 1024 * 1024) continue;

                if (i + total > u8.length)
                    total = u8.length - i;

                var webpData = u8.slice(i, i + total);

                saveWebP(webpData);

                console.log("[WEBP FOUND] size =", total);

                i += total;
            }

        } catch (e) {

            console.log("[MMAP ERROR]", e);

        }
    }
});
