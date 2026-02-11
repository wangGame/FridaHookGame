

rpc.exports = {

    dumpmaps: function () {

        var result = [];

        Process.enumerateModules().forEach(function(m) {

            if (m.name.indexOf(".so") !== -1) {
                result.push(m.name + " => " + m.path);
            }

        });

        return result.join("\n");
    }
};


//rpc.exports = {
//    dumpmaps: function () {
//
//        Interceptor.attach(Module.findExportByName("libc.so", "open"), {
//            onEnter: function(args) {
//                console.log("open called: " + Memory.readUtf8String(args[0]));
//            }
//        });
//
////        Process.enumerateModules().forEach(function (m) {
////
////            console.log(m.name+"    "+ m.path)
//////            if (m.name.endsWith(".so")) {
//////                    console.log(
//////                        "[*] " +
//////                        m.name +
//////                        " | base: " + m.base +
//////                        " | size: " + m.size +
//////                        " | path: " + m.path
//////                    );
//////                }
////            });
//     }
//};
