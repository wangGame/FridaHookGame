//////////'use strict';
//////////
///////////**
////////// * 全链路埋点 hook：
////////// * 1. a5.b 全部核心方法
////////// * 2. a5.b$a AppsFlyerConversionListener 回调
////////// * 3. a5.b$c AppsFlyerInAppPurchaseValidatorListener 回调
////////// * 4. a5.b$d DeepLinkListener 回调
////////// * 5. AppsFlyerLib 关键方法
////////// * 6. WThinkingDataAdapter.eventTracking
////////// * 7. GlDataManager$HSData.hseventTracking
////////// * 8. b5.a 广告收入相关方法
////////// */
//////////
//////////const CONFIG = {
//////////    PRINT_STACK: true,
//////////
//////////    // 日志太多就改小一点
//////////    MAX_STRING_LEN: 3000,
//////////
//////////    // 只打印，不阻止原逻辑
//////////    BLOCK_APPSFLYER_LOGEVENT: false,
//////////    BLOCK_THINKINGDATA_EVENT: false,
//////////    BLOCK_HSDATA_EVENT: false
//////////};
//////////
//////////function now() {
//////////    return new Date().toISOString();
//////////}
//////////
//////////function cut(str) {
//////////    if (str === null || str === undefined) return String(str);
//////////    str = String(str);
//////////    if (str.length > CONFIG.MAX_STRING_LEN) {
//////////        return str.substring(0, CONFIG.MAX_STRING_LEN) + '...<cut>';
//////////    }
//////////    return str;
//////////}
//////////
//////////function printTitle(title) {
//////////    console.log('\n========== ' + title + ' ==========');
//////////    console.log('time = ' + now());
//////////}
//////////
//////////function printStack() {
//////////    if (!CONFIG.PRINT_STACK) return;
//////////
//////////    try {
//////////        const Log = Java.use('android.util.Log');
//////////        const Exception = Java.use('java.lang.Exception');
//////////        console.log('stack:\n' + Log.getStackTraceString(Exception.$new()));
//////////    } catch (e) {
//////////        console.log('[stack error] ' + e);
//////////    }
//////////}
//////////
//////////function isInstanceOf(obj, className) {
//////////    try {
//////////        if (obj === null || obj === undefined) return false;
//////////        const Cls = Java.use(className);
//////////        return Cls.class.isInstance(obj);
//////////    } catch (e) {
//////////        return false;
//////////    }
//////////}
//////////
//////////function dumpMap(obj) {
//////////    try {
//////////        if (obj === null || obj === undefined) return 'null';
//////////
//////////        const Map = Java.use('java.util.Map');
//////////        if (!Map.class.isInstance(obj)) {
//////////            return '[Not Map] ' + cut(obj.toString());
//////////        }
//////////
//////////        const map = Java.cast(obj, Map);
//////////        const iterator = map.entrySet().iterator();
//////////
//////////        const result = {};
//////////
//////////        while (iterator.hasNext()) {
//////////            const entry = iterator.next();
//////////            const key = entry.getKey();
//////////            const value = entry.getValue();
//////////
//////////            result[String(key)] = value === null ? null : String(value);
//////////        }
//////////
//////////        return JSON.stringify(result, null, 2);
//////////    } catch (e) {
//////////        return '[dumpMap error] ' + e;
//////////    }
//////////}
//////////
//////////function dumpJSONObject(obj) {
//////////    try {
//////////        if (obj === null || obj === undefined) return 'null';
//////////
//////////        const JSONObject = Java.use('org.json.JSONObject');
//////////        if (JSONObject.class.isInstance(obj)) {
//////////            const jo = Java.cast(obj, JSONObject);
//////////            try {
//////////                return jo.toString(2);
//////////            } catch (e) {
//////////                return jo.toString();
//////////            }
//////////        }
//////////
//////////        return '[Not JSONObject] ' + cut(obj.toString());
//////////    } catch (e) {
//////////        return '[dumpJSONObject error] ' + e;
//////////    }
//////////}
//////////
//////////function dumpArg(arg) {
//////////    try {
//////////        if (arg === null || arg === undefined) return 'null';
//////////
//////////        const t = typeof arg;
//////////        if (t === 'string' || t === 'number' || t === 'boolean') {
//////////            return String(arg);
//////////        }
//////////
//////////        let clsName = '';
//////////        try {
//////////            if (arg.getClass) {
//////////                clsName = String(arg.getClass().getName());
//////////            }
//////////        } catch (e) {}
//////////
//////////        if (clsName === 'java.util.HashMap' || isInstanceOf(arg, 'java.util.Map')) {
//////////            return '[Map ' + clsName + '] ' + dumpMap(arg);
//////////        }
//////////
//////////        if (clsName === 'org.json.JSONObject' || isInstanceOf(arg, 'org.json.JSONObject')) {
//////////            return '[JSONObject] ' + dumpJSONObject(arg);
//////////        }
//////////
//////////        if (clsName === 'org.json.JSONArray' || isInstanceOf(arg, 'org.json.JSONArray')) {
//////////            return '[JSONArray] ' + cut(arg.toString());
//////////        }
//////////
//////////        if (clsName === 'java.lang.String') {
//////////            return String(arg);
//////////        }
//////////
//////////        if (clsName.length > 0) {
//////////            return '[' + clsName + '] ' + cut(arg.toString());
//////////        }
//////////
//////////        return cut(String(arg));
//////////    } catch (e) {
//////////        return '[dumpArg error] ' + e;
//////////    }
//////////}
//////////
//////////function defaultValueForReturnType(returnTypeName) {
//////////    if (!returnTypeName || returnTypeName === 'void') return;
//////////
//////////    switch (returnTypeName) {
//////////        case 'boolean':
//////////            return false;
//////////        case 'byte':
//////////        case 'short':
//////////        case 'int':
//////////        case 'long':
//////////        case 'float':
//////////        case 'double':
//////////        case 'char':
//////////            return 0;
//////////        default:
//////////            return null;
//////////    }
//////////}
//////////
//////////function hookMethod(className, methodName, options) {
//////////    options = options || {};
//////////
//////////    try {
//////////        const Cls = Java.use(className);
//////////
//////////        if (!Cls[methodName]) {
//////////            console.log('[-] no method: ' + className + '.' + methodName);
//////////            return;
//////////        }
//////////
//////////        const overloads = Cls[methodName].overloads;
//////////
//////////        overloads.forEach(function (ov, index) {
//////////            const argTypes = ov.argumentTypes.map(function (t) {
//////////                return t.className || t.name;
//////////            }).join(', ');
//////////
//////////            const retType = ov.returnType.className || ov.returnType.name || String(ov.returnType);
//////////
//////////            console.log('[+] hook ' + className + '.' + methodName + '(' + argTypes + ') => ' + retType);
//////////
//////////            ov.implementation = function () {
//////////                const args = Array.prototype.slice.call(arguments);
//////////
//////////                printTitle(className + '.' + methodName);
//////////                console.log('signature = ' + methodName + '(' + argTypes + ')');
//////////                console.log('returnType = ' + retType);
//////////
//////////                for (let i = 0; i < args.length; i++) {
//////////                    console.log('arg[' + i + '] = ' + dumpArg(args[i]));
//////////                }
//////////
//////////                if (options.stack === true) {
//////////                    printStack();
//////////                }
//////////
//////////                if (options.block === true) {
//////////                    console.log('[BLOCKED] original method not called');
//////////                    return defaultValueForReturnType(retType);
//////////                }
//////////
//////////                let ret;
//////////                try {
//////////                    ret = ov.call(this, ...args);
//////////                } catch (e) {
//////////                    console.log('[CALL ORIGINAL ERROR] ' + e);
//////////                    throw e;
//////////                }
//////////
//////////                if (retType !== 'void') {
//////////                    console.log('return = ' + dumpArg(ret));
//////////                }
//////////
//////////                return ret;
//////////            };
//////////        });
//////////    } catch (e) {
//////////        console.log('[-] hook failed: ' + className + '.' + methodName + ' => ' + e);
//////////    }
//////////}
//////////
//////////function hookConstructors(className) {
//////////    try {
//////////        const Cls = Java.use(className);
//////////
//////////        Cls.$init.overloads.forEach(function (ov) {
//////////            const argTypes = ov.argumentTypes.map(function (t) {
//////////                return t.className || t.name;
//////////            }).join(', ');
//////////
//////////            console.log('[+] hook constructor ' + className + '(' + argTypes + ')');
//////////
//////////            ov.implementation = function () {
//////////                const args = Array.prototype.slice.call(arguments);
//////////
//////////                printTitle('new ' + className);
//////////                console.log('constructor = ' + className + '(' + argTypes + ')');
//////////
//////////                for (let i = 0; i < args.length; i++) {
//////////                    console.log('arg[' + i + '] = ' + dumpArg(args[i]));
//////////                }
//////////
//////////                return ov.call(this, ...args);
//////////            };
//////////        });
//////////    } catch (e) {
//////////        console.log('[-] hook constructor failed: ' + className + ' => ' + e);
//////////    }
//////////}
//////////
//////////function hookA5B() {
//////////    const cls = 'a5.b';
//////////
//////////    hookConstructors(cls);
//////////
//////////    [
//////////        'adRevenue',
//////////        'clearSuperProperties',
//////////        'eventTracking',
//////////        'getPlatformName',
//////////        'getPlatformVersion',
//////////        'i',
//////////        'initSDK',
//////////        'k',
//////////        'l',
//////////        'm',
//////////        'n',
//////////        'setSuperProperties',
//////////        'unsetSuperProperty',
//////////
//////////        // static / synthetic
//////////        'j',
//////////        'b',
//////////        'f',
//////////        'h'
//////////    ].forEach(function (m) {
//////////        const needStack = [
//////////            'eventTracking',
//////////            'adRevenue',
//////////            'k',
//////////            'l',
//////////            'm',
//////////            'n'
//////////        ].indexOf(m) >= 0;
//////////
//////////        hookMethod(cls, m, {
//////////            stack: needStack
//////////        });
//////////    });
//////////}
//////////
//////////function hookInnerCallbacks() {
//////////    // a5.b$a implements AppsFlyerConversionListener
//////////    [
//////////        'onAppOpenAttribution',
//////////        'onAttributionFailure',
//////////        'onConversionDataFail',
//////////        'onConversionDataSuccess'
//////////    ].forEach(function (m) {
//////////        hookMethod('a5.b$a', m, {
//////////            stack: true
//////////        });
//////////    });
//////////
//////////    // a5.b$b implements Runnable
//////////    hookMethod('a5.b$b', 'run', {
//////////        stack: true
//////////    });
//////////
//////////    // a5.b$c implements AppsFlyerInAppPurchaseValidatorListener
//////////    [
//////////        'onValidateInApp',
//////////        'onValidateInAppFailure'
//////////    ].forEach(function (m) {
//////////        hookMethod('a5.b$c', m, {
//////////            stack: true
//////////        });
//////////    });
//////////
//////////    // a5.b$d implements DeepLinkListener
//////////    hookMethod('a5.b$d', 'onDeepLinking', {
//////////        stack: true
//////////    });
//////////}
//////////
//////////function hookAppsFlyer() {
//////////    const cls = 'com.appsflyer.AppsFlyerLib';
//////////
//////////    hookMethod(cls, 'getInstance');
//////////    hookMethod(cls, 'init', { stack: true });
//////////    hookMethod(cls, 'start', { stack: true });
//////////    hookMethod(cls, 'logEvent', {
//////////        stack: true,
//////////        block: CONFIG.BLOCK_APPSFLYER_LOGEVENT
//////////    });
//////////
//////////    hookMethod(cls, 'setCustomerUserId', { stack: true });
//////////    hookMethod(cls, 'setAdditionalData', { stack: true });
//////////    hookMethod(cls, 'setDebugLog');
//////////    hookMethod(cls, 'enableTCFDataCollection');
//////////    hookMethod(cls, 'registerValidatorListener', { stack: true });
//////////    hookMethod(cls, 'subscribeForDeepLink', { stack: true });
//////////    hookMethod(cls, 'getAppsFlyerUID');
//////////    hookMethod(cls, 'getSdkVersion');
//////////}
//////////
//////////function hookThinkingData() {
//////////    const cls = 'com.block.juggle.datareport.thinkingdata.WThinkingDataAdapter';
//////////
//////////    hookMethod(cls, 'getInstance', { stack: true });
//////////    hookMethod(cls, 'eventTracking', {
//////////        stack: true,
//////////        block: CONFIG.BLOCK_THINKINGDATA_EVENT
//////////    });
//////////}
//////////
//////////function hookHSData() {
//////////    const cls = 'com.block.juggle.datareport.core.api.GlDataManager$HSData';
//////////
//////////    hookConstructors(cls);
//////////
//////////    hookMethod(cls, 'hseventTracking', {
//////////        stack: true,
//////////        block: CONFIG.BLOCK_HSDATA_EVENT
//////////    });
//////////}
//////////
//////////function hookAdRevenueMediation() {
//////////    // 你代码里有：b5.a.b().c(context); 以及 b5.a.b().d(map, str, d10);
//////////    const cls = 'b5.a';
//////////
//////////    [
//////////        'b',
//////////        'c',
//////////        'd'
//////////    ].forEach(function (m) {
//////////        hookMethod(cls, m, {
//////////            stack: true
//////////        });
//////////    });
//////////}
//////////
//////////function main() {
//////////    console.log('========== ALL TRACKING HOOK START ==========');
//////////
//////////    hookA5B();
//////////    hookInnerCallbacks();
//////////    hookAppsFlyer();
//////////    hookThinkingData();
//////////    hookHSData();
//////////    hookAdRevenueMediation();
//////////
//////////    console.log('========== ALL TRACKING HOOK READY ==========');
//////////}
//////////
//////////Java.perform(function () {
//////////    setTimeout(main, 1000);
//////////});
//////////
////////
////////'use strict';
////////
////////function getAppContext() {
////////    try {
////////        const ActivityThread = Java.use('android.app.ActivityThread');
////////        const app = ActivityThread.currentApplication();
////////        if (app) return app.getApplicationContext();
////////    } catch (e) {}
////////
////////    try {
////////        const ActivityThread = Java.use('android.app.ActivityThread');
////////        const at = ActivityThread.currentActivityThread();
////////        const app = at.getApplication();
////////        if (app) return app.getApplicationContext();
////////    } catch (e) {}
////////
////////    return null;
////////}
////////
////////function simpleClassName(fullName) {
////////    if (!fullName) return '';
////////    const idx = fullName.lastIndexOf('.');
////////    return idx >= 0 ? fullName.substring(idx + 1) : fullName;
////////}
////////
////////function dumpDexClasses() {
////////    const ctx = getAppContext();
////////
////////    if (ctx === null) {
////////        console.log('[-] context is null, retry later...');
////////        setTimeout(dumpDexClasses, 1000);
////////        return;
////////    }
////////
////////    const DexFile = Java.use('dalvik.system.DexFile');
////////    const FileWriter = Java.use('java.io.FileWriter');
////////    const BufferedWriter = Java.use('java.io.BufferedWriter');
////////
////////    const packageName = String(ctx.getPackageName());
////////    const appInfo = ctx.getApplicationInfo();
////////
////////    const apkPaths = [];
////////
////////    try {
////////        const sourceDir = String(appInfo.sourceDir.value);
////////        apkPaths.push(sourceDir);
////////    } catch (e) {
////////        console.log('[-] get sourceDir failed: ' + e);
////////    }
////////
////////    try {
////////        const splitSourceDirs = appInfo.splitSourceDirs.value;
////////        if (splitSourceDirs !== null) {
////////            for (let i = 0; i < splitSourceDirs.length; i++) {
////////                apkPaths.push(String(splitSourceDirs[i]));
////////            }
////////        }
////////    } catch (e) {
////////        console.log('[-] get splitSourceDirs failed: ' + e);
////////    }
////////
////////    console.log('[+] packageName = ' + packageName);
////////    console.log('[+] apkPaths:');
////////    apkPaths.forEach(p => console.log('    ' + p));
////////
////////    const classSet = {};
////////    let total = 0;
////////
////////    apkPaths.forEach(function (apkPath) {
////////        try {
////////            console.log('[*] reading dex from: ' + apkPath);
////////
////////            const dexFile = DexFile.$new(apkPath);
////////            const entries = dexFile.entries();
////////
////////            while (entries.hasMoreElements()) {
////////                const className = String(entries.nextElement());
////////
////////                if (!classSet[className]) {
////////                    classSet[className] = true;
////////                    total++;
////////                }
////////            }
////////
////////            try {
////////                dexFile.close();
////////            } catch (e) {}
////////
////////        } catch (e) {
////////            console.log('[-] read dex failed: ' + apkPath + ' => ' + e);
////////        }
////////    });
////////
////////    const classes = Object.keys(classSet).sort();
////////
////////    let outDir = null;
////////
////////    try {
////////        outDir = ctx.getExternalFilesDir(null);
////////    } catch (e) {}
////////
////////    if (outDir === null) {
////////        outDir = ctx.getFilesDir();
////////    }
////////
////////    const outPath = String(outDir.getAbsolutePath()) + '/all_classes_' + packageName + '.txt';
////////
////////    try {
////////        const writer = BufferedWriter.$new(FileWriter.$new(outPath, false));
////////
////////        writer.write('package=' + packageName);
////////        writer.newLine();
////////        writer.write('total=' + classes.length);
////////        writer.newLine();
////////        writer.write('format=fullClassName | simpleClassName');
////////        writer.newLine();
////////        writer.write('--------------------------------------------------');
////////        writer.newLine();
////////
////////        classes.forEach(function (name) {
////////            writer.write(name + ' | ' + simpleClassName(name));
////////            writer.newLine();
////////        });
////////
////////        writer.flush();
////////        writer.close();
////////
////////        console.log('[+] dump finished');
////////        console.log('[+] total classes = ' + classes.length);
////////        console.log('[+] output = ' + outPath);
////////
////////    } catch (e) {
////////        console.log('[-] write file failed: ' + e);
////////    }
////////}
////////
////////Java.perform(function () {
////////    setTimeout(dumpDexClasses, 1000);
////////});
//////
//////'use strict';
//////
//////function getAppContext() {
//////    try {
//////        const ActivityThread = Java.use('android.app.ActivityThread');
//////        const app = ActivityThread.currentApplication();
//////        if (app) return app.getApplicationContext();
//////    } catch (e) {}
//////
//////    try {
//////        const ActivityThread = Java.use('android.app.ActivityThread');
//////        const at = ActivityThread.currentActivityThread();
//////        const app = at.getApplication();
//////        if (app) return app.getApplicationContext();
//////    } catch (e) {}
//////
//////    return null;
//////}
//////
//////function simpleClassName(fullName) {
//////    if (!fullName) return '';
//////    const idx = fullName.lastIndexOf('.');
//////    return idx >= 0 ? fullName.substring(idx + 1) : fullName;
//////}
//////
//////function dumpDexClassesToConsole() {
//////    const ctx = getAppContext();
//////
//////    if (ctx === null) {
//////        console.log('[-] context is null, retry later...');
//////        setTimeout(dumpDexClassesToConsole, 1000);
//////        return;
//////    }
//////
//////    const DexFile = Java.use('dalvik.system.DexFile');
//////
//////    const packageName = String(ctx.getPackageName());
//////    const appInfo = ctx.getApplicationInfo();
//////
//////    const apkPaths = [];
//////
//////    try {
//////        apkPaths.push(String(appInfo.sourceDir.value));
//////    } catch (e) {
//////        console.log('[-] get sourceDir failed: ' + e);
//////    }
//////
//////    try {
//////        const splitSourceDirs = appInfo.splitSourceDirs.value;
//////        if (splitSourceDirs !== null) {
//////            for (let i = 0; i < splitSourceDirs.length; i++) {
//////                apkPaths.push(String(splitSourceDirs[i]));
//////            }
//////        }
//////    } catch (e) {
//////        console.log('[-] get splitSourceDirs failed: ' + e);
//////    }
//////
//////    console.log('\n========== APK CLASS DUMP START ==========');
//////    console.log('[+] packageName = ' + packageName);
//////    console.log('[+] apkPaths = ');
//////    apkPaths.forEach(p => console.log('    ' + p));
//////
//////    const classSet = {};
//////    let total = 0;
//////
//////    apkPaths.forEach(function (apkPath) {
//////        try {
//////            console.log('\n[*] reading dex from: ' + apkPath);
//////
//////            const dexFile = DexFile.$new(apkPath);
//////            const entries = dexFile.entries();
//////
//////            while (entries.hasMoreElements()) {
//////                const className = String(entries.nextElement());
//////
//////                if (!classSet[className]) {
//////                    classSet[className] = true;
//////                    total++;
//////
//////                    console.log('[CLASS] ' + className + ' | ' + simpleClassName(className));
//////                }
//////            }
//////
//////            try {
//////                dexFile.close();
//////            } catch (e) {}
//////
//////        } catch (e) {
//////            console.log('[-] read dex failed: ' + apkPath + ' => ' + e);
//////        }
//////    });
//////
//////    console.log('\n========== APK CLASS DUMP END ==========');
//////    console.log('[+] total classes = ' + total);
//////}
//////
//////Java.perform(function () {
//////    setTimeout(dumpDexClassesToConsole, 1000);
//////});
////
////'use strict';
////
////function getAppContext() {
////    try {
////        const ActivityThread = Java.use('android.app.ActivityThread');
////        const app = ActivityThread.currentApplication();
////        if (app) return app.getApplicationContext();
////    } catch (e) {}
////
////    try {
////        const ActivityThread = Java.use('android.app.ActivityThread');
////        const at = ActivityThread.currentActivityThread();
////        const app = at.getApplication();
////        if (app) return app.getApplicationContext();
////    } catch (e) {}
////
////    return null;
////}
////
////function simpleClassName(fullName) {
////    if (!fullName) return '';
////    const idx = fullName.lastIndexOf('.');
////    return idx >= 0 ? fullName.substring(idx + 1) : fullName;
////}
////
////function shouldSkipClass(className) {
////    return (
////        className.startsWith('androidx.')
////        ||
////        className.startsWith('com.google.')||
////        className.startsWith('com.facebook.')||
////        className.startsWith('com.bytedance.')||
////        className.startsWith('android.')||
////    );
////}
////
////function dumpDexClassesToConsole() {
////    const ctx = getAppContext();
////
////    if (ctx === null) {
////        console.log('[-] context is null, retry later...');
////        setTimeout(dumpDexClassesToConsole, 1000);
////        return;
////    }
////
////    const DexFile = Java.use('dalvik.system.DexFile');
////
////    const packageName = String(ctx.getPackageName());
////    const appInfo = ctx.getApplicationInfo();
////
////    const apkPaths = [];
////
////    try {
////        apkPaths.push(String(appInfo.sourceDir.value));
////    } catch (e) {
////        console.log('[-] get sourceDir failed: ' + e);
////    }
////
////    try {
////        const splitSourceDirs = appInfo.splitSourceDirs.value;
////        if (splitSourceDirs !== null) {
////            for (let i = 0; i < splitSourceDirs.length; i++) {
////                apkPaths.push(String(splitSourceDirs[i]));
////            }
////        }
////    } catch (e) {
////        console.log('[-] get splitSourceDirs failed: ' + e);
////    }
////
////    console.log('\n========== APK CLASS DUMP START ==========');
////    console.log('[+] packageName = ' + packageName);
////    console.log('[+] skip prefix = androidx.');
////    console.log('[+] apkPaths = ');
////    apkPaths.forEach(p => console.log('    ' + p));
////
////    const classSet = {};
////    let total = 0;
////    let skipped = 0;
////
////    apkPaths.forEach(function (apkPath) {
////        try {
////            console.log('\n[*] reading dex from: ' + apkPath);
////
////            const dexFile = DexFile.$new(apkPath);
////            const entries = dexFile.entries();
////
////            while (entries.hasMoreElements()) {
////                const className = String(entries.nextElement());
////
////                if (shouldSkipClass(className)) {
////                    skipped++;
////                    continue;
////                }
////
////                if (!classSet[className]) {
////                    classSet[className] = true;
////                    total++;
////
////                    console.log('[CLASS] ' + className + ' | ' + simpleClassName(className));
////                }
////            }
////
////            try {
////                dexFile.close();
////            } catch (e) {}
////
////        } catch (e) {
////            console.log('[-] read dex failed: ' + apkPath + ' => ' + e);
////        }
////    });
////
////    console.log('\n========== APK CLASS DUMP END ==========');
////    console.log('[+] printed classes = ' + total);
////    console.log('[+] skipped androidx classes = ' + skipped);
////}
////
////Java.perform(function () {
////    setTimeout(dumpDexClassesToConsole, 1000);
////});
//
//'use strict';
//
//Java.perform(function () {
//    const target = "ld.j1";
//
//    const Cls = Java.use(target);
//    const klass = Cls.class;
//
//    console.log("\n========== CLASS INFO ==========");
//    console.log("class = " + klass.getName());
//
//    try {
//        console.log("super = " + klass.getSuperclass().getName());
//    } catch (e) {}
//
//    console.log("\n========== INTERFACES ==========");
//    try {
//        const interfaces = klass.getInterfaces();
//        for (let i = 0; i < interfaces.length; i++) {
//            console.log(interfaces[i].getName());
//        }
//    } catch (e) {}
//
//    console.log("\n========== FIELDS ==========");
//    try {
//        const fields = klass.getDeclaredFields();
//        for (let i = 0; i < fields.length; i++) {
//            console.log(fields[i].toString());
//        }
//    } catch (e) {}
//
//    console.log("\n========== METHODS ==========");
//    try {
//        const methods = klass.getDeclaredMethods();
//        for (let i = 0; i < methods.length; i++) {
//            console.log(methods[i].toString());
//        }
//    } catch (e) {}
//
//    console.log("\n========== CONSTRUCTORS ==========");
//    try {
//        const constructors = klass.getDeclaredConstructors();
//        for (let i = 0; i < constructors.length; i++) {
//            console.log(constructors[i].toString());
//        }
//    } catch (e) {}
//
//    console.log("\n========== ANNOTATIONS ==========");
//    try {
//        const annotations = klass.getDeclaredAnnotations();
//        for (let i = 0; i < annotations.length; i++) {
//            console.log(annotations[i].toString());
//        }
//    } catch (e) {}
//});


'use strict';

function getAppContext() {
    try {
        const ActivityThread = Java.use('android.app.ActivityThread');
        const app = ActivityThread.currentApplication();
        if (app) return app.getApplicationContext();
    } catch (e) {}

    try {
        const ActivityThread = Java.use('android.app.ActivityThread');
        const at = ActivityThread.currentActivityThread();
        const app = at.getApplication();
        if (app) return app.getApplicationContext();
    } catch (e) {}

    return null;
}

function mkdirs(path) {
    try {
        const File = Java.use('java.io.File');
        const f = File.$new(path);
        if (!f.exists()) {
            f.mkdirs();
        }
    } catch (e) {
        console.log('[-] mkdir failed: ' + e);
    }
}

function dumpDexFromMemory(outDir) {
    console.log('\n========== RUNTIME DEX DUMP START ==========');
    console.log('[+] outDir = ' + outDir);

    const ranges = Process.enumerateRanges({
        protection: 'r--',
        coalesce: true
    });

    const dumped = {};
    let index = 0;

    ranges.forEach(function (range) {
        try {
            if (range.size < 0x70) return;

            // dex\n035 / dex\n036 / dex\n037 / dex\n038 / dex\n039
            const hits = Memory.scanSync(
                range.base,
                range.size,
                '64 65 78 0a 30 33'
            );

            hits.forEach(function (hit) {
                try {
                    const addr = hit.address;

                    const magic = addr.readCString(8);
                    if (magic.indexOf('dex\n') !== 0) return;

                    // dex header offset 0x20 = file_size, little endian
                    const fileSize = addr.add(0x20).readU32();

                    if (fileSize <= 0x70) return;
                    if (fileSize > 200 * 1024 * 1024) return;

                    const key = addr.toString() + '_' + fileSize;
                    if (dumped[key]) return;
                    dumped[key] = true;

                    const outPath = outDir + '/dump_' + index + '_' + fileSize + '.dex';

                    console.log('[DEX] index=' + index);
                    console.log('      addr=' + addr);
                    console.log('      size=' + fileSize);
                    console.log('      magic=' + JSON.stringify(magic));
                    console.log('      path=' + outPath);

                    const bytes = Memory.readByteArray(addr, fileSize);

                    const f = new File(outPath, 'wb');
                    f.write(bytes);
                    f.flush();
                    f.close();

                    index++;

                } catch (e) {
                    console.log('[-] dump hit failed: ' + e);
                }
            });
        } catch (e) {}
    });

    console.log('========== RUNTIME DEX DUMP END ==========');
    console.log('[+] dumped dex count = ' + index);
}

Java.perform(function () {
    const ctx = getAppContext();

    if (!ctx) {
        console.log('[-] context null');
        return;
    }

    let outDir = null;

    try {
        outDir = String(ctx.getExternalFilesDir(null).getAbsolutePath()) + '/frida_dex_dump';
    } catch (e) {
        outDir = '/sdcard/frida_dex_dump';
    }

    mkdirs(outDir);

    setTimeout(function () {
        dumpDexFromMemory(outDir);
    }, 3000);
});