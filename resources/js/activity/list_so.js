function readMaps() {
    var file = new File("/proc/self/maps", "r");
    var content = file.readAll();
    file.close();
    return content;
}

console.log(readMaps());
