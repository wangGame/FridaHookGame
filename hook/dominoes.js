Java.perform(function() {
    var log_print = Module.findExportByName(null, "__android_log_print");
    if (log_print) {
        Interceptor.attach(log_print, {
            onEnter: function(args) {
                // args[0] = log priority, args[1] = tag, args[2] = fmt
                var priority = args[0].toInt32();
                var tag = args[1].readCString();
                var msg = args[2].readCString();
                console.log("[cocos.log] [" + tag + "] " + msg);
            }
        });
    } else {
        console.log("没有找到 __android_log_print");
    }
});