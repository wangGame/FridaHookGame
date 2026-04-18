console.log("JS injected OK");
Java.perform(function () {
    console.log("Java ready");
    var Activity = Java.use("com.kw.gdx.utils.FileDecodeUtil");
    Activity.getBytes.implementation = function (hasFocus) {
//      发送消息去python
        send(this.getBytes(hasFocus))
        return this.getBytes(hasFocus);
    };
});