'use strict';

function findIl2cpp() {
    var module = Process.findModuleByName("libil2cpp.so");

    if (module === null) {
        throw "libil2cpp.so not found";
    }

    console.log("[FOUND IL2CPP]");
    console.log("BASE:", module.base);
    console.log("SIZE:", module.size);

    return module;
}

function dumpIl2cppSafe() {
    var module = findIl2cpp();

    // 枚举所有可读内存段
    var ranges = Process.enumerateRangesSync({
        protection: 'r--',
        coalesce: false
    });

    var il2cppRanges = [];

    ranges.forEach(function (r) {
        if (r.file && r.file.path.indexOf("libil2cpp.so") !== -1) {
            il2cppRanges.push(r);
        }
    });

    console.log("Segment count:", il2cppRanges.length);

    var result = [];

    il2cppRanges.forEach(function (r) {
        try {
            console.log(
                "Dumping:",
                r.base,
                "size:",
                r.size,
                "perm:",
                r.protection
            );

            var data = Memory.readByteArray(r.base, r.size);

            result.push({
                base: r.base.toString(),
                size: r.size,
                data: data
            });

        } catch (e) {
            console.log("Skip segment:", r.base, e);
        }
    });

    console.log("Dump finished");
    return result;
}

rpc.exports = {
    dump: dumpIl2cppSafe
};

