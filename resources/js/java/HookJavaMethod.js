setImmediate(function () {
    Java.perform(function () {
        var Activity = Java.use("android.app.Activity");
        Activity.onResume.implementation = function () {
            console.log("==== FOREGROUND ====");
            console.log("Package:", this.getPackageName());
            console.log("Activity:", this.getClass().getName());
            return this.onResume();
        };
        console.log("[+] Hook installed");
    });
});
