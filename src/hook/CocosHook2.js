'use strict';

/*
 RIFF xxxx WEBP
*/

function isWebpHeader(p) {
    return (
        p.readU32() === 0x46464952 &&      // RIFF (LE)
        p.add(8).readU32() === 0x50424557  // WEBP
    );
}

function getWebpSize(base) {
    try {
        // RIFF chunk size + header(8)
        var sz = base.add(4).readU32LE();
        return sz + 8;
    } catch (e) {
        return 0;
    }
}

rpc.exports = {

    scanpng: function (opts) {

        console.log("scan WEBP called");

        var results = [];

        var ranges = Process.enumerateRangesSync({
            protection: opts.rangeMode || "r",
            coalesce: true
        });

        ranges.forEach(function (r) {

            if (r.size < opts.minSize)
                return;

            try {

                Memory.scanSync(
                    r.base,
                    r.size,
                    "52 49 46 46 ?? ?? ?? ?? 57 45 42 50",
                    {
                        onMatch: function (addr) {

                            if (!isWebpHeader(addr))
                                return;

                            var size = getWebpSize(addr);

                            if (size > 0 && size < 50 * 1024 * 1024) {

                                results.push({
                                    addr: addr.toString(),
                                    size: size
                                });

                                if (results.length >= opts.maxHits)
                                    throw "stop";
                            }
                        },
                        onError: function () {},
                        onComplete: function () {}
                    }
                );

            } catch (e) {}
        });

        return results;
    },

    dumpchunks: function (addrStr, size, chunkSize) {

        var addr = ptr(addrStr);
        var off = 0;

        while (off < size) {

            var n = Math.min(chunkSize, size - off);
            var buf = addr.add(off).readByteArray(n);

            send({
                kind: "png_chunk",   // Python 那边不改
                addr: addrStr,
                off: off,
                total: size
            }, buf);

            off += n;
        }
    }
};
