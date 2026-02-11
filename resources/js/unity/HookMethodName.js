const UnitySendMessage = Module.findExportByName(
    "libunity.so",
    "UnitySendMessage"
);

Interceptor.attach(UnitySendMessage, {
    onEnter(args) {
        const obj = args[0].readCString();
        const method = args[1].readCString();
        const param = args[2].readCString();
        //加入
        if (
            method.includes("Click") ||
            method.includes("Press") ||
            method.includes("Down") ||
            method.includes("Up")
        ) {
            console.log("🖱 UnitySendMessage");
            console.log("  obj =", obj);
            console.log("  method =", method);
            console.log("  param =", param);
        }
    }
});