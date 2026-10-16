
'use strict';

Java.perform(function () {
    const target = 'org.cocos2dx.javascript.AppActivity';

    console.log('\n========== DUMP METHODS START ==========');
    console.log('class = ' + target);

    try {
        const Cls = Java.use(target);
        const klass = Cls.class;

        console.log('\n----- Declared Methods 当前类自己声明的方法 -----');

        const declaredMethods = klass.getDeclaredMethods();
        for (let i = 0; i < declaredMethods.length; i++) {
            const m = declaredMethods[i];

            console.log('[DECLARED] ' + m.toString());

            try {
                console.log('    name = ' + m.getName());
            } catch (e) {}

            try {
                console.log('    return = ' + m.getReturnType().getName());
            } catch (e) {}

            try {
                const params = m.getParameterTypes();
                let arr = [];
                for (let j = 0; j < params.length; j++) {
                    arr.push(params[j].getName());
                }
                console.log('    params = (' + arr.join(', ') + ')');
            } catch (e) {}
        }

        console.log('\n----- Public Methods 包含父类继承的 public 方法 -----');

        const publicMethods = klass.getMethods();
        for (let i = 0; i < publicMethods.length; i++) {
            const m = publicMethods[i];

            console.log('[PUBLIC] ' + m.toString());

            try {
                console.log('    name = ' + m.getName());
            } catch (e) {}
        }

        console.log('\n========== DUMP METHODS END ==========');
        console.log('[+] declared method count = ' + declaredMethods.length);
        console.log('[+] public method count = ' + publicMethods.length);

    } catch (e) {
        console.log('[-] failed: ' + e);
    }
});