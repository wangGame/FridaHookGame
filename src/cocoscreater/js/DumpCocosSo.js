// DumpCocosSo.js
// Safe memory dump with progress / skip dangerous ranges / resume support

console.log("========== Safe Dump Readable Memory ==========");

// =========================
// 配置区
// =========================
const SKIP_DEV_MAPPING = true;
// 小块读取，越小越稳定，越大越快
// 之前 0x10000 = 64KB 容易把目标读崩
const CHUNK_SIZE = 0x4000; // 16KB

// 每读多少个 chunk 休眠一次
const SLEEP_EVERY_CHUNKS = 16;

// 休眠时间，单位秒
const SLEEP_SECONDS = 0.01;

// 是否跳过系统库
const SKIP_SYSTEM = true;

// 是否跳过 so
// 找 Cocos TS/JS 可以先 true
// 想完整 dump 可以 false
const SKIP_SO = false;

// 单个 range 最大大小
const MAX_RANGE_SIZE = 0x10000000; // 256MB

// 匿名 rw 大块最容易崩，建议开启
const SKIP_LARGE_ANON_RW = true;

// 匿名 rw 超过这个大小就跳过
// 你崩溃的是 29MB，所以这里默认 16MB
const MAX_ANON_RW_SIZE = 0x1000000; // 16MB

// 从第几个 range 开始 dump
// 崩溃后可以改成崩溃 range 后面的 id
const START_RANGE_ID = 0;

// 跳过指定 range id
// 注意：range id 每次启动不一定稳定
const SKIP_RANGE_IDS = {
    // 72: true,
};

// 跳过指定 base
// 你之前崩溃的是 0x102ca000，可以直接放开这一行
const SKIP_BASES = {
    // "0x102ca000": true,
};

// 是否只 dump 匿名内存
// 找 JS/TS 一般可以 false
const ONLY_ANON = false;

// 是否只 dump 可写内存
// 找运行时解密出来的脚本，可以尝试 true
const ONLY_WRITABLE = false;


// =========================
// 工具函数
// =========================

function sleepTiny() {
    try {
        Thread.sleep(SLEEP_SECONDS);
    } catch (e) {
    }
}

function addrToNum(p) {
    return parseInt(p.toString(), 16);
}

function fmtSize(n) {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let v = Number(n);
    let i = 0;

    while (v >= 1024 && i < units.length - 1) {
        v /= 1024;
        i++;
    }

    return v.toFixed(2) + units[i];
}

function isReadableProt(prot) {
    return prot.indexOf("r") >= 0;
}

function isWritableProt(prot) {
    return prot.indexOf("w") >= 0;
}

function shouldSkipRangeBasic(r) {
    const file = r.file ? r.file.path : "";
    const base = r.base.toString();

    if (SKIP_BASES[base]) {
        console.log("[skip base] base=" + base);
        return true;
    }

    if (ONLY_ANON && file !== "") {
        return true;
    }

    if (ONLY_WRITABLE && !isWritableProt(r.protection)) {
        return true;
    }

    // 设备映射直接跳过
    // 重点是 /dev/binder，会崩
    if (SKIP_DEV_MAPPING) {
        if (file.indexOf("/dev/") === 0) {
            console.log(
                "[skip dev mapping] base=" + r.base +
                " size=" + fmtSize(r.size) +
                " file=" + file
            );
            return true;
        }

        if (file.indexOf("anon_inode:") >= 0) {
            console.log(
                "[skip anon_inode] base=" + r.base +
                " size=" + fmtSize(r.size) +
                " file=" + file
            );
            return true;
        }
    }

    if (SKIP_SYSTEM) {
        if (file.indexOf("/system/") >= 0) return true;
        if (file.indexOf("/apex/") >= 0) return true;
        if (file.indexOf("/vendor/") >= 0) return true;
        if (file.indexOf("/proc/") >= 0) return true;
        if (file.indexOf("/sys/") >= 0) return true;
        if (file.indexOf("/dev/ashmem/dalvik") >= 0) return true;
    }

    if (SKIP_SO && file.endsWith(".so")) {
        return true;
    }

    if (r.size <= 0) {
        return true;
    }

    if (r.size > MAX_RANGE_SIZE) {
        console.log(
            "[skip large] base=" + r.base +
            " size=" + fmtSize(r.size) +
            " file=" + file
        );
        return true;
    }

    // 匿名 rw 大块非常容易崩，默认跳过
    if (SKIP_LARGE_ANON_RW) {
        if (file === "" && r.protection === "rw-" && r.size > MAX_ANON_RW_SIZE) {
            console.log(
                "[skip large anon rw] base=" + r.base +
                " size=" + fmtSize(r.size)
            );
            return true;
        }
    }

    return false;
}

function shouldSkipRangeById(id) {
    if (id < START_RANGE_ID) {
        return true;
    }

    if (SKIP_RANGE_IDS[id]) {
        return true;
    }

    return false;
}

function collectReadableRanges() {
    const prots = ["r--", "rw-", "r-x", "rwx"];
    const seen = {};
    const result = [];

    prots.forEach(prot => {
        let ranges = [];

        try {
            ranges = Process.enumerateRanges({
                protection: prot,
                coalesce: false
            });
        } catch (e) {
            console.log("[-] enumerateRanges failed: " + prot + " " + e);
            return;
        }

        ranges.forEach(r => {
            const file = r.file ? r.file.path : "";
            const key = r.base + "-" + r.size + "-" + r.protection + "-" + file;

            if (seen[key]) return;
            seen[key] = true;

            if (shouldSkipRangeBasic(r)) return;

            result.push(r);
        });
    });

    result.sort((a, b) => addrToNum(a.base) - addrToNum(b.base));

    return result;
}

function isChunkStillReadable(addr, size) {
    try {
        const rr = Process.findRangeByAddress(addr);

        if (rr === null) {
            return false;
        }

        if (!isReadableProt(rr.protection)) {
            return false;
        }

        const rangeEnd = rr.base.add(rr.size);
        const chunkEnd = addr.add(size);

        if (chunkEnd.compare(rangeEnd) > 0) {
            return false;
        }

        return true;
    } catch (e) {
        return false;
    }
}


// =========================
// Dump range
// =========================

function dumpRange(rangeId, r, progressCallback) {
    const file = r.file ? r.file.path : "";

    if (rangeId < START_RANGE_ID) {
        send({
            type: "range_skip",
            id: rangeId,
            reason: "before START_RANGE_ID",
            base: r.base.toString(),
            size: r.size,
            protection: r.protection,
            file: file
        });
        return;
    }

    if (SKIP_RANGE_IDS[rangeId]) {
        send({
            type: "range_skip",
            id: rangeId,
            reason: "in SKIP_RANGE_IDS",
            base: r.base.toString(),
            size: r.size,
            protection: r.protection,
            file: file
        });
        return;
    }

    send({
        type: "range_start",
        id: rangeId,
        base: r.base.toString(),
        end: r.base.add(r.size).toString(),
        size: r.size,
        protection: r.protection,
        file: file
    });

    console.log(
        "[dump range] id=" + rangeId +
        " base=" + r.base +
        " size=0x" + r.size.toString(16) +
        " prot=" + r.protection +
        " file=" + file
    );

    let offset = 0;
    let chunkIndex = 0;

    while (offset < r.size) {
        const size = Math.min(CHUNK_SIZE, r.size - offset);
        const addr = r.base.add(offset);

        if (!isChunkStillReadable(addr, size)) {
            send({
                type: "read_error",
                id: rangeId,
                base: r.base.toString(),
                addr: addr.toString(),
                offset: offset,
                size: size,
                error: "chunk not readable anymore"
            });

            offset += size;

            if (progressCallback) {
                progressCallback(rangeId, offset, r.size, size);
            }

            continue;
        }

        try {
            const data = Memory.readByteArray(addr, size);

            if (data !== null) {
                send({
                    type: "chunk",
                    id: rangeId,
                    base: r.base.toString(),
                    addr: addr.toString(),
                    offset: offset,
                    size: size
                }, data);
            } else {
                send({
                    type: "read_error",
                    id: rangeId,
                    base: r.base.toString(),
                    addr: addr.toString(),
                    offset: offset,
                    size: size,
                    error: "Memory.readByteArray returned null"
                });
            }

        } catch (e) {
            send({
                type: "read_error",
                id: rangeId,
                base: r.base.toString(),
                addr: addr.toString(),
                offset: offset,
                size: size,
                error: String(e)
            });
        }

        offset += size;
        chunkIndex++;

        if (progressCallback) {
            progressCallback(rangeId, offset, r.size, size);
        }

        if ((chunkIndex % SLEEP_EVERY_CHUNKS) === 0) {
            sleepTiny();
        }
    }

    send({
        type: "range_done",
        id: rangeId,
        base: r.base.toString(),
        size: r.size,
        protection: r.protection,
        file: file
    });
}


// =========================
// Main
// =========================

function main() {
    const ranges = collectReadableRanges();

    let totalSize = 0;
    let willDumpCount = 0;

    for (let i = 0; i < ranges.length; i++) {
        if (!shouldSkipRangeById(i)) {
            totalSize += ranges[i].size;
            willDumpCount++;
        }
    }

    console.log("[+] readable ranges = " + ranges.length);
    console.log("[+] will dump ranges = " + willDumpCount);
    console.log("[+] total dump size = " + fmtSize(totalSize));

    send({
        type: "start",
        range_count: ranges.length,
        will_dump_count: willDumpCount,
        total_size: totalSize,
        chunk_size: CHUNK_SIZE,
        skip_system: SKIP_SYSTEM,
        skip_so: SKIP_SO,
        max_range_size: MAX_RANGE_SIZE,
        skip_large_anon_rw: SKIP_LARGE_ANON_RW,
        max_anon_rw_size: MAX_ANON_RW_SIZE,
        start_range_id: START_RANGE_ID,
        only_anon: ONLY_ANON,
        only_writable: ONLY_WRITABLE
    });

    let processedBytes = 0;
    let lastProgressTime = Date.now();

    for (let i = 0; i < ranges.length; i++) {
        dumpRange(i, ranges[i], function (rangeId, rangeOffset, rangeSize, chunkSize) {
            processedBytes += chunkSize;

            const now = Date.now();

            if (now - lastProgressTime >= 1000) {
                lastProgressTime = now;

                send({
                    type: "progress",
                    range_id: rangeId,
                    range_offset: rangeOffset,
                    range_size: rangeSize,
                    processed_bytes: processedBytes,
                    total_size: totalSize
                });
            }
        });
    }

    send({
        type: "done",
        range_count: ranges.length,
        will_dump_count: willDumpCount,
        total_size: totalSize,
        processed_bytes: processedBytes
    });

    console.log("========== Dump All Memory Done ==========");
}

// 避免 script.load 阶段直接重活
setTimeout(main, 1000);