setTimeout(function() {

    var modules = Process.enumerateModulesSync();

    modules.forEach(function(m) {

        if (m.name.indexOf("cocos") !== -1 ||
            m.name.indexOf("js") !== -1 ||
            m.name.indexOf("v8") !== -1) {

            send({ type: "log", data: "Found module: " + m.name });
        }
    });

}, 3000);