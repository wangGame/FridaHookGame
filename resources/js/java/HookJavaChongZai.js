console.log("Script injected");
// 给系统一点时间（MuMu 必须）
setTimeout(function () {
    Java.perform(function () {
        console.log("Java READY");
        var Activity = Java.use("android.app.Activity");
        Activity.onCreate.overload("android.os.Bundle").implementation = function (bundle) {
            console.log("onCreate -> " + this.getClass().getName());
            return this.onCreate(bundle);
        };
        console.log("Hook Installed");
    });
}, 1500);
