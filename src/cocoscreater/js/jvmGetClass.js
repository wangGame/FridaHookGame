
'use strict';

const SKIP_PREFIX = [
    'androidx.',
    'com.google.',
    'sun.',
    'java.',
    'javax.',
    'kotlin.',
    'kotlinx.',
    'org.apache.',
    'org.json.',
    'org.xml.',
    '[Landroidx',
    '[Lcom',
    'org.cocos2dx.okhttp3.',
    '[Landroid.',
    'com.android.',
    'android.',
    'okhttp3.',
    'om.facebook.',
    'com.bugsnag.',
    'libcore.'
];

function shouldSkip(name) {
    if (!name) return true;

    for (let i = 0; i < SKIP_PREFIX.length; i++) {
        if (name.startsWith(SKIP_PREFIX[i])) {
            return true;
        }
    }

    return false;
}

function simpleClassName(fullName) {
    const idx = fullName.lastIndexOf('.');
    return idx >= 0 ? fullName.substring(idx + 1) : fullName;
}

function printClass(prefix, className, loader) {
    if (shouldSkip(className)) return;

    let loaderInfo = '';

    try {
        if (loader) {
            loaderInfo = ' | loader=' + loader.toString();
        }
    } catch (e) {}

    console.log(
        prefix +
        ' ' +
        className +
        ' | ' +
        simpleClassName(className) +
        loaderInfo
    );
}

function dumpCurrentLoadedClasses() {
    console.log('\n========== JVM LOADED CLASSES START ==========');

    const classes = Java.enumerateLoadedClassesSync().sort();

    let count = 0;

    classes.forEach(function (name) {
        if (shouldSkip(name)) return;

        count++;
        printClass('[LOADED]', name, null);
    });

    console.log('========== JVM LOADED CLASSES END ==========');
    console.log('[+] printed loaded classes = ' + count);
}

function hookClassLoaderLoadClass() {
    const ClassLoader = Java.use('java.lang.ClassLoader');

    const loadClass1 = ClassLoader.loadClass.overload('java.lang.String');

    loadClass1.implementation = function (name) {
        const ret = loadClass1.call(this, name);

        try {
            printClass('[LOAD_CLASS]', String(name), this);
        } catch (e) {}

        return ret;
    };

    const loadClass2 = ClassLoader.loadClass.overload(
        'java.lang.String',
        'boolean'
    );

    loadClass2.implementation = function (name, resolve) {
        const ret = loadClass2.call(this, name, resolve);

        try {
            printClass('[LOAD_CLASS]', String(name), this);
        } catch (e) {}

        return ret;
    };

    console.log('[+] hook java.lang.ClassLoader.loadClass success');
}

Java.perform(function () {
    dumpCurrentLoadedClasses();

    hookClassLoaderLoadClass();

    console.log('\n[+] JVM class monitor ready');
});