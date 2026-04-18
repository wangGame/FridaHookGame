Process.enumerateRanges({
    protection: 'r--',
    coalesce: true
}).forEach(function(range) {
    Memory.scan(range.base, range.size, "63 63 2e 5f 52 46", { // cc._RF
        onMatch: function(address, size) {
            var str = Memory.readUtf8String(address);
            if (str && str.length > 1000) {
                console.log("===== REAL GAME JS =====");
                console.log(str.substring(0,1000));
            }
        }
    });
});