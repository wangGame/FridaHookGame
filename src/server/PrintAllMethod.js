
// Hook All method

Java.perform(function () {

    var clazz = Java.use("com.june.game.doudizhu.activities.game.StartActivity");

    var methods = clazz.class.getDeclaredMethods();

    methods.forEach(function (m) {
        console.log(m.toString());
    });

});
