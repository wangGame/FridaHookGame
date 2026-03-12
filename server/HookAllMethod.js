Java.perform(function () {

    var className = "com.june.game.doudizhu.activities.game.StartActiviy";
    var clazz = Java.use(className);

    var methods = clazz.class.getDeclaredMethods();

    var methodNames = [];

    methods.forEach(function (m) {

        var name = m.getName();

        if (methodNames.indexOf(name) === -1) {
            methodNames.push(name);
        }

    });

    methodNames.forEach(function (methodName) {

        var overloads = clazz[methodName].overloads;

        overloads.forEach(function (overload) {

            overload.implementation = function () {

                console.log("======== Hook ========");
                console.log("Class:", className);
                console.log("Method:", methodName);

                for (var i = 0; i < arguments.length; i++) {
                    console.log("arg[" + i + "] =", arguments[i]);
                }

                var result = overload.apply(this, arguments);

                console.log("return =", result);
                console.log("======================");

                return result;
            };

        });

    });

});
