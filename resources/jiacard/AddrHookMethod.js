
'use strict';

(function () {

    const methodPtr = ptr("0x6f7870f0");   // 你打印出来的 MethodInfo*

    // MethodInfo 结构：
    // +0x00 methodPointer
    const realFunc = methodPtr.readPointer();

    console.log("🎯 StageEntity::.ctor real address =", realFunc);

    Interceptor.attach(realFunc, {
        onEnter(args) {

            // args[0] = this 指针
            const thiz = args[0];

            console.log("🚀 StageEntity::.ctor called");
            console.log("   this =", thiz);

            // 如果你想读字段，可以在这里继续扩展
        },

        onLeave(retval) {
            console.log("✅ StageEntity::.ctor finished");
        }
    });

})();