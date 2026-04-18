console.log("JS injected OK");
Java.perform(function () {
    console.log("Java ready");
    var Activity = Java.use("android.app.Activity");
    Activity.onWindowFocusChanged.implementation = function (hasFocus) {
        console.log(
            "Focus change:",
            this.getClass().getName(),
            "hasFocus=" + hasFocus
        );
//      发送消息去python
        send("x")
        return this.onWindowFocusChanged(hasFocus);
    };
});