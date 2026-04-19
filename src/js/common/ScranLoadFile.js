var ranges = Process.enumerateRangesSync({
    protection: 'r--',
    coalesce: true
});

ranges.forEach(function(r){
    if (r.file && r.file.path.indexOf(".dat") >= 0) {
        console.log("Base:", r.base, "Size:", r.size, "File:", r.file.path);
    }
});
