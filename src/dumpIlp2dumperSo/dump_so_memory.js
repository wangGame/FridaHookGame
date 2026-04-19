rpc.exports = {
    dumpso() {
        const mod = Process.findModuleByName("libil2cpp.so");
        if (!mod) return { ok: false };

        const base = mod.base;
        const size = mod.size;
        const chunk = 0x10000;

        send({ type: "info", base: base.toString(), size });

        for (let off = 0; off < size; off += chunk) {
            const len = Math.min(chunk, size - off);
            const ptr = base.add(off);

            const buf = Memory.readByteArray(ptr, len);

            // ✅ 正确：第二个参数传 binary
            send({
                type: "chunk",
                offset: off,
                size: len
            }, buf);
        }

        send({ type: "done" });

        return { ok: true };
    }
};