console.log("===== GP6Service Loaded Modules =====");

// ① 当前已加载
Process.enumerateModules().forEach(function (m) {

    if (m.path.indexOf("/data/app/") !== -1) {
        console.log(
            "BASE:", m.base,
            "NAME:", m.name,
            "PATH:", m.path
        );
    }
});