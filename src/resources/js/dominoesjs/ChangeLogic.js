/*
这部分没证据
*/
const logPtr = Module.findExportByName(
    "libcocos2dcpp.so",
//    "_ZN7cocos2d3logEPKcz" //log
"_ZN5Level16robotChangeLogicEi"
);

Interceptor.attach(logPtr, {
    onEnter(args) {
        let fmt;
        try {
            fmt = args[0].readCString();
        } catch (e) {
            return;
        }

        console.log("\n[cocos2d::log] fmt =", fmt);

        // 简单按顺序解析前几个参数（够你现在用）
        let argIndex = 1;
        const matches = fmt.match(/%[sdif]/g);

        if (!matches) return;

        for (let i = 0; i < matches.length; i++) {
            const spec = matches[i];
            const arg = args[argIndex++];

            try {
                if (spec === "%s") {
                    console.log(`  arg${i + 1} (str) =`, arg.readCString());
                } else if (spec === "%d" || spec === "%i") {
                    console.log(`  arg${i + 1} (int) =`, arg.toInt32());
                } else if (spec === "%f") {
                    console.log(`  arg${i + 1} (float) =`, arg.readFloat());
                } else {
                    console.log(`  arg${i + 1} (raw) =`, arg);
                }
            } catch (e) {
                console.log(`  arg${i + 1} read failed`);
            }
        }
    }
});
