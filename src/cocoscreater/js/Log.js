'use strict';

const ONLY_COCOS = false;
// 如果日志太多，改成 true，只打印 cocos/js 相关 tag

const TAG_FILTERS = [
    'cocos',
    'cocos2d',
    'Cocos2dx',
    'jsb',
    'jswrapper',
    'JavaScript',
    'console',
    'main'
];

function safeReadCString(p) {
    try {
        if (!p || p.isNull()) return '';
        return p.readCString() || '';
    } catch (e) {
        return '<read error>';
    }
}

function shouldPrint(tag, msg) {
    if (!ONLY_COCOS) return true;

    const text = ((tag || '') + ' ' + (msg || '')).toLowerCase();
    return TAG_FILTERS.some(k => text.indexOf(k.toLowerCase()) >= 0);
}

function prioName(p) {
    const map = {
        2: 'V',
        3: 'D',
        4: 'I',
        5: 'W',
        6: 'E',
        7: 'F'
    };
    return map[p] || String(p);
}

function printLog(source, prio, tag, msg) {
    if (!shouldPrint(tag, msg)) return;

    console.log(
        `[${source}] [${prioName(prio)}] [${tag}] ${msg}`
    );
}

function hookNativeLog() {
    const funcs = [
        '__android_log_write',
        '__android_log_print',
        '__android_log_buf_write'
    ];

    funcs.forEach(name => {
        const addr = Module.findExportByName('liblog.so', name);
        if (!addr) {
            console.log(`[-] ${name} not found`);
            return;
        }

        console.log(`[+] hook ${name} => ${addr}`);

        Interceptor.attach(addr, {
            onEnter(args) {
                try {
                    if (name === '__android_log_write') {
                        // int __android_log_write(int prio, const char* tag, const char* text)
                        const prio = args[0].toInt32();
                        const tag = safeReadCString(args[1]);
                        const text = safeReadCString(args[2]);

                        printLog('native-write', prio, tag, text);
                    }
                    else if (name === '__android_log_print') {
                        // int __android_log_print(int prio, const char* tag, const char* fmt, ...)
                        // 注意：这里抓到的是 format 字符串，不一定是最终格式化后的完整文本
                        const prio = args[0].toInt32();
                        const tag = safeReadCString(args[1]);
                        const fmt = safeReadCString(args[2]);

                        printLog('native-print', prio, tag, fmt);
                    }
                    else if (name === '__android_log_buf_write') {
                        // int __android_log_buf_write(int bufID, int prio, const char* tag, const char* text)
                        const prio = args[1].toInt32();
                        const tag = safeReadCString(args[2]);
                        const text = safeReadCString(args[3]);

                        printLog('native-buf', prio, tag, text);
                    }
                } catch (e) {
                    console.log(`[!] ${name} error: ${e}`);
                }
            }
        });
    });
}

function hookJavaLog() {
    if (!Java.available) {
        console.log('[-] Java not available');
        return;
    }

    Java.perform(function () {
        const Log = Java.use('android.util.Log');

        function hookLogMethod(methodName) {
            try {
                const overload1 = Log[methodName].overload(
                    'java.lang.String',
                    'java.lang.String'
                );

                overload1.implementation = function (tag, msg) {
                    printLog(
                        'java-' + methodName,
                        3,
                        String(tag),
                        String(msg)
                    );

                    return overload1.call(this, tag, msg);
                };
            } catch (e) {}

            try {
                const overload2 = Log[methodName].overload(
                    'java.lang.String',
                    'java.lang.String',
                    'java.lang.Throwable'
                );

                overload2.implementation = function (tag, msg, tr) {
                    printLog(
                        'java-' + methodName,
                        3,
                        String(tag),
                        String(msg) + '\n' + tr
                    );

                    return overload2.call(this, tag, msg, tr);
                };
            } catch (e) {}
        }

        ['v', 'd', 'i', 'w', 'e'].forEach(hookLogMethod);

        try {
            const println = Log.println.overload(
                'int',
                'java.lang.String',
                'java.lang.String'
            );

            println.implementation = function (priority, tag, msg) {
                printLog(
                    'java-println',
                    priority,
                    String(tag),
                    String(msg)
                );

                return println.call(this, priority, tag, msg);
            };

            console.log('[+] hook android.util.Log.println');
        } catch (e) {
            console.log('[-] hook println failed: ' + e);
        }

        console.log('[+] Java Log hook done');
    });
}

setImmediate(function () {
    console.log('========== COCOS LOG HOOK START ==========');

    hookNativeLog();
    hookJavaLog();

    console.log('========== COCOS LOG HOOK READY ==========');
});