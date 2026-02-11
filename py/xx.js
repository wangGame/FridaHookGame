setImmediate(function () {

    Process.enumerateModules().forEach(function (m) {

        if (m.name.indexOf("cocos") !== -1) {

            Module.enumerateExportsSync(m.name).forEach(function (exp) {

                if (exp.name.startsWith("Java_")) {

                    Interceptor.attach(exp.address, {
                        onEnter(args) {
                            console.log("JNI CALL:", exp.name);
                        }
                    });
                }
            });
        }
    });
});
