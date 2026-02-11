Java.perform(function () {
    var modules = Process.enumerateModules();
    console.log("Loaded modules count:", modules.length);

    modules.forEach(function (m) {
        console.log(
            m.name +
            " | base=" + m.base +
            " | size=" + m.size +
            " | path=" + m.path
        );
    });
});
