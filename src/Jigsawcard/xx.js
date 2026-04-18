var addr = Module.findExportByName("libil2cpp.so", "TextAsset__get_bytes");

Interceptor.attach(addr, {
    onEnter: function(args) {
        console.log("TextAsset.get_bytes called");
    },
    onLeave: function(retval) {
        var bytes = retval;

        var len = Memory.readS32(bytes.add(0xC));
        var dataPtr = bytes.add(0x10);

        console.log("len: " + len);

        console.log(hexdump(dataPtr, { length: len, ansi: true }));
    }
});