Interceptor.attach(
    Module.fin
    Module.findExportByName(
        "libil2cpp.so",
        "0xb95ae644"
    ),
    {
        onEnter(args) {
            console.log('🖱 UnitySendMessage');
            console.log('obj =', args[0].readCString());
            console.log('method =', args[1].readCString());
        },    onLeave(retval) {
        console.log('💥 Force IsValid = true');
        retval.replace(1); // bool true
    }
    }
);





