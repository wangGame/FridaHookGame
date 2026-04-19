function dumpSo(name) {
    var module = Process.getModuleByName(name);

    if (!module) {
        console.log("[-] Module not found:", name);
        return;
    }

    console.log("[*] Module:", name);
    console.log("[*] Base:", module.base);
    console.log("[*] Size:", module.size);

    // =========================
    // 修复 ELF Header（关键）
    // =========================
    try {
        Memory.protect(module.base, 0x1000, 'rwx');

        // 写入 ELF Magic: 0x7F 'E' 'L' 'F'
        Memory.writeByteArray(module.base, [0x7F, 0x45, 0x4C, 0x46]);

        console.log("[+] ELF header fixed");
    } catch (e) {
        console.log("[-] ELF fix failed:", e);
    }

    // =========================
    // 开始 dump
    // =========================
var path = "/data/data/com.oakever.jigsawcard/libil2cpp_dump.so";

    try {
        var file = new File(path, "wb");

        var buffer = Memory.readByteArray(module.base, module.size);

        file.write(buffer);
        file.flush();
        file.close();

        console.log("[+] Dump success ->", path);
    } catch (e) {
        console.log("[-] Dump failed:", e);
    }
}

// =========================
// 可选：等 libil2cpp 加载完
// =========================
function waitForSo(name, callback) {
    var interval = setInterval(function () {
        var m = Process.findModuleByName(name);
        if (m) {
            clearInterval(interval);
            console.log("[+] Found module:", name);
            callback();
        }
    }, 500);
}

// =========================
// 主入口
// =========================
setImmediate(function () {

    console.log("[*] Dump script start");

    waitForSo("libil2cpp.so", function () {
        dumpSo("libil2cpp.so");
    });

});